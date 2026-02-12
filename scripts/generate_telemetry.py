"""Generate simulated IoT telemetry stream for development."""

import asyncio
import math
import random
import uuid
from datetime import datetime, timedelta, timezone

from app.database import async_session_factory
from app.models.asset import Tag
from app.models.telemetry import TelemetryReading
from sqlalchemy import select


async def generate_historical_telemetry(days: int = 30) -> None:
    """Generate historical telemetry data for all tags."""
    print(f"Generating {days} days of historical telemetry...")

    async with async_session_factory() as session:
        result = await session.execute(select(Tag).where(Tag.deleted_at.is_(None)))
        tags = result.scalars().all()

        if not tags:
            print("No tags found. Run seed_demo_data.py first.")
            return

        now = datetime.now(timezone.utc)
        start = now - timedelta(days=days)
        interval = timedelta(minutes=5)
        total_points = 0

        for tag in tags:
            current = start
            base_value = _get_base_value(tag.unit)
            noise_scale = base_value * 0.02  # 2% noise

            batch = []
            while current <= now:
                # Simulate realistic sensor behavior
                value = _simulate_value(base_value, noise_scale, current, tag.unit)

                reading = TelemetryReading(
                    tag_id=tag.id,
                    time=current,
                    value=value,
                    quality="GOOD",
                    raw_value=value + random.gauss(0, noise_scale * 0.1),
                    source="edge",
                )
                batch.append(reading)
                total_points += 1

                if len(batch) >= 1000:
                    session.add_all(batch)
                    await session.flush()
                    batch = []

                current += interval

            if batch:
                session.add_all(batch)
                await session.flush()

            print(f"  Generated data for tag: {tag.name}")

        await session.commit()
        print(f"\nTotal telemetry points generated: {total_points:,}")


def _get_base_value(unit: str) -> float:
    """Get realistic base value for a given unit."""
    base_values = {
        "m³": 10000,
        "°C": 32,
        "L/min": 2500,
        "L": 50000000,
        "m³/h": 180,
        "bar": 25,
        "RPM": 3000,
    }
    return base_values.get(unit, 100)


def _simulate_value(base: float, noise: float, time: datetime, unit: str) -> float:
    """Simulate a realistic sensor value with patterns."""
    hour = time.hour
    day_of_week = time.weekday()

    # Diurnal pattern (higher during working hours)
    diurnal = 1.0 + 0.1 * math.sin(2 * math.pi * (hour - 6) / 24)

    # Weekend reduction
    weekend_factor = 0.85 if day_of_week >= 5 else 1.0

    # Random noise
    noise_val = random.gauss(0, noise)

    # Gradual drift (simulates sensor aging)
    days_elapsed = (time - datetime(2025, 1, 1, tzinfo=timezone.utc)).days
    drift = base * 0.0001 * days_elapsed

    value = base * diurnal * weekend_factor + noise_val + drift

    # Temperature has different behavior
    if unit == "°C":
        value = 28 + 8 * math.sin(2 * math.pi * (hour - 14) / 24) + random.gauss(0, 0.5)

    return max(0, value)


async def stream_live_telemetry(interval_seconds: float = 5.0) -> None:
    """Stream live telemetry data continuously."""
    print("Starting live telemetry stream (Ctrl+C to stop)...")

    async with async_session_factory() as session:
        result = await session.execute(select(Tag).where(Tag.deleted_at.is_(None)))
        tags = result.scalars().all()

        if not tags:
            print("No tags found.")
            return

        try:
            while True:
                now = datetime.now(timezone.utc)
                for tag in tags:
                    base = _get_base_value(tag.unit)
                    value = _simulate_value(base, base * 0.02, now, tag.unit)

                    reading = TelemetryReading(
                        tag_id=tag.id,
                        time=now,
                        value=value,
                        quality="GOOD",
                        source="edge",
                    )
                    session.add(reading)

                await session.commit()
                print(f"  Streamed {len(tags)} readings at {now.isoformat()}")
                await asyncio.sleep(interval_seconds)
        except KeyboardInterrupt:
            print("\nStopped live stream.")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "live":
        asyncio.run(stream_live_telemetry())
    else:
        asyncio.run(generate_historical_telemetry())
