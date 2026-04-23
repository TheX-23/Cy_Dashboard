export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
export type LogSource = 'API' | 'Auth' | 'Firewall' | 'System' | 'Database' | 'Network';
export type EventType = 'Login' | 'Attack' | 'Request' | 'DataAccess' | 'System' | 'Security' | 'Error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  source: LogSource;
  eventType: EventType;
  ipAddress: string;
  userId?: string;
  message: string;
  rawMessage: string;
  metadata: {
    userAgent?: string;
    method?: string;
    path?: string;
    statusCode?: number;
    responseTime?: number;
    country?: string;
    region?: string;
    sessionId?: string;
    requestId?: string;
    headers?: Record<string, string>;
    payload?: Record<string, any>;
    geoLocation?: {
      lat: number;
      lng: number;
      city: string;
      country: string;
    };
  };
  tags: string[];
  isAnomaly?: boolean;
  relatedLogs?: string[];
}

export interface LogFilter {
  search: string;
  timeRange: '5m' | '1h' | '24h' | '7d' | 'custom';
  customStart?: Date;
  customEnd?: Date;
  levels: LogLevel[];
  sources: LogSource[];
  eventTypes: EventType[];
  ipAddress: string;
  userId: string;
  country: string;
}

export interface LogAnalytics {
  logsPerMinute: Array<{ time: string; count: number; errors: number }>;
  errorRate: number;
  topSources: Array<{ source: LogSource; count: number }>;
  responseTimeBySource: Array<{ source: LogSource; avgTime: number; maxTime: number; count: number }>;
  eventDistribution: Array<{ type: EventType; count: number }>;
  totalLogs: number;
  criticalLogs: number;
  suspiciousIPs: string[];
}

export interface SavedFilter {
  id: string;
  name: string;
  filter: LogFilter;
  createdAt: Date;
  isDefault: boolean;
}
