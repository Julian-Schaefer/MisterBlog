from flask import Blueprint, request, jsonify
from newspaper import Article
from flask import request, jsonify
from articleselector import get_articles, download_article
from multiprocessing.dummy import Pool as ThreadPool

from blog_selection import BlogSelection
from database import db

routes = Blueprint('Routes', __name__)


@routes.route("/blog-selection", methods=["POST"])
def addBlogSelection():
    userId = request.user['user_id']
    if request.is_json:
        data = request.get_json()
        new_blog_selection = BlogSelection(
            blogUrl=data['blogUrl'], userId=userId, isSelected=True)
        db.session.add(new_blog_selection)
        db.session.commit()
        return {"message": f"Blog Selection {new_blog_selection.blogUrl} for User {new_blog_selection.userId} has been created successfully."}
    else:
        return {"error": "The request payload is not in JSON format"}


@routes.route('/blog-selection/selected', methods=['POST', 'GET'])
def handleSelectedBlogs():
    userId = request.user['user_id']
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            for blogSelection in data:
                new_blog_selection = db.session.query(BlogSelection).get(
                    (blogSelection['blogUrl'], userId))
                if new_blog_selection:
                    new_blog_selection.isSelected = blogSelection['isSelected']
                    db.session.add(new_blog_selection)
            db.session.commit()
            return {"message": f"Updated selected Blogs successfully"}
        else:
            return {"error": "The request payload is not in JSON format"}

    elif request.method == 'GET':
        blog_selections = db.session.query(
            BlogSelection).filter_by(userId=userId)
        results = [
            {
                "blogUrl": blog_selection.blogUrl,
                "isSelected": blog_selection.isSelected
            } for blog_selection in blog_selections]

        return jsonify(results)


@routes.route("/blog-selection")
def getBlogPosts():
    userId = request.user['user_id']

    blog_selections = db.session.query(
        BlogSelection).filter_by(userId=userId, isSelected=True)

    articles = []

    if blog_selections.count() > 0:
        pool = ThreadPool(blog_selections.count())
        article_urls = pool.map(get_articles, blog_selections)
        pool.close()
        pool.join()

        for (blogSelection, urls) in article_urls:
            pool = ThreadPool(len(article_urls))
            blogArticles = pool.map(download_article, urls)
            for article in blogArticles:
                articles.append((blogSelection.blogUrl, article))
            pool.close()
            pool.join()

    articles.sort(key=lambda article: article[1].publish_date, reverse=True)

    return jsonify([{
        "title": article.title,
        "date": article.publish_date,
        "authors": article.authors,
        "summary": article.summary,
        "content": article.article_html,
        "blogUrl": blogUrl,
        "postUrl": article.url
    } for (blogUrl, article) in articles])


@routes.route("/post")
def getBlogPostFromUrl():
    url = request.args.get("url")
    article = download_article(url)

    # https://newspaper.readthedocs.io/en/latest/user_guide/advanced.html
    article.clean_doc
    article.clean_top_node

    return {
        "title": article.title,
        "authors": article.authors,
        "summary": article.summary,
        "content": article.article_html,
        "date": article.publish_date
    }
