''' SQL Alchemy ORM models '''

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .db.base import Base

project_skill = Table(
    "project_skill",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True),
)

learning_skill = Table(
    "learning_skill",
    Base.metadata,
    Column("learning_id", Integer, ForeignKey("learnings.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True),
)

class Category(Base):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)

class Skill(Base):
    __tablename__ = "skills"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    parent_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id"), nullable=True)
    parent = relationship("Skill", remote_side=[id], backref="children")
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", backref="skills")
class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    skills = relationship("Skill", secondary=project_skill, backref="projects")
    content: Mapped[str] = mapped_column(Text, nullable=True) # Markdown body

# A learning resource such as book, link, video, etc.
class Learning(Base):
    __tablename__ = "learnings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, index=True, nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    skills = relationship("Skill", secondary=learning_skill, backref="learnings")
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)