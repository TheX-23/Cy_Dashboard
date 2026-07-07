from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_, case, text
from app.models.database import get_db
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.incident import Incident, IncidentStatus
from app.models.detection import Detection
from app.models.threat_intel import ThreatIntel
from app.models.user import User
from app.api.schemas import DashboardStats, AlertTrend, ThreatMap
from app.api.deps import get_current_active_user, get_permissions
from app.services.redis_client import redis_client, CACHE_KEYS
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    try:
        # Check cache first
        cache_key = CACHE_KEYS["DASHBOARD_STATS"]
        cached_stats = await redis_client.get(cache_key)
        
        if cached_stats:
            return DashboardStats(**cached_stats)
        
        # Build base queries
        alert_query = db.query(Alert)
        incident_query = db.query(Incident)
        detection_query = db.query(Detection)
        
        # Apply user filter for non-admin users
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            alert_query = alert_query.filter(
                or_(
                    Alert.assigned_to == current_user.id,
                    Alert.assigned_to.is_(None)
                )
            )
            incident_query = incident_query.filter(
                or_(
                    Incident.assigned_to == current_user.id,
                    Incident.assigned_to.is_(None)
                )
            )
        
        # Get alert statistics
        total_alerts = alert_query.count()
        critical_alerts = alert_query.filter(
            Alert.severity == AlertSeverity.CRITICAL,
            Alert.status != AlertStatus.RESOLVED
        ).count()
        high_alerts = alert_query.filter(
            Alert.severity == AlertSeverity.HIGH,
            Alert.status != AlertStatus.RESOLVED
        ).count()
        medium_alerts = alert_query.filter(
            Alert.severity == AlertSeverity.MEDIUM,
            Alert.status != AlertStatus.RESOLVED
        ).count()
        low_alerts = alert_query.filter(
            Alert.severity == AlertSeverity.LOW,
            Alert.status != AlertStatus.RESOLVED
        ).count()
        
        # Get incident statistics
        total_incidents = incident_query.count()
        open_incidents = incident_query.filter(
            Incident.status == IncidentStatus.OPEN
        ).count()
        resolved_incidents = incident_query.filter(
            Incident.status == IncidentStatus.RESOLVED
        ).count()
        
        # Get detection statistics
        total_detections = detection_query.count()
        
        # Get threats blocked (from threat intel)
        threats_blocked = db.query(ThreatIntel).filter(
            ThreatIntel.is_active == "true"
        ).count()
        
        # Calculate uptime (mock data for now)
        uptime = 99.97
        
        stats = DashboardStats(
            total_alerts=total_alerts,
            critical_alerts=critical_alerts,
            high_alerts=high_alerts,
            medium_alerts=medium_alerts,
            low_alerts=low_alerts,
            total_incidents=total_incidents,
            open_incidents=open_incidents,
            resolved_incidents=resolved_incidents,
            total_detections=total_detections,
            threats_blocked=threats_blocked,
            uptime=uptime
        )
        
        # Cache for 5 minutes
        await redis_client.set(cache_key, stats.dict(), expire=300)
        
        return stats
    
    except Exception as e:
        logger.error(f"Dashboard stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/alert-trends", response_model=List[AlertTrend])
async def get_alert_trends(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get alert trends for the specified number of days"""
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Group by date using SQLAlchemy (works for SQLite & Postgres)
        date_func = func.date(Alert.created_at)
        
        # Build base filter
        query_filter = [Alert.created_at >= start_date]
        
        # Apply user filter for non-admin users
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            query_filter.append(
                or_(
                    Alert.assigned_to == current_user.id,
                    Alert.assigned_to.is_(None)
                )
            )
            
        trend_query = db.query(
            date_func.label("date"),
            func.sum(case((Alert.severity == 'critical', 1), else_=0)).label("critical"),
            func.sum(case((Alert.severity == 'high', 1), else_=0)).label("high"),
            func.sum(case((Alert.severity == 'medium', 1), else_=0)).label("medium"),
            func.sum(case((Alert.severity == 'low', 1), else_=0)).label("low")
        ).filter(
            and_(*query_filter)
        ).group_by(
            date_func
        ).order_by(
            date_func.asc()
        ).all()
        
        trends = []
        for row in trend_query:
            date_val = row.date
            if date_val is None:
                continue
            date_str = date_val.isoformat() if hasattr(date_val, "isoformat") else str(date_val)
            trends.append(
                AlertTrend(
                    date=date_str,
                    critical=row.critical or 0,
                    high=row.high or 0,
                    medium=row.medium or 0,
                    low=row.low or 0
                )
            )
        
        return trends
    
    except Exception as e:
        logger.error(f"Alert trends error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/threat-map", response_model=List[ThreatMap])
async def get_threat_map(
    db: Session = Depends(get_db)
):
    """Get threat intelligence data for world map visualization"""
    try:
        # Get threat data grouped by country
        query = db.execute(
            text("""
            SELECT 
                COALESCE(country_from, 'Unknown') as country,
                COUNT(*) as threats,
                CASE 
                    WHEN AVG(CAST(confidence_score AS INTEGER)) >= 80 THEN 'critical'
                    WHEN AVG(CAST(confidence_score AS INTEGER)) >= 60 THEN 'high'
                    WHEN AVG(CAST(confidence_score AS INTEGER)) >= 40 THEN 'medium'
                    ELSE 'low'
                END as severity
            FROM threat_intel 
            WHERE is_active = 'true'
            AND country_from IS NOT NULL
            GROUP BY country_from
            ORDER BY threats DESC
            LIMIT 50
            """)
        ).fetchall()
        
        threat_map = [
            ThreatMap(
                country=row[0],
                threats=row[1],
                severity=row[2]
            )
            for row in query
        ]
        
        return threat_map
    
    except Exception as e:
        logger.error(f"Threat map error: {e}")
        # Development fallback so dashboard map still renders when DB is unavailable.
        return [
            {"country": "United States", "threats": 14, "severity": "high"},
            {"country": "China", "threats": 18, "severity": "critical"},
            {"country": "Russia", "threats": 11, "severity": "high"},
            {"country": "Germany", "threats": 7, "severity": "medium"},
            {"country": "India", "threats": 9, "severity": "medium"},
        ]


@router.get("/recent-alerts")
async def get_recent_alerts(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get recent alerts"""
    try:
        # Build query
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
        
        # Get recent alerts
        alerts = query.order_by(desc(Alert.created_at)).limit(limit).all()
        
        return [
            {
                "id": str(alert.id),
                "title": alert.title,
                "severity": alert.severity,
                "status": alert.status,
                "source_ip": alert.source_ip,
                "created_at": alert.created_at.isoformat()
            }
            for alert in alerts
        ]
    
    except Exception as e:
        logger.error(f"Recent alerts error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/top-threats")
async def get_top_threats(
    limit: int = Query(10, ge=1, le=20),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get top threat types"""
    try:
        start_date = datetime.utcnow() - timedelta(days=7)
        # Get top threat types from detections using SQLAlchemy
        threat_query = db.query(
            Detection.threat_type,
            func.count(Detection.id).label("count"),
            func.avg(Detection.risk_score).label("avg_risk_score")
        ).filter(
            Detection.created_at >= start_date
        ).group_by(
            Detection.threat_type
        ).order_by(
            desc("count")
        ).limit(limit).all()
        
        top_threats = [
            {
                "threat_type": row[0],
                "count": row[1],
                "avg_risk_score": round(row[2], 1) if row[2] is not None else 0.0
            }
            for row in threat_query
        ]
        
        return top_threats
    
    except Exception as e:
        logger.error(f"Top threats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/system-health")
async def get_system_health(
    current_user: User = Depends(get_current_active_user)
):
    """Get system health status"""
    try:
        # Check Redis connection
        try:
            await redis_client.set("health_check", "ok", expire=10)
            redis_status = "healthy"
        except Exception:
            redis_status = "unhealthy"
        
        # Mock system health data
        system_health = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "database": "healthy",
                "redis": redis_status,
                "detection_engine": "healthy",
                "soar_engine": "healthy"
            },
            "metrics": {
                "cpu_usage": 45.2,
                "memory_usage": 62.8,
                "disk_usage": 38.1,
                "network_latency": 12.5
            }
        }
        
        return system_health
    
    except Exception as e:
        logger.error(f"System health error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.get("/activity-feed")
async def get_activity_feed(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get combined activity feed"""
    try:
        # Get recent alerts
        alert_query = db.query(Alert)
        permissions = get_permissions(current_user)
        if not permissions.get("manage_users", False):
            alert_query = alert_query.filter(
                or_(
                    Alert.assigned_to == current_user.id,
                    Alert.assigned_to.is_(None)
                )
            )
        
        recent_alerts = alert_query.order_by(desc(Alert.created_at)).limit(limit).all()
        
        # Get recent incidents
        incident_query = db.query(Incident)
        if not permissions.get("manage_users", False):
            incident_query = incident_query.filter(
                or_(
                    Incident.assigned_to == current_user.id,
                    Incident.assigned_to.is_(None)
                )
            )
        
        recent_incidents = incident_query.order_by(desc(Incident.created_at)).limit(limit).all()
        
        # Combine and sort activities
        activities = []
        
        for alert in recent_alerts:
            activities.append({
                "id": str(alert.id),
                "type": "alert",
                "title": alert.title,
                "severity": alert.severity,
                "status": alert.status,
                "timestamp": alert.created_at.isoformat(),
                "source_ip": alert.source_ip
            })
        
        for incident in recent_incidents:
            activities.append({
                "id": str(incident.id),
                "type": "incident",
                "title": incident.title,
                "severity": incident.severity,
                "status": incident.status,
                "timestamp": incident.created_at.isoformat()
            })
        
        # Sort by timestamp
        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return activities[:limit]
    
    except Exception as e:
        logger.error(f"Activity feed error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
