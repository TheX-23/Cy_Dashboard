"use client";

import { useState, useMemo } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChevronRight, Globe, User, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { LogEntry, LogLevel } from '@/types/logs';
import { cn } from '@/lib/utils/cn';

interface LogTableProps {
  logs: LogEntry[];
  selectedLogId: string | null;
  onLogSelect: (logId: string) => void;
  isLoading?: boolean;
}

export function LogTable({ logs, selectedLogId, onLogSelect, isLoading }: LogTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LogEntry;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedLogs = useMemo(() => {
    if (!sortConfig) return logs;

    return [...logs].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [logs, sortConfig]);

  const handleSort = (key: keyof LogEntry) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'desc' };
      }
      if (current.direction === 'desc') {
        return { key, direction: 'asc' };
      }
      return null;
    });
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'INFO': return <CheckCircle className="h-4 w-4" />;
      case 'WARN': return <AlertTriangle className="h-4 w-4" />;
      case 'ERROR': return <XCircle className="h-4 w-4" />;
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'INFO': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'WARN': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'ERROR': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'API': 'text-cyan-400',
      'Auth': 'text-purple-400',
      'Firewall': 'text-red-400',
      'System': 'text-green-400',
      'Database': 'text-blue-400',
      'Network': 'text-orange-400'
    };
    return colors[source] || 'text-slate-400';
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      'Login': 'text-blue-400',
      'Attack': 'text-red-400',
      'Request': 'text-green-400',
      'DataAccess': 'text-purple-400',
      'System': 'text-slate-400',
      'Security': 'text-orange-400',
      'Error': 'text-red-400'
    };
    return colors[eventType] || 'text-slate-400';
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl border border-slate-800/60 p-6">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700/30 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-slate-800/60 overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-slate-700/50 p-4">
        <h3 className="text-lg font-semibold text-slate-100">Log Entries</h3>
        <p className="text-sm text-slate-400 mt-1">{logs.length.toLocaleString()} log entries found</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50 border-b border-slate-700/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('timestamp')}
                  className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Timestamp
                  {sortConfig?.key === 'timestamp' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('level')}
                  className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Level
                  {sortConfig?.key === 'level' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('source')}
                  className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Source
                  {sortConfig?.key === 'source' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('eventType')}
                  className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Event Type
                  {sortConfig?.key === 'eventType' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">IP Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">User ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Message</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map((log) => (
              <tr
                key={log.id}
                className={cn(
                  "border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors cursor-pointer",
                  selectedLogId === log.id && "bg-cyan-500/5 border-cyan-500/20"
                )}
                onClick={() => onLogSelect(log.id)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-sm text-slate-200">
                      {log.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDistanceToNowStrict(log.timestamp, { addSuffix: true })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                    getLevelColor(log.level)
                  )}>
                    {getLevelIcon(log.level)}
                    {log.level}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-sm font-medium", getSourceColor(log.source))}>
                    {log.source}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-sm font-medium", getEventTypeColor(log.eventType))}>
                    {log.eventType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-slate-400" />
                    <span className="text-sm text-slate-200 font-mono">{log.ipAddress}</span>
                  </div>
                  {log.metadata.country && (
                    <div className="text-xs text-slate-400">{log.metadata.country}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {log.userId ? (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-slate-400" />
                      <span className="text-sm text-slate-200">{log.userId}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">System</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="text-sm text-slate-200 truncate" title={log.message}>
                      {log.message}
                    </p>
                    {log.isAnomaly && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3 text-orange-400" />
                        <span className="text-xs text-orange-400">Anomaly detected</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-slate-400">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No logs found</p>
            <p className="text-sm">Try adjusting your filters or search criteria</p>
          </div>
        </div>
      )}
    </div>
  );
}
