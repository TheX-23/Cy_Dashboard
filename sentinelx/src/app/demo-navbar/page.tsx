"use client";

import { ModernNavbar } from "@/components/navigation/modern-navbar";
import { Shield, Activity, TrendingUp, Users, Settings } from "lucide-react";

export default function DemoNavbarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <ModernNavbar currentPath="/demo-navbar" />
      
      {/* Demo Content */}
      <div className="pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Modern Navigation Bar Demo
            </h1>
            <p className="text-xl text-slate-400">
              Responsive navbar with glassmorphism, animations, and dark/light theme toggle
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Responsive Design</h3>
              </div>
              <p className="text-slate-300">
                Mobile-first design with hamburger menu and smooth transitions
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Smooth Animations</h3>
              </div>
              <p className="text-slate-300">
                Hover effects with scale, color transitions, and Framer Motion
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Glassmorphism</h3>
              </div>
              <p className="text-slate-300">
                Modern glass effect with backdrop blur and transparency
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Theme Toggle</h3>
              </div>
              <p className="text-slate-300">
                Dark/light mode switch with smooth transitions
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Settings className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Active States</h3>
              </div>
              <p className="text-slate-300">
                Dynamic highlighting for current page with animated indicators
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">TypeScript</h3>
              </div>
              <p className="text-slate-300">
                Full type safety with proper interfaces and props
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/30 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Features Demonstrated</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3">✨ Animations</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Hover scale effect (scale-110)</li>
                  <li>• Smooth color transitions (300ms)</li>
                  <li>• Framer Motion animations</li>
                  <li>• Active tab indicators</li>
                  <li>• Mobile menu transitions</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3">🎨 Styling</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Glassmorphism effect</li>
                  <li>• Dark/light theme support</li>
                  <li>• Responsive design</li>
                  <li>• Modern UI patterns</li>
                  <li>• Tailwind CSS utilities</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-3">📱 Responsive</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Mobile hamburger menu</li>
                  <li>• Tablet and desktop layouts</li>
                  <li>• Touch-friendly interactions</li>
                  <li>• Adaptive spacing</li>
                  <li>• Flexible grid system</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">⚡ Performance</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>• Optimized re-renders</li>
                  <li>• Efficient state management</li>
                  <li>• Smooth 60fps animations</li>
                  <li>• Minimal bundle size</li>
                  <li>• Accessibility features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
