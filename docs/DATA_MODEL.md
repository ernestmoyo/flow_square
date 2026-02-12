# FlowSquare Data Model

## Entity Relationship Overview

```
Users
  └── (audits via audit_logs)

Assets ──────────── Systems ──────────── Tags
  │                                        │
  │                                        └── TelemetryReadings
  │                                             (TimescaleDB hypertable)
  │
  ├── Terminals ──── Tanks
  │              ├── LoadingRacks
  │              └── GantryBays
  │
  ├── Vessels ────── BerthSchedules
  │              └── DemurrageRecords
  │
  └── (linked via reconciliation)

Vehicles ─────────── Trips ──────────── EPods
                       │
                       └── (route: JSONB)

GeofenceZones (standalone)

Incidents ──────── SOPChecklists
              └── EvidenceAttachments

ReconciliationRuns ── VarianceRecords
                       └── (fraud_checks: JSONB)

ComplianceReports
AuditLogs
CustodyTransfers
```

## Core Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| email | VARCHAR (unique) | Login email |
| full_name | VARCHAR | Display name |
| hashed_password | VARCHAR | Bcrypt hash |
| role | VARCHAR | RBAC role |
| is_active | BOOLEAN | Account status |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-updated |

### assets
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | VARCHAR | Asset name |
| asset_type | VARCHAR | terminal, pipeline, depot, port, refinery |
| location | VARCHAR | Location description |
| latitude | FLOAT | GPS latitude |
| longitude | FLOAT | GPS longitude |
| metadata | JSONB | Extended attributes |
| created_at | TIMESTAMPTZ | Auto-set |
| deleted_at | TIMESTAMPTZ | Soft delete |

### systems
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| asset_id | UUID (FK) | Parent asset |
| name | VARCHAR | System name |
| system_type | VARCHAR | metering, pumping, storage, safety, electrical |
| deleted_at | TIMESTAMPTZ | Soft delete |

### tags
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| system_id | UUID (FK) | Parent system |
| name | VARCHAR | Tag identifier (e.g., FT-001) |
| unit | VARCHAR | Engineering unit |
| quality_flag | VARCHAR | GOOD, BAD, UNCERTAIN |
| deleted_at | TIMESTAMPTZ | Soft delete |

### telemetry_readings (TimescaleDB hypertable)
| Column | Type | Description |
|--------|------|-------------|
| tag_id | UUID (FK, PK) | Tag reference |
| time | TIMESTAMPTZ (PK) | Reading timestamp |
| value | FLOAT | Processed value |
| quality | VARCHAR | Quality flag |
| raw_value | FLOAT | Unprocessed value |
| source | VARCHAR | edge, scada, manual |

### vessels
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| name | VARCHAR | Vessel name |
| imo_number | VARCHAR (unique) | IMO identifier |
| vessel_type | VARCHAR | tanker, barge, etc. |
| flag_state | VARCHAR | Country code |
| dwt_tonnes | FLOAT | Deadweight tonnage |
| status | VARCHAR | at_sea, berthed, loading, departed |

### reconciliation_runs
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| period_start | TIMESTAMPTZ | Period start |
| period_end | TIMESTAMPTZ | Period end |
| status | VARCHAR | pending, running, completed, failed |
| total_variance_pct | FLOAT | Overall variance |
| created_at | TIMESTAMPTZ | Auto-set |

### variance_records
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Primary key |
| run_id | UUID (FK) | Parent run |
| node | VARCHAR | vessel_discharge, tank_receipt, gantry_loading, delivery_epod |
| expected_volume | FLOAT | Expected volume |
| actual_volume | FLOAT | Measured volume |
| variance_pct | FLOAT | Percentage difference |
| within_tolerance | BOOLEAN | Within threshold |
| fraud_checks | JSONB | Anti-fraud results |

## TimescaleDB Configuration

The `telemetry_readings` table uses TimescaleDB hypertables:

```sql
SELECT create_hypertable('telemetry_readings', 'time');
```

This enables:
- Automatic time-based partitioning
- `time_bucket()` aggregate functions for downsampling
- Compression policies for old data
- Continuous aggregates for dashboards

## Indexing Strategy

- UUID primary keys on all tables
- Composite PK (tag_id, time) on telemetry_readings
- B-tree indexes on foreign keys
- GiST indexes on JSONB columns (for fraud_checks queries)
- Partial indexes on `deleted_at IS NULL` for soft-delete queries
