''' API endpoints for managing categories '''
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db.session import get_db
from .. import crud, schemas
from .auth import get_current_admin

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[schemas.CategoryRead])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_categories(db, skip=skip, limit=limit)

@router.get("/{category_id}", response_model=schemas.CategoryRead)
def read_category(category_id: int, db: Session = Depends(get_db)):
    c = crud.get_category(db, category_id)
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    return c

@router.post("/", response_model=schemas.CategoryRead)
def create_category(category_in: schemas.CategoryCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    return crud.create_category(db, category_in)

@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    c = crud.get_category(db, category_id)
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    crud.delete_category(db, c)
    return