from app.database import db


class BlogSelection(db.Model):
    __tablename__ = 'blog_selection'

    blogUrl = db.Column(db.String(), primary_key=True)
    userId = db.Column(db.String(), primary_key=True)
    isSelected = db.Column(db.Boolean())

    def __init__(self, blogUrl, userId, isSelected):
        self.blogUrl = blogUrl
        self.userId = userId
        self.isSelected = isSelected

    def __repr__(self):
        return f"<Blog-Selection {self.blogUrl},  {self.userId}>"
