from fastapi import APIRouter
from app.api.v1 import dashboard, chat, auth, alerts, logs

api_router = APIRouter()

# Include routes
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(logs.router, prefix="/logs", tags=["Logs"])

# Export the main router
__all__ = ["api_router"]
