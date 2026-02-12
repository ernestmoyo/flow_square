# FlowSquare Deployment Guide

## Prerequisites

- Docker 24+ and Docker Compose v2
- 4GB+ RAM (8GB recommended for production)
- PostgreSQL 16 with TimescaleDB extension
- Redis 7+

## Quick Start (Development)

```bash
# Clone and configure
cp .env.example .env
# Edit .env with your settings

# Start all services
make dev
# or: docker compose up -d

# Run database migrations
make migrate
# or: docker compose exec api alembic upgrade head

# Seed demo data
make seed
# or: docker compose exec api python -m scripts.seed_demo_data
```

## Production Deployment

### Environment Variables

Set all variables in `.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| POSTGRES_HOST | Database host | db |
| POSTGRES_PORT | Database port | 5432 |
| POSTGRES_USER | Database user | flowsquare |
| POSTGRES_PASSWORD | Database password | (secure password) |
| POSTGRES_DB | Database name | flowsquare |
| REDIS_URL | Redis connection | redis://redis:6379/0 |
| JWT_SECRET_KEY | JWT signing key | (random 64-char string) |
| JWT_ALGORITHM | JWT algorithm | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token TTL | 30 |
| CORS_ORIGINS | Allowed origins | https://flowsquare.example.com |

### Docker Compose Production

```bash
docker compose -f docker-compose.prod.yml up -d
```

This runs:
- PostgreSQL + TimescaleDB with persistent volume
- Redis with persistent volume
- FastAPI behind Gunicorn (4 workers)
- Celery Worker for async tasks
- Celery Beat for scheduled tasks
- React app behind Nginx with API proxy

### Database Migrations

```bash
# Create a new migration
docker compose exec api alembic revision --autogenerate -m "description"

# Apply migrations
docker compose exec api alembic upgrade head

# Rollback one step
docker compose exec api alembic downgrade -1
```

### Health Checks

- API: `GET /health` → `{"status": "healthy"}`
- API Ready: `GET /ready` → `{"status": "ready", "database": "ok", "redis": "ok"}`

### Monitoring

- Application logs: `docker compose logs -f api`
- Worker logs: `docker compose logs -f worker`
- Beat schedule: `docker compose logs -f beat`

### Backup

```bash
# Database backup
docker compose exec db pg_dump -U flowsquare flowsquare > backup.sql

# Restore
docker compose exec -T db psql -U flowsquare flowsquare < backup.sql
```

### SSL/TLS

For production, place an Nginx reverse proxy or load balancer in front with SSL termination. Update `CORS_ORIGINS` accordingly.

## Scaling

- **API**: Increase Gunicorn workers or run multiple API containers
- **Workers**: Scale Celery workers: `docker compose up -d --scale worker=3`
- **Database**: Consider read replicas for heavy query workloads
- **Redis**: Use Redis Cluster for high availability

## Troubleshooting

| Issue | Solution |
|-------|----------|
| DB connection refused | Check POSTGRES_HOST and ensure db container is healthy |
| Redis connection error | Verify REDIS_URL and redis container status |
| Migration conflicts | Run `alembic history` and resolve branches |
| Worker not processing | Check Celery logs and Redis connectivity |
| CORS errors | Verify CORS_ORIGINS includes your frontend URL |
