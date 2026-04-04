"use client";

import { useState, useMemo } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChevronRight, AlertTriangle, Clock, CheckCircle, Shield, Target, User, Globe, MapPin, Activity } from 'lucide-react';
import { Incident, IncidentSeverity, IncidentStatus } from '@/types/incidents';
import { cn } from '@/lib/utils/cn';

interface IncidentsTableProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onIncidentSelect: (incidentId: string) => void;
  onStatusUpdate: (incidentId: string, status: IncidentStatus) => void;
  isLoading?: boolean;
}

export function IncidentsTable({ 
  incidents, 
  selectedIncidentId, 
  onIncidentSelect, 
  onStatusUpdate, 
  isLoading 
}: IncidentsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Incident;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedIncidents = useMemo(() => {
    if (!sortConfig) return incidents;

    return [...incidents].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [incidents, sortConfig]);

  const handleSort = (key: keyof Incident) => {
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

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20 neon-pulse';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'OPEN': return 'text-red-400';
      case 'INVESTIGATING': return 'text-yellow-400';
      case 'CONTAINED': return 'text-blue-400';
      case 'RESOLVED': return 'text-green-400';
      case 'CLOSED': return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case 'OPEN': return <AlertTriangle className="h-4 w-4" />;
      case 'INVESTIGATING': return <Clock className="h-4 w-4" />;
      case 'CONTAINED': return <Shield className="h-4 w-4" />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4" />;
      case 'CLOSED': return <Target className="h-4 w-4" />;
    }
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
    <div className="bg-[#111827] border border-gray-700 rounded-xl overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="border-b border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white">Security Incidents</h3>
        <p className="text-sm text-gray-400 mt-1">{incidents.length.toLocaleString()} incidents found</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                >
                  ID
                  {sortConfig?.key === 'id' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Title
                  {sortConfig?.key === 'title' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('severity')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
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
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Status
                  {sortConfig?.key === 'status' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Created
                  {sortConfig?.key === 'createdAt' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">Assets</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-300">Alerts</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedIncidents.map((incident) => (
              <tr
                key={incident.id}
                className={cn(
                  "border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer",
                  selectedIncidentId === incident.id && "bg-gray-800 border-gray-600"
                )}
                onClick={() => onIncidentSelect(incident.id)}
              >
                <td className="px-4 py-3">
                  <span className="text-sm text-white font-mono">{incident.id}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-white font-medium">{incident.title}</p>
                    <p className="text-xs text-slate-400 truncate max-w-xs" title={incident.description}>
                      {incident.description}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                    getSeverityColor(incident.severity)
                  )}>
                    {incident.severity}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(incident.status)}
                    <span className={cn("text-sm font-medium", getStatusColor(incident.status))}>
                      {incident.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-white">
                      {incident.createdAt.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNowStrict(incident.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {incident.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-slate-400" />
                      <span className="text-sm text-white">{incident.assignedToName || incident.assignedTo}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-slate-400" />
                    <span className="text-sm text-white">{incident.affectedAssets.length}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-slate-400" />
                    <span className="text-sm text-white">{incident.linkedAlerts.length}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {incident.status === 'OPEN' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusUpdate(incident.id, 'INVESTIGATING');
                          }}
                          className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                          title="Start Investigation"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusUpdate(incident.id, 'CONTAINED');
                          }}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Contain Incident"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusUpdate(incident.id, 'RESOLVED');
                          }}
                          className="p-1 text-green-400 hover:text-green-300 transition-colors"
                          title="Resolve Incident"
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

      {incidents.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-slate-400">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No incidents found</p>
            <p className="text-sm">Try adjusting your filters or search criteria</p>
          </div>
        </div>
      )}
    </div>
  );
}
