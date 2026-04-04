"use client";

import { useState, useEffect } from 'react';
import { ModernSidebar } from '@/components/layout/ModernSidebar';
import { TopbarEnhanced } from '@/components/layout/topbar-enhanced';

export default function SocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Close sidebar when clicking outside on mobile
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('[data-sidebar]');
      const menuButton = document.querySelector('[data-menu-button]');
      
      if (sidebarOpen && !sidebar?.contains(target) && !menuButton?.contains(target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen min-h-0 w-full bg-background text-foreground transition-theme">
      {/* Sidebar: in-flow on md+ so main content is not covered */}
      <div
        data-sidebar
        className="relative z-30 hidden shrink-0 md:flex md:min-h-0"
      >
        <ModernSidebar />
      </div>

      {/* Main Content — z-0 so sidebars/tooltips above stray fixed layers inside pages */}
      <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <TopbarEnhanced onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Page Content */}
        <main className="isolate flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          <div className="p-6 pt-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <ModernSidebar />
          </div>
        </div>
      )}
    </div>
  );
}
