# PHARMAFLOW – Production Operations & Incident Runbook

**Organization:** ALGIONS AI LABS PRIVATE LIMITED  
**Platform:** PHARMAFLOW – Pharmacy Inventory Management Platform  
**Target Environment:** AWS EC2 (`ap-south-1` Mumbai) | Docker Compose  

---

## 1. Quick Reference & Operational Health Probes

| Resource / Endpoint | URL / Target | Expected Healthy Response |
| :--- | :--- | :--- |
| **Frontend Web Interface** | `http://<HOST_IP>/` | `HTTP 200 OK` (React SPA) |
| **Backend Liveness Probe** | `http://<HOST_IP>/health` | `HTTP 200 OK`, `{"status":"healthy"}` |
| **Database Readiness Probe** | `http://<HOST_IP>/ready` | `HTTP 200 OK`, `{"database":"connected"}` |
| **Prometheus Metrics** | `http://<HOST_IP>/metrics` | `HTTP 200 OK`, text/plain metrics |
| **Grafana Dashboards** | `http://<HOST_IP>/grafana/` | `HTTP 200 OK` (Default user: `admin`) |
| **Swagger OpenAPI Docs** | `http://<HOST_IP>/docs` | `HTTP 200 OK` (Interactive documentation) |

---

## 2. Standard Service Management Procedures

All service management commands are executed from the deployment root `/opt/pharmaflow`:

### 2.1 Starting Services
```bash
cd /opt/pharmaflow
docker compose -f docker-compose.prod.yml up -d
```

### 2.2 Checking Container Health & Status
```bash
docker compose -f docker-compose.prod.yml ps
```
*All 6 services (`pharmaflow-db`, `pharmaflow-backend`, `pharmaflow-frontend`, `pharmaflow-nginx`, `pharmaflow-prometheus`, `pharmaflow-grafana`) must show `Up` and `(healthy)`.*

### 2.3 Inspecting Logs
```bash
# View aggregated real-time logs
docker compose -f docker-compose.prod.yml logs -f --tail=100

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f db
```

### 2.4 Graceful Restart
```bash
docker compose -f docker-compose.prod.yml restart
```

---

## 3. Database Backup & Disaster Recovery Procedures

### 3.1 Automated & Manual Backup
Backups are created via `/opt/pharmaflow/scripts/backup.sh`. It automatically streams compressed SQL dumps into `/opt/pharmaflow/backups` and enforces a 7-day retention policy:

```bash
# Execute manual on-demand backup
cd /opt/pharmaflow
bash scripts/backup.sh
```

**Automating via Cron (Recommended on EC2 Host):**
```bash
# Schedule daily backup at 02:00 AM UTC
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/pharmaflow/scripts/backup.sh >> /var/log/pharmaflow-backup.log 2>&1") | crontab -
```

### 3.2 Database Restoration
To restore from an existing backup:

```bash
# 1. Identify target backup file
ls -lh /opt/pharmaflow/backups/

# 2. Execute restore script
bash /opt/pharmaflow/scripts/restore.sh /opt/pharmaflow/backups/pharmaflow_backup_YYYYMMDD_HHMMSS.sql.gz

# 3. Verify database readiness
curl -i http://localhost/ready
```

---

## 4. Emergency Deployment Rollback Procedure

If a new deployment causes errors, performance degradation, or failed health checks:

### 4.1 Automated Instant Rollback
```bash
cd /opt/pharmaflow

# Automatically roll back to the previous stable release recorded in history
bash scripts/rollback.sh
```

### 4.2 Explicit Version Rollback
To roll back to a specific Git commit SHA or version tag:
```bash
cd /opt/pharmaflow
bash scripts/rollback.sh sha-a1b2c3d
# or:
bash scripts/rollback.sh v1.0.0
```

The script will:
1. Pull the target immutable image versions from GHCR.
2. Recreate the containers with zero downtime.
3. Validate `/health` and `/ready` probes.
4. Record the rollback event in `.deployment_history`.

---

## 5. Troubleshooting & Incident Playbooks

### Incident 1: `/health` or `/ready` Returns HTTP 500 or 503
1. **Check backend container logs:**
   ```bash
   docker logs pharmaflow-backend --tail 50
   ```
2. **Verify PostgreSQL database health:**
   ```bash
   docker exec pharmaflow-db pg_isready -U pharma_admin -d pharmaflow
   ```
3. **If database is unreachable:**
   ```bash
   docker compose -f docker-compose.prod.yml restart db
   ```

### Incident 2: Nginx Returns HTTP 502 Bad Gateway
1. **Verify backend and frontend containers are up:**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```
2. **Test direct backend responsiveness on Docker network:**
   ```bash
   docker exec pharmaflow-nginx wget -qO- http://backend:8000/health
   ```
3. **Restart Nginx reverse proxy:**
   ```bash
   docker compose -f docker-compose.prod.yml restart nginx
   ```

### Incident 3: Disk Space Exhaustion on EC2 Host
1. **Check disk usage:**
   ```bash
   df -h /
   ```
2. **Prune unused Docker layers and dangling images:**
   ```bash
   docker image prune -a -f --filter "until=48h"
   ```
3. **Clean old backup archives:**
   ```bash
   find /opt/pharmaflow/backups -name "*.sql.gz" -mtime +3 -delete
   ```
