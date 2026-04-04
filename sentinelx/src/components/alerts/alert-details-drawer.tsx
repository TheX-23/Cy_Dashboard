"use client";

import { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { X, Copy, Download, AlertTriangle, Globe, User, Clock, Tag, FileJson, FileText, Shield, Target, Activity, ChevronRight } from 'lucide-react';
import { Alert, AlertAction, AlertNote } from '@/types/alerts';
import { cn } from '@/lib/utils/cn';

interface AlertDetailsDrawerProps {
  alert: Alert | null;
  onClose: () => void;
  onStatusUpdate: (alertId: string, status: any) => void;
  onActionExecute: (alertId: string, action: AlertAction) => void;
  onNoteAdd: (alertId: string, note: string) => void;
}

export function AlertDetailsDrawer({ 
  alert, 
  onClose, 
  onStatusUpdate, 
  onActionExecute,
  onNoteAdd 
}: AlertDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'timeline' | 'raw'>('overview');
  const [newNote, setNewNote] = useState('');

  if (!alert) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'Auth': 'text-green-400',
      'API': 'text-cyan-400',
      'Firewall': 'text-red-400',
      'IDS': 'text-purple-400',
      'Network': 'text-orange-400',
      'System': 'text-slate-400'
    };
    return colors[source] || 'text-slate-400';
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onNoteAdd(alert.id, newNote.trim());
      setNewNote('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportAlert = (format: 'json' | 'csv') => {
    const data = format === 'json' 
      ? JSON.stringify(alert, null, 2)
      : `${alert.id},${alert.severity},${alert.title},${alert.source},${alert.attackType},${alert.status},${alert.assignedTo || ''},${alert.affectedAsset.value},${alert.timestamp.toISOString()}`;
    
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alert-${alert.id}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-4xl bg-black/95 border-l border-green-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-500/20">
          <div className="flex items-center gap-4">
            <div className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border",
              getSeverityColor(alert.severity)
            )}>
              <AlertTriangle className="h-4 w-4" />
              {alert.severity}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{alert.title}</h2>
              <p className="text-sm text-slate-400">{alert.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'raw' ? 'overview' : 'raw')}
              className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
              title={activeTab === 'raw' ? 'View Details' : 'View Raw JSON'}
            >
              {activeTab === 'raw' ? <FileText className="h-4 w-4" /> : <FileJson className="h-4 w-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(JSON.stringify(alert, null, 2))}
              className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
              title="Copy alert data"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => exportAlert('json')}
              className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
              title="Export as JSON"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' ? (
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400">Timestamp</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-white">
                        {alert.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDistanceToNowStrict(alert.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Source</label>
                    <div className="mt-1">
                      <span className={cn("text-sm font-medium", getSourceColor(alert.source))}>
                        {alert.source}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Attack Type</label>
                    <div className="mt-1">
                      <span className="text-sm text-white">{alert.attackType}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Risk Score</label>
                    <div className="mt-1">
                      <span className={cn(
                        "text-lg font-bold",
                        alert.riskScore >= 80 ? 'text-red-400' :
                        alert.riskScore >= 60 ? 'text-orange-400' :
                        alert.riskScore >= 40 ? 'text-yellow-400' : 'text-green-400'
                      )}>
                        {alert.riskScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Description</h3>
                <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                  <p className="text-sm text-white">{alert.description}</p>
                </div>
              </div>

              {/* Trigger Reason */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Trigger Reason</h3>
                <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                  <p className="text-sm text-white">{alert.triggerReason}</p>
                </div>
              </div>

              {/* AI Summary */}
              {alert.aiSummary && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-400">AI Analysis</h3>
                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <p className="text-sm text-purple-300">{alert.aiSummary}</p>
                  </div>
                </div>
              )}

              {/* Affected Systems */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Affected Systems</h3>
                <div className="flex flex-wrap gap-2">
                  {alert.affectedSystems.map((system, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-black/50 text-green-400 border border-green-500/30 rounded-full text-sm"
                    >
                      {system}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggested Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Suggested Actions</h3>
                <div className="space-y-2">
                  {alert.suggestedActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-3 bg-black/50 border border-green-500/20 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-400" />
                          <span className="text-sm font-medium text-white">{action.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{action.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          action.automated ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                        )}>
                          {action.automated ? 'Automated' : 'Manual'}
                        </span>
                        <button
                          onClick={() => onActionExecute(alert.id, action)}
                          className="px-3 py-1 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors text-sm font-medium"
                        >
                          Execute
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {alert.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-black/50 text-green-400 border border-green-500/30"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'logs' ? (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Related Logs</h3>
              <div className="space-y-2">
                {alert.relatedLogs.map((logId, index) => (
                  <div key={logId} className="bg-black/50 rounded-lg p-3 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white font-mono">{logId}</span>
                      <ChevronRight className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'timeline' ? (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Event Timeline</h3>
              <div className="space-y-3">
                <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-1"></div>
                    <div>
                      <p className="text-sm text-white font-medium">Alert Triggered</p>
                      <p className="text-xs text-slate-400">
                        {formatDistanceToNowStrict(alert.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
                {alert.notes.map((note) => (
                  <div key={note.id} className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1",
                        note.type === 'escalation' ? 'bg-red-400' :
                        note.type === 'action' ? 'bg-yellow-400' : 'bg-green-400'
                      )}></div>
                      <div>
                        <p className="text-sm text-white font-medium">{note.content}</p>
                        <p className="text-xs text-slate-400">
                          {note.author} • {formatDistanceToNowStrict(note.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Raw JSON</h3>
              <div className="bg-black/50 rounded-lg p-4 border border-green-500/20">
                <pre className="text-sm text-green-400 overflow-x-auto">
                  {JSON.stringify(alert, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-green-500/20 p-6">
          <div className="space-y-4">
            {/* Add Note */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a note or comment..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors font-medium"
              >
                Add Note
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {alert.status === 'OPEN' && (
                  <button
                    onClick={() => onStatusUpdate(alert.id, 'INVESTIGATING')}
                    className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                  >
                    Acknowledge
                  </button>
                )}
                <button
                  onClick={() => onStatusUpdate(alert.id, 'RESOLVED')}
                  className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors font-medium"
                >
                  Resolve
                </button>
                <button
                  onClick={() => {/* TODO: Implement escalation */}}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors font-medium"
                >
                  Escalate
                </button>
              </div>
              <div className="text-sm text-slate-400">
                Risk Score: <span className="text-white font-bold">{alert.riskScore}/100</span>
              </div>
            </div>
          </div>

          {/* Notes History */}
          {alert.notes.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-green-400 mb-3">Notes History</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {alert.notes.map((note) => (
                  <div key={note.id} className="bg-black/30 rounded-lg p-3 border border-green-500/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-white">{note.content}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {note.author} • {formatDistanceToNowStrict(note.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        note.type === 'escalation' ? "bg-red-500/10 text-red-400" :
                        note.type === 'action' ? "bg-yellow-500/10 text-yellow-400" : "bg-green-500/10 text-green-400"
                      )}>
                        {note.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
