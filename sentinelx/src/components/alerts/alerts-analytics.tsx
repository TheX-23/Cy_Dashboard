"use client";

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertAnalytics } from '@/types/alerts';
import { AlertTriangle, Shield, CheckCircle, Clock, TrendingUp, Activity, Bell } from 'lucide-react';

interface AlertsAnalyticsProps {
  analytics: AlertAnalytics;
}

export function AlertsAnalytics({ analytics }: AlertsAnalyticsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#ff0040';
      case 'HIGH': return '#ff6600';
      case 'MEDIUM': return '#ffaa00';
      case 'LOW': return '#00ccff';
      default: return '#64748b';
    }
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'Auth': '#00ff88',
      'API': '#00ccff',
      'Firewall': '#ff0080',
      'IDS': '#ff00ff',
      'Network': '#ffaa00',
      'System': '#00ffff'
    };
    return colors[source] || '#64748b';
  };

  const COLORS = ['#ff0040', '#ff6600', '#ffaa00', '#00ccff'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111827] border border-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 items-start overflow-visible md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <div className="
          bg-[#111827]
          border border-gray-700
          rounded-xl
          p-4
          h-full
        ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Alerts</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics.totalAlerts.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="
          bg-[#111827]
          border border-gray-700
          rounded-xl
          p-4
          h-full
        ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{analytics.criticalAlerts}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>

        {/* Open Alerts */}
        <div className="
          bg-[#111827]
          border border-gray-700
          rounded-xl
          p-4
          h-full
        ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Open Alerts</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{analytics.openAlerts}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Resolved Alerts — critical FAB sits above this card, overlapping the top edge */}
        <div className="relative overflow-visible pt-5">
          {analytics.criticalAlerts > 0 && (
            <div
              className="absolute left-1/2 -top-2 z-20 -translate-x-1/2 -translate-y-1/2 sm:-top-3"
              role="status"
              aria-live="polite"
              title={`${analytics.criticalAlerts} critical alert${analytics.criticalAlerts > 1 ? 's' : ''}`}
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-400/80 bg-red-500 text-white shadow-[0_8px_24px_rgba(239,68,68,0.45)] transition-transform duration-200 neon-pulse hover:scale-105 sm:h-14 sm:w-14">
                <Bell className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden />
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold tabular-nums text-red-600 ring-2 ring-red-500 sm:h-6 sm:min-w-[1.5rem] sm:text-xs">
                  {analytics.criticalAlerts > 99 ? '99+' : analytics.criticalAlerts}
                </span>
              </div>
              <span className="sr-only">
                {analytics.criticalAlerts} critical alert{analytics.criticalAlerts > 1 ? 's' : ''}
              </span>
            </div>
          )}
          <div
            className="
          h-full rounded-xl border border-gray-700 bg-[#111827]
          p-4
        "
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Resolved Alerts</p>
                <p className="mt-1 text-2xl font-bold text-green-400">{analytics.resolvedAlerts}</p>
              </div>
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Charts - Pie Chart and Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Pie Chart */}
        <div className="col-span-4">
          <div className="
            bg-[#111827]
            border border-gray-700
            rounded-xl
            p-4
            h-full
          ">
            <h3 className="text-lg font-semibold text-white mb-4">Alerts by Severity</h3>
            <div className="h-[300px] w-full overflow-hidden">
              <div className="flex items-center justify-center h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.alertsBySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent ? (percent * 100).toFixed(0) : '0')}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.alertsBySeverity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Legend Below Pie Chart */}
            <div className="mt-4 space-y-2 text-sm">
              {analytics.alertsBySeverity.map((entry) => (
                <div key={entry.severity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getSeverityColor(entry.severity) }}
                    />
                    <span className="text-sm text-gray-300">{entry.severity}</span>
                  </div>
                  <span className="text-sm text-white font-medium">{entry.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-span-8">
          <div className="
            bg-[#111827]
            border border-gray-700
            rounded-xl
            p-4
            h-full
          ">
            <h3 className="text-lg font-semibold text-white mb-4">Alerts Over Time (24h)</h3>
            <div className="h-[300px] w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.alertsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="time"
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#9CA3AF' }}
                    itemStyle={{ color: '#9CA3AF' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="critical" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts by Source */}
        <div className="
          bg-[#111827]
          border border-gray-700
          rounded-xl
          p-4
          h-full
        ">
          <h3 className="text-lg font-semibold text-white mb-4">Alerts by Source</h3>
          <div className="h-[300px] w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.alertsBySource}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="source" 
                  stroke="#9CA3AF" 
                  fontSize={10}
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis stroke="#9CA3AF" fontSize={10} tick={{ fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#3B82F6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Attack Types */}
        <div className="
          bg-[#111827]
          border border-gray-700
          rounded-xl
          p-4
          h-full
        ">
          <h3 className="text-lg font-semibold text-white mb-4">Top Attack Types</h3>
          <div className="h-[300px] overflow-y-auto space-y-3">
            {analytics.topAttackTypes.map((attack, index) => (
              <div key={attack.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-blue-400">#{index + 1}</span>
                  <span className="text-sm text-white">{attack.type}</span>
                </div>
                <span className="text-sm text-blue-400 font-medium">{attack.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="
          bg-[#111827]
          border border-gray-700
          rounded-xl
          p-4
          h-full
        ">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Avg Resolution Time</p>
              <p className="text-lg font-bold text-white">{analytics.averageResolutionTime}h</p>
            </div>
          </div>
        </div>
        
        <div className="
          bg-[#111827]
          border border-gray-700
          rounded-xl
          p-4
          h-full
        ">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-xs text-gray-400">Escalation Rate</p>
              <p className="text-lg font-bold text-white">{analytics.escalationRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="
          bg-[#111827]
          border border-gray-700
          rounded-xl
          p-4
          h-full
        ">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Active Sources</p>
              <p className="text-lg font-bold text-white">{analytics.alertsBySource.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
