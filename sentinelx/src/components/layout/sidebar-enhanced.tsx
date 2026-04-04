"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { 
  LayoutDashboard, 
  FileText, 
  AlertTriangle, 
  Shield, 
  Globe, 
  Zap, 
  Search, 
  Users, 
  Settings,
  Activity,
  ChevronRight,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
  badge?: {
    count: number;
    color: string;
  };
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'SOC Overview',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    gradient: 'from-green-400 to-cyan-400'
  },
  {
    id: 'logs',
    label: 'Log Explorer',
    href: '/logs',
    icon: <FileText className="h-5 w-5" />,
    gradient: 'from-blue-400 to-purple-400'
  },
  {
    id: 'alerts',
    label: 'Alerts',
    href: '/alerts',
    icon: <AlertTriangle className="h-5 w-5" />,
    gradient: 'from-red-400 to-orange-400',
    badge: { count: 5, color: 'bg-red-500' }
  },
  {
    id: 'incidents',
    label: 'Incidents',
    href: '/incidents',
    icon: <Shield className="h-5 w-5" />,
    gradient: 'from-yellow-400 to-red-400',
    badge: { count: 3, color: 'bg-yellow-500' }
  },
  {
    id: 'intel',
    label: 'Threat Intel',
    href: '/intel',
    icon: <Globe className="h-5 w-5" />,
    gradient: 'from-purple-400 to-pink-400'
  },
  {
    id: 'soar',
    label: 'Automation',
    href: '/soar',
    icon: <Zap className="h-5 w-5" />,
    gradient: 'from-cyan-400 to-green-400'
  },
  {
    id: 'detection',
    label: 'Detection',
    href: '/detection',
    icon: <Search className="h-5 w-5" />,
    gradient: 'from-orange-400 to-red-400',
    badge: { count: 2, color: 'bg-orange-500' }
  },
  {
    id: 'users',
    label: 'Users',
    href: '/users',
    icon: <Users className="h-5 w-5" />,
    gradient: 'from-indigo-400 to-purple-400'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
    gradient: 'from-slate-400 to-gray-400'
  }
];

export const SidebarEnhanced = () => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDarkMode } = useTheme();
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-900/80 dark:bg-black/80 border border-green-500/30 rounded-lg md:hidden"
      >
        {isExpanded ? <X className="h-5 w-5 text-green-400" /> : <Menu className="h-5 w-5 text-green-400" />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-gray-900/95 dark:bg-black/95 border-r border-green-500/30 transition-all duration-300 z-40",
          isExpanded ? "w-64" : "w-20",
          "md:relative md:translate-x-0",
          !isExpanded && "-translate-x-full"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Logo */}
        <div className="p-6 border-b border-green-500/20">
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            !isExpanded && "justify-center"
          )}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50">
                <Sparkles className="w-6 h-6 text-black neon-pulse" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-green-400 opacity-20 blur-xl animate-pulse"></div>
            </div>
            {isExpanded && (
              <div>
                <h1 className="text-xl font-bold text-neon neon-pulse">SENTINELX</h1>
                <p className="text-xs text-slate-400">Security Operations Center</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isHovered = hoveredItem === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-green-500/10",
                  isActive && "bg-green-500/20 border border-green-500/30",
                  !isExpanded && "justify-center"
                )}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Icon */}
                <div className={cn(
                  "relative flex-shrink-0 transition-all duration-300",
                  isActive && "text-green-400",
                  isHovered && "scale-110"
                )}>
                  {item.icon}
                  
                  {/* Glow Effect */}
                  {(isActive || isHovered) && (
                    <div className={cn(
                      "absolute inset-0 rounded-lg opacity-20 blur-md",
                      `bg-gradient-to-r ${item.gradient}`
                    )}></div>
                  )}
                </div>

                {/* Label */}
                {isExpanded && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-green-400" : "text-slate-400 group-hover:text-green-400"
                    )}>
                      {item.label}
                    </span>
                    
                    {/* Badge */}
                    {item.badge && (
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold text-white",
                        item.badge.color
                      )}>
                        {item.badge.count}
                      </span>
                    )}
                  </div>
                )}

                {/* Hover Indicator */}
                {(isHovering || isExpanded) && (
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isActive ? "text-green-400" : "text-slate-400",
                    !isExpanded && "opacity-0"
                  )} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Status */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-500/20">
          <div className={cn(
            "flex items-center gap-2",
            !isExpanded && "justify-center"
          )}>
            <div className="relative">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-50 blur-md animate-ping"></div>
            </div>
            {isExpanded && (
              <span className="text-xs text-green-400">System Online</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-gray-900/50 dark:bg-black/50 z-30 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
}
