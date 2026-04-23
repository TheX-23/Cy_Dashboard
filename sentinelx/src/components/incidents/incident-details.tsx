"use client";

import { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { X, Copy, Download, AlertTriangle, Globe, User, Clock, Tag, FileJson, FileText, Shield, Target, Activity, ChevronRight, Plus, Edit, Trash2, Link, Unlink } from 'lucide-react';
import { Incident, IncidentNote, IncidentEvidence } from '@/types/incidents';
import { cn } from '@/lib/utils/cn';

interface IncidentDetailsProps {
  incident: Incident | null;
  onClose: () => void;
  onStatusUpdate: (incidentId: string, status: any) => void;
  onNoteAdd: (incidentId: string, note: string) => void;
  onEvidenceAdd: (incidentId: string, evidence: File) => void;
}

export function IncidentDetails({ 
  incident, 
  onClose, 
  onStatusUpdate, 
  onNoteAdd,
  onEvidenceAdd
}: IncidentDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'timeline' | 'logs' | 'notes' | 'evidence' | 'raw'>('overview');
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);

  if (!incident) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-muted-foreground bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-red-400';
      case 'INVESTIGATING': return 'text-yellow-400';
      case 'CONTAINED': return 'text-blue-400';
      case 'RESOLVED': return 'text-green-400';
      case 'CLOSED': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onNoteAdd(incident.id, newNote.trim());
      setNewNote('');
    }
  };

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onEvidenceAdd(incident.id, file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportIncident = (format: 'json' | 'csv') => {
    const data = format === 'json' 
      ? JSON.stringify(incident, null, 2)
      : `${incident.id},${incident.title},${incident.severity},${incident.status},${incident.createdAt.toISOString()}`;
    
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-${incident.id}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-5xl bg-background text-foreground border-l border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-500/20">
          <div className="flex items-center gap-4">
            <div className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border",
              getSeverityColor(incident.severity)
            )}>
              <AlertTriangle className="h-4 w-4" />
              {incident.severity}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{incident.title}</h2>
              <p className="text-sm text-muted-foreground">{incident.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'raw' ? 'overview' : 'raw')}
              className="p-2 text-muted-foreground hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
              title={activeTab === 'raw' ? 'View Details' : 'View Raw JSON'}
            >
              {activeTab === 'raw' ? <FileText className="h-4 w-4" /> : <FileJson className="h-4 w-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(JSON.stringify(incident, null, 2))}
              className="p-2 text-muted-foreground hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
              title="Copy incident data"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => exportIncident('json')}
              className="p-2 text-muted-foreground hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
              title="Export as JSON"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-green-500/20">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'alerts', label: 'Alerts' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'logs', label: 'Logs' },
            { id: 'notes', label: 'Notes' },
            { id: 'evidence', label: 'Evidence' },
            { id: 'raw', label: 'Raw Data' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id 
                  ? "text-green-400 border-b-2 border-green-400 bg-green-500/5" 
                  : "text-muted-foreground hover:text-green-400 hover:bg-green-500/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Incident ID</label>
                    <p className="text-sm text-foreground font-mono">{incident.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", getStatusColor(incident.status))}>
                        {incident.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Severity</label>
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                      getSeverityColor(incident.severity)
                    )}>
                      {incident.severity}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Impact</label>
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                      getSeverityColor(incident.impact)
                    )}>
                      {incident.impact}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Created At</label>
                    <p className="text-sm text-foreground">
                      {incident.createdAt.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNowStrict(incident.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Assigned To</label>
                    <div className="flex items-center gap-2">
                      {incident.assignedTo ? (
                        <>
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{incident.assignedToName || incident.assignedTo}</span>
                        </>
                      ) : (
                        <span className="text-sm text-slate-500">Unassigned</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Risk Score</label>
                    <div className="mt-1">
                      <span className={cn(
                        "text-lg font-bold",
                        incident.riskScore >= 80 ? 'text-red-400' :
                        incident.riskScore >= 60 ? 'text-orange-400' :
                        incident.riskScore >= 40 ? 'text-yellow-400' : 'text-green-400'
                      )}>
                        {incident.riskScore}/100
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Priority</label>
                    <div className="mt-1">
                      <span className="text-lg font-bold text-foreground">
                        #{incident.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Description</h3>
                <div className="bg-card text-card-foreground border border-border">
                  <p className="text-sm text-foreground">{incident.description}</p>
                </div>
              </div>

              {/* Affected Assets */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Affected Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incident.affectedAssets.map((asset, index) => (
                    <div key={asset.id} className="bg-card text-card-foreground border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-foreground">{asset.name}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Type: <span className="text-foreground">{asset.type}</span></p>
                        {asset.ip && <p className="text-xs text-muted-foreground">IP: <span className="text-foreground font-mono">{asset.ip}</span></p>}
                        {asset.location && <p className="text-xs text-muted-foreground">Location: <span className="text-foreground">{asset.location}</span></p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {incident.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-card text-green-400 border border-green-500/30"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Linked Alerts</h3>
              <div className="space-y-2">
                {incident.linkedAlerts.map((alertId, index) => (
                  <div key={alertId} className="bg-card rounded-lg p-3 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground font-mono">{alertId}</span>
                      <ChevronRight className="h-4 w-4 text-green-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Incident Timeline</h3>
              <div className="space-y-3">
                {incident.timeline.map((event) => (
                  <div key={event.id} className="bg-card text-card-foreground border border-border">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1",
                        event.type === 'alert_triggered' ? 'bg-red-400' :
                        event.type === 'status_change' ? 'bg-yellow-400' :
                        event.type === 'action_taken' ? 'bg-blue-400' :
                        event.type === 'note_added' ? 'bg-green-400' : 'bg-purple-400'
                      )}></div>
                      <div>
                        <p className="text-sm text-foreground font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {event.author} • {formatDistanceToNowStrict(event.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Related Logs</h3>
              <div className="bg-card text-card-foreground border border-border">
                <p className="text-sm text-muted-foreground">
                  Integration with Log Explorer - Click to view detailed logs related to this incident.
                </p>
                <button className="mt-3 px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors text-sm font-medium">
                  View in Log Explorer
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Investigation Notes</h3>
              
              {/* Add Note */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a note or comment..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 bg-card border border-green-500/30 rounded-lg text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors text-sm font-medium"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Notes History */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {incident.notes.map((note) => (
                  <div key={note.id} className="bg-card text-card-foreground border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {note.author} • {formatDistanceToNowStrict(note.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingNote(note.id)}
                          className="p-1 text-muted-foreground hover:text-green-400 transition-colors"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-red-400 transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Evidence & Attachments</h3>
              
              {/* Upload Evidence */}
              <div className="border-2 border-dashed border-green-500/30 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleEvidenceUpload}
                  className="hidden"
                  id="evidence-upload"
                />
                <label htmlFor="evidence-upload" className="cursor-pointer">
                  <Plus className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-green-400">Click to upload evidence</p>
                  <p className="text-xs text-muted-foreground mt-1">Screenshots, logs, files</p>
                </label>
              </div>

              {/* Evidence List */}
              <div className="space-y-3">
                {incident.evidence.map((evidence) => (
                  <div key={evidence.id} className="bg-card text-card-foreground border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground font-medium">{evidence.name}</p>
                        <p className="text-xs text-muted-foreground">{evidence.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {evidence.uploadedBy} • {formatDistanceToNowStrict(evidence.uploadedAt, { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                          {evidence.type}
                        </span>
                        <button className="p-1 text-muted-foreground hover:text-green-400 transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Raw JSON Data</h3>
              <div className="bg-card text-card-foreground border border-border">
                <pre className="text-sm text-green-400 overflow-x-auto">
                  {JSON.stringify(incident, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {/* TODO: Implement workflow actions */}}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors text-sm font-medium"
              >
                {incident.status === 'OPEN' ? 'Start Investigation' : 'Update Status'}
              </button>
              <button
                onClick={() => {/* TODO: Implement escalation */}}
                className="px-4 py-2 bg-red-500 text-foreground rounded-lg hover:bg-red-400 transition-colors text-sm font-medium"
              >
                Escalate
              </button>
              <button
                onClick={() => {/* TODO: Implement resolution */}}
                className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors text-sm font-medium"
              >
                Resolve
              </button>
            </div>
            <div className="text-sm text-muted-foreground">
              Risk Score: <span className="text-foreground font-bold">{incident.riskScore}/100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
