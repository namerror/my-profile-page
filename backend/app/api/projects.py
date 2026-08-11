''' API endpoints for managing projects '''

import os
import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from urllib.parse import urlparse

from ..db.session import get_db
from .. import crud, schemas, models_db
from .auth import get_current_admin

BLOB_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN", "")
BLOB_API_URL = "https://blob.vercel-storage.com"
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
        _delete_blob(p.image_url)
    for gallery_image in p.gallery_images:
        _delete_blob(gallery_image.image_url)
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
    contents = _read_image_upload(file)
    # Remove old image if present
    if p.image_url:
        _delete_blob(p.image_url)
    blob_url = _upload_image_blob(f"project_{project_id}", file, contents)
    return crud.set_project_image(db, p, blob_url)

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
    _delete_blob(p.image_url)
    return crud.clear_project_image(db, p)

@router.post("/{project_id}/gallery", response_model=schemas.ProjectRead)
def upload_project_gallery_image(
    project_id: int,
    file: UploadFile = File(...),
    description: str | None = Form(None),
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    p = crud.get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    contents = _read_image_upload(file)
    blob_url = _upload_image_blob(f"project_{project_id}_gallery", file, contents)
    crud.create_project_gallery_image(db, p, blob_url, _clean_description(description))
    return crud.get_project(db, project_id)

@router.post("/{project_id}/gallery/blob", response_model=schemas.ProjectRead)
def create_project_gallery_blob_image(
    project_id: int,
    image_in: schemas.ProjectGalleryBlobCreate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    p = crud.get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    if not _is_vercel_blob_url(image_in.image_url):
        raise HTTPException(status_code=400, detail="Gallery image URL must be a Vercel Blob URL")
    crud.create_project_gallery_image(db, p, image_in.image_url, _clean_description(image_in.description))
    return crud.get_project(db, project_id)

@router.put("/{project_id}/gallery/reorder", response_model=schemas.ProjectRead)
def reorder_project_gallery_images(
    project_id: int,
    reorder_in: schemas.ProjectGalleryReorder,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    p = crud.get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    if len(set(reorder_in.image_ids)) != len(reorder_in.image_ids):
        raise HTTPException(status_code=400, detail="Gallery image IDs must be unique")
    try:
        return crud.reorder_project_gallery_images(db, p, reorder_in.image_ids)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

@router.patch("/{project_id}/gallery/{image_id}", response_model=schemas.ProjectRead)
def update_project_gallery_image(
    project_id: int,
    image_id: int,
    image_in: schemas.ProjectGalleryImageUpdate,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    p = crud.get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    gallery_image = crud.get_project_gallery_image(db, project_id, image_id)
    if not gallery_image:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    updates = image_in.model_dump(exclude_unset=True)
    sort_order = updates.get("sort_order")
    if sort_order is not None and sort_order < 0:
        raise HTTPException(status_code=400, detail="Sort order must be zero or greater")
    description = updates.get("description", gallery_image.description)
    crud.update_project_gallery_image(db, gallery_image, _clean_description(description), sort_order)
    return crud.get_project(db, project_id)

@router.delete("/{project_id}/gallery/{image_id}", response_model=schemas.ProjectRead)
def delete_project_gallery_image(
    project_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin),
):
    p = crud.get_project(db, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    gallery_image = crud.get_project_gallery_image(db, project_id, image_id)
    if not gallery_image:
        raise HTTPException(status_code=404, detail="Gallery image not found")
    _delete_blob(gallery_image.image_url)
    crud.delete_project_gallery_image(db, gallery_image)
    return crud.get_project(db, project_id)

def _read_image_upload(file: UploadFile) -> bytes:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image type. Use JPEG, PNG, GIF, or WebP.")
    contents = file.file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image too large. Max size is 5 MB.")
    return contents

def _upload_image_blob(filename_prefix: str, file: UploadFile, contents: bytes) -> str:
    ext = (file.filename or "image").rsplit(".", 1)[-1].lower()
    filename = f"{filename_prefix}_{uuid.uuid4().hex[:8]}.{ext}"
    res = httpx.put(
        f"{BLOB_API_URL}/{filename}",
        content=contents,
        headers={
            "Authorization": f"Bearer {BLOB_TOKEN}",
            "Content-Type": file.content_type or "application/octet-stream",
            "x-api-version": "7",
        },
        params={"access": "public"},
    )
    if not res.is_success:
        raise HTTPException(status_code=502, detail="Failed to upload image to storage")
    return res.json()["url"]

def _clean_description(description: str | None) -> str | None:
    if description is None:
        return None
    description = description.strip()
    return description or None

def _is_vercel_blob_url(url: str) -> bool:
    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    return parsed.scheme == "https" and hostname.endswith(".blob.vercel-storage.com")

def _delete_blob(url: str) -> None:
    httpx.request(
        "DELETE",
        BLOB_API_URL,
        headers={"Authorization": f"Bearer {BLOB_TOKEN}"},
        json={"urls": [url]},
    )
