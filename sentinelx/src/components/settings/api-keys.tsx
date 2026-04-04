"use client";

import { useState } from 'react';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Calendar, Activity, Save, X } from 'lucide-react';
import { APIKey } from '@/types/settings';
import { cn } from '@/lib/utils/cn';

interface APIKeysProps {
  keys: APIKey[];
  onCreateKey: (key: Omit<APIKey, 'id' | 'createdAt' | 'usageCount' | 'status'>) => void;
  onRevokeKey: (keyId: string) => void;
  isLoading?: boolean;
}

export function APIKeys({ keys, onCreateKey, onRevokeKey, isLoading }: APIKeysProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<Partial<APIKey>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreateKey = () => {
    if (newKey.name && newKey.permissions && newKey.permissions.length > 0) {
      const keyData = {
        name: newKey.name,
        key: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        permissions: newKey.permissions,
        expiresAt: newKey.expiresAt,
        rateLimit: newKey.rateLimit || 1000,
        createdBy: 'current-user'
      };
      
      onCreateKey(keyData);
      setNewKey({});
      setIsCreating(false);
    }
  };

  const handleCopyKey = (keyId: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const getStatusColor = (status: APIKey['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'expired': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'revoked': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getPermissionColor = (permission: string) => {
    if (permission === '*') return 'text-purple-400';
    if (permission.startsWith('admin:')) return 'text-red-400';
    if (permission.startsWith('write:')) return 'text-orange-400';
    if (permission.startsWith('read:')) return 'text-blue-400';
    return 'text-slate-400';
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Create Key Form */}
      {isCreating && (
        <div className="glass-neon rounded-xl border border-green-500/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">Generate API Key</h3>
            </div>
            <button
              onClick={() => {
                setNewKey({});
                setIsCreating(false);
              }}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Key Name</label>
              <input
                type="text"
                value={newKey.name || ''}
                onChange={(e) => setNewKey(prev => ({ ...prev, name: e?.target?.value || '' }))}
                className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                placeholder="Enter a descriptive name for this key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Permissions</label>
              <div className="space-y-2">
                {[
                  { value: '*', label: 'Full Access (Admin)', description: 'Complete access to all resources' },
                  { value: 'read:alerts', label: 'Read Alerts', description: 'View and list alerts' },
                  { value: 'write:incidents', label: 'Write Incidents', description: 'Create and update incidents' },
                  { value: 'read:detections', label: 'Read Detections', description: 'View detection rules and events' },
                  { value: 'admin:workflows', label: 'Manage Workflows', description: 'Create, edit, and delete SOAR workflows' }
                ].map(permission => (
                  <div key={permission.value} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                    <input
                      type="checkbox"
                      id={permission.value}
                      checked={newKey.permissions?.includes(permission.value) || false}
                      onChange={(e) => {
                        const current = newKey.permissions || [];
                        if (e?.target?.checked) {
                          setNewKey(prev => ({ ...prev, permissions: [...current, permission.value] }));
                        } else {
                          setNewKey(prev => ({ ...prev, permissions: current.filter(p => p !== permission.value) }));
                        }
                      }}
                      className="w-4 h-4 text-green-400 bg-black/50 border border-green-500/30 rounded focus:ring-2 focus:ring-green-500/50"
                    />
                    <div className="flex-1">
                      <label htmlFor={permission.value} className="text-sm text-white font-medium">
                        {permission.label}
                      </label>
                      <p className="text-xs text-slate-400">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={newKey.expiresAt ? new Date(newKey.expiresAt).toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewKey(prev => ({ 
                    ...prev, 
                    expiresAt: e?.target?.value ? new Date(e.target.value) : undefined 
                  }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Rate Limit (requests/hour)</label>
                <input
                  type="number"
                  value={newKey.rateLimit || ''}
                  onChange={(e) => setNewKey(prev => ({ ...prev, rateLimit: parseInt(e?.target?.value) || 1000 }))}
                  min="1"
                  max="10000"
                  className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleCreateKey}
                disabled={!newKey.name || !newKey.permissions || newKey.permissions.length === 0 || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Key className="h-4 w-4" />
                Generate Key
              </button>
              <button
                onClick={() => {
                  setNewKey({});
                  setIsCreating(false);
                }}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="glass-neon rounded-xl border border-green-500/30 overflow-hidden">
        <div className="p-4 border-b border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">API Keys</h3>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="h-4 w-4" />
              Generate New Key
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50 border-b border-green-500/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-400">API Key</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Permissions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Usage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Expires</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-green-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-white font-medium">{key.name}</p>
                      <p className="text-xs text-slate-400">Created: {formatDate(key.createdAt)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-green-400 bg-black/50 px-2 py-1 rounded font-mono">
                        {showKey[key.id] ? key.key : `${key.key.substring(0, 12)}...`}
                      </code>
                      <button
                        onClick={() => handleToggleKeyVisibility(key.id)}
                        className="p-1 text-slate-400 hover:text-green-400 transition-colors"
                      >
                        {showKey[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                      <button
                        onClick={() => handleCopyKey(key.id, key.key)}
                        className="p-1 text-slate-400 hover:text-green-400 transition-colors"
                        title={copiedKey === key.id ? 'Copied!' : 'Copy to clipboard'}
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.slice(0, 2).map(permission => (
                        <span key={permission} className={cn(
                          "px-2 py-1 text-xs rounded border font-mono",
                          getPermissionColor(permission)
                        )}>
                          {permission}
                        </span>
                      ))}
                      {key.permissions.length > 2 && (
                        <span className="px-2 py-1 text-xs rounded border text-slate-400">
                          +{key.permissions.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full border font-medium",
                      getStatusColor(key.status)
                    )}>
                      {key.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3 text-blue-400" />
                      <span className="text-sm text-white">{key.usageCount.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">/ {key.rateLimit.toLocaleString()}/hr</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span className="text-sm text-white">{formatDate(key.expiresAt)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {key.lastUsed && (
                        <span className="text-xs text-slate-400">
                          Last: {formatDate(key.lastUsed)}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to revoke API key "${key.name}"? This action cannot be undone.`)) {
                            onRevokeKey(key.id);
                          }
                        }}
                        disabled={isLoading || key.status === 'revoked'}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Revoke API key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {keys?.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No API Keys</p>
            <p className="text-sm">Generate your first API key to access SentinelX programmatically</p>
          </div>
        )}
      </div>

      {/* Usage Statistics */}
      {keys?.length > 0 && (
        <div className="glass-neon rounded-xl border border-green-500/30 p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4">Usage Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-black/30 rounded-lg">
              <p className="text-sm text-slate-400">Total Keys</p>
              <p className="text-2xl font-bold text-white">{keys?.length || 0}</p>
            </div>
            <div className="p-4 bg-black/30 rounded-lg">
              <p className="text-sm text-slate-400">Active Keys</p>
              <p className="text-2xl font-bold text-green-400">
                {keys?.filter(k => k.status === 'active').length}
              </p>
            </div>
            <div className="p-4 bg-black/30 rounded-lg">
              <p className="text-sm text-slate-400">Total Usage</p>
              <p className="text-2xl font-bold text-blue-400">
                {keys?.reduce((sum, k) => sum + k.usageCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
