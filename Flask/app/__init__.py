import logging
from flask import Flask, request
from flask_cors import CORS
import google.cloud.logging as gcloud_logging

from . import config
from . import firebase


def create_app(config_class=config.Config):
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(config_class)

    if not app.config['TESTING']:
        firebase.setUpFirebase()

    tokenVerifier = config_class.get_token_verifier()

    def authenticateUser():
        if request.method == "OPTIONS":
            return {"message": "Check succeeded."}, 200

        authHeader = request.headers.get("Authorization")
        if not authHeader:
            return {"message": "No Token provided."}, 401
        try:
            token = authHeader.split()[1]
            user = tokenVerifier.verify(token)
            request.user = user
        except Exception:
            return {"message": "Invalid Token provided."}, 401

    from . import routes
    routes.bp.before_request(authenticateUser)
    app.register_blueprint(routes.bp)

    from . import admin_routes
    app.register_blueprint(admin_routes.bp)

    from . import database
    database.init_app(app)

    return app


def start_on_gcloud():
    app = create_app()

    logging_client = gcloud_logging.Client()
    logging_client.setup_logging()

    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

    return app
