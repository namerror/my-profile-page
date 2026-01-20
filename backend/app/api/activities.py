''' API endpoints for managing activities '''
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.app import models_db
from ..db.session import get_db
from .. import crud, schemas
from .auth import get_current_admin

router = APIRouter(prefix="/activities", tags=["activities"])

@router.get("/", response_model=List[schemas.ActivityRead])
def read_activities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_activities(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.ActivityRead, dependencies=[Depends(get_current_admin)])
def create_activity(activity_in: schemas.ActivityCreate, db: Session = Depends(get_db)):
    return crud.create_activity(db, activity_in=activity_in)

@router.get("/{activity_id}", response_model=schemas.ActivityRead)
def read_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = crud.get_activity(db, activity_id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

@router.put("/{activity_id}", response_model=schemas.ActivityRead, dependencies=[Depends(get_current_admin)])
def update_activity(activity_id: int, activity_in: schemas.ActivityCreate, db: Session = Depends(get_db)):
    activity = crud.get_activity(db, activity_id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return crud.update_activity(db, activity=activity, activity_in=activity_in)

@router.delete("/{activity_id}", status_code=204, dependencies=[Depends(get_current_admin)])
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = crud.get_activity(db, activity_id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    crud.delete_activity(db, activity=activity)
    return