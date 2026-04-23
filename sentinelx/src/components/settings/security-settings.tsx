"use client";

import { useState } from 'react';
import { Shield, Clock, Smartphone, Monitor, Plus, Trash2, Save, X, Globe, Lock } from 'lucide-react';
import { SecuritySettings } from '@/types/settings';
import { cn } from '@/lib/utils/cn';

interface SecuritySettingsProps {
  settings: SecuritySettings;
  onUpdate: (settings: Partial<SecuritySettings>) => void;
  isLoading?: boolean;
}

export function SecuritySettingsPanel({ settings, onUpdate, isLoading }: SecuritySettingsProps) {
  const [isEditingPolicy, setIsEditingPolicy] = useState(false);
  const [isEditingDevices, setIsEditingDevices] = useState(false);
  const [editedPolicy, setEditedPolicy] = useState<Partial<SecuritySettings['passwordPolicy']>>({});
  const [newDevice, setNewDevice] = useState({ name: '', trusted: false });

  const handleSavePolicy = () => {
    if (editedPolicy) {
      onUpdate({ passwordPolicy: { ...settings.passwordPolicy, ...editedPolicy } });
      setIsEditingPolicy(false);
    }
  };

  const handleCancelPolicy = () => {
    setEditedPolicy({});
    setIsEditingPolicy(false);
  };

  const handleAddDevice = () => {
    if (newDevice.name) {
      const device = {
        id: `device-${Date.now()}`,
        name: newDevice.name,
        userAgent: navigator.userAgent,
        lastUsed: new Date(),
        trusted: newDevice.trusted
      };
      
      onUpdate({
        trustedDevices: [...settings.trustedDevices, device]
      });
      setNewDevice({ name: '', trusted: false });
    }
  };

  const handleRemoveDevice = (deviceId: string) => {
    onUpdate({
      trustedDevices: settings.trustedDevices.filter(d => d.id !== deviceId)
    });
  };

  const handleToggleDeviceTrust = (deviceId: string, trusted: boolean) => {
    onUpdate({
      trustedDevices: settings.trustedDevices.map(d => 
        d.id === deviceId ? { ...d, trusted } : d
      )
    });
  };

  const handleAddIPWhitelist = () => {
    const ip = prompt('Enter IP address or CIDR block:');
    if (ip) {
      onUpdate({
        ipWhitelist: [...settings.ipWhitelist, ip]
      });
    }
  };

  const handleRemoveIPWhitelist = (ip: string) => {
    onUpdate({
      ipWhitelist: settings.ipWhitelist.filter(i => i !== ip)
    });
  };

  return (
    <div className="space-y-6">
      {/* MFA Settings */}
      <div className="glass-neon rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold text-green-400">MFA Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
            <div>
              <p className="text-white font-medium">Multi-Factor Authentication</p>
              <p className="text-sm text-slate-400">
                Require additional verification for sensitive actions
              </p>
            </div>
            <button
              onClick={() => onUpdate({ mfaEnabled: !settings.mfaEnabled })}
              disabled={isLoading}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors",
                settings.mfaEnabled 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                  : "bg-green-500 hover:bg-green-600 text-black disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {settings.mfaEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          {settings.mfaEnabled && (
            <div>
              <p className="text-sm font-medium text-green-400 mb-3">Available Methods:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {settings.mfaMethods.map((method) => (
                  <div key={method} className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-green-500/20">
                    {method === 'sms' && <Smartphone className="h-4 w-4 text-blue-400" />}
                    {method === 'email' && <Monitor className="h-4 w-4 text-green-400" />}
                    {method === 'authenticator' && <Shield className="h-4 w-4 text-purple-400" />}
                    <span className="text-sm text-white capitalize">{method}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Management */}
      <div className="glass-neon rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold text-green-400">Session Management</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => onUpdate({ sessionTimeout: parseInt(e?.target?.value || '480') || 480 })}
                className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                min="5"
                max="1440"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Max Concurrent Sessions</label>
              <input
                type="number"
                value={settings.maxConcurrentSessions}
                onChange={(e) => onUpdate({ maxConcurrentSessions: parseInt(e?.target?.value || '3') || 3 })}
                className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Password Policy */}
      <div className="glass-neon rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">Password Policy</h3>
          </div>
          {!isEditingPolicy && (
            <button
              onClick={() => {
                setEditedPolicy(settings.passwordPolicy);
                setIsEditingPolicy(true);
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Policy
            </button>
          )}
        </div>

        <div className="space-y-4">
          {isEditingPolicy ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">Minimum Length</label>
                  <input
                    type="number"
                    value={editedPolicy.minLength || settings.passwordPolicy.minLength}
                    onChange={(e) => setEditedPolicy(prev => ({ ...prev, minLength: parseInt(e?.target?.value || '12') || 12 }))}
                    className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    min="6"
                    max="128"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">Expiration Days</label>
                  <input
                    type="number"
                    value={editedPolicy.expirationDays || settings.passwordPolicy.expirationDays}
                    onChange={(e) => setEditedPolicy(prev => ({ ...prev, expirationDays: parseInt(e?.target?.value || '90') || 90 }))}
                    className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requireUppercase"
                    checked={editedPolicy.requireUppercase ?? settings.passwordPolicy.requireUppercase}
                    onChange={(e) => setEditedPolicy(prev => ({ ...prev, requireUppercase: e.target.checked }))}
                    className="w-4 h-4 text-green-400 bg-black/50 border border-green-500/30 rounded focus:ring-2 focus:ring-green-500/50"
                  />
                  <label htmlFor="requireUppercase" className="text-sm text-white">Require Uppercase Letters</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requireLowercase"
                    checked={editedPolicy.requireLowercase ?? settings.passwordPolicy.requireLowercase}
                    onChange={(e) => setEditedPolicy(prev => ({ ...prev, requireLowercase: e.target.checked }))}
                    className="w-4 h-4 text-green-400 bg-black/50 border border-green-500/30 rounded focus:ring-2 focus:ring-green-500/50"
                  />
                  <label htmlFor="requireLowercase" className="text-sm text-white">Require Lowercase Letters</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requireNumbers"
                    checked={editedPolicy.requireNumbers ?? settings.passwordPolicy.requireNumbers}
                    onChange={(e) => setEditedPolicy(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                    className="w-4 h-4 text-green-400 bg-black/50 border border-green-500/30 rounded focus:ring-2 focus:ring-green-500/50"
                  />
                  <label htmlFor="requireNumbers" className="text-sm text-white">Require Numbers</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requireSpecialChars"
                    checked={editedPolicy.requireSpecialChars ?? settings.passwordPolicy.requireSpecialChars}
                    onChange={(e) => setEditedPolicy(prev => ({ ...prev, requireSpecialChars: e.target.checked }))}
                    className="w-4 h-4 text-green-400 bg-black/50 border border-green-500/30 rounded focus:ring-2 focus:ring-green-500/50"
                  />
                  <label htmlFor="requireSpecialChars" className="text-sm text-white">Require Special Characters</label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSavePolicy}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  Save Policy
                </button>
                <button
                  onClick={handleCancelPolicy}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Min Length:</span>
                  <span className="text-sm text-white font-medium">{settings.passwordPolicy.minLength}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Uppercase:</span>
                  <span className={cn(
                    "text-sm font-medium",
                    settings.passwordPolicy.requireUppercase ? "text-green-400" : "text-slate-400"
                  )}>
                    {settings.passwordPolicy.requireUppercase ? 'Required' : 'Not Required'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Lowercase:</span>
                  <span className={cn(
                    "text-sm font-medium",
                    settings.passwordPolicy.requireLowercase ? "text-green-400" : "text-slate-400"
                  )}>
                    {settings.passwordPolicy.requireLowercase ? 'Required' : 'Not Required'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Numbers:</span>
                  <span className={cn(
                    "text-sm font-medium",
                    settings.passwordPolicy.requireNumbers ? "text-green-400" : "text-slate-400"
                  )}>
                    {settings.passwordPolicy.requireNumbers ? 'Required' : 'Not Required'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Special Chars:</span>
                  <span className={cn(
                    "text-sm font-medium",
                    settings.passwordPolicy.requireSpecialChars ? "text-green-400" : "text-slate-400"
                  )}>
                    {settings.passwordPolicy.requireSpecialChars ? 'Required' : 'Not Required'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Expiration:</span>
                  <span className="text-sm text-white font-medium">{settings.passwordPolicy.expirationDays} days</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* IP Whitelist */}
      <div className="glass-neon rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">IP Whitelist</h3>
          </div>
          <button
            onClick={handleAddIPWhitelist}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Plus className="h-4 w-4" />
            Add IP
          </button>
        </div>

        <div className="space-y-2">
          {settings.ipWhitelist.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No IP addresses whitelisted. Add trusted IPs to allow access from specific networks.
            </p>
          ) : (
            settings.ipWhitelist.map((ip, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <span className="text-sm text-white font-mono">{ip}</span>
                <button
                  onClick={() => handleRemoveIPWhitelist(ip)}
                  disabled={isLoading}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trusted Devices */}
      <div className="glass-neon rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">Trusted Devices</h3>
          </div>
          <button
            onClick={() => setIsEditingDevices(!isEditingDevices)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Device
          </button>
        </div>

        {isEditingDevices && (
          <div className="mb-4 p-4 bg-black/30 rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newDevice.name}
                onChange={(e) => setNewDevice(prev => ({ ...prev, name: e?.target?.value || '' }))}
                placeholder="Device name (e.g., iPhone 13, Chrome on Windows)"
                className="flex-1 px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trustDevice"
                  checked={newDevice.trusted}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, trusted: e.target.checked }))}
                  className="w-4 h-4 text-green-400 bg-black/50 border border-green-500/30 rounded focus:ring-2 focus:ring-green-500/50"
                />
                <label htmlFor="trustDevice" className="text-sm text-white">Trust this device</label>
              </div>
              <button
                onClick={handleAddDevice}
                disabled={!newDevice.name || isLoading}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {settings.trustedDevices.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No trusted devices configured. Trusted devices can bypass additional authentication.
            </p>
          ) : (
            settings.trustedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{device.name}</p>
                  <p className="text-xs text-slate-400">
                    Last used: {device.lastUsed.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleDeviceTrust(device.id, !device.trusted)}
                    disabled={isLoading}
                    className={cn(
                      "px-2 py-1 rounded text-xs transition-colors",
                      device.trusted 
                        ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                        : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                    )}
                  >
                    {device.trusted ? 'Trusted' : 'Not Trusted'}
                  </button>
                  <button
                    onClick={() => handleRemoveDevice(device.id)}
                    disabled={isLoading}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
