"use client";

import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Shield, Activity, AlertTriangle } from 'lucide-react';
import { useDashboard } from '@/hooks/use-dashboard';

// Import new dashboard components
import { KPICards } from '@/components/dashboard/KPICards';
import { ThreatTrendChart } from '@/components/dashboard/ThreatTrendChart';
import MapWrapper from '@/components/maps/MapWrapper';
import { AlertsFeed } from '@/components/dashboard/AlertsFeed';
import { IncidentsList } from '@/components/dashboard/IncidentsList';
import { ThreatDistribution } from '@/components/dashboard/ThreatDistribution';
import { TopIPs } from '@/components/dashboard/TopIPs';
import { HeaderThreatToggle } from '@/components/dashboard/HeaderThreatToggle';
import { ThreatNewsPanel } from '@/components/dashboard/ThreatNewsPanel';
import { SystemHealth } from '@/components/dashboard/SystemHealth';

// Mock data fallbacks
const mockTrendData = [
  { time: '00:00', threats: 120, mitigated: 95 },
  { time: '04:00', threats: 145, mitigated: 120 },
  { time: '08:00', threats: 189, mitigated: 165 },
  { time: '12:00', threats: 234, mitigated: 198 },
  { time: '16:00', threats: 198, mitigated: 176 },
  { time: '20:00', threats: 156, mitigated: 134 },
  { time: '23:59', threats: 142, mitigated: 118 },
];

const mockAlerts = [
  { id: 1, type: 'SQL Injection', severity: 'critical' as const, source: '192.168.1.100', time: '2 min ago' },
  { id: 2, type: 'DDoS Attack', severity: 'high' as const, source: '10.0.0.50', time: '5 min ago' },
  { id: 3, type: 'Malware', severity: 'medium' as const, source: '172.16.0.1', time: '12 min ago' },
];

const mockIncidents = [
  { id: 1, title: 'Critical SQL Injection Attack', status: 'active' as const, severity: 'critical' as const, time: '10 min ago' },
  { id: 2, title: 'DDoS Attack on Web Server', status: 'investigating' as const, severity: 'high' as const, time: '25 min ago' },
  { id: 3, title: 'Suspicious Login Attempts', status: 'contained' as const, severity: 'medium' as const, time: '1 hour ago' },
];

const mockThreatData = [
  { name: 'SQL Injection', value: 35, color: '#ef4444' },
  { name: 'XSS', value: 25, color: '#f97316' },
  { name: 'Malware', value: 20, color: '#eab308' },
  { name: 'Phishing', value: 15, color: '#22c55e' },
  { name: 'Other', value: 5, color: '#64748b' },
];

const mockTopIPs = [
  { ip: '192.168.1.100', attacks: 45, country: 'US' },
  { ip: '10.0.0.50', attacks: 32, country: 'CN' },
  { ip: '172.16.0.1', attacks: 28, country: 'RU' },
  { ip: '203.0.113.42', attacks: 21, country: 'BR' },
];

// Isolated Ticker component to prevent full page re-renders
const LastUpdatedTicker = memo(({ date, mounted }: { date: Date | null, mounted: boolean }) => (
  <div className="mt-2 text-xs text-muted-foreground">
    Last updated: {mounted && date ? date.toLocaleString() : 'Loading...'}
  </div>
));
LastUpdatedTicker.displayName = 'LastUpdatedTicker';

export default function DashboardPage() {
  const {
    stats,
    trends,
    activityFeed,
    recentAlerts,
    systemHealth,
    isLoading,
    error,
    isConnected,
    isOffline,
    refresh
  } = useDashboard();

  const [isNewsPanelOpen, setIsNewsPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Route protection
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    if (stats || systemHealth) {
      setLastUpdate(new Date());
    }
  }, [stats, systemHealth]);

  const handleRefresh = async () => {
    try {
      await refresh();
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const kpiData = {
    totalThreats: stats?.total_detections ?? 0,
    activeAlerts: stats?.total_alerts ?? 0,
    openIncidents: stats?.open_incidents ?? 0,
    systemHealth: systemHealth?.metrics
      ? Math.round(100 - (systemHealth.metrics.cpu_usage + systemHealth.metrics.memory_usage) / 4)
      : systemHealth
        ? Math.round(100 - (systemHealth.cpu_usage + systemHealth.memory_usage) / 4)
        : 98.5,
    rps: systemHealth?.active_connections ?? 15420
  };

  const chartTrendData = trends && trends.length > 0
    ? trends.map(t => ({
      time: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      threats: t.critical + t.high + t.medium + t.low,
      mitigated: Math.floor((t.critical + t.high + t.medium + t.low) * 0.85)
    }))
    : mockTrendData;

  const distributionData = stats
    ? [
      { name: 'Critical', value: stats.critical_alerts, color: '#ef4444' },
      { name: 'High', value: stats.high_alerts, color: '#f97316' },
      { name: 'Medium', value: stats.medium_alerts, color: '#eab308' },
      { name: 'Low', value: stats.low_alerts, color: '#22c55e' },
    ]
    : mockThreatData;

  const alertsData = recentAlerts && recentAlerts.length > 0
    ? recentAlerts.map((a: any) => ({
      id: a.id,
      type: a.title,
      severity: a.severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
      source: a.source_ip || 'Internal',
      time: new Date(a.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }))
    : mockAlerts;

  const incidentsData = activityFeed && activityFeed.length > 0
    ? activityFeed
      .filter((act: any) => act.type === 'incident')
      .map((act: any) => ({
        id: act.id,
        title: act.title,
        status: act.status as 'active' | 'investigating' | 'contained' | 'resolved',
        severity: act.severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
        time: new Date(act.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      }))
    : mockIncidents;

  const healthData = {
    cpu: systemHealth?.metrics?.cpu_usage ?? systemHealth?.cpu_usage ?? 45.2,
    memory: systemHealth?.metrics?.memory_usage ?? systemHealth?.memory_usage ?? 67.8,
    disk: systemHealth?.metrics?.disk_usage ?? systemHealth?.disk_usage ?? 34.1,
    network: systemHealth?.metrics?.network_latency ?? systemHealth?.network_latency ?? 12.3,
    uptime: systemHealth?.uptime ?? '15d 8h 23m'
  };

  if (isLoading && mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-green-500" />
          <p className="text-muted-foreground animate-pulse font-medium">Connecting to SentinelX real-time SOC feeds...</p>
        </div>
      </div>
    );
  }

  if (error && mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="text-lg font-semibold text-foreground">SOC Connection Error</h2>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-foreground transition-colors hover:bg-accent"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Reconnecting</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Offline Alert Banner */}
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-500 shadow-lg backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">Offline Demo Mode</p>
              <p className="text-xs text-amber-500/80">Could not establish connection to the backend server (FastAPI). Displaying static mock data.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-lg bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-500 hover:bg-amber-500/30 transition-colors self-stretch sm:self-auto text-center"
          >
            Retry Connection
          </button>
        </motion.div>
      )}

      {/* Dashboard Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">SOC Dashboard</h1>
            <p className="text-muted-foreground">Real-time threat monitoring and analysis</p>
          </div>

          <div className="flex items-center gap-3">
            <HeaderThreatToggle
              isOpen={isNewsPanelOpen}
              onToggle={() => setIsNewsPanelOpen(!isNewsPanelOpen)}
              hasNotifications={true}
              isMobile={false}
            />

            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isConnected
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'
                }`} />
              <span className="text-sm font-medium hidden sm:inline">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              <span className="text-sm font-medium sm:hidden">
                {isConnected ? '🟢' : '🔴'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="hidden items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-foreground transition-colors hover:bg-accent sm:flex"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">Refresh</span>
            </button>

            {/* Mobile Refresh Icon */}
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-lg border border-border bg-card p-2 text-foreground transition-colors hover:bg-accent sm:hidden"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Last Update */}
        <LastUpdatedTicker date={lastUpdate} mounted={mounted} />
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <KPICards data={kpiData} />
      </motion.div>

      {/* Main grid: self-start columns so a fixed-height chart is not stretched to match the taller sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-6">
        {/* Left column — charts */}
        <div className="flex w-full min-w-0 flex-col gap-6 lg:col-span-8 lg:self-start">
          {/* Threat Trends (line chart — card height follows chart, no dead vertical space) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex w-full shrink-0 flex-col rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6"
          >
            <h2 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
              Threat Trends
            </h2>
            <div className="h-[300px] w-full min-w-0 sm:h-[320px]">
              <ThreatTrendChart data={chartTrendData} />
            </div>
          </motion.div>

          {/* Threat Distribution & Top IPs — equal-height row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex h-[360px] min-w-0 flex-col rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6"
            >
              <h3 className="mb-3 shrink-0 text-lg font-semibold text-foreground">
                Threat Distribution
              </h3>
              <div className="min-h-[280px] w-full min-w-0 flex-1 overflow-visible">
                <ThreatDistribution data={distributionData} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex h-[360px] min-w-0 flex-col rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6"
            >
              <h3 className="mb-3 shrink-0 text-lg font-semibold text-foreground">
                Top Attacking IPs
              </h3>
              <div className="min-h-[280px] w-full min-w-0 flex-1">
                <TopIPs data={mockTopIPs} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right column — map & alerts */}
        <div className="flex w-full min-w-0 flex-col gap-6 lg:col-span-4 lg:self-start">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6"
          >
            <h3 className="mb-4 shrink-0 text-lg font-semibold text-foreground">
              Global Threat Map
            </h3>
            <div className="h-[min(320px,50vh)] min-h-[260px] w-full overflow-hidden rounded-lg">
              <MapWrapper />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex h-[360px] min-w-0 flex-col rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Alerts</h3>
            <div className="min-h-0 flex-1">
              <AlertsFeed alerts={alertsData} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* System Health — full width so metrics span the dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
        className="mt-6 w-full rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6"
      >
        <h3 className="mb-4 text-lg font-semibold text-foreground">System Health</h3>
        <SystemHealth data={healthData} layout="wide" />
      </motion.div>
      {/* Bottom Section - Incidents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6"
      >
        <div className="rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Active Incidents</h3>
          <IncidentsList incidents={incidentsData} />
        </div>
      </motion.div>

      {/* Threat Intelligence Panel */}
      <ThreatNewsPanel
        isOpen={isNewsPanelOpen}
        onClose={() => setIsNewsPanelOpen(false)}
      />
    </>
  );
}
