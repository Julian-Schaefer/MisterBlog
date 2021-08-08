from flask import Blueprint, request, jsonify

from blog_selection import BlogSelection
from database import db

routes = Blueprint('Routes', __name__)


@routes.route('/asd')
def index():
    return "This is an example app"


@routes.route('/blog-selection', methods=['POST', 'GET'])
def handle_cars():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            new_blog_selection = BlogSelection(
                blogUrl=data['blogUrl'], userId="Testi", isSelected=True)
            db.session.add(new_blog_selection)
            db.session.commit()
            return {"message": f"Blog Selection {new_blog_selection.blogUrl} for User {new_blog_selection.userId} has been created successfully."}
        else:
            return {"error": "The request payload is not in JSON format"}

    elif request.method == 'GET':
        blog_selections = BlogSelection.query.all()
        results = [
            {
                "blogUrl": blog_selection.blogUrl,
                "isSelected": blog_selection.isSelected
            } for blog_selection in blog_selections]

        return jsonify(results)
