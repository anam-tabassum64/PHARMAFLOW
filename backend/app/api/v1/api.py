from fastapi import APIRouter

from app.api.v1.routes import batches, inventory, medicines, movements, reports

api_router = APIRouter()
api_router.include_router(medicines.router)
api_router.include_router(batches.router)
api_router.include_router(inventory.router)
api_router.include_router(movements.router)
api_router.include_router(reports.router)
