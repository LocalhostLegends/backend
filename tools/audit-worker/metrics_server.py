import time
from prometheus_client import Counter, Gauge, Histogram, start_http_server


AUDIT_EVENTS_PROCESSED_TOTAL = Counter(
    "audit_events_processed_total",
    "Total number of successfully processed audit events",
)

AUDIT_EVENTS_FAILED_TOTAL = Counter(
    "audit_events_failed_total",
    "Total number of failed audit events",
)

AUDIT_SUSPICIOUS_LOGIN_TOTAL = Counter(
    "audit_suspicious_login_total",
    "Total number of suspicious login events detected",
)

AUDIT_GEO_ANOMALY_TOTAL = Counter(
    "audit_geo_anomaly_total",
    "Total number of geo anomaly events detected",
)

AUDIT_WORKER_LAST_RUN_TIMESTAMP = Gauge(
    "audit_worker_last_run_timestamp",
    "Unix timestamp of the last audit worker run",
)

AUDIT_WORKER_PROCESSING_DURATION_SECONDS = Histogram(
    "audit_worker_processing_duration_seconds",
    "Audit worker processing duration in seconds",
)

AUTH_LOGIN_SUCCESS_TOTAL = Counter(
    "auth_login_success_total",
    "Total number of successful login events",
)

AUTH_LOGIN_FAILED_TOTAL = Counter(
    "auth_login_failed_total",
    "Total number of failed login events",
)

AUTH_SUSPICIOUS_EVENTS_TOTAL = Counter(
    "auth_suspicious_events_total",
    "Total number of suspicious auth events",
)

AUTH_GEO_ANOMALY_TOTAL = Counter(
    "auth_geo_anomaly_total",
    "Total number of auth geo anomaly events",
)

AUTH_UNIQUE_IPS = Gauge(
    "auth_unique_ips",
    "Number of unique IP addresses in the current lookback window",
)

AUTH_EVENTS_IN_LOOKBACK = Gauge(
    "auth_events_in_lookback",
    "Number of auth events in the current lookback window",
)

AUTH_FAILED_LOGIN_IPS = Gauge(
    "auth_failed_login_ips",
    "Number of unique IP addresses with failed login events",
)

AUTH_SUSPICIOUS_USERS = Gauge(
    "auth_suspicious_users",
    "Number of unique users with suspicious auth events",
)

AUTH_BRUTEFORCE_IP_COUNT = Gauge(
    "auth_bruteforce_ip_count",
    "Number of IP addresses with brute force behavior in the current lookback window",
)

AUTH_CREDENTIAL_STUFFING_IP_COUNT = Gauge(
    "auth_credential_stuffing_ip_count",
    "Number of IP addresses with credential stuffing behavior in the current lookback window",
)

AUTH_GEO_ANOMALY_USER_COUNT = Gauge(
    "auth_geo_anomaly_user_count",
    "Number of users with geo anomaly behavior in the current lookback window",
)


def start_metrics_server(port: int = 8001) -> None:
    start_http_server(port)
    print(f"Audit worker metrics server started on port {port}")


def mark_worker_run() -> None:
    AUDIT_WORKER_LAST_RUN_TIMESTAMP.set(time.time())


def observe_processing_duration(duration_seconds: float) -> None:
    AUDIT_WORKER_PROCESSING_DURATION_SECONDS.observe(duration_seconds)


def track_success() -> None:
    AUDIT_EVENTS_PROCESSED_TOTAL.inc()


def track_failure() -> None:
    AUDIT_EVENTS_FAILED_TOTAL.inc()


def track_suspicious_login() -> None:
    AUDIT_SUSPICIOUS_LOGIN_TOTAL.inc()
    AUTH_SUSPICIOUS_EVENTS_TOTAL.inc()


def track_geo_anomaly() -> None:
    AUDIT_GEO_ANOMALY_TOTAL.inc()
    AUTH_GEO_ANOMALY_TOTAL.inc()


def track_login_success(count: int = 1) -> None:
    AUTH_LOGIN_SUCCESS_TOTAL.inc(count)


def track_login_failed(count: int = 1) -> None:
    AUTH_LOGIN_FAILED_TOTAL.inc(count)


def set_auth_events_in_lookback(count: int) -> None:
    AUTH_EVENTS_IN_LOOKBACK.set(count)


def set_unique_ips(count: int) -> None:
    AUTH_UNIQUE_IPS.set(count)


def set_failed_login_ips(count: int) -> None:
    AUTH_FAILED_LOGIN_IPS.set(count)


def set_suspicious_users(count: int) -> None:
    AUTH_SUSPICIOUS_USERS.set(count)


def set_bruteforce_ip_count(count: int) -> None:
    AUTH_BRUTEFORCE_IP_COUNT.set(count)


def set_credential_stuffing_ip_count(count: int) -> None:
    AUTH_CREDENTIAL_STUFFING_IP_COUNT.set(count)


def set_geo_anomaly_user_count(count: int) -> None:
    AUTH_GEO_ANOMALY_USER_COUNT.set(count)
