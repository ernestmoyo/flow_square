from celery import Celery
from celery.schedules import crontab

from app.config import settings

celery_app = Celery(
    "flowsquare",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=240,
    worker_prefetch_multiplier=1,
    task_routes={
        "app.workers.reconciliation_tasks.*": {"queue": "reconciliation"},
        "app.workers.alert_tasks.*": {"queue": "alerts"},
        "app.workers.report_tasks.*": {"queue": "reports"},
        "app.workers.telemetry_tasks.*": {"queue": "telemetry"},
    },
)

celery_app.conf.beat_schedule = {
    "daily-reconciliation": {
        "task": "app.workers.reconciliation_tasks.run_daily_reconciliation",
        "schedule": crontab(hour=2, minute=0),
    },
    "telemetry-health-check": {
        "task": "app.workers.telemetry_tasks.check_stale_tags",
        "schedule": crontab(minute="*/5"),
    },
    "monthly-compliance-report": {
        "task": "app.workers.report_tasks.generate_monthly_compliance",
        "schedule": crontab(day_of_month=1, hour=6, minute=0),
    },
}

celery_app.autodiscover_tasks([
    "app.workers.reconciliation_tasks",
    "app.workers.alert_tasks",
    "app.workers.report_tasks",
    "app.workers.telemetry_tasks",
])
