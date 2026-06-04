from datetime import datetime, timedelta, timezone
from typing import Any

from db import get_connection
from settings import get_settings


def fetch_recent_auth_events() -> list[dict[str, Any]]:
    settings = get_settings()
    since = datetime.now(timezone.utc) - timedelta(minutes=settings.lookback_minutes)

    query = """
        SELECT
            id,
            event_type,
            user_id,
            email_attempted,
            ip,
            user_agent,
            request_id,
            method,
            path,
            success,
            failure_reason,
            enrichment_status,
            risk_score,
            suspicious,
            country,
            city,
            browser,
            os,
            device_type,
            created_at
        FROM auth_audit_logs
        WHERE created_at >= %s
        ORDER BY created_at DESC
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (since,))
            rows = cur.fetchall()

    return [
        {
            "id": row[0],
            "event_type": row[1],
            "user_id": row[2],
            "email_attempted": row[3],
            "ip": row[4],
            "user_agent": row[5],
            "request_id": row[6],
            "method": row[7],
            "path": row[8],
            "success": row[9],
            "failure_reason": row[10],
            "enrichment_status": row[11],
            "risk_score": row[12],
            "suspicious": row[13],
            "country": row[14],
            "city": row[15],
            "browser": row[16],
            "os": row[17],
            "device_type": row[18],
            "created_at": row[19],
        }
        for row in rows
    ]
