import os
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def init_app(app):
    DATABASE_URL = os.environ.get('DATABASE_URL', None)
    if DATABASE_URL:
        if DATABASE_URL.startswith("postgres://"):
            SQLALCHEMY_DATABASE_URI = DATABASE_URL.replace("://", "ql://", 1)
        else:
            SQLALCHEMY_DATABASE_URI = DATABASE_URL
        app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI

    USE_IN_MEMORY_DB = os.environ.get('USE_IN_MEMORY_DB', 'false')
    if USE_IN_MEMORY_DB == 'true':
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/misterblog.db'

    db.init_app(app)
    migrate = Migrate()
    migrate.init_app(app, db)
