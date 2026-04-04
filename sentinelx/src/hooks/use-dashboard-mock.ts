"use client";

import { useState, useEffect } from 'react';
import type { Threat, Severity } from '@/types/security';
import { useWebSocketLive } from './use-websocket-live';

interface DashboardStats {
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  total_incidents: number;
  open_incidents: number;
  resolved_incidents: number;
  total_detections: number;
  threats_blocked: number;
  uptime: number;
}

interface AlertTrend {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ThreatMap {
  country: string;
  threats: number;
  severity: string;
}

interface ActivityFeed {
  id: string;
  type: 'alert' | 'incident';
  title: string;
  severity: string;
  status: string;
  timestamp: string;
  source_ip?: string;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<AlertTrend[]>([]);
  const [threatMap, setThreatMap] = useState<ThreatMap[]>([]);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeed[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Live WebSocket connection
  const { lastMessage, isConnected, connectionStatus } = useWebSocketLive();

  // Fetch mock dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock data for development
        const mockStats = {
          total_alerts: 1247,
          critical_alerts: 23,
          high_alerts: 156,
          medium_alerts: 412,
          low_alerts: 656,
          total_incidents: 89,
          open_incidents: 34,
          resolved_incidents: 55,
          total_detections: 5432,
          threats_blocked: 1876,
          uptime: 99.8,
        };

        const mockTrends = [
          { date: '2024-03-27', critical: 18, high: 142, medium: 389, low: 621 },
          { date: '2024-03-28', critical: 22, high: 158, medium: 401, low: 643 },
          { date: '2024-03-29', critical: 19, high: 149, medium: 395, low: 632 },
          { date: '2024-03-30', critical: 25, high: 167, medium: 418, low: 667 },
          { date: '2024-03-31', critical: 21, high: 153, medium: 407, low: 649 },
          { date: '2024-04-01', critical: 23, high: 156, medium: 412, low: 656 },
          { date: '2024-04-02', critical: 23, high: 156, medium: 412, low: 656 },
        ];

        const mockThreatMap = [
          { country: 'United States', threats: 342, severity: 'high' },
          { country: 'China', threats: 287, severity: 'high' },
          { country: 'Russia', threats: 198, severity: 'medium' },
          { country: 'Brazil', threats: 156, severity: 'medium' },
          { country: 'India', threats: 134, severity: 'low' },
          { country: 'Germany', threats: 98, severity: 'low' },
          { country: 'United Kingdom', threats: 87, severity: 'low' },
          { country: 'France', threats: 76, severity: 'low' },
        ];

        const mockThreats: Threat[] = [
          { id: '1', severity: 'CRITICAL', score: 95, sourceIp: '192.168.1.100', location: 'United States', vector: 'SQL Injection', detectedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
          { id: '2', severity: 'HIGH', score: 85, sourceIp: '10.0.0.50', location: 'China', vector: 'DDoS Attack', detectedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
          { id: '3', severity: 'MEDIUM', score: 65, sourceIp: '172.16.0.25', location: 'Russia', vector: 'Malware', detectedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
          { id: '4', severity: 'LOW', score: 35, sourceIp: '203.0.113.10', location: 'Brazil', vector: 'Brute Force', detectedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
          { id: '5', severity: 'CRITICAL', score: 92, sourceIp: '198.51.100.5', location: 'India', vector: 'Cross-site Scripting', detectedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
          { id: '6', severity: 'HIGH', score: 78, sourceIp: '192.0.2.100', location: 'Germany', vector: 'SQL Injection', detectedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
          { id: '7', severity: 'MEDIUM', score: 55, sourceIp: '203.0.113.20', location: 'United Kingdom', vector: 'Malware', detectedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
          { id: '8', severity: 'LOW', score: 28, sourceIp: '198.51.100.10', location: 'France', vector: 'Port Scan', detectedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
        ];

        const mockActivityFeed: ActivityFeed[] = [
          { id: '1', type: 'alert', title: 'Suspicious login attempt detected', severity: 'high', status: 'investigating', timestamp: '2024-04-02T10:30:00Z' },
          { id: '2', type: 'incident', title: 'Malware signature identified', severity: 'critical', status: 'mitigated', timestamp: '2024-04-02T10:25:00Z' },
          { id: '3', type: 'alert', title: 'Automated response initiated', severity: 'medium', status: 'resolved', timestamp: '2024-04-02T10:20:00Z' },
          { id: '4', type: 'incident', title: 'Unusual network traffic pattern', severity: 'medium', status: 'monitoring', timestamp: '2024-04-02T10:15:00Z' },
          { id: '5', type: 'alert', title: 'Phishing attempt blocked', severity: 'high', status: 'mitigated', timestamp: '2024-04-02T10:10:00Z' },
        ];

        const mockRecentAlerts = [
          { id: 1, title: 'Critical SQL Injection Attempt', severity: 'critical', status: 'open', timestamp: '2024-04-02T10:30:00Z', source: 'Web Application Firewall' },
          { id: 2, title: 'Suspicious File Upload', severity: 'high', status: 'investigating', timestamp: '2024-04-02T10:25:00Z', source: 'File Scanner' },
          { id: 3, title: 'Brute Force Attack Detected', severity: 'high', status: 'mitigated', timestamp: '2024-04-02T10:20:00Z', source: 'Authentication System' },
          { id: 4, title: 'Unusual API Usage Pattern', severity: 'medium', status: 'monitoring', timestamp: '2024-04-02T10:15:00Z', source: 'API Gateway' },
          { id: 5, title: 'Potential Data Exfiltration', severity: 'critical', status: 'investigating', timestamp: '2024-04-02T10:10:00Z', source: 'Data Loss Prevention' },
        ];

        const mockSystemHealth = {
          cpu_usage: 45.2,
          memory_usage: 67.8,
          disk_usage: 23.4,
          network_latency: 12,
          active_connections: 1247,
          services_status: {
            detection_engine: 'healthy',
            soar_engine: 'healthy',
            database: 'healthy',
            redis: 'disabled',
          },
        };

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setStats(mockStats);
        setTrends(mockTrends);
        setThreatMap(mockThreatMap);
        setThreats(mockThreats);
        setActivityFeed(mockActivityFeed);
        setRecentAlerts(mockRecentAlerts);
        setSystemHealth(mockSystemHealth);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle real-time WebSocket updates
  useEffect(() => {
    if (!lastMessage || !isConnected) return;

    console.log('WebSocket message received:', lastMessage);

    switch (lastMessage.type) {
      case 'alerts:update':
        // Update stats and recent alerts when alerts are updated
        if (lastMessage.action === 'created') {
          setStats(prev => {
            if (!prev) return prev;
            const severityKey = `${lastMessage.data.severity.toLowerCase()}_alerts` as keyof DashboardStats;
            return {
              ...prev,
              total_alerts: prev.total_alerts + 1,
              [severityKey]: (prev[severityKey] as number) + 1
            };
          });

          setRecentAlerts(prev => [lastMessage.data, ...prev.slice(0, 9)]);
          setActivityFeed(prev => [{
            id: lastMessage.data.id,
            type: 'alert',
            title: lastMessage.data.title,
            severity: lastMessage.data.severity.toLowerCase(),
            status: lastMessage.data.status,
            timestamp: lastMessage.data.created_at,
            source_ip: lastMessage.data.source_ip
          }, ...prev.slice(0, 19)]);

          // Add to threats if it's a detection
          if (lastMessage.data.vector) {
            const newThreat: Threat = {
              id: lastMessage.data.id,
              severity: lastMessage.data.severity as Severity,
              score: lastMessage.data.severity === 'CRITICAL' ? 95 : 
                     lastMessage.data.severity === 'HIGH' ? 85 : 
                     lastMessage.data.severity === 'MEDIUM' ? 65 : 35,
              sourceIp: lastMessage.data.source_ip,
              location: 'Unknown',
              vector: lastMessage.data.vector,
              detectedAt: lastMessage.data.created_at,
            };
            setThreats(prev => [newThreat, ...prev.slice(0, 19)]);
          }
        } else if (lastMessage.action === 'resolved') {
          setStats(prev => {
            if (!prev) return prev;
            const severityKey = `${lastMessage.data.severity.toLowerCase()}_alerts` as keyof DashboardStats;
            return {
              ...prev,
              [severityKey]: Math.max(0, (prev[severityKey] as number) - 1)
            };
          });
        }
        break;

      case 'incidents:update':
        // Update incident stats
        if (lastMessage.action === 'created') {
          setStats(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              total_incidents: prev.total_incidents + 1,
              open_incidents: prev.open_incidents + 1,
            };
          });
        } else if (lastMessage.action === 'resolved') {
          setStats(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              open_incidents: prev.open_incidents - 1,
              resolved_incidents: prev.resolved_incidents + 1,
            };
          });
        }
        break;

      case 'detections:update':
        // Update detection stats and threats
        if (lastMessage.action === 'detected') {
          setStats(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              total_detections: prev.total_detections + 1,
            };
          });

          const newThreat: Threat = {
            id: lastMessage.data.id,
            severity: lastMessage.data.severity as Severity,
            score: lastMessage.data.severity === 'CRITICAL' ? 95 : 
                   lastMessage.data.severity === 'HIGH' ? 85 : 
                   lastMessage.data.severity === 'MEDIUM' ? 65 : 35,
            sourceIp: lastMessage.data.source_ip,
            location: 'Unknown',
            vector: lastMessage.data.vector,
            detectedAt: lastMessage.data.detected_at,
          };
          setThreats(prev => [newThreat, ...prev.slice(0, 19)]);

          setActivityFeed(prev => [{
            id: lastMessage.data.id,
            type: 'alert',
            title: lastMessage.data.title,
            severity: lastMessage.data.severity.toLowerCase(),
            status: 'detected',
            timestamp: lastMessage.data.detected_at,
            source_ip: lastMessage.data.source_ip
          }, ...prev.slice(0, 19)]);
        }
        break;

      case 'system:health':
        // Update system health
        setSystemHealth(lastMessage.data);
        break;
    }
  }, [lastMessage, isConnected]);

  // Mock functions for actions
  const acknowledgeAlert = async (alertId: number) => {
    console.log('Acknowledging alert:', alertId);
    // Mock implementation
  };

  const resolveAlert = async (alertId: number) => {
    console.log('Resolving alert:', alertId);
    // Mock implementation
  };

  const createIncident = async (alertId: number) => {
    console.log('Creating incident from alert:', alertId);
    // Mock implementation
  };

  const escalateAlert = async (alertId: number) => {
    console.log('Escalating alert:', alertId);
    // Mock implementation
  };

  const getAlertDetails = async (alertId: number) => {
    console.log('Getting alert details:', alertId);
    // Mock implementation
    return null;
  };

  const getIncidentDetails = async (incidentId: number) => {
    console.log('Getting incident details:', incidentId);
    // Mock implementation
    return null;
  };

  return {
    stats,
    trends,
    threatMap,
    threats,
    activityFeed,
    recentAlerts,
    systemHealth,
    isLoading,
    error,
    isConnected,
    connectionStatus,
    refresh: () => {},
    acknowledgeAlert,
    resolveAlert,
    createIncident,
    escalateAlert,
    getAlertDetails,
    getIncidentDetails,
  };
}
