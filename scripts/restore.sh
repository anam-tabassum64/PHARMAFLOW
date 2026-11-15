#!/usr/bin/env bash
# ==============================================================================
# PHARMAFLOW – PostgreSQL Database Restore Script
# Algions AI Labs Private Limited – Disaster Recovery Automation
# ==============================================================================

set -euo pipefail

# Configuration
CONTAINER_NAME="${DB_CONTAINER:-pharmaflow-db}"
POSTGRES_USER="${POSTGRES_USER:-pharma_admin}"
POSTGRES_DB="${POSTGRES_DB:-pharmaflow}"

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path-to-backup-file.sql.gz|path-to-backup-file.sql>"
    echo "Example: $0 /opt/pharmaflow/backups/pharmaflow_backup_20261115_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: Specified backup file does not exist: ${BACKUP_FILE}" >&2
    exit 1
fi

echo "=============================================================================="
echo "WARNING: Restoring will overwrite existing data in '${POSTGRES_DB}'!"
echo "Target Container: ${CONTAINER_NAME}"
echo "Backup Source:    ${BACKUP_FILE}"
echo "=============================================================================="

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "ERROR: Target database container '${CONTAINER_NAME}' is not running!" >&2
    exit 1
fi

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting database restoration..."

# Stream backup into container psql session
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
else
    cat "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
fi

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Verifying database integrity after restore..."
RECORD_COUNT=$(docker exec "${CONTAINER_NAME}" psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -t -c "SELECT count(*) FROM medicines;")
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Successfully restored! Active medicines count in DB: ${RECORD_COUNT//[[:space:]]/}"
