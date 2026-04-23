"use client";

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { 
  User, 
  Shield, 
  Users, 
  Key, 
  Zap, 
  Database, 
  Settings, 
  Bell, 
  Globe, 
  FileText, 
  Palette,
  Save,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { AccountSettings } from '@/components/settings/account-settings';
import { SecuritySettingsPanel } from '@/components/settings/security-settings';
import { UsersRoles } from '@/components/settings/users-roles';
import { APIKeys } from '@/components/settings/api-keys';
import { Preferences } from '@/components/settings/preferences';

type SettingsTab = 
  | 'account'
  | 'security'
  | 'users'
  | 'api-keys'
  | 'integrations'
  | 'data-sources'
  | 'detection'
  | 'soar'
  | 'notifications'
  | 'threat-intel'
  | 'audit-logs'
  | 'preferences';

export default function SettingsPage() {
  const {
    profile,
    security,
    users,
    roles,
    apiKeys,
    integrations,
    dataSources,
    detectionRules,
    soarSettings,
    notifications,
    threatIntel,
    auditLogs,
    preferences,
    updateProfile,
    updateSecurity,
    updateUsers,
    updateRoles,
    createAPIKey,
    revokeAPIKey,
    updateNotifications,
    updatePreferences,
    saveSettings,
    isLoading,
    error
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const tabs = [
    { id: 'account', label: 'Account', icon: User, description: 'Profile and authentication' },
    { id: 'security', label: 'Security', icon: Shield, description: 'MFA, sessions, policies' },
    { id: 'users', label: 'Users & Roles', icon: Users, description: 'User management and RBAC' },
    { id: 'api-keys', label: 'API Keys', icon: Key, description: 'Generate and manage API keys' },
    { id: 'integrations', label: 'Integrations', icon: Zap, description: 'External services and webhooks' },
    { id: 'data-sources', label: 'Data Sources', icon: Database, description: 'Configure log ingestion' },
    { id: 'detection', label: 'Detection Settings', icon: Settings, description: 'Rules and thresholds' },
    { id: 'soar', label: 'SOAR Settings', icon: Zap, description: 'Automation and approvals' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert channels and filters' },
    { id: 'threat-intel', label: 'Threat Intelligence', icon: Globe, description: 'Geo tracking and feeds' },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText, description: 'View and export logs' },
    { id: 'preferences', label: 'Preferences', icon: Palette, description: 'Theme and UI settings' }
  ] as const;

  const handleSaveAll = useCallback(async () => {
    setSaveStatus('saving');
    await saveSettings();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  }, [saveSettings]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <AccountSettings
            profile={profile}
            onUpdate={updateProfile}
            isLoading={isLoading}
          />
        );
      case 'security':
        return (
          <SecuritySettingsPanel
            settings={security}
            onUpdate={updateSecurity}
            isLoading={isLoading}
          />
        );
      case 'users':
        return (
          <UsersRoles
            users={users}
            roles={roles}
            onUpdateUsers={updateUsers}
            onUpdateRoles={updateRoles}
            isLoading={isLoading}
          />
        );
      case 'api-keys':
        return (
          <APIKeys
            keys={apiKeys}
            onCreateKey={createAPIKey}
            onRevokeKey={revokeAPIKey}
            isLoading={isLoading}
          />
        );
      case 'preferences':
        return (
          <Preferences
            preferences={preferences}
            onUpdate={updatePreferences}
            isLoading={isLoading}
          />
        );
      default:
        return (
          <div className="glass-neon rounded-xl border border-green-500/30 p-12 text-center">
            <div className="text-slate-400">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Coming Soon</p>
              <p className="text-sm">This settings section is currently under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="grid-bg min-h-screen p-6">
      <div className="mx-auto w-full max-w-[1800px] space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold text-green-400">Settings</h1>
            <p className="mt-1 text-sm text-slate-400">
              System configuration and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={isLoading || saveStatus === 'saving'}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveStatus === 'saving' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : saveStatus === 'saved' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save All'}
            </button>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-neon rounded-xl border border-red-500/30 p-4 bg-red-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Settings Layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-80 flex-shrink-0"
          >
            <div className="glass-neon rounded-xl border border-green-500/30 p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as SettingsTab)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left",
                        activeTab === tab.id
                          ? "bg-green-500 text-black"
                          : "text-slate-400 hover:text-green-400 hover:bg-green-500/10"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{tab.label}</p>
                        <p className="text-xs opacity-70 truncate">{tab.description}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="glass-neon rounded-xl border border-green-500/30 p-4 mt-4">
              <h3 className="text-sm font-semibold text-green-400 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Active Users</span>
                  <span className="text-xs text-white font-medium">
                    {users.filter(u => u.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">API Keys</span>
                  <span className="text-xs text-white font-medium">
                    {apiKeys.filter(k => k.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Integrations</span>
                  <span className="text-xs text-white font-medium">
                    {integrations.filter(i => i.status === 'active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Data Sources</span>
                  <span className="text-xs text-white font-medium">
                    {dataSources.filter(d => d.status === 'active').length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 min-w-0"
          >
            {renderTabContent()}
          </motion.div>
        </div>

        {/* Save Status Indicator */}
        {saveStatus === 'saved' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 right-6 flex items-center gap-2 bg-green-500 text-black px-4 py-2 rounded-lg shadow-lg"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Settings saved successfully!</span>
          </motion.div>
        )}
      </div>
    </main>
  );
}
