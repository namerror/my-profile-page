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

activity_skill = Table(
    "activity_skill",
    Base.metadata,
    Column("activity_id", Integer, ForeignKey("activities.id"), primary_key=True),
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
    image_url: Mapped[str] = mapped_column(String, nullable=True)  # Relative URL path to uploaded image

# A learning resource such as book, link, video, etc.
class Learning(Base):
    __tablename__ = "learnings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, index=True, nullable=False)
    url: Mapped[str] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    skills = relationship("Skill", secondary=learning_skill, backref="learnings")
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)

# Activities include past/current jobs, volunteer work, internships, study etc.
class Activity(Base):
    __tablename__ = "activities"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, index=True, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)  # e.g., "job", "volunteer", "internship", "study"
    organization: Mapped[str] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    start_date: Mapped[str] = mapped_column(String, nullable=True)  # ISO format date
    end_date: Mapped[str] = mapped_column(String, nullable=True)    # ISO format date
    is_current: Mapped[bool] = mapped_column(Boolean, default=False)
    skills = relationship("Skill", secondary=activity_skill, backref="activities") # skills associated with this activity

# User profile - only one profile allowed for single-user application
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    phone_number: Mapped[str] = mapped_column(String, nullable=True)
    linkedin_url: Mapped[str] = mapped_column(String, nullable=True)
    github_url: Mapped[str] = mapped_column(String, nullable=True)
    personal_website: Mapped[str] = mapped_column(String, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)