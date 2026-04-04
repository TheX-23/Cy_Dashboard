"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, RotateCcw } from 'lucide-react';
import { useAlerts } from '@/hooks/use-alerts';
import { AlertsFilters } from '@/components/alerts/alerts-filters';
import { AlertsAnalytics } from '@/components/alerts/alerts-analytics';
import { AlertsTable } from '@/components/alerts/alerts-table';
import { AlertDetailsDrawer } from '@/components/alerts/alert-details-drawer';
import { AlertActions } from '@/components/alerts/alert-actions';
import { Alert, AlertAction, AlertNote, SavedAlertFilter } from '@/types/alerts';

export default function AlertsPage() {
  const {
    alerts,
    analytics,
    filter,
    isLoading,
    isLiveStreaming,
    selectedAlertId,
    updateFilter,
    clearFilter,
    setSelectedAlertId,
    setIsLiveStreaming,
    updateAlertStatus,
    addNote,
    acknowledgeAlert,
    resolveAlert,
    escalateAlert,
    exportAlerts,
    refreshAlerts
  } = useAlerts();

  const [showDetails, setShowDetails] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedAlertFilter[]>([]);

  // Add local state for debugging
  const [isLive, setIsLive] = useState(false);

  // Sync local state with hook state
  useEffect(() => {
    setIsLive(isLiveStreaming);
  }, [isLiveStreaming]);

  // Toggle live streaming with debug logging
  const toggleLive = () => {
    const newState = !isLiveStreaming;
    console.log("Live Stream Toggle:", newState);
    setIsLiveStreaming(newState);
    setIsLive(newState);
  };

  const selectedAlert = alerts.find(alert => alert.id === selectedAlertId);

  const handleAlertSelect = useCallback((alertId: string) => {
    setSelectedAlertId(alertId);
    setShowDetails(true);
  }, [setSelectedAlertId]);

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedAlertId(null);
  }, [setSelectedAlertId]);

  const handleActionExecute = useCallback((alertId: string, action: AlertAction) => {
    console.log('Executing action:', action.type, 'on alert:', alertId);
    // TODO: Implement actual action execution
    if (action.type === 'block_ip') {
      // Implement IP blocking
    } else if (action.type === 'reset_password') {
      // Implement password reset
    } else if (action.type === 'escalate') {
      escalateAlert(alertId);
    }
  }, [escalateAlert]);

  const handleNoteAdd = useCallback((alertId: string, content: string) => {
    const note: Omit<AlertNote, 'id' | 'timestamp'> = {
      author: 'Current User',
      content,
      type: 'note'
    };
    addNote(alertId, note);
  }, [addNote]);

  const handleStatusUpdate = useCallback((alertId: string, status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED') => {
    updateAlertStatus(alertId, status, status === 'INVESTIGATING' ? 'Current User' : undefined);
  }, [updateAlertStatus]);

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
    <main className="min-h-screen p-6">
      <div className="mx-auto w-full max-w-[1800px] space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold text-green-400">Security Alerts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time alert management and response system
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Live Stream Toggle */}
            <button
              onClick={toggleLive}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isLive
                  ? "bg-green-500/20 text-green-400 border border-green-500"
                  : "bg-card text-muted-foreground"
              }`}
            >
              {isLive ? (
                <>
                  <Pause className="h-4 w-4" />
                  Live ON
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
              onClick={refreshAlerts}
              className="flex items-center gap-2 px-4 py-2 bg-card/50 hover:bg-card/70 border border-green-500/30 text-green-400 rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh
            </button>

            {/* Export */}
            <button
              onClick={() => exportAlerts('json')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AlertsFilters
            filter={filter}
            onFilterChange={updateFilter}
            onClear={clearFilter}
            savedFilters={savedFilters}
            onSaveFilter={handleSaveFilter}
          />
        </motion.div>

        {/* Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AlertsAnalytics analytics={analytics} />
        </motion.div>

        {/* Alert Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AlertsTable
            alerts={alerts}
            selectedAlertId={selectedAlertId}
            onAlertSelect={handleAlertSelect}
            onStatusUpdate={handleStatusUpdate}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Alert Actions Panel */}
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <AlertActions
                alert={selectedAlert}
                onActionExecute={handleActionExecute}
                onStatusUpdate={handleStatusUpdate}
                onNoteAdd={handleNoteAdd}
              />
            </div>
          </motion.div>
        )}

        {/* Alert Details Drawer */}
        {selectedAlert && (
          <AlertDetailsDrawer
            alert={selectedAlert}
            onClose={handleCloseDetails}
            onStatusUpdate={handleStatusUpdate}
            onActionExecute={handleActionExecute}
            onNoteAdd={handleNoteAdd}
          />
        )}

        {/* Live Stream Indicator — inset from scrollbar / viewport edge */}
        {isLiveStreaming && (
          <div className="fixed bottom-6 right-8 z-40 flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg neon-pulse sm:right-10">
            <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
            <span className="text-sm font-medium">Live Streaming</span>
          </div>
        )}

      </div>
    </main>
  );
}
