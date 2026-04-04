export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
export type AlertSource = 'Auth' | 'API' | 'Firewall' | 'IDS' | 'Network' | 'System';
export type AttackType = 'SQL Injection' | 'XSS' | 'Brute Force' | 'DDoS' | 'Port Scan' | 'Malware' | 'Phishing' | 'Unauthorized Access';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: AlertSource;
  attackType: AttackType;
  timestamp: Date;
  status: AlertStatus;
  assignedTo?: string;
  affectedAsset: {
    type: 'IP' | 'User' | 'System';
    value: string;
    details?: {
      ip?: string;
      country?: string;
      region?: string;
      city?: string;
      userAgent?: string;
      sessionId?: string;
    };
  };
  riskScore: number;
  triggerReason: string;
  affectedSystems: string[];
  relatedLogs: string[];
  relatedAlerts: string[];
  tags: string[];
  notes: AlertNote[];
  aiSummary?: string;
  suggestedActions: AlertAction[];
  isAnomaly?: boolean;
  correlationId?: string;
}

export interface AlertNote {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  type: 'note' | 'action' | 'escalation';
}

export interface AlertAction {
  id: string;
  type: 'block_ip' | 'reset_password' | 'investigate_session' | 'escalate' | 'acknowledge' | 'resolve';
  title: string;
  description: string;
  automated: boolean;
  risk: 'low' | 'medium' | 'high';
}

export interface AlertFilter {
  search: string;
  severity: AlertSeverity[];
  status: AlertStatus[];
  source: AlertSource[];
  timeRange: '1h' | '6h' | '24h' | '7d' | 'custom';
  customStart?: Date;
  customEnd?: Date;
  assignedTo: string;
}

export interface AlertAnalytics {
  totalAlerts: number;
  criticalAlerts: number;
  openAlerts: number;
  resolvedAlerts: number;
  alertsOverTime: Array<{ time: string; total: number; critical: number }>;
  alertsBySeverity: Array<{ severity: AlertSeverity; count: number }>;
  alertsBySource: Array<{ source: AlertSource; count: number }>;
  topAttackTypes: Array<{ type: AttackType; count: number }>;
  averageResolutionTime: number;
  escalationRate: number;
}

export interface SavedAlertFilter {
  id: string;
  name: string;
  filter: AlertFilter;
  createdAt: Date;
  isDefault: boolean;
}
