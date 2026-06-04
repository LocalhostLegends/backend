import psycopg

from settings import get_settings


def get_connection():
    settings = get_settings()

    return psycopg.connect(
        settings.database_url,
        autocommit=True,
    )
