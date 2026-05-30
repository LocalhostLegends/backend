import time

from metrics_server import (
    AUDIT_WORKER_PROCESSING_DURATION_SECONDS,
    mark_worker_run,
    start_metrics_server,
    track_failure,
    track_geo_anomaly,
    track_success,
    track_suspicious_login,
)


def main() -> None:
    start_metrics_server(port=8001)

    while True:
        with AUDIT_WORKER_PROCESSING_DURATION_SECONDS.time():
            mark_worker_run()
            track_success()

            # Temporary demo metrics for local Grafana/Prometheus testing
            track_suspicious_login()
            track_geo_anomaly()

        time.sleep(10)


if __name__ == "__main__":
    main()