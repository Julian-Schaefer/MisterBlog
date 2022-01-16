import pytest
from app import create_app
from app import database
from tests.testconfig import TestConfig


@pytest.fixture
def app():
    app = create_app(TestConfig)

    with app.app_context():
        database.init_app(app)

        # with open('./tests/schema.sql', encoding="utf-8") as f:
        #     engine = db.db.get_engine()
        #     engine.raw_connection().executescript(f.read())

    yield app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()
