"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Settings, Wifi, WifiOff, Activity, AlertTriangle, Shield, LogOut, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/use-auth';

interface TopbarEnhancedProps {
  onMenuClick?: () => void;
}

export function TopbarEnhanced({ onMenuClick }: TopbarEnhancedProps) {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'critical', message: 'Critical incident detected', time: '2 min ago' },
    { id: 2, type: 'warning', message: 'High-risk alert triggered', time: '5 min ago' },
    { id: 3, type: 'info', message: 'System update available', time: '1 hour ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    cpu: 45,
    memory: 62,
    network: 89,
    storage: 73
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Load user from localStorage
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        } else {
          // Fallback user for demo
          setCurrentUser({
            email: 'admin@sentinelx.com',
            name: 'Admin User',
            role: 'Administrator'
          });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setCurrentUser({
          email: 'admin@sentinelx.com',
          name: 'Admin User',
          role: 'Administrator'
        });
      }
    };

    loadUser();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        cpu: Math.max(20, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(95, prev.memory + (Math.random() - 0.5) * 5)),
        network: Math.max(50, Math.min(100, prev.network + (Math.random() - 0.5) * 8)),
        storage: Math.max(40, Math.min(85, prev.storage + (Math.random() - 0.5) * 3))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  
  // Handle logout
  const handleLogout = async () => {
    try {
      // Use the useAuth hook properly
      const { logout } = useAuth.getState();
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback - clear all data and redirect
      localStorage.clear();
      window.location.href = '/';
    }
  };

  // Get user initials for avatar
  const getUserInitials = (user: any) => {
    if (user?.name) {
      return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const getStatusColor = (value: number) => {
    if (value >= 80) return 'text-red-400';
    if (value >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <Shield className="h-4 w-4" />;
      case 'info': return <Activity className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'info': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-30 border-b transition-all duration-300",
      isDarkMode 
        ? "bg-navbar border-border"
        : "bg-white border-gray-200"
    )}>
      <div className="flex min-w-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        {/* Left Section - Search */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4 sm:max-w-2xl sm:pr-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-muted-foreground hover:text-green-400 transition-colors md:hidden"
          >
            <Settings className="h-5 w-5" />
          </button>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search across SentinelX..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value || '')}
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-lg transition-all duration-300",
                isDarkMode
                  ? "bg-background border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring/50 focus:border-ring/50"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              )}
            />
          </div>
        </div>

        {/* Center Section - System Status */}
        <div className="hidden min-w-0 shrink-0 items-center gap-4 lg:flex xl:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">CPU:</span>
            <span className={cn("text-sm font-medium", getStatusColor(systemStatus.cpu))}>
              {systemStatus.cpu}%
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Memory:</span>
            <span className={cn("text-sm font-medium", getStatusColor(systemStatus.memory))}>
              {systemStatus.memory}%
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Network:</span>
            <span className={cn("text-sm font-medium", getStatusColor(systemStatus.network))}>
              {systemStatus.network}%
            </span>
          </div>
        </div>

        {/* Right Section - Notifications & User */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Connection Status */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
            isDarkMode
              ? "bg-card border-border"
              : "bg-gray-100 border-gray-200"
          )}>
            {isOnline ? (
              <>
                <Wifi className={cn("h-4 w-4", isDarkMode ? "text-primary" : "text-green-600")} />
                <span className={cn("text-sm font-medium", isDarkMode ? "text-primary" : "text-gray-700")}>Online</span>
              </>
            ) : (
              <>
                <WifiOff className={cn("h-4 w-4", isDarkMode ? "text-destructive" : "text-red-600")} />
                <span className={cn("text-sm font-medium", isDarkMode ? "text-destructive" : "text-red-600")}>Offline</span>
              </>
            )}
          </div>

          {/* Notifications */}
          <div className="relative z-50">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "relative p-2 rounded-lg transition-all duration-300",
                isDarkMode
                  ? "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  : "text-gray-600 hover:text-gray-700 hover:bg-gray-200"
              )}
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="card-theme absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,20rem)] rounded-lg border border-border shadow-2xl transition-theme sm:w-80">
                <div className="border-b border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "border-b border-border/60 p-4 transition-colors hover:bg-accent/40",
                        getNotificationColor(notification.type)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">{notification.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {notifications.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Info */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2 py-1.5 sm:px-3 sm:py-2",
                isDarkMode
                  ? "border-border bg-card/80"
                  : "border-gray-200 bg-gray-50",
              )}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white dark:bg-green-500">
                {currentUser ? getUserInitials(currentUser) : "AD"}
              </div>
              <span
                className={cn(
                  "hidden max-w-[140px] truncate text-sm md:inline lg:max-w-[200px]",
                  isDarkMode ? "text-foreground" : "text-gray-900",
                )}
              >
                {currentUser?.email || "admin@sentinelx.com"}
              </span>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div
        className={cn(
          "border-t px-4 py-2 sm:px-6",
          isDarkMode ? "border-border bg-card/30" : "border-gray-200 bg-gray-50/80",
        )}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500 dark:bg-green-400" />
            <span className="font-medium text-green-700 dark:text-green-400">
              Detection Engine: Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Threat Level:</span>
            <span className="font-medium text-amber-600 dark:text-yellow-400">Elevated</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Active Incidents:</span>
            <span className="font-medium text-red-600 dark:text-red-400">3</span>
          </div>
        </div>
      </div>
    </header>
  );
}
