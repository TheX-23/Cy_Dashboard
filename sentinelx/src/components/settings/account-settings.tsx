"use client";

import { useState } from 'react';
import { User, Mail, Lock, Shield, Smartphone, Camera, Save, X } from 'lucide-react';
import { UserProfile } from '@/types/settings';
import { cn } from '@/lib/utils/cn';

interface AccountSettingsProps {
  profile: UserProfile | null;
  onUpdate: (profile: Partial<UserProfile>) => void;
  isLoading?: boolean;
}

export function AccountSettings({ profile, onUpdate, isLoading }: AccountSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  const handleEdit = () => {
    setEditedProfile({
      name: profile?.name || '',
      email: profile?.email || '',
      department: profile?.department || ''
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedProfile.name && editedProfile.email) {
      onUpdate(editedProfile);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile({});
    setIsEditing(false);
  };

  const handleEnableMFA = () => {
    onUpdate({ mfaEnabled: true });
  };

  if (!profile) {
    return (
      <div className="glass-neon rounded-xl border border-green-500/30 p-8">
        <div className="text-center text-slate-400">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Loading Profile</p>
          <p className="text-sm">Please wait while we load your account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="glass-neon rounded-xl border border-green-500/30 overflow-hidden">
        <div className="p-6 border-b border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">Profile Details</h3>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editedProfile.name || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editedProfile.email || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Department</label>
                <input
                  type="text"
                  value={editedProfile.department || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  placeholder="Enter your department"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={!editedProfile.name || !editedProfile.email || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Full Name</p>
                  <p className="text-white font-medium">{profile.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Email Address</p>
                  <p className="text-white font-medium">{profile.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Role</p>
                  <p className="text-white font-medium">{profile.role}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Department</p>
                  <p className="text-white font-medium">{profile.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-green-500/20">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Member Since</p>
                  <p className="text-white font-medium">
                    {profile.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Last Login</p>
                  <p className="text-white font-medium">
                    {profile.lastLogin.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Section */}
      <div className="glass-neon rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold text-green-400">Change Password</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
              placeholder="Enter current password"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              disabled={isLoading}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* 2FA Settings */}
      <div className="glass-neon rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">Two-Factor Authentication</h3>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            profile.mfaEnabled 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          )}>
            {profile.mfaEnabled ? 'ENABLED' : 'DISABLED'}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-slate-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              onClick={profile.mfaEnabled ? undefined : handleEnableMFA}
              disabled={profile.mfaEnabled || isLoading}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors",
                profile.mfaEnabled 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed" 
                  : "bg-green-500 hover:bg-green-600 text-black disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {profile.mfaEnabled ? 'Enabled' : 'Enable 2FA'}
            </button>
          </div>

          {profile.mfaEnabled && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-green-500/20">
                  <Smartphone className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-white">SMS</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-green-500/20">
                  <Mail className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-white">Email</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-green-500/20">
                  <Camera className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-white">Authenticator</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
