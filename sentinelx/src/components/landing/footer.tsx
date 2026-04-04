"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

const GithubIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TwitterIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
  </svg>
);

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Platform', href: '#platform' },
      { name: 'Security', href: '#security' },
      { name: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Support', href: '/support' },
      { name: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Compliance', href: '/compliance' },
    ],
  },
];

const socialLinks = [
  { icon: GithubIcon, href: 'https://github.com', label: 'GitHub' },
  { icon: TwitterIcon, href: 'https://twitter.com', label: 'Twitter' },
  { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top visibility
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setShowScrollTop(window.scrollY > 300);
    });
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black border-t border-green-500/20">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-green-500 to-green-400 text-black rounded-full shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-8 w-8 text-green-400" />
                <span className="text-xl font-bold text-white">SentinelX</span>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Enterprise-grade cybersecurity platform powered by AI and real-time threat intelligence.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="h-4 w-4 text-green-400" />
                  <span className="text-sm">security@sentinelx.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Phone className="h-4 w-4 text-green-400" />
                  <span className="text-sm">1-800-SECURITY</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerLinks.map((section) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-white font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <motion.a
                        href={link.href}
                        className="text-slate-400 hover:text-green-400 transition-colors text-sm"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.name}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-green-500/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-slate-400 text-sm"
            >
              © {new Date().getFullYear()} SentinelX. All rights reserved.
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4"
            >
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                    whileHover={{ 
                      scale: 1.2,
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.5 }
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </motion.div>

            {/* Security Badges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                <span className="text-xs text-green-400 font-medium">SOC 2</span>
              </div>
              <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <span className="text-xs text-blue-400 font-medium">GDPR</span>
              </div>
              <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full">
                <span className="text-xs text-purple-400 font-medium">ISO 27001</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_24%,rgba(57,255,20,0.05)_25%,transparent_26%,transparent_74%,rgba(0,245,255,0.05)_75%,transparent_76%,transparent)] bg-[length:60px_60px]" />
      </div>
    </footer>
  );
}
