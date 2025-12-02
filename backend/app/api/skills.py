''' API endpoints for Skills '''
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db.session import get_db
from .. import crud, schemas, models_db

router = APIRouter(prefix="/skills", tags=["skills"])

@router.get("/", response_model=List[schemas.SkillRead])
def read_skills(db: Session = Depends(get_db)):
    return db.query(models_db.Skill).all()

@router.get("/{skill_id}", response_model=schemas.SkillRead)
def read_skill(skill_id: int, db: Session = Depends(get_db)):
    s = crud.get_skill(db, skill_id)
    if not s:
        raise HTTPException(status_code=404, detail="Skill not found")
    return s

@router.get("/by-name/{skill_name}", response_model=schemas.SkillRead)
def read_skill_by_name(skill_name: str, db: Session = Depends(get_db)):
    s = crud.get_skill_by_name(db, skill_name)
    if not s:
        raise HTTPException(status_code=404, detail="Skill not found")
    return s

@router.post("/", response_model=schemas.SkillRead)
def create_skill(skill_in: schemas.SkillCreate, db: Session = Depends(get_db)):
    return crud.create_skill_if_missing(db, name=skill_in.name, parent_id=skill_in.parent_id)

@router.put("/{skill_id}", response_model=schemas.SkillRead)
def update_skill(skill_id: int, skill_in: schemas.SkillCreate, db: Session = Depends(get_db)):
    s = crud.get_skill(db, skill_id)
    if not s:
        raise HTTPException(status_code=404, detail="Skill not found")
    return crud.update_skill(db, s, name=skill_in.name, parent_id=skill_in.parent_id)

@router.delete("/{skill_id}", status_code=204)
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    s = crud.get_skill(db, skill_id)
    if not s:
        raise HTTPException(status_code=404, detail="Skill not found")
    crud.delete_skill(db, s)
    return