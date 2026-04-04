"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { detectionAPI } from '@/lib/api/detection';

interface WebSocketMessage {
  type: 'system' | 'log' | 'threat' | 'alert' | 'incident' | 'soar_action';
  channel: string;
  message: string;
  data?: any;
  at: string;
}

interface DetectionEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: string;
  riskScore: number;
  timestamp: Date;
  sourceLogId: string;
  matchedConditions: string[];
  description: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  endpoint?: string;
  payload: Record<string, any>;
}

interface DetectionRule {
  id: string;
  name: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  conditions: any[];
  actions: any[];
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export function useDetectionRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const [threats, setThreats] = useState<DetectionEvent[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const threatsWSRef = useRef<WebSocket | null>(null);
  const alertsWSRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback((url: string, onMessage: (event: MessageEvent) => void) => {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log(`Connected to ${url}`);
        setIsConnected(true);
        setConnectionStatus('connected');
      };

      ws.onmessage = onMessage;

      ws.onclose = (event) => {
        console.log(`Disconnected from ${url}`, event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket(url, onMessage);
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for ${url}:`, error);
        setConnectionStatus('error');
      };

      return ws;
    } catch (error) {
      console.error(`Failed to connect to ${url}:`, error);
      setConnectionStatus('error');
      return null;
    }
  }, []);

  const handleThreatMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      setLastMessage(message);

      switch (message.type) {
        case 'system':
          console.log('System message:', message.message);
          break;
          
        case 'threat':
          if (message.data) {
            const threatEvent: DetectionEvent = {
              ...message.data,
              timestamp: new Date(message.data.detectedAt || message.at),
              ruleId: message.data.ruleId || '',
              ruleName: message.data.ruleName || 'Unknown',
              severity: message.data.severity || 'MEDIUM',
              riskScore: message.data.score || 50,
              sourceLogId: message.data.logId || '',
              matchedConditions: message.data.findings || [],
              description: message.data.description || 'Threat detected',
              payload: message.data.payload || {}
            };
            
            setThreats(prev => [threatEvent, ...prev.slice(0, 49)]); // Keep last 50 events
          }
          break;
          
        case 'alert':
          if (message.data) {
            setAlerts(prev => [message.data, ...prev.slice(0, 19)]); // Keep last 20 alerts
          }
          break;
          
        default:
          console.log('Unknown message type:', message.type, message.data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);

  const handleAlertMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      setLastMessage(message);

      switch (message.type) {
        case 'system':
          console.log('Alerts system message:', message.message);
          break;
          
        case 'alert':
          if (message.data) {
            setAlerts(prev => [message.data, ...prev.slice(0, 19)]); // Keep last 20 alerts
          }
          break;
          
        default:
          console.log('Alerts unknown message type:', message.type, message.data);
      }
    } catch (error) {
      console.error('Error parsing alerts WebSocket message:', error);
    }
  }, []);

  const connect = useCallback(() => {
    setConnectionStatus('connecting');
    
    // Connect to threats WebSocket
    const threatsWS = connectWebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/threats`, handleThreatMessage);
    if (threatsWS) {
      threatsWSRef.current = threatsWS;
    }

    // Connect to alerts WebSocket
    const alertsWS = connectWebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws/alerts`, handleAlertMessage);
    if (alertsWS) {
      alertsWSRef.current = alertsWS;
    }
  }, [connectWebSocket, handleThreatMessage, handleAlertMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (threatsWSRef.current) {
      threatsWSRef.current.close();
      threatsWSRef.current = null;
    }

    if (alertsWSRef.current) {
      alertsWSRef.current.close();
      alertsWSRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const clearThreats = useCallback(() => {
    setThreats([]);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, reduce update frequency
        console.log('Page hidden, reducing WebSocket activity');
      } else {
        // Page is visible, ensure connection
        if (!isConnected) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, connect]);

  // Handle network connectivity
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network online');
      if (!isConnected) {
        connect();
      }
    };

    const handleOffline = () => {
      console.log('Network offline');
      disconnect();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    threats,
    alerts,
    lastMessage,
    connect,
    disconnect,
    clearThreats,
    clearAlerts,
    reconnect: () => {
      disconnect();
      setTimeout(connect, 1000);
    }
  };
}
