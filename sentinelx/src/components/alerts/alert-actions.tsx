"use client";

import { useState } from 'react';
import { Shield, Target, UserX, Ban, RotateCcw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertAction } from '@/types/alerts';
import { cn } from '@/lib/utils/cn';

interface AlertActionsProps {
  alert: Alert;
  onActionExecute: (alertId: string, action: AlertAction) => void;
  onStatusUpdate: (alertId: string, status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED') => void;
  onNoteAdd: (alertId: string, note: string) => void;
}

export function AlertActions({ alert, onActionExecute, onStatusUpdate, onNoteAdd }: AlertActionsProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickNote, setQuickNote] = useState('');

  const getActionColor = (type: AlertAction['type']) => {
    switch (type) {
      case 'block_ip': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'reset_password': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'investigate_session': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'escalate': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'acknowledge': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'resolve': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getActionIcon = (type: AlertAction['type']) => {
    switch (type) {
      case 'block_ip': return <Ban className="h-4 w-4" />;
      case 'reset_password': return <RotateCcw className="h-4 w-4" />;
      case 'investigate_session': return <Target className="h-4 w-4" />;
      case 'escalate': return <AlertTriangle className="h-4 w-4" />;
      case 'acknowledge': return <Clock className="h-4 w-4" />;
      case 'resolve': return <CheckCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const handleQuickNote = () => {
    if (quickNote.trim()) {
      onNoteAdd(alert.id, quickNote.trim());
      setQuickNote('');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="glass-neon rounded-xl border border-green-500/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-green-400">Quick Actions</h3>
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="text-sm text-green-400 hover:text-green-300 transition-colors"
        >
          {showQuickActions ? 'Hide Actions' : 'Show Actions'}
        </button>
      </div>

      {/* Status Actions */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-white mb-3">Status Management</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {alert.status === 'OPEN' && (
            <button
              onClick={() => onStatusUpdate(alert.id, 'INVESTIGATING')}
              className="flex items-center gap-2 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-colors"
            >
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-yellow-400 font-medium">Acknowledge</span>
            </button>
          )}
          <button
            onClick={() => onStatusUpdate(alert.id, 'RESOLVED')}
            className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
          >
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">Resolve</span>
          </button>
          <button
            onClick={() => {/* TODO: Implement escalation */}}
            className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">Escalate</span>
          </button>
        </div>
      </div>

      {/* AI Suggested Actions */}
      {alert.suggestedActions.length > 0 && (
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-medium text-white mb-3">AI Suggested Actions</h4>
          <div className="space-y-3">
            {alert.suggestedActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-4 bg-black/50 border border-green-500/20 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getActionIcon(action.type)}
                    <span className="text-sm font-medium text-white">{action.title}</span>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      action.automated ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                    )}>
                      {action.automated ? 'Automated' : 'Manual'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{action.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400">Risk:</span>
                    <span className={cn("text-xs font-medium", getRiskColor(action.risk))}>
                      {action.risk.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onActionExecute(alert.id, action)}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors font-medium text-sm",
                    action.automated 
                      ? "bg-green-500 text-black hover:bg-green-400" 
                      : "bg-blue-500 text-white hover:bg-blue-400"
                  )}
                >
                  {action.automated ? 'Execute' : 'Start'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Note */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white mb-3">Add Quick Note</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your note here..."
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="flex-1 px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
            onKeyPress={(e) => e.key === 'Enter' && handleQuickNote()}
          />
          <button
            onClick={handleQuickNote}
            className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors font-medium"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Workflow Actions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white mb-3">Workflow Actions</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onActionExecute(alert.id, {
              id: 'assign',
              type: 'acknowledge',
              title: 'Assign to Analyst',
              description: 'Assign this alert to a security analyst',
              automated: false,
              risk: 'low'
            })}
            className="flex flex-col items-center gap-2 p-3 bg-black/50 border border-green-500/20 rounded-lg hover:bg-green-500/10 transition-colors"
          >
            <UserX className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-400">Assign</span>
          </button>
          
          <button
            onClick={() => onActionExecute(alert.id, {
              id: 'convert_incident',
              type: 'escalate',
              title: 'Convert to Incident',
              description: 'Create a security incident from this alert',
              automated: false,
              risk: 'low'
            })}
            className="flex flex-col items-center gap-2 p-3 bg-black/50 border border-green-500/20 rounded-lg hover:bg-green-500/10 transition-colors"
          >
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-400">Incident</span>
          </button>
          
          <button
            onClick={() => onActionExecute(alert.id, {
              id: 'block_ip',
              type: 'block_ip',
              title: 'Block IP Address',
              description: 'Block the malicious IP at firewall level',
              automated: true,
              risk: 'low'
            })}
            className="flex flex-col items-center gap-2 p-3 bg-black/50 border border-green-500/20 rounded-lg hover:bg-green-500/10 transition-colors"
          >
            <Ban className="h-4 w-4 text-red-400" />
            <span className="text-xs text-red-400">Block IP</span>
          </button>
          
          <button
            onClick={() => onActionExecute(alert.id, {
              id: 'investigate_deeper',
              type: 'investigate_session',
              title: 'Deep Investigation',
              description: 'Start comprehensive investigation workflow',
              automated: false,
              risk: 'low'
            })}
            className="flex flex-col items-center gap-2 p-3 bg-black/50 border border-green-500/20 rounded-lg hover:bg-green-500/10 transition-colors"
          >
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-blue-400">Investigate</span>
          </button>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="mt-6 p-4 bg-black/50 border border-green-500/20 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-3">Risk Assessment</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-slate-400">Severity</span>
            <div className={cn(
              "text-sm font-bold mt-1",
              alert.severity === 'CRITICAL' ? 'text-red-400' :
              alert.severity === 'HIGH' ? 'text-orange-400' :
              alert.severity === 'MEDIUM' ? 'text-yellow-400' : 'text-cyan-400'
            )}>
              {alert.severity}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Risk Score</span>
            <div className={cn(
              "text-sm font-bold mt-1",
              alert.riskScore >= 80 ? 'text-red-400' :
              alert.riskScore >= 60 ? 'text-orange-400' :
              alert.riskScore >= 40 ? 'text-yellow-400' : 'text-green-400'
            )}>
              {alert.riskScore}/100
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Attack Type</span>
            <div className="text-sm font-bold text-white mt-1">
              {alert.attackType}
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Source</span>
            <div className="text-sm font-bold text-white mt-1">
              {alert.source}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
