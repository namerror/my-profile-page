"""Tests for project gallery CRUD helpers."""

import pytest

from app import crud
from app.models_db import Project


def _make_project(db):
    project = Project(name="Test Project", description="desc", is_completed=False)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def test_create_project_gallery_image_assigns_order(db):
    project = _make_project(db)

    first = crud.create_project_gallery_image(db, project, "/uploads/one.png", "First image")
    second = crud.create_project_gallery_image(db, project, "/uploads/two.png", None)

    assert first.sort_order == 0
    assert second.sort_order == 1
    assert first.description == "First image"
    assert second.description is None


def test_list_project_gallery_images_returns_gallery_order(db):
    project = _make_project(db)
    first = crud.create_project_gallery_image(db, project, "/uploads/one.png")
    second = crud.create_project_gallery_image(db, project, "/uploads/two.png")

    crud.update_project_gallery_image(db, first, first.description, sort_order=5)
    crud.update_project_gallery_image(db, second, second.description, sort_order=1)

    result = crud.list_project_gallery_images(db, project.id)

    assert [image.id for image in result] == [second.id, first.id]


def test_update_project_gallery_image_description(db):
    project = _make_project(db)
    image = crud.create_project_gallery_image(db, project, "/uploads/one.png", "Before")

    result = crud.update_project_gallery_image(db, image, "After")

    assert result.description == "After"


def test_reorder_project_gallery_images(db):
    project = _make_project(db)
    first = crud.create_project_gallery_image(db, project, "/uploads/one.png")
    second = crud.create_project_gallery_image(db, project, "/uploads/two.png")

    crud.reorder_project_gallery_images(db, project, [second.id, first.id])
    result = crud.list_project_gallery_images(db, project.id)

    assert [image.id for image in result] == [second.id, first.id]
    assert [image.sort_order for image in result] == [0, 1]


def test_reorder_project_gallery_images_rejects_missing_ids(db):
    project = _make_project(db)
    first = crud.create_project_gallery_image(db, project, "/uploads/one.png")
    crud.create_project_gallery_image(db, project, "/uploads/two.png")

    with pytest.raises(ValueError):
        crud.reorder_project_gallery_images(db, project, [first.id])


def test_delete_project_gallery_image(db):
    project = _make_project(db)
    image = crud.create_project_gallery_image(db, project, "/uploads/one.png")

    crud.delete_project_gallery_image(db, image)

    assert crud.list_project_gallery_images(db, project.id) == []
