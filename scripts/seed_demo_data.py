"""Seed script to populate FlowSquare with realistic Tanzanian oil & gas demo data."""

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from app.config import settings
from app.core.constants import (
    AssetType,
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
    QualityFlag,
    ReconciliationNode,
    ReconciliationStatus,
    SystemType,
    TripStatus,
    UserRole,
    VesselStatus,
)
from app.core.security import hash_password
from app.database import async_session_factory, engine
from app.models.base import Base
from app.models.asset import Asset, System, Tag
from app.models.compliance import AuditLog, ComplianceReport, CustodyTransfer
from app.models.fleet import EPod, GeofenceZone, Trip, Vehicle
from app.models.incident import Incident, SOPChecklist
from app.models.reconciliation import ReconciliationRun, VarianceRecord
from app.models.terminal import GantryBay, LoadingRack, Tank, Terminal
from app.models.user import User
from app.models.vessel import BerthSchedule, DemurrageRecord, Vessel


async def seed() -> None:
    now = datetime.now(timezone.utc)

    async with async_session_factory() as session:
        print("Seeding demo data...")

        # --- Users ---
        admin = User(
            email=settings.DEMO_ADMIN_EMAIL,
            hashed_password=hash_password(settings.DEMO_ADMIN_PASSWORD),
            full_name="Admin User",
            role=UserRole.ADMIN,
            department="IT",
        )
        control_room_user = User(
            email="control@flowsquare.io",
            hashed_password=hash_password("FlowSquare2025!"),
            full_name="John Mwangi",
            role=UserRole.CONTROL_ROOM,
            department="Operations",
        )
        hse_user = User(
            email="hse@flowsquare.io",
            hashed_password=hash_password("FlowSquare2025!"),
            full_name="Sarah Kimaro",
            role=UserRole.INTEGRITY_HSE,
            department="HSE",
        )
        finance_user = User(
            email="finance@flowsquare.io",
            hashed_password=hash_password("FlowSquare2025!"),
            full_name="Peter Massawe",
            role=UserRole.FINANCE_REGULATORY,
            department="Finance",
        )
        exec_user = User(
            email="exec@flowsquare.io",
            hashed_password=hash_password("FlowSquare2025!"),
            full_name="Grace Mushi",
            role=UserRole.EXECUTIVE,
            department="Management",
        )
        session.add_all([admin, control_room_user, hse_user, finance_user, exec_user])
        await session.flush()
        print(f"  Created {5} users")

        # --- Assets ---
        tiper = Asset(
            name="TIPER Terminal (Oryx)",
            asset_type=AssetType.TERMINAL,
            description="Tanzania International Petroleum Reserves — 307,810 m³ capacity with SPM access",
            location_lat=-6.8235,
            location_lon=39.2695,
            capacity_m3=307810,
        )
        puma = Asset(
            name="Puma Energy Kurasini Terminal",
            asset_type=AssetType.TERMINAL,
            description="90,000 m³ capacity, 5 tank farm sections",
            location_lat=-6.8380,
            location_lon=39.2830,
            capacity_m3=90000,
        )
        koj = Asset(
            name="KOJ (Kurasini Oil Jetties)",
            asset_type=AssetType.JETTY,
            description="2 berths for vessel operations",
            location_lat=-6.8350,
            location_lon=39.2810,
        )
        tazama = Asset(
            name="TAZAMA Pipeline",
            asset_type=AssetType.PIPELINE,
            description="1,710 km — Dar es Salaam to Ndola, Zambia",
            location_lat=-6.82,
            location_lon=39.27,
        )
        lake_oil = Asset(
            name="Lake Oil Fleet",
            asset_type=AssetType.VEHICLE,
            description="50 truck fleet for petroleum distribution",
            location_lat=-6.80,
            location_lon=39.28,
        )
        session.add_all([tiper, puma, koj, tazama, lake_oil])
        await session.flush()
        print(f"  Created {5} assets")

        # --- Systems & Tags for TIPER ---
        tank_farm_a = System(name="Tank Farm A", system_type=SystemType.TANK_FARM, asset_id=tiper.id)
        tank_farm_b = System(name="Tank Farm B", system_type=SystemType.TANK_FARM, asset_id=tiper.id)
        loading_rack_sys = System(name="Loading Rack 1", system_type=SystemType.LOADING_RACK, asset_id=tiper.id)
        metering_sys = System(name="Metering Station", system_type=SystemType.METERING, asset_id=tiper.id)
        session.add_all([tank_farm_a, tank_farm_b, loading_rack_sys, metering_sys])
        await session.flush()

        tags = [
            Tag(name="TK-101.LVL", unit="m³", low_limit=0, high_limit=15000, quality_flag=QualityFlag.GOOD, system_id=tank_farm_a.id),
            Tag(name="TK-102.LVL", unit="m³", low_limit=0, high_limit=15000, quality_flag=QualityFlag.GOOD, system_id=tank_farm_a.id),
            Tag(name="TK-103.TEMP", unit="°C", low_limit=15, high_limit=45, quality_flag=QualityFlag.GOOD, system_id=tank_farm_a.id),
            Tag(name="TK-201.LVL", unit="m³", low_limit=0, high_limit=20000, quality_flag=QualityFlag.GOOD, system_id=tank_farm_b.id),
            Tag(name="LR1.FLOW", unit="L/min", low_limit=0, high_limit=5000, quality_flag=QualityFlag.GOOD, system_id=loading_rack_sys.id),
            Tag(name="LR1.TOTALIZER", unit="L", low_limit=0, high_limit=99999999, quality_flag=QualityFlag.GOOD, system_id=loading_rack_sys.id),
            Tag(name="MS.FLOW.IN", unit="m³/h", low_limit=0, high_limit=500, quality_flag=QualityFlag.GOOD, system_id=metering_sys.id),
            Tag(name="MS.PRESSURE", unit="bar", low_limit=0, high_limit=50, quality_flag=QualityFlag.UNCERTAIN, system_id=metering_sys.id),
        ]
        session.add_all(tags)
        await session.flush()
        print(f"  Created {len(tags)} tags")

        # --- Pipeline Systems ---
        ps3 = System(name="Pump Station 3", system_type=SystemType.PUMP_STATION, asset_id=tazama.id)
        session.add(ps3)
        await session.flush()
        ps3_tags = [
            Tag(name="PS3.FLOW", unit="m³/h", low_limit=0, high_limit=300, quality_flag=QualityFlag.GOOD, system_id=ps3.id),
            Tag(name="PS3.PRESSURE", unit="bar", low_limit=0, high_limit=80, quality_flag=QualityFlag.GOOD, system_id=ps3.id),
        ]
        session.add_all(ps3_tags)

        # --- Terminals ---
        tiper_terminal = Terminal(name="TIPER Terminal", asset_id=tiper.id, location_lat=-6.8235, location_lon=39.2695, total_capacity_m3=307810)
        puma_terminal = Terminal(name="Puma Kurasini", asset_id=puma.id, location_lat=-6.8380, location_lon=39.2830, total_capacity_m3=90000)
        session.add_all([tiper_terminal, puma_terminal])
        await session.flush()

        tiper_tanks = [
            Tank(name="TK-101", terminal_id=tiper_terminal.id, capacity_m3=15000, current_level_m3=8500, product_type="AGO", tank_group="A"),
            Tank(name="TK-102", terminal_id=tiper_terminal.id, capacity_m3=15000, current_level_m3=12200, product_type="PMS", tank_group="A"),
            Tank(name="TK-103", terminal_id=tiper_terminal.id, capacity_m3=15000, current_level_m3=3800, product_type="AGO", tank_group="A"),
            Tank(name="TK-201", terminal_id=tiper_terminal.id, capacity_m3=20000, current_level_m3=17600, product_type="PMS", tank_group="B"),
            Tank(name="TK-202", terminal_id=tiper_terminal.id, capacity_m3=20000, current_level_m3=9400, product_type="JET-A1", tank_group="B"),
        ]
        session.add_all(tiper_tanks)

        rack1 = LoadingRack(name="Loading Rack 1", terminal_id=tiper_terminal.id, num_bays=4)
        session.add(rack1)
        await session.flush()

        bays = [
            GantryBay(name="Bay 1", loading_rack_id=rack1.id, status="LOADING"),
            GantryBay(name="Bay 2", loading_rack_id=rack1.id, status="AVAILABLE"),
            GantryBay(name="Bay 3", loading_rack_id=rack1.id, status="AVAILABLE"),
            GantryBay(name="Bay 4", loading_rack_id=rack1.id, status="MAINTENANCE"),
        ]
        session.add_all(bays)

        # --- Vessels ---
        vessel1 = Vessel(name="MT Pangani Star", imo_number="9876543", dwt=150000, flag="Liberia", vessel_type="Crude Tanker", status=VesselStatus.DISCHARGING)
        vessel2 = Vessel(name="MT Rufiji Wave", imo_number="9876544", dwt=85000, flag="Panama", vessel_type="Product Tanker", status=VesselStatus.APPROACHING)
        vessel3 = Vessel(name="MT Kilimanjaro Spirit", imo_number="9876545", dwt=120000, flag="Marshall Islands", vessel_type="Crude Tanker", status=VesselStatus.DEPARTED)
        session.add_all([vessel1, vessel2, vessel3])
        await session.flush()

        bs1 = BerthSchedule(vessel_id=vessel1.id, berth_name="SBM-1", eta=now - timedelta(hours=12), ata=now - timedelta(hours=10), cargo_type="Crude Oil", cargo_volume_m3=45000, bill_of_lading_volume_m3=45200, metered_volume_m3=44980)
        bs2 = BerthSchedule(vessel_id=vessel2.id, berth_name="KOJ Berth 1", eta=now + timedelta(hours=18), cargo_type="AGO", cargo_volume_m3=30000)
        session.add_all([bs1, bs2])

        dem1 = DemurrageRecord(vessel_id=vessel1.id, berth_schedule_id=bs1.id, laytime_hours_allowed=72, laytime_hours_used=84, demurrage_rate_usd_per_day=35000, total_demurrage_usd=17500)
        session.add(dem1)

        # --- Fleet ---
        vehicles = []
        for i in range(1, 51):
            v = Vehicle(
                registration_number=f"T {400+i:03d} DLT",
                asset_id=lake_oil.id,
                driver_name=f"Driver {i}",
                capacity_litres=36000,
                compartments=6,
                current_lat=-6.8 + (i * 0.02),
                current_lon=39.28 + (i * 0.015),
                last_gps_time=now - timedelta(minutes=i * 2),
                status="EN_ROUTE" if i <= 10 else "IDLE",
            )
            vehicles.append(v)
        session.add_all(vehicles)
        await session.flush()
        print(f"  Created {len(vehicles)} vehicles")

        # Active trips for first 10 trucks
        for i in range(10):
            trip = Trip(
                vehicle_id=vehicles[i].id,
                origin_terminal_id=tiper_terminal.id,
                destination_name=["Dodoma Depot", "Morogoro Station", "Iringa Depot", "Mwanza Terminal", "Arusha Depot", "Tabora Station", "Singida Depot", "Mbeya Depot", "Kigoma Station", "Tanga Depot"][i],
                status=TripStatus.EN_ROUTE,
                loaded_volume_litres=35500 + i * 100,
                gantry_metered_litres=35480 + i * 100,
                departure_time=now - timedelta(hours=3 + i),
                ticket_number=f"TKT-2025-{1000+i}",
            )
            session.add(trip)

        # --- Geofence Zones ---
        zones = [
            GeofenceZone(name="TIPER Terminal Zone", zone_type="TERMINAL", center_lat=-6.8235, center_lon=39.2695, radius_meters=800),
            GeofenceZone(name="Puma Kurasini Zone", zone_type="TERMINAL", center_lat=-6.8380, center_lon=39.2830, radius_meters=500),
            GeofenceZone(name="KOJ Zone", zone_type="TERMINAL", center_lat=-6.8350, center_lon=39.2810, radius_meters=400),
            GeofenceZone(name="Dodoma Depot Zone", zone_type="DEPOT", center_lat=-6.1630, center_lon=35.7516, radius_meters=300),
        ]
        session.add_all(zones)

        # --- Incidents ---
        inc1 = Incident(
            title="Pressure drop detected on TAZAMA Segment 4",
            incident_type=IncidentType.LEAK_ALARM,
            severity=IncidentSeverity.HIGH,
            status=IncidentStatus.IN_PROGRESS,
            description="ΔP threshold breach detected between PS3 and PS4",
            asset_id=tazama.id,
            location_lat=-5.5,
            location_lon=34.8,
            assigned_to_id=hse_user.id,
            detected_at=now - timedelta(hours=4),
            sla_deadline=now + timedelta(hours=20),
        )
        inc2 = Incident(
            title="Reconciliation exception: Vessel discharge variance 2.1%",
            incident_type=IncidentType.RECONCILIATION_EXCEPTION,
            severity=IncidentSeverity.MEDIUM,
            status=IncidentStatus.DETECTED,
            description="Bill of lading vs metered volume exceeds ±1.5% tolerance",
            asset_id=tiper.id,
            detected_at=now - timedelta(hours=2),
            sla_deadline=now + timedelta(hours=22),
        )
        session.add_all([inc1, inc2])
        await session.flush()

        # SOP Checklists
        sop_steps = [
            "Confirm alarm is not a false positive",
            "Isolate affected pipeline section",
            "Notify HSE team",
            "Dispatch field crew",
            "Document findings with photos",
        ]
        for i, step in enumerate(sop_steps, 1):
            session.add(SOPChecklist(incident_id=inc1.id, step_number=i, description=step, is_completed=i <= 2, completed_by_id=hse_user.id if i <= 2 else None, completed_at=now - timedelta(hours=3) if i <= 2 else None))

        # --- Reconciliation ---
        recon_run = ReconciliationRun(
            name="Daily Recon 2025-01-15",
            status=ReconciliationStatus.AUTO_CLOSED,
            run_type="DAILY",
            period_start=now - timedelta(days=1),
            period_end=now,
            total_expected_m3=45200,
            total_actual_m3=44980,
            total_variance_pct=0.49,
            tolerance_threshold_pct=1.5,
            completed_at=now,
            triggered_by_id=admin.id,
        )
        session.add(recon_run)
        await session.flush()

        vr1 = VarianceRecord(reconciliation_run_id=recon_run.id, node=ReconciliationNode.VESSEL_DISCHARGE, expected_volume_m3=45200, actual_volume_m3=44980, variance_m3=-220, variance_pct=0.49, is_exception=False)
        session.add(vr1)

        # --- Compliance ---
        report = ComplianceReport(
            title="Monthly Compliance Report - January 2025",
            report_type="MONTHLY_COMPLIANCE",
            period_start=now - timedelta(days=30),
            period_end=now,
            status="GENERATED",
            generated_by_id=admin.id,
            file_format="PDF",
            version=1,
        )
        session.add(report)

        # --- Audit Logs ---
        logs = [
            AuditLog(action="CREATE", resource_type="Incident", resource_id=str(inc1.id), user_id=None, details="Auto-created from leak alarm"),
            AuditLog(action="CREATE", resource_type="ReconciliationRun", resource_id=str(recon_run.id), user_id=admin.id, details="Daily reconciliation triggered"),
            AuditLog(action="UPDATE", resource_type="Tank", resource_id="TK-101", user_id=control_room_user.id, details="Level updated"),
        ]
        session.add_all(logs)

        # --- Custody Transfers ---
        ct = CustodyTransfer(
            batch_id="CTB-2025-0115-001",
            from_entity="MT Pangani Star",
            to_entity="TIPER Terminal",
            product_type="Crude Oil",
            volume_m3=44980,
            transfer_time=now - timedelta(hours=6),
            from_asset_id=koj.id,
            to_asset_id=tiper.id,
            measurement_method="Metered (Coriolis)",
            witness_name="John Mwangi",
        )
        session.add(ct)

        await session.commit()
        print("\nDemo data seeded successfully!")
        print(f"  Login: {settings.DEMO_ADMIN_EMAIL} / {settings.DEMO_ADMIN_PASSWORD}")
        print("  Roles: control@flowsquare.io, hse@flowsquare.io, finance@flowsquare.io, exec@flowsquare.io")


if __name__ == "__main__":
    asyncio.run(seed())
