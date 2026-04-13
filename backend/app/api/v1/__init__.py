from fastapi import APIRouter
from app.api.v1 import dashboard

api_router = APIRouter()

# Include dashboard router for development
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

# Export the main router
__all__ = ["api_router"]
