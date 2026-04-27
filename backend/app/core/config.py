import os
from dataclasses import dataclass
from typing import List

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "AI Bias Inspector API")
    api_prefix: str = os.getenv("API_PREFIX", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    allowed_origins: List[str] = None

    def __post_init__(self):
        origins = os.getenv("ALLOWED_ORIGINS", "*")
        object.__setattr__(
            self,
            "allowed_origins",
            [origin.strip() for origin in origins.split(",") if origin.strip()],
        )


settings = Settings()
