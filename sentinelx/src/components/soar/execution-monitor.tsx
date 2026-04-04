"use client";

import { useState, useEffect } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { Play, Pause, Square, CheckCircle, XCircle, AlertTriangle, Clock, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { WorkflowExecution, WorkflowStatus } from '@/types/soar';
import { cn } from '@/lib/utils/cn';

interface ExecutionMonitorProps {
  executions: WorkflowExecution[];
  isLiveMonitoring: boolean;
}

export function ExecutionMonitor({ executions, isLiveMonitoring }: ExecutionMonitorProps) {
  const [expandedExecutions, setExpandedExecutions] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'executing': return <Activity className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'executing': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'paused': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-3 w-3 text-blue-400 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'failed': return <XCircle className="h-3 w-3 text-red-400" />;
      case 'skipped': return <Pause className="h-3 w-3 text-slate-400" />;
      default: return <Clock className="h-3 w-3 text-slate-400" />;
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-3 w-3 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-3 w-3 text-yellow-400" />;
      default: return <Activity className="h-3 w-3 text-blue-400" />;
    }
  };

  const toggleExecutionExpanded = (executionId: string) => {
    const newExpanded = new Set(expandedExecutions);
    if (newExpanded.has(executionId)) {
      newExpanded.delete(executionId);
    } else {
      newExpanded.add(executionId);
    }
    setExpandedExecutions(newExpanded);
  };

  const getExecutionDuration = (execution: WorkflowExecution) => {
    if (execution.endTime) {
      return execution.endTime.getTime() - execution.startTime.getTime();
    }
    return Date.now() - execution.startTime.getTime();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  const activeExecutions = executions.filter(e => e.status === 'executing');
  const recentExecutions = executions.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Active Executions */}
      {activeExecutions.length > 0 && (
        <div className="glass-neon rounded-xl border border-green-500/30 overflow-hidden">
          <div className="p-4 border-b border-green-500/20 bg-blue-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400 animate-pulse" />
                <h3 className="text-lg font-semibold text-blue-400">Active Executions</h3>
              </div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30">
                {activeExecutions.length} running
              </span>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {activeExecutions.map((execution) => (
              <div key={execution.id} className="flex items-center gap-4 p-3 bg-black/30 rounded-lg">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-400 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">
                      Workflow #{execution.workflowId}
                    </span>
                    <span className="text-xs text-blue-400">
                      Running for {formatDuration(getExecutionDuration(execution))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      Started {formatDistanceToNowStrict(execution.startTime, { addSuffix: true })}
                    </span>
                    {execution.currentStep && (
                      <span className="text-xs text-blue-400">
                        Step: {execution.currentStep}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggleExecutionExpanded(execution.id)}
                  className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Executions */}
      <div className="glass-neon rounded-xl border border-green-500/30 overflow-hidden">
        <div className="p-4 border-b border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">Recent Executions</h3>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-lg border transition-colors text-sm",
                  autoRefresh 
                    ? "bg-green-500/20 text-green-400 border-green-500/30" 
                    : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                )}
              >
                <Activity className={cn("h-4 w-4", autoRefresh && "animate-pulse")} />
                Auto-refresh
              </button>
              
              <span className="text-xs text-slate-400">
                {recentExecutions.length} executions
              </span>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {recentExecutions.map((execution) => (
            <div key={execution.id} className="border-b border-green-500/10 last:border-b-0">
              {/* Execution Header */}
              <div 
                className="flex items-center justify-between p-4 hover:bg-green-500/5 transition-colors cursor-pointer"
                onClick={() => toggleExecutionExpanded(execution.id)}
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(execution.status)}
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-medium">
                        Workflow #{execution.workflowId}
                      </span>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border",
                        getStatusColor(execution.status)
                      )}>
                        {execution.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">
                        {execution.triggeredBy === 'automatic' ? 'AUTO' : 'MANUAL'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>
                        Started {formatDistanceToNowStrict(execution.startTime, { addSuffix: true })}
                      </span>
                      {execution.endTime && (
                        <span>
                          Duration: {formatDuration(execution.endTime.getTime() - execution.startTime.getTime())}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight className={cn(
                  "h-4 w-4 text-slate-400 transition-transform",
                  expandedExecutions.has(execution.id) && "rotate-90"
                )} />
              </div>

              {/* Expanded Details */}
              {expandedExecutions.has(execution.id) && (
                <div className="p-4 bg-black/20 border-t border-green-500/20">
                  {/* Steps Progress */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-green-400 mb-3">Steps Progress</h4>
                    <div className="space-y-2">
                      {execution.executedSteps.map((step, index) => (
                        <div key={step.stepId} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-black/50 border border-green-500/30 flex items-center justify-center">
                            {getStepStatusIcon(step.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-white">Step {index + 1}</span>
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full border",
                                getStatusColor(step.status as WorkflowStatus)
                              )}>
                                {step.status.toUpperCase()}
                              </span>
                            </div>
                            {step.result && (
                              <p className="text-xs text-green-400">
                                {typeof step.result === 'string' 
                                  ? step.result 
                                  : step.result?.message || 'Completed'
                                }
                              </p>
                            )}
                            {step.error && (
                              <p className="text-xs text-red-400">{step.error}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Execution Logs */}
                  <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-3">Execution Logs</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {execution.logs.map((log, index) => (
                        <div key={index} className="flex items-start gap-3 text-xs">
                          <div className="mt-0.5">
                            {getLogIcon(log.level)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                "font-medium",
                                log.level === 'error' ? 'text-red-400' :
                                log.level === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                              )}>
                                {log.level.toUpperCase()}
                              </span>
                              <span className="text-slate-500">
                                {formatDistanceToNowStrict(log.timestamp, { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-slate-300">{log.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trigger Data */}
                  {execution.triggerData && (
                    <div className="mt-4 pt-4 border-t border-green-500/20">
                      <h4 className="text-sm font-semibold text-green-400 mb-3">Trigger Data</h4>
                      <div className="p-3 bg-black/50 rounded-lg">
                        <pre className="text-xs text-green-400 overflow-x-auto">
                          {JSON.stringify(execution.triggerData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {recentExecutions.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Executions Found</p>
              <p className="text-sm">Workflow executions will appear here when triggered</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
