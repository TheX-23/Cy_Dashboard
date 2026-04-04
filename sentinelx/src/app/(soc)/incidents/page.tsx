"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, RotateCcw, Bell, AlertTriangle } from 'lucide-react';
import { useIncidents } from '@/hooks/use-incidents';
import { IncidentFilters } from '@/components/incidents/incident-filters';
import { IncidentAnalytics } from '@/components/incidents/incident-analytics';
import { IncidentsTable } from '@/components/incidents/incidents-table';
import { IncidentDetails } from '@/components/incidents/incident-details';
import { Incident, IncidentStatus } from '@/types/incidents';

export default function IncidentsPage() {
  const {
    incidents,
    analytics,
    filter,
    isLoading,
    selectedIncidentId,
    updateFilter,
    clearFilter,
    setSelectedIncidentId,
    updateIncidentStatus,
    addNote,
    exportIncidents,
    refreshIncidents
  } = useIncidents();

  const [showDetails, setShowDetails] = useState(false);
  const [savedFilters, setSavedFilters] = useState<any[]>([]);

  // Add live streaming state
  const [isLive, setIsLive] = useState(false);
  const [liveIncidents, setLiveIncidents] = useState<any[]>([]);

  // Prevent accessing analytics if it's undefined
  if (!analytics || isLoading) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-foreground">Loading incidents...</div>
          </div>
        </div>
      </main>
    );
  }

  // Toggle live streaming
  const toggleLive = () => {
    const newState = !isLive;
    console.log("Incidents Live Stream Toggle:", newState);
    setIsLive(newState);
  };

  // Real-time incident updates
  useEffect(() => {
    if (!isLive) return;

    console.log("Starting incidents live stream...");
    const interval = setInterval(() => {
      const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
      const incidentTypes = ["Brute Force Attack", "Data Breach", "Malware Detection", "Suspicious Login", "Unauthorized Access", "DDoS Attack"];
      
      const newIncident = {
        id: Date.now().toString(),
        title: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        time: "Just now",
        status: "OPEN",
        description: "New security incident detected by automated monitoring systems."
      };

      console.log("Adding new incident:", newIncident.title);
      setLiveIncidents(prev => {
        const updated = [newIncident, ...prev.slice(0, 20)];
        console.log("Live incidents count:", updated.length);
        return updated;
      });
    }, 3000);

    return () => {
      console.log("Clearing incidents live stream interval");
      clearInterval(interval);
    };
  }, [isLive]);

  const selectedIncident = incidents.find(incident => incident.id === selectedIncidentId);

  const handleIncidentSelect = useCallback((incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setShowDetails(true);
  }, [setSelectedIncidentId]);

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedIncidentId(null);
  }, [setSelectedIncidentId]);

  const handleStatusUpdate = useCallback((incidentId: string, status: IncidentStatus) => {
    updateIncidentStatus(incidentId, status);
  }, [updateIncidentStatus]);

  const handleNoteAdd = useCallback((incidentId: string, content: string) => {
    addNote(incidentId, {
      author: 'Current User',
      content,
      type: 'note'
    });
  }, [addNote]);

  const handleEvidenceAdd = useCallback((incidentId: string, file: File) => {
    // TODO: Implement evidence upload
    console.log('Adding evidence:', file, 'to incident:', incidentId);
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
    <main className="min-h-screen bg-background w-full overflow-x-hidden transform-gpu">
      <div className="max-w-[1800px] mx-auto w-full p-6">
        <div className="grid grid-cols-12 gap-4 w-full">
        {/* Header */}
        <div className="col-span-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between w-full transform-gpu"
          >
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Incident Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Security incident tracking and response system
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Live Stream Toggle */}
              <button
                onClick={toggleLive}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors transform-gpu ${
                  isLive
                    ? "bg-green-500/20 text-green-400 border border-green-500"
                    : "bg-gray-700 text-gray-300"
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
                onClick={refreshIncidents}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Refresh
              </button>

              {/* Export */}
              <button
                onClick={() => exportIncidents('json')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="col-span-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <IncidentFilters
              filter={filter}
              onFilterChange={updateFilter}
              onClear={clearFilter}
              savedFilters={savedFilters}
              onSaveFilter={handleSaveFilter}
            />
          </motion.div>
        </div>

        {/* Analytics Chart Section */}
        <div className="col-span-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full h-full transform-gpu"
          >
            {analytics ? <IncidentAnalytics analytics={analytics} /> : (
              <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm w-full h-[300px] flex items-center justify-center">
                <div className="text-gray-400">Loading analytics...</div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Stats Cards Section */}
        <div className="col-span-4 w-full">
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <AlertTriangle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Critical</h4>
                  <p className="text-xs text-gray-400">High priority</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {analytics?.criticalIncidents || 0}
              </div>
              <div className="text-xs text-gray-400">
                Need immediate attention
              </div>
            </div>

            <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Bell className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Escalated</h4>
                  <p className="text-xs text-gray-400">Requires escalation</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {analytics?.openIncidents || 0}
              </div>
              <div className="text-xs text-gray-400">
                Currently being investigated
              </div>
            </div>

            <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Play className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">In Progress</h4>
                  <p className="text-xs text-gray-400">Currently being handled</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {analytics?.openIncidents || 0}
              </div>
              <div className="text-xs text-gray-400">
                Being investigated
              </div>
            </div>

            <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <RotateCcw className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">Resolved</h4>
                  <p className="text-xs text-gray-400">Successfully closed</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {analytics ? Math.floor((analytics.resolutionRate || 0) * (analytics.totalIncidents || 0) / 100) || 0 : 0}
              </div>
              <div className="text-xs text-gray-400">
                This week
              </div>
            </div>
          </div>
        </div>

        {/* Live Incidents Feed */}
        {isLive && (
          <div className="col-span-12 w-full">
            <div className="bg-[#111827] border border-green-500/30 rounded-xl p-5 shadow-sm w-full">
              <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Incidents Feed
              </h3>
              <div className="space-y-3 h-96 overflow-auto">
                {liveIncidents.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    Waiting for live incidents...
                  </div>
                ) : (
                  liveIncidents.map((incident) => (
                    <div key={incident.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{incident.title}</h4>
                          <p className="text-gray-400 text-sm mt-1">{incident.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            incident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                            incident.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                            incident.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {incident.severity}
                          </span>
                          <p className="text-gray-400 text-xs mt-1">{incident.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top Incident Types */}
        <div className="col-span-12 w-full">
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Top Incident Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
              <div className="text-center p-4 bg-gray-800 rounded-lg w-full">
                <div className="text-2xl font-bold text-red-400 mb-2">Malware</div>
                <div className="text-sm text-gray-400">42 incidents</div>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg w-full">
                <div className="text-2xl font-bold text-orange-400 mb-2">Phishing</div>
                <div className="text-sm text-gray-400">38 incidents</div>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg w-full">
                <div className="text-2xl font-bold text-yellow-400 mb-2">DDoS</div>
                <div className="text-sm text-gray-400">25 incidents</div>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg w-full">
                <div className="text-2xl font-bold text-blue-400 mb-2">Injection</div>
                <div className="text-sm text-gray-400">18 incidents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Incident Table */}
        <div className="col-span-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <IncidentsTable
              incidents={incidents}
              selectedIncidentId={selectedIncidentId}
              onIncidentSelect={handleIncidentSelect}
              onStatusUpdate={handleStatusUpdate}
              isLoading={isLoading}
            />
          </motion.div>
        </div>

        {/* Incident Details Drawer */}
        {selectedIncident && (
          <IncidentDetails
            incident={selectedIncident}
            onClose={handleCloseDetails}
            onStatusUpdate={handleStatusUpdate}
            onNoteAdd={handleNoteAdd}
            onEvidenceAdd={handleEvidenceAdd}
          />
        )}
        </div>
      </div>
    </main>
  );
}
