import uuid
import logging
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.log import Log
from app.models.detection import Detection
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.incident import Incident, IncidentStatus, IncidentSeverity
from app.models.threat_intel import ThreatIntel
from app.models.soar import SOARPlaybook

logger = logging.getLogger(__name__)

def seed_database(db: Session):
    """Seed the database with initial development data"""
    try:
        # 1. Seed Admin User
        admin_email = 'admin@sentinelx.com'
        admin = db.query(User).filter(User.email == admin_email).first()
        admin_id = uuid.UUID('00000000-0000-0000-0000-000000000001')
        
        if not admin:
            admin = User(
                id=admin_id,
                email=admin_email,
                name='System Administrator',
                password_hash='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LF',  # admin123
                role='admin',
                is_active=True
            )
            db.add(admin)
            db.commit()
            logger.info("Seeded Admin user.")
        else:
            admin_id = admin.id

        # Check if we already have alerts/detections, if so, skip seeding them
        if db.query(Alert).count() > 0:
            logger.info("Database already seeded with logs/alerts.")
            return

        # 2. Seed Threat Intel (World Map data)
        countries = [
            ("United States", "US"), ("China", "CN"), ("Russia", "RU"), 
            ("India", "IN"), ("Germany", "DE"), ("Brazil", "BR"),
            ("United Kingdom", "GB"), ("France", "FR"), ("Japan", "JP")
        ]
        
        threat_ips = ["192.168.1.100", "10.0.0.50", "172.16.0.1", "203.0.113.42", "198.51.100.1"]
        threat_types = ["malware", "botnet", "ddos", "phishing", "brute_force", "SQLi"]
        severities = ["low", "medium", "high", "critical"]
        
        for idx, (country, code) in enumerate(countries):
            intel = ThreatIntel(
                id=uuid.uuid4(),
                source_ip=f"185.220.101.{10 + idx}",
                destination_ip="192.168.1.5",
                domain=f"malicious-site-{idx}.com",
                url=f"http://malicious-site-{idx}.com/payload.exe",
                country_from=country,
                country_to="United States",
                threat_type=random.choice(threat_types),
                severity=random.choice(severities),
                confidence_score=random.randint(60, 99),
                source="threat_feed",
                description=f"Active threat campaign from {country}",
                is_active="true",
                first_seen=datetime.utcnow() - timedelta(days=2),
                last_seen=datetime.utcnow()
            )
            db.add(intel)
        db.commit()
        logger.info("Seeded Threat Intel.")

        # 3. Seed Logs, Detections, and Alerts
        log_templates = [
            ("/api/v1/auth/login", "POST", "Brute Force attempt on admin panel"),
            ("/api/v1/users", "GET", "Unauthorized sensitive data fetch access"),
            ("/api/v1/items", "POST", "SQL Injection vulnerability exploit payload"),
            ("/admin/settings", "PUT", "Malicious file upload attempt"),
            ("/api/v1/checkout", "POST", "DDoS anomalous traffic spike")
        ]

        for i in range(25):
            path, method, desc = random.choice(log_templates)
            ip = random.choice(threat_ips)
            timestamp = datetime.utcnow() - timedelta(hours=random.randint(1, 48))
            
            # Create Log
            db_log = Log(
                id=uuid.uuid4(),
                timestamp=timestamp,
                ip_address=ip,
                endpoint=path,
                method=method,
                status_code=401 if "auth" in path else 200,
                payload={"ip": ip, "agent": "Scanner/1.0"},
                user_agent="Mozilla/5.0 Scanner/1.0"
            )
            db.add(db_log)
            db.flush()  # get db_log.id

            # Create Detection
            threat = random.choice(threat_types)
            db_detection = Detection(
                id=uuid.uuid4(),
                log_id=db_log.id,
                rule_triggered=f"Rule-{threat.upper()}-01",
                threat_type=threat,
                risk_score=random.randint(30, 95),
                description=desc,
                source_ip=ip,
                target_ip="192.168.1.10",
                created_at=timestamp
            )
            db.add(db_detection)
            db.flush()

            # Create Alert
            severity = random.choice(severities)
            db_alert = Alert(
                id=uuid.uuid4(),
                detection_id=db_detection.id,
                severity=severity,
                status=random.choice(["open", "investigating", "resolved"]),
                title=f"{threat.replace('_', ' ').title()} Threat Detected",
                description=desc,
                source_ip=ip,
                target_ip="192.168.1.10",
                assigned_to=admin_id if random.random() > 0.5 else None,
                created_at=timestamp
            )
            db.add(db_alert)

        db.commit()
        logger.info("Seeded Logs, Detections, and Alerts.")

        # 4. Seed Incidents
        incident_titles = [
            "SQL Injection Exploit Campaign",
            "Brute Force Login Spike on Admin Portal",
            "Active Malware Outbreak on Workstation Node",
            "DDoS Denial of Service targeting API Gateway",
            "Data Exfiltration anomalous egress flow"
        ]

        for i, title in enumerate(incident_titles):
            timestamp = datetime.utcnow() - timedelta(hours=random.randint(2, 24))
            db_incident = Incident(
                id=uuid.uuid4(),
                title=title,
                description=f"Investigating active security incident relating to {title.lower()}.",
                severity=random.choice(severities),
                status=random.choice(["open", "investigating", "contained"]),
                assigned_to=admin_id if random.random() > 0.5 else None,
                created_by=admin_id,
                created_at=timestamp
            )
            db.add(db_incident)
        
        db.commit()
        logger.info("Seeded Incidents.")

        # 5. Seed Playbooks
        playbook = SOARPlaybook(
            id=uuid.uuid4(),
            name='Auto-Block Host IP',
            description='Automatically blocks malicious IP addresses on WAF firewall when critical intrusion alerts are triggered',
            trigger_type='alert',
            trigger_conditions='{"severity": ["critical", "high"]}',
            is_active=True
        )
        db.add(playbook)
        db.commit()
        logger.info("Seeded SOAR Playbook.")

    except Exception as e:
        import traceback
        db.rollback()
        logger.error(f"Error seeding database: {e}\n{traceback.format_exc()}")
