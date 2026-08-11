"""Tests for direct-to-Blob gallery registration helpers."""

import os

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.api.auth import create_access_token, get_current_admin, verify_admin
from app.api.projects import create_project_gallery_blob_image
from app.models_db import Project
from app.schemas import ProjectGalleryBlobCreate


def _auth_credentials(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _make_project(db):
    project = Project(name="Test Project", description="desc", is_completed=False)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def test_verify_admin_accepts_valid_token():
    token = create_access_token(os.getenv("ADMIN_USERNAME", "admin"))
    admin = get_current_admin(_auth_credentials(token))

    result = verify_admin(admin)

    assert result == {"authenticated": True}


def test_get_current_admin_rejects_invalid_token():
    with pytest.raises(HTTPException) as exc_info:
        get_current_admin(_auth_credentials("not-a-valid-token"))

    assert exc_info.value.status_code == 401


def test_create_project_gallery_blob_image(db):
    project = _make_project(db)

    result = create_project_gallery_blob_image(
        project.id,
        ProjectGalleryBlobCreate(
            image_url="https://store-id.public.blob.vercel-storage.com/project-gallery/2/demo.gif",
            description="Animated demo",
        ),
        db,
        admin="admin",
    )

    assert len(result.gallery_images) == 1
    assert result.gallery_images[0].image_url.endswith("/project-gallery/2/demo.gif")
    assert result.gallery_images[0].description == "Animated demo"


def test_create_project_gallery_blob_image_rejects_non_blob_url(db):
    project = _make_project(db)

    with pytest.raises(HTTPException) as exc_info:
        create_project_gallery_blob_image(
            project.id,
            ProjectGalleryBlobCreate(
                image_url="https://example.com/project-gallery/2/demo.gif",
                description="Animated demo",
            ),
            db,
            admin="admin",
        )

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "Gallery image URL must be a Vercel Blob URL"
