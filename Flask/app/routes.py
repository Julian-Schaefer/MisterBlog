from flask import Blueprint, request, jsonify
from flask import request, jsonify
from multiprocessing.dummy import Pool as ThreadPool
import json

from app.articleselector import get_article_selectors, get_articles, download_article
from app.blog_selection import BlogSelection
from app.database import db

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

        article_selectors = get_article_selectors(blog_url)
        if len(article_selectors) > 0:
            new_blog_selection = BlogSelection(
                blog_url=blog_url, user_id=user_id, is_selected=True, article_selectors=json.dumps(article_selectors))
            db.session.add(new_blog_selection)
            db.session.commit()
            return {"message": f"Blog Selection {new_blog_selection.blog_url} for User {new_blog_selection.user_id} has been created successfully."}
        else:
            return {"error": "The provided Blog URL is not supported."}, 406
    else:
        return {"error": "The request payload is not in JSON format."}, 400


@bp.route('/blog-selection/selected', methods=['POST', 'GET'])
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
            return {"message": f"Updated selected Blogs successfully"}
        else:
            return {"error": "The request payload is not in JSON format"}

    elif request.method == 'GET':
        blog_selections = db.session.query(
            BlogSelection).filter_by(user_id=user_id)
        results = [
            {
                "blogUrl": blog_selection.blog_url,
                "isSelected": blog_selection.is_selected
            } for blog_selection in blog_selections]

        return jsonify(results)


@bp.route("/blog-selection", methods=["GET"])
def getBlogPosts():
    user_id = request.user['user_id']
    page = int(request.args.get('page'))

    blog_selections = db.session.query(
        BlogSelection).filter_by(user_id=user_id, is_selected=True)
    articles = []

    if blog_selections.count() > 0:
        blog_selection_arguments = []
        for blog_selection in blog_selections:
            blog_selection.article_selectors = json.loads(
                blog_selection.article_selectors)
            blog_selection_arguments.append((page, blog_selection))

        pool = ThreadPool(len(blog_selection_arguments))
        article_urls = pool.starmap(get_articles, blog_selection_arguments)
        pool.close()
        pool.join()

        for (blog_selection, urls) in article_urls:
            pool = ThreadPool(len(article_urls))
            blog_articles = pool.map(download_article, urls)
            for article in blog_articles:
                articles.append((blog_selection.blog_url, article))
            pool.close()
            pool.join()

    cleaned_articles = []
    for article in cleaned_articles:
        if article[1].publish_date:
            cleaned_articles += [article]

    cleaned_articles.sort(
        key=lambda article: article[1].publish_date, reverse=True)

    return jsonify([{
        "title": article.title,
        "date": article.publish_date.isoformat(),
        "authors": article.authors,
        "summary": article.summary,
        "content": article.article_html,
        "blogUrl": blog_url,
        "postUrl": article.url
    } for (blog_url, article) in cleaned_articles])


@bp.route("/blog-selection/post", methods=["GET"])
def getBlogPostFromUrl():
    url = request.args.get('url')

    article = download_article(url)

    # https://newspaper.readthedocs.io/en/latest/user_guide/advanced.html
    article.clean_doc
    article.clean_top_node

    return jsonify({
        "title": article.title,
        "date": article.publish_date.isoformat(),
        "authors": article.authors,
        "summary": article.summary,
        "content": article.article_html,
        "blogUrl": None,
        "postUrl": article.url
    })
