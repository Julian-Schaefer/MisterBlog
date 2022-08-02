from datetime import datetime
from typing import List


class BlogPost:

    def __init__(self, title: str, date: datetime, authors: List[str], summary: str, content: str, blogUrl: str, postUrl: str):
        self.title = title
        self.date = date
        self.authors = authors
        self.summary = summary
        self.content = content
        self.blogUrl = blogUrl
        self.postUrl = postUrl

    def toJSON(self) -> dict:
        return {
            "title": self.title,
            "date": self.date.isoformat(),
            "authors": self.authors,
            "summary": self.summary,
            "content": self.content,
            "blogUrl": self.blogUrl,
            "postUrl": self.postUrl
        }
