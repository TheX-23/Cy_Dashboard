from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.session import Session as UserSession
from app.core.config import settings
from app.services.redis_client import redis_client, CACHE_KEYS
import uuid
import logging

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.session_expire_hours = settings.SESSION_EXPIRE_HOURS

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Generate password hash"""
        return pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            return None

    async def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        
        if not self.verify_password(password, user.password_hash):
            return None
        
        # Check rate limiting
        rate_limit_key = f"{CACHE_KEYS['RATE_LIMIT']}{email}"
        attempts = await redis_client.get(rate_limit_key) or 0
        
        if attempts >= 5:  # Max 5 failed attempts
            logger.warning(f"Rate limit exceeded for email: {email}")
            return None
        
        if not self.verify_password(password, user.password_hash):
            # Increment failed attempts
            await redis_client.increment(rate_limit_key, expire=3600)  # 1 hour
            return None
        
        # Clear failed attempts on successful login
        await redis_client.delete(rate_limit_key)
        return user

    async def create_user_session(self, db: Session, user_id: uuid.UUID) -> UserSession:
        """Create user session"""
        # Generate session token
        session_token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(hours=self.session_expire_hours)
        
        # Create session in database
        db_session = UserSession(
            user_id=user_id,
            token=session_token,
            expires_at=expires_at
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        
        # Cache session in Redis
        cache_key = f"{CACHE_KEYS['USER_SESSION']}{session_token}"
        await redis_client.set(
            cache_key, 
            {"user_id": str(user_id), "expires_at": expires_at.isoformat()},
            expire=self.session_expire_hours * 3600
        )
        
        return db_session

    async def validate_session(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate session token"""
        # Check Redis cache first
        cache_key = f"{CACHE_KEYS['USER_SESSION']}{token}"
        cached_session = await redis_client.get(cache_key)
        
        if cached_session:
            expires_at = datetime.fromisoformat(cached_session["expires_at"])
            if expires_at > datetime.utcnow():
                return cached_session
            else:
                # Session expired, remove from cache
                await redis_client.delete(cache_key)
                return None
        
        # Check database if not in cache
        from app.models.database import SessionLocal
        db = SessionLocal()
        try:
            db_session = db.query(UserSession).filter(
                UserSession.token == token,
                UserSession.expires_at > datetime.utcnow()
            ).first()
            
            if db_session:
                # Cache the session
                await redis_client.set(
                    cache_key,
                    {"user_id": str(db_session.user_id), "expires_at": db_session.expires_at.isoformat()},
                    expire=self.session_expire_hours * 3600
                )
                return {"user_id": str(db_session.user_id), "expires_at": db_session.expires_at.isoformat()}
            
            return None
        finally:
            db.close()

    async def revoke_session(self, token: str) -> bool:
        """Revoke session token"""
        # Remove from cache
        cache_key = f"{CACHE_KEYS['USER_SESSION']}{token}"
        await redis_client.delete(cache_key)
        
        # Remove from database
        from app.models.database import SessionLocal
        db = SessionLocal()
        try:
            db_session = db.query(UserSession).filter(UserSession.token == token).first()
            if db_session:
                db.delete(db_session)
                db.commit()
                return True
            return False
        finally:
            db.close()

    async def revoke_all_user_sessions(self, user_id: uuid.UUID) -> bool:
        """Revoke all sessions for a user"""
        from app.models.database import SessionLocal
        db = SessionLocal()
        try:
            # Delete from database
            db.query(UserSession).filter(UserSession.user_id == user_id).delete()
            db.commit()
            
            # Note: Redis sessions will expire naturally or can be cleaned up by a background job
            return True
        finally:
            db.close()

    def get_user_permissions(self, user: User) -> Dict[str, bool]:
        """Get user permissions based on role"""
        permissions = {
            "view_dashboard": True,
            "view_logs": True,
            "view_alerts": True,
            "view_incidents": True,
            "view_detections": True,
            "view_soar": True,
            "view_settings": True
        }
        
        if user.role == UserRole.VIEWER:
            return {
                **permissions,
                "create_alerts": False,
                "create_incidents": False,
                "manage_users": False,
                "manage_settings": False,
                "execute_soar": False
            }
        
        elif user.role == UserRole.ANALYST:
            return {
                **permissions,
                "create_alerts": True,
                "create_incidents": True,
                "manage_users": False,
                "manage_settings": False,
                "execute_soar": True
            }
        
        elif user.role == UserRole.ADMIN:
            return {
                **permissions,
                "create_alerts": True,
                "create_incidents": True,
                "manage_users": True,
                "manage_settings": True,
                "execute_soar": True
            }
        
        return permissions

# Global auth service instance
auth_service = AuthService()
