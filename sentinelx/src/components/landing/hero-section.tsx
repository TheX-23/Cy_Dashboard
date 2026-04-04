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
      {/* Animated Background Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(60deg,transparent_24%,rgba(57,255,20,0.05)_25%,transparent_26%,transparent_74%,rgba(0,245,255,0.05)_75%,transparent_76%,transparent)] bg-[length:80px_80px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(57,255,20,0.1)_50%,transparent_100%)]" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Mouse Follow Effect */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: 'radial-gradient(circle, rgba(57, 255, 20, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Animated Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="inline-block">
              <motion.span
                className="bg-gradient-to-r from-green-400 via-blue-400 to-green-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                Defend Your Systems
              </motion.span>
            </span>
            <br />
            <motion.span
              className="inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                in Real-Time
              </span>
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto"
          >
            AI-powered threat detection, real-time monitoring, and automated response.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.a
              href="/signup"
              className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-green-400 text-black font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:from-green-400 hover:to-green-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span className="relative z-10 flex items-center">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
              {/* Button Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500 to-green-400 opacity-0 group-hover:opacity-30 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.a>

            <motion.a
              href="/login"
              className="px-8 py-4 text-slate-300 font-semibold text-lg rounded-xl border border-green-500/30 bg-black/50 backdrop-blur-sm hover:text-white hover:border-green-400 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Login
            </motion.a>
          </motion.div>
        </div>

        {/* Floating Feature Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-10"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="p-3 bg-green-500/10 backdrop-blur-sm rounded-xl border border-green-500/20">
              <Shield className="h-6 w-6 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            className="absolute top-40 right-20"
            animate={{
              y: [0, 10, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <div className="p-3 bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-40 left-20"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <div className="p-3 bg-purple-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20">
              <Zap className="h-6 w-6 text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-20 right-10"
            animate={{
              y: [0, 8, 0],
              rotate: [0, -8, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          >
            <div className="p-3 bg-cyan-500/10 backdrop-blur-sm rounded-xl border border-cyan-500/20">
              <Globe className="h-6 w-6 text-cyan-400" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-6 h-10 border-2 border-green-400/30 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-green-400 rounded-full mt-1" />
        </motion.div>
      </motion.div>
    </section>
  );
}
