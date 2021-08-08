from flask_migrate import Migrate
import app
from app import db

migrate = Migrate(app, db)
