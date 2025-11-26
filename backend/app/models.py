from pydantic import BaseModel
from typing import Self


class Skill(BaseModel):
    name: str
    parent: Self | None = None # parent skill, e.g. Next.js should be part of "frontend"

class Project(BaseModel):
    id: int
    name: str
    description: str
    is_completed: bool
    skills: list[Skill]
