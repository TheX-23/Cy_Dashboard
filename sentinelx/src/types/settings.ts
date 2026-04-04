export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  lastLogin: Date;
  createdAt: Date;
  mfaEnabled: boolean;
  active: boolean;
}

export interface SecuritySettings {
  mfaEnabled: boolean;
  mfaMethods: ('sms' | 'email' | 'authenticator')[];
  sessionTimeout: number;
  maxConcurrentSessions: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expirationDays: number;
  };
  ipWhitelist: string[];
  trustedDevices: Array<{
    id: string;
    name: string;
    userAgent: string;
    lastUsed: Date;
    trusted: boolean;
  }>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  permissions: string[];
  mfaEnabled: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  userCount: number;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  rateLimit: number;
  createdBy: string;
  createdAt: Date;
  status: 'active' | 'expired' | 'revoked';
}

export interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'database' | 'siem';
  status: 'active' | 'inactive' | 'error';
  configuration: Record<string, any>;
  lastSync?: Date;
  createdAt: Date;
  eventsCount: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'syslog' | 'api' | 'file' | 'database' | 'wmi';
  endpoint: string;
  status: 'active' | 'inactive' | 'error';
  configuration: {
    format?: string;
    port?: number;
    path?: string;
    credentials?: Record<string, string>;
    parser?: string;
  };
  eventsPerHour: number;
  lastEvent?: Date;
  createdAt: Date;
}

export interface DetectionRule {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  threshold: {
    field: string;
    operator: string;
    value: number;
    timeWindow: number;
  };
  riskScoring: {
    enabled: boolean;
    weights: Record<string, number>;
    thresholds: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
  lastTriggered?: Date;
  triggerCount: number;
}

export interface SOARSetting {
  id: string;
  workflowId: string;
  autoTrigger: boolean;
  requireApproval: boolean;
  approvalUsers: string[];
  timeout: number;
  retryAttempts: number;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    recipients: string[];
    severity: ('low' | 'medium' | 'high' | 'critical')[];
    templates: Record<string, string>;
  };
  slack: {
    enabled: boolean;
    webhook: string;
    channel: string;
    severity: ('low' | 'medium' | 'high' | 'critical')[];
  };
  sms: {
    enabled: boolean;
    recipients: string[];
    severity: ('low' | 'medium' | 'high' | 'critical')[];
  };
  push: {
    enabled: boolean;
    endpoints: string[];
    severity: ('low' | 'medium' | 'high' | 'critical')[];
  };
}

export interface ThreatIntelSetting {
  geoTracking: {
    enabled: boolean;
    blockCountries: string[];
    riskLevels: Record<string, number>;
  };
  externalFeeds: Array<{
    id: string;
    name: string;
    type: 'malware' | 'phishing' | 'c2' | 'reputation';
    url: string;
    apiKey?: string;
    enabled: boolean;
    lastUpdate?: Date;
  }>;
  autoBlock: {
    enabled: boolean;
    threshold: number;
    duration: number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    desktop: boolean;
    sound: boolean;
    email: boolean;
  };
  dashboard: {
    defaultTab: string;
    refreshInterval: number;
    compactMode: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

export interface SettingsState {
  profile: UserProfile | null;
  security: SecuritySettings;
  users: User[];
  roles: Role[];
  apiKeys: APIKey[];
  integrations: Integration[];
  dataSources: DataSource[];
  detectionRules: DetectionRule[];
  soarSettings: SOARSetting[];
  notifications: NotificationSettings;
  threatIntel: ThreatIntelSetting;
  auditLogs: AuditLog[];
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}
