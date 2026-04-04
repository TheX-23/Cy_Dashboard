from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.user import User
from app.services.auth_service import auth_service
import uuid

# HTTP Bearer token scheme
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify JWT token
        payload = auth_service.verify_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    
    except Exception:
        raise credentials_exception
    
    # Get user from database
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

async def get_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Get current admin user"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def get_permissions(current_user: User = Depends(get_current_active_user)) -> dict:
    """Get user permissions"""
    return auth_service.get_user_permissions(current_user)

class RequirePermission:
    """Dependency class for requiring specific permissions"""
    
    def __init__(self, permission: str):
        self.permission = permission
    
    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        permissions = auth_service.get_user_permissions(current_user)
        
        if not permissions.get(self.permission, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{self.permission}' required"
            )
        
        return current_user

# Permission dependencies
require_manage_users = RequirePermission("manage_users")
require_manage_settings = RequirePermission("manage_settings")
require_execute_soar = RequirePermission("execute_soar")
require_create_alerts = RequirePermission("create_alerts")
require_create_incidents = RequirePermission("create_incidents")
