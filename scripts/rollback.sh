#!/usr/bin/env bash
# ==============================================================================
# PHARMAFLOW – Automated Container Deployment Rollback Script
# Algions AI Labs Private Limited – Resilience Engineering
# ==============================================================================

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/pharmaflow}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
HISTORY_FILE="${DEPLOY_DIR}/.deployment_history"
ROLLBACK_TAG="${1:-}"

cd "${DEPLOY_DIR}"

if [ -z "${ROLLBACK_TAG}" ]; then
    if [ -f "${HISTORY_FILE}" ] && [ "$(wc -l < "${HISTORY_FILE}")" -ge 2 ]; then
        # Pick the second-to-last deployed tag
        ROLLBACK_TAG="$(tail -n 2 "${HISTORY_FILE}" | head -n 1)"
        echo "[INFO] No tag specified. Auto-detected previous stable tag from history: ${ROLLBACK_TAG}"
    else
        echo "ERROR: No previous version found in history. Please specify target tag explicitly:" >&2
        echo "Usage: $0 <target-image-tag>" >&2
        exit 1
    fi
fi

echo "=============================================================================="
echo "Initiating emergency rollback to image tag: ${ROLLBACK_TAG}"
echo "Working directory: ${DEPLOY_DIR}"
echo "=============================================================================="

export IMAGE_TAG="${ROLLBACK_TAG}"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Pulling rollback images from GHCR..."
docker compose -f "${COMPOSE_FILE}" pull backend frontend

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Restarting services with rollback tag..."
docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Validating health of rolled-back services..."
MAX_ATTEMPTS=12
ATTEMPT=1
HEALTHY=false

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -s -f http://localhost/health > /dev/null && curl -s -f http://localhost/ready > /dev/null; then
        HEALTHY=true
        break
    fi
    echo "Waiting for service health checks... (attempt ${ATTEMPT}/${MAX_ATTEMPTS})"
    sleep 5
    ATTEMPT=$((ATTEMPT + 1))
done

if [ "$HEALTHY" = true ]; then
    echo "[SUCCESS] Rollback completed successfully! PharmaFlow is healthy on tag: ${ROLLBACK_TAG}"
    echo "${ROLLBACK_TAG} (ROLLBACK)" >> "${HISTORY_FILE}"
    exit 0
else
    echo "[FATAL] Rollback failed! Health probes did not pass after revert." >&2
    docker compose -f "${COMPOSE_FILE}" ps >&2
    exit 1
fi
