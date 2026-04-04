"use client";

import { motion } from 'framer-motion';
import { Shield, Activity, AlertTriangle, Zap, Globe, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}

const features: FeatureCard[] = [
  {
    icon: Shield,
    title: 'Threat Detection Engine',
    description: 'AI-powered detection of advanced threats with real-time analysis and automated response capabilities.',
    gradient: 'from-green-500 to-green-400',
    delay: 0,
  },
  {
    icon: Activity,
    title: 'Real-Time Alerts',
    description: 'Instant notifications for security events with customizable severity levels and notification channels.',
    gradient: 'from-blue-500 to-blue-400',
    delay: 0.1,
  },
  {
    icon: AlertTriangle,
    title: 'Incident Management',
    description: 'Comprehensive incident tracking, assignment, and resolution workflow with detailed analytics.',
    gradient: 'from-orange-500 to-orange-400',
    delay: 0.2,
  },
  {
    icon: Zap,
    title: 'SOAR Automation',
    description: 'Security orchestration and automated response workflows to handle threats automatically.',
    gradient: 'from-purple-500 to-purple-400',
    delay: 0.3,
  },
  {
    icon: Globe,
    title: 'Threat Intelligence',
    description: 'Global threat intelligence feeds and geolocation-based security insights.',
    gradient: 'from-cyan-500 to-cyan-400',
    delay: 0.4,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-black via-slate-900 to-black">
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
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Complete Security Platform
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Enterprise-grade security tools powered by artificial intelligence and real-time threat intelligence.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8, 
                  delay: feature.delay,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group"
              >
                <div className={cn(
                  "relative h-full p-8 rounded-2xl border transition-all duration-300",
                  "bg-black/40 backdrop-blur-sm border-slate-700/50",
                  "hover:border-green-500/30 hover:bg-green-500/5"
                )}>
                  {/* Card Glow Effect */}
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      "bg-gradient-to-r " + feature.gradient
                    )}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0, 0.1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5,
                    }}
                    style={{ filter: 'blur(20px)' }}
                  />

                  {/* Icon */}
                  <motion.div
                    className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center mb-6",
                      "bg-gradient-to-r " + feature.gradient
                    )}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <motion.a
                    href="#"
                    className="inline-flex items-center text-green-400 hover:text-green-300 font-medium transition-colors"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl border border-green-500/30 backdrop-blur-sm">
            <Shield className="h-6 w-6 text-green-400" />
            <span className="text-white text-lg font-medium">
              Military-grade encryption and compliance
            </span>
            <Shield className="h-6 w-6 text-blue-400" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
