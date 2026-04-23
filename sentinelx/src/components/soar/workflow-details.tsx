"use client";

import { useState, useMemo } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { 
  Play, 
  Pause, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Settings, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  Globe,
  Database,
  Lock,
  Mail,
  Bell,
  Activity
} from 'lucide-react';
import { SOARWorkflow, WorkflowStep, WorkflowAction, ActionType } from '@/types/soar';
import { cn } from '@/lib/utils/cn';

interface WorkflowDetailsProps {
  workflow: SOARWorkflow | null;
  onClose: () => void;
  onSave: (workflow: SOARWorkflow) => void;
  onExecute: (workflowId: string) => void;
  isExecuting?: boolean;
}

export function WorkflowDetails({ workflow, onClose, onSave, onExecute, isExecuting }: WorkflowDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedWorkflow, setEditedWorkflow] = useState<SOARWorkflow | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const getActionIcon = (type: ActionType) => {
    switch (type) {
      case 'identify_ip': return <Globe className="h-4 w-4" />;
      case 'check_reputation': return <Shield className="h-4 w-4" />;
      case 'block_ip': return <Lock className="h-4 w-4" />;
      case 'lock_account': return <Lock className="h-4 w-4" />;
      case 'create_alert': return <AlertTriangle className="h-4 w-4" />;
      case 'create_incident': return <Activity className="h-4 w-4" />;
      case 'notify_admin': return <Mail className="h-4 w-4" />;
      case 'compare_geolocation': return <Globe className="h-4 w-4" />;
      case 'flag_anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'send_mfa_request': return <Shield className="h-4 w-4" />;
      case 'notify_user': return <Mail className="h-4 w-4" />;
      case 'block_request': return <Lock className="h-4 w-4" />;
      case 'log_payload': return <Database className="h-4 w-4" />;
      case 'increase_risk_score': return <AlertTriangle className="h-4 w-4" />;
      case 'monitor_data_volume': return <Activity className="h-4 w-4" />;
      case 'flag_behavior': return <AlertTriangle className="h-4 w-4" />;
      case 'restrict_access': return <Lock className="h-4 w-4" />;
      case 'notify_security_team': return <Bell className="h-4 w-4" />;
      case 'isolate_system': return <Shield className="h-4 w-4" />;
      case 'scan_file': return <Activity className="h-4 w-4" />;
      case 'block_execution': return <Lock className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getActionColor = (type: ActionType) => {
    switch (type) {
      case 'identify_ip': return 'text-blue-400';
      case 'check_reputation': return 'text-purple-400';
      case 'block_ip': return 'text-red-400';
      case 'lock_account': return 'text-orange-400';
      case 'create_alert': return 'text-yellow-400';
      case 'create_incident': return 'text-red-400';
      case 'notify_admin': return 'text-green-400';
      case 'compare_geolocation': return 'text-cyan-400';
      case 'flag_anomaly': return 'text-pink-400';
      case 'send_mfa_request': return 'text-blue-400';
      case 'notify_user': return 'text-green-400';
      case 'block_request': return 'text-red-400';
      case 'log_payload': return 'text-muted-foreground';
      case 'increase_risk_score': return 'text-orange-400';
      case 'monitor_data_volume': return 'text-purple-400';
      case 'flag_behavior': return 'text-pink-400';
      case 'restrict_access': return 'text-orange-400';
      case 'notify_security_team': return 'text-red-400';
      case 'isolate_system': return 'text-red-400';
      case 'scan_file': return 'text-blue-400';
      case 'block_execution': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const toggleStepExpanded = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const handleSave = () => {
    if (editedWorkflow) {
      onSave(editedWorkflow);
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setEditedWorkflow(workflow);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedWorkflow(null);
    setIsEditing(false);
  };

  if (!workflow) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background text-foreground border border-border rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-green-400">Workflow Details</h2>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              workflow.enabled ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-muted-foreground"
            )}>
              {workflow.enabled ? 'ACTIVE' : 'INACTIVE'}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 text-green-400 hover:text-green-300 transition-colors"
                  title="Save changes"
                >
                  <Save className="h-5 w-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                  title="Cancel editing"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="p-2 text-muted-foreground hover:text-green-400 transition-colors"
                  title="Edit workflow"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onExecute(workflow.id)}
                  disabled={!workflow.enabled || isExecuting}
                  className={cn(
                    "p-2 transition-colors",
                    workflow.enabled && !isExecuting
                      ? "text-blue-400 hover:text-blue-300" 
                      : "text-muted-foreground cursor-not-allowed"
                  )}
                  title="Execute workflow"
                >
                  <Play className="h-5 w-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Overview</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-green-400">Workflow Name</label>
                    <input
                      type="text"
                      value={editedWorkflow?.name || ''}
                      onChange={(e) => setEditedWorkflow(prev => prev ? { ...prev, name: e?.target?.value || '' } : null)}
                      className="w-full px-3 py-2 bg-card border border-green-500/30 rounded-lg text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-green-400">Description</label>
                    <textarea
                      value={editedWorkflow?.description || ''}
                      onChange={(e) => setEditedWorkflow(prev => prev ? { ...prev, description: e?.target?.value || '' } : null)}
                      rows={3}
                      className="w-full px-3 py-2 bg-card border border-green-500/30 rounded-lg text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <p className="text-foreground font-medium">{workflow.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Description:</span>
                    <p className="text-foreground">{workflow.description}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Trigger:</span>
                    <p className="text-foreground font-medium">{workflow.trigger.replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Executions:</span>
                  <span className="text-foreground font-medium">{workflow.metadata.executionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate:</span>
                  <span className="text-green-400 font-medium">
                    {workflow.metadata.executionCount > 0 
                      ? Math.round((workflow.metadata.successCount / workflow.metadata.executionCount) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Execution Time:</span>
                  <span className="text-foreground font-medium">
                    {Math.round(workflow.metadata.averageExecutionTime / 1000)}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Executed:</span>
                  <span className="text-foreground font-medium">
                    {workflow.metadata.lastExecuted 
                      ? formatDistanceToNowStrict(workflow.metadata.lastExecuted, { addSuffix: true })
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Auto-trigger</span>
                </div>
                <p className={cn(
                  "text-xs",
                  workflow.configuration.autoTrigger ? "text-green-400" : "text-muted-foreground"
                )}>
                  {workflow.configuration.autoTrigger ? 'Enabled' : 'Disabled'}
                </p>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Approval Required</span>
                </div>
                <p className={cn(
                  "text-xs",
                  workflow.configuration.requireApproval ? "text-yellow-400" : "text-green-400"
                )}>
                  {workflow.configuration.requireApproval ? 'Yes' : 'No'}
                </p>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Timeout</span>
                </div>
                <p className="text-xs text-blue-400">
                  {Math.round(workflow.configuration.timeout / 1000)}s
                </p>
              </div>

              <div className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">Retry Attempts</span>
                </div>
                <p className="text-xs text-purple-400">
                  {workflow.configuration.retryAttempts}
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-400">Workflow Steps</h3>
              {isEditing && (
                <button
                  onClick={() => {
                    // Add new step logic here
                  }}
                  className="flex items-center gap-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Step
                </button>
              )}
            </div>

            <div className="space-y-4">
              {workflow.steps.map((step, index) => (
                <div key={step.id} className="bg-card rounded-lg border border-border overflow-hidden">
                  {/* Step Header */}
                  <div 
                    className="flex items-center justify-between p-4 bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => toggleStepExpanded(step.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-foreground font-medium">{step.name}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {step.actions.length} actions
                      </span>
                      {step.isParallel && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                          PARALLEL
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {expandedSteps.has(step.id) && (
                    <div className="p-4 border-t border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {step.actions.map((action) => (
                          <div key={action.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className={cn("p-2 rounded-lg bg-card", getActionColor(action.type))}>
                              {getActionIcon(action.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground font-medium">{action.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                              {action.requiresApproval && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                                  <Shield className="h-3 w-3" />
                                  Requires Approval
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {action.timeout && (
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(action.timeout / 1000)}s
                                </span>
                              )}
                              {action.retryCount && action.retryCount > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ×{action.retryCount}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
