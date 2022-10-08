from flask import Blueprint, current_app

from app.database import db

bp = Blueprint("admin_routes", __name__)


@bp.route("/admin/dbupgrade")
def _():
    from flask_migrate import upgrade, Migrate

    migrate = Migrate(current_app, db)
    upgrade(directory=migrate.directory)
    return "Migrated Database! :)"
