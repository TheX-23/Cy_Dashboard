from datetime import timedelta
from typing import Any
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.database import get_db
from app.models.user import User
from app.api.schemas import (
    LoginRequest, LoginResponse, User as UserSchema, UserCreate
)
from app.api.deps import get_current_active_user
from app.services.auth_service import auth_service
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.get("/test")
async def test_auth():
    """Test authentication endpoint"""
    return {"message": "Auth API is working", "status": "ok"}


@router.post("/register", response_model=UserSchema)
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user and return user details"""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user in database
        new_user = User(
            id=uuid.uuid4(),
            email=user_in.email,
            name=user_in.name,
            password_hash=auth_service.get_password_hash(user_in.password),
            role=user_in.role or "analyst",
            is_active=True
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"User {new_user.email} registered successfully")
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during registration"
        )


@router.post("/login", response_model=LoginResponse)
async def login(user_credentials: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    try:
        # Authenticate user
        user = await auth_service.authenticate_user(
            db, user_credentials.email, user_credentials.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=auth_service.access_token_expire_minutes)
        access_token = auth_service.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        # Log successful login
        logger.info(f"User {user.email} logged in successfully")
        
        # Convert SQLAlchemy object to UserSchema compatible dict/object
        user_schema = UserSchema(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at.isoformat() if user.created_at else None
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=auth_service.access_token_expire_minutes * 60,
            user=user_schema
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
async def get_current_user(current_user: User = Depends(get_current_active_user)):
    """Get current authenticated user info"""
    return UserSchema(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout current user (token revocation can be handled here if session tracking is active)"""
    return {"message": "Successfully logged out"}


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(current_user: User = Depends(get_current_active_user)):
    """Refresh JWT token for active user"""
    access_token_expires = timedelta(minutes=auth_service.access_token_expire_minutes)
    access_token = auth_service.create_access_token(
        data={"sub": str(current_user.id)}, expires_delta=access_token_expires
    )
    return TokenRefreshResponse(access_token=access_token)


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change password for authenticated user"""
    # Verify current password
    if not auth_service.verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.password_hash = auth_service.get_password_hash(data.new_password)
    db.add(current_user)
    db.commit()
    
    return {"message": "Password changed successfully"}
