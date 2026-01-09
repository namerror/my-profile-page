''' Pydantic request/response schemas '''

from pydantic import BaseModel
from typing import List, Optional


class SkillBase(BaseModel):
    name: str
    parent_id: Optional[int] = None

class SkillCreate(SkillBase):
    pass

class SkillRead(SkillBase):
    id: int
    class Config:
        orm_mode = True

class ProjectBase(BaseModel):
    name: str
    description: str
    is_completed: bool = False
    content: str | None = None

class ProjectCreate(ProjectBase):
    skill_ids: List[int] = []

class ProjectRead(ProjectBase):
    id: int
    skills: List[SkillRead] = []
    class Config:
        orm_mode = True

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
    class Config:
        orm_mode = True