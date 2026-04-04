"use client";

import { motion } from 'framer-motion';
import { Shield, CheckCircle, TrendingUp, Users, Award } from 'lucide-react';

const trustStats = [
  {
    icon: Shield,
    value: '99.9%',
    label: 'Threat Detection Accuracy',
    description: 'Industry-leading detection rate',
  },
  {
    icon: CheckCircle,
    value: '10M+',
    label: 'Threats Blocked',
    description: 'Protected across all platforms',
  },
  {
    icon: TrendingUp,
    value: '< 1s',
    label: 'Response Time',
    description: 'Lightning-fast threat response',
  },
  {
    icon: Users,
    value: '5000+',
    label: 'Security Teams',
    description: 'Trusted by professionals',
  },
];

const trustBadges = [
  { name: 'SOC 2 Type II', description: 'Security compliance certified' },
  { name: 'GDPR Compliant', description: 'Data protection standards' },
  { name: 'ISO 27001', description: 'Information security management' },
  { name: 'FedRAMP Authorized', description: 'Government security standards' },
];

export function TrustSection() {
  return (
    <section id="security" className="py-20 bg-gradient-to-b from-black via-slate-900 to-black">
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
            Trusted by Security Teams Worldwide
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Join thousands of organizations that rely on SentinelX for their security operations.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className="text-center"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 mb-4"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <Icon className="h-8 w-8 text-green-400" />
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-white mb-1">
                    {stat.label}
                  </div>
                  <p className="text-sm text-slate-400">
                    {stat.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl border border-green-500/30 backdrop-blur-md">
              <Award className="h-6 w-6 text-green-400" />
              <span className="text-white text-lg font-medium">
                Enterprise-Grade Security & Compliance
              </span>
              <Award className="h-6 w-6 text-blue-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className="text-center"
              >
                <motion.div
                  className="p-6 bg-black/40 backdrop-blur-md rounded-xl border border-slate-700/50 hover:border-green-500/30 transition-all duration-300"
                  whileHover={{ 
                    y: -5,
                    borderColor: 'rgba(57, 255, 20, 0.3)',
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">
                    {badge.name}
                  </h4>
                  <p className="text-sm text-slate-400">
                    {badge.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Customer Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-green-500/20 backdrop-blur-md">
            <blockquote className="text-lg text-white mb-4 italic">
              "SentinelX has transformed our security operations. The real-time threat detection and automated response capabilities have reduced our incident response time by 95%."
            </blockquote>
            <cite className="text-green-400 font-semibold">
              — Chief Security Officer, Fortune 500 Company
            </cite>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
