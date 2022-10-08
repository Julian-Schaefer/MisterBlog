from app.database import db
from sqlalchemy.types import JSON


class BlogSelection(db.Model):
    __tablename__ = 'blog_selection'

    blog_url = db.Column(db.String(), primary_key=True)
    user_id = db.Column(db.String(), primary_key=True)
    is_selected = db.Column(db.Boolean())
    rss_url = db.Column(db.String(), nullable=True)
    article_selectors = db.Column(JSON(), nullable=True)
    page_counter_url = db.Column(db.String(), nullable=True)

    def __init__(self, blog_url, user_id, is_selected, rss_url, article_selectors, page_counter_url):
        self.blog_url = blog_url
        self.user_id = user_id
        self.is_selected = is_selected
        self.rss_url = rss_url
        self.article_selectors = article_selectors
        self.page_counter_url = page_counter_url

    def __repr__(self):
        return f"<Blog-Selection {self.blog_url},  {self.user_id}>"
