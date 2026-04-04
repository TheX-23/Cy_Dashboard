from datetime import timedelta
from typing import Any
from fastapi import APIRouter, HTTPException, status
from app.api.schemas import (
    LoginRequest, LoginResponse, User as UserSchema
)
from app.services.dev_auth_service import dev_auth_service
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/test")
async def test_auth():
    """Test authentication endpoint"""
    return {"message": "Auth API is working", "status": "ok"}


@router.post("/login", response_model=LoginResponse)
async def login(user_credentials: LoginRequest):
    """Authenticate user and return access token (development mode)"""
    try:
        # Authenticate user
        user = await dev_auth_service.authenticate_user(
            user_credentials.email, user_credentials.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=dev_auth_service.access_token_expire_minutes)
        access_token = dev_auth_service.create_access_token(
            data={"sub": str(user["id"])}, expires_delta=access_token_expires
        )
        
        # Log successful login
        logger.info(f"User {user['email']} logged in successfully")
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=dev_auth_service.access_token_expire_minutes * 60,
            user=UserSchema(**user)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )


@router.get("/me", response_model=UserSchema)
async def get_current_user():
    """Get current user info (development mode - returns mock user)"""
    return UserSchema(
        id=uuid.uuid4(),
        email="admin@sentinelx.com",
        name="System Administrator",
        role="admin",
        is_active=True,
        created_at="2024-01-01T00:00:00Z"
    )
