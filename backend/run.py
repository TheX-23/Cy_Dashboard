#!/usr/bin/env python3
"""
SentinelX Backend Server
Entry point for the SentinelX cybersecurity platform backend.
"""

import uvicorn
import sys
import os
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    # Default configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8080))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    # Uvicorn reload uses a reloader process; keep workers=1 when reload is on.
    workers = 1 if reload else int(os.getenv("WORKERS", "4"))
    
    print(f"""
    Starting SentinelX Backend Server
    ===================================
    Host: {host}
    Port: {port}
    Reload: {reload}
    Workers: {workers}
    API Docs: http://{host}:{port}/docs
    Health Check: http://{host}:{port}/health
    ===================================
    """)
    
    # Start the server
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        workers=workers,
        log_level="info",
        access_log=True,
        use_colors=True,
        forwarded_allow_ips=["*"],
    )
