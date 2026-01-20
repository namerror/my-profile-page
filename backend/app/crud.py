''' DB CRUD helpers (create/read/update/delete)'''

from unicodedata import name
from sqlalchemy.orm import Session
from . import models_db, schemas

def get_project(db: Session, project_id: int):
    return db.query(models_db.Project).filter(models_db.Project.id == project_id).first()

def list_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models_db.Project).offset(skip).limit(limit).all()

def list_skills(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models_db.Skill).offset(skip).limit(limit).all()

def get_skill_by_name(db: Session, name: str):
    return db.query(models_db.Skill).filter(models_db.Skill.name == name).first()

def get_skill(db: Session, skill_id: int):
    return db.query(models_db.Skill).get(skill_id)

def create_skill_if_missing(db: Session, name: str, parent_id: int | None = None, category_id: int | None = None):
    s = get_skill_by_name(db, name)
    if s:
        return s
    s = models_db.Skill(name=name, parent_id=parent_id, category_id=category_id)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

def update_skill(db: Session, skill: models_db.Skill, name: str, parent_id: int | None = None, category_id: int | None = None):
    skill.name = name
    if (parent_id is not None):
        skill.parent_id = parent_id
    if (category_id is not None):
        skill.category_id = category_id
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

def delete_skill(db: Session, skill: models_db.Skill):
    db.delete(skill)
    db.commit()
    return

def create_project(db: Session, project_in: schemas.ProjectCreate):
    project = models_db.Project(
        name=project_in.name, 
        description=project_in.description, 
        is_completed=project_in.is_completed,
        content=project_in.content
        )
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
    if project_in.content is not None:
        project.content = project_in.content
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

def get_learning(db: Session, learning_id: int):
    return db.query(models_db.Learning).filter(models_db.Learning.id == learning_id).first()

def list_learnings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models_db.Learning).offset(skip).limit(limit).all()

def create_learning(db: Session, learning_in: schemas.LearningCreate):
    learning = models_db.Learning(
        title=learning_in.title, 
        url=learning_in.url, 
        description=learning_in.description, 
        is_completed=learning_in.is_completed
        )
    if learning_in.skill_ids:
        skills = db.query(models_db.Skill).filter(models_db.Skill.id.in_(learning_in.skill_ids)).all()
        learning.skills = skills
    db.add(learning)
    db.commit()
    db.refresh(learning)
    return learning

def update_learning(db: Session, learning: models_db.Learning, learning_in: schemas.LearningCreate):
    learning.title = learning_in.title
    if learning_in.url is not None:
        learning.url = learning_in.url
    learning.description = learning_in.description
    learning.is_completed = learning_in.is_completed
    if learning_in.skill_ids is not None:
        learning.skills = db.query(models_db.Skill).filter(models_db.Skill.id.in_(learning_in.skill_ids)).all()
    db.add(learning)
    db.commit()
    db.refresh(learning)
    return learning

def delete_learning(db: Session, learning: models_db.Learning):
    db.delete(learning)
    db.commit()
    return

def list_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models_db.Category).offset(skip).limit(limit).all()

def get_category(db: Session, category_id: int):
    return db.query(models_db.Category).get(category_id)

def create_category(db: Session, category_in: schemas.CategoryCreate):
    c = models_db.Category(name=category_in.name)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

def delete_category(db: Session, category: models_db.Category):
    db.delete(category)
    db.commit()
    return

def list_activities(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models_db.Activity).offset(skip).limit(limit).all()

def get_activity(db: Session, activity_id: int):
    return db.query(models_db.Activity).filter(models_db.Activity.id == activity_id).first()

def create_activity(db: Session, activity_in: schemas.ActivityCreate):
    activity = models_db.Activity(
        title=activity_in.title,
        type=activity_in.type,
        organization=activity_in.organization,
        description=activity_in.description,
        start_date=activity_in.start_date,
        end_date=activity_in.end_date,
        is_current=activity_in.is_current,
    )
    if activity_in.skill_ids:
        skills = db.query(models_db.Skill).filter(models_db.Skill.id.in_(activity_in.skill_ids)).all()
        activity.skills = skills
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

def update_activity(db: Session, activity: models_db.Activity, activity_in: schemas.ActivityCreate):
    activity.title = activity_in.title
    activity.type = activity_in.type
    if activity_in.organization is not None:
        activity.organization = activity_in.organization
    if activity_in.description is not None:
        activity.description =  activity_in.description
    if activity_in.start_date is not None:
        activity.start_date = activity_in.start_date
    if activity_in.end_date is not None:
        activity.end_date = activity_in.end_date
    activity.is_current = activity_in.is_current
    if activity_in.skill_ids is not None:
        activity.skills = db.query(models_db.Skill).filter(models_db.Skill.id.in_(activity_in.skill_ids)).all()
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

def delete_activity(db: Session, activity: models_db.Activity):
    db.delete(activity)
    db.commit()
    return