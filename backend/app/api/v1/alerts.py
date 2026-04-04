from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from app.models.database import get_db
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.user import User
from app.api.schemas import (
    Alert as AlertSchema, AlertCreate, AlertUpdate, 
    PaginatedResponse, PaginationParams
)
from app.api.deps import get_current_active_user, get_permissions, require_create_alerts
from app.services.redis_client import redis_client, REDIS_CHANNELS
import uuid
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=AlertSchema)
async def create_alert(
    alert_data: AlertCreate,
    current_user: User = Depends(require_create_alerts),
    db: Session = Depends(get_db)
):
    """Create a new alert"""
    try:
        # Create alert
        db_alert = Alert(
            detection_id=alert_data.detection_id,
            severity=alert_data.severity,
            status=alert_data.status or AlertStatus.OPEN,
            title=alert_data.title,
            description=alert_data.description,
            source_ip=alert_data.source_ip,
            target_ip=alert_data.target_ip,
            assigned_to=alert_data.assigned_to
        )
        
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        
        # Publish to Redis for real-time updates
        alert_dict = {
            "id": str(db_alert.id),
            "detection_id": str(db_alert.detection_id),
            "severity": db_alert.severity,
            "status": db_alert.status,
            "title": db_alert.title,
            "description": db_alert.description,
            "source_ip": db_alert.source_ip,
            "target_ip": db_alert.target_ip,
            "assigned_to": str(db_alert.assigned_to) if db_alert.assigned_to else None,
            "created_at": db_alert.created_at.isoformat()
        }
        
        await redis_client.publish(REDIS_CHANNELS["ALERTS"], alert_dict)
        
        logger.info(f"Alert created: {db_alert.title} by {current_user.email}")
        
        return AlertSchema.from_orm(db_alert)
    
    except Exception as e:
        logger.error(f"Alert creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/", response_model=PaginatedResponse)
async def get_alerts(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    severity: Optional[AlertSeverity] = Query(None),
    status: Optional[AlertStatus] = Query(None),
    assigned_to: Optional[uuid.UUID] = Query(None),
    source_ip: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get alerts with filtering and pagination"""
    try:
        # Build query
        query = db.query(Alert)
        
        # Apply filters
        if severity:
            query = query.filter(Alert.severity == severity)
        
        if status:
            query = query.filter(Alert.status == status)
        
        if assigned_to:
            query = query.filter(Alert.assigned_to == assigned_to)
        
        if source_ip:
            query = query.filter(Alert.source_ip == source_ip)
        
        if search:
            query = query.filter(
                or_(
                    Alert.title.contains(search),
                    Alert.description.contains(search)
                )
            )
        
        # Non-admin users can only see alerts assigned to them or unassigned
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            query = query.filter(
                or_(
                    Alert.assigned_to == current_user.id,
                    Alert.assigned_to.is_(None)
                )
            )
        
        # Order by created_at (most recent first)
        query = query.order_by(desc(Alert.created_at))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        alerts = query.offset(offset).limit(size).all()
        
        # Calculate pages
        pages = (total + size - 1) // size
        
        return PaginatedResponse(
            items=[AlertSchema.from_orm(alert) for alert in alerts],
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    
    except Exception as e:
        logger.error(f"Alerts retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{alert_id}", response_model=AlertSchema)
async def get_alert(
    alert_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific alert by ID"""
    try:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert not found"
            )
        
        # Check permissions
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            if alert.assigned_to != current_user.id and alert.assigned_to is not None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions"
                )
        
        return AlertSchema.from_orm(alert)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Alert retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/{alert_id}", response_model=AlertSchema)
async def update_alert(
    alert_id: uuid.UUID,
    alert_update: AlertUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an existing alert"""
    try:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert not found"
            )
        
        # Check permissions
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            if alert.assigned_to != current_user.id and alert.assigned_to is not None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions"
                )
        
        # Update alert fields
        update_data = alert_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(alert, field):
                setattr(alert, field, value)
        
        # Set resolved_at if status is resolved
        if alert_update.status == AlertStatus.RESOLVED and alert.status != AlertStatus.RESOLVED:
            alert.resolved_at = datetime.utcnow()
        
        db.commit()
        db.refresh(alert)
        
        # Publish update to Redis
        alert_dict = {
            "id": str(alert.id),
            "severity": alert.severity,
            "status": alert.status,
            "title": alert.title,
            "description": alert.description,
            "source_ip": alert.source_ip,
            "target_ip": alert.target_ip,
            "assigned_to": str(alert.assigned_to) if alert.assigned_to else None,
            "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
            "updated_at": alert.updated_at.isoformat() if alert.updated_at else None
        }
        
        await redis_client.publish(REDIS_CHANNELS["ALERTS"], alert_dict)
        
        logger.info(f"Alert updated: {alert.id} by {current_user.email}")
        
        return AlertSchema.from_orm(alert)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Alert update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.delete("/{alert_id}")
async def delete_alert(
    alert_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an alert"""
    try:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert not found"
            )
        
        # Check permissions
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            if alert.assigned_to != current_user.id and alert.assigned_to is not None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions"
                )
        
        db.delete(alert)
        db.commit()
        
        # Publish deletion to Redis
        await redis_client.publish(REDIS_CHANNELS["ALERTS"], {
            "id": str(alert_id),
            "action": "deleted",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Alert deleted: {alert_id} by {current_user.email}")
        
        return {"message": "Alert deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Alert deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/{alert_id}/assign")
async def assign_alert(
    alert_id: uuid.UUID,
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Assign alert to a user"""
    try:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert not found"
            )
        
        # Check permissions
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        # Assign alert
        alert.assigned_to = user_id
        db.commit()
        
        # Publish assignment to Redis
        await redis_client.publish(REDIS_CHANNELS["ALERTS"], {
            "id": str(alert_id),
            "assigned_to": str(user_id),
            "action": "assigned",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Alert {alert_id} assigned to user {user_id} by {current_user.email}")
        
        return {"message": "Alert assigned successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Alert assignment error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: uuid.UUID,
    resolution_notes: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark alert as resolved"""
    try:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert not found"
            )
        
        # Check permissions
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            if alert.assigned_to != current_user.id and alert.assigned_to is not None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not enough permissions"
                )
        
        # Resolve alert
        alert.status = AlertStatus.RESOLVED
        alert.resolved_at = datetime.utcnow()
        
        if resolution_notes:
            alert.description = (alert.description or "") + f"\n\nResolution: {resolution_notes}"
        
        db.commit()
        
        # Publish resolution to Redis
        await redis_client.publish(REDIS_CHANNELS["ALERTS"], {
            "id": str(alert_id),
            "status": AlertStatus.RESOLVED,
            "resolved_at": alert.resolved_at.isoformat(),
            "action": "resolved",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Alert {alert_id} resolved by {current_user.email}")
        
        return {"message": "Alert resolved successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Alert resolution error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/stats/summary")
async def get_alert_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get alert statistics summary"""
    try:
        # Build base query
        query = db.query(Alert)
        
        # Apply user filter for non-admin users
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            query = query.filter(
                or_(
                    Alert.assigned_to == current_user.id,
                    Alert.assigned_to.is_(None)
                )
            )
        
        # Get total counts by severity
        severity_counts = db.execute(
            f"""
            SELECT severity, COUNT(*) as count
            FROM alerts 
            WHERE (%s = true OR assigned_to = %s OR assigned_to IS NULL)
            GROUP BY severity
            """,
            (permissions.get("manage_users", False), current_user.id)
        ).fetchall()
        
        # Get total counts by status
        status_counts = db.execute(
            f"""
            SELECT status, COUNT(*) as count
            FROM alerts 
            WHERE (%s = true OR assigned_to = %s OR assigned_to IS NULL)
            GROUP BY status
            """,
            (permissions.get("manage_users", False), current_user.id)
        ).fetchall()
        
        # Get recent alerts (last 24 hours)
        recent_alerts = db.execute(
            f"""
            SELECT COUNT(*) as count
            FROM alerts 
            WHERE created_at >= NOW() - INTERVAL '24 hours'
            AND (%s = true OR assigned_to = %s OR assigned_to IS NULL)
            """,
            (permissions.get("manage_users", False), current_user.id)
        ).fetchone()
        
        return {
            "severity_distribution": [
                {"severity": row[0], "count": row[1]} for row in severity_counts
            ],
            "status_distribution": [
                {"status": row[0], "count": row[1]} for row in status_counts
            ],
            "recent_alerts": recent_alerts[0] if recent_alerts else 0
        }
    
    except Exception as e:
        logger.error(f"Alert stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
