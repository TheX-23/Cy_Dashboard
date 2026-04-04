"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  action?: string;
  data?: any;
  timestamp: string;
}

interface UseWebSocketLiveReturn {
  lastMessage: WebSocketMessage | null;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendMessage: (message: any) => void;
  reconnect: () => void;
}

export function useWebSocketLive(url?: string): UseWebSocketLiveReturn {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate mock real-time data
  const generateMockMessage = useCallback((): WebSocketMessage => {
    const messageTypes = ['alerts:update', 'incidents:update', 'detections:update', 'system:health'];
    const randomType = messageTypes[Math.floor(Math.random() * (messageTypes?.length || 0))];
    
    const baseMessage = {
      type: randomType,
      timestamp: new Date().toISOString(),
    };

    switch (randomType) {
      case 'alerts:update':
        return {
          ...baseMessage,
          action: Math.random() > 0.7 ? 'created' : 'resolved',
          data: {
            id: Date.now().toString(),
            title: generateAlertTitle(),
            severity: generateSeverity(),
            status: 'open',
            source: generateSource(),
            source_ip: generateIP(),
            vector: generateVector(), // Add vector property
            created_at: new Date().toISOString(),
          },
        };

      case 'incidents:update':
        return {
          ...baseMessage,
          action: Math.random() > 0.8 ? 'created' : 'resolved',
          data: {
            id: Date.now().toString(),
            title: generateIncidentTitle(),
            severity: generateSeverity(),
            status: 'active',
            source_ip: generateIP(), // Add source_ip
            vector: generateVector(), // Add vector property
            created_at: new Date().toISOString(),
          },
        };

      case 'detections:update':
        return {
          ...baseMessage,
          action: 'detected',
          data: {
            id: Date.now().toString(),
            title: generateDetectionTitle(),
            severity: generateSeverity(),
            source_ip: generateIP(),
            vector: generateVector(),
            detected_at: new Date().toISOString(),
          },
        };

      case 'system:health':
        return {
          ...baseMessage,
          data: {
            cpu_usage: 40 + Math.random() * 20,
            memory_usage: 60 + Math.random() * 15,
            disk_usage: 20 + Math.random() * 10,
            network_latency: 10 + Math.random() * 10,
            active_connections: 1000 + Math.floor(Math.random() * 500),
            services_status: {
              detection_engine: 'healthy',
              soar_engine: 'healthy',
              database: 'healthy',
              redis: 'disabled',
            },
          },
        };

      default:
        return baseMessage;
    }
  }, []);

  // Helper functions to generate realistic data
  const generateAlertTitle = () => {
    const titles = [
      'Critical SQL Injection Attempt',
      'Suspicious File Upload',
      'Brute Force Attack Detected',
      'Unusual API Usage Pattern',
      'Potential Data Exfiltration',
      'Cross-site Scripting Attempt',
      'Directory Traversal Attack',
      'Command Injection Detected',
    ];
    return titles[Math.floor(Math.random() * (titles?.length || 0))];
  };

  const generateIncidentTitle = () => {
    const titles = [
      'Malware Outbreak Detected',
      'DDoS Attack in Progress',
      'Data Breach Investigation',
      'Phishing Campaign Active',
      'Ransomware Attack Identified',
      'Insider Threat Detected',
      'Zero-day Exploit Found',
      'Supply Chain Attack',
    ];
    return titles[Math.floor(Math.random() * (titles?.length || 0))];
  };

  const generateDetectionTitle = () => {
    const titles = [
      'Suspicious Network Activity',
      'Anomalous User Behavior',
      'Unauthorized Access Attempt',
      'Malicious Payload Detected',
      'Unusual Data Transfer',
      'Suspicious Process Execution',
      'Abnormal Login Pattern',
      'Potential Threat Signature',
    ];
    return titles[Math.floor(Math.random() * (titles?.length || 0))];
  };

  const generateSeverity = () => {
    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const weights = [0.1, 0.2, 0.4, 0.3]; // More realistic distribution
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < (severities?.length || 0); i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        return severities[i];
      }
    }
    return severities[(severities?.length || 0) - 1];
  };

  const generateSource = () => {
    const sources = [
      'Web Application Firewall',
      'File Scanner',
      'Authentication System',
      'API Gateway',
      'Data Loss Prevention',
      'Network Monitor',
      'Host Intrusion Detection',
      'Security Information System',
    ];
    return sources[Math.floor(Math.random() * (sources?.length || 0))];
  };

  const generateIP = () => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  };

  const generateVector = () => {
    const vectors = [
      'SQL Injection',
      'DDoS Attack',
      'Malware',
      'Cross-site Scripting',
      'Brute Force',
      'Port Scan',
      'Phishing',
      'Command Injection',
      'Directory Traversal',
      'Zero-day Exploit',
    ];
    return vectors[Math.floor(Math.random() * (vectors?.length || 0))];
  };

  // Simulate WebSocket connection with mock data
  const connect = useCallback(() => {
    setConnectionStatus('connecting');
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Start sending mock messages
      messageIntervalRef.current = setInterval(() => {
        const message = generateMockMessage();
        setLastMessage(message);
        
        // Simulate occasional disconnections
        if (Math.random() < 0.02) { // 2% chance of disconnection
          disconnect();
          setTimeout(() => {
            connect();
          }, 1000 + Math.random() * 2000);
        }
      }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
    }, 500);
  }, [generateMockMessage]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (isConnected && ws.current) {
      ws.current.send(JSON.stringify(message));
    }
  }, [isConnected]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  }, [disconnect, connect]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    lastMessage,
    isConnected,
    connectionStatus,
    sendMessage,
    reconnect,
  };
}
