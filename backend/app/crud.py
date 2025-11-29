''' DB CRUD helpers (create/read/update/delete)'''

from sqlalchemy.orm import Session
from . import models_db, schemas

def get_project(db: Session, project_id: int):
    return db.query(models_db.Project).filter(models_db.Project.id == project_id).first()

def list_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models_db.Project).offset(skip).limit(limit).all()

def get_skill_by_name(db: Session, name: str):
    return db.query(models_db.Skill).filter(models_db.Skill.name == name).first()

def get_skill(db: Session, skill_id: int):
    return db.query(models_db.Skill).get(skill_id)

def create_skill_if_missing(db: Session, name: str, parent_id: int | None = None):
    s = get_skill_by_name(db, name)
    if s:
        return s
    s = models_db.Skill(name=name, parent_id=parent_id)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

def update_skill(db: Session, skill: models_db.Skill, name: str, parent_id: int | None = None):
    skill.name = name
    if (parent_id is not None):
        skill.parent_id = parent_id
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

def delete_skill(db: Session, skill: models_db.Skill):
    db.delete(skill)
    db.commit()
    return

def create_project(db: Session, project_in: schemas.ProjectCreate):
    project = models_db.Project(name=project_in.name, description=project_in.description, is_completed=project_in.is_completed)
    if project_in.skill_ids:
        skills = db.query(models_db.Skill).filter(models_db.Skill.id.in_(project_in.skill_ids)).all()
        project.skills = skills
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def update_project(db: Session, project: models_db.Project, project_in: schemas.ProjectCreate):
    project.name = project_in.name
    project.description = project_in.description
    project.is_completed = project_in.is_completed
    if project_in.skill_ids is not None:
        project.skills = db.query(models_db.Skill).filter(models_db.Skill.id.in_(project_in.skill_ids)).all()
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def delete_project(db: Session, project: models_db.Project):
    db.delete(project)
    db.commit()
    return