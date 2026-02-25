import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    JWT_SECRET_KEY: str = os.environ.get(
        "JWT_SECRET_KEY",
        "django-insecure-creditcard-payment-system-secret-key-change-in-production"
    )
    JWT_ALGORITHM: str = "HS256"
    DJANGO_API_URL: str = os.environ.get("DJANGO_API_URL", "http://localhost:8000")

    class Config:
        env_file = ".env"


settings = Settings()
