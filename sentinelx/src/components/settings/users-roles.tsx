"use client";

import { useState } from 'react';
import { Users, UserPlus, Edit, Trash2, Shield, Save, X, Plus, Key } from 'lucide-react';
import { User, Role } from '@/types/settings';
import { cn } from '@/lib/utils/cn';

interface UsersRolesProps {
  users: User[];
  roles: Role[];
  onUpdateUsers: (users: User[]) => void;
  onUpdateRoles: (roles: Role[]) => void;
  isLoading?: boolean;
}

export function UsersRoles({ users, roles, onUpdateUsers, onUpdateRoles, isLoading }: UsersRolesProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [newRole, setNewRole] = useState<Partial<Role>>({});

  const handleCreateUser = () => {
    if (newUser.email && newUser.name && newUser.role) {
      const user: User = {
        id: `user-${Date.now()}`,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: 'active',
        createdAt: new Date(),
        permissions: [],
        mfaEnabled: false
      };
      
      onUpdateUsers([...users, user]);
      setNewUser({});
      setIsCreatingUser(false);
    }
  };

  const handleCreateRole = () => {
    if (newRole.name && newRole.description) {
      const role: Role = {
        id: `role-${Date.now()}`,
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions || [],
        isSystem: false,
        createdAt: new Date(),
        userCount: 0
      };
      
      onUpdateRoles([...roles, role]);
      setNewRole({});
      setIsCreatingRole(false);
    }
  };

  const handleUpdateUser = (user: User) => {
    onUpdateUsers(users.map(u => u.id === user.id ? user : u));
    setEditingUser(null);
  };

  const handleUpdateRole = (role: Role) => {
    onUpdateRoles(roles.map(r => r.id === role.id ? role : r));
    setEditingRole(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      onUpdateUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role && !role.isSystem && confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      onUpdateRoles(roles.filter(r => r.id !== roleId));
    }
  };

  const handleToggleUserStatus = (userId: string, status: User['status']) => {
    onUpdateUsers(users.map(u => u.id === userId ? { ...u, status } : u));
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'inactive': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      case 'suspended': return 'text-red-400 bg-red-500/10 border-red-500/20';
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

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="glass-neon rounded-xl border border-green-500/30 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-1",
              activeTab === 'users'
                ? "bg-green-500 text-black"
                : "text-slate-400 hover:text-green-400"
            )}
          >
            <Users className="h-4 w-4" />
            <span className="font-medium">Users</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-1",
              activeTab === 'roles'
                ? "bg-green-500 text-black"
                : "text-slate-400 hover:text-green-400"
            )}
          >
            <Shield className="h-4 w-4" />
            <span className="font-medium">Roles</span>
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Add User Form */}
          {isCreatingUser && (
            <div className="glass-neon rounded-xl border border-green-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-green-400">Create New User</h3>
                </div>
                <button
                  onClick={() => {
                    setNewUser({});
                    setIsCreatingUser(false);
                  }}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={newUser.name || ''}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e?.target?.value || '' }))}
                    className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    placeholder="Enter user name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email || ''}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e?.target?.value || '' }))}
                    className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">Role</label>
                  <select
                    value={newUser.role || ''}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e?.target?.value || '' }))}
                    className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  >
                    <option value="">Select a role</option>
                    {roles.filter(r => !r.isSystem).map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleCreateUser}
                  disabled={!newUser.name || !newUser.email || !newUser.role || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  Create User
                </button>
                <button
                  onClick={() => {
                    setNewUser({});
                    setIsCreatingUser(false);
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="glass-neon rounded-xl border border-green-500/30 overflow-hidden">
            <div className="p-4 border-b border-green-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-green-400">User Management</h3>
                </div>
                <button
                  onClick={() => setIsCreatingUser(true)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  Add User
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/50 border-b border-green-500/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-400">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-400">MFA</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Last Login</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-green-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-white font-medium">{user.name}</p>
                          <p className="text-xs text-slate-400">ID: {user.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-white">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-1 text-xs rounded-full border font-medium",
                          getStatusColor(user.status)
                        )}>
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-1 text-xs rounded-full border",
                          user.mfaEnabled 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        )}>
                          {user.mfaEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-white">
                          {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            disabled={isLoading}
                            className="p-1 text-slate-400 hover:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
                            disabled={isLoading}
                            className="p-1 text-slate-400 hover:text-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isLoading}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {/* Add Role Form */}
          {isCreatingRole && (
            <div className="glass-neon rounded-xl border border-green-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-green-400">Create New Role</h3>
                </div>
                <button
                  onClick={() => {
                    setNewRole({});
                    setIsCreatingRole(false);
                  }}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">Role Name</label>
                  <input
                    type="text"
                    value={newRole.name || ''}
                    onChange={(e) => setNewRole(prev => ({ ...prev, name: e?.target?.value || '' }))}
                    className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">Description</label>
                  <textarea
                    value={newRole.description || ''}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e?.target?.value || '' }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    placeholder="Enter role description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">Permissions</label>
                  <div className="space-y-2">
                    {['read:alerts', 'read:incidents', 'write:incidents', 'read:detections', 'read:logs', 'admin:*'].map(permission => (
                      <div key={permission} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={newRole.permissions?.includes(permission) || false}
                          onChange={(e) => {
                            const current = newRole.permissions || [];
                            if (e.target.checked) {
                              setNewRole(prev => ({ ...prev, permissions: [...current, permission] }));
                            } else {
                              setNewRole(prev => ({ ...prev, permissions: current.filter(p => p !== permission) }));
                            }
                          }}
                          className="w-4 h-4 text-green-400 bg-black/50 border border-green-500/30 rounded focus:ring-2 focus:ring-green-500/50"
                        />
                        <label htmlFor={permission} className="text-sm text-white">
                          <span className={getPermissionColor(permission)}>{permission}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleCreateRole}
                  disabled={!newRole.name || !newRole.description || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  Create Role
                </button>
                <button
                  onClick={() => {
                    setNewRole({});
                    setIsCreatingRole(false);
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Roles List */}
          <div className="glass-neon rounded-xl border border-green-500/30 overflow-hidden">
            <div className="p-4 border-b border-green-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-green-400">Role-Based Access Control</h3>
                </div>
                <button
                  onClick={() => setIsCreatingRole(true)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Role
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/50 border-b border-green-500/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Users</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-400">Permissions</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-green-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id} className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium">{role.name}</span>
                          {role.isSystem && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                              SYSTEM
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-300">{role.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white">{role.userCount}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map(permission => (
                            <span key={permission} className={cn(
                              "px-2 py-1 text-xs rounded border",
                              getPermissionColor(permission)
                            )}>
                              {permission}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="px-2 py-1 text-xs rounded border text-slate-400">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingRole(role)}
                            disabled={isLoading || role.isSystem}
                            className="p-1 text-slate-400 hover:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            disabled={isLoading || role.isSystem}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      )}
    </div>
  );
}
