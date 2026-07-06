import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    
    // Simulate network delay to feel like a real AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (messages.length === 0) {
      return NextResponse.json({ response: "Hello! I am SentinelX AI. How can I assist you with your security operations today?" });
    }
    
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Check if the query is related to SentinelX or Cybersecurity
    const securityKeywords = ["sentinelx", "cybersecurity", "security", "log", "threat", "anomaly", "attack", "alert", "sql", "xss", "brute force", "dashboard", "system", "status", "help", "hello", "hi", "hey", "what is"];
    const isRelevant = securityKeywords.some(keyword => lastMessage.includes(keyword));
    
    if (!isRelevant) {
      return NextResponse.json({ response: "I am SentinelX AI. I am strictly programmed to answer questions related to SentinelX, cybersecurity, and system logs. I cannot assist with other topics." });
    }

    let responseText = "I've logged your query. As SentinelX AI, I recommend investigating the source IPs and correlating them with our Threat Intelligence feeds.";
    
    if (lastMessage.includes('what is sentinelx')) {
      responseText = "SentinelX is an advanced Enterprise Security Operations platform. It provides real-time threat intelligence, SIEM (Security Information and Event Management), and SOAR capabilities. I am its integrated AI Assistant, designed to help you analyze logs and detect anomalies.";
    } else if (lastMessage.includes('sql') || lastMessage.includes('sqli')) {
      responseText = "Based on the dashboard context, SQL Injection attempts typically target data retrieval endpoints like `/api/v1/users`. I recommend checking the Threat Intel tab for the source IP and applying WAF rules to block patterns like `' OR 1=1 --`.";
    } else if (lastMessage.includes('brute force') || lastMessage.includes('login')) {
      responseText = "Multiple failed login attempts detected. This usually indicates a brute-force attack. You should implement rate limiting on the `/login` endpoint and consider temporarily banning the offending IPs visible in the Suspicious IPs section.";
    } else if (lastMessage.includes('xss') || lastMessage.includes('cross-site')) {
      responseText = "Cross-Site Scripting (XSS) payloads have been identified in the request logs. Ensure that all user inputs are sanitized and properly escaped before rendering. Implementing a strong Content Security Policy (CSP) will mitigate this.";
    } else if (lastMessage.includes('anomaly') || lastMessage.includes('unusual')) {
      responseText = "I am currently analyzing the log data using our Isolation Forest model. If you notice unusual traffic spikes during off-hours, it may indicate a data exfiltration attempt or an automated botnet sweep.";
    } else if (lastMessage.includes('hello') || lastMessage.includes('hi ') || lastMessage.includes('hey')) {
      responseText = "Hello! I'm actively monitoring the SentinelX dashboard. Is there a specific alert or log you'd like me to analyze?";
    } else if (lastMessage.includes('status')) {
      responseText = "The SentinelX core systems are operational. The Detection Engine is actively monitoring incoming logs. Please check the Alerts panel for any recent critical findings.";
    } else if (lastMessage.includes('help')) {
      responseText = "I can help you analyze security threats, explain specific alerts (like SQLi or XSS), provide mitigation strategies, or give an overview of the current system status. What would you like to know?";
    }

    return NextResponse.json({ response: responseText });
    
  } catch (error) {
    console.error("API Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
