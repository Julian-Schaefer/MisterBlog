from typing import List
from flask import Blueprint, request, jsonify
from flask import request, jsonify
from multiprocessing.dummy import Pool as ThreadPool
import json

from app.articleselector import get_article_selectors, get_articles, download_article
from app.blog_selection import BlogSelection
from app.database import db
import app.rss_selector as rss_selector

bp = Blueprint('routes', __name__)


@bp.route("/blog-selection", methods=["DELETE"])
def deleteBlogSelection():
    user_id = request.user['user_id']
    if request.is_json:
        data = request.get_json()

        db.session.query(
            BlogSelection).filter_by(user_id=user_id, blog_url=data['blogUrl']).delete()
        db.session.commit()
        return {"message": f"Blog Selection {data['blogUrl']} for User {user_id} has been deleted successfully."}
    else:
        return {"error": "The request payload is not in JSON format"}


@bp.route("/blog-selection", methods=["POST"])
def addBlogSelection():
    user_id = request.user['user_id']
    if request.is_json:
        data = request.get_json()
        blog_url = data['blogUrl']
        if not blog_url.startswith('https://'):
            blog_url = "https://" + blog_url

        blog_selection_exists = db.session.query(
            BlogSelection).filter_by(user_id=user_id, blog_url=blog_url).one_or_none()

        if blog_selection_exists:
            return {"error": "The specified Blog URL has already been added for this User."}, 409

        rss_url_result = rss_selector.get_rss_url(blog_url)
        if rss_url_result and rss_url_result[1]:
            new_blog_selection = BlogSelection(
                blog_url=blog_url,
                user_id=user_id,
                is_selected=True,
                rss_url=rss_url_result[0],
                article_selectors=None,
                page_counter_url=None)
        else:
            article_selectors = get_article_selectors(blog_url)
            if article_selectors and len(article_selectors[0]) > 0:
                new_blog_selection = BlogSelection(
                    blog_url=blog_url,
                    user_id=user_id,
                    is_selected=True,
                    rss_url=None,
                    article_selectors=json.dumps(article_selectors[0]),
                    page_counter_url=article_selectors[1])
            else:
                return {"error": "The provided Blog URL is not supported."}, 406

        db.session.add(new_blog_selection)
        db.session.commit()
        return {"message": f"Blog Selection {new_blog_selection.blog_url} for User {new_blog_selection.user_id} has been created successfully."}
    else:
        return {"error": "The request payload is not in JSON format."}, 400


@ bp.route('/blog-selection/selected', methods=['POST', 'GET'])
def handleSelectedBlogs():
    user_id = request.user['user_id']
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            for blogSelection in data:
                new_blog_selection = db.session.query(BlogSelection).get(
                    (blogSelection['blogUrl'], user_id))
                if new_blog_selection:
                    new_blog_selection.is_selected = blogSelection['isSelected']
                    db.session.add(new_blog_selection)
            db.session.commit()
        else:
            return {"error": "The request payload is not in JSON format"}

    blog_selections = db.session.query(
        BlogSelection).filter_by(user_id=user_id)

    results = [
        {
            "blogUrl": blog_selection.blog_url,
            "isSelected": blog_selection.is_selected
        } for blog_selection in blog_selections]

    results.sort(key=lambda result: result.get('blogUrl'))

    return jsonify(results)


def _get_html_articles(page: int, blog_selections: List[BlogSelection]):
    articles = []
    pool = ThreadPool(blog_selections.count())
    article_urls = pool.starmap(
        get_articles, [(page, blog_selection) for blog_selection in blog_selections if blog_selection.article_selectors])
    pool.close()
    pool.join()

    if len(article_urls) > 0:
        pool = ThreadPool(len(article_urls))
        for (blog_selection, urls) in article_urls:
            blog_articles = pool.map(download_article, urls)
            for article in blog_articles:
                article.blog_url = blog_selection.blog_url
                articles.append(article)

        pool.close()
        pool.join()

    return articles


@ bp.route("/blog-selection", methods=["GET"])
def getBlogPosts():
    user_id = request.user['user_id']
    page = int(request.args.get('page'))

    blog_selections: List[BlogSelection] = db.session.query(
        BlogSelection).filter_by(user_id=user_id, is_selected=True)

    articles = []

    if blog_selections.count() > 0:
        for blog_selection in blog_selections:
            if blog_selection.rss_url:
                articles += rss_selector.get_articles_from_rss_url(
                    blog_selection, page)
            elif blog_selection.article_selectors:
                blog_selection.article_selectors = json.loads(
                    blog_selection.article_selectors)

        articles += _get_html_articles(page, blog_selections)

    cleaned_articles = []
    for article in articles:
        if article and article.publish_date:
            cleaned_articles += [article]

    # cleaned_articles.sort(
    #    key=lambda article: article[1].publish_date, reverse=True)

    return jsonify([{
        "title": article.title,
        "date": article.publish_date.isoformat(),
        "authors": article.authors,
        "summary": article.summary,
        "content": article.article_html,
        "blogUrl": article.blog_url,
        "postUrl": article.url
    } for article in cleaned_articles])


@ bp.route("/blog-selection/post", methods=["GET"])
def getBlogPostFromUrl():
    url = request.args.get('url')

    article = download_article(url)

    return jsonify({
        "title": article.title,
        "date": article.publish_date.isoformat(),
        "authors": article.authors,
        "summary": article.summary,
        "content": article.article_html,
        "blogUrl": None,
        "postUrl": article.url
    })
