''' API endpoints for managing projects '''

import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from ..db.session import get_db
from .. import crud, schemas, models_db
from .auth import get_current_admin

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/", response_model=List[schemas.ProjectRead])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_projects(db, skip=skip, limit=limit)

@router.get("/{project_id}", response_model=schemas.ProjectRead)
def read_project(project_id: int, db: Session = Depends(get_db)):
    p = crud.get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return p

@router.post("/", response_model=schemas.ProjectRead)
def create_project(project_in: schemas.ProjectCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    return crud.create_project(db, project_in)

@router.put("/{project_id}", response_model=schemas.ProjectRead)
def update_project(project_id: int, project_in: schemas.ProjectCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    p = crud.get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return crud.update_project(db, p, project_in)

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    p = crud.get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    if p.image_url:
        _delete_image_file(p.image_url)
    crud.delete_project(db, p)
    return

@router.post("/{project_id}/image", response_model=schemas.ProjectRead)
def upload_project_image(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    p = crud.get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image type. Use JPEG, PNG, GIF, or WebP.")
    contents = file.file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image too large. Max size is 5 MB.")
    # Remove old image if present
    if p.image_url:
        _delete_image_file(p.image_url)
    ext = (file.filename or "image").rsplit(".", 1)[-1].lower()
    filename = f"project_{project_id}_{uuid.uuid4().hex[:8]}.{ext}"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(contents)
    image_url = f"/uploads/{filename}"
    return crud.set_project_image(db, p, image_url)

@router.delete("/{project_id}/image", response_model=schemas.ProjectRead)
def delete_project_image(
    project_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    p = crud.get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    if not p.image_url:
        raise HTTPException(status_code=404, detail="Project has no image")
    _delete_image_file(p.image_url)
    return crud.clear_project_image(db, p)

def _delete_image_file(image_url: str):
    # image_url is stored as /uploads/<filename>
    prefix = "/uploads/"
    filename = image_url[len(prefix):] if image_url.startswith(prefix) else os.path.basename(image_url)
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.isfile(filepath):
        os.remove(filepath)