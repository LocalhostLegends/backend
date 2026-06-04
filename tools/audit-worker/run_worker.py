import time

from metrics_server import (
    mark_worker_run,
    observe_processing_duration,
    start_metrics_server,
    track_failure,
    track_success,
)
from security_analyzer import analyze_security_events
from settings import get_settings


def run_once() -> None:
    start = time.perf_counter()

    try:
        analyze_security_events()
        track_success()
    except Exception as error:
        track_failure()
        print(f"Audit worker failed: {error}")
    finally:
        duration = time.perf_counter() - start
        observe_processing_duration(duration)
        mark_worker_run()


def main() -> None:
    settings = get_settings()

    start_metrics_server(settings.metrics_port)

    print("Audit worker started")
    print(f"Lookback window: {settings.lookback_minutes} minutes")

    while True:
        run_once()
        time.sleep(30)


if __name__ == "__main__":
    main()
