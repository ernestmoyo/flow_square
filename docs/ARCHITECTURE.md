# FlowSquare Architecture

## System Overview

FlowSquare is a full-stack Oil & Gas Value Chain Data Automation Platform built to unify Tanzania's petroleum supply chain data from port to pump.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  React 18 + TypeScript + Vite + Tailwind + shadcn/ui         │
│  Recharts | Leaflet Maps | WebSocket Client | Zustand        │
└───────────────┬──────────────────────────────┬───────────────┘
                │ REST API                      │ WebSocket
┌───────────────┴──────────────────────────────┴───────────────┐
│                     API Gateway (FastAPI)                      │
│  JWT Auth | RBAC Middleware | Rate Limiting | CORS            │
├──────────────────────────────────────────────────────────────┤
│                      Service Layer                            │
│  AuthService | AssetService | TelemetryService                │
│  ReconciliationService | FleetService | AnalyticsProducts     │
├──────────────────────────────────────────────────────────────┤
│                      Data Layer                               │
│  SQLAlchemy 2.0 (Async) | Alembic Migrations                │
├──────────┬───────────────┬───────────────┬───────────────────┤
│ PostgreSQL│  TimescaleDB  │    Redis      │     Celery        │
│  16 + ltree│  (Hypertables)│  (Cache/PubSub)│  (Task Queue)   │
└──────────┴───────────────┴───────────────┴───────────────────┘
```

## Backend Architecture

### Layer Pattern

```
Routes (API) → Services (Business Logic) → Models (ORM) → Database
```

- **Routes**: Handle HTTP concerns, request validation, response formatting
- **Services**: Business logic, orchestration, side effects
- **Models**: SQLAlchemy ORM with UUID primary keys, soft deletes
- **Schemas**: Pydantic v2 models for request/response validation

### Key Design Decisions

1. **Async-First**: All database operations use SQLAlchemy async sessions
2. **Dependency Injection**: FastAPI's Depends() for DB sessions, auth, RBAC
3. **Soft Deletes**: Records use `deleted_at` timestamps instead of hard deletes
4. **TimescaleDB Hypertables**: Telemetry data uses time-partitioned tables for query performance
5. **RBAC**: Role-based access control with 7 predefined roles and permission matrices
6. **Response Envelope**: All API responses use `{data, meta, errors}` format

### Reconciliation Engine

The reconciliation service is the core business logic:

```
Ship Discharge → Tank Receipt → Gantry Loading → Delivery ePOD
```

Each node's volume is compared against the next with configurable tolerance:
- Pilot: ±1.5%
- Target (6-9 months): ±0.5%

Exceptions trigger incidents and anti-fraud checks.

### Analytics Data Products

Six pluggable analytics modules:
1. **UFG Index**: Unaccounted-For-Gas calculation
2. **Leak Probability**: Segment-level leak scoring
3. **Meter Drift**: Instrument drift detection
4. **Fraud Score**: Multi-signal fraud detection
5. **Integrity Health**: Asset integrity scoring
6. **Predictive Maintenance**: RUL estimation

### Background Tasks (Celery)

| Task | Schedule | Queue |
|------|----------|-------|
| Daily Reconciliation | 2:00 AM UTC | reconciliation |
| Stale Tag Detection | Every 5 minutes | telemetry |
| Monthly Compliance | 1st of month | reports |

## Frontend Architecture

### State Management

- **Zustand**: Lightweight stores for auth, telemetry, notifications
- **React Query (via hooks)**: Data fetching with auto-refresh

### Route Structure

```
/login
/dashboards/control-room
/dashboards/integrity-hse
/dashboards/finance-regulatory
/dashboards/executive
/vessels/list, /vessels/berth-scheduler
/terminals/inventory, /terminals/loading
/fleet/overview, /fleet/trips, /fleet/epod
/analytics/ufg, /analytics/leaks, /analytics/fraud, /analytics/maintenance
/reconciliation
/compliance/reports, /compliance/audit-trail
/settings/assets, /settings/users, /settings/tolerances
```

### Real-Time Updates

WebSocket connections provide:
- Live telemetry readings (per asset)
- Global alert notifications
- Fleet vehicle tracking

## Database Schema

### Key Tables

- **users**: Authentication and roles
- **assets → systems → tags**: Three-level asset hierarchy
- **telemetry_readings**: TimescaleDB hypertable (tag_id + time composite PK)
- **vessels, berth_schedules, demurrage_records**: Marine operations
- **terminals, tanks, loading_racks, gantry_bays**: Terminal operations
- **vehicles, trips, epods, geofence_zones**: Fleet management
- **incidents, sop_checklists, evidence_attachments**: Incident management
- **reconciliation_runs, variance_records**: Reconciliation data
- **compliance_reports, audit_logs, custody_transfers**: Compliance

## Deployment

### Development
```bash
docker compose up -d
```

### Production
```bash
docker compose -f docker-compose.prod.yml up -d
```

Services: PostgreSQL + TimescaleDB, Redis, FastAPI (Gunicorn), Celery Worker, Celery Beat, React (Nginx)
