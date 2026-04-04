from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.database import Base
import enum
import uuid


class TriggerType(str, enum.Enum):
    ALERT = "alert"
    INCIDENT = "incident"
    MANUAL = "manual"
    SCHEDULED = "scheduled"


class ActionType(str, enum.Enum):
    BLOCK_IP = "block_ip"
    NOTIFY = "notify"
    DISABLE_USER = "disable_user"
    ISOLATE_SYSTEM = "isolate_system"
    BLOCK_URL = "block_url"
    UPDATE_FIREWALL = "update_firewall"
    CREATE_TICKET = "create_ticket"
    RUN_SCRIPT = "run_script"
    WEBHOOK = "webhook"


class ExecutionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class SOARPlaybook(Base):
    __tablename__ = "soar_playbooks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    trigger_type = Column(String(20), nullable=False)
    trigger_conditions = Column(JSONB, nullable=True)  # JSON conditions for auto-trigger
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    actions = relationship("SOARAction", back_populates="playbook", cascade="all, delete-orphan")
    execution_logs = relationship("SOARExecutionLog", back_populates="playbook")

    def __repr__(self):
        return f"<SOARPlaybook(id={self.id}, name={self.name}, trigger_type={self.trigger_type})>"


class SOARAction(Base):
    __tablename__ = "soar_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    playbook_id = Column(UUID(as_uuid=True), ForeignKey("soar_playbooks.id"), nullable=False)
    action_type = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    config = Column(JSONB, nullable=True)  # Action-specific configuration
    order_index = Column(Integer, nullable=False, default=0)
    timeout_seconds = Column(Integer, default=300)  # Action timeout
    retry_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    playbook = relationship("SOARPlaybook", back_populates="actions")

    def __repr__(self):
        return f"<SOARAction(id={self.id}, action_type={self.action_type}, order_index={self.order_index})>"


class SOARExecutionLog(Base):
    __tablename__ = "soar_execution_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    playbook_id = Column(UUID(as_uuid=True), ForeignKey("soar_playbooks.id"), nullable=False, index=True)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id"), nullable=True, index=True)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=True, index=True)
    status = Column(String(20), nullable=False, index=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    execution_details = Column(JSONB, nullable=True)  # Detailed execution results
    error_message = Column(Text, nullable=True)
    triggered_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # User who triggered execution

    # Relationships
    playbook = relationship("SOARPlaybook", back_populates="execution_logs")
    alert = relationship("Alert")
    incident = relationship("Incident")

    def __repr__(self):
        return f"<SOARExecutionLog(id={self.id}, playbook_id={self.playbook_id}, status={self.status})>"
