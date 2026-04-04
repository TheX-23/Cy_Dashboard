"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, AlertFilter, AlertAnalytics, AlertSeverity, AlertSource, AttackType, AlertStatus, AlertAction, AlertNote } from '@/types/alerts';

// Mock alert generator
function generateMockAlerts(count: number = 100): Alert[] {
  const severities: AlertSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const sources: AlertSource[] = ['Auth', 'API', 'Firewall', 'IDS', 'Network', 'System'];
  const attackTypes: AttackType[] = ['SQL Injection', 'XSS', 'Brute Force', 'DDoS', 'Port Scan', 'Malware', 'Phishing', 'Unauthorized Access'];
  const statuses: AlertStatus[] = ['OPEN', 'INVESTIGATING', 'RESOLVED'];
  const users = ['admin@sentinelx.com', 'analyst1@company.com', 'security@team.com', 'john.doe@company.com', 'jane.smith@company.com'];
  
  const countries = ['USA', 'Russia', 'China', 'North Korea', 'Iran', 'Brazil', 'India', 'Germany', 'UK', 'France'];
  const cities = {
    'USA': ['New York', 'San Francisco', 'Chicago', 'Seattle', 'Washington DC'],
    'Russia': ['Moscow', 'St. Petersburg', 'Novosibirsk'],
    'China': ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou'],
    'North Korea': ['Pyongyang'],
    'Iran': ['Tehran', 'Mashhad', 'Isfahan'],
    'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília'],
    'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'],
    'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
    'UK': ['London', 'Manchester', 'Birmingham', 'Glasgow'],
    'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse']
  };

  const generateAlertDetails = (attackType: AttackType, severity: AlertSeverity) => {
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const country = countries[Math.floor(Math.random() * countries.length)];
    const cityList = cities[country as keyof typeof cities] || ['Unknown'];
    const city = cityList[Math.floor(Math.random() * cityList.length)];
    
    return {
      ip,
      country,
      region: country,
      city,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: `session-${Math.random().toString(36).substr(2, 9)}`
    };
  };

  const generateSuggestedActions = (attackType: AttackType, severity: AlertSeverity): AlertAction[] => {
    const actions: AlertAction[] = [];
    
    if (attackType === 'Brute Force' || attackType === 'Unauthorized Access') {
      actions.push({
        id: 'block_ip',
        type: 'block_ip',
        title: 'Block IP Address',
        description: 'Block the malicious IP address at the firewall',
        automated: true,
        risk: 'low'
      });
    }
    
    if (attackType === 'Unauthorized Access' || attackType === 'Brute Force') {
      actions.push({
        id: 'reset_password',
        type: 'reset_password',
        title: 'Reset User Password',
        description: 'Force password reset for affected user account',
        automated: true,
        risk: 'medium'
      });
    }
    
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      actions.push({
        id: 'escalate',
        type: 'escalate',
        title: 'Escalate to Incident',
        description: 'Convert this alert to a security incident',
        automated: false,
        risk: 'low'
      });
    }
    
    actions.push({
      id: 'investigate',
      type: 'investigate_session',
      title: 'Investigate Session',
      description: 'Deep dive into user session and related activities',
      automated: false,
      risk: 'low'
    });
    
    return actions;
  };

  return Array.from({ length: count }, (_, i) => {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
    const status = Math.random() < 0.6 ? 'OPEN' : Math.random() < 0.8 ? 'INVESTIGATING' : 'RESOLVED';
    const alertDetails = generateAlertDetails(attackType, severity);
    const correlationId = Math.random() < 0.2 ? `corr-${Math.random().toString(36).substr(2, 9)}` : undefined;
    
    return {
      id: `alert-${Date.now()}-${i}`,
      severity,
      title: `${attackType} detected`,
      description: `Suspicious ${attackType.toLowerCase()} activity detected from ${alertDetails.ip}. This could indicate a coordinated attack attempt.`,
      source,
      attackType,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      status: status as AlertStatus,
      assignedTo: status !== 'OPEN' ? users[Math.floor(Math.random() * users.length)] : undefined,
      affectedAsset: {
        type: Math.random() < 0.5 ? 'IP' : Math.random() < 0.8 ? 'User' : 'System',
        value: Math.random() < 0.5 ? alertDetails.ip : `user-${Math.floor(Math.random() * 1000)}`,
        details: alertDetails
      },
      riskScore: Math.floor(Math.random() * 100) + 1,
      triggerReason: `Pattern matching detected unusual ${attackType.toLowerCase()} behavior with high confidence score`,
      affectedSystems: [`server-${Math.floor(Math.random() * 10) + 1}`, `app-${Math.floor(Math.random() * 5) + 1}`],
      relatedLogs: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => `log-${Date.now()}-${i}-${j}`),
      relatedAlerts: correlationId ? [correlationId] : [],
      tags: [attackType.toLowerCase().replace(' ', '-'), severity.toLowerCase(), source.toLowerCase()],
      notes: [],
      aiSummary: severity === 'CRITICAL' || severity === 'HIGH' 
        ? `This ${attackType.toLowerCase()} alert shows indicators of a sophisticated attack. Immediate investigation recommended. The attack pattern matches known threat actor behaviors.`
        : `Standard ${attackType.toLowerCase()} activity detected. Monitor for escalation.`,
      suggestedActions: generateSuggestedActions(attackType, severity),
      isAnomaly: Math.random() < 0.3,
      correlationId
    };
  });
}

export function useAlerts(initialFilter: Partial<AlertFilter> = {}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const [filter, setFilter] = useState<AlertFilter>({
    search: '',
    severity: [],
    status: [],
    source: [],
    timeRange: '24h',
    assignedTo: '',
    ...initialFilter
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  // Generate mock data only on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setAlerts(generateMockAlerts(150));
  }, []);

  // Simulate real-time alerts
  useEffect(() => {
    console.log("Live streaming effect triggered:", isLiveStreaming);
    if (!isLiveStreaming) return;

    console.log("Starting live stream interval...");
    const interval = setInterval(() => {
      const newAlerts = generateMockAlerts(Math.floor(Math.random() * 3) + 1);
      console.log("Adding new alerts:", newAlerts.length);
      setAlerts(prev => {
        const updated = [...newAlerts, ...prev].slice(0, 500);
        console.log("Total alerts after update:", updated.length);
        return updated;
      });
    }, Math.random() * 8000 + 5000);

    return () => {
      console.log("Clearing live stream interval");
      clearInterval(interval);
    };
  }, [isLiveStreaming]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        if (!alert.title.toLowerCase().includes(searchLower) &&
            !alert.description.toLowerCase().includes(searchLower) &&
            !alert.affectedAsset?.value?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Severity filter
      if (filter.severity?.length > 0 && !filter.severity.includes(alert.severity)) {
        return false;
      }

      // Status filter
      if (filter.status?.length > 0 && !filter.status.includes(alert.status)) {
        return false;
      }

      // Source filter
      if (filter.source?.length > 0 && !filter.source.includes(alert.source)) {
        return false;
      }

      // Assigned to filter
      if (filter.assignedTo && (!alert.assignedTo || !alert.assignedTo.includes(filter.assignedTo))) {
        return false;
      }

      // Time range filter
      const now = new Date();
      let startTime: Date;
      
      switch (filter.timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 1 * 60 * 60 * 1000);
          break;
        case '6h':
          startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'custom':
          startTime = filter.customStart || new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const endTime = filter.timeRange === 'custom' && filter.customEnd ? filter.customEnd : now;
      
      if (alert.timestamp < startTime || alert.timestamp > endTime) {
        return false;
      }

      return true;
    });
  }, [alerts, filter, isClient]);

  // Analytics - only calculate when client-side and data is available
  const analytics = useMemo((): AlertAnalytics => {
    if (!isClient || filteredAlerts.length === 0) {
      return {
        totalAlerts: 0,
        criticalAlerts: 0,
        openAlerts: 0,
        resolvedAlerts: 0,
        alertsOverTime: [],
        alertsBySeverity: [],
        alertsBySource: [],
        topAttackTypes: [],
        averageResolutionTime: 0,
        escalationRate: 0
      };
    }

    const totalAlerts = filteredAlerts.length;
    const criticalAlerts = filteredAlerts.filter(alert => alert.severity === 'CRITICAL').length;
    const openAlerts = filteredAlerts.filter(alert => alert.status === 'OPEN').length;
    const resolvedAlerts = filteredAlerts.filter(alert => alert.status === 'RESOLVED').length;

    // Alerts over time (last 24 hours)
    const now = new Date();
    const alertsOverTime = Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const count = filteredAlerts.filter(alert => {
        const alertTime = new Date(alert.timestamp);
        return alertTime >= time && alertTime < new Date(time.getTime() + 60 * 60 * 1000);
      }).length;
      const critical = filteredAlerts.filter(alert => {
        const alertTime = new Date(alert.timestamp);
        return (alertTime >= time && alertTime < new Date(time.getTime() + 60 * 60 * 1000)) &&
               alert.severity === 'CRITICAL';
      }).length;
      
      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        total: count,
        critical
      };
    });

    // Alerts by severity
    const severityCounts = filteredAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<AlertSeverity, number>);

    const alertsBySeverity = Object.entries(severityCounts)
      .map(([severity, count]) => ({ severity: severity as AlertSeverity, count }))
      .sort((a, b) => {
        const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

    // Alerts by source
    const sourceCounts = filteredAlerts.reduce((acc, alert) => {
      acc[alert.source] = (acc[alert.source] || 0) + 1;
      return acc;
    }, {} as Record<AlertSource, number>);

    const alertsBySource = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source: source as AlertSource, count }))
      .sort((a, b) => b.count - a.count);

    // Top attack types
    const attackTypeCounts = filteredAlerts.reduce((acc, alert) => {
      acc[alert.attackType] = (acc[alert.attackType] || 0) + 1;
      return acc;
    }, {} as Record<AttackType, number>);

    const topAttackTypes = Object.entries(attackTypeCounts)
      .map(([type, count]) => ({ type: type as AttackType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Average resolution time (mock)
    const averageResolutionTime = 2.5; // hours

    // Escalation rate
    const escalationRate = filteredAlerts.length > 0 ? (criticalAlerts / filteredAlerts.length) * 100 : 0;

    return {
      totalAlerts,
      criticalAlerts,
      openAlerts,
      resolvedAlerts,
      alertsOverTime,
      alertsBySeverity,
      alertsBySource,
      topAttackTypes,
      averageResolutionTime,
      escalationRate
    };
  }, [filteredAlerts, isClient]);

  const updateFilter = useCallback((newFilter: Partial<AlertFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilter({
      search: '',
      severity: [],
      status: [],
      source: [],
      timeRange: '24h',
      assignedTo: ''
    });
  }, []);

  const updateAlertStatus = useCallback((alertId: string, status: AlertStatus, assignedTo?: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status, assignedTo: assignedTo || alert.assignedTo }
        : alert
    ));
  }, []);

  const addNote = useCallback((alertId: string, note: Omit<AlertNote, 'id' | 'timestamp'>) => {
    const newNote: AlertNote = {
      ...note,
      id: `note-${Date.now()}`,
      timestamp: new Date()
    };
    
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, notes: [...alert.notes, newNote] }
        : alert
    ));
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    updateAlertStatus(alertId, 'INVESTIGATING');
  }, [updateAlertStatus]);

  const resolveAlert = useCallback((alertId: string) => {
    updateAlertStatus(alertId, 'RESOLVED');
  }, [updateAlertStatus]);

  const escalateAlert = useCallback((alertId: string) => {
    // TODO: Implement incident creation
    console.log('Escalating alert to incident:', alertId);
  }, []);

  const exportAlerts = useCallback((format: 'csv' | 'json') => {
    const data = format === 'csv' 
      ? convertToCSV(filteredAlerts)
      : JSON.stringify(filteredAlerts, null, 2);
    
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-${new Date().toISOString()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredAlerts, isClient]);

  return {
    alerts: isClient ? filteredAlerts : [],
    analytics,
    filter,
    isLoading: isLoading || !isClient,
    isLiveStreaming,
    selectedAlertId,
    updateFilter,
    clearFilter,
    setSelectedAlertId,
    setIsLiveStreaming,
    updateAlertStatus,
    addNote,
    acknowledgeAlert,
    resolveAlert,
    escalateAlert,
    exportAlerts,
    refreshAlerts: () => setAlerts(generateMockAlerts(150))
  };
}

function convertToCSV(alerts: Alert[]): string {
  const headers = ['ID', 'Severity', 'Title', 'Source', 'Attack Type', 'Status', 'Assigned To', 'Asset', 'Timestamp'];
  const rows = alerts.map(alert => [
    alert.id,
    alert.severity,
    alert.title,
    alert.source,
    alert.attackType,
    alert.status,
    alert.assignedTo || '',
    alert.affectedAsset?.value,
    alert.timestamp.toISOString()
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
