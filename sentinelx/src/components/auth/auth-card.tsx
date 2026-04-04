"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface AuthCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function AuthCard({ children, title, subtitle, className }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Cyber Grid Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full relative">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-full bg-green-500/10"
                style={{
                  left: `${(i + 1) * 5}%`,
                  animation: `pulse ${3 + i * 0.2}s ease-in-out infinite`
                }}
              />
            ))}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-green-500/10"
                style={{
                  top: `${(i + 1) * 6.67}%`,
                  animation: `pulse ${2 + i * 0.1}s ease-in-out infinite`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${10 + Math.random() * 20}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.1
              }}
            />
          ))}
        </div>
      </div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className={cn(
          "glass-neon rounded-2xl border border-green-500/30 p-8 shadow-2xl",
          "backdrop-blur-xl bg-black/80",
          "transform transition-all duration-500 hover:scale-[1.02]",
          className
        )}>
          {/* Logo and Title */}
          <div className="text-center mb-8">
            {/* Animated Logo */}
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50">
                  <svg
                    className="w-10 h-10 text-black"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10 5z"/>
                  </svg>
                </div>
                {/* Logo Glow */}
                <div className="absolute inset-0 rounded-xl bg-green-400 opacity-20 blur-xl animate-pulse"></div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 mb-2">
              SentinelX
            </h1>
            
            {subtitle && (
              <p className="text-slate-400 text-sm">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Add custom animations */
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0) translateX(0);
    }
    25% {
      transform: translateY(-20px) translateX(10px);
    }
    50% {
      transform: translateY(-10px) translateX(-10px);
    }
    75% {
      transform: translateY(-30px) translateX(5px);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.8;
    }
  }
`;
if (!document.head.querySelector('style[data-auth-animations]')) {
  style.setAttribute('data-auth-animations', 'true');
  document.head.appendChild(style);
}
