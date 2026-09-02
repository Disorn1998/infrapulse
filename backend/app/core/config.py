from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl


class Settings(BaseSettings):
    """InfraPulse Application Configuration Settings."""

    PROJECT_NAME: str = "InfraPulse"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"

    # Agent Authentication
    AGENT_SECRET_TOKEN: str = "infrapulse_secret_token_change_in_production"

    # PostgreSQL Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres_secure_password"
    POSTGRES_DB: str = "infrapulse"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None

    # CORS Allowed Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*",
    ]

    # Email Alert (SMTP) Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = ""
    SMTP_PASSWORD: Optional[str] = ""
    SMTP_FROM_EMAIL: str = "alerts@infrapulse.local"
    DEFAULT_ALERT_RECIPIENT: str = "admin@infrapulse.local"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )

    def get_database_url(self) -> str:
        """Construct or normalize database URL for cloud platforms (Render/Railway)."""
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


settings = Settings()
