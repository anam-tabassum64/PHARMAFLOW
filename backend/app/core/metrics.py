import time

from fastapi import Request, Response
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    Counter,
    Histogram,
    generate_latest,
)
from starlette.middleware.base import BaseHTTPMiddleware

# Standard Prometheus Metrics for PharmaFlow
HTTP_REQUESTS_TOTAL = Counter(
    "pharmaflow_http_requests_total",
    "Total HTTP requests processed by PharmaFlow backend",
    ["method", "endpoint", "status_code"],
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "pharmaflow_http_request_duration_seconds",
    "HTTP request latency histogram in seconds",
    ["method", "endpoint"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0),
)


class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        endpoint = request.url.path

        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception:
            status_code = 500
            raise
        finally:
            duration = time.time() - start_time
            # Ignore /metrics from cluttering metrics
            if endpoint != "/metrics":
                HTTP_REQUESTS_TOTAL.labels(
                    method=request.method,
                    endpoint=endpoint,
                    status_code=str(status_code),
                ).inc()
                HTTP_REQUEST_DURATION_SECONDS.labels(
                    method=request.method,
                    endpoint=endpoint,
                ).observe(duration)

        return response


def metrics_endpoint() -> Response:
    """Exposes Prometheus text format metrics"""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
