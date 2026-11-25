"""
OMNIS-X Configuration Module.
Supports environment variables and defaults for institutional digital twin backend.
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "OMNIS-X Institutional Cyber-Physical Digital Twin"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/omnis_x.db"
    
    # Security
    JWT_SECRET_KEY: str = "omnis-x-insecure-dev-secret-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Graph Engine
    REBUILD_GRAPH_ON_STARTUP: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
