from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import bcrypt
from jose import JWTError, jwt
from app.core.config import settings
import uuid
import logging

logger = logging.getLogger(__name__)

class DevAuthService:
    """Development authentication service that works without database"""
    
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash using bcrypt"""
        try:
            return bcrypt.checkpw(
                plain_password.encode("utf-8"),
                hashed_password.encode("utf-8")
            )
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False

    def get_password_hash(self, password: str) -> str:
        """Generate password hash using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

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

    async def authenticate_user(self, email: str, password: str) -> Optional[Any]:
        """Development authentication - works without database"""
        
        # Default admin credentials from init.sql
        ADMIN_EMAIL = "admin@sentinelx.com"
        ADMIN_PASSWORD_HASH = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LF"
        
        logger.info(f"Development auth attempt for email: {email}")
        
        if email == ADMIN_EMAIL and self.verify_password(password, ADMIN_PASSWORD_HASH):
            logger.info(f"Development auth successful for: {email}")
            return {
                "id": uuid.UUID("00000000-0000-0000-0000-000000000001"),
                "email": email,
                "name": "System Administrator",
                "role": "admin",
                "is_active": True
            }
        
        logger.warning(f"Development auth failed for: {email}")
        return None

# Global instance
dev_auth_service = DevAuthService()
