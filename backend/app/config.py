import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "PANDM Apps Technologies"
    database_url: str = ""
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

def get_database_url() -> str:
    if settings.database_url.strip():
        return settings.database_url.strip()
    return "sqlite:///./pandm.db"
