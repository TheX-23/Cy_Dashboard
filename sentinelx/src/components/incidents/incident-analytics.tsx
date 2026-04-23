"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { IncidentAnalytics as IncidentAnalyticsData } from '@/types/incidents';

interface IncidentAnalyticsProps {
  analytics: IncidentAnalyticsData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-2">{`Status: ${label}`}</p>
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

export const IncidentAnalytics = React.memo(function IncidentAnalytics({ analytics }: IncidentAnalyticsProps) {
  // Defensive check to prevent undefined access
  if (!analytics || !analytics.incidentsByStatus) {
    return (
      <div className="bg-card text-card-foreground border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Incidents by Status</h3>
      <div className="h-[300px] w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 400, height: 300 }} debounce={50}>
          <BarChart data={analytics.incidentsByStatus}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
            <XAxis 
              dataKey="status" 
              stroke="#9ca3af" 
              fontSize={10}
              tick={{ fill: '#9ca3af' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#9ca3af" fontSize={10} tick={{ fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="#10b981"
              radius={[0, 4, 0, 4]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default IncidentAnalytics;
