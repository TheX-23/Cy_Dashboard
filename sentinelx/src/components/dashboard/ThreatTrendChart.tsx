"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer } from './ChartContainer';
import { useTheme } from '@/context/ThemeContext';

interface TrendData {
  time: string;
  threats: number;
  mitigated: number;
}

interface ThreatTrendChartProps {
  data: TrendData[];
}

export const ThreatTrendChart: React.FC<ThreatTrendChartProps> = ({ data }) => {
  const { isDarkMode } = useTheme();
  
  // Defensive check for data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <ChartContainer height="100%" className="h-full min-h-[200px]">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No trend data available
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer height="100%" className="h-full min-h-[240px]">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        debounce={50}
      >
        <LineChart data={data}>
          <defs>
            <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mitigatedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
          <XAxis 
            dataKey="time" 
            stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
          />
          
          <Tooltip 
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '6px'
            }}
            labelStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
            itemStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
          />
          
          <Legend 
            wrapperStyle={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
            iconType="line"
          />
          
          <Line 
            type="monotone" 
            dataKey="threats" 
            stroke={isDarkMode ? "#ef4444" : "#dc2626"}
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#threatGradient)"
            dot={{ fill: isDarkMode ? "#ef4444" : "#dc2626", r: 4 }}
            activeDot={{ r: 6 }}
            name="Threats"
          />
          
          <Line 
            type="monotone"
            dataKey="mitigated"
            stroke={isDarkMode ? "#22c55e" : "#059669"}
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#mitigatedGradient)"
            dot={{ fill: isDarkMode ? "#22c55e" : "#059669", r: 4 }}
            activeDot={{ r: 6 }}
            name="Mitigated"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ThreatTrendChart;
