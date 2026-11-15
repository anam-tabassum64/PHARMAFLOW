# =================================================================
# Production Dockerfile for PharmaFlow FastAPI Service
# Stage: Pinned lightweight Python image with non-root security
# =================================================================
FROM python:3.10-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install minimal runtime & build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Reproducible pip install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app/ ./app
COPY alembic/ ./alembic
COPY alembic.ini .

# Create and switch to unprivileged user
RUN groupadd -g 1000 appgroup && \
    useradd -u 1000 -g appgroup -s /bin/sh -m appuser && \
    chown -R appuser:appgroup /app

USER appuser

# Internal application port only
EXPOSE 8000

# Container liveness health check
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
