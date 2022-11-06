from flask import request
from flask_socketio import disconnect, emit
import json

from app.blog_selection import BlogSelection
from app.database import db
import app.rss_selector as rss_selector
from app.article_selector import get_article_selectors


def handle_message(selected_blog):
    user_id = request.args["user_id"]
    blog_url = selected_blog["blogUrl"]
    if not blog_url.startswith("https://"):
        blog_url = "https://" + blog_url

    blog_selection_exists = (
        db.session.query(BlogSelection)
        .filter_by(user_id=user_id, blog_url=blog_url)
        .one_or_none()
    )

    if blog_selection_exists:
        emit(
            "error",
            {
                "status": 409,
                "error": "The specified Blog URL has already been added for this User.",
            },
        )

    rss_url_result = rss_selector.get_rss_url(blog_url)
    if rss_url_result and rss_url_result[1]:
        new_blog_selection = BlogSelection(
            blog_url=blog_url,
            user_id=user_id,
            is_selected=True,
            rss_url=rss_url_result[0],
            article_selectors=None,
            page_counter_url=None,
        )
    else:
        article_selectors = get_article_selectors(blog_url)
        if article_selectors and len(article_selectors[0]) > 0:
            new_blog_selection = BlogSelection(
                blog_url=blog_url,
                user_id=user_id,
                is_selected=True,
                rss_url=None,
                article_selectors=json.dumps(article_selectors[0]),
                page_counter_url=article_selectors[1],
            )
        else:
            emit(
                "error",
                {
                    "status": 406,
                    "error": "The provided Blog URL is not supported.",
                },
            )

    db.session.add(new_blog_selection)
    db.session.commit()

    emit(
        "update",
        {
            "status": "completed",
            "message": (
                f"Blog Selection {new_blog_selection.blog_url} for User",
                f"{new_blog_selection.user_id} has been created successfully.",
            ),
        },
    )


def init_socketio(socket_io, token_verifier):
    @socket_io.on("add_selected_blog")
    def _(selected_blog):
        handle_message(selected_blog)

    @socket_io.on("connect")
    def _():
        authHeader = request.args["Authorization"]

        if not authHeader:
            return {"message": "No Token provided."}, 401
        try:
            token = authHeader.split()[1]
            user = token_verifier.verify(token)

            if (
                user["firebase"]["sign_in_provider"] == "password"
                and not user["email_verified"]
            ):
                disconnect()
                return False

            return True
        except Exception:
            disconnect()
            return False
