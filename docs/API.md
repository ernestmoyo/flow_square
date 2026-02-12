# FlowSquare API Documentation

## Base URL

```
/api/v1
```

## Authentication

All endpoints (except login) require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Login
```
POST /auth/login
Body: { "email": "string", "password": "string" }
Response: { "data": { "access_token": "...", "refresh_token": "...", "token_type": "bearer" } }
```

### Refresh Token
```
POST /auth/refresh
Body: { "refresh_token": "string" }
Response: { "data": { "access_token": "...", "refresh_token": "...", "token_type": "bearer" } }
```

### Get Current User
```
GET /auth/me
Response: { "data": { "id": "uuid", "email": "...", "full_name": "...", "role": "..." } }
```

## Response Envelope

All responses follow the envelope format:

```json
{
  "data": { ... },
  "meta": { "page": 1, "per_page": 50, "total": 100 },
  "errors": []
}
```

## Endpoints

### Assets

| Method | Path | Description |
|--------|------|-------------|
| GET | /assets/ | List assets (paginated) |
| POST | /assets/ | Create asset |
| GET | /assets/{id} | Get asset by ID |
| PATCH | /assets/{id} | Update asset |
| DELETE | /assets/{id} | Soft-delete asset |
| POST | /assets/{id}/systems | Add system to asset |
| POST | /assets/systems/{id}/tags | Add tag to system |
| GET | /assets/tags/search?q= | Search tags by name |

### Telemetry

| Method | Path | Description |
|--------|------|-------------|
| POST | /telemetry/ingest | Batch ingest readings (max 10,000) |
| GET | /telemetry/query | Query readings (tag_id, hours, downsample) |
| GET | /telemetry/latest/{tag_id} | Get latest reading for tag |

### Vessels

| Method | Path | Description |
|--------|------|-------------|
| GET | /vessels/ | List vessels |
| POST | /vessels/ | Create vessel |
| GET | /vessels/{id} | Get vessel |
| PATCH | /vessels/{id} | Update vessel |
| DELETE | /vessels/{id} | Delete vessel |
| GET | /vessels/{id}/berth-schedules | List berth schedules |
| POST | /vessels/{id}/berth-schedules | Create berth schedule |
| GET | /vessels/{id}/demurrage | List demurrage records |

### Terminals

| Method | Path | Description |
|--------|------|-------------|
| GET | /terminals/ | List terminals |
| POST | /terminals/ | Create terminal |
| GET | /terminals/{id} | Get terminal |
| PATCH | /terminals/{id} | Update terminal |
| DELETE | /terminals/{id} | Delete terminal |
| GET | /terminals/{id}/tanks | List tanks |
| POST | /terminals/{id}/tanks | Create tank |
| GET | /terminals/{id}/loading-racks | List loading racks |
| GET | /terminals/{id}/gantry-bays | List gantry bays |

### Fleet

| Method | Path | Description |
|--------|------|-------------|
| GET | /fleet/vehicles | List vehicles |
| POST | /fleet/vehicles | Create vehicle |
| GET | /fleet/vehicles/{id} | Get vehicle |
| PATCH | /fleet/vehicles/{id} | Update vehicle |
| GET | /fleet/trips | List trips |
| POST | /fleet/trips | Create trip |
| GET | /fleet/trips/{id} | Get trip |
| PATCH | /fleet/trips/{id} | Update trip |
| POST | /fleet/trips/{id}/epod | Submit ePOD |
| GET | /fleet/geofences | List geofence zones |
| POST | /fleet/geofences | Create geofence zone |

### Incidents

| Method | Path | Description |
|--------|------|-------------|
| GET | /incidents/ | List incidents |
| POST | /incidents/ | Create incident |
| GET | /incidents/{id} | Get incident |
| PATCH | /incidents/{id} | Update incident |
| GET | /incidents/{id}/sop | Get SOP checklist |
| PATCH | /incidents/{id}/sop/{step}/complete | Complete SOP step |
| POST | /incidents/{id}/evidence | Add evidence |

### Reconciliation

| Method | Path | Description |
|--------|------|-------------|
| GET | /reconciliation/runs | List reconciliation runs |
| GET | /reconciliation/runs/{id} | Get run details |
| POST | /reconciliation/trigger | Trigger reconciliation |
| GET | /reconciliation/runs/{id}/variances | List variances |

### Compliance

| Method | Path | Description |
|--------|------|-------------|
| GET | /compliance/reports | List reports |
| POST | /compliance/reports | Generate report |
| GET | /compliance/reports/{id} | Get report |
| GET | /compliance/audit-logs | Get audit trail |
| GET | /compliance/custody-transfers | List custody transfers |
| POST | /compliance/custody-transfers | Record custody transfer |

### Analytics

| Method | Path | Description |
|--------|------|-------------|
| GET | /analytics/ufg-index | UFG index analysis |
| GET | /analytics/leak-probability | Leak probability scores |
| GET | /analytics/meter-drift | Meter drift detection |
| GET | /analytics/fraud-score | Fraud detection scores |
| GET | /analytics/integrity-health | Integrity health index |
| GET | /analytics/predictive-maintenance | Predictive maintenance |

### WebSocket Endpoints

| Path | Description |
|------|-------------|
| /ws/telemetry/{asset_id} | Real-time telemetry stream |
| /ws/alerts | Global alert notifications |
| /ws/fleet/{vehicle_id} | Vehicle tracking stream |

## Roles

| Role | Description |
|------|-------------|
| platform_admin | Full system access |
| control_room_operator | Operational monitoring |
| integrity_engineer | Integrity and HSE |
| finance_analyst | Financial and regulatory |
| terminal_supervisor | Terminal operations |
| fleet_coordinator | Fleet management |
| executive | Executive dashboards |

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (role insufficient) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 422 | Validation Error |
| 500 | Internal Server Error |
