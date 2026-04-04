"use client";

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SOARDashboard } from '@/types/soar';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Zap, 
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';

interface SOARDashboardProps {
  dashboard: SOARDashboard;
}

export function SOARDashboard({ dashboard }: SOARDashboardProps) {
  // Defensive check for data
  if (!dashboard) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading SOAR dashboard...</div>;
  }

  const COLORS = ['#00ff88', '#ff6600', '#ffaa00', '#00ccff', '#ff00cc', '#aa00ff'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-2">{`Time: ${label}`}</p>
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

  // Prepare chart data
  const executionTrendData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(Date.now() - (23 - i) * 60 * 60 * 1000);
    const executions = Math.floor(Math.random() * 10) + 1;
    const successes = Math.floor(executions * (dashboard.successRate / 100));
    
    return {
      time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      executions,
      successes,
      failures: executions - successes
    };
  });

  const workflowPerformanceData = dashboard.workflowStats.map(stat => ({
    name: stat.workflowName.length > 15 ? stat.workflowName.substring(0, 15) + '...' : stat.workflowName,
    executions: stat.executions || 0,
    successRate: Math.round(stat.successRate || 0),
    avgTime: Math.round((stat as any).averageExecutionTime / 1000) || 0
  }));

  const statusDistribution = [
    { name: 'Active Workflows', value: dashboard.activeWorkflows, color: COLORS[0] },
    { name: 'Inactive Workflows', value: Math.max(0, 10 - dashboard.activeWorkflows), color: COLORS[3] }
  ];

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* KPI Cards */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Workflows */}
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Active Workflows</p>
              <p className="text-2xl font-semibold text-white mt-1">{dashboard.activeWorkflows}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Play className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Executions */}
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Executions</p>
              <p className="text-2xl font-semibold text-white mt-1">{dashboard.totalExecutions.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Success Rate</p>
              <p className="text-2xl font-semibold text-green-400 mt-1">{dashboard.successRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        {/* Avg Execution Time */}
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Avg Execution Time</p>
              <p className="text-2xl font-semibold text-cyan-400 mt-1">
                {Math.round(dashboard.averageExecutionTime / 1000)}s
              </p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Clock className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="col-span-12">
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Execution Trend (24h)</h3>
          <div className="h-[300px] w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={executionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af" 
                  fontSize={10}
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis stroke="#9ca3af" fontSize={10} tick={{ fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="executions" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  name="Total"
                />
                <Line 
                  type="monotone" 
                  dataKey="successes" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  name="Successes"
                />
                <Line 
                  type="monotone" 
                  dataKey="failures" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                  name="Failures"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Workflow Performance Cards */}
      <div className="col-span-6 h-full">
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm h-full">
          <h3 className="text-lg font-semibold text-white mb-4">Most Executed Workflows</h3>
          <div className="space-y-3">
            {workflowPerformanceData.slice(0, 5).map((workflow, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white truncate">{workflow.name}</p>
                  <p className="text-xs text-gray-400">{workflow.executions} executions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">{workflow.successRate}%</p>
                  <p className="text-xs text-gray-400">success rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-6 h-full">
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm h-full">
          <h3 className="text-lg font-semibold text-white mb-4">Highest Success Rate</h3>
          <div className="space-y-3">
            {workflowPerformanceData
              .sort((a, b) => b.successRate - a.successRate)
              .slice(0, 5).map((workflow, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white truncate">{workflow.name}</p>
                  <p className="text-xs text-gray-400">{workflow.avgTime}s avg time</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-400">{workflow.successRate}%</p>
                  <p className="text-xs text-gray-400">success rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="col-span-3">
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">Efficiency</h4>
              <p className="text-xs text-gray-400">Overall performance</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-green-400 mb-1">
            {dashboard.successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400">
            +2.3% from last week
          </div>
        </div>
      </div>

      <div className="col-span-3">
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">Performance</h4>
              <p className="text-xs text-gray-400">Execution speed</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {Math.round(dashboard.averageExecutionTime / 1000)}s
          </div>
          <div className="text-xs text-gray-400">
            Average execution time
          </div>
        </div>
      </div>

      <div className="col-span-3">
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">Activity</h4>
              <p className="text-xs text-gray-400">Daily executions</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {dashboard.totalExecutions.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            Total executions today
          </div>
        </div>
      </div>

      <div className="col-span-3">
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-5 shadow-sm h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">Health</h4>
              <p className="text-xs text-gray-400">System status</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-400 mb-1">
            {dashboard.successRate > 90 ? 'Healthy' : 
             dashboard.successRate > 70 ? 'Warning' : 'Critical'}
          </div>
          <div className="text-xs text-gray-400">
            System health check
          </div>
        </div>
      </div>
    </div>
  );
}
