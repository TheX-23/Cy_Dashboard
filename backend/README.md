# SentinelX Backend

Enterprise-grade cybersecurity platform backend with real-time threat detection, SOAR automation, and comprehensive monitoring.

## Features

### 🔐 Security & Authentication
- JWT-based authentication with role-based access control
- Password hashing with bcrypt
- Session management with Redis
- Rate limiting and brute force protection

### 🚨 Detection Engine
- Rule-based threat detection (SQLi, XSS, Brute Force, etc.)
- Real-time log processing
- Threat intelligence correlation
- Risk scoring and alert generation

### 🤖 SOAR Automation
- Playbook-based automation
- Multiple action types (Block IP, Notify, Disable User, etc.)
- Trigger-based execution
- Execution logging and monitoring

### 📊 Real-time Features
- WebSocket support for live updates
- Redis pub/sub messaging
- Real-time dashboard statistics
- Live alert and incident feeds

### 🗄 Database Design
- PostgreSQL with optimized schemas
- Comprehensive audit logging
- Threat intelligence storage
- Normalized relational design

## Architecture

```
├── app/
│   ├── api/              # API endpoints
│   │   ├── v1/
│   │   │   ├── auth.py # Authentication endpoints
│   │   │   ├── logs.py # Log management
│   │   │   ├── alerts.py # Alert management
│   │   │   └── dashboard.py # Dashboard stats
│   ├── core/             # Core configuration
│   │   └── config.py
│   ├── models/           # Database models
│   │   ├── user.py
│   │   ├── log.py
│   │   ├── detection.py
│   │   ├── alert.py
│   │   ├── incident.py
│   │   ├── soar.py
│   │   └── threat_intel.py
│   ├── services/         # Business logic
│   │   ├── auth_service.py
│   │   ├── detection_engine.py
│   │   ├── soar_engine.py
│   │   └── redis_client.py
│   └── main.py          # Application entry point
├── alembic/             # Database migrations
├── requirements.txt      # Python dependencies
└── .env.example        # Environment variables
```

## Database Schema

### Core Tables

1. **Users** - User management with role-based access
2. **Sessions** - User session tracking
3. **Logs** - System and security logs
4. **Detections** - Threat detection results
5. **Alerts** - Security alerts with severity levels
6. **Incidents** - Security incident management
7. **SOAR Playbooks** - Automation playbooks
8. **SOAR Actions** - Individual automation actions
9. **SOAR Execution Logs** - Playbook execution tracking
10. **Integrations** - External service integrations
11. **API Keys** - API key management
12. **Audit Logs** - Comprehensive audit trail
13. **Threat Intelligence** - Threat intel data

## Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- Redis 6+
- Node.js 16+ (for frontend)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SentinelX/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Set up PostgreSQL database**
```sql
CREATE DATABASE sentinelx;
CREATE USER sentinelx WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sentinelx TO sentinelx;
```

6. **Run database migrations**
```bash
alembic upgrade head
```

7. **Start Redis server**
```bash
redis-server
```

8. **Start the application**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Logs
- `POST /api/v1/logs/` - Create log entry
- `GET /api/v1/logs/` - Get logs with pagination
- `GET /api/v1/logs/stats/summary` - Log statistics

### Alerts
- `POST /api/v1/alerts/` - Create alert
- `GET /api/v1/alerts/` - Get alerts with filtering
- `PUT /api/v1/alerts/{id}` - Update alert
- `POST /api/v1/alerts/{id}/resolve` - Resolve alert

### Dashboard
- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/dashboard/alert-trends` - Alert trends
- `GET /api/v1/dashboard/threat-map` - Threat intelligence map
- `GET /api/v1/dashboard/activity-feed` - Activity feed

## WebSocket Connection

Connect to WebSocket for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Real-time update:', data);
};
```

## Configuration

### Environment Variables

Key environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sentinelx

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-super-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Features
DETECTION_ENGINE_ENABLED=true
SOAR_ENABLED=true

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

## Detection Rules

The detection engine includes built-in rules for:

- **SQL Injection** - Pattern-based SQLi detection
- **XSS** - Cross-site scripting detection
- **Brute Force** - Failed login attempt detection
- **Threat Intelligence** - IP reputation correlation

Add custom rules in `detection_rules/` directory.

## SOAR Playbooks

Create automation playbooks with:

1. **Triggers** - Alert conditions
2. **Actions** - Response actions
3. **Configuration** - Action-specific settings

Example actions:
- Block malicious IP addresses
- Send notifications (Email, Slack, Webhook)
- Disable compromised user accounts
- Isolate affected systems

## Development

### Running Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black app/
isort app/
```

### Database Migrations

Create new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migration:
```bash
alembic upgrade head
```

## Monitoring

### Health Checks

- `/health` - Overall system health
- Database connectivity
- Redis connectivity
- Engine status

### Logging

Structured JSON logging with levels:
- INFO - General information
- WARNING - Warning messages
- ERROR - Error conditions
- DEBUG - Debug information

## Security Features

### Authentication & Authorization
- JWT tokens with expiration
- Role-based access control (Admin, Analyst, Viewer)
- Session management
- Password security requirements

### Rate Limiting
- Login attempt limiting
- API rate limiting
- IP-based blocking

### Data Protection
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

## Performance

### Caching
- Redis caching for frequently accessed data
- Dashboard statistics caching
- Session caching

### Database Optimization
- Indexed queries
- Connection pooling
- Query optimization

### Async Processing
- Async/await for I/O operations
- Background task processing
- Non-blocking WebSocket handling

## Deployment

### Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Setup

1. **Production Database** - Configure PostgreSQL
2. **Redis Cluster** - Set up Redis for scaling
3. **Load Balancer** - Configure HAProxy/Nginx
4. **SSL/TLS** - Configure HTTPS
5. **Monitoring** - Set up logging and metrics

## Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API docs at `/docs`

---

**SentinelX** - Enterprise Cybersecurity Platform
*Real-time threat detection and automated response*
