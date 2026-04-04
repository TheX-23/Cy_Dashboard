#!/bin/bash

# SentinelX Development Startup Script
# Runs both backend and frontend simultaneously

echo "🚀 Starting SentinelX Development Environment"
echo "============================================"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Wait for processes to stop
    wait $BACKEND_PID 2>/dev/null
    wait $FRONTEND_PID 2>/dev/null
    
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install backend dependencies if needed
echo "📦 Checking backend dependencies..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

if [ ! -f "venv/pyvenv.cfg" ] || [ requirements.txt -nt venv/pyvenv.cfg ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Install frontend dependencies
echo "📦 Checking frontend dependencies..."
cd ../sentinelx
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

cd ..

# Start backend
echo "🔧 Starting backend server..."
cd backend
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
python run.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd sentinelx
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ SentinelX Development Environment Started!"
echo "============================================"
echo "🔧 Backend:  http://localhost:8080"
echo "📚 API Docs: http://localhost:8080/docs"
echo "🎨 Frontend: http://localhost:3000"
echo "🔍 Health:   http://localhost:8080/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo "============================================"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
