# SentinelX Production Deployment Guide

## 🚀 QUICK START

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- Docker & Docker Compose

### 1. Environment Setup
```bash
# Frontend
cd sentinelx
cp env.template .env.local

# Backend
cd ../backend
cp .env.example .env
```

### 2. Database Setup
```bash
# Start PostgreSQL & Redis
cd ../backend
docker-compose up -d postgres redis

# Run migrations
cd ../backend
alembic upgrade head

# Create admin user
cd ../sentinelx
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.auth.signUp({
  email: 'admin@sentinelx.com',
  password: 'Admin123!',
  options: { data: { name: 'Admin User', role: 'admin' } }
});
"
```

### 3. Start Services
```bash
# Terminal 1: Backend
cd ../backend
python run.py

# Terminal 2: Frontend  
cd sentinelx
npm run dev
```

## 🐳 DOCKER DEPLOYMENT

### Production Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./sentinelx
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000/api/v1
      - NEXT_PUBLIC_WS_URL=ws://backend:8000/ws
    
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/sentinelx
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis
    
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: sentinelx
      POSTGRES_USER: sentinelx
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

## 🔧 CONFIGURATION

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key

# Backend (.env)
DATABASE_URL=postgresql://user:password@your-db-host:5432/sentinelx
REDIS_URL=redis://your-redis-host:6379/0
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🔒 SECURITY PRODUCTION CHECKLIST

### ✅ Must Have
- [ ] HTTPS/SSL certificates
- [ ] Firewall configuration
- [ ] Environment variables secured
- [ ] Database encryption at rest
- [ ] API rate limiting
- [ ] CORS properly configured
- [ ] JWT secret key rotation
- [ ] Backup strategy implemented

### 🛡️ Security Headers
```nginx
server {
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';";
}
```

## 📊 MONITORING SETUP

### Application Monitoring
```bash
# Health checks
curl https://your-domain.com/health

# Metrics endpoint
curl https://your-domain.com/api/v1/dashboard/stats
```

### Log Aggregation
```bash
# Application logs
docker logs sentinelx_backend

# Database logs
docker logs postgres

# Redis logs
docker logs redis
```

## 🚀 DEPLOYMENT COMMANDS

### Build & Deploy
```bash
# Build frontend
cd sentinelx
npm run build

# Build backend Docker image
cd ../backend
docker build -t sentinelx-backend .

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

## 🔍 TESTING DEPLOYMENT

### Health Checks
```bash
# Test all services
curl -f http://localhost:8000/health
curl -f http://localhost:3000

# Test WebSocket connection
wscat -c ws://localhost:8000/ws

# Test API endpoints
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sentinelx.com","password":"Admin123!"}'
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## 📈 PERFORMANCE OPTIMIZATION

### Database Indexes
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_alerts_created_at ON alerts(created_at);
CREATE INDEX CONCURRENTLY idx_logs_timestamp ON logs(timestamp);
```

### Caching Strategy
```python
# Redis caching for dashboard stats
CACHE_TTL = 300  # 5 minutes

# API response caching
@cache.memoize(timeout=60)
def get_dashboard_stats():
    # Expensive database query
    pass
```

## 🔄 CI/CD PIPELINE

### GitHub Actions Example
```yaml
name: Deploy SentinelX
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      with:
        node-version: '18'
      - run: npm ci
      - run: npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deploy commands
          docker-compose -f docker-compose.prod.yml up -d
```

## 🚨 TROUBLESHOOTING

### Common Issues
1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check network connectivity

2. **WebSocket Connection Issues**
   - Verify WS_URL includes protocol (ws:// or wss://)
   - Check firewall allows WebSocket connections
   - Verify backend WebSocket server is running

3. **Authentication Failures**
   - Check JWT secret key matches
   - Verify token expiration settings
   - Check Redis session storage

4. **Performance Issues**
   - Check database query performance
   - Verify Redis caching is working
   - Monitor memory usage

### Debug Commands
```bash
# Check container status
docker ps

# View container logs
docker logs sentinelx_backend

# Connect to database
docker exec -it postgres psql -U sentinelx -d sentinelx

# Monitor Redis
docker exec -it redis redis-cli monitor
```

## 📋 FINAL CHECKLIST

### Pre-Deployment
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] SSL certificates configured
- [ ] Security headers in place
- [ ] Monitoring tools configured
- [ ] Backup strategy tested
- [ ] Load testing completed
- [ ] Documentation updated

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] User acceptance testing
- [ ] Rollback plan documented

---

## 🎉 SUCCESS CRITERIA

Deployment is successful when:
1. ✅ All services start without errors
2. ✅ Health endpoints return 200 OK
3. ✅ WebSocket connections work
4. ✅ Authentication flow works end-to-end
5. ✅ Real-time updates are functional
6. ✅ Performance benchmarks are met
7. ✅ Security scans pass
8. ✅ Monitoring is active

---

*Last Updated: $(date)*
*Version: 1.0.0*
