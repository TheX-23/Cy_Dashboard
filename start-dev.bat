@echo off
title SentinelX Development Environment

echo 🚀 Starting SentinelX Development Environment
echo ============================================

:: Function to cleanup processes on exit
setlocal enabledelayedexpansion

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

:: Install backend dependencies if needed
echo 📦 Checking backend dependencies...
cd backend

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

:: Install frontend dependencies
echo 📦 Checking frontend dependencies...
cd ..\sentinelx

if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install
)

cd ..

:: Start backend
echo 🔧 Starting backend server...
cd backend
start "Backend Server" cmd /k "venv\Scripts\activate.bat && python run.py"
cd ..

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend
echo 🎨 Starting frontend server...
cd sentinelx
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ✅ SentinelX Development Environment Started!
echo ============================================
echo 🔧 Backend:  http://localhost:8080
echo 📚 API Docs: http://localhost:8080/docs
echo 🎨 Frontend: http://localhost:3000
echo 🔍 Health:   http://localhost:8080/health
echo.
echo Close this window to stop all services
echo ============================================
echo.

:: Keep the script running
pause
