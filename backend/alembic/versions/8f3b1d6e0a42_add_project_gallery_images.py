"""add project gallery images

Revision ID: 8f3b1d6e0a42
Revises: 2513dfaa19d1
Create Date: 2026-08-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f3b1d6e0a42'
down_revision: Union[str, Sequence[str], None] = '2513dfaa19d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'project_gallery_images',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('image_url', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_gallery_images_id'), 'project_gallery_images', ['id'], unique=False)
    op.create_index(op.f('ix_project_gallery_images_project_id'), 'project_gallery_images', ['project_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_project_gallery_images_project_id'), table_name='project_gallery_images')
    op.drop_index(op.f('ix_project_gallery_images_id'), table_name='project_gallery_images')
    op.drop_table('project_gallery_images')
