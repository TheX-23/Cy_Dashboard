from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.models.database import Base
import enum
import uuid


class IntegrationType(str, enum.Enum):
    SLACK = "slack"
    EMAIL = "email"
    WEBHOOK = "webhook"
    SIEM = "siem"
    TICKETING = "ticketing"
    THREAT_INTEL = "threat_intel"
    VULNERABILITY = "vulnerability"
    CLOUD_PROVIDER = "cloud_provider"


class Integration(Base):
    __tablename__ = "integrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    config = Column(JSONB, nullable=False)  # Integration-specific configuration
    is_active = Column(Boolean, default=True, nullable=False)
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Integration(id={self.id}, name={self.name}, type={self.type})>"
