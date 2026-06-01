import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv(".env.audit")


@dataclass(frozen=True)
class Settings:
    database_url: str
    metrics_port: int
    lookback_minutes: int
    interval_seconds: int
    env: str


def get_settings() -> Settings:
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL is required")

    return Settings(
        database_url=database_url,
        metrics_port=int(os.getenv("AUDIT_WORKER_PORT", "8001")),
        lookback_minutes=int(os.getenv("AUDIT_LOOKBACK_MINUTES", "15")),
        interval_seconds=int(os.getenv("AUDIT_WORKER_INTERVAL_SECONDS", "30")),
        env=os.getenv("AUDIT_ENV", "local"),
    )
