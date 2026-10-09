"""Tests for featured project CRUD behavior."""

from app import crud
from app.schemas import ProjectCreate


def test_create_project_defaults_featured_false(db):
    project = crud.create_project(
        db,
        ProjectCreate(
            name="Project A",
            description="desc",
            is_completed=False,
            skill_ids=[],
        ),
    )

    assert project.featured is False


def test_update_project_featured_flag(db):
    project = crud.create_project(
        db,
        ProjectCreate(
            name="Project A",
            description="desc",
            is_completed=False,
            featured=False,
            skill_ids=[],
        ),
    )

    updated = crud.update_project(
        db,
        project,
        ProjectCreate(
            name=project.name,
            description=project.description,
            is_completed=project.is_completed,
            featured=True,
            content=project.content,
            skill_ids=[],
        ),
    )

    assert updated.featured is True
