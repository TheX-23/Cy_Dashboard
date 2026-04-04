"use client";

import { Shield, Activity, Zap, Globe, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-slate-900 to-black">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                <Shield className="h-12 w-12 text-green-400" />
                <span className="text-4xl md:text-5xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    SentinelX
                  </span>
                </span>
              </div>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-8">
                Enterprise cybersecurity platform providing real-time threat detection,
                automated response, and comprehensive security monitoring.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="/login"
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-400 text-black font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:from-green-400 hover:to-green-500 transform hover:scale-105 active:scale-95"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 inline" />
                </a>

                <a
                  href="#platform"
                  className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-slate-300 font-semibold text-lg rounded-xl transition-all duration-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-600 transform hover:scale-105 active:scale-95"
                >
                  View Platform
                  <Globe className="ml-2 h-5 w-5 inline" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { icon: Activity, title: "Real-time Detection", desc: "Advanced threat detection algorithms" },
                  { icon: Shield, title: "Automated Response", desc: "SOAR playbooks for instant mitigation" },
                  { icon: Zap, title: "AI-Powered", desc: "Machine learning for enhanced accuracy" }
                ].map((feature) => (
                  <div key={feature.title} className="text-center">
                    <feature.icon className="h-8 w-8 mx-auto mb-3 text-green-400" />
                    <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
