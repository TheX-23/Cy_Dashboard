import redis.asyncio as redis
import json
import logging
from typing import Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.redis: Optional[redis.Redis] = None

    async def connect(self):
        """Initialize Redis connection"""
        try:
            self.redis = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
            await self.redis.ping()
            logger.info("Connected to Redis")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise

    async def disconnect(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()
            logger.info("Disconnected from Redis")

    async def set(self, key: str, value: Any, expire: Optional[int] = None):
        """Set key-value pair with optional expiration"""
        if not self.redis:
            await self.connect()
        
        serialized_value = json.dumps(value) if not isinstance(value, str) else value
        await self.redis.set(key, serialized_value, ex=expire)

    async def get(self, key: str) -> Optional[Any]:
        """Get value by key"""
        if not self.redis:
            await self.connect()
        
        value = await self.redis.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None

    async def delete(self, key: str):
        """Delete key"""
        if not self.redis:
            await self.connect()
        
        await self.redis.delete(key)

    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        if not self.redis:
            await self.connect()
        
        return bool(await self.redis.exists(key))

    async def publish(self, channel: str, message: Any):
        """Publish message to channel"""
        if not self.redis:
            await self.connect()
        
        serialized_message = json.dumps(message) if not isinstance(message, str) else message
        await self.redis.publish(channel, serialized_message)

    async def subscribe(self, channel: str):
        """Subscribe to channel"""
        if not self.redis:
            await self.connect()
        
        pubsub = self.redis.pubsub()
        await pubsub.subscribe(channel)
        return pubsub

    async def increment(self, key: str, amount: int = 1, expire: Optional[int] = None):
        """Increment counter"""
        if not self.redis:
            await self.connect()
        
        result = await self.redis.incrby(key, amount)
        if expire:
            await self.redis.expire(key, expire)
        return result

    async def expire(self, key: str, seconds: int):
        """Set expiration for key"""
        if not self.redis:
            await self.connect()
        
        await self.redis.expire(key, seconds)

    async def ttl(self, key: str) -> int:
        """Get time to live for key"""
        if not self.redis:
            await self.connect()
        
        return await self.redis.ttl(key)

# Global Redis client instance
redis_client = RedisClient()

# Channel names
REDIS_CHANNELS = {
    "LOGS": "logs_channel",
    "ALERTS": "alerts_channel", 
    "THREATS": "threats_channel",
    "INCIDENTS": "incidents_channel",
    "DETECTIONS": "detections_channel",
    "SOAR": "soar_channel"
}

# Cache keys
CACHE_KEYS = {
    "DASHBOARD_STATS": "dashboard_stats",
    "USER_SESSION": "user_session:",
    "RATE_LIMIT": "rate_limit:",
    "API_USAGE": "api_usage:",
    "THREAT_INTEL": "threat_intel:",
    "ACTIVE_DETECTIONS": "active_detections"
}
