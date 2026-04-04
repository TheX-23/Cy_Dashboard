"use client";

import { useState, useMemo } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChevronRight, Edit, Trash2, Power, PowerOff, AlertTriangle, Shield, Activity } from 'lucide-react';
import { DetectionRule, DetectionRuleType, DetectionSeverity, DetectionStatus } from '@/types/detection';
import { cn } from '@/lib/utils/cn';

interface DetectionRulesTableProps {
  rules: DetectionRule[];
  selectedRuleId: string | null;
  onRuleSelect: (ruleId: string) => void;
  onRuleEdit: (ruleId: string) => void;
  onRuleDelete: (ruleId: string) => void;
  onRuleToggle: (ruleId: string, enabled: boolean) => void;
  isLoading?: boolean;
}

export function DetectionRulesTable({ 
  rules, 
  selectedRuleId, 
  onRuleSelect, 
  onRuleEdit, 
  onRuleDelete,
  onRuleToggle,
  isLoading 
}: DetectionRulesTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DetectionRule;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedRules = useMemo(() => {
    if (!sortConfig) return rules;

    return [...rules].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rules, sortConfig]);

  const handleSort = (key: keyof DetectionRule) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'desc' };
      }
      if (current.direction === 'desc') {
        return { key, direction: 'asc' };
      }
      return null;
    });
  };

  const getSeverityColor = (severity: DetectionSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20 neon-pulse';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const getStatusColor = (status: DetectionStatus) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400';
      case 'INACTIVE': return 'text-slate-400';
      case 'TESTING': return 'text-yellow-400';
    }
  };

  const getTypeColor = (type: DetectionRuleType) => {
    switch (type) {
      case 'threshold': return 'text-blue-400';
      case 'pattern': return 'text-purple-400';
      case 'behavior': return 'text-orange-400';
      case 'anomaly': return 'text-pink-400';
    }
  };

  const getTypeIcon = (type: DetectionRuleType) => {
    switch (type) {
      case 'threshold': return <AlertTriangle className="h-4 w-4" />;
      case 'pattern': return <Shield className="h-4 w-4" />;
      case 'behavior': return <Activity className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="glass-neon rounded-xl border border-green-500/30 p-6">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700/30 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-neon rounded-xl border border-green-500/30 overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-green-500/20 p-4">
        <h3 className="text-lg font-semibold text-green-400">Detection Rules</h3>
        <p className="text-sm text-slate-400 mt-1">{rules.length.toLocaleString()} rules configured</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/50 border-b border-green-500/20">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-2 text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  Rule Name
                  {sortConfig?.key === 'name' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-2 text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  Type
                  {sortConfig?.key === 'type' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('severity')}
                  className="flex items-center gap-2 text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  Severity
                  {sortConfig?.key === 'severity' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('riskScore')}
                  className="flex items-center gap-2 text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  Risk Score
                  {sortConfig?.key === 'riskScore' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('enabled')}
                  className="flex items-center gap-2 text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
                >
                  Status
                  {sortConfig?.key === 'enabled' && (
                    <span className="text-cyan-400">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Last Triggered</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-green-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRules.map((rule) => (
              <tr
                key={rule.id}
                className={cn(
                  "border-b border-green-500/10 hover:bg-green-500/5 transition-colors cursor-pointer",
                  selectedRuleId === rule.id && "bg-green-500/10 border-green-500/30"
                )}
                onClick={() => onRuleSelect(rule.id)}
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-white font-medium">{rule.name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-xs" title={rule.description}>
                      {rule.description}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(rule.type)}
                    <span className={cn("text-sm font-medium", getTypeColor(rule.type))}>
                      {rule.type}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                    getSeverityColor(rule.severity)
                  )}>
                    {rule.severity}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{rule.riskScore}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRuleToggle(rule.id, !rule.enabled);
                      }}
                      className={cn(
                        "p-1 rounded transition-colors",
                        rule.enabled 
                          ? "text-green-400 hover:text-green-300" 
                          : "text-slate-400 hover:text-green-400"
                      )}
                      title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                    >
                      {rule.enabled ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                    </button>
                    <span className={cn("text-sm font-medium", getStatusColor(rule.status))}>
                      {rule.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    {rule.lastTriggered ? (
                      <>
                        <p className="text-sm text-white">
                          {rule.lastTriggered.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDistanceToNowStrict(rule.lastTriggered, { addSuffix: true })}
                        </p>
                      </>
                    ) : (
                      <span className="text-sm text-slate-500">Never</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRuleEdit(rule.id);
                      }}
                      className="p-1 text-slate-400 hover:text-green-400 transition-colors"
                      title="Edit rule"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete rule "${rule.name}"?`)) {
                          onRuleDelete(rule.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-green-400" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rules.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-slate-400">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No detection rules found</p>
            <p className="text-sm">Create your first detection rule to start monitoring</p>
          </div>
        </div>
      )}
    </div>
  );
}
