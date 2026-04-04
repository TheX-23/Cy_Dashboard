"use client";

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DetectionAnalytics } from '@/types/detection';
import { AlertTriangle, Shield, Activity, Clock, TrendingUp, Target } from 'lucide-react';

interface DetectionAnalyticsProps {
  analytics: DetectionAnalytics;
}

export function DetectionAnalytics({ analytics }: DetectionAnalyticsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#ff0040';
      case 'HIGH': return '#ff6b00';
      case 'MEDIUM': return '#ffaa00';
      case 'LOW': return '#00ff88';
      default: return '#666666';
    }
  };

  return (
    <div className="space-y-6">
      {/* Detection Trends */}
      <div className="glass-neon rounded-xl border border-green-500/30 p-6">
        <h3 className="text-lg font-semibold text-green-400 mb-4">Detection Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.detectionsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-neon rounded-xl border border-green-500/30 p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.severityDistribution}
                dataKey="count"
                nameKey="severity"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {analytics.severityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-neon rounded-xl border border-green-500/30 p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4">Top Triggered Rules</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.topTriggeredRules}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="ruleName" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Bar dataKey="triggerCount" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-neon rounded-xl border border-green-500/30 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-xs text-green-400">Detection Rate</p>
              <p className="text-lg font-bold text-white">{(100 - analytics.falsePositiveRate).toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="glass-neon rounded-xl border border-green-500/30 p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-xs text-green-400">Active Rules</p>
              <p className="text-lg font-bold text-white">{analytics.topTriggeredRules.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-neon rounded-xl border border-green-500/30 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-xs text-green-400">Critical Detections</p>
              <p className="text-lg font-bold text-white">
                {analytics.severityDistribution.find(s => s.severity === 'CRITICAL')?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-neon rounded-xl border border-green-500/30 p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-xs text-green-400">Avg Response Time</p>
              <p className="text-lg font-bold text-white">{analytics.detectionLatency}ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
