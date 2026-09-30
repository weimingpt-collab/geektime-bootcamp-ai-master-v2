from typing import Any, List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/projectalpha"

    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Project Alpha"

    # CORS - 使用字符串字段，然后在验证器中解析
    ALLOWED_ORIGINS_STR: str = Field(
        default="http://localhost:5173",
        alias="ALLOWED_ORIGINS",
        description="Allowed CORS origins (comma-separated)",
    )

    # Environment
    ENVIRONMENT: str = "development"

    @field_validator("ALLOWED_ORIGINS_STR", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Any) -> Any:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            return v
        return str(v)

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """解析 ALLOWED_ORIGINS_STR 为列表"""
        if isinstance(self.ALLOWED_ORIGINS_STR, list):
            return self.ALLOWED_ORIGINS_STR
        return [origin.strip() for origin in self.ALLOWED_ORIGINS_STR.split(",") if origin.strip()]


settings = Settings()
