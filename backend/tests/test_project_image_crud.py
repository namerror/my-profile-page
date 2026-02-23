"""Tests for set_project_image and clear_project_image CRUD helpers."""

from app import crud
from app.models_db import Project


def _make_project(db, image_url=None):
    """Helper: persist a minimal Project and return it."""
    project = Project(name="Test Project", description="desc", is_completed=False, image_url=image_url)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def test_set_project_image(db):
    project = _make_project(db)
    result = crud.set_project_image(db, project, "/uploads/a.png")
    assert result.image_url == "/uploads/a.png"


def test_set_project_image_overwrites(db):
    project = _make_project(db, image_url="/uploads/old.png")
    result = crud.set_project_image(db, project, "/uploads/new.png")
    assert result.image_url == "/uploads/new.png"


def test_clear_project_image(db):
    project = _make_project(db, image_url="/uploads/existing.png")
    result = crud.clear_project_image(db, project)
    assert result.image_url is None


def test_clear_project_image_already_none(db):
    project = _make_project(db)
    result = crud.clear_project_image(db, project)
    assert result.image_url is None
