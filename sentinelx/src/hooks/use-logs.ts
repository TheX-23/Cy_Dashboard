"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LogEntry, LogFilter, LogAnalytics, LogLevel, LogSource, EventType } from '@/types/logs';

// Mock log generator
function generateMockLogs(count: number = 100): LogEntry[] {
  const levels: LogLevel[] = ['INFO', 'WARN', 'ERROR', 'CRITICAL'];
  const sources: LogSource[] = ['API', 'Auth', 'Firewall', 'System', 'Database', 'Network'];
  const eventTypes: EventType[] = ['Login', 'Attack', 'Request', 'DataAccess', 'System', 'Security', 'Error'];
  
  const countries = ['USA', 'UK', 'Russia', 'China', 'Germany', 'Japan', 'Brazil', 'India', 'Canada', 'Australia'];
  const cities = {
    USA: ['New York', 'San Francisco', 'Chicago', 'Seattle'],
    UK: ['London', 'Manchester', 'Birmingham'],
    Russia: ['Moscow', 'St. Petersburg', 'Novosibirsk'],
    China: ['Beijing', 'Shanghai', 'Shenzhen'],
    Germany: ['Berlin', 'Munich', 'Hamburg'],
    Japan: ['Tokyo', 'Osaka', 'Kyoto'],
    Brazil: ['São Paulo', 'Rio de Janeiro', 'Brasília'],
    India: ['Mumbai', 'Delhi', 'Bangalore'],
    Canada: ['Toronto', 'Vancouver', 'Montreal'],
    Australia: ['Sydney', 'Melbourne', 'Brisbane']
  };

  const attackTypes = ['SQL Injection', 'XSS', 'Brute Force', 'DDoS', 'Port Scan', 'Malware', 'Phishing'];
  const users = ['admin@sentinelx.com', 'analyst1@company.com', 'security@team.com', null];

  return Array.from({ length: count }, (_, i) => {
    const country = countries[Math.floor(Math.random() * (countries?.length || 0))];
    const cityList = cities[country as keyof typeof cities];
    const city = cityList?.[Math.floor(Math.random() * (cityList?.length || 0))];
    const level = Math.random() < 0.7 ? 'INFO' : levels[Math.floor(Math.random() * ((levels?.length || 0) - 1))];
    const isAttack = Math.random() < 0.15;
    
    return {
      id: `log-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      level,
      source: sources[Math.floor(Math.random() * (sources?.length || 0))],
      eventType: isAttack ? 'Attack' : eventTypes[Math.floor(Math.random() * (eventTypes?.length || 0))],
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userId: users[Math.floor(Math.random() * (users?.length || 0))] || undefined,
      message: isAttack 
        ? `${attackTypes[Math.floor(Math.random() * (attackTypes?.length || 0))]} attempt detected from ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        : `${level}: System operation completed successfully`,
      rawMessage: JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        source: sources[Math.floor(Math.random() * (sources?.length || 0))],
        message: isAttack ? `Security event detected` : `System operation`,
        metadata: {}
      }),
      metadata: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: Math.random() > 0.5 ? 'GET' : 'POST',
        path: isAttack ? '/admin/login' : '/api/dashboard',
        statusCode: isAttack ? 401 : Math.random() > 0.8 ? 500 : 200,
        responseTime: Math.floor(Math.random() * 1000) + 50,
        country,
        region: country,
        sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
        requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'Mozilla/5.0 (compatible; SentinelX/1.0)',
          'x-forwarded-for': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        },
        payload: isAttack ? {
          attackType: attackTypes[Math.floor(Math.random() * (attackTypes?.length || 0))],
          severity: level,
          blocked: Math.random() > 0.3
        } : {
          operation: 'read',
          resource: 'user_data',
          success: true
        },
        geoLocation: {
          lat: (Math.random() * 180 - 90),
          lng: (Math.random() * 360 - 180),
          city,
          country
        }
      },
      tags: isAttack ? ['security', 'attack', level.toLowerCase()] : ['system', level.toLowerCase()],
      isAnomaly: isAttack || level === 'CRITICAL',
      relatedLogs: Math.random() > 0.7 ? [`log-${Date.now()}-${i + 1}`] : undefined
    };
  });
}

export function useLogs(initialFilter: Partial<LogFilter> = {}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const [filter, setFilter] = useState<LogFilter>({
    search: '',
    timeRange: '24h',
    levels: [],
    sources: [],
    eventTypes: [],
    ipAddress: '',
    userId: '',
    country: '',
    ...initialFilter
  });
  const hasActiveFilters = filter.search || 
    filter.levels?.length > 0 || 
    filter.sources?.length > 0 || 
    filter.eventTypes?.length > 0 || 
    filter.ipAddress || 
    filter.userId || 
    filter.country;
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Generate mock data only on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setLogs(generateMockLogs(200));
  }, []);

  // Simulate real-time streaming
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      const newLogs = generateMockLogs(Math.floor(Math.random() * 3) + 1);
      setLogs(prev => [...newLogs, ...prev].slice(0, 1000));
    }, Math.random() * 3000 + 2000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        if (!log.message.toLowerCase().includes(searchLower) &&
            !log.ipAddress.includes(filter.search) &&
            !(log.userId && log.userId.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // Level filter
      if (filter.levels?.length > 0 && !filter.levels.includes(log.level)) {
        return false;
      }

      // Source filter
      if (filter.sources?.length > 0 && !filter.sources.includes(log.source)) {
        return false;
      }

      // Event type filter
      if (filter.eventTypes?.length > 0 && !filter.eventTypes.includes(log.eventType)) {
        return false;
      }

      // IP filter
      if (filter.ipAddress && !log.ipAddress.includes(filter.ipAddress)) {
        return false;
      }

      // User filter
      if (filter.userId && (!log.userId || !log.userId.includes(filter.userId))) {
        return false;
      }

      // Country filter
      if (filter.country && (!log.metadata.country || !log.metadata.country.toLowerCase().includes(filter.country.toLowerCase()))) {
        return false;
      }

      // Time range filter
      const now = new Date();
      let startTime: Date;
      
      switch (filter.timeRange) {
        case '5m':
          startTime = new Date(now.getTime() - 5 * 60 * 1000);
          break;
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
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
      
      if (log.timestamp < startTime || log.timestamp > endTime) {
        return false;
      }

      return true;
    });
  }, [logs, filter, isClient]);

  // Analytics - only calculate when client-side and data is available
  const analytics = useMemo((): LogAnalytics => {
    if (!isClient || filteredLogs.length === 0) {
      return {
        logsPerMinute: [],
        errorRate: 0,
        topSources: [],
        eventDistribution: [],
        totalLogs: 0,
        criticalLogs: 0,
        suspiciousIPs: []
      };
    }

    const now = new Date();
    const logsPerMinute = Array.from({ length: 20 }, (_, i) => {
      const time = new Date(now.getTime() - (19 - i) * 60 * 1000);
      const count = filteredLogs.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= time && logTime < new Date(time.getTime() + 60 * 1000);
      }).length;
      const errors = filteredLogs.filter(log => {
        const logTime = new Date(log.timestamp);
        return (logTime >= time && logTime < new Date(time.getTime() + 60 * 1000)) &&
               (log.level === 'ERROR' || log.level === 'CRITICAL');
      }).length;
      
      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        count,
        errors
      };
    });

    const errorCount = filteredLogs.filter(log => log.level === 'ERROR' || log.level === 'CRITICAL')?.length || 0;
    const errorRate = (filteredLogs?.length || 0) > 0 ? (errorCount / (filteredLogs?.length || 0)) * 100 : 0;

    const sourceCounts = filteredLogs.reduce((acc, log) => {
      acc[log.source] = (acc[log.source] || 0) + 1;
      return acc;
    }, {} as Record<LogSource, number>);

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source: source as LogSource, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const eventTypeCounts = filteredLogs.reduce((acc, log) => {
      acc[log.eventType] = (acc[log.eventType] || 0) + 1;
      return acc;
    }, {} as Record<EventType, number>);

    const eventDistribution = Object.entries(eventTypeCounts)
      .map(([type, count]) => ({ type: type as EventType, count }))
      .sort((a, b) => b.count - a.count);

    const suspiciousIPs = Array.from(new Set(
      filteredLogs
        .filter(log => log.isAnomaly || log.level === 'CRITICAL')
        .map(log => log.ipAddress)
    )).slice(0, 10);

    return {
      logsPerMinute,
      errorRate,
      topSources,
      eventDistribution,
      totalLogs: (filteredLogs?.length || 0),
      criticalLogs: filteredLogs.filter(log => log.level === 'CRITICAL')?.length || 0,
      suspiciousIPs
    };
  }, [filteredLogs, isClient]);

  const updateFilter = useCallback((newFilter: Partial<LogFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilter({
      search: '',
      timeRange: '24h',
      levels: [],
      sources: [],
      eventTypes: [],
      ipAddress: '',
      userId: '',
      country: ''
    });
  }, []);

  const exportLogs = useCallback((format: 'csv' | 'json') => {
    const data = format === 'csv' 
      ? convertToCSV(filteredLogs)
      : JSON.stringify(filteredLogs, null, 2);
    
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredLogs]);

  return {
    logs: isClient ? filteredLogs : [],
    analytics,
    filter,
    isLoading: isLoading || !isClient,
    isLiveStreaming,
    selectedLogId,
    updateFilter,
    clearFilter,
    setSelectedLogId,
    setIsLiveStreaming,
    exportLogs,
    refreshLogs: () => setLogs(generateMockLogs(200))
  };
}

function convertToCSV(logs: LogEntry[]): string {
  const headers = ['Timestamp', 'Level', 'Source', 'Event Type', 'IP Address', 'User ID', 'Message', 'Country'];
  const rows = logs.map(log => [
    log.timestamp.toISOString(),
    log.level,
    log.source,
    log.eventType,
    log.ipAddress,
    log.userId || '',
    log.message,
    log.metadata.country || ''
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
