''' DB CRUD helpers (create/read/update/delete)'''

from unicodedata import name
from sqlalchemy import func
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

def set_project_image(db: Session, project: models_db.Project, image_url: str):
    project.image_url = image_url
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def clear_project_image(db: Session, project: models_db.Project):
    project.image_url = None
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def get_project_gallery_image(db: Session, project_id: int, image_id: int):
    return (
        db.query(models_db.ProjectGalleryImage)
        .filter(
            models_db.ProjectGalleryImage.project_id == project_id,
            models_db.ProjectGalleryImage.id == image_id,
        )
        .first()
    )

def list_project_gallery_images(db: Session, project_id: int):
    return (
        db.query(models_db.ProjectGalleryImage)
        .filter(models_db.ProjectGalleryImage.project_id == project_id)
        .order_by(models_db.ProjectGalleryImage.sort_order, models_db.ProjectGalleryImage.id)
        .all()
    )

def create_project_gallery_image(
    db: Session,
    project: models_db.Project,
    image_url: str,
    description: str | None = None,
):
    next_order = (
        db.query(func.coalesce(func.max(models_db.ProjectGalleryImage.sort_order), -1))
        .filter(models_db.ProjectGalleryImage.project_id == project.id)
        .scalar()
        + 1
    )
    gallery_image = models_db.ProjectGalleryImage(
        project_id=project.id,
        image_url=image_url,
        description=description,
        sort_order=next_order,
    )
    db.add(gallery_image)
    db.commit()
    db.refresh(gallery_image)
    return gallery_image

def update_project_gallery_image(
    db: Session,
    gallery_image: models_db.ProjectGalleryImage,
    description: str | None,
    sort_order: int | None = None,
):
    gallery_image.description = description
    if sort_order is not None:
        gallery_image.sort_order = sort_order
    db.add(gallery_image)
    db.commit()
    db.refresh(gallery_image)
    return gallery_image

def reorder_project_gallery_images(db: Session, project: models_db.Project, image_ids: list[int]):
    gallery_images = list_project_gallery_images(db, project.id)
    existing_ids = [image.id for image in gallery_images]
    if len(image_ids) != len(existing_ids) or set(image_ids) != set(existing_ids):
        raise ValueError("Image IDs must match the project's gallery images")

    images_by_id = {image.id: image for image in gallery_images}
    for sort_order, image_id in enumerate(image_ids):
        images_by_id[image_id].sort_order = sort_order
        db.add(images_by_id[image_id])
    db.commit()
    db.refresh(project)
    return project

def delete_project_gallery_image(db: Session, gallery_image: models_db.ProjectGalleryImage):
    db.delete(gallery_image)
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

# User profile CRUD operations
def get_user(db: Session):
    """Get the single user profile"""
    return db.query(models_db.User).first()

def create_user(db: Session, user_in: schemas.UserCreate):
    """Create the user profile - only one allowed"""
    existing = get_user(db)
    if existing:
        raise ValueError("User profile already exists. Only one profile is allowed.")
    
    user = models_db.User(
        name=user_in.name,
        email=user_in.email,
        phone_number=user_in.phone_number,
        linkedin_url=user_in.linkedin_url,
        github_url=user_in.github_url,
        personal_website=user_in.personal_website,
        description=user_in.description
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user: models_db.User, user_in: schemas.UserUpdate):
    """Update the user profile"""
    # Use exclude_unset=True to only update fields that were explicitly provided
    update_data = user_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
