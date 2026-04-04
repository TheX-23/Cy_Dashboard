from fastapi import APIRouter
from app.api.v1 import api_router as v1_api_router

# Main API router
api_router = APIRouter()

# Include v1 API
api_router.include_router(v1_api_router, prefix="/v1")

# Export the main router
__all__ = ["api_router"]
