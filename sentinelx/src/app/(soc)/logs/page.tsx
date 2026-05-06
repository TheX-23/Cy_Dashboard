"use client";

import { useState, useCallback } from 'react';
import { Play, Pause, Download, RotateCcw } from 'lucide-react';
import { useLogs } from '@/hooks/use-logs';
import { LogFilters } from '@/components/logs/log-filters';
import { LogAnalytics } from '@/components/logs/log-analytics';
import { LogTable } from '@/components/logs/log-table';
import { LogDetailsDrawer } from '@/components/logs/log-details-drawer';
import { LogEntry } from '@/types/logs';

export default function LogsPage() {
  const {
    logs,
    analytics,
    filter,
    isLoading,
    isLiveStreaming,
    selectedLogId,
    updateFilter,
    clearFilter,
    setSelectedLogId,
    setIsLiveStreaming,
    exportLogs,
    refreshLogs
  } = useLogs();

  const [showDetails, setShowDetails] = useState(false);
  const [savedFilters, setSavedFilters] = useState<Array<{
    id: string;
    name: string;
    filter: any;
    createdAt: Date;
    isDefault: boolean;
  }>>([]);

  const selectedLog = logs.find(log => log.id === selectedLogId);

  const handleLogSelect = useCallback((logId: string) => {
    setSelectedLogId(logId);
    setShowDetails(true);
  }, [setSelectedLogId]);

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedLogId(null);
  }, [setSelectedLogId]);

  const handleMarkAsIncident = useCallback((logId: string) => {
    // TODO: Implement incident creation
    console.log('Mark as incident:', logId);
  }, []);

  const handleExportLog = useCallback((log: LogEntry, format: 'json' | 'csv') => {
    const data = format === 'json' 
      ? JSON.stringify(log, null, 2)
      : `${log.timestamp},${log.level},${log.source},${log.eventType},${log.ipAddress},${log.userId || ''},${log.message}`;
    
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log-${log.id}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleSaveFilter = useCallback((name: string) => {
    const newFilter = {
      id: Date.now().toString(),
      name,
      filter: { ...filter },
      createdAt: new Date(),
      isDefault: false
    };
    setSavedFilters(prev => [...prev, newFilter]);
  }, [filter]);

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto w-full max-w-[1800px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Log Explorer</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Advanced log analysis and real-time monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Live Stream Toggle */}
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLiveStreaming
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isLiveStreaming ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause Stream
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Live Stream
                </>
              )}
            </button>

            {/* Refresh */}
            <button
              onClick={refreshLogs}
              className="flex items-center gap-2 px-4 py-2 bg-secondary dark:bg-gray-800 hover:bg-accent text-foreground border border-border rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh
            </button>

            {/* Export */}
            <button
              onClick={() => exportLogs('json')}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors text-white"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div>
          <LogFilters
            filter={filter}
            onFilterChange={updateFilter}
            onClear={clearFilter}
            savedFilters={savedFilters}
            onSaveFilter={handleSaveFilter}
          />
        </div>

        {/* Analytics */}
        <div>
          <LogAnalytics analytics={analytics} />
        </div>

        {/* Log Table */}
        <div>
          <LogTable
            logs={logs}
            selectedLogId={selectedLogId}
            onLogSelect={handleLogSelect}
            isLoading={isLoading}
          />
        </div>

        {/* Log Details Drawer */}
        {selectedLog && (
          <LogDetailsDrawer
            log={selectedLog}
            onClose={handleCloseDetails}
            onMarkAsIncident={handleMarkAsIncident}
            onExport={handleExportLog}
          />
        )}

        {/* Live Stream Indicator */}
        {isLiveStreaming && (
          <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Streaming</span>
          </div>
        )}
      </div>
    </main>
  );
}
