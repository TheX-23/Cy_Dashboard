"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Activity, 
  TrendingUp, 
  Globe, 
  Shield, 
  AlertTriangle, 
  Users, 
  Settings, 
  Menu, 
  X,
  ChevronRight,
  ChevronLeft,
  LogOut,
  User,
  Bell,
  Lock,
  Unlock,
  Key
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  active?: boolean;
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed = false, 
  onToggle,
  className = '' 
}) => {
  const [activeItem, setActiveItem] = useState<string>('dashboard');

  const navigationItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/dashboard',
      badge: 3
    },
    {
      id: 'logs',
      label: 'Log Explorer',
      icon: <Activity className="w-5 h-5" />,
      href: '/logs',
      badge: 7
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: <AlertTriangle className="w-5 h-5" />,
      href: '/alerts',
      badge: 12
    },
    {
      id: 'intel',
      label: 'Threat Intel',
      icon: <Shield className="w-5 h-5" />,
      href: '/intel',
      badge: 5
    },
    {
      id: 'soar',
      label: 'SOAR',
      icon: <Lock className="w-5 h-5" />,
      href: '/soar',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      href: '/settings',
    },
    {
      id: 'users',
      label: 'Users',
      icon: <Users className="w-5 h-5" />,
      href: '/users',
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 64 : 240,
        transition: { duration: 0.3, ease: [0.25, 0.1] }
      }}
      className={cn(
        "fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 z-50",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-400 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-slate-900" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">SentinelX</h2>
            <p className="text-xs text-slate-400">Security Operations</p>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute right-4 top-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all duration-300 ease-in-out",
          isCollapsed ? "left-4" : "left-64"
        )}
      >
        {isCollapsed ? (
          <Menu className="w-5 h-5 text-slate-300" />
        ) : (
          <X className="w-5 h-5 text-slate-300" />
        )}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 flex-col space-y-2 py-4">
        <AnimatePresence>
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: { duration: 0.3, delay: index * 0.05 }
              }}
              className={cn(
                "relative",
                activeItem === item.id 
                  ? "bg-slate-700/50 border-l border-green-500/30" 
                  : "hover:bg-slate-700/50"
              )}
            >
              <a
                href={item.href}
                onClick={() => setActiveItem(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ease-in-out",
                  activeItem === item.id 
                    ? "bg-green-500/20 text-green-400 border-l border-green-500/30" 
                    : "hover:bg-slate-700/50"
                )}
              >
                {item.icon}
                <div className="flex-1 min-w-0 flex-1">
                  <span className={cn(
                    "text-sm font-medium",
                    activeItem === item.id 
                      ? "text-white" 
                      : "text-slate-300"
                  )}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={cn(
                      "ml-auto px-2 py-1 text-xs rounded-full",
                      item.badge > 0 
                        ? "bg-red-500 text-white" 
                        : "bg-yellow-500 text-slate-900"
                    )}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
              </a>
            </motion.div>
          ))}
        </AnimatePresence>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-4 left-4 right-4 p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded-full">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-400">Admin User</div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-4 left-4 right-4 p-4 border-t border-slate-700/50">
        <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
