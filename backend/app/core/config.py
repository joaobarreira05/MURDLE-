from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Security
    SECRET_KEY: str = "change-this-in-production-openssl-rand-hex-32"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    # Game
    GAME_ACCESS_PASSWORD: str = "DETI2026"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./murdoku.db"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # Environment
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
