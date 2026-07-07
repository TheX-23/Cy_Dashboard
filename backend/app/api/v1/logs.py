from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.database import get_db
from app.models.log import Log
from app.models.user import User
from app.api.schemas import Log as LogSchema, LogCreate, PaginatedResponse, PaginationParams
from app.api.deps import get_current_active_user, get_permissions
from app.services.redis_client import redis_client, REDIS_CHANNELS
import uuid
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=LogSchema)
async def create_log(
    log_data: LogCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new log entry"""
    try:
        # Create log entry
        db_log = Log(
            timestamp=log_data.timestamp,
            ip_address=log_data.ip_address,
            user_id=log_data.user_id or current_user.id,
            endpoint=log_data.endpoint,
            method=log_data.method,
            status_code=log_data.status_code,
            payload=log_data.payload,
            user_agent=log_data.user_agent
        )
        
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        
        # Publish to Redis for real-time processing
        log_dict = {
            "id": str(db_log.id),
            "timestamp": db_log.timestamp.isoformat(),
            "ip_address": db_log.ip_address,
            "user_id": str(db_log.user_id) if db_log.user_id else None,
            "endpoint": db_log.endpoint,
            "method": db_log.method,
            "status_code": db_log.status_code,
            "payload": db_log.payload,
            "user_agent": db_log.user_agent,
            "created_at": db_log.created_at.isoformat()
        }
        
        await redis_client.publish(REDIS_CHANNELS["LOGS"], log_dict)
        
        logger.info(f"Log created: {db_log.endpoint} from {db_log.ip_address}")
        
        return LogSchema.from_orm(db_log)
    
    except Exception as e:
        logger.error(f"Log creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/", response_model=PaginatedResponse)
async def get_logs(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    ip_address: Optional[str] = Query(None),
    endpoint: Optional[str] = Query(None),
    method: Optional[str] = Query(None),
    status_code: Optional[int] = Query(None),
    user_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get logs with filtering and pagination"""
    try:
        # Build query
        query = db.query(Log)
        
        # Apply filters
        if start_date:
            query = query.filter(Log.timestamp >= start_date)
        
        if end_date:
            query = query.filter(Log.timestamp <= end_date)
        
        if ip_address:
            query = query.filter(Log.ip_address == ip_address)
        
        if endpoint:
            query = query.filter(Log.endpoint.contains(endpoint))
        
        if method:
            query = query.filter(Log.method == method.upper())
        
        if status_code:
            query = query.filter(Log.status_code == status_code)
        
        if user_id:
            query = query.filter(Log.user_id == user_id)
        
        # Non-admin users can only see their own logs
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            query = query.filter(Log.user_id == current_user.id)
        
        # Order by timestamp (most recent first)
        query = query.order_by(desc(Log.timestamp))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * size
        logs = query.offset(offset).limit(size).all()
        
        # Calculate pages
        pages = (total + size - 1) // size
        
        return PaginatedResponse(
            items=[LogSchema.from_orm(log) for log in logs],
            total=total,
            page=page,
            size=size,
            pages=pages
        )
    
    except Exception as e:
        logger.error(f"Logs retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/{log_id}", response_model=LogSchema)
async def get_log(
    log_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific log by ID"""
    try:
        log = db.query(Log).filter(Log.id == log_id).first()
        
        if not log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Log not found"
            )
        
        # Check permissions
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False) and log.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        return LogSchema.from_orm(log)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Log retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/stats/summary")
async def get_log_stats(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get log statistics summary"""
    try:
        # Build base filter
        permissions = get_permissions(current_user)
        
        # Determine start time (default: 24h ago)
        filter_start = start_date if start_date else (datetime.utcnow() - timedelta(hours=24))
        
        # Base query filters
        filters = []
        if filter_start:
            filters.append(Log.timestamp >= filter_start)
        if end_date:
            filters.append(Log.timestamp <= end_date)
        if not permissions.get("manage_users", False):
            filters.append(Log.user_id == current_user.id)

        # Get total logs
        total_logs = db.query(Log).filter(*filters).count()
        
        # Get status code distribution
        status_distribution = db.query(
            Log.status_code,
            func.count(Log.id).label("count")
        ).filter(*filters).group_by(Log.status_code).order_by(desc("count")).all()
        
        # Get top endpoints
        top_endpoints = db.query(
            Log.endpoint,
            func.count(Log.id).label("count")
        ).filter(*filters).group_by(Log.endpoint).order_by(desc("count")).limit(10).all()
        
        # Get top IP addresses
        top_ips = db.query(
            Log.ip_address,
            func.count(Log.id).label("count")
        ).filter(*filters).group_by(Log.ip_address).order_by(desc("count")).limit(10).all()
        
        return {
            "total_logs": total_logs,
            "status_distribution": [
                {"status_code": row[0], "count": row[1]} for row in status_distribution
            ],
            "top_endpoints": [
                {"endpoint": row[0], "count": row[1]} for row in top_endpoints
            ],
            "top_ips": [
                {"ip_address": row[0], "count": row[1]} for row in top_ips
            ]
        }
    
    except Exception as e:
        logger.error(f"Log stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/stats/timeline")
async def get_log_timeline(
    hours: int = Query(24, ge=1, le=168),  # 1 hour to 1 week
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get log timeline data for the specified hours"""
    try:
        start_time = datetime.utcnow() - timedelta(hours=hours)
        permissions = get_permissions(current_user)
        
        # Base query filters
        filters = [Log.timestamp >= start_time]
        if not permissions.get("manage_users", False):
            filters.append(Log.user_id == current_user.id)
            
        # Determine database dialect
        is_sqlite = db.bind.dialect.name == "sqlite"
        if is_sqlite:
            # SQLite strftime
            hour_col = func.strftime('%Y-%m-%d %H:00:00', Log.timestamp).label("hour")
        else:
            # PostgreSQL date_trunc
            hour_col = func.date_trunc('hour', Log.timestamp).label("hour")
            
        query = db.query(
            hour_col,
            func.count(Log.id).label("count")
        ).filter(*filters).group_by(hour_col).order_by(hour_col.asc())
        
        timeline_query = query.all()
        
        timeline = []
        for row in timeline_query:
            hour_val = row[0]
            if hour_val is None:
                continue
            # If it's datetime object (PG), ISO format it. If it's string (SQLite), return directly.
            hour_str = hour_val.isoformat() if hasattr(hour_val, "isoformat") else str(hour_val)
            timeline.append({
                "hour": hour_str,
                "count": row[1]
            })
        
        return {"timeline": timeline}
    
    except Exception as e:
        logger.error(f"Log timeline error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.delete("/{log_id}")
async def delete_log(
    log_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a log entry"""
    try:
        log = db.query(Log).filter(Log.id == log_id).first()
        
        if not log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Log not found"
            )
        
        # Check permissions
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False) and log.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        
        db.delete(log)
        db.commit()
        
        logger.info(f"Log deleted: {log_id} by {current_user.email}")
        
        return {"message": "Log deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Log deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/bulk")
async def create_bulk_logs(
    logs_data: List[LogCreate],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create multiple log entries in bulk"""
    try:
        # Create log entries
        db_logs = []
        for log_data in logs_data:
            db_log = Log(
                timestamp=log_data.timestamp,
                ip_address=log_data.ip_address,
                user_id=log_data.user_id or current_user.id,
                endpoint=log_data.endpoint,
                method=log_data.method,
                status_code=log_data.status_code,
                payload=log_data.payload,
                user_agent=log_data.user_agent
            )
            db_logs.append(db_log)
        
        db.add_all(db_logs)
        db.commit()
        
        # Publish each log to Redis
        for db_log in db_logs:
            log_dict = {
                "id": str(db_log.id),
                "timestamp": db_log.timestamp.isoformat(),
                "ip_address": db_log.ip_address,
                "user_id": str(db_log.user_id) if db_log.user_id else None,
                "endpoint": db_log.endpoint,
                "method": db_log.method,
                "status_code": db_log.status_code,
                "payload": db_log.payload,
                "user_agent": db_log.user_agent,
                "created_at": db_log.created_at.isoformat()
            }
            
            await redis_client.publish(REDIS_CHANNELS["LOGS"], log_dict)
        
        logger.info(f"Bulk created {len(db_logs)} logs")
        
        return {"message": f"Successfully created {len(db_logs)} logs"}
    
    except Exception as e:
        logger.error(f"Bulk log creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
