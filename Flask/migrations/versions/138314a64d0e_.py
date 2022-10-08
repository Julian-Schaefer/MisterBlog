"""empty message

Revision ID: 138314a64d0e
Revises: 57ee7df316ed
Create Date: 2022-07-31 20:12:22.443018

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.types import JSON

# revision identifiers, used by Alembic.
revision = '138314a64d0e'
down_revision = '57ee7df316ed'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('blog_selection', sa.Column(
        'rss_url', sa.String(), nullable=True))
    # op.alter_column('blog_selection', 'page_counter_url',
    #                 existing_type=sa.VARCHAR(),
    #                 nullable=True)
    # op.alter_column('blog_selection', 'article_selectors',
    #                 existing_type=JSON(),
    #                 nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    # op.alter_column('blog_selection', 'page_counter_url',
    #                 existing_type=sa.VARCHAR(),
    #                 nullable=False)
    op.drop_column('blog_selection', 'rss_url')
    # ### end Alembic commands ###
