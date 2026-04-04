from fastapi import APIRouter
from app.api.v1 import auth

api_router = APIRouter()

# Include only auth router for development
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Export the main router
__all__ = ["api_router"]
