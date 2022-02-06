from app.database import db
from sqlalchemy.dialects.postgresql import JSONB


class BlogSelection(db.Model):
    __tablename__ = 'blog_selection'

    blog_url = db.Column(db.String(), primary_key=True)
    user_id = db.Column(db.String(), primary_key=True)
    is_selected = db.Column(db.Boolean())
    article_selectors = db.Column(JSONB())
    page_counter_url = db.Column(db.String(), nullable=False)

    def __init__(self, blog_url, user_id, is_selected, article_selectors, page_counter_url):
        self.blog_url = blog_url
        self.user_id = user_id
        self.is_selected = is_selected
        self.article_selectors = article_selectors
        self.page_counter_url = page_counter_url

    def __repr__(self):
        return f"<Blog-Selection {self.blog_url},  {self.user_id}>"
