from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, validator
import uuid


# Base schemas
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True
        populate_by_name = True


# User schemas
class UserBase(BaseSchema):
    email: EmailStr
    name: str
    role: str


class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserUpdate(BaseSchema):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class User(UserBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


# Authentication schemas
class Token(BaseSchema):
    access_token: str
    token_type: str
    expires_in: int


class TokenData(BaseSchema):
    sub: Optional[str] = None


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str


class LoginResponse(BaseSchema):
    access_token: str
    token_type: str
    expires_in: int
    user: User


# Log schemas
class LogBase(BaseSchema):
    ip_address: str
    endpoint: str
    method: str
    status_code: int
    payload: Optional[Dict[str, Any]] = None
    user_agent: Optional[str] = None


class LogCreate(LogBase):
    timestamp: datetime
    user_id: Optional[uuid.UUID] = None


class Log(LogBase):
    id: uuid.UUID
    timestamp: datetime
    user_id: Optional[uuid.UUID] = None
    created_at: datetime


# Detection schemas
class DetectionBase(BaseSchema):
    rule_triggered: str
    threat_type: str
    risk_score: int
    description: Optional[str] = None
    source_ip: Optional[str] = None
    target_ip: Optional[str] = None


class DetectionCreate(DetectionBase):
    log_id: uuid.UUID


class Detection(DetectionBase):
    id: uuid.UUID
    log_id: uuid.UUID
    created_at: datetime


# Alert schemas
class AlertBase(BaseSchema):
    severity: str
    status: str
    title: str
    description: Optional[str] = None
    source_ip: Optional[str] = None
    target_ip: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None


class AlertCreate(AlertBase):
    detection_id: uuid.UUID


class AlertUpdate(BaseSchema):
    severity: Optional[str] = None
    status: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None


class Alert(AlertBase):
    id: uuid.UUID
    detection_id: uuid.UUID
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# Incident schemas
class IncidentBase(BaseSchema):
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    assigned_to: Optional[uuid.UUID] = None
    impact_assessment: Optional[str] = None
    resolution_notes: Optional[str] = None


class IncidentCreate(IncidentBase):
    created_by: uuid.UUID


class IncidentUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    impact_assessment: Optional[str] = None
    resolution_notes: Optional[str] = None


class Incident(IncidentBase):
    id: uuid.UUID
    created_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None


# Incident Alert junction schema
class IncidentAlertBase(BaseSchema):
    incident_id: uuid.UUID
    alert_id: uuid.UUID


class IncidentAlert(IncidentAlertBase):
    id: uuid.UUID
    created_at: datetime


# SOAR schemas
class SOARActionBase(BaseSchema):
    action_type: str
    name: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    order_index: int
    timeout_seconds: int = 300
    retry_count: int = 0
    is_active: bool = True


class SOARActionCreate(SOARActionBase):
    playbook_id: uuid.UUID


class SOARAction(SOARActionBase):
    id: uuid.UUID
    playbook_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


class SOARPlaybookBase(BaseSchema):
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_conditions: Optional[Dict[str, Any]] = None
    is_active: bool = True


class SOARPlaybookCreate(SOARPlaybookBase):
    pass


class SOARPlaybookUpdate(BaseSchema):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_conditions: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class SOARPlaybook(SOARPlaybookBase):
    id: uuid.UUID
    created_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    actions: List[SOARAction] = []


class SOARExecutionLogBase(BaseSchema):
    playbook_id: uuid.UUID
    alert_id: Optional[uuid.UUID] = None
    incident_id: Optional[uuid.UUID] = None
    status: str
    execution_details: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    triggered_by: Optional[uuid.UUID] = None


class SOARExecutionLog(SOARExecutionLogBase):
    id: uuid.UUID
    started_at: datetime
    completed_at: Optional[datetime] = None


class ExecutePlaybookRequest(BaseSchema):
    playbook_id: uuid.UUID
    context: Optional[Dict[str, Any]] = None


# Integration schemas
class IntegrationBase(BaseSchema):
    name: str
    type: str
    description: Optional[str] = None
    config: Dict[str, Any]
    is_active: bool = True


class IntegrationCreate(IntegrationBase):
    pass


class IntegrationUpdate(BaseSchema):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class Integration(IntegrationBase):
    id: uuid.UUID
    last_sync_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# API Key schemas
class APIKeyBase(BaseSchema):
    name: str
    permissions: List[str]
    rate_limit: int = 1000
    expires_at: Optional[datetime] = None


class APIKeyCreate(APIKeyBase):
    pass


class APIKeyUpdate(BaseSchema):
    name: Optional[str] = None
    permissions: Optional[List[str]] = None
    rate_limit: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None


class APIKey(APIKeyBase):
    id: uuid.UUID
    key: str
    last_used_at: Optional[datetime] = None
    usage_count: int
    is_active: bool
    created_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


# Audit Log schemas
class AuditLogBase(BaseSchema):
    user_id: Optional[uuid.UUID] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLog(AuditLogBase):
    id: uuid.UUID
    timestamp: datetime


# Threat Intel schemas
class ThreatIntelBase(BaseSchema):
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    domain: Optional[str] = None
    url: Optional[str] = None
    country_from: Optional[str] = None
    country_to: Optional[str] = None
    threat_type: str
    severity: str
    confidence_score: int = 50
    source: str
    description: Optional[str] = None
    tags: Optional[str] = None
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    is_active: str = "true"
    expires_at: Optional[datetime] = None


class ThreatIntelCreate(ThreatIntelBase):
    pass


class ThreatIntelUpdate(BaseSchema):
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    domain: Optional[str] = None
    url: Optional[str] = None
    country_from: Optional[str] = None
    country_to: Optional[str] = None
    threat_type: Optional[str] = None
    severity: Optional[str] = None
    confidence_score: Optional[int] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    is_active: Optional[str] = None
    expires_at: Optional[datetime] = None


class ThreatIntel(ThreatIntelBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None


# Dashboard schemas
class DashboardStats(BaseSchema):
    total_alerts: int
    critical_alerts: int
    high_alerts: int
    medium_alerts: int
    low_alerts: int
    total_incidents: int
    open_incidents: int
    resolved_incidents: int
    total_detections: int
    threats_blocked: int
    uptime: float


class AlertTrend(BaseSchema):
    date: str
    critical: int
    high: int
    medium: int
    low: int


class ThreatMap(BaseSchema):
    country: str
    threats: int
    severity: str


# Pagination schemas
class PaginationParams(BaseSchema):
    page: int = 1
    size: int = 50
    
    @validator('page')
    def validate_page(cls, v):
        if v < 1:
            raise ValueError('Page must be >= 1')
        return v
    
    @validator('size')
    def validate_size(cls, v):
        if v < 1 or v > 100:
            raise ValueError('Size must be between 1 and 100')
        return v


class PaginatedResponse(BaseSchema):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int
