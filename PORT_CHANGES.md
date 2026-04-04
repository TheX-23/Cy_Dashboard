# 🔌 Port Configuration Changes

## 📋 SUMMARY

Successfully changed the default ports for the SentinelX platform to avoid conflicts.

---

## 🔄 **CHANGES MADE**

### **Backend Port Change**
- **From**: `8000` → **To**: `8080`
- **Files Updated**:
  - `backend/run.py` - Default port configuration
  - `docker-compose.production.yml` - Container port mapping
  - `sentinelx/env.template` - Frontend API URL
  - Documentation files

### **Frontend Port Change**
- **From**: `3000` → **To**: `3001`
- **Files Updated**:
  - `sentinelx/package.json` - Dev script with port flag
  - `docker-compose.production.yml` - Container port mapping
  - Documentation files

---

## 📁 **FILES MODIFIED**

### Backend Configuration
```python
# backend/run.py
port = int(os.getenv("PORT", 8080))  # Changed from 8000
```

### Frontend Configuration
```json
// sentinelx/package.json
"dev": "next dev -p 3001",  // Added -p 3001 flag
```

### Environment Variables
```env
# sentinelx/env.template
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1  # Changed from 8000
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws        # Changed from 8000
```

### Docker Configuration
```yaml
# docker-compose.production.yml
backend:
  ports:
    - "8080:8080"  # Changed from 8000:8000
frontend:
  ports:
    - "3001:3000"  # Changed from 3000:3000
  environment:
    NEXT_PUBLIC_API_URL: http://backend:8080/api/v1  # Changed from 8000
    NEXT_PUBLIC_WS_URL: ws://backend:8080/ws        # Changed from 8000
```

---

## 🌐 **NEW ACCESS URLs**

### Development Environment
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/docs
- **Health Check**: http://localhost:8080/health
- **WebSocket**: ws://localhost:8080/ws

### Docker Environment
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:8080
- **Grafana**: http://localhost:3001 (if enabled)

---

## 🚀 **START COMMANDS**

### Development
```bash
# Terminal 1: Backend
cd backend
python run.py
# Server runs on http://localhost:8080

# Terminal 2: Frontend
cd sentinelx
npm run dev
# Server runs on http://localhost:3001
```

### Docker
```bash
# Production Docker
docker-compose -f docker-compose.production.yml up -d
# Backend: http://localhost:8080
# Frontend: http://localhost:3001
```

---

## 🔍 **PORT CONFLICT RESOLUTION**

If you still encounter port conflicts, you can:

### Option 1: Use Environment Variables
```bash
# Set custom ports
export PORT=9000  # Backend
npm run dev -p 4000  # Frontend
```

### Option 2: Modify Configuration Files
```python
# backend/run.py
port = int(os.getenv("PORT", 9000))  # Your preferred port
```

```json
// sentinelx/package.json
"dev": "next dev -p 4000",  // Your preferred port
```

### Option 3: Use Different Ports Entirely
- Backend: 9000, 9001, 9002, etc.
- Frontend: 4000, 4001, 4002, etc.

---

## 📊 **PORT USAGE VERIFICATION**

### Check Port Availability
```bash
# Check if ports are in use
netstat -tuln | grep :8080
netstat -tuln | grep :3001

# Alternative (Windows)
netstat -ano | findstr :8080
netstat -ano | findstr :3001
```

### Kill Processes on Ports
```bash
# Linux/Mac
sudo lsof -ti:8080 | xargs kill -9
sudo lsof -ti:3001 | xargs kill -9

# Windows
taskkill /PID <PID> /F
```

---

## 🎯 **BENEFITS OF PORT CHANGE**

### ✅ **Conflict Avoidance**
- Avoids common port conflicts with other services
- Reduces interference with development tools
- Minimizes clashes with other applications

### ✅ **Better Organization**
- Backend uses 8xxx range (API services)
- Frontend uses 3xxx range (web applications)
- Easy to remember and maintain

### ✅ **Docker Compatibility**
- Container port mapping updated
- Environment variables synchronized
- No breaking changes in functionality

---

## 🔧 **NEXT STEPS**

1. **Restart Services** with new port configuration
2. **Update Browser Bookmarks** to new URLs
3. **Verify API Connectivity** between frontend and backend
4. **Test WebSocket Connection** with new port
5. **Update Documentation** if needed for your team

---

## 📞 **SUPPORT**

### **If Issues Occur**
1. Check that both ports are available
2. Verify environment variables are set correctly
3. Ensure firewall allows the new ports
4. Restart services after configuration changes

### **Rollback if Needed**
To revert to original ports (8000/3000):
1. Edit `backend/run.py` - change port back to 8000
2. Edit `sentinelx/package.json` - remove `-p 3001` flag
3. Update environment variables back to port 8000
4. Restart services

---

**Port changes completed successfully! 🎉**

- **Backend**: Now running on port **8080**
- **Frontend**: Now running on port **3001**
- **All connections**: Updated and synchronized
- **Documentation**: Updated with new URLs

---

*Last Updated: $(date)*
*Status: ✅ PORT CONFIGURATION COMPLETE*
