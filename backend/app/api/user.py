''' API endpoints for managing user profile '''
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db.session import get_db
from .. import crud, schemas
from .auth import get_current_admin

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/", response_model=schemas.UserRead)
def read_user(db: Session = Depends(get_db)):
    """Get the user profile"""
    user = crud.get_user(db)
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")
    return user

@router.post("/", response_model=schemas.UserRead, dependencies=[Depends(get_current_admin)])
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create the user profile - only one allowed"""
    try:
        return crud.create_user(db, user_in=user_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/", response_model=schemas.UserRead, dependencies=[Depends(get_current_admin)])
def update_user(user_in: schemas.UserUpdate, db: Session = Depends(get_db)):
    """Update the user profile"""
    user = crud.get_user(db)
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")
    return crud.update_user(db, user=user, user_in=user_in)
