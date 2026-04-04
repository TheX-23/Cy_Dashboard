"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Activity, Zap, Globe } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Particle {
  id: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [mouseTrail, setMouseTrail] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      setMousePosition(newPosition);
      
      // Add to mouse trail
      setMouseTrail(prev => {
        const newTrail = [...prev, { ...newPosition, id: Date.now() }];
        // Keep only last 10 positions
        return newTrail.slice(-10);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
    }));
    setParticles(generatedParticles);
  }, [isClient]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-slate-900 to-black">
      {/* Animated Background Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(60deg,transparent_24%,rgba(57,255,20,0.05)_25%,transparent_26%,transparent_74%,rgba(0,245,255,0.05)_75%,transparent_76%,transparent)] bg-[length:80px_80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(57,255,20,0.1)_50%,transparent_100%)]" />
      </div>

      {/* Floating Particles */}
      {isClient && (
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-green-400 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Mouse Trail Effect */}
      {isClient && mouseTrail.map((point, index) => (
        <motion.div
          key={point.id}
          className="absolute w-6 h-6 pointer-events-none"
          style={{
            left: point.x - 12,
            top: point.y - 12,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1, 0],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-r from-green-400/20 to-blue-400/20 backdrop-blur-sm border border-green-400/30" />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="text-center lg:text-left">
              {/* Logo */}
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
              
              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-xl md:text-2xl text-slate-300 mb-8"
              >
                Enterprise cybersecurity platform providing real-time threat detection,
                automated response, and comprehensive security monitoring.
              </motion.p>

              {/* CTA Buttons */}
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

              {/* Feature Highlights */}
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

          {/* Right Side - Enhanced Visual Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
                <h3 className="text-white font-bold text-xl mb-6 text-center">
                  Advanced Security Features
                </h3>
                <div className="space-y-6">
                  {[
                    { icon: Shield, title: "Threat Detection", desc: "Real-time monitoring of potential threats" },
                    { icon: Activity, title: "Automated Response", desc: "Instant mitigation of security incidents" },
                    { icon: Zap, title: "AI Analytics", desc: "Machine learning-powered threat analysis" }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700/30"
                    >
                      <div className="flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                        <p className="text-slate-400 text-sm">{feature.desc}</p>
                      </div>
                    </motion.div>
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
