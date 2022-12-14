"""empty message

Revision ID: 7089862da2ea
Revises:
Create Date: 2021-08-08 15:13:01.009636

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "7089862da2ea"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "blog_selection",
        sa.Column("blog_url", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("is_selected", sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint("blog_url", "user_id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("blog_selection")
    # ### end Alembic commands ###
