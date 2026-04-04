"use client";

import { useEffect, useRef, useState } from 'react';
import apiClient from '@/lib/api-client';

interface WebSocketMessage {
  id?: string;
  type?: string;
  action?: string;
  timestamp?: string;
  data?: any;
  [key: string]: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  error: string | null;
  sendMessage: (message: any) => void;
  reconnect: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const ws = apiClient.createWebSocket();
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        console.log('WebSocket disconnected:', event.code, event.reason);

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
            connect();
          }, delay);
        }
      };

      ws.onerror = (event) => {
        setError('WebSocket connection error');
        console.error('WebSocket error:', event);
      };

    } catch (err) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket creation error:', err);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  const sendMessage = (message: any) => {
    if (wsRef.current && isConnected) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (err) {
        console.error('Error sending WebSocket message:', err);
      }
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  const reconnect = () => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(connect, 1000);
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    reconnect,
  };
}

// Hook for specific WebSocket events
export function useWebSocketEvent<T = any>(eventType: string) {
  const [data, setData] = useState<T | null>(null);
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage && lastMessage.type === eventType) {
      setData(lastMessage.data);
    }
  }, [lastMessage, eventType]);

  return data;
}

// Hooks for specific event types
export function useAlertsUpdate() {
  return useWebSocketEvent('alerts:update');
}

export function useLogsUpdate() {
  return useWebSocketEvent('logs:update');
}

export function useThreatsUpdate() {
  return useWebSocketEvent('threats:update');
}

export function useIncidentsUpdate() {
  return useWebSocketEvent('incidents:update');
}
