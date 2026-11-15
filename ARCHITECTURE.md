# PHARMAFLOW – System Architecture & Technical Specifications

**Organization:** ALGIONS AI LABS PRIVATE LIMITED  
**Internship Role:** DevOps & Cloud Engineering  
**Platform:** PHARMAFLOW – Pharmacy Inventory Management Platform  
**Target Environment:** AWS (`ap-south-1` Mumbai) | Docker Compose | GitHub Actions  

---

## 1. Executive System Overview

PHARMAFLOW is a clinical-grade Pharmacy Inventory Management Platform architected around data integrity, concurrency safety, strict pharmaceutical compliance, and production-ready DevOps automation.

### Architectural Hallmarks
1. **First-Expiry-First-Out (FEFO) Lot Governance:** Inventory is tracked at the discrete batch level. Sales strictly consume non-expired batches, prioritizing earlier expiration dates.
2. **Atomic Concurrency Protection:** Conditional SQL updates (`WHERE available_quantity >= requested_quantity`) and row-level locking (`with_for_update`) eliminate overselling during high-frequency concurrent checkout.
3. **Audit Immutability:** Purchases, Sales, Returns, and Adjustments are permanently recorded in a non-destructive stock movement ledger with traceable reference identifiers (`PO-`, `INV-`, `RET-`, `ADJ-`).
4. **Zero-Trust Network Isolation:** The database (`pharmaflow-db`), metrics engine (`pharmaflow-prometheus`), and backend API (`pharmaflow-backend`) run on an unexposed internal Docker bridge network (`pharmaflow-net`). Only the Nginx reverse proxy binds to public ingress ports 80 and 443.

---

## 2. Multi-Tier Architecture Diagram

```
                                [ External Users & Admin Browsers ]
                                                 │
                                                 ▼ (HTTP 80 / HTTPS 443)
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ AWS EC2 Host (Ubuntu 24.04 LTS / t3.micro in ap-south-1)                                        │
│ Security Group: pharmaflow-sg (SSH: 22 restricted | HTTP: 80 | HTTPS: 443)                     │
│                                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Nginx Edge Reverse Proxy (pharmaflow-nginx: Port 80/443)                                  │  │
│  │ - SSL Termination & HTTPS Ready                                                           │  │
│  │ - Security Headers (HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy)                  │  │
│  │ - Gzip Compression & Buffer Limits (10M max payload)                                      │  │
│  └───────────┬──────────────────────┬──────────────────────┬──────────────────────┬──────────┘  │
│              │                      │                      │                      │             │
│              │ (/*)                 │ (/api/*, /health,    │ (/prometheus/*)      │ (/grafana/*)│
│              │                      │  /ready, /metrics)   │                      │             │
│              ▼                      ▼                      ▼                      ▼             │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────┐ ┌────────────────┐  │
│  │  pharmaflow-frontend  │ │  pharmaflow-backend   │ │pharmaflow-        │ │pharmaflow-     │  │
│  │  (React 18 + Vite)    │ │  (FastAPI Modular     │ │prometheus         │ │grafana         │  │
│  │  - Port 8080 internal │ │   Monolith: Port 8000)│ │(Prometheus v2.54) │ │(Grafana v11.2) │  │
│  │  - Non-root nginx     │ │  - Non-root appuser   │ │- Scrapes /metrics │ │- Dashboards    │  │
│  └───────────────────────┘ └───────────┬───────────┘ └───────────────────┘ └────────────────┘  │
│                                        │ (Port 5432 Internal Only)                              │
│                                        ▼                                                        │
│                            ┌───────────────────────┐                                            │
│                            │     pharmaflow-db     │                                            │
│                            │ (PostgreSQL 16 Alpine)│                                            │
│                            │ - Zero Public Ports   │                                            │
│                            │ - Persistent Volume:  │                                            │
│                            │   postgres_data       │                                            │
│                            └───────────────────────┘                                            │
│  Docker Bridge Network: pharmaflow-net                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture & Design Patterns

### 3.1 Frontend Web Application (`frontend/`)
- **Technology Stack:** React 18, Vite 6, TypeScript 5, Tailwind CSS, TanStack Query v5, Lucide Icons.
- **Design Pattern:** Client-Side Single Page Application (SPA) with centralized Axios abstraction (`src/api/client.ts`).
- **Data Guarantee:** 100% connected to real FastAPI REST endpoints. Zero mock or hardcoded business data.
- **Containerization:** Multi-stage build (`node:20-alpine` build environment producing static assets, served by unprivileged `nginx:1.27-alpine` runtime on internal port 8080).

### 3.2 Backend Modular Monolith (`backend/`)
- **Technology Stack:** Python 3.10+, FastAPI, SQLAlchemy 2, Pydantic v2, Alembic, Prometheus Client.
- **Layered Pattern:**
  - `app/api/v1/routes/`: Declarative HTTP routing, parameter extraction, and status code mapping.
  - `app/services/`: Pure domain business logic, FEFO validation, and transaction orchestrations.
  - `app/repositories/`: Clean ORM abstractions using SQLAlchemy 2 `select()` and `update()` constructs.
  - `app/models/`: Declarative relational tables with strict foreign key constraints and composite indexes.
  - `app/core/`: Centralized settings (`pydantic-settings`), custom domain exception handling, structured logging, and Prometheus metrics middleware.
- **Observability:**
  - `/health`: Liveness probe indicating process health.
  - `/ready`: Readiness probe verifying live database connection and schema integrity.
  - `/metrics`: Prometheus text exposition endpoint tracking throughput, status codes, latency histograms, and process CPU/memory.

### 3.3 Relational Database Layer (`db`)
- **Database Engine:** PostgreSQL 16 Alpine.
- **Persistence:** Named Docker volume `postgres_data` mapped to `/var/lib/postgresql/data`.
- **Isolation:** Strictly private within `pharmaflow-net`. No host port mapping to port 5432.
- **Data Model:**
  - `medicines`: Formulary catalog tracking `medicine_code` (unique), name, category, manufacturer, unit, and `reorder_level`.
  - `medicine_batches`: Specific physical lots tracking `batch_number`, `expiry_date`, `purchase_price`, `selling_price`, and `available_quantity`. Unique constraint on `(medicine_id, batch_number)`.
  - `stock_movements`: Ledger tracking `movement_type` (`PURCHASE`, `SALE`, `RETURN`, `ADJUSTMENT`), `quantity` delta, and immutable tracking `reference_number`.

### 3.4 Monitoring & Observability Stack
- **Prometheus (`pharmaflow-prometheus`):** Scrapes FastAPI process and request metrics every 15s via internal network DNS `backend:8000/metrics`.
- **Grafana (`pharmaflow-grafana`):** Pre-provisioned with Prometheus datasource and operation dashboard tracking:
  - System status & uptime
  - Request throughput (req/s)
  - Latency quantiles ($p_{50}$, $p_{95}$)
  - Error rates (4xx, 5xx)
  - Process memory and CPU utilization

---

## 4. Concurrency & Business Logic Safeguards

```
[Sale Request Received: batch_id, quantity]
                  │
                  ▼
         [Validate Quantity > 0] ───(No)───► HTTP 422 Unprocessable Entity
                  │ (Yes)
                  ▼
         [Query Batch by ID] ───────(No)───► HTTP 404 Not Found
                  │ (Yes)
                  ▼
     [Is Expiry Date < Today?] ─────(Yes)──► HTTP 400 Bad Request (Expired Batch)
                  │ (No)
                  ▼
 [Atomic Conditional Update:
  UPDATE medicine_batches
  SET available_quantity = available_quantity - :qty
  WHERE id = :id AND available_quantity >= :qty]
                  │
         ┌────────┴────────┐
         │ (Rows Affected) │
         ▼                 ▼
      [Count == 1]      [Count == 0] ──────► HTTP 400 Bad Request (Insufficient Stock)
         │
         ▼
 [Create StockMovement (Type: SALE, Ref: INV-XXXX)]
         │
         ▼
   [Commit DB Transaction]
         │
         ▼
 [HTTP 200 OK + Updated Quantities]
```

---

## 5. Security & Compliance Architecture

1. **Non-Root Execution:**
   - Backend container runs as user `appuser` (UID 1000).
   - Frontend container runs as user `nginx` (UID 101).
   - Prometheus and Grafana containers execute under unprivileged system UIDs.
2. **Container Image Hardening:**
   - Pinned Alpine and Slim base images to minimize attack surface.
   - AquaSecurity **Trivy** vulnerability scanning integrated into CI pipeline to block `CRITICAL` and `HIGH` CVEs.
3. **AWS Cloud Security:**
   - **Zero Password / Access Key Persistence:** GitHub Actions authenticates to AWS using OpenID Connect (OIDC) through temporary STS tokens (`AssumeRoleWithWebIdentity`).
   - **Security Group Isolation:** Port 22 SSH is restricted to administrator IP. Public access is granted strictly to Port 80 (HTTP) and Port 443 (HTTPS).
   - **Database Privacy:** PostgreSQL is completely isolated within the private Docker bridge network.
4. **HTTP Protection:**
   - Reverse proxy enforces `X-Frame-Options: SAMEORIGIN` (Clickjacking defense).
   - `X-Content-Type-Options: nosniff` (MIME sniffing defense).
   - Request size limited to 10MB to mitigate buffer overflow / payload exhaustion attacks.
