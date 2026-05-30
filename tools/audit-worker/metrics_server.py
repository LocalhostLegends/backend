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


def start_metrics_server(port: int = 8001) -> None:
    start_http_server(port)
    print(f"Audit worker metrics server started on port {port}")


def mark_worker_run() -> None:
    AUDIT_WORKER_LAST_RUN_TIMESTAMP.set(time.time())


def track_success() -> None:
    AUDIT_EVENTS_PROCESSED_TOTAL.inc()


def track_failure() -> None:
    AUDIT_EVENTS_FAILED_TOTAL.inc()


def track_suspicious_login() -> None:
    AUDIT_SUSPICIOUS_LOGIN_TOTAL.inc()


def track_geo_anomaly() -> None:
    AUDIT_GEO_ANOMALY_TOTAL.inc()