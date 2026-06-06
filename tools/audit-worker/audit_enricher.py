from typing import Any

from db import get_connection
from user_agents import parse  # type: ignore[import-untyped]


def parse_user_agent(
    user_agent: str | None,
) -> tuple[str | None, str | None, str | None]:
    if not user_agent or user_agent == "unknown":
        return None, None, None

    ua: Any = parse(user_agent)

    browser = ua.browser.family
    os_name = ua.os.family

    if ua.is_mobile:
        device_type = "mobile"
    elif ua.is_tablet:
        device_type = "tablet"
    elif ua.is_pc:
        device_type = "desktop"
    else:
        device_type = "other"

    return browser, os_name, device_type


def calculate_risk_score(
    event_type: str | None,
    ip: str | None,
    user_agent: str | None,
) -> tuple[int, bool]:
    score = 0

    if event_type == "auth.login.failed":
        score += 40

    if event_type == "auth.password.reset.request_failed":
        score += 30

    if not ip or ip == "unknown":
        score += 20

    if not user_agent or user_agent == "unknown":
        score += 20

    suspicious = score >= 50

    return score, suspicious


def enrich_pending_auth_events() -> int:
    query_select = """
        SELECT id, event_type, ip, user_agent
        FROM auth_audit_logs
        WHERE enrichment_status = 'pending'
        ORDER BY created_at ASC
        LIMIT 100
    """

    query_update = """
        UPDATE auth_audit_logs
        SET
            browser = %s,
            os = %s,
            device_type = %s,
            risk_score = %s,
            suspicious = %s,
            enrichment_status = 'completed'
        WHERE id = %s
    """

    updated_count = 0

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query_select)
            rows = cur.fetchall()

            for row in rows:
                event_id = row[0]
                event_type = row[1]
                ip = row[2]
                user_agent = row[3]

                browser, os_name, device_type = parse_user_agent(user_agent)
                risk_score, suspicious = calculate_risk_score(
                    event_type, ip, user_agent
                )

                cur.execute(
                    query_update,
                    (
                        browser,
                        os_name,
                        device_type,
                        risk_score,
                        suspicious,
                        event_id,
                    ),
                )

                updated_count += 1

    return updated_count
