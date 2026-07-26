"""
Configuration settings for the FastAPI application.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""

    # Application
    APP_NAME: str = "AIMAGE API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3002", "http://localhost:8001"]

    # AI Models - Alibaba Cloud DashScope (百炼)
    DASHSCOPE_API_KEY: str
    DASHSCOPE_BASE_URL: str = "https://dashscope.aliyuncs.com"

    # DeepSeek API
    DEEPSEEK_API_KEY: str
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"

    # Storage
    MAX_UPLOAD_SIZE: int = 104857600  # 100MB

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Environment
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
