from app.firebase import FirebaseTokenVerifier


class Config:
    TESTING = False
    SQLALCHEMY_DATABASE_URI = (
        "postgresql://postgres:blogifypassword@localhost:5432/postgres"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    def get_token_verifier():
        return FirebaseTokenVerifier()
