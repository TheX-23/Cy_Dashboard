"use client";

import { useState, useMemo, useCallback } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChevronRight, ChevronLeft, Globe, User, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { LogEntry, LogLevel } from '@/types/logs';
import { cn } from '@/lib/utils/cn';

interface LogTableProps {
  logs: LogEntry[];
  selectedLogId: string | null;
  onLogSelect: (logId: string) => void;
  isLoading?: boolean;
}

const PAGE_SIZE = 50;

const LEVEL_COLORS: Record<LogLevel, string> = {
  INFO:     'text-blue-400 bg-blue-500/10 border-blue-500/20',
  WARN:     'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  ERROR:    'text-orange-400 bg-orange-500/10 border-orange-500/20',
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const SOURCE_COLORS: Record<string, string> = {
  API:      'text-cyan-400',
  Auth:     'text-purple-400',
  Firewall: 'text-red-400',
  System:   'text-green-400',
  Database: 'text-blue-400',
  Network:  'text-orange-400',
};

const EVENT_COLORS: Record<string, string> = {
  Login:      'text-blue-400',
  Attack:     'text-red-400',
  Request:    'text-green-400',
  DataAccess: 'text-purple-400',
  System:     'text-slate-400',
  Security:   'text-orange-400',
  Error:      'text-red-400',
};

function LevelIcon({ level }: { level: LogLevel }) {
  if (level === 'INFO')     return <CheckCircle  className="h-4 w-4" />;
  if (level === 'WARN')     return <AlertTriangle className="h-4 w-4" />;
  if (level === 'ERROR')    return <XCircle       className="h-4 w-4" />;
  if (level === 'CRITICAL') return <AlertTriangle className="h-4 w-4" />;
  return null;
}

export function LogTable({ logs, selectedLogId, onLogSelect, isLoading }: LogTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof LogEntry; direction: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages - 1);

  const sortedLogs = useMemo(() => {
    if (!sortConfig) return logs;
    return [...logs].sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
      if (av > bv) return sortConfig.direction === 'asc' ?  1 : -1;
      return 0;
    });
  }, [logs, sortConfig]);

  const visibleLogs = useMemo(() => {
    const start = clampedPage * PAGE_SIZE;
    return sortedLogs.slice(start, start + PAGE_SIZE);
  }, [sortedLogs, clampedPage]);

  const handleSort = useCallback((key: keyof LogEntry) => {
    setSortConfig(cur => {
      if (!cur || cur.key !== key) return { key, direction: 'desc' };
      if (cur.direction === 'desc')  return { key, direction: 'asc' };
      return null;
    });
    setPage(0);
  }, []);

  const SortArrow = ({ col }: { col: keyof LogEntry }) =>
    sortConfig?.key === col
      ? <span className="text-cyan-400">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
      : null;

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
              <div className="h-3 bg-secondary rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">

      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Log Entries</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{logs.length.toLocaleString()} entries</p>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              disabled={clampedPage === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-foreground tabular-nums">{clampedPage + 1} / {totalPages}</span>
            <button
              disabled={clampedPage >= totalPages - 1}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary dark:bg-gray-800 border-b border-border">
            <tr>
              {[
                { label: 'Timestamp',  col: 'timestamp'  as keyof LogEntry },
                { label: 'Level',      col: 'level'      as keyof LogEntry },
                { label: 'Source',     col: 'source'     as keyof LogEntry },
                { label: 'Event Type', col: 'eventType'  as keyof LogEntry },
              ].map(({ label, col }) => (
                <th key={col} className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort(col)}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label} <SortArrow col={col} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">IP Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Message</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">→</th>
            </tr>
          </thead>
          <tbody>
            {visibleLogs.map(log => (
              <tr
                key={log.id}
                onClick={() => onLogSelect(log.id)}
                className={cn(
                  'border-b border-border cursor-pointer transition-colors hover:bg-secondary/50 dark:hover:bg-slate-800/40',
                  selectedLogId === log.id && 'bg-blue-500/5 border-blue-500/20'
                )}
              >
                {/* Timestamp */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    {log.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNowStrict(log.timestamp, { addSuffix: true })}
                  </div>
                </td>

                {/* Level */}
                <td className="px-4 py-3">
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', LEVEL_COLORS[log.level])}>
                    <LevelIcon level={log.level} />
                    {log.level}
                  </span>
                </td>

                {/* Source */}
                <td className="px-4 py-3 text-sm font-medium">
                  <span className={SOURCE_COLORS[log.source] ?? 'text-muted-foreground'}>
                    {log.source}
                  </span>
                </td>

                {/* Event Type */}
                <td className="px-4 py-3 text-sm font-medium">
                  <span className={EVENT_COLORS[log.eventType] ?? 'text-muted-foreground'}>
                    {log.eventType}
                  </span>
                </td>

                {/* IP */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-sm font-mono text-foreground">{log.ipAddress}</span>
                  </div>
                  {log.metadata.country && (
                    <div className="text-xs text-muted-foreground mt-0.5">{log.metadata.country}</div>
                  )}
                </td>

                {/* User ID */}
                <td className="px-4 py-3">
                  {log.userId ? (
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">{log.userId}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">System</span>
                  )}
                </td>

                {/* Message */}
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm text-foreground truncate" title={log.message}>{log.message}</p>
                  {log.isAnomaly && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="h-3 w-3 text-orange-400" />
                      <span className="text-xs text-orange-400">Anomaly</span>
                    </div>
                  )}
                </td>

                {/* Arrow */}
                <td className="px-4 py-3 text-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer pagination */}
      {logs.length > PAGE_SIZE && (
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {clampedPage * PAGE_SIZE + 1}–{Math.min((clampedPage + 1) * PAGE_SIZE, logs.length)} of {logs.length.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            {['First', 'Prev', 'Next', 'Last'].map(label => (
              <button
                key={label}
                disabled={
                  (label === 'First' || label === 'Prev') ? clampedPage === 0
                  : clampedPage >= totalPages - 1
                }
                onClick={() => {
                  if (label === 'First') setPage(0);
                  if (label === 'Prev')  setPage(p => Math.max(0, p - 1));
                  if (label === 'Next')  setPage(p => Math.min(totalPages - 1, p + 1));
                  if (label === 'Last')  setPage(totalPages - 1);
                }}
                className="px-2 py-0.5 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-1">No logs found</p>
          <p className="text-sm">Try adjusting your filters or search criteria</p>
        </div>
      )}
    </div>
  );
}
