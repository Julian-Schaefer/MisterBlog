import json
import os
from flask import Flask, request, jsonify
from newspaper import Article
import newspaper
import firebase_admin
from firebase_admin import credentials, auth
from newspaper.article import ArticleException
from io import StringIO
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Connect to Firebase
serviceAccountJson = os.environ.get("SERVICE_ACCOUNT_JSON", None)
if serviceAccountJson:
    serviceAccount = json.load(StringIO(serviceAccountJson))
    cred = credentials.Certificate(serviceAccount)
else:
    cred = credentials.Certificate(
        "/Users/julian/Google Drive/Programming/Blogify/serviceAccount.json")
firebase_admin.initialize_app(cred)


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:blogifypassword@localhost:5432/postgres"
db = SQLAlchemy(app)
migrate = Migrate(app, db)


class CarsModel(db.Model):
    __tablename__ = 'blog_selection'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())
    model = db.Column(db.String())
    doors = db.Column(db.Integer())

    def __init__(self, name, model, doors):
        self.name = name
        self.model = model
        self.doors = doors

    def __repr__(self):
        return f"<Blog-Selection {self.name}>"

# @app.before_request
# def authenticateUser():
#     authHeader = request.headers.get("Authorization")
#     token = authHeader.split()[1]
#     if not authHeader:
#         return {"message": "No Token provided."}, 400
#     try:
#         user = auth.verify_id_token(token)
#         request.user = user
#     except:
#         return {"message": "Invalid Token provided."}, 400


@ app.route("/posts")
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


@ app.route("/post")
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
