# PHARMAFLOW – Production DevOps & Deployment Guide
## Stages 4, 5 & 6 Implementation

---

### Project & Configuration Identifiers

- **Application:** PHARMAFLOW – Pharmacy Inventory Management Platform
- **Organization:** ALGIONS AI LABS PRIVATE LIMITED
- **Internship Role:** DevOps & Cloud Engineering
- **GitHub Target:** [`anam-tabassum64/PHARMAFLOW`](https://github.com/anam-tabassum64/PHARMAFLOW)
- **Deployment Branch:** `main`
- **AWS Target Account:** `789223369238`
- **AWS Target Region:** `ap-south-1` (Mumbai)
- **AWS IAM OIDC Role ARN:** `arn:aws:iam::789223369238:role/PHARMAFLOW-GitHubActions-Deploy`
- **EC2 Key Pair Name:** `pharmaflow-ec2-key`
- **EC2 Security Group Name:** `pharmaflow-sg`

---

## 1. Stage 4: Docker Containerization Architecture

The application runs as 4 containerized services isolated on an internal bridge network (`pharmaflow-net`), with only the Nginx reverse proxy exposed to the outside world.

```
                    Internet / Users / Web Browser
                                 │
                                 ▼
                     [Port 80 / Port 443 (Ready)]
                       ┌──────────────────────┐
                       │   pharmaflow-nginx   │ (Reverse Proxy, SSL, Rate Limits,
                       └──────────┬───────────┘  Security Headers)
                                  │
          ┌───────────────────────┴───────────────────────┐
          │ /api/*, /health, /ready, /docs                │ /* (SPA Routes)
          ▼                                               ▼
┌───────────────────────────┐                 ┌───────────────────────────┐
│    pharmaflow-backend     │                 │    pharmaflow-frontend    │
│  (FastAPI on Port 8000)   │                 │   (Nginx on Port 8080)    │
│  * Non-root user appuser  │                 │  * Unprivileged user nginx│
└─────────────┬─────────────┘                 └───────────────────────────┘
              │ Internal Network (Port 5432)
              ▼
┌───────────────────────────┐
│       pharmaflow-db       │
│  (PostgreSQL 16 Alpine)   │
│  * Persistent Named Volume│
│  * Not publicly exposed   │
└───────────────────────────┘
```

### Container Specifications

1. **Frontend (`frontend/Dockerfile`)**:
   - Multi-stage build (`node:20-alpine` builder + `nginx:1.27-alpine` runtime).
   - Static assets served via unprivileged `nginx` user on internal port `8080`.
   - Single Page Application (SPA) routing fallback with client-side cache headers for production bundles.

2. **Backend (`backend/Dockerfile`)**:
   - Lightweight pinned `python:3.10-slim` base image.
   - Non-root user (`appuser:appgroup`, UID 10001) for defense-in-depth runtime isolation.
   - Internal port `8000` only.
   - Container healthcheck probing `/health`.

3. **PostgreSQL Database (`postgres:16-alpine`)**:
   - Pinned official Alpine image.
   - Dedicated named volume `postgres_data` mounted at `/var/lib/postgresql/data`.
   - Healthcheck powered by `pg_isready`.
   - **Zero host port bindings** (database is completely inaccessible from the public internet).

4. **Nginx Reverse Proxy (`nginx/nginx.conf`)**:
   - Edge gateway binding to host port `80` (and `443` HTTPS ready).
   - Enforces strict security headers:
     - `X-Frame-Options: SAMEORIGIN`
     - `X-Content-Type-Options: nosniff`
     - `X-XSS-Protection: 1; mode=block`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
   - Routes `/api/`, `/health`, `/ready`, `/docs` directly to `pharmaflow-backend:8000`.
   - Routes all other requests to `pharmaflow-frontend:8080`.

### Local Docker Verification Summary

All verification stages were executed and verified:

| Verification Test | Command | Outcome |
| :--- | :--- | :--- |
| **Config Validation** | `docker compose config` | **PASSED** (Exit code 0, clean spec) |
| **Image Builds** | `docker compose build` | **PASSED** (Backend & Frontend built) |
| **Stack Initialization** | `docker compose up -d` | **PASSED** (All 4 containers running & healthy) |
| **Reverse Proxy Routing** | `curl http://localhost/health` | **PASSED** (`HTTP 200 OK` from backend) |
| **Database Readiness** | `curl http://localhost/ready` | **PASSED** (`"database":"connected"`) |
| **Frontend Delivery** | `curl http://localhost/` | **PASSED** (`HTTP 200 OK`, HTML bundle served) |
| **Persistence Across Restart** | `docker compose down && docker compose up -d` | **PASSED** (All 30 seeded medicines and valuation persisted intact) |

---

## 2. Stage 5: GitHub Actions CI/CD Pipeline

Two automated workflows are configured in `.github/workflows/`:

### 1. Continuous Integration (`.github/workflows/ci.yml`)
- **Triggers:** Push to `main`, Pull Requests targeting `main`, Manual `workflow_dispatch`.
- **Jobs:**
  1. `backend-ci`:
     - Sets up Python 3.10 and installs dependencies.
     - Boots isolated `postgres:16-alpine` service container.
     - Runs `ruff format --check backend` and `ruff check backend`.
     - Executes 20-test pytest suite against PostgreSQL with line-by-line coverage (`coverage.xml`, JUnit XML artifact).
  2. `frontend-ci`:
     - Sets up Node.js 20 with package-lock caching.
     - Installs dependencies via `npm ci`.
     - Executes `npm run build` (TypeScript strict check + Vite optimization).
     - Uploads production bundle as artifact.
  3. `docker-security`:
     - Builds Docker images for backend and frontend.
     - Scans images using AquaSecurity **Trivy** for `CRITICAL` and `HIGH` vulnerabilities.

### 2. Continuous Deployment (`.github/workflows/cd.yml`)
- **Triggers:** Completion of CI with success, version tags (`v*.*.*`), or manual dispatch.
- **Jobs:**
  1. `publish-images`:
     - Authenticates to GitHub Container Registry (`ghcr.io`) using `GITHUB_TOKEN`.
     - Builds and tags images with Git Commit SHA (`sha-<short_sha>`) and `latest`.
     - Pushes images to:
       - `ghcr.io/anam-tabassum64/pharmaflow-backend`
       - `ghcr.io/anam-tabassum64/pharmaflow-frontend`
     - Records immutable image digests in GitHub Actions summary.
  2. `deploy-ec2`:
     - Assumes AWS IAM Role `arn:aws:iam::789223369238:role/PHARMAFLOW-GitHubActions-Deploy` using AWS OIDC (`token.actions.githubusercontent.com`).
     - Securely checks for `EC2_HOST` and `EC2_SSH_KEY` repository secrets.
     - Transfers production Compose specification and connects to EC2.
     - Pulls verified images from GHCR and deploys via `docker compose -f docker-compose.prod.yml up -d`.
     - Executes health probe against `/health` and `/ready`.
     - **Automated Rollback:** Reverts to the previous image if health probe fails within 60 seconds.

---

## 3. Stage 6: AWS Infrastructure & Cost Warning

> [!WARNING]
> **AWS Cost Notice & Policy Compliance:**
> As instructed, **no cloud resources have been deployed to AWS**. Cloud resources will only be provisioned after you review the cost breakdown below and give explicit approval.

### Estimated AWS Cloud Costs (Region: `ap-south-1` Mumbai)

| AWS Resource | Configuration | AWS Free Tier Status | Estimated Monthly Cost (Post Free Tier) |
| :--- | :--- | :--- | :--- |
| **EC2 Instance** | `t3.micro` (2 vCPU, 1 GB RAM) | **100% Free** (750 hours/month for 12 months) | ~$7.49 / month (~$0.0104/hr) |
| **EBS Storage** | 20 GB gp3 SSD volume | **100% Free** (Up to 30 GB free for 12 months) | ~$1.60 / month ($0.08/GB-mo) |
| **Data Transfer** | Outbound internet traffic | **100% Free** (Up to 100 GB/month always free) | ~$0.00 |
| **Total Cost** | **Complete PharmaFlow Stack** | **$0.00 (Free Tier Eligible)** | **~$9.09 / month** |

*Tip: If you do not intend to keep the server running 24/7, stopping the instance when not presenting your internship project reduces costs to near zero.*

### Terraform IaC Files (`terraform/`)

All Terraform modules are ready in the `terraform/` directory:
- `versions.tf`: Pinned HashiCorp AWS provider `~> 5.0`.
- `variables.tf`: Configured for `ap-south-1`, `t3.micro`, security group `pharmaflow-sg`, and key `pharmaflow-ec2-key`.
- `main.tf`:
  - Dynamically fetches official Ubuntu 24.04 LTS AMI.
  - Creates Security Group `pharmaflow-sg` (SSH port 22 restricted, HTTP 80 & HTTPS 443 open, DB port 5432 closed).
  - Configures EC2 instance with an automated `user_data` bootstrap script that installs Docker, Docker Compose, and log rotation.
- `outputs.tf`: Outputs EC2 public IP, public DNS, and health check URLs.

---

## 4. Step-by-Step GitHub Web Upload Instructions

Per your explicit instructions, **no Git terminal commands** (`git add`, `git commit`, `git push`, etc.) are to be executed. Follow these simple steps in your web browser:

### Step 1: Open Your GitHub Repository
1. Open your browser and navigate to:
   👉 **`https://github.com/anam-tabassum64/PHARMAFLOW`**
2. Ensure you are signed in as `anam-tabassum64` on branch `main`.

### Step 2: Upload Files via GitHub Web UI
1. Click the **"Add file"** button at the top right of the file tree, then select **"Upload files"**.
2. Open your local file explorer at:
   `C:\Users\Lenovo\Downloads\PharmaProject`
3. Drag and drop the following files and folders:
   - `.github/` (contains `workflows/ci.yml` and `workflows/cd.yml`)
   - `backend/` (FastAPI application, Dockerfile, requirements.txt, alembic, tests)
   - `frontend/` (React application, Dockerfile, package.json, src)
   - `nginx/` (Nginx reverse proxy configuration `nginx.conf`)
   - `terraform/` (Terraform IaC files `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`)
   - `docker-compose.yml`
   - `docker-compose.prod.yml`
   - `.env.example`
   - `pyproject.toml`
   - `pytest.ini`
   - `DEPLOYMENT.md`
   - `README.md`
4. In the commit message box at the bottom, type:
   `feat: Complete Stages 4, 5, and 6 (Docker, CI/CD, AWS Terraform & Runbook)`
5. Ensure **"Commit directly to the main branch"** is selected.
6. Click the green **"Commit changes"** button.

---

## 5. GitHub Repository Secrets Setup

Once your EC2 instance is created, configure these secrets in your GitHub repository to enable automatic deployment:

1. In GitHub, go to **Settings** > **Secrets and variables** > **Actions**.
2. Click **"New repository secret"** and add:

| Secret Name | Value | Purpose |
| :--- | :--- | :--- |
| `EC2_SSH_KEY` | *(Paste the entire contents of `pharmaflow-ec2-key.pem`)* | Authenticates SSH connection to EC2 |
| `EC2_HOST` | *(The Public IPv4 Address of your EC2 instance)* | Target host for remote deployment |
| `EC2_USER` | `ubuntu` | Default SSH user for Ubuntu AMI |

---

## 6. Verification and Healthcheck Runbook

Once deployed, verify your live system using:

```bash
# 1. Reverse proxy and backend health check
curl -i http://<EC2_PUBLIC_IP>/health

# 2. Database readiness check
curl -i http://<EC2_PUBLIC_IP>/ready

# 3. Inventory API check
curl -i http://<EC2_PUBLIC_IP>/api/v1/inventory/summary

# 4. Open in browser:
# http://<EC2_PUBLIC_IP>/
```
