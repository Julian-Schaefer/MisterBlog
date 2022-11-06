from typing import List
from flask import Blueprint, request, jsonify
import json
from datetime import datetime

from app.article_selector import get_article_selectors
import app.article_downloader as article_downloader
from app.blog_selection import BlogSelection
from app.database import db
from app.models import BlogPost
import app.rss_selector as rss_selector
from app.firebase import delete_user

bp = Blueprint("routes", __name__)


@bp.route("/blog-selection", methods=["DELETE"])
def deleteBlogSelection():
    user_id = request.user["user_id"]
    if request.is_json:
        data = request.get_json()

        db.session.query(BlogSelection).filter_by(
            user_id=user_id, blog_url=data["blogUrl"]
        ).delete()
        db.session.commit()
        return {
            "message": (
                f"Blog Selection {data['blogUrl']} for User",
                f"{user_id} has been deleted successfully.",
            )
        }
    else:
        return {"error": "The request payload is not in JSON format"}


@bp.route("/blog-selection/selected", methods=["POST", "GET"])
def handleSelectedBlogs():
    user_id = request.user["user_id"]
    if request.method == "POST":
        if request.is_json:
            data = request.get_json()
            for blogSelection in data:
                new_blog_selection = db.session.query(BlogSelection).get(
                    (blogSelection["blogUrl"], user_id)
                )
                if new_blog_selection:
                    new_blog_selection.is_selected = blogSelection["isSelected"]
                    db.session.add(new_blog_selection)
            db.session.commit()
        else:
            return {"error": "The request payload is not in JSON format"}

    blog_selections = db.session.query(BlogSelection).filter_by(user_id=user_id).all()

    results = [
        {"blogUrl": blog_selection.blog_url, "isSelected": blog_selection.is_selected}
        for blog_selection in blog_selections
    ]

    results.sort(key=lambda result: result.get("blogUrl"))

    return jsonify(results)


@bp.route("/blog-selection", methods=["GET"])
def getBlogPosts():
    user_id = request.user["user_id"]

    latest_date: datetime = request.args.get("latestDate")
    if latest_date:
        latest_date = datetime.fromisoformat(latest_date[:-1])

    blog_selections: List[BlogSelection] = (
        db.session.query(BlogSelection)
        .filter_by(user_id=user_id, is_selected=True)
        .all()
    )

    blog_posts: List[BlogPost] = []

    if len(blog_selections) > 0:
        for blog_selection in blog_selections:
            if blog_selection.article_selectors:
                blog_selection.article_selectors = json.loads(
                    blog_selection.article_selectors
                )

        blog_posts = article_downloader.download_blog_posts(
            latest_date, blog_selections
        )

    return jsonify([blog_post.toJSON() for blog_post in blog_posts])


@bp.route("/blog-selection/post", methods=["GET"])
def getBlogPostFromUrl():
    url = request.args.get("url")

    blog_post = article_downloader.download_article(url, download_content=True)

    return jsonify(blog_post.toJSON())


@bp.route("/account", methods=["DELETE"])
def deleteAccount():
    user_id = request.user["user_id"]
    delete_user(user_id)

    db.session.query(BlogSelection).filter_by(user_id=user_id).delete()

    return jsonify({"message": "Account has been successfully deleted."}), 200
