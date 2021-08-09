from flask import Blueprint, request, jsonify
from newspaper.article import ArticleException
from newspaper import Article
from flask import request, jsonify
import newspaper

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


@routes.route("/posts")
def getBlogPosts():
    blog = newspaper.build("https://www.kauffmann.nl/",
                           keep_article_html=True, fetch_images=False)

    for article in blog.articles:
        try:
            article.download()
            article.parse()
            article.nlp()
        except ArticleException as err:
            print("Error downloading Article: {0}".format(err))

    return jsonify([{
        "title": article.title,
        "authors": article.authors,
        "summary": article.summary,
        "content": article.article_html,
        "date": article.publish_date
    } for article in blog.articles])


@routes.route("/post")
def getBlogPostFromUrl():
    url = request.args.get("url")
    article = Article(url, keep_article_html=True)
    article.download()
    article.parse()
    article.nlp()

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
