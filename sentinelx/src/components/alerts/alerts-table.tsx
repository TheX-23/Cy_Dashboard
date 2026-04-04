"use client";

import { useState, useMemo } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChevronRight, AlertTriangle, Shield, Clock, CheckCircle, User, Globe, MapPin } from 'lucide-react';
import { Alert, AlertSeverity, AlertStatus } from '@/types/alerts';
import { cn } from '@/lib/utils/cn';

interface AlertsTableProps {
  alerts: Alert[];
  selectedAlertId: string | null;
  onAlertSelect: (alertId: string) => void;
  onStatusUpdate: (alertId: string, status: AlertStatus) => void;
  isLoading?: boolean;
}

export function AlertsTable({ alerts, selectedAlertId, onAlertSelect, onStatusUpdate, isLoading }: AlertsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Alert;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedAlerts = useMemo(() => {
    if (!sortConfig) return alerts;

    return [...alerts].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [alerts, sortConfig]);

  const handleSort = (key: keyof Alert) => {
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

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20 neon-pulse';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'OPEN': return 'text-red-400';
      case 'INVESTIGATING': return 'text-yellow-400';
      case 'RESOLVED': return 'text-green-400';
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'OPEN': return <AlertTriangle className="h-4 w-4" />;
      case 'INVESTIGATING': return <Clock className="h-4 w-4" />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4" />;
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

  if (isLoading) {
    return (
      <div className="glass-neon rounded-xl border border-green-500/30 p-6">
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
    <div className="glass-neon rounded-xl border border-green-500/30 overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-green-500/20 p-4">
        <h3 className="text-lg font-semibold text-green-400">Security Alerts</h3>
        <p className="text-sm text-slate-400 mt-1">{alerts.length.toLocaleString()} alerts found</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/50 border-b border-green-500/20">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('severity')}
                  className="flex items-center gap-2 text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  Severity
                  {sortConfig?.key === 'severity' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  Alert Title
                  {sortConfig?.key === 'title' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('source')}
                  className="flex items-center gap-2 text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
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
                  onClick={() => handleSort('timestamp')}
                  className="flex items-center gap-2 text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  Timestamp
                  {sortConfig?.key === 'timestamp' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Affected Asset</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-green-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAlerts.map((alert) => (
              <tr
                key={alert.id}
                className={cn(
                  "border-b border-green-500/10 hover:bg-green-500/5 transition-colors cursor-pointer",
                  selectedAlertId === alert.id && "bg-green-500/10 border-green-500/30"
                )}
                onClick={() => onAlertSelect(alert.id)}
              >
                <td className="px-4 py-3">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                    getSeverityColor(alert.severity)
                  )}>
                    {alert.severity}
                  </div>
                  {alert.isAnomaly && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3 text-orange-400" />
                      <span className="text-xs text-orange-400">Anomaly</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-white font-medium">{alert.title}</p>
                    <p className="text-xs text-slate-400 truncate max-w-xs" title={alert.description}>
                      {alert.description}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-sm font-medium", getSourceColor(alert.source))}>
                    {alert.source}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-white">
                      {alert.timestamp.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNowStrict(alert.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(alert.status)}
                    <span className={cn("text-sm font-medium", getStatusColor(alert.status))}>
                      {alert.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {alert.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-slate-400" />
                      <span className="text-sm text-white">{alert.assignedTo}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <div className="flex items-center gap-2">
                      {alert.affectedAsset.type === 'IP' && <Globe className="h-3 w-3 text-slate-400" />}
                      {alert.affectedAsset.type === 'User' && <User className="h-3 w-3 text-slate-400" />}
                      <span className="text-sm text-white font-mono">{alert.affectedAsset?.value || 'Unknown'}</span>
                    </div>
                    {alert.affectedAsset.details?.country && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400">
                          {alert.affectedAsset.details.country}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {alert.status === 'OPEN' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusUpdate(alert.id, 'INVESTIGATING');
                          }}
                          className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Acknowledge"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusUpdate(alert.id, 'RESOLVED');
                          }}
                          className="p-1 text-green-400 hover:text-green-300 transition-colors"
                          title="Resolve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <ChevronRight className="h-4 w-4 text-green-400" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {alerts.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-slate-400">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No alerts found</p>
            <p className="text-sm">Try adjusting your filters or search criteria</p>
          </div>
        </div>
      )}
    </div>
  );
}
