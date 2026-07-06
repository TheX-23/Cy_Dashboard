from fastapi import APIRouter
from app.api.v1 import dashboard, chat

api_router = APIRouter()

# Include dashboard router for development
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])

# Export the main router
__all__ = ["api_router"]
