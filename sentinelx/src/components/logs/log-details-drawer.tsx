"use client";

import { useState } from 'react';
import { X, Copy, Download, AlertTriangle, Globe, User, Clock, Tag, FileJson, FileText } from 'lucide-react';
import { LogEntry } from '@/types/logs';
import { cn } from '@/lib/utils/cn';

interface LogDetailsDrawerProps {
  log: LogEntry | null;
  onClose: () => void;
  onMarkAsIncident?: (logId: string) => void;
  onExport?: (log: LogEntry, format: 'json' | 'csv') => void;
}

export function LogDetailsDrawer({ log, onClose, onMarkAsIncident, onExport }: LogDetailsDrawerProps) {
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('pretty');

  if (!log) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'WARN': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'ERROR': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-muted-foreground bg-slate-500/10 border-slate-500/20';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-2xl bg-background text-foreground border-l border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Log Details</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {log.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'pretty' ? 'raw' : 'pretty')}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title={viewMode === 'pretty' ? 'View Raw JSON' : 'View Pretty'}
            >
              {viewMode === 'pretty' ? <FileJson className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(formatJson(log))}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Copy log data"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => onExport?.(log, 'json')}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Export as JSON"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'pretty' ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Timestamp</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">
                        {log.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Level</label>
                    <div className="mt-1">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                        getLevelColor(log.level)
                      )}>
                        {log.level}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Source</label>
                    <div className="mt-1">
                      <span className="text-sm text-foreground">{log.source}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Event Type</label>
                    <div className="mt-1">
                      <span className="text-sm text-foreground">{log.eventType}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Network Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">IP Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground font-mono">{log.ipAddress}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Country</label>
                    <div className="mt-1">
                      <span className="text-sm text-foreground">
                        {log.metadata.geoLocation?.country || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">City</label>
                    <div className="mt-1">
                      <span className="text-sm text-foreground">
                        {log.metadata.geoLocation?.city || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">User ID</label>
                    <div className="flex items-center gap-2 mt-1">
                      {log.userId ? (
                        <>
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{log.userId}</span>
                        </>
                      ) : (
                        <span className="text-sm text-slate-500">System</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Information */}
              {log.metadata.method && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Request Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Method</label>
                      <div className="mt-1">
                        <span className="text-sm text-foreground">{log.metadata.method}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Path</label>
                      <div className="mt-1">
                        <span className="text-sm text-foreground font-mono">{log.metadata.path}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Status Code</label>
                      <div className="mt-1">
                        <span className={cn(
                          "text-sm font-medium",
                          log.metadata.statusCode && log.metadata.statusCode >= 400 ? "text-red-400" : "text-green-400"
                        )}>
                          {log.metadata.statusCode}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Response Time</label>
                      <div className="mt-1">
                        <span className="text-sm text-foreground">{log.metadata.responseTime}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Message</h3>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-foreground">{log.message}</p>
                </div>
              </div>

              {/* Payload */}
              {log.metadata.payload && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Payload</h3>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <pre className="text-sm text-foreground overflow-x-auto">
                      {formatJson(log.metadata.payload)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Headers */}
              {log.metadata.headers && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Headers</h3>
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <div className="space-y-2">
                      {Object.entries(log.metadata.headers).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-muted-foreground font-mono">{key}:</span>
                          <span className="text-sm text-foreground font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {log.tags.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {log.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-card text-slate-300 border border-border"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Anomaly Detection */}
              {log.isAnomaly && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Anomaly Detection</h3>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-orange-400 font-medium">Anomaly Detected</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This log entry has been flagged as potentially suspicious based on pattern analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Logs */}
              {log.relatedLogs && log.relatedLogs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Related Logs</h3>
                  <div className="space-y-2">
                    {log.relatedLogs.map((relatedLogId, index) => (
                      <div key={relatedLogId} className="bg-card rounded-lg p-3 border border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground font-mono">{relatedLogId}</span>
                          <span className="text-xs text-muted-foreground">Related Entry #{index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Raw JSON</h3>
              <div className="bg-card rounded-lg p-4 border border-border">
                <pre className="text-sm text-foreground overflow-x-auto">
                  {formatJson(log)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => copyToClipboard(formatJson(log))}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted-foreground/20 rounded-lg transition-colors text-foreground"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                onClick={() => onExport?.(log, 'json')}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted-foreground/20 rounded-lg transition-colors text-foreground"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
            {onMarkAsIncident && (
              <button
                onClick={() => onMarkAsIncident(log.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-white"
              >
                <AlertTriangle className="h-4 w-4" />
                Mark as Incident
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
