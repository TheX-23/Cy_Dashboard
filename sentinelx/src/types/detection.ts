export type DetectionRuleType = 'threshold' | 'pattern' | 'behavior' | 'anomaly';
export type DetectionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DetectionStatus = 'ACTIVE' | 'INACTIVE' | 'TESTING';

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  type: DetectionRuleType;
  severity: DetectionSeverity;
  status: DetectionStatus;
  conditions: DetectionCondition[];
  actions: DetectionAction[];
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface DetectionCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  timeWindow?: number; // in seconds
  threshold?: number;
}

export interface DetectionAction {
  id: string;
  type: 'create_alert' | 'block_ip' | 'disable_user' | 'send_notification' | 'run_script';
  parameters: Record<string, any>;
  enabled: boolean;
}

export interface DetectionEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: DetectionSeverity;
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

export interface DetectionAnalytics {
  totalDetections: number;
  detectionsOverTime: Array<{ time: string; count: number; critical: number }>;
  topTriggeredRules: Array<{ ruleId: string; ruleName: string; count: number }>;
  detectionTypes: Array<{ type: DetectionRuleType; count: number }>;
  severityDistribution: Array<{ severity: DetectionSeverity; count: number }>;
  averageRiskScore: number;
  falsePositiveRate: number;
  detectionLatency: number; // in milliseconds
}

export interface ThreatIntelligence {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'malware';
  value: string;
  threatType: string;
  severity: DetectionSeverity;
  confidence: number;
  source: string;
  description: string;
  indicators: string[];
  firstSeen: Date;
  lastSeen: Date;
  tags: string[];
}

export interface DetectionFilter {
  search: string;
  type: DetectionRuleType[];
  severity: DetectionSeverity[];
  status: DetectionStatus[];
  enabled?: boolean;
  riskScoreRange: [number, number];
}
