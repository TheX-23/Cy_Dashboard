"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Activity, Zap, Globe } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-slate-900 to-black">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center justify-center lg:justify-start gap-3 mb-8"
              >
                <div className="relative">
                  <Shield className="h-12 w-12 text-green-400" />
                  <motion.div
                    className="absolute inset-0 blur-sm opacity-50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Shield className="h-12 w-12 text-green-400" />
                  </motion.div>
                </div>
                <span className="text-4xl md:text-5xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    SentinelX
                  </span>
                </span>
              </motion.div>
                
              <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xl md:text-2xl text-slate-300 mb-8"
                >
                  Enterprise cybersecurity platform providing real-time threat detection,
                  automated response, and comprehensive security monitoring.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <motion.a
                    href="/login"
                    className={cn(
                      "group relative px-8 py-4 bg-gradient-to-r from-green-500 to-green-400 text-black font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:from-green-400 hover:to-green-500",
                      "transform hover:scale-105 active:scale-95"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300" />
                  </motion.a>

                  <motion.a
                    href="#platform"
                    className={cn(
                      "group relative px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-slate-300 font-semibold text-lg rounded-xl transition-all duration-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-600",
                      "transform hover:scale-105 active:scale-95"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Platform
                    <Globe className="ml-2 h-5 w-5 transition-transform duration-300" />
                  </motion.a>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                >
                  {[
                    { icon: Activity, title: "Real-time Detection", desc: "Advanced threat detection algorithms" },
                    { icon: Shield, title: "Automated Response", desc: "SOAR playbooks for instant mitigation" },
                    { icon: Zap, title: "AI-Powered", desc: "Machine learning for enhanced accuracy" }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className="text-center"
                    >
                      <feature.icon className="h-8 w-8 mx-auto mb-3 text-green-400" />
                      <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                      <p className="text-slate-400 text-sm">{feature.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block"
            >
              <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
                <h3 className="text-white font-bold text-xl mb-6 text-center">
                  Live Threat Map
                </h3>
                <div className="relative h-64 bg-slate-900/50 rounded-lg overflow-hidden">
                  <motion.div
                    className="absolute w-4 h-4 bg-green-400 rounded-full blur-lg"
                    animate={{
                      x: mousePosition.x - 8,
                      y: mousePosition.y - 8,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 28,
                    }}
                  />
                  
                  <div className="absolute inset-0">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute border border-slate-700/30 rounded"
                        style={{
                          left: `${20 + (i % 3) * 30}%`,
                          top: `${20 + Math.floor(i / 3) * 30}%`,
                          width: "2px",
                          height: "2px",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
    </section>
  );
}
