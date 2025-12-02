''' API endpoints for managing projects '''

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..db.session import get_db
from .. import crud, schemas, models_db
from .auth import get_current_admin

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
    crud.delete_project(db, p)
    return