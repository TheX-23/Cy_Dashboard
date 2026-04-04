from sqlalchemy import Column, String, DateTime, Integer, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.models.database import Base
import enum
import uuid


class ThreatIntelType(str, enum.Enum):
    MALICIOUS_IP = "malicious_ip"
    SUSPICIOUS_IP = "suspicious_ip"
    MALWARE_DOMAIN = "malware_domain"
    PHISHING_DOMAIN = "phishing_domain"
    C2_SERVER = "c2_server"
    TOR_EXIT_NODE = "tor_exit_node"
    PROXY_SERVER = "proxy_server"
    BOTNET = "botnet"


class ThreatIntelSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ThreatIntel(Base):
    __tablename__ = "threat_intel"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_ip = Column(String(45), nullable=True, index=True)
    destination_ip = Column(String(45), nullable=True, index=True)
    domain = Column(String(255), nullable=True, index=True)
    url = Column(Text, nullable=True)
    country_from = Column(String(2), nullable=True, index=True)  # ISO country code
    country_to = Column(String(2), nullable=True, index=True)
    threat_type = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    confidence_score = Column(Integer, default=50)  # 0-100 confidence
    source = Column(String(100), nullable=False)  # Source of threat intel (e.g., "VirusTotal", "AbuseIPDB")
    description = Column(Text, nullable=True)
    tags = Column(Text, nullable=True)  # Comma-separated tags
    first_seen = Column(DateTime(timezone=True), nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(String(10), default="true", nullable=False)  # Using string for compatibility
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Composite indexes for better query performance
    __table_args__ = (
        Index('idx_threat_intel_source_ip_type', 'source_ip', 'threat_type'),
        Index('idx_threat_intel_domain_type', 'domain', 'threat_type'),
        Index('idx_threat_intel_severity_active', 'severity', 'is_active'),
        Index('idx_threat_intel_created_at', 'created_at'),
    )

    def __repr__(self):
        return f"<ThreatIntel(id={self.id}, threat_type={self.threat_type}, severity={self.severity})>"
