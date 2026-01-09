''' API endpoints for managing learning resources. '''

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..db.session import get_db
from .. import crud, schemas, models_db
from .auth import get_current_admin

router = APIRouter(prefix="/learnings", tags=["learnings"])

@router.get("/", response_model=List[schemas.LearningRead])
def read_learnings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_learnings(db, skip=skip, limit=limit)

@router.get("/{learning_id}", response_model=schemas.LearningRead)
def read_learning(learning_id: int, db: Session = Depends(get_db)):
    l = crud.get_learning(db, learning_id)
    if not l:
        raise HTTPException(status_code=404, detail="Learning resource not found")
    return l

@router.post("/", response_model=schemas.LearningRead)
def create_learning(learning_in: schemas.LearningCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    return crud.create_learning(db, learning_in)

@router.put("/{learning_id}", response_model=schemas.LearningRead)
def update_learning(learning_id: int, learning_in: schemas.LearningCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    l = crud.get_learning(db, learning_id)
    if not l:
        raise HTTPException(status_code=404, detail="Learning resource not found")
    return crud.update_learning(db, l, learning_in)

@router.delete("/{learning_id}", status_code=204)
def delete_learning(learning_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    l = crud.get_learning(db, learning_id)
    if not l:
        raise HTTPException(status_code=404, detail="Learning resource not found")
    crud.delete_learning(db, l)
    return