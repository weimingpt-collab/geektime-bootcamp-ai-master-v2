.PHONY: backend frontend dev install-backend install-frontend install clean help

# Default target
help:
	@echo "GenSlides Development Commands"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  dev              Run both backend and frontend (requires two terminals or background)"
	@echo "  backend          Run backend server (FastAPI + uvicorn)"
	@echo "  frontend         Run frontend dev server (Vite)"
	@echo "  install          Install all dependencies"
	@echo "  install-backend  Install backend dependencies (uv)"
	@echo "  install-frontend Install frontend dependencies (npm)"
	@echo "  clean            Clean build artifacts"
	@echo ""

# Run backend (FastAPI with uvicorn)
backend:
	cd backend && uv run python main.py

# Run frontend (Vite dev server)
frontend:
	cd frontend && npm run dev

# Run both backend and frontend concurrently
# This runs backend in background and frontend in foreground
dev:
	@echo "Starting backend and frontend..."
	@trap 'kill %1 2>/dev/null' EXIT; \
	cd backend && uv run python main.py & \
	cd frontend && npm run dev

# Install all dependencies
install: install-backend install-frontend

# Install backend dependencies
install-backend:
	cd backend && uv sync

# Install frontend dependencies
install-frontend:
	cd frontend && npm install

# Clean build artifacts
clean:
	rm -rf frontend/dist
	rm -rf backend/__pycache__
	find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
