#!/bin/bash

# SentinelX Quick Deployment Script
# Production-ready Docker deployment with validation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Header
echo -e "${GREEN}"
echo "🚀 SentinelX Quick Deployment Script"
echo "==================================="
echo -e "${NC}"

# Check requirements
log "Checking requirements..."

# Check Docker
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check available ports
log "Checking available ports..."

if netstat -tuln | grep -q ":3000 "; then
    error "Port 3000 is already in use."
    exit 1
fi

if netstat -tuln | grep -q ":8000 "; then
    error "Port 8000 is already in use."
    exit 1
fi

success "All requirements met!"

# Environment setup
log "Setting up environment..."

# Create environment file if not exists
if [ ! -f ".env.local" ]; then
    log "Creating .env.local from template..."
    cp sentinelx/env.template .env.local
    warning "Please edit .env.local with your production settings before continuing."
    read -p "Press Enter to continue or Ctrl+C to exit..."
fi

# Check if production files exist
if [ ! -f "docker-compose.production.yml" ]; then
    error "Production Docker Compose file not found."
    exit 1
fi

# Deployment options
echo ""
echo "Select deployment mode:"
echo "1) Development (with hot reload)"
echo "2) Production (optimized)"
echo "3) Production with monitoring"
echo "4) Full stack (all services)"
echo ""

read -p "Choose mode [1-4]: " -n 1 -e MODE

case $MODE in
    1)
        COMPOSE_FILE="docker-compose.yml"
        log "Starting development mode..."
        ;;
    2)
        COMPOSE_FILE="docker-compose.production.yml"
        log "Starting production mode..."
        ;;
    3)
        COMPOSE_FILE="docker-compose.production.yml"
        EXTRA_SERVICES="prometheus grafana"
        log "Starting production with monitoring..."
        ;;
    4)
        COMPOSE_FILE="docker-compose.production.yml"
        EXTRA_SERVICES="prometheus grafana nginx"
        log "Starting full stack..."
        ;;
    *)
        error "Invalid mode selected."
        exit 1
        ;;
esac

# Stop existing services
log "Stopping existing services..."
docker-compose -f docker-compose.yml down 2>/dev/null || true

# Pull latest images
log "Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull

# Start services
log "Starting services with $COMPOSE_FILE..."
if [ -n "$EXTRA_SERVICES" ]; then
    docker-compose -f $COMPOSE_FILE up -d $EXTRA_SERVICES
else
    docker-compose -f $COMPOSE_FILE up -d
fi

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 30

# Health checks
log "Performing health checks..."

# Check backend health
for i in {1..10}; do
    if curl -f http://localhost:8000/health &>/dev/null; then
        success "Backend is healthy!"
        break
    else
        warning "Backend not ready yet... (attempt $i/10)"
        sleep 5
    fi
done

# Check frontend health
for i in {1..10}; do
    if curl -f http://localhost:3000 &>/dev/null; then
        success "Frontend is healthy!"
        break
    else
        warning "Frontend not ready yet... (attempt $i/10)"
        sleep 3
    fi
done

# Check monitoring services if enabled
if [[ "$EXTRA_SERVICES" == *"prometheus"* ]]; then
    for i in {1..5}; do
        if curl -f http://localhost:9090 &>/dev/null; then
            success "Prometheus is healthy!"
            break
        else
            warning "Prometheus not ready yet... (attempt $i/5)"
            sleep 2
        fi
    done
fi

if [[ "$EXTRA_SERVICES" == *"grafana"* ]]; then
    for i in {1..5}; do
        if curl -f http://localhost:3001 &>/dev/null; then
            success "Grafana is healthy!"
            break
        else
            warning "Grafana not ready yet... (attempt $i/5)"
            sleep 2
        fi
    done
fi

# Display service URLs
echo ""
success "🎉 SentinelX deployment complete!"
echo ""
echo "Service URLs:"
echo "================"
echo "🌐 Frontend:     http://localhost:3000"
echo "🔌 Backend API:   http://localhost:8000"
echo "📚 API Docs:     http://localhost:8000/docs"

if [[ "$EXTRA_SERVICES" == *"prometheus"* ]]; then
    echo "📊 Prometheus:   http://localhost:9090"
fi

if [[ "$EXTRA_SERVICES" == *"grafana"* ]]; then
    echo "📈 Grafana:      http://localhost:3001"
    echo "   Grafana Login: admin / admin"
fi

if [[ "$EXTRA_SERVICES" == *"nginx"* ]]; then
    echo "🌐 Public URL:   http://localhost (Port 80)"
    echo "🔒 HTTPS URL:   https://localhost (Port 443)"
fi

echo ""
echo "================"
echo ""

# Management commands
echo "Management Commands:"
echo "=================="
echo "View logs:       docker-compose -f $COMPOSE_FILE logs -f"
echo "Stop services:   docker-compose -f $COMPOSE_FILE down"
echo "Restart:        docker-compose -f $COMPOSE_FILE restart"
echo "Scale backend:   docker-compose -f $COMPOSE_FILE up -d --scale backend=2"
echo ""

# Monitoring commands
if [[ "$EXTRA_SERVICES" == *"grafana"* ]]; then
    echo "Access Grafana: http://localhost:3001"
fi

echo ""
success "Deployment is ready! 🚀"
echo ""
echo "Next steps:"
echo "1. Configure your domain and SSL certificates"
echo "2. Set up reverse proxy for production"
echo "3. Configure monitoring alerts"
echo "4. Review the DOCKER_VALIDATION.md for detailed information"
echo ""

# Optional: Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

log "Deployment script completed successfully!"
