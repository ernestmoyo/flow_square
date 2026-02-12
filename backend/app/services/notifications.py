import json

from app.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class NotificationService:
    def __init__(self) -> None:
        self.redis = None
        if settings.REDIS_ENABLED:
            import redis.asyncio as aioredis

            self.redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

    async def publish_alert(self, channel: str, payload: dict) -> None:
        if self.redis is None:
            logger.debug("redis_disabled_skip_publish", channel=channel)
            return
        await self.redis.publish(channel, json.dumps(payload))
        logger.info("alert_published", channel=channel)

    async def publish_telemetry_update(
        self, asset_id: str, tag_id: str, value: float, quality: str
    ) -> None:
        payload = {
            "type": "telemetry_update",
            "asset_id": asset_id,
            "tag_id": tag_id,
            "value": value,
            "quality": quality,
        }
        await self.publish_alert(f"telemetry:{asset_id}", payload)

    async def publish_incident_alert(
        self, incident_id: str, title: str, severity: str
    ) -> None:
        payload = {
            "type": "incident_alert",
            "incident_id": incident_id,
            "title": title,
            "severity": severity,
        }
        await self.publish_alert("alerts:global", payload)

    async def close(self) -> None:
        if self.redis:
            await self.redis.close()
