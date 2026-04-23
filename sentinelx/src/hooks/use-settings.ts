"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SettingsState, 
  UserProfile, 
  SecuritySettings, 
  User, 
  Role, 
  APIKey, 
  Integration, 
  DataSource, 
  DetectionRule, 
  SOARSetting, 
  NotificationSettings, 
  ThreatIntelSetting, 
  AuditLog, 
  UserPreferences 
} from '@/types/settings';

// Mock data generators
function generateMockProfile(): UserProfile {
  return {
    id: 'user-1',
    email: 'admin@sentinelx.com',
    name: 'John Doe',
    role: 'Security Administrator',
    department: 'Security Operations',
    avatar: '/avatars/admin.jpg',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    mfaEnabled: true,
    active: true
  };
}

function generateMockSecuritySettings(): SecuritySettings {
  return {
    mfaEnabled: true,
    mfaMethods: ['sms', 'email', 'authenticator'],
    sessionTimeout: 480, // 8 hours
    maxConcurrentSessions: 3,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expirationDays: 90
    },
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    trustedDevices: [
      {
        id: 'device-1',
        name: 'Chrome on Windows',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        lastUsed: new Date(Date.now() - 30 * 60 * 1000),
        trusted: true
      }
    ]
  };
}

function generateMockUsers(): User[] {
  return [
    {
      id: 'user-1',
      email: 'admin@sentinelx.com',
      name: 'John Doe',
      role: 'Security Administrator',
      status: 'active',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      permissions: ['*'],
      mfaEnabled: true
    },
    {
      id: 'user-2',
      email: 'analyst@sentinelx.com',
      name: 'Jane Smith',
      role: 'Security Analyst',
      status: 'active',
      lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      permissions: ['read:alerts', 'read:incidents', 'write:incidents'],
      mfaEnabled: true
    },
    {
      id: 'user-3',
      email: 'operator@sentinelx.com',
      name: 'Bob Johnson',
      role: 'Security Operator',
      status: 'active',
      lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      permissions: ['read:alerts', 'read:incidents'],
      mfaEnabled: false
    }
  ];
}

function generateMockRoles(): Role[] {
  return [
    {
      id: 'role-1',
      name: 'Security Administrator',
      description: 'Full administrative access to all system features',
      permissions: ['*'],
      isSystem: false,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      userCount: 1
    },
    {
      id: 'role-2',
      name: 'Security Analyst',
      description: 'Access to analyze and respond to security incidents',
      permissions: ['read:alerts', 'read:incidents', 'write:incidents', 'read:detections', 'read:logs'],
      isSystem: false,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      userCount: 1
    },
    {
      id: 'role-3',
      name: 'Security Operator',
      description: 'Monitor security events and create basic incidents',
      permissions: ['read:alerts', 'read:incidents', 'write:incidents'],
      isSystem: false,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      userCount: 1
    },
    {
      id: 'role-4',
      name: 'Viewer',
      description: 'Read-only access to security dashboards and reports',
      permissions: ['read:alerts', 'read:incidents', 'read:detections', 'read:logs'],
      isSystem: false,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      userCount: 0
    }
  ];
}

function generateMockAPIKeys(): APIKey[] {
  return [
    {
      id: 'key-1',
      name: 'Production API Key',
      key: 'sk-prod-1234567890abcdef',
      permissions: ['*'],
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 30 * 60 * 1000),
      usageCount: 15420,
      rateLimit: 1000,
      createdBy: 'admin@sentinelx.com',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: 'key-2',
      name: 'SIEM Integration Key',
      key: 'sk-siem-0987654321fedcba',
      permissions: ['read:alerts', 'read:incidents', 'write:incidents'],
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      usageCount: 8765,
      rateLimit: 500,
      createdBy: 'admin@sentinelx.com',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: 'active'
    }
  ];
}

function generateMockIntegrations(): Integration[] {
  return [
    {
      id: 'int-1',
      name: 'Slack Integration',
      type: 'webhook',
      status: 'active',
      configuration: {
        webhook: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        channel: '#security-alerts',
        username: 'SentinelX Bot'
      },
      lastSync: new Date(Date.now() - 5 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      eventsCount: 1247
    },
    {
      id: 'int-2',
      name: 'SIEM Connector',
      type: 'siem',
      status: 'active',
      configuration: {
        endpoint: 'https://siem.company.com/api/events',
        apiKey: 'encrypted-key-12345',
        format: 'json'
      },
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      eventsCount: 5432
    }
  ];
}

function generateMockDataSources(): DataSource[] {
  return [
    {
      id: 'ds-1',
      name: 'Firewall Logs',
      type: 'syslog',
      endpoint: 'syslog://firewall.company.com:514',
      status: 'active',
      configuration: {
        format: 'RFC3164',
        port: 514,
        parser: 'palo-alto'
      },
      eventsPerHour: 1250,
      lastEvent: new Date(Date.now() - 5 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'ds-2',
      name: 'Windows Event Logs',
      type: 'wmi',
      endpoint: 'wmi://dc1.company.com',
      status: 'active',
      configuration: {
        path: 'Security',
        credentials: {
          username: 'svc-sentinelx',
          password: 'encrypted-password'
        }
      },
      eventsPerHour: 890,
      lastEvent: new Date(Date.now() - 2 * 60 * 1000),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    }
  ];
}

function generateMockDetectionRules(): DetectionRule[] {
  return [
    {
      id: 'rule-1',
      name: 'Brute Force Detection',
      type: 'threshold',
      enabled: true,
      threshold: {
        field: 'failed_logins',
        operator: 'greater_than',
        value: 5,
        timeWindow: 300
      },
      riskScoring: {
        enabled: true,
        weights: {
          failed_logins: 10,
          suspicious_ip: 15,
          unusual_time: 8
        },
        thresholds: {
          low: 20,
          medium: 50,
          high: 75,
          critical: 90
        }
      },
      lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
      triggerCount: 42
    },
    {
      id: 'rule-2',
      name: 'SQL Injection Detection',
      type: 'pattern',
      enabled: true,
      threshold: {
        field: 'request_parameters',
        operator: 'contains',
        value: 1,
        timeWindow: 0
      },
      riskScoring: {
        enabled: true,
        weights: {
          sql_pattern: 25,
          suspicious_endpoint: 15
        },
        thresholds: {
          low: 30,
          medium: 60,
          high: 80,
          critical: 95
        }
      },
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      triggerCount: 8
    }
  ];
}

function generateMockSOARSettings(): SOARSetting[] {
  return [
    {
      id: 'soar-1',
      workflowId: 'brute-force-workflow',
      autoTrigger: true,
      requireApproval: false,
      approvalUsers: ['admin@sentinelx.com'],
      timeout: 300000,
      retryAttempts: 3
    },
    {
      id: 'soar-2',
      workflowId: 'malware-workflow',
      autoTrigger: true,
      requireApproval: true,
      approvalUsers: ['admin@sentinelx.com', 'security@company.com'],
      timeout: 600000,
      retryAttempts: 1
    }
  ];
}

function generateMockNotificationSettings(): NotificationSettings {
  return {
    email: {
      enabled: true,
      recipients: ['security@company.com', 'admin@company.com'],
      severity: ['high', 'critical'],
      templates: {
        alert: 'Security Alert: {{alertType}} - {{description}}',
        incident: 'New Incident: {{title}} - {{severity}}'
      }
    },
    slack: {
      enabled: true,
      webhook: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      channel: '#security-alerts',
      severity: ['medium', 'high', 'critical']
    },
    sms: {
      enabled: false,
      recipients: ['+1234567890'],
      severity: ['critical']
    },
    push: {
      enabled: true,
      endpoints: ['https://api.company.com/push'],
      severity: ['high', 'critical']
    }
  };
}

function generateMockThreatIntelSettings(): ThreatIntelSetting {
  return {
    geoTracking: {
      enabled: true,
      blockCountries: ['CN', 'RU', 'KP'],
      riskLevels: {
        'US': 10,
        'CA': 10,
        'GB': 15,
        'DE': 15,
        'FR': 15,
        'CN': 80,
        'RU': 90,
        'KP': 95,
        'UNKNOWN': 50
      }
    },
    externalFeeds: [
      {
        id: 'feed-1',
        name: 'VirusTotal',
        type: 'reputation',
        url: 'https://www.virustotal.com/vtapi/v2/',
        apiKey: 'encrypted-api-key',
        enabled: true,
        lastUpdate: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 'feed-2',
        name: 'PhishTank',
        type: 'phishing',
        url: 'https://www.phishtank.com/api/',
        enabled: true,
        lastUpdate: new Date(Date.now() - 60 * 60 * 1000)
      }
    ],
    autoBlock: {
      enabled: true,
      threshold: 85,
      duration: 3600
    }
  };
}

function generateMockAuditLogs(): AuditLog[] {
  const logs: AuditLog[] = [];
  const actions = ['login', 'logout', 'create_user', 'delete_user', 'update_settings', 'execute_workflow', 'view_sensitive_data'];
  const resources = ['user_management', 'settings', 'workflows', 'api_keys', 'security_policy'];
  const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
  
  for (let i = 0; i < 100; i++) {
    logs.push({
      id: `audit-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      userId: `user-${Math.floor(Math.random() * 3) + 1}`,
      action: actions[Math.floor(Math.random() * actions.length)],
      resource: resources[Math.floor(Math.random() * resources.length)],
      details: {
        ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        changedFields: ['password', 'mfa_settings']
      },
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      result: Math.random() > 0.1 ? 'success' : Math.random() > 0.5 ? 'failure' : 'error',
      severity: severities[Math.floor(Math.random() * severities.length)]
    });
  }
  
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function generateMockPreferences(): UserPreferences {
  return {
    theme: 'dark',
    language: 'en-US',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '24h',
    notifications: {
      desktop: true,
      sound: true,
      email: true
    },
    dashboard: {
      defaultTab: 'dashboard',
      refreshInterval: 30,
      compactMode: false
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium'
    }
  };
}

export function useSettings() {
  const [state, setState] = useState<SettingsState>({
    profile: null,
    security: generateMockSecuritySettings(),
    users: generateMockUsers(),
    roles: generateMockRoles(),
    apiKeys: generateMockAPIKeys(),
    integrations: generateMockIntegrations(),
    dataSources: generateMockDataSources(),
    detectionRules: generateMockDetectionRules(),
    soarSettings: generateMockSOARSettings(),
    notifications: generateMockNotificationSettings(),
    threatIntel: generateMockThreatIntelSettings(),
    auditLogs: generateMockAuditLogs(),
    preferences: generateMockPreferences(),
    isLoading: false,
    error: null
  });

  // Load initial data
  useEffect(() => {
    setState(prev => ({
      ...prev,
      profile: generateMockProfile(),
      isLoading: true
    }));

    // Simulate API call
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isLoading: false
      }));
    }, 1000);
  }, []);

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    setState(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, ...profile } : null
    }));
  }, []);

  const updateSecurity = useCallback((security: Partial<SecuritySettings>) => {
    setState(prev => ({
      ...prev,
      security: { ...prev.security, ...security }
    }));
  }, []);

  const updateUsers = useCallback((users: User[]) => {
    setState(prev => ({
      ...prev,
      users
    }));
  }, []);

  const updateRoles = useCallback((roles: Role[]) => {
    setState(prev => ({
      ...prev,
      roles
    }));
  }, []);

  const createAPIKey = useCallback((keyData: Omit<APIKey, 'id' | 'createdAt' | 'usageCount' | 'status'>) => {
    const newKey: APIKey = {
      ...keyData,
      id: `key-${Date.now()}`,
      createdAt: new Date(),
      usageCount: 0,
      status: 'active'
    };
    
    setState(prev => ({
      ...prev,
      apiKeys: [...prev.apiKeys, newKey]
    }));
    
    return newKey;
  }, []);

  const revokeAPIKey = useCallback((keyId: string) => {
    setState(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.map(key => 
        key.id === keyId 
          ? { ...key, status: 'revoked' as const }
          : key
      )
    }));
  }, []);

  const updateNotifications = useCallback((notifications: Partial<NotificationSettings>) => {
    setState(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...notifications }
    }));
  }, []);

  const updatePreferences = useCallback((preferences: Partial<UserPreferences>) => {
    setState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences }
    }));
  }, []);

  const exportAuditLogs = useCallback((format: 'csv' | 'json') => {
    // Mock export functionality
    const data = format === 'csv' 
      ? convertToCSV(state.auditLogs)
      : JSON.stringify(state.auditLogs, null, 2);
    
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state.auditLogs]);

  const saveSettings = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to save settings' 
      }));
    }
  }, []);

  const filteredAuditLogs = useMemo(() => {
    return state.auditLogs.slice(0, 50); // Show last 50 logs
  }, [state.auditLogs]);

  return {
    ...state,
    updateProfile,
    updateSecurity,
    updateUsers,
    updateRoles,
    createAPIKey,
    revokeAPIKey,
    updateNotifications,
    updatePreferences,
    exportAuditLogs,
    saveSettings,
    filteredAuditLogs
  };
}

function convertToCSV(logs: AuditLog[]): string {
  const headers = ['Timestamp', 'User', 'Action', 'Resource', 'IP Address', 'Result', 'Severity'];
  const rows = logs.map(log => [
    log.timestamp.toISOString(),
    log.userId,
    log.action,
    log.resource,
    log.ipAddress,
    log.result,
    log.severity
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
