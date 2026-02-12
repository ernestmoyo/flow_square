.PHONY: dev stop test test-backend test-frontend coverage migrate seed lint format clean

# Development
dev:
	docker compose up --build -d

stop:
	docker compose down

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

logs-worker:
	docker compose logs -f worker

# Database
migrate:
	docker compose exec api alembic upgrade head

migration:
	docker compose exec api alembic revision --autogenerate -m "$(msg)"

seed:
	docker compose exec api python -m scripts.seed_demo_data

# Testing
test: test-backend test-frontend

test-backend:
	docker compose exec api pytest -v --tb=short

test-frontend:
	cd frontend && npm run test

coverage:
	docker compose exec api pytest --cov=app --cov-report=html --cov-report=term-missing

# Code Quality
lint:
	cd backend && ruff check .
	cd frontend && npm run lint

format:
	cd backend && ruff format .
	cd frontend && npm run format

# Cleanup
clean:
	docker compose down -v --remove-orphans
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
