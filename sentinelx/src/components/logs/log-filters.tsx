"use client";

import { useState, useEffect } from 'react';
import { Search, Calendar, Filter, X, Save, RotateCcw } from 'lucide-react';
import { LogFilter, LogLevel, LogSource, EventType, SavedFilter } from '@/types/logs';
import { cn } from '@/lib/utils/cn';

interface LogFiltersProps {
  filter: LogFilter;
  onFilterChange: (filter: Partial<LogFilter>) => void;
  onClear: () => void;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string) => void;
}

const LOG_LEVELS: LogLevel[] = ['INFO', 'WARN', 'ERROR', 'CRITICAL'];
const LOG_SOURCES: LogSource[] = ['API', 'Auth', 'Firewall', 'System', 'Database', 'Network'];
const EVENT_TYPES: EventType[] = ['Login', 'Attack', 'Request', 'DataAccess', 'System', 'Security', 'Error'];

const TIME_RANGES = [
  { value: '5m', label: 'Last 5 minutes' },
  { value: '1h', label: 'Last hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: 'custom', label: 'Custom range' }
] as const;

export function LogFilters({ 
  filter, 
  onFilterChange, 
  onClear, 
  savedFilters = [],
  onSaveFilter 
}: LogFiltersProps) {
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

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'INFO': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'WARN': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'ERROR': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'CRITICAL': return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

  const hasActiveFilters = filter.search || 
    filter.levels?.length > 0 || 
    filter.sources?.length > 0 || 
    filter.eventTypes?.length > 0 || 
    filter.ipAddress || 
    filter.userId || 
    filter.country;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search logs, IP addresses, user IDs, messages..."
          value={searchDebounce}
          onChange={(e) => setSearchDebounce(e?.target?.value || '')}
          className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
        />
        {searchDebounce && (
          <button
            onClick={() => setSearchDebounce('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
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
            value={filter.timeRange}
            onChange={(e) => onFilterChange({ timeRange: e?.target?.value as any })}
            className="appearance-none bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 pr-8"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Log Levels */}
        <div className="flex gap-2">
          {LOG_LEVELS.map(level => (
            <button
              key={level}
              onClick={() => {
                const newLevels = filter.levels.includes(level)
                  ? filter.levels.filter(l => l !== level)
                  : [...filter.levels, level];
                onFilterChange({ levels: newLevels });
              }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200",
                filter.levels.includes(level)
                  ? getLevelColor(level)
                  : "bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50"
              )}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Sources */}
        <div className="relative">
          <select
            value=""
            onChange={(e) => {
              if (e?.target?.value) {
                const newValue = e?.target?.value as LogSource;
                const newSources = filter.sources.includes(newValue)
                  ? filter.sources.filter(s => s !== newValue)
                  : [...filter.sources, newValue];
                onFilterChange({ sources: newSources });
              }
            }}
            className="appearance-none bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
          >
            <option value="">All Sources</option>
            {LOG_SOURCES.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        {/* Event Types */}
        <div className="relative">
          <select
            value=""
            onChange={(e) => {
              if (e?.target?.value) {
                const newValue = e?.target?.value as EventType;
                const newTypes = filter.eventTypes.includes(newValue)
                  ? filter.eventTypes.filter(t => t !== newValue)
                  : [...filter.eventTypes, newValue];
                onFilterChange({ eventTypes: newTypes });
              }
            }}
            className="appearance-none bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
          >
            <option value="">All Events</option>
            {EVENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* IP Address */}
        <input
          type="text"
          placeholder="IP Address"
          value={filter.ipAddress}
          onChange={(e) => onFilterChange({ ipAddress: e?.target?.value || '' })}
          className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
        />

        {/* User ID */}
        <input
          type="text"
          placeholder="User ID"
          value={filter.userId}
          onChange={(e) => onFilterChange({ userId: e?.target?.value || '' })}
          className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
        />

        {/* Actions */}
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Clear filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          
          {onSaveFilter && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
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
          {filter.levels.map(level => (
            <span
              key={level}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border",
                getLevelColor(level)
              )}
            >
              {level}
              <button
                onClick={() => onFilterChange({ levels: filter.levels.filter(l => l !== level) })}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filter.sources.map(source => (
            <span
              key={source}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-800/50 text-slate-300 border border-slate-700/50"
            >
              {source}
              <button
                onClick={() => onFilterChange({ sources: filter.sources.filter(s => s !== source) })}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filter.eventTypes.map(type => (
            <span
              key={type}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-800/50 text-slate-300 border border-slate-700/50"
            >
              {type}
              <button
                onClick={() => onFilterChange({ eventTypes: filter.eventTypes.filter(t => t !== type) })}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filter.ipAddress && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-800/50 text-slate-300 border border-slate-700/50">
              IP: {filter.ipAddress}
              <button
                onClick={() => onFilterChange({ ipAddress: '' })}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filter.userId && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-800/50 text-slate-300 border border-slate-700/50">
              User: {filter.userId}
              <button
                onClick={() => onFilterChange({ userId: '' })}
                className="hover:opacity-70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Saved Filters */}
      {savedFilters?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 font-medium">Saved:</span>
          {savedFilters.map(saved => (
            <button
              key={saved.id}
              onClick={() => onFilterChange(saved.filter)}
              className="px-2 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
            >
              {saved.name}
            </button>
          ))}
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && onSaveFilter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700/50 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Save Filter</h3>
            <input
              type="text"
              placeholder="Filter name..."
              value={saveName}
              onChange={(e) => setSaveName(e?.target?.value || '')}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveName('');
                }}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
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
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
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
