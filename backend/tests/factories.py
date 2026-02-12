"""Test data factories for generating test objects."""

from datetime import datetime, timezone
from uuid import uuid4

from app.models.user import User
from app.models.asset import Asset, System, Tag
from app.models.vessel import Vessel, BerthSchedule
from app.models.terminal import Terminal, Tank
from app.models.fleet import Vehicle, Trip, GeofenceZone
from app.models.incident import Incident
from app.models.reconciliation import ReconciliationRun, VarianceRecord
from app.core.security import hash_password


class UserFactory:
    @staticmethod
    def create(**kwargs) -> User:
        defaults = {
            "id": uuid4(),
            "email": f"user-{uuid4().hex[:8]}@test.com",
            "full_name": "Test User",
            "hashed_password": hash_password("testpass123"),
            "role": "control_room_operator",
            "is_active": True,
        }
        defaults.update(kwargs)
        return User(**defaults)


class AssetFactory:
    @staticmethod
    def create(**kwargs) -> Asset:
        defaults = {
            "id": uuid4(),
            "name": f"Asset-{uuid4().hex[:6]}",
            "asset_type": "terminal",
            "location": "Dar es Salaam",
            "latitude": -6.8,
            "longitude": 39.28,
        }
        defaults.update(kwargs)
        return Asset(**defaults)


class SystemFactory:
    @staticmethod
    def create(asset_id=None, **kwargs) -> System:
        defaults = {
            "id": uuid4(),
            "asset_id": asset_id or uuid4(),
            "name": f"System-{uuid4().hex[:6]}",
            "system_type": "metering",
        }
        defaults.update(kwargs)
        return System(**defaults)


class TagFactory:
    @staticmethod
    def create(system_id=None, **kwargs) -> Tag:
        defaults = {
            "id": uuid4(),
            "system_id": system_id or uuid4(),
            "name": f"TAG-{uuid4().hex[:6]}",
            "unit": "m\u00b3/h",
            "quality_flag": "GOOD",
        }
        defaults.update(kwargs)
        return Tag(**defaults)


class VesselFactory:
    @staticmethod
    def create(**kwargs) -> Vessel:
        defaults = {
            "id": uuid4(),
            "name": f"MT Test Vessel {uuid4().hex[:4]}",
            "imo_number": f"IMO{uuid4().hex[:7]}",
            "vessel_type": "tanker",
            "flag_state": "TZ",
            "dwt_tonnes": 50000.0,
            "status": "at_sea",
        }
        defaults.update(kwargs)
        return Vessel(**defaults)


class TerminalFactory:
    @staticmethod
    def create(**kwargs) -> Terminal:
        defaults = {
            "id": uuid4(),
            "name": f"Terminal-{uuid4().hex[:6]}",
            "terminal_type": "storage",
            "location": "Dar es Salaam",
            "latitude": -6.8,
            "longitude": 39.28,
        }
        defaults.update(kwargs)
        return Terminal(**defaults)


class TankFactory:
    @staticmethod
    def create(terminal_id=None, **kwargs) -> Tank:
        defaults = {
            "id": uuid4(),
            "terminal_id": terminal_id or uuid4(),
            "name": f"TK-{uuid4().hex[:4]}",
            "capacity_m3": 10000.0,
            "current_level_m3": 5000.0,
            "product": "PMS",
        }
        defaults.update(kwargs)
        return Tank(**defaults)


class VehicleFactory:
    @staticmethod
    def create(**kwargs) -> Vehicle:
        defaults = {
            "id": uuid4(),
            "plate_number": f"T{uuid4().hex[:3].upper()} {uuid4().hex[:3].upper()}",
            "vehicle_type": "tanker_truck",
            "capacity_litres": 45000.0,
            "status": "available",
        }
        defaults.update(kwargs)
        return Vehicle(**defaults)


class TripFactory:
    @staticmethod
    def create(vehicle_id=None, **kwargs) -> Trip:
        defaults = {
            "id": uuid4(),
            "vehicle_id": vehicle_id or uuid4(),
            "origin": "TIPER Terminal",
            "destination": "Puma Depot Dodoma",
            "planned_volume_litres": 45000.0,
            "status": "in_transit",
        }
        defaults.update(kwargs)
        return Trip(**defaults)


class GeofenceZoneFactory:
    @staticmethod
    def create(**kwargs) -> GeofenceZone:
        defaults = {
            "id": uuid4(),
            "name": f"Zone-{uuid4().hex[:6]}",
            "zone_type": "terminal",
            "center_lat": -6.8,
            "center_lng": 39.28,
            "radius_m": 500.0,
        }
        defaults.update(kwargs)
        return GeofenceZone(**defaults)


class IncidentFactory:
    @staticmethod
    def create(**kwargs) -> Incident:
        defaults = {
            "id": uuid4(),
            "title": f"Test Incident {uuid4().hex[:6]}",
            "incident_type": "variance_exception",
            "severity": "medium",
            "status": "open",
            "description": "Test incident for automated testing",
            "reported_by": "system",
        }
        defaults.update(kwargs)
        return Incident(**defaults)


class ReconciliationRunFactory:
    @staticmethod
    def create(**kwargs) -> ReconciliationRun:
        now = datetime.now(timezone.utc)
        defaults = {
            "id": uuid4(),
            "period_start": now,
            "period_end": now,
            "status": "completed",
            "total_variance_pct": 0.8,
        }
        defaults.update(kwargs)
        return ReconciliationRun(**defaults)
