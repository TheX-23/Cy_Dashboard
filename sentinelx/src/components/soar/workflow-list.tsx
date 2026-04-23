"use client";

import { useState, useMemo } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { Play, Pause, Edit, Trash2, MoreHorizontal, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { SOARWorkflow, WorkflowStatus, WorkflowTrigger } from '@/types/soar';
import { cn } from '@/lib/utils/cn';

interface WorkflowListProps {
  workflows: SOARWorkflow[];
  selectedWorkflowId: string | null;
  onWorkflowSelect: (workflowId: string) => void;
  onWorkflowEdit: (workflowId: string) => void;
  onWorkflowDelete: (workflowId: string) => void;
  onWorkflowToggle: (workflowId: string, enabled: boolean) => void;
  onWorkflowExecute: (workflowId: string) => void;
  isExecuting?: boolean;
}

export function WorkflowList({ 
  workflows, 
  selectedWorkflowId, 
  onWorkflowSelect, 
  onWorkflowEdit, 
  onWorkflowDelete, 
  onWorkflowToggle,
  onWorkflowExecute,
  isExecuting 
}: WorkflowListProps) {
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'inactive': return <Pause className="h-4 w-4 text-muted-foreground" />;
      case 'executing': return <Play className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10 border-border';
      case 'inactive': return 'text-muted-foreground bg-slate-500/10 border-slate-500/20';
      case 'executing': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'completed': return 'text-green-400 bg-green-500/10 border-border';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'paused': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-muted-foreground bg-slate-500/10 border-slate-500/20';
    }
  };

  const getTriggerIcon = (trigger: WorkflowTrigger) => {
    switch (trigger) {
      case 'brute_force': return '🔓';
      case 'suspicious_login': return '🌍';
      case 'sql_injection': return '💉';
      case 'data_exfiltration': return '📤';
      case 'malware_detection': return '🦠';
      case 'manual': return '👤';
      default: return '⚙️';
    }
  };

  const getTriggerColor = (trigger: WorkflowTrigger) => {
    switch (trigger) {
      case 'brute_force': return 'text-orange-400';
      case 'suspicious_login': return 'text-blue-400';
      case 'sql_injection': return 'text-red-400';
      case 'data_exfiltration': return 'text-purple-400';
      case 'malware_detection': return 'text-green-400';
      case 'manual': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {workflows.map((workflow) => (
        <div
          key={workflow.id}
          className={cn(
            "bg-card text-card-foreground rounded-xl border border-border overflow-hidden transition-all duration-200",
            selectedWorkflowId === workflow.id && "border-green-500/60 bg-green-500/5",
            "hover:border-green-500/40"
          )}
        >
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Trigger Icon */}
                <div className="text-2xl">{getTriggerIcon(workflow.trigger)}</div>
                
                {/* Workflow Info */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{workflow.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onWorkflowToggle(workflow.id, !workflow.enabled)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    workflow.enabled 
                      ? "text-green-400 hover:text-green-300" 
                      : "text-muted-foreground hover:text-green-400"
                  )}
                  title={workflow.enabled ? 'Disable workflow' : 'Enable workflow'}
                >
                  {workflow.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => onWorkflowExecute(workflow.id)}
                  disabled={!workflow.enabled || isExecuting}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    workflow.enabled && !isExecuting
                      ? "text-blue-400 hover:text-blue-300" 
                      : "text-muted-foreground cursor-not-allowed"
                  )}
                  title="Execute workflow"
                >
                  <Play className="h-4 w-4" />
                </button>

                <button
                  onClick={() => onWorkflowEdit(workflow.id)}
                  className="p-2 text-muted-foreground hover:text-green-400 transition-colors"
                  title="Edit workflow"
                >
                  <Edit className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setExpandedWorkflow(expandedWorkflow === workflow.id ? null : workflow.id)}
                  className="p-2 text-muted-foreground hover:text-green-400 transition-colors"
                  title="Show details"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="px-6 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(workflow.status)}
                  <span className={cn("text-sm font-medium", getStatusColor(workflow.status))}>
                    {workflow.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTriggerIcon(workflow.trigger)}</span>
                  <span className={cn("text-sm font-medium", getTriggerColor(workflow.trigger))}>
                    {workflow.trigger.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Last: {workflow.metadata.lastExecuted 
                    ? formatDistanceToNowStrict(workflow.metadata.lastExecuted, { addSuffix: true })
                    : 'Never'
                  }</span>
                </div>
                
                <div>
                  <span>Runs: {workflow.metadata.executionCount}</span>
                </div>
                
                <div>
                  <span>Success: {workflow.metadata.successCount}</span>
                </div>
                
                <div>
                  <span>Avg: {Math.round(workflow.metadata.averageExecutionTime / 1000)}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedWorkflow === workflow.id && (
            <div className="p-6 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Configuration */}
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-3">Configuration</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Auto-trigger:</span>
                      <span className={workflow.configuration.autoTrigger ? "text-green-400" : "text-muted-foreground"}>
                        {workflow.configuration.autoTrigger ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requires Approval:</span>
                      <span className={workflow.configuration.requireApproval ? "text-yellow-400" : "text-green-400"}>
                        {workflow.configuration.requireApproval ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeout:</span>
                      <span className="text-foreground">{Math.round(workflow.configuration.timeout / 1000)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retry Attempts:</span>
                      <span className="text-foreground">{workflow.configuration.retryAttempts}</span>
                    </div>
                  </div>
                </div>

                {/* Steps Overview */}
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-3">Steps ({workflow.steps.length})</h4>
                  <div className="space-y-2">
                    {workflow.steps.slice(0, 3).map((step, index) => (
                      <div key={step.id} className="flex items-center gap-2 text-xs">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-medium">
                          {index + 1}
                        </div>
                        <span className="text-muted-foreground">{step.name}</span>
                        <span className="text-muted-foreground">({step.actions.length} actions)</span>
                      </div>
                    ))}
                    {workflow.steps.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{workflow.steps.length - 3} more steps
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                <button
                  onClick={() => onWorkflowSelect(workflow.id)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors font-medium"
                >
                  View Details
                </button>
                
                <button
                  onClick={() => onWorkflowEdit(workflow.id)}
                  className="px-4 py-2 bg-muted hover:bg-muted-foreground/20 text-green-400 border border-green-500/30 rounded-lg transition-colors font-medium"
                >
                  Edit Workflow
                </button>
                
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete workflow "${workflow.name}"?`)) {
                      onWorkflowDelete(workflow.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {workflows.length === 0 && (
        <div className="bg-card text-card-foreground rounded-xl border border-border p-12 text-center">
          <div className="text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No Workflows Found</p>
            <p className="text-sm">Create your first SOAR workflow to automate security responses</p>
          </div>
        </div>
      )}
    </div>
  );
}
