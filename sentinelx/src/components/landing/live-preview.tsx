"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Shield, TrendingUp, Globe } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MockData {
  threats: number;
  alerts: number;
  incidents: number;
  uptime: number;
  recentActivity: Array<{
    time: string;
    type: 'threat' | 'alert' | 'incident';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
  }>;
}

export function LivePreview() {
  const [mockData, setMockData] = useState<MockData>({
    threats: 1247,
    alerts: 89,
    incidents: 12,
    uptime: 99.97,
    recentActivity: []
  });

  useEffect(() => {
    // Generate mock activity data
    const activities = [
      { time: '2 min ago', type: 'threat' as const, severity: 'high' as const, message: 'Suspicious login attempt detected' },
      { time: '5 min ago', type: 'alert' as const, severity: 'medium' as const, message: 'Unusual network traffic pattern' },
      { time: '8 min ago', type: 'incident' as const, severity: 'critical' as const, message: 'Potential data exfiltration attempt' },
      { time: '12 min ago', type: 'threat' as const, severity: 'low' as const, message: 'Malware signature detected' },
      { time: '15 min ago', type: 'alert' as const, severity: 'high' as const, message: 'Brute force attack blocked' },
    ];

    setMockData(prev => ({ ...prev, recentActivity: activities }));

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMockData(prev => ({
        ...prev,
        threats: prev.threats + Math.floor(Math.random() * 3),
        alerts: prev.alerts + Math.floor(Math.random() * 2),
        uptime: Math.min(99.99, prev.uptime + Math.random() * 0.01)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'threat': return AlertTriangle;
      case 'alert': return Activity;
      case 'incident': return Shield;
      default: return Activity;
    }
  };

  return (
    <section id="platform" className="py-20 bg-gradient-to-b from-black via-slate-900/50 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Live Security Dashboard
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Experience real-time threat detection and monitoring in action.
          </p>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Glassmorphism Container - single background layer */}
          <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl border border-green-500/20 p-8 shadow-2xl shadow-green-500/10 overflow-hidden">
            {/* Single unified background - no overlapping */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(57,255,20,0.1)_0%,transparent_50%)] rounded-3xl" style={{ zIndex: 0 }} />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-3xl font-bold text-green-400">
                    {mockData.threats.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-400">Threats Detected</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400 mr-2" />
                  <span className="text-3xl font-bold text-orange-400">
                    {mockData.alerts}
                  </span>
                </div>
                <p className="text-sm text-slate-400">Active Alerts</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <Shield className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-3xl font-bold text-red-400">
                    {mockData.incidents}
                  </span>
                </div>
                <p className="text-sm text-slate-400">Incidents</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-3xl font-bold text-blue-400">
                    {mockData.uptime}%
                  </span>
                </div>
                <p className="text-sm text-slate-400">Uptime</p>
              </motion.div>
            </div>

            {/* Activity Feed */}
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 text-green-400 mr-2" />
                Live Activity Feed
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {mockData.recentActivity.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        "bg-black/30 backdrop-blur-sm border-slate-700/50"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        getSeverityColor(activity.severity)
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">{activity.time}</span>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            getSeverityColor(activity.severity)
                          )}>
                            {activity.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-white">{activity.message}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Animated Globe */}
            <motion.div
              className="absolute top-8 right-8"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <div className="relative">
                <Globe className="h-16 w-16 text-green-400/20" />
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Globe className="h-16 w-16 text-green-400" />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            animate={{
              boxShadow: [
                '0 0 20px rgba(57, 255, 20, 0.3)',
                '0 0 40px rgba(57, 255, 20, 0.1)',
                '0 0 20px rgba(57, 255, 20, 0.3)',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-lg text-slate-300 mb-6">
            Ready to secure your infrastructure?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/signup"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-400 text-black font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:from-green-400 hover:to-green-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Start Free Trial
            </motion.a>
            <motion.a
              href="/login"
              className="px-8 py-3 text-slate-300 font-semibold rounded-lg border border-green-500/30 bg-black/50 backdrop-blur-sm hover:text-white hover:border-green-400 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              View Dashboard
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
