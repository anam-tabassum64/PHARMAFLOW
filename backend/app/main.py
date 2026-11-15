from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.api.v1.routes.health import router as health_router
from app.core.config import settings
from app.core.exceptions import PharmaFlowException
from app.core.logging import logger, setup_logging
from app.core.metrics import PrometheusMiddleware, metrics_endpoint
from app.database.base import Base
from app.database.connection import engine

# Setup application logging
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing PharmaFlow API Engine...")
    # Create tables if not existing (ensures instant startup and self-healing DB)
    Base.metadata.create_all(bind=engine)
    logger.info(
        f"PharmaFlow database ready on: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}"
    )
    yield
    logger.info("Shutting down PharmaFlow API Engine...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
# PHARMAFLOW – PHARMACY INVENTORY MANAGEMENT PLATFORM API

### Algions AI Labs Private Limited – Advanced Assessment
Production-grade modular monolithic backend providing:
* **Batch-Level Inventory Tracking**: FEFO-oriented tracking, strict expiry enforcement, atomic transactions.
* **Stock Movements Audit Trail**: Immutable logging of PURCHASE, SALE, RETURN, and ADJUSTMENT operations.
* **Concurrency Protection**: Atomic conditional updates and row-level locking to prevent overselling.
* **DevOps Observability**: Standardized `/health` and `/ready` probes for Kubernetes and container orchestration.
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Prometheus Metrics Middleware
app.add_middleware(PrometheusMiddleware)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Domain Exception Handler
@app.exception_handler(PharmaFlowException)
async def pharmaflow_exception_handler(request: Request, exc: PharmaFlowException):
    logger.warning(f"Business logic exception: {exc.message} (status: {exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "details": exc.details,
            "status_code": exc.status_code,
        },
    )


# Include root health and readiness probes
app.include_router(health_router)


# Prometheus Metrics Scraping Endpoint
@app.get("/metrics", include_in_schema=False)
def get_metrics():
    return metrics_endpoint()


# Include API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
