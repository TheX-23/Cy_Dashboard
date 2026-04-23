"use client";

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { LogAnalytics } from '@/types/logs';
import { TrendingUp, AlertTriangle, Activity, Shield } from 'lucide-react';

interface LogAnalyticsProps {
  analytics: LogAnalytics;
}

export function LogAnalytics({ analytics }: LogAnalyticsProps) {
  const getErrorRateColor = (rate: number) => {
    if (rate < 5) return 'text-green-400';
    if (rate < 15) return 'text-yellow-400';
    if (rate < 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const getErrorRateBg = (rate: number) => {
    if (rate < 5) return 'bg-green-500/10 border-green-500/20';
    if (rate < 15) return 'bg-yellow-500/10 border-yellow-500/20';
    if (rate < 25) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg border border-slate-700/70 p-3">
          <p className="text-xs text-slate-400 mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value ?? 0}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Logs */}
      <div className="glass rounded-xl border border-slate-800/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Logs</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{analytics.totalLogs.toLocaleString()}</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Error Rate */}
      <div className={`glass rounded-xl border p-4 ${getErrorRateBg(analytics.errorRate)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Error Rate</p>
            <p className={`text-2xl font-bold mt-1 ${getErrorRateColor(analytics.errorRate)}`}>
              {analytics.errorRate.toFixed(1)}%
            </p>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
        </div>
      </div>

      {/* Critical Logs */}
      <div className="glass rounded-xl border border-slate-800/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Critical Logs</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{analytics.criticalLogs}</p>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <Shield className="h-5 w-5 text-red-400" />
          </div>
        </div>
      </div>

      {/* Suspicious IPs */}
      <div className="glass rounded-xl border border-slate-800/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Suspicious IPs</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{analytics.suspiciousIPs.length}</p>
          </div>
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <TrendingUp className="h-5 w-5 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Logs Per Minute Chart */}
      <div className="glass rounded-xl border border-slate-800/60 p-4 lg:col-span-2 h-[250px]">
        <h3 className="text-sm font-semibold text-slate-100 mb-4">Logs Per Minute</h3>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 400, height: 150 }} debounce={50}>
            <LineChart data={analytics.logsPerMinute}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={10}
                tick={{ fill: '#64748b' }}
              />
              <YAxis stroke="#64748b" fontSize={10} tick={{ fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="errors" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Avg Response Time by Source */}
      <div className="glass rounded-xl border border-slate-800/60 p-4 h-[250px]">
        <h3 className="text-sm font-semibold text-slate-100 mb-4">Avg Response Time by Source</h3>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 400, height: 150 }} debounce={50}>
            <BarChart data={analytics.responseTimeBySource} layout="vertical">
              <XAxis
                type="number"
                stroke="#64748b"
                fontSize={10}
                tick={{ fill: '#64748b' }}
                unit="ms"
              />
              <YAxis
                type="category"
                dataKey="source"
                stroke="#64748b"
                fontSize={10}
                tick={{ fill: '#64748b' }}
                width={65}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="glass rounded-lg border border-slate-700/70 p-3">
                        <p className="text-xs font-semibold text-slate-100 mb-1">{d.source}</p>
                        <p className="text-xs text-cyan-400">Avg: {d.avgTime}ms</p>
                        <p className="text-xs text-orange-400">Peak: {d.maxTime}ms</p>
                        <p className="text-xs text-slate-400">Logs: {d.count.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="avgTime" radius={[0, 4, 4, 0]} name="Avg Time">
                {analytics.responseTimeBySource.map((entry, index) => (
                  <Cell
                    key={`rt-cell-${index}`}
                    fill={entry.avgTime > 700 ? '#ef4444' : entry.avgTime > 400 ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Distribution */}
      <div className="glass rounded-xl border border-slate-800/60 p-4 h-[250px]">
        <h3 className="text-sm font-semibold text-slate-100 mb-4">Event Distribution</h3>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 400, height: 150 }} debounce={50}>
            <PieChart>
              <Pie
                data={analytics.eventDistribution}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={2}
                dataKey="count"
              >
                {analytics.eventDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {analytics.eventDistribution.slice(0, 4).map((entry, index) => (
            <div key={entry.type} className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-slate-400 truncate">{entry.type}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
