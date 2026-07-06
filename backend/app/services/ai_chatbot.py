import asyncio
import logging
from typing import List, Dict, Any
import re

logger = logging.getLogger(__name__)

class AIChatbotService:
    def __init__(self):
        self.persona = "You are SentinelX AI, an advanced cybersecurity assistant integrated into the SentinelX Dashboard. You analyze logs, detect threats, and provide actionable security recommendations to security analysts."
        
    async def generate_response(self, messages: List[Dict[str, str]], context: Dict[str, Any] = None) -> str:
        """
        Generates a response based on chat history. 
        Note: Currently using a smart simulation for demo purposes.
        Can be easily hooked up to OpenAI API or local LLM.
        """
        # Simulate network delay for realism
        await asyncio.sleep(1.5)
        
        if not messages:
            return "Hello! I am SentinelX AI. How can I assist you with your security operations today?"
            
        last_message = messages[-1].get("content", "").lower()
        
        # Check if the query is related to SentinelX or Cybersecurity
        security_keywords = ["sentinelx", "cybersecurity", "security", "log", "threat", "anomaly", "attack", "alert", "sql", "xss", "brute force", "dashboard", "system", "status", "help", "hello", "hi", "hey"]
        is_relevant = any(keyword in last_message for keyword in security_keywords)
        
        if not is_relevant:
            return "I am SentinelX AI. I am strictly programmed to answer questions related to SentinelX, cybersecurity, and system logs. I cannot assist with other topics."

        # Keyword-based smart responses
        if re.search(r"sql injection|sqli", last_message):
            return "Based on the dashboard context, SQL Injection attempts typically target endpoints like `/api/v1/auth/login` or data retrieval endpoints. I recommend checking the **Threat Intel** tab for the source IP and applying WAF rules to block patterns like `' OR 1=1 --`."
            
        if re.search(r"brute force|login failed", last_message):
            return "Multiple failed login attempts detected. This usually indicates a brute-force attack. You should implement rate limiting on the `/login` endpoint and consider temporarily banning the offending IPs visible in the **Suspicious IPs** section."
            
        if re.search(r"xss|cross-site", last_message):
            return "Cross-Site Scripting (XSS) payloads have been identified in the request logs. Ensure that all user inputs are sanitized and properly escaped before rendering. Implementing a strong Content Security Policy (CSP) will mitigate this."
            
        if re.search(r"anomaly|unusual|strange", last_message):
            return "I am currently analyzing the log data using our Isolation Forest model. If you notice unusual traffic spikes during off-hours, it may indicate a data exfiltration attempt or an automated botnet sweep."
            
        if re.search(r"hello|hi|hey", last_message):
            return "Hello! I'm monitoring the SentinelX dashboard. Is there a specific alert or log you'd like me to analyze?"
            
        if re.search(r"status|how is the system", last_message):
            return "The SentinelX core systems are operational. The Detection Engine is actively monitoring incoming logs. Please check the Alerts panel for any recent critical findings."
            
        if re.search(r"help", last_message):
            return "I can help you analyze security threats, explain specific alerts (like SQLi or XSS), provide mitigation strategies, or give an overview of the current system status. What would you like to know?"
            
        # Default fallback response
        return "I've logged your query. As SentinelX AI, I recommend investigating the source IPs and correlating them with our Threat Intelligence feeds. Let me know if you'd like me to explain a specific alert type."

ai_chatbot_service = AIChatbotService()
