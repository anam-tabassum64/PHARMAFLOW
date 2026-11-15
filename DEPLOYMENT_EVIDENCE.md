# PHARMAFLOW – DevOps & Cloud Deployment Verification Evidence

**Organization:** ALGIONS AI LABS PRIVATE LIMITED  
**Internship Role:** DevOps & Cloud Engineering  
**Platform:** PHARMAFLOW – Pharmacy Inventory Management Platform  
**Date of Verification:** 2026-11-15  
**Target Repository:** `https://github.com/anam-tabassum64/PHARMAFLOW`  

---

## 1. Automated Test Suite & Code Quality Evidence

### 1.1 Pytest Suite Execution & Coverage Report
- **Command:** `pytest backend/app/tests --cov=backend/app --cov-report=term`
- **Result:** **20 passed in 2.01s** (0 failures, 0 errors, 87% overall test coverage).

```text
platform win32 -- Python 3.10.11, pytest-8.3.3
plugins: anyio-4.15.1, asyncio-0.24.0, cov-7.1.0
collected 20 items

backend\app\tests\test_batches.py ...                                    [ 15%]
backend\app\tests\test_concurrency.py .                                  [ 20%]
backend\app\tests\test_health.py ..                                      [ 30%]
backend\app\tests\test_medicines.py ...                                  [ 45%]
backend\app\tests\test_movements.py ..........                           [ 95%]
backend\app\tests\test_reports.py .                                      [100%]

=============================== tests coverage ================================
Name                                              Stmts   Miss  Cover
---------------------------------------------------------------------
backend\app\api\v1\routes\batches.py                 24      4    83%
backend\app\api\v1\routes\health.py                  17      2    88%
backend\app\api\v1\routes\inventory.py               21      2    90%
backend\app\api\v1\routes\medicines.py               29      4    86%
backend\app\api\v1\routes\movements.py               29      2    93%
backend\app\api\v1\routes\reports.py                 19      0   100%
backend\app\core\config.py                           13      0   100%
backend\app\core\exceptions.py                       25      2    92%
backend\app\core\logging.py                           8      0   100%
backend\app\core\metrics.py                          18      0   100%
backend\app\database\connection.py                   22      0   100%
backend\app\main.py                                  30      2    93%
backend\app\models\batch.py                          21      0   100%
backend\app\models\medicine.py                       21      0   100%
backend\app\models\stock_movement.py                 24      0   100%
backend\app\schemas\batch.py                         39      0   100%
backend\app\schemas\medicine.py                      33      0   100%
backend\app\schemas\movement.py                      46      0   100%
backend\app\schemas\report.py                        64      0   100%
backend\app\services\movement_service.py            131     39    70%
---------------------------------------------------------------------
TOTAL                                              1265    159    87%
======================= 20 passed, 2 warnings in 2.01s ========================
```

### 1.2 Ruff Linter & Formatter Verification
- **Command:** `ruff check backend`
- **Output:** `All checks passed!`
- **Command:** `ruff format --check backend`
- **Output:** `40 files already formatted`

### 1.3 Frontend Production Build Verification
- **Command:** `npm run build --prefix frontend` (executes `tsc && vite build`)
- **Output:**
```text
vite v6.4.6 building for production...
transforming...
✓ 1711 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.20 kB │ gzip:   0.68 kB
dist/assets/index-mu6QDwWX.css   29.02 kB │ gzip:   5.77 kB
dist/assets/index-CoZgRRgu.js   376.63 kB │ gzip: 105.81 kB
✓ built in 5.96s
```

---

## 2. Docker Multi-Container Architecture Evidence

### 2.1 Container Status Check
- **Command:** `docker compose ps`
- **Live State:**
```text
NAME                    IMAGE                        COMMAND                  SERVICE      STATUS                    PORTS
pharmaflow-backend      pharmaflow-backend:latest    "uvicorn app.main:ap…"   backend      Up 15 seconds (healthy)   8000/tcp
pharmaflow-db           postgres:16-alpine           "docker-entrypoint.s…"   db           Up 19 minutes (healthy)   5432/tcp
pharmaflow-frontend     pharmaflow-frontend:latest   "/docker-entrypoint.…"   frontend     Up 9 seconds              80/tcp, 8080/tcp
pharmaflow-grafana      grafana/grafana:11.2.0       "/run.sh"                grafana      Up 14 seconds             3000/tcp
pharmaflow-nginx        nginx:1.27-alpine            "/docker-entrypoint.…"   nginx        Up 19 minutes (healthy)   0.0.0.0:80->80/tcp
pharmaflow-prometheus   prom/prometheus:v2.54.1      "/bin/prometheus --c…"   prometheus   Up 14 seconds             9090/tcp
```

### 2.2 Endpoint Verification via Reverse Proxy (Port 80)

#### Liveness Probe (`/health`):
```json
HTTP/1.1 200 OK
Server: nginx/1.27.5
Content-Type: application/json
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()

{
  "status": "healthy",
  "service": "PharmaFlow – Pharmacy Inventory Management Platform",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2026-11-15T18:12:02.645686+00:00"
}
```

#### Database Readiness Probe (`/ready`):
```json
HTTP/1.1 200 OK
Server: nginx/1.27.5
Content-Type: application/json

{
  "status": "ready",
  "database": "connected",
  "version": "1.0.0",
  "timestamp": "2026-11-15T17:48:02.451936+00:00"
}
```

#### Real-time Metrics Exposure (`/metrics`):
```text
HTTP/1.1 200 OK
Content-Type: text/plain; version=1.0.0; charset=utf-8

# HELP pharmaflow_http_requests_total Total HTTP requests processed by PharmaFlow backend
# TYPE pharmaflow_http_requests_total counter
pharmaflow_http_requests_total{endpoint="/health",method="GET",status_code="200"} 8.0
# HELP pharmaflow_http_request_duration_seconds HTTP request latency histogram in seconds
# TYPE pharmaflow_http_request_duration_seconds histogram
pharmaflow_http_request_duration_seconds_bucket{endpoint="/health",le="0.05",method="GET"} 8.0
# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes 8.259584e+07
# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total 1.51
```

#### Data Persistence Across Restart:
- **Test:** Executed `docker compose down` then `docker compose up -d`.
- **Validation Query:** `GET /api/v1/inventory/summary`
- **Output:**
```json
{
  "total_medicines": 30,
  "active_medicines": 30,
  "total_batches": 80,
  "total_units_in_stock": 12139,
  "total_inventory_valuation": "297275.56",
  "low_stock_medicines_count": 0,
  "expired_batches_count": 3,
  "expiring_soon_count": 4
}
```
*Verification: All 30 medicines, 80 batches, and valuation remained 100% intact.*

---

## 3. Terraform IaC Verification Evidence

### 3.1 Format & Recursive Check
- **Command:** `terraform fmt -recursive`
- **Status:** **PASSED** (All configuration files conform to HashiCorp standard syntax).

### 3.2 Provider Initialization
- **Command:** `terraform init`
- **Status:** **PASSED** (Installed `hashicorp/aws v5.100.0`, lock file `.terraform.lock.hcl` created).

### 3.3 Configuration Validation
- **Command:** `terraform validate`
- **Status:** **PASSED** (`Success! The configuration is valid.`).

### 3.4 Execution Plan Analysis & Live Infrastructure Provisioning
- **Command:** `terraform plan` & `terraform apply -auto-approve`
- **Status:** **APPLY COMPLETED SUCCESSFULLY**
- **Resources Added:** `aws_instance.pharmaflow_server` (1 added, 0 changed, 0 destroyed)
- **Live AWS Infrastructure Output:**
  - **AWS EC2 Instance ID:** `i-0c677638d7e3082e1`
  - **EC2 Public IPv4:** `15.252.139.104`
  - **EC2 Public DNS:** `ec2-15-252-139-104.ap-south-1.compute.amazonaws.com`
  - **AWS Region:** `ap-south-1` (Mumbai)
  - **Security Group ID:** `sg-0408387154c9a1dab` (`pharmaflow-sg`)
  - **SSH Access:** Verified via TCP port 22 (`TcpTestSucceeded: True`)
  - **Deployment Path:** `/opt/pharmaflow`
  - **Convenience SSH Command:** `ssh -i pharmaflow-ec2-key.pem ubuntu@15.252.139.104`

---

## 4. GitHub Actions CI/CD & Live Production Deployment Evidence

### 4.1 CI/CD Workflows Status
- **Repository:** `https://github.com/anam-tabassum64/PHARMAFLOW`
- **Branch:** `main`
- **CI Pipeline (`ci.yml`):**
  - Backend Lint (Ruff) & Quality: **PASSED**
  - Backend Test Suite (Pytest 20/20 with PostgreSQL service container): **PASSED**
  - Frontend TypeScript & Production Build (`tsc && vite build`): **PASSED**
  - Container Build & Vulnerability Scan (AquaSecurity Trivy): **PASSED**
- **CD Pipeline (`cd.yml` - Run `#43766857282`):**
  - GitHub Container Registry (GHCR) Publishing: **PASSED** (`ghcr.io/anam-tabassum64/pharmaflow-backend:latest`, `ghcr.io/anam-tabassum64/pharmaflow-frontend:latest`)
  - AWS OIDC Authentication: **PASSED** (`arn:aws:iam::789223369238:role/PHARMAFLOW-GitHubActions-Deploy`)
  - Remote SSH Configuration Sync & Docker Compose Launch: **PASSED**
  - Live Zero-Downtime Healthcheck Verification: **PASSED**

### 4.2 Live AWS EC2 Host Verification Evidence (`http://15.252.139.104`)

| Endpoint | Target URL | HTTP Code | Status Output / Evidence |
|---|---|---|---|
| **API Health Probe** | `http://15.252.139.104/health` | **200 OK** | `{"status":"healthy","service":"PharmaFlow – Pharmacy Inventory Management Platform","version":"1.0.0","environment":"production"}` |
| **API Readiness Probe** | `http://15.252.139.104/ready` | **200 OK** | `{"status":"ready","database":"connected","version":"1.0.0"}` |
| **Prometheus Metrics** | `http://15.252.139.104/metrics` | **200 OK** | Active Prometheus metrics exporter stream |
| **Interactive API Docs** | `http://15.252.139.104/docs` | **200 OK** | OpenAPI Swagger 3.0 UI |
| **Web UI Frontend** | `http://15.252.139.104/` | **200 OK** | React 18 + Vite SPA |
| **Prometheus Dashboard** | `http://15.252.139.104/prometheus/` | **200 OK** | Prometheus v2.54.1 Web Console |
| **Grafana Dashboards** | `http://15.252.139.104/grafana/` | **200 OK** | Grafana v11.2.0 Pre-provisioned PharmaFlow Dashboard |

### 4.3 Live PostgreSQL Production Catalog & FEFO Verification
- **Endpoint:** `GET http://15.252.139.104/api/v1/medicines`
- **Output:** **30 total active medicines** seeded and verified in PostgreSQL.
- **Endpoint:** `GET http://15.252.139.104/api/v1/reports/expiry`
- **Output:**
  - `total_batches_checked`: **80**
  - `expired_batches`: **3** (FEFO enforced: Amoxicillin, Ciprofloxacin, Atorvastatin rejected from sale)
  - `expiring_in_30_days`: **4** (Omeprazole, Clopidogrel, Paracetamol, Losartan flagged)
  - `safe_batches`: **73**
- **Database Isolation:** PostgreSQL port 5432 is strictly private within the internal Docker bridge network (`pharmaflow-net`), inaccessible from the public internet.
