"""empty message

Revision ID: 57ee7df316ed
Revises: 93b85194487c
Create Date: 2022-02-06 14:19:22.924906

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '57ee7df316ed'
down_revision = '93b85194487c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('blog_selection', sa.Column(
        'page_counter_url', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('blog_selection', 'page_counter_url')
    # ### end Alembic commands ###
