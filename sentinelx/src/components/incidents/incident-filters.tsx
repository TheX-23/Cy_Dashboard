"use client";

import { useState, useEffect } from 'react';
import { Search, Calendar, Filter, X, Save, RotateCcw } from 'lucide-react';
import { IncidentFilter, IncidentSeverity, IncidentStatus, IncidentImpact } from '@/types/incidents';
import { cn } from '@/lib/utils/cn';

interface IncidentFiltersProps {
  filter: IncidentFilter;
  onFilterChange: (filter: Partial<IncidentFilter>) => void;
  onClear: () => void;
  savedFilters?: any[];
  onSaveFilter?: (name: string) => void;
}

const INCIDENT_SEVERITIES: IncidentSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const INCIDENT_STATUSES: IncidentStatus[] = ['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED'];
const INCIDENT_IMPACTS: IncidentImpact[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TIME_RANGES = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' }
] as const;

export function IncidentFilters({ 
  filter, 
  onFilterChange, 
  onClear, 
  savedFilters = [],
  onSaveFilter 
}: IncidentFiltersProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [searchDebounce, setSearchDebounce] = useState(filter.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: searchDebounce });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDebounce, onFilterChange]);

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20';
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

  const getImpactColor = (impact: IncidentImpact) => {
    switch (impact) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const hasActiveFilters = filter.search || 
    filter.severity?.length > 0 || 
    filter.status?.length > 0 || 
    filter.impact?.length > 0 || 
    filter.assignedTo ||
    filter.tags?.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
        <input
          type="text"
          placeholder="Search incidents by ID, title, IP, user, or keyword..."
          value={searchDebounce}
          onChange={(e) => setSearchDebounce(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 input-cyber"
        />
        {searchDebounce && (
          <button
            onClick={() => setSearchDebounce('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-green-400"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Time Range */}
        <div className="relative">
          <select
            value={filter.dateRange}
            onChange={(e) => onFilterChange({ dateRange: e.target.value as any })}
            className="appearance-none bg-black/50 border border-green-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 pr-8"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400 pointer-events-none" />
        </div>

        {/* Severity */}
        <div className="flex gap-2">
          {INCIDENT_SEVERITIES.map(severity => (
            <button
              key={severity}
              onClick={() => {
                const newSeverities = filter.severity.includes(severity)
                  ? filter.severity.filter(s => s !== severity)
                  : [...filter.severity, severity];
                onFilterChange({ severity: newSeverities });
              }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200",
                filter.severity.includes(severity)
                  ? getSeverityColor(severity)
                  : "bg-black/50 text-slate-400 border-green-500/30 hover:bg-green-500/10"
              )}
            >
              {severity}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                const newStatus = filter.status.includes(e.target.value as IncidentStatus)
                  ? filter.status.filter(s => s !== e.target.value)
                  : [...filter.status, e.target.value as IncidentStatus];
                onFilterChange({ status: newStatus });
              }
            }}
            className="appearance-none bg-black/50 border border-green-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
          >
            <option value="">All Status</option>
            {INCIDENT_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Impact */}
        <div className="flex gap-2">
          {INCIDENT_IMPACTS.map(impact => (
            <button
              key={impact}
              onClick={() => {
                const newImpacts = filter.impact.includes(impact)
                  ? filter.impact.filter(i => i !== impact)
                  : [...filter.impact, impact];
                onFilterChange({ impact: newImpacts });
              }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200",
                filter.impact.includes(impact)
                  ? getImpactColor(impact)
                  : "bg-black/50 text-slate-400 border-green-500/30 hover:bg-green-500/10"
              )}
            >
              {impact}
            </button>
          ))}
        </div>

        {/* Assigned To */}
        <input
          type="text"
          placeholder="Assigned to..."
          value={filter.assignedTo}
          onChange={(e) => onFilterChange({ assignedTo: e.target.value })}
          className="bg-black/50 border border-green-500/30 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
        />

        {/* Actions */}
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
              title="Clear filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          
          {onSaveFilter && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
              title="Save filter"
            >
              <Save className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filter.severity.map(severity => (
            <span
              key={severity}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getSeverityColor(severity)}`}
            >
              {severity}
              <button
                onClick={() => onFilterChange({ severity: filter.severity.filter(s => s !== severity) })}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filter.status.map(status => (
            <span
              key={status}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-black/50 text-green-400 border border-green-500/30"
            >
              {status}
              <button
                onClick={() => onFilterChange({ status: filter.status.filter(s => s !== status) })}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filter.impact.map(impact => (
            <span
              key={impact}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-black/50 text-green-400 border border-green-500/30"
            >
              {impact}
              <button
                onClick={() => onFilterChange({ impact: filter.impact.filter(i => i !== impact) })}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filter.assignedTo && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-black/50 text-green-400 border border-green-500/30">
              Assigned: {filter.assignedTo}
              <button
                onClick={() => onFilterChange({ assignedTo: '' })}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-green-400 font-medium">Saved:</span>
          {savedFilters.map(saved => (
            <button
              key={saved.id}
              onClick={() => onFilterChange(saved.filter)}
              className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
            >
              {saved.name}
            </button>
          ))}
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && onSaveFilter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 border border-green-500/30 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-green-400 mb-4">Save Incident Filter</h3>
            <input
              type="text"
              placeholder="Filter name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveName('');
                }}
                className="px-4 py-2 text-slate-400 hover:text-green-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (saveName.trim()) {
                    onSaveFilter(saveName.trim());
                    setShowSaveDialog(false);
                    setSaveName('');
                  }
                }}
                className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
