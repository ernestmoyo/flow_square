import asyncio

from app.workers.celery_app import celery_app
from app.core.logging import get_logger

logger = get_logger(__name__)


@celery_app.task(name="app.workers.alert_tasks.process_alert")
def process_alert(
    alert_type: str,
    asset_id: str | None = None,
    severity: str = "MEDIUM",
    details: dict | None = None,
) -> dict:
    return asyncio.get_event_loop().run_until_complete(
        _process_alert(alert_type, asset_id, severity, details)
    )


async def _process_alert(
    alert_type: str,
    asset_id: str | None,
    severity: str,
    details: dict | None,
) -> dict:
    from app.services.notifications import NotificationService

    notification_service = NotificationService()
    try:
        await notification_service.publish_alert(
            channel="alerts:global",
            payload={
                "type": alert_type,
                "asset_id": asset_id,
                "severity": severity,
                "details": details or {},
            },
        )
        logger.info("alert_processed", alert_type=alert_type, severity=severity)
        return {"status": "processed", "alert_type": alert_type}
    finally:
        await notification_service.close()


@celery_app.task(name="app.workers.alert_tasks.send_notification")
def send_notification(
    user_id: str,
    title: str,
    message: str,
    channel: str = "in_app",
) -> dict:
    logger.info(
        "notification_sent",
        user_id=user_id,
        title=title,
        channel=channel,
    )
    return {"status": "sent", "user_id": user_id, "channel": channel}
