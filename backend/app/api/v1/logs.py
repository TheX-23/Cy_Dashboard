from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
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
        # Build base query
        query = db.query(Log)
        
        # Apply date filters
        if start_date:
            query = query.filter(Log.timestamp >= start_date)
        else:
            # Default to last 24 hours
            query = query.filter(Log.timestamp >= datetime.utcnow() - timedelta(hours=24))
        
        if end_date:
            query = query.filter(Log.timestamp <= end_date)
        
        # Apply user filter for non-admin users
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            query = query.filter(Log.user_id == current_user.id)
        
        # Get statistics
        total_logs = query.count()
        
        # Get status code distribution
        status_distribution = db.execute(
            f"""
            SELECT status_code, COUNT(*) as count
            FROM logs 
            WHERE timestamp >= COALESCE(%s, NOW() - INTERVAL '24 hours')
            AND timestamp <= COALESCE(%s, NOW())
            AND (%s = true OR user_id = %s)
            GROUP BY status_code
            ORDER BY count DESC
            """,
            (start_date, end_date, permissions.get("manage_users", False), current_user.id)
        ).fetchall()
        
        # Get top endpoints
        top_endpoints = db.execute(
            f"""
            SELECT endpoint, COUNT(*) as count
            FROM logs 
            WHERE timestamp >= COALESCE(%s, NOW() - INTERVAL '24 hours')
            AND timestamp <= COALESCE(%s, NOW())
            AND (%s = true OR user_id = %s)
            GROUP BY endpoint
            ORDER BY count DESC
            LIMIT 10
            """,
            (start_date, end_date, permissions.get("manage_users", False), current_user.id)
        ).fetchall()
        
        # Get top IP addresses
        top_ips = db.execute(
            f"""
            SELECT ip_address, COUNT(*) as count
            FROM logs 
            WHERE timestamp >= COALESCE(%s, NOW() - INTERVAL '24 hours')
            AND timestamp <= COALESCE(%s, NOW())
            AND (%s = true OR user_id = %s)
            GROUP BY ip_address
            ORDER BY count DESC
            LIMIT 10
            """,
            (start_date, end_date, permissions.get("manage_users", False), current_user.id)
        ).fetchall()
        
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
        
        # Build query
        query = db.execute(
            f"""
            SELECT 
                DATE_TRUNC('hour', timestamp) as hour,
                COUNT(*) as count
            FROM logs 
            WHERE timestamp >= %s
            AND (%s = true OR user_id = %s)
            GROUP BY DATE_TRUNC('hour', timestamp)
            ORDER BY hour ASC
            """,
            (start_time, get_permissions(current_user).get("manage_users", False), current_user.id)
        ).fetchall()
        
        timeline = [
            {"hour": row[0].isoformat(), "count": row[1]} for row in query
        ]
        
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
