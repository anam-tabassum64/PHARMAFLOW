#!/usr/bin/env bash
# ==============================================================================
# PHARMAFLOW – Automated PostgreSQL Backup Script
# Algions AI Labs Private Limited – Production DevOps Automation
# ==============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/opt/pharmaflow/backups}"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
BACKUP_FILE="${BACKUP_DIR}/pharmaflow_backup_${TIMESTAMP}.sql.gz"
CONTAINER_NAME="${DB_CONTAINER:-pharmaflow-db}"
POSTGRES_USER="${POSTGRES_USER:-pharma_admin}"
POSTGRES_DB="${POSTGRES_DB:-pharmaflow}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting automated database backup for '${POSTGRES_DB}'..."

# Verify database container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "ERROR: Target database container '${CONTAINER_NAME}' is not running!" >&2
    exit 1
fi

# Execute pg_dump streaming through gzip
docker exec "${CONTAINER_NAME}" pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists | gzip -9 > "${BACKUP_FILE}"

# Verify backup file size is greater than zero
if [ ! -s "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file was created but is empty: ${BACKUP_FILE}" >&2
    rm -f "${BACKUP_FILE}"
    exit 1
fi

BACKUP_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup successfully created: ${BACKUP_FILE} (Size: ${BACKUP_SIZE})"

# Enforce retention policy: delete backups older than RETENTION_DAYS
echo "[$(date +'%Y-%m-%d %H:%M:%S')] Purging backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "pharmaflow_backup_*.sql.gz" -mtime +"${RETENTION_DAYS}" -exec rm -vf {} \;

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup workflow completed successfully."
