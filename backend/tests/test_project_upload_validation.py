"""Tests for project image upload validation."""

from io import BytesIO

import pytest
from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers

from app.api.projects import _read_image_upload


def _upload_file(content_type: str, contents: bytes = b"image-bytes") -> UploadFile:
    return UploadFile(
        file=BytesIO(contents),
        filename="project-image.gif",
        headers=Headers({"content-type": content_type}),
    )


def test_read_image_upload_accepts_gif():
    contents = b"GIF89a"
    file = _upload_file("image/gif", contents)

    result = _read_image_upload(file)

    assert result == contents


def test_read_image_upload_rejects_unsupported_type():
    file = _upload_file("text/plain")

    with pytest.raises(HTTPException) as exc_info:
        _read_image_upload(file)

    assert exc_info.value.status_code == 400
    assert "Unsupported image type" in exc_info.value.detail
