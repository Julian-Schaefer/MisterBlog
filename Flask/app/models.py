from datetime import datetime
from typing import List


class BlogPost:
    def __init__(
        self,
        title: str,
        date: datetime,
        authors: List[str],
        summary: str,
        content: str,
        blog_url: str,
        post_url: str,
    ):
        self.title = title
        self.date = date
        self.authors = authors
        self.summary = summary
        self.content = content
        self.blog_url = blog_url
        self.post_url = post_url

    def toJSON(self) -> dict:
        return {
            "title": self.title,
            "date": self.date.isoformat(),
            "authors": self.authors,
            "summary": self.summary,
            "content": self.content,
            "blogUrl": self.blog_url,
            "postUrl": self.post_url,
        }
