''' Pydantic request/response schemas '''

from pydantic import BaseModel, ConfigDict, EmailStr
from typing import List, Optional


class SkillBase(BaseModel):
    name: str
    parent_id: Optional[int] = None
    category_id: Optional[int] = None

class SkillCreate(SkillBase):
    pass

class SkillRead(SkillBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ProjectBase(BaseModel):
    name: str
    description: str
    is_completed: bool = False
    content: str | None = None

class ProjectCreate(ProjectBase):
    skill_ids: List[int] = []

class ProjectGalleryImageBase(BaseModel):
    description: Optional[str] = None
    sort_order: int = 0

class ProjectGalleryImageCreate(BaseModel):
    description: Optional[str] = None

class ProjectGalleryBlobCreate(BaseModel):
    image_url: str
    description: Optional[str] = None

class ProjectGalleryImageUpdate(BaseModel):
    description: Optional[str] = None
    sort_order: Optional[int] = None

class ProjectGalleryImageRead(ProjectGalleryImageBase):
    id: int
    project_id: int
    image_url: str
    model_config = ConfigDict(from_attributes=True)

class ProjectGalleryReorder(BaseModel):
    image_ids: List[int]

class ProjectRead(ProjectBase):
    id: int
    skills: List[SkillRead] = []
    image_url: Optional[str] = None
    gallery_images: List[ProjectGalleryImageRead] = []
    model_config = ConfigDict(from_attributes=True)

class LearningBase(BaseModel):
    title: str
    url: Optional[str] = None
    description: str
    is_completed: bool = False

class LearningCreate(LearningBase):
    skill_ids: List[int] = []

class LearningRead(LearningBase):
    id: int
    skills: List[SkillRead] = []
    model_config = ConfigDict(from_attributes=True)

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str

class ActivityBase(BaseModel):
    title: str
    type: str  # e.g., "job", "volunteer", "internship", "study"
    organization: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None  # ISO format date string
    end_date: Optional[str] = None  # ISO format date string
    is_current: bool = False


class ActivityCreate(ActivityBase):
    skill_ids: List[int] = []

class ActivityRead(ActivityBase):
    id: int
    skills: List[SkillRead] = []
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    personal_website: Optional[str] = None
    description: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    personal_website: Optional[str] = None
    description: Optional[str] = None

class UserRead(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
