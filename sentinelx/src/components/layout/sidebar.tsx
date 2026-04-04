"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Activity,
  Siren,
  FolderKanban,
  Radar,
  Settings,
  Workflow,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "SOC Dashboard", icon: Shield, gradient: "from-green-400 to-emerald-500" },
  { href: "/logs", label: "Log Explorer", icon: Activity, gradient: "from-cyan-400 to-blue-500" },
  { href: "/alerts", label: "Alerts", icon: Siren, gradient: "from-red-500 to-pink-600" },
  { href: "/incidents", label: "Incidents", icon: FolderKanban, gradient: "from-orange-500 to-amber-600" },
  { href: "/intel", label: "Threat Intel", icon: Radar, gradient: "from-purple-500 to-indigo-600" },
  { href: "/soar", label: "SOAR", icon: Workflow, gradient: "from-green-500 to-cyan-600" },
  { href: "/settings", label: "Admin Settings", icon: Settings, gradient: "from-slate-600 to-gray-700" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isNearSidebar, setIsNearSidebar] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const distanceFromLeft = e.clientX;
      // Trigger expansion when mouse is within 100px of the left edge
      setIsNearSidebar(distanceFromLeft < 100);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Auto-expand when mouse is near sidebar
    if (isNearSidebar && !isExpanded) {
      setIsExpanded(true);
    } else if (!isNearSidebar && !isHovering && isExpanded) {
      // Collapse after delay when mouse leaves area
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isNearSidebar, isHovering, isExpanded]);

  return (
    <>
      {/* Hover detection zone - invisible area that triggers expansion */}
      <div 
        className="fixed left-0 top-0 h-full w-[120px] z-40"
        onMouseEnter={() => setIsNearSidebar(true)}
        onMouseLeave={() => setIsNearSidebar(false)}
      />
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "relative h-screen transition-all duration-500 ease-out z-50",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-slate-900/95 before:via-slate-800/90 before:to-slate-900/95 before:backdrop-blur-xl before:border-r before:from-slate-700/20 before:via-slate-600/10 before:to-slate-700/20",
          isExpanded ? "w-80" : "w-20"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
        
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/30">
            <div className={cn(
              "relative group transition-all duration-500",
              isExpanded ? "text-left" : "text-center"
            )}>
              {/* Logo container with glow */}
              <div className={cn(
                "relative inline-flex items-center justify-center transition-all duration-500",
                isExpanded ? "mb-4" : "mb-2"
              )}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-500 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-slate-900 to-black rounded-lg p-3 border border-green-500/30 shadow-lg glass-neon">
                  <Sparkles className={cn(
                    "transition-all duration-300 text-neon neon-pulse",
                    isExpanded ? "h-6 w-6" : "h-5 w-5"
                  )} />
                </div>
              </div>
              
              <div className={cn(
                "transition-all duration-500 space-y-1",
                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none absolute"
              )}>
                <p className="text-xs font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent tracking-widest text-neon">
                  SENTINELX
                </p>
                <p className="text-xs text-slate-400 font-medium">Enterprise SOC Platform</p>
              </div>
              
              {!isExpanded && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full neon-pulse" />
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item, index) => {
              const active = pathname.startsWith(item.href);
              const isHovered = hoveredItem === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center rounded-xl transition-all duration-300 overflow-hidden",
                    "before:absolute before:inset-0 before:bg-gradient-to-r before:opacity-0 before:transition-opacity before:duration-300",
                    active 
                      ? "before:opacity-20 text-white shadow-lg shadow-cyan-500/25 border border-cyan-500/30" 
                      : "text-slate-400 hover:text-white hover:before:opacity-10 border border-transparent",
                    isExpanded ? "gap-4 px-4 py-3" : "gap-0 justify-center px-3 py-3"
                  )}
                  style={{
                    backgroundImage: active ? `linear-gradient(135deg, ${item.gradient.split(' ').join(', ')})` : undefined,
                    backgroundSize: active ? '200% 200%' : undefined,
                    animation: active ? 'gradient 3s ease infinite' : undefined,
                  }}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={!isExpanded ? item.label : undefined}
                >
                  {/* Hover glow effect */}
                  {isHovered && !active && (
                    <div className="absolute inset-0 bg-gradient-to-r opacity-10 rounded-xl" 
                      style={{ backgroundImage: `linear-gradient(135deg, ${item.gradient.split(' ').join(', ')})` }} 
                    />
                  )}
                  
                  {/* Icon container */}
                  <div className={cn(
                    "relative flex items-center justify-center transition-all duration-300",
                    isExpanded ? "" : "w-full"
                  )}>
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      active 
                        ? "bg-white/20 backdrop-blur-sm" 
                        : isHovered 
                          ? "bg-white/10 backdrop-blur-sm" 
                          : "bg-slate-800/50"
                    )}>
                      <item.icon className={cn(
                        "transition-all duration-300",
                        isExpanded ? "h-5 w-5" : "h-4 w-4",
                        active || isHovered ? "text-white" : "text-inherit"
                      )} />
                    </div>
                    
                    {/* Active indicator dot */}
                    {active && (
                      <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50" />
                    )}
                  </div>
                  
                  {/* Text */}
                  <span className={cn(
                    "font-medium transition-all duration-300",
                    isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none absolute"
                  )}>
                    {item.label}
                  </span>
                  
                  {/* Hover arrow */}
                  {isHovered && isExpanded && (
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-slate-700/30">
            {/* Toggle button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "group relative w-full flex items-center justify-center p-3 rounded-xl transition-all duration-300",
                "bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30",
                "hover:from-slate-700/50 hover:to-slate-600/50 hover:border-slate-500/50",
                "hover:shadow-lg hover:shadow-slate-500/10"
              )}
              aria-label="Toggle sidebar"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Menu className={cn(
                "h-5 w-5 transition-all duration-500 relative z-10",
                isExpanded ? "rotate-180" : "rotate-0"
              )} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
