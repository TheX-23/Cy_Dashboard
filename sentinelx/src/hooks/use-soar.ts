"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SOARWorkflow, WorkflowExecution, SOARDashboard, WorkflowTrigger, WorkflowStatus, WorkflowTemplate } from '@/types/soar';

// Predefined workflow templates
const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'brute-force-template',
    name: 'Brute Force Response',
    description: 'Automated response to brute force login attacks',
    trigger: 'brute_force',
    category: 'Authentication Security',
    isRecommended: true,
    template: {
      steps: [
        {
          id: 'step-1',
          name: 'Identify Source IP',
          description: 'Extract and validate the source IP address',
          actions: [
            {
              id: 'action-1',
              type: 'identify_ip',
              name: 'Identify Source IP',
              description: 'Extract IP from threat data',
              parameters: { field: 'sourceIp' },
              enabled: true,
              order: 1,
              requiresApproval: false
            }
          ],
          order: 1,
          isParallel: false
        },
        {
          id: 'step-2',
          name: 'Check IP Reputation',
          description: 'Query threat intelligence databases',
          actions: [
            {
              id: 'action-2',
              type: 'check_reputation',
              name: 'IP Reputation Check',
              description: 'Check against threat feeds',
              parameters: { databases: ['virustotal', 'abuseipdb', 'shodan'] },
              enabled: true,
              order: 1,
              requiresApproval: false,
              timeout: 30000
            }
          ],
          order: 2,
          isParallel: false
        },
        {
          id: 'step-3',
          name: 'Response Actions',
          description: 'Execute blocking and notification actions',
          actions: [
            {
              id: 'action-3',
              type: 'block_ip',
              name: 'Block IP Address',
              description: 'Block malicious IP at firewall',
              parameters: { duration: 3600, permanent: false },
              enabled: true,
              order: 1,
              requiresApproval: true
            },
            {
              id: 'action-4',
              type: 'lock_account',
              name: 'Lock User Account',
              description: 'Lock compromised user account',
              parameters: { lockDuration: 1800 },
              enabled: true,
              order: 2,
              requiresApproval: false
            },
            {
              id: 'action-5',
              type: 'create_alert',
              name: 'Create Security Alert',
              description: 'Generate high-priority alert',
              parameters: { severity: 'HIGH', priority: 1 },
              enabled: true,
              order: 3,
              requiresApproval: false
            },
            {
              id: 'action-6',
              type: 'create_incident',
              name: 'Create Security Incident',
              description: 'Create incident for investigation',
              parameters: { severity: 'HIGH', category: 'brute_force' },
              enabled: true,
              order: 4,
              requiresApproval: false
            },
            {
              id: 'action-7',
              type: 'notify_admin',
              name: 'Notify Security Team',
              description: 'Send notification to security team',
              parameters: { channels: ['email', 'slack'], urgency: 'high' },
              enabled: true,
              order: 5,
              requiresApproval: false
            }
          ],
          order: 3,
          isParallel: true
        }
      ],
      configuration: {
        autoTrigger: true,
        requireApproval: false,
        timeout: 300000,
        retryAttempts: 3,
        notificationChannels: ['email', 'slack']
      }
    }
  },
  {
    id: 'suspicious-login-template',
    name: 'Suspicious Login Response',
    description: 'Handle logins from unusual locations or devices',
    trigger: 'suspicious_login',
    category: 'Authentication Security',
    isRecommended: true,
    template: {
      steps: [
        {
          id: 'step-1',
          name: 'Geolocation Analysis',
          description: 'Compare login location with known patterns',
          actions: [
            {
              id: 'action-1',
              type: 'compare_geolocation',
              name: 'Compare Geolocation',
              description: 'Check against user location history',
              parameters: { timeWindow: 86400, maxDistance: 1000 },
              enabled: true,
              order: 1,
              requiresApproval: false
            }
          ],
          order: 1,
          isParallel: false
        },
        {
          id: 'step-2',
          name: 'Anomaly Detection',
          description: 'Flag suspicious login patterns',
          actions: [
            {
              id: 'action-2',
              type: 'flag_anomaly',
              name: 'Flag Login Anomaly',
              description: 'Mark as suspicious behavior',
              parameters: { riskLevel: 'medium', reason: 'unusual_location' },
              enabled: true,
              order: 1,
              requiresApproval: false
            }
          ],
          order: 2,
          isParallel: false
        },
        {
          id: 'step-3',
          name: 'User Verification',
          description: 'Request additional authentication',
          actions: [
            {
              id: 'action-3',
              type: 'send_mfa_request',
              name: 'Send MFA Request',
              description: 'Require multi-factor authentication',
              parameters: { methods: ['sms', 'email'], timeout: 600 },
              enabled: true,
              order: 1,
              requiresApproval: false
            },
            {
              id: 'action-4',
              type: 'notify_user',
              name: 'Notify User',
              description: 'Alert user about suspicious activity',
              parameters: { channels: ['email', 'push'], template: 'suspicious_login' },
              enabled: true,
              order: 2,
              requiresApproval: false
            },
            {
              id: 'action-5',
              type: 'create_alert',
              name: 'Create Alert',
              description: 'Generate security alert',
              parameters: { severity: 'MEDIUM', autoResolve: false },
              enabled: true,
              order: 3,
              requiresApproval: false
            }
          ],
          order: 3,
          isParallel: true
        }
      ],
      configuration: {
        autoTrigger: true,
        requireApproval: false,
        timeout: 180000,
        retryAttempts: 2,
        notificationChannels: ['email']
      }
    }
  },
  {
    id: 'sql-injection-template',
    name: 'SQL Injection Response',
    description: 'Detect and respond to SQL injection attempts',
    trigger: 'sql_injection',
    category: 'Application Security',
    isRecommended: true,
    template: {
      steps: [
        {
          id: 'step-1',
          name: 'Immediate Response',
          description: 'Block malicious requests immediately',
          actions: [
            {
              id: 'action-1',
              type: 'block_request',
              name: 'Block Malicious Request',
              description: 'Block the SQL injection attempt',
              parameters: { blockDuration: 3600, reason: 'sql_injection' },
              enabled: true,
              order: 1,
              requiresApproval: false
            },
            {
              id: 'action-2',
              type: 'log_payload',
              name: 'Log Request Payload',
              description: 'Store malicious payload for analysis',
              parameters: { encrypt: true, retention: 2592000 },
              enabled: true,
              order: 2,
              requiresApproval: false
            }
          ],
          order: 1,
          isParallel: true
        },
        {
          id: 'step-2',
          name: 'Risk Assessment',
          description: 'Increase threat risk scores',
          actions: [
            {
              id: 'action-3',
              type: 'increase_risk_score',
              name: 'Increase Risk Score',
              description: 'Update IP and user risk scores',
              parameters: { ipIncrease: 50, userIncrease: 30 },
              enabled: true,
              order: 1,
              requiresApproval: false
            }
          ],
          order: 2,
          isParallel: false
        },
        {
          id: 'step-3',
          name: 'Alerting',
          description: 'Generate security alerts and notifications',
          actions: [
            {
              id: 'action-4',
              type: 'create_alert',
              name: 'Create Critical Alert',
              description: 'Generate high-priority alert',
              parameters: { severity: 'CRITICAL', category: 'sql_injection' },
              enabled: true,
              order: 1,
              requiresApproval: false
            },
            {
              id: 'action-5',
              type: 'track_ip_activity',
              name: 'Track IP Activity',
              description: 'Monitor IP for additional attacks',
              parameters: { duration: 86400, alertThreshold: 3 },
              enabled: true,
              order: 2,
              requiresApproval: false
            }
          ],
          order: 3,
          isParallel: true
        }
      ],
      configuration: {
        autoTrigger: true,
        requireApproval: false,
        timeout: 60000,
        retryAttempts: 1,
        notificationChannels: ['email', 'slack']
      }
    }
  },
  {
    id: 'data-exfiltration-template',
    name: 'Data Exfiltration Response',
    description: 'Detect and respond to unauthorized data transfers',
    trigger: 'data_exfiltration',
    category: 'Data Protection',
    isRecommended: true,
    template: {
      steps: [
        {
          id: 'step-1',
          name: 'Traffic Analysis',
          description: 'Monitor and analyze data transfer patterns',
          actions: [
            {
              id: 'action-1',
              type: 'monitor_data_volume',
              name: 'Monitor Data Volume',
              description: 'Track unusual data transfer volumes',
              parameters: { threshold: 1073741824, timeWindow: 3600 }, // 1GB
              enabled: true,
              order: 1,
              requiresApproval: false
            },
            {
              id: 'action-2',
              type: 'flag_behavior',
              name: 'Flag Abnormal Behavior',
              description: 'Mark suspicious data access patterns',
              parameters: { anomalyThreshold: 0.8, behaviorTypes: ['bulk_download', 'unusual_hours'] },
              enabled: true,
              order: 2,
              requiresApproval: false
            }
          ],
          order: 1,
          isParallel: true
        },
        {
          id: 'step-2',
          name: 'Immediate Containment',
          description: 'Restrict access to prevent data loss',
          actions: [
            {
              id: 'action-3',
              type: 'restrict_access',
              name: 'Restrict Access',
              description: 'Temporarily limit user/system access',
              parameters: { restrictionLevel: 'partial', duration: 1800 },
              enabled: true,
              order: 1,
              requiresApproval: true
            }
          ],
          order: 2,
          isParallel: false
        },
        {
          id: 'step-3',
          name: 'Notification & Escalation',
          description: 'Alert security team and stakeholders',
          actions: [
            {
              id: 'action-4',
              type: 'notify_security_team',
              name: 'Notify Security Team',
              description: 'Immediate notification to security team',
              parameters: { urgency: 'critical', channels: ['email', 'slack', 'sms'] },
              enabled: true,
              order: 1,
              requiresApproval: false
            },
            {
              id: 'action-5',
              type: 'create_incident',
              name: 'Create Data Breach Incident',
              description: 'Create incident for investigation',
              parameters: { severity: 'CRITICAL', category: 'data_exfiltration' },
              enabled: true,
              order: 2,
              requiresApproval: false
            }
          ],
          order: 3,
          isParallel: true
        }
      ],
      configuration: {
        autoTrigger: true,
        requireApproval: true,
        timeout: 120000,
        retryAttempts: 2,
        notificationChannels: ['email', 'slack', 'sms']
      }
    }
  },
  {
    id: 'malware-detection-template',
    name: 'Malware Detection Response',
    description: 'Respond to malware and suspicious file activity',
    trigger: 'malware_detection',
    category: 'Endpoint Security',
    isRecommended: true,
    template: {
      steps: [
        {
          id: 'step-1',
          name: 'Immediate Containment',
          description: 'Isolate and block malicious activity',
          actions: [
            {
              id: 'action-1',
              type: 'isolate_system',
              name: 'Isolate System',
              description: 'Network isolation of affected system',
              parameters: { isolationLevel: 'full', preserveEvidence: true },
              enabled: true,
              order: 1,
              requiresApproval: true
            },
            {
              id: 'action-2',
              type: 'scan_file',
              name: 'Scan Suspicious File',
              description: 'Deep scan of malicious file/process',
              parameters: { engines: ['virustotal', 'yara', 'sophos'], deepScan: true },
              enabled: true,
              order: 2,
              requiresApproval: false
            },
            {
              id: 'action-3',
              type: 'block_execution',
              name: 'Block Execution',
              description: 'Prevent further execution of malicious code',
              parameters: { blockType: 'process', quarantine: true },
              enabled: true,
              order: 3,
              requiresApproval: false
            }
          ],
          order: 1,
          isParallel: true
        },
        {
          id: 'step-2',
          name: 'Alerting & Documentation',
          description: 'Generate alerts and create incident',
          actions: [
            {
              id: 'action-4',
              type: 'create_alert',
              name: 'Create Critical Alert',
              description: 'Generate malware detection alert',
              parameters: { severity: 'CRITICAL', category: 'malware' },
              enabled: true,
              order: 1,
              requiresApproval: false
            },
            {
              id: 'action-5',
              type: 'create_incident',
              name: 'Create Malware Incident',
              description: 'Create incident for malware response',
              parameters: { severity: 'HIGH', category: 'malware' },
              enabled: true,
              order: 2,
              requiresApproval: false
            }
          ],
          order: 2,
          isParallel: true
        }
      ],
      configuration: {
        autoTrigger: true,
        requireApproval: true,
        timeout: 300000,
        retryAttempts: 1,
        notificationChannels: ['email', 'slack']
      }
    }
  }
];

// Mock workflows data
const mockWorkflows: SOARWorkflow[] = workflowTemplates.map((template, index) => ({
  id: `workflow-${index + 1}`,
  name: template.name,
  description: template.description,
  trigger: template.trigger,
  status: index < 3 ? 'active' : 'inactive',
  enabled: index < 3,
  steps: template.template.steps || [],
  conditions: template.template.conditions || [],
  metadata: {
    createdBy: 'security@sentinelx.com',
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    lastExecuted: index < 2 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : undefined,
    executionCount: Math.floor(Math.random() * 50) + 5,
    successCount: Math.floor(Math.random() * 45) + 5,
    failureCount: Math.floor(Math.random() * 5),
    averageExecutionTime: Math.floor(Math.random() * 120) + 30
  },
  configuration: template.template.configuration || {
    autoTrigger: true,
    requireApproval: false,
    timeout: 300000,
    retryAttempts: 3,
    notificationChannels: ['email']
  }
}));

// Generate mock executions
function generateMockExecutions(count: number = 20): WorkflowExecution[] {
  const executions: WorkflowExecution[] = [];
  
  for (let i = 0; i < count; i++) {
    const workflow = mockWorkflows[Math.floor(Math.random() * (mockWorkflows?.length || 0))];
    const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const duration = Math.random() * 300000; // 0-5 minutes
    const endTime = new Date(startTime.getTime() + duration);
    
    executions.push({
      id: `execution-${Date.now()}-${i}`,
      workflowId: workflow.id,
      status: Math.random() > 0.2 ? 'completed' : Math.random() > 0.5 ? 'failed' : 'executing',
      startTime,
      endTime: Math.random() > 0.3 ? endTime : undefined,
      triggeredBy: Math.random() > 0.7 ? 'automatic' : 'manual',
      triggerData: {
        sourceIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        threatType: workflow.trigger,
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)]
      },
      currentStep: Math.random() > 0.7 ? `step-${Math.floor(Math.random() * 3) + 1}` : undefined,
      executedSteps: workflow.steps.map((step, index) => ({
        stepId: step.id,
        status: Math.random() > 0.8 ? 'failed' : Math.random() > 0.3 ? 'completed' : 'running',
        startTime: new Date(startTime.getTime() + index * 10000),
        endTime: Math.random() > 0.5 ? new Date(startTime.getTime() + index * 10000 + 5000) : undefined,
        result: Math.random() > 0.5 ? { success: true, message: 'Action completed successfully' } : undefined,
        error: Math.random() > 0.9 ? 'Timeout error' : undefined
      })),
      logs: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
        timestamp: new Date(startTime.getTime() + j * 30000),
        level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)] as 'info' | 'warning' | 'error',
        message: [
          'Workflow started',
          'Executing step: ' + workflow.steps[Math.floor(Math.random() * (workflow.steps?.length || 0))]?.name,
          'Action completed successfully',
          'Warning: Action requires approval',
          'Error: Connection timeout'
        ][Math.floor(Math.random() * 5)],
        stepId: Math.random() > 0.3 ? workflow.steps[Math.floor(Math.random() * (workflow.steps?.length || 0))]?.id : undefined
      }))
    });
  }
  
  return executions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}

export function useSOAR() {
  const [workflows, setWorkflows] = useState<SOARWorkflow[]>(mockWorkflows);
  const [executions, setExecutions] = useState<WorkflowExecution[]>(() => generateMockExecutions());
  const [selectedWorkflow, setSelectedWorkflow] = useState<SOARWorkflow | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [filter, setFilter] = useState({
    status: [] as WorkflowStatus[],
    trigger: [] as WorkflowTrigger[],
    enabled: undefined as boolean | undefined
  });

  // Calculate dashboard metrics
  const dashboard = useMemo((): SOARDashboard => {
    const activeWorkflows = workflows.filter(w => w.enabled)?.length || 0;
    const totalExecutions = executions?.length || 0;
    const successfulExecutions = executions.filter(e => e.status === 'completed')?.length || 0;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    
    const executionTimes = executions
      .filter(e => e.endTime)
      .map(e => e.endTime!.getTime() - e.startTime.getTime());
    const averageExecutionTime = executionTimes?.length > 0 
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length 
      : 0;

    const workflowStats = workflows.map(workflow => {
      const workflowExecutions = executions.filter(e => e.workflowId === workflow.id);
      const workflowSuccesses = workflowExecutions.filter(e => e.status === 'completed')?.length || 0;
      const lastExecution = workflowExecutions?.length > 0 
        ? new Date(Math.max(...workflowExecutions.map(e => e.startTime.getTime())))
        : workflow.metadata.lastExecuted;

      return {
        workflowId: workflow.id,
        workflowName: workflow.name,
        executions: (workflowExecutions?.length || 0),
        successRate: (workflowExecutions?.length || 0) > 0 ? (workflowSuccesses / (workflowExecutions?.length || 0)) * 100 : 0,
        lastExecution: lastExecution || new Date(0)
      };
    });

    return {
      activeWorkflows,
      totalExecutions,
      successRate,
      averageExecutionTime,
      recentExecutions: executions?.slice(0, 10),
      workflowStats
    };
  }, [workflows, executions]);

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      if (filter.status?.length > 0 && !filter.status.includes(workflow.status)) {
        return false;
      }
      if (filter.trigger?.length > 0 && !filter.trigger.includes(workflow.trigger)) {
        return false;
      }
      if (filter.enabled !== undefined && workflow.enabled !== filter.enabled) {
        return false;
      }
      return true;
    });
  }, [workflows, filter]);

  const executeWorkflow = useCallback(async (workflowId: string, triggerData?: Record<string, any>) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    setIsExecuting(true);
    
    const execution: WorkflowExecution = {
      id: `execution-${Date.now()}`,
      workflowId,
      status: 'executing',
      startTime: new Date(),
      triggeredBy: 'manual',
      triggerData,
      currentStep: workflow.steps[0]?.id,
      executedSteps: workflow.steps.map(step => ({
        stepId: step.id,
        status: 'pending'
      })),
      logs: [{
        timestamp: new Date(),
        level: 'info',
        message: `Workflow "${workflow.name}" started manually`
      }]
    };

    setExecutions(prev => [execution, ...prev]);

    // Simulate workflow execution
    setTimeout(() => {
      setExecutions(prev => prev.map(e => 
        e.id === execution.id 
          ? { ...e, status: 'completed', endTime: new Date() }
          : e
      ));
      setIsExecuting(false);
    }, 3000);
  }, [workflows]);

  const createWorkflowFromTemplate = useCallback((template: WorkflowTemplate, customizations?: Partial<SOARWorkflow>) => {
    const newWorkflow: SOARWorkflow = {
      id: `workflow-${Date.now()}`,
      name: template.name,
      description: template.description,
      trigger: template.trigger,
      status: 'inactive',
      enabled: false,
      steps: template.template.steps || [],
      conditions: template.template.conditions || [],
      metadata: {
        createdBy: 'admin@sentinelx.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageExecutionTime: 0
      },
      configuration: template.template.configuration || {
        autoTrigger: true,
        requireApproval: false,
        timeout: 300000,
        retryAttempts: 3,
        notificationChannels: ['email']
      },
      ...customizations
    };

    setWorkflows(prev => [...prev, newWorkflow]);
    return newWorkflow;
  }, []);

  const updateWorkflow = useCallback((workflowId: string, updates: Partial<SOARWorkflow>) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, ...updates, metadata: { ...w.metadata, updatedAt: new Date() } }
        : w
    ));
  }, []);

  const deleteWorkflow = useCallback((workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
  }, []);

  const toggleWorkflow = useCallback((workflowId: string, enabled: boolean) => {
    updateWorkflow(workflowId, { enabled, status: enabled ? 'active' : 'inactive' });
  }, [updateWorkflow]);

  const updateFilter = useCallback((newFilter: Partial<typeof filter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilter({
      status: [],
      trigger: [],
      enabled: undefined
    });
  }, []);

  return {
    workflows: filteredWorkflows,
    executions,
    dashboard,
    selectedWorkflow,
    setSelectedWorkflow,
    isExecuting,
    filter,
    updateFilter,
    clearFilter,
    executeWorkflow,
    createWorkflowFromTemplate,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
    workflowTemplates
  };
}
