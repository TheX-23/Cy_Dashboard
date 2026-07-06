import asyncio
import random
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class LogGenerator:
    def __init__(self):
        self.is_running = False
        self.ip_pool = [
            "192.168.1.100", "10.0.0.5", "172.16.0.50", 
            "8.8.8.8", "1.1.1.1", "104.28.2.1", "203.0.113.195"
        ]
        self.endpoints = ["/api/v1/auth/login", "/api/v1/users", "/dashboard", "/api/v1/data"]
        self.methods = ["GET", "POST", "PUT", "DELETE"]

    def generate_normal_log(self) -> dict:
        return {
            "type": "logs:new",
            "data": {
                "id": f"log-{random.randint(1000, 9999)}",
                "timestamp": datetime.utcnow().isoformat(),
                "ip_address": random.choice(self.ip_pool),
                "method": random.choice(self.methods),
                "endpoint": random.choice(self.endpoints),
                "status_code": random.choice([200, 201, 204, 301, 302, 400, 404]),
                "response_time_ms": random.randint(20, 200),
                "request_size": random.randint(100, 2000),
                "response_size": random.randint(500, 5000),
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "payload": {}
            }
        }

    def generate_attack_log(self) -> dict:
        attack_type = random.choice(["sqli", "xss", "bruteforce", "anomaly"])
        
        log = self.generate_normal_log()
        log["data"]["status_code"] = random.choice([401, 403, 500])
        log["data"]["response_time_ms"] = random.randint(500, 2000)
        
        if attack_type == "sqli":
            log["data"]["endpoint"] = "/api/v1/auth/login"
            log["data"]["payload"] = {"username": "admin' OR 1=1 --", "password": "password"}
        elif attack_type == "xss":
            log["data"]["endpoint"] = "/api/v1/users/profile"
            log["data"]["payload"] = {"bio": "<script>alert('xss')</script>"}
        elif attack_type == "bruteforce":
            log["data"]["endpoint"] = "/api/v1/auth/login"
            log["data"]["status_code"] = 401
            log["data"]["ip_address"] = "185.15.22.1" # Suspicious IP
            
        return log

    async def start(self, broadcast_callback):
        """
        Start generating logs and trigger the broadcast callback.
        """
        if self.is_running:
            return
            
        self.is_running = True
        logger.info("Started Real-Time Log Generator Simulation...")
        
        while self.is_running:
            try:
                # 80% normal traffic, 20% attacks
                if random.random() < 0.2:
                    log_data = self.generate_attack_log()
                    # Wait longer for attacks to simulate bursts
                    await asyncio.sleep(random.uniform(2.0, 5.0))
                else:
                    log_data = self.generate_normal_log()
                    await asyncio.sleep(random.uniform(0.5, 2.0))
                
                # Broadcast the simulated log via websocket
                await broadcast_callback(json.dumps(log_data))
                
            except Exception as e:
                logger.error(f"Error in LogGenerator: {e}")
                await asyncio.sleep(1)

    def stop(self):
        self.is_running = False
        logger.info("Stopped Log Generator.")

log_generator = LogGenerator()
