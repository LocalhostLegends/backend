from audit_reader import fetch_recent_auth_events

from metrics_server import (
    set_auth_events_in_lookback,
    set_unique_ips,
    set_failed_login_ips,
    set_suspicious_users,
    track_login_success,
    track_login_failed,
)


def analyze_security_events() -> None:
    events = fetch_recent_auth_events()

    set_auth_events_in_lookback(len(events))

    unique_ips = set()
    failed_login_ips = set()
    suspicious_users = set()

    success_count = 0
    failed_count = 0

    for event in events:
        ip = event.get("ip")
        user_id = event.get("user_id")

        if ip:
            unique_ips.add(ip)

        if event.get("success") is True:
            success_count += 1

        if event.get("success") is False:
            failed_count += 1

            if ip:
                failed_login_ips.add(ip)

        if event.get("suspicious") is True:
            if user_id:
                suspicious_users.add(str(user_id))

    set_unique_ips(len(unique_ips))
    set_failed_login_ips(len(failed_login_ips))
    set_suspicious_users(len(suspicious_users))

    if success_count:
        track_login_success(success_count)

    if failed_count:
        track_login_failed(failed_count)
