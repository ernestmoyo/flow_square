# FlowSquare — Port-to-Pump Digital Platform

> Unified data automation for Tanzania's oil & gas value chain.
> From ship to pump — auto-reconciled, fraud-resistant, regulator-ready.

## The Problem

Tanzania's petroleum supply chain handles 6M+ metric tons annually through
a single dominant port, yet relies on fragmented manual systems for
reconciliation, compliance, and fleet management — resulting in up to 1%
product shrinkage, costly demurrage, and regulatory gaps.

## The Solution

FlowSquare provides a **Unified Data Layer** that connects every node of the
value chain — vessel discharge, terminal storage, truck loading, and last-mile
delivery — into a single, real-time intelligence platform.

### Key Capabilities
- **Auto-Reconciliation:** Ship → Tank → Truck → Delivery with exception-only operations
- **Anti-Fraud Engine:** Detects short-loading, ghost trips, meter tampering, off-route deliveries
- **6 Analytics Data Products:** UFG Index, Leak Probability, Meter Drift, Fraud Score, Integrity Health, Predictive Maintenance
- **4 Role-Based Dashboards:** Control Room, Integrity/HSE, Finance/Regulatory, Executive
- **Regulatory Compliance:** One-click BPS/WMA reports, custody trails, audit-complete packs
- **Self-Healing Telemetry:** Edge buffering, auto-resync, noisy sensor suppression

## Quick Start

### Prerequisites
- Docker & Docker Compose v2+
- Node.js 20+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

### One-Command Launch
```bash
git clone https://github.com/flowsquare/platform.git
cd platform
cp .env.example .env
make dev          # Spins up all services
make seed         # Load demo data (TIPER, Puma, Lake Oil scenarios)
```

Open http://localhost:3000 — login with demo credentials shown in terminal.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLOWSQUARE PLATFORM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Port/TPA │  │  SCADA   │  │   ERP    │  │  Fleet   │       │
│  │  Data    │  │  / TAS   │  │ Systems  │  │Telematics│       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │              │              │              │             │
│       └──────────────┴──────┬───────┴──────────────┘             │
│                             │                                    │
│                    ┌────────▼────────┐                           │
│                    │ INGESTION LAYER │  (Edge Gateways, MQTT,    │
│                    │  + Normaliser   │   REST Adapters, CSV)     │
│                    └────────┬────────┘                           │
│                             │                                    │
│                    ┌────────▼────────┐                           │
│                    │ UNIFIED DATA    │  Asset > System > Tag     │
│                    │    LAYER        │  Quality: GOOD/BAD/UNCERTAIN│
│                    │ (TimescaleDB +  │  Units, Limits, Calibration│
│                    │   PostGIS)      │                           │
│                    └────────┬────────┘                           │
│                             │                                    │
│              ┌──────────────┼──────────────┐                    │
│              │              │              │                     │
│     ┌────────▼──────┐ ┌────▼─────┐ ┌──────▼───────┐           │
│     │  ANALYTICS    │ │ AUTOMATION│ │  COMPLIANCE  │           │
│     │  ENGINE       │ │  ENGINE   │ │   ENGINE     │           │
│     └────────┬──────┘ └────┬─────┘ └──────┬───────┘           │
│              │              │              │                     │
│              └──────────────┼──────────────┘                    │
│                             │                                    │
│                    ┌────────▼────────┐                           │
│                    │  ROLE-BASED     │                           │
│                    │  DASHBOARDS     │                           │
│                    └─────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
flowsquare/
├── backend/          # FastAPI + SQLAlchemy + Celery
│   ├── app/
│   │   ├── api/      # Route modules (v1)
│   │   ├── models/   # SQLAlchemy ORM models
│   │   ├── schemas/  # Pydantic v2 schemas
│   │   ├── services/ # Business logic layer
│   │   ├── workers/  # Celery tasks
│   │   ├── core/     # Security, RBAC, logging
│   │   └── utils/    # Unit conversion, geofence, tolerance
│   └── tests/
├── frontend/         # React 18 + TypeScript + Vite
│   └── src/
│       ├── components/  # UI, layout, maps, charts, tables
│       ├── pages/       # Role-based dashboards & modules
│       ├── stores/      # Zustand state management
│       └── hooks/       # Custom React hooks
├── scripts/          # Seed data & telemetry generators
├── docs/             # Architecture & API documentation
└── infra/            # Terraform & K8s (Phase 2)
```

## Development

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Testing
```bash
make test           # Run all tests
make test-backend   # Backend only
make test-frontend  # Frontend only
make coverage       # Generate coverage report
```

## Target KPIs

| Metric | Target |
|--------|--------|
| Ship→Tank→Truck variance | ±1.5% (pilot) → ±0.5% |
| UFG reduction | 30-60% within 6-9 months |
| Fraud detection | ≥90% reduction in ghost/duplicate tickets |
| MTTD for integrity events | ≤10 minutes |
| Manual reconciliation reduction | 50-70% |
| Compliance report timeliness | 100% on-time |

## Roadmap
- [ ] Phase 1: Core platform + reconciliation engine
- [ ] Phase 2: AI berth scheduler + digital twin
- [ ] Phase 3: Predictive maintenance ML models
- [ ] Phase 4: Regional expansion (Kenya, Zambia, DRC)

## Tanzania Market Context

Built for Tanzania's oil & gas ecosystem — designed for integration with
EWURA regulatory requirements, BPS/PBPA bulk procurement system, and
partnership with local system integrators.

## License

Proprietary — FlowSquare © 2025
