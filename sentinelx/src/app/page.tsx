"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Lock, Eye, Activity, Database } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero-aligned-enhanced';
import { FeaturesSection } from '@/components/landing/features-section';
import { LivePreview } from '@/components/landing/live-preview';
import { TrustSection } from '@/components/landing/trust-section';
import { Footer } from "@/components/landing/footer-simple";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

const binaryParticles = Array.from({ length: 8 }, (_, i) => ({
  top: ((i * 13 + 17) % 100) + 0.25,
  left: ((i * 29 + 11) % 100) + 0.5,
  duration: 10 + (i % 5),
  delay: (i % 4) * 1.5,
  bit: i % 2 === 0 ? '1' : '0',
}));

const threatIndicators = Array.from({ length: 4 }, (_, i) => ({
  top: 20 + ((i * 17 + 9) % 60),
  left: 10 + ((i * 23 + 7) % 80),
  duration: 3 + (i % 3),
  delay: i * 1.25,
}));

export default function LandingPage() {
  const { isAuthenticated, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router, checkAuth]);

  // Don't render landing page if authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-green-500 border-t-transparent border-r-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Security-Themed Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Security Shield Icons */}
        <motion.div
          className="absolute top-20 left-10 text-green-400/20"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Shield className="w-16 h-16" />
        </motion.div>
        
        {/* Alert Triangle */}
        <motion.div
          className="absolute top-40 right-20 text-yellow-400/15"
          animate={{
            y: [0, 40, 0],
            x: [0, -15, 0],
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <AlertTriangle className="w-12 h-12" />
        </motion.div>
        
        {/* Lock Icon */}
        <motion.div
          className="absolute bottom-32 left-1/4 text-blue-400/20"
          animate={{
            y: [0, -25, 0],
            x: [0, 30, 0],
            rotate: [0, 180, 360, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        >
          <Lock className="w-14 h-14" />
        </motion.div>
        
        {/* Eye Icon (Monitoring) */}
        <motion.div
          className="absolute top-1/3 right-1/3 text-purple-400/15"
          animate={{
            y: [0, 35, 0],
            x: [0, -25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <Eye className="w-12 h-12" />
        </motion.div>
        
        {/* Network/Activity Icons */}
        <motion.div
          className="absolute top-60 left-1/3 text-cyan-400/10"
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            rotate: [0, 45, -45, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        >
          <Activity className="w-10 h-10" />
        </motion.div>
        
        {/* Database Icon */}
        <motion.div
          className="absolute bottom-40 right-1/4 text-orange-400/10"
          animate={{
            y: [0, -15, 0],
            x: [0, -20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        >
          <Database className="w-11 h-11" />
        </motion.div>
        
        {/* Binary Code Particles */}
        {binaryParticles.map((particle, i) => (
          <motion.div
            key={`binary-${i}`}
            className="absolute text-green-400/20 font-mono text-xs"
            style={{
              top: `${particle.top}%`,
              left: `${particle.left}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          >
            {particle.bit}
          </motion.div>
        ))}
        
        {/* Threat Indicators */}
        {threatIndicators.map((indicator, i) => (
          <motion.div
            key={`threat-${i}`}
            className="absolute w-1 h-1 bg-red-400/40 rounded-full"
            style={{
              top: `${indicator.top}%`,
              left: `${indicator.left}%`,
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: indicator.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: indicator.delay,
            }}
          />
        ))}
        
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <motion.line
            x1="10%"
            y1="20%"
            x2="25%"
            y2="60%"
            stroke="rgba(34, 197, 94, 0.1)"
            strokeWidth="1"
            animate={{
              pathLength: [0, 1],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.line
            x1="80%"
            y1="30%"
            x2="65%"
            y2="70%"
            stroke="rgba(59, 130, 246, 0.1)"
            strokeWidth="1"
            animate={{
              pathLength: [0, 1],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </svg>
        
        {/* Floating Grid Lines */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(34, 197, 94, 0.03) 25%, rgba(34, 197, 94, 0.03) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.03) 75%, rgba(34, 197, 94, 0.03) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 197, 94, 0.03) 25%, rgba(34, 197, 94, 0.03) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.03) 75%, rgba(34, 197, 94, 0.03) 76%, transparent 77%, transparent)`,
            backgroundSize: '50px 50px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      
      <Navbar />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <LivePreview />
        <TrustSection />
        
        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-b from-background via-card to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Start Securing Your Infrastructure Today
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Join thousands of security teams who trust SentinelX for their mission-critical operations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/signup"
                  className="group relative px-10 py-4 bg-gradient-to-r from-green-500 to-green-400 text-black font-bold text-lg rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:from-green-400 hover:to-green-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="relative z-10">
                    Get Started Free
                  </span>
                  {/* Button Glow Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500 to-green-400 opacity-0 group-hover:opacity-30 blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.2, 0],
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
                  className="px-10 py-4 text-muted-foreground font-semibold text-lg rounded-xl border border-green-500/30 bg-card/50 backdrop-blur-sm hover:text-foreground hover:border-green-400 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  Login to Dashboard
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
