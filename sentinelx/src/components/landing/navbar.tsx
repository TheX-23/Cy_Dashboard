"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Shield, Activity, Lock, Zap, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils/cn';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Smooth transition based on scroll position
      if (currentScrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate dynamic values based on scroll
  const navbarHeight = Math.max(56, 64 - scrollY * 0.08); // Shrinks from 64px to 56px
  const navbarPadding = Math.max(8, 16 - scrollY * 0.08); // Shrinks padding
  const logoSize = Math.max(24, 32 - scrollY * 0.08); // Shrinks logo
  const fontSize = Math.max(16, 20 - scrollY * 0.04); // Shrinks text
  const iconSize = Math.max(14, 16 - scrollY * 0.02); // Shrinks icons

  const navItems = [
    { name: 'Features', href: '#features', icon: Activity },
    { name: 'Platform', href: '#platform', icon: Shield },
    { name: 'Security', href: '#security', icon: Lock },
    { name: 'Pricing', href: '#pricing', icon: Zap },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={{ height: `${navbarHeight}px` }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          isScrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-green-500/30 shadow-lg shadow-black/20"
            : "bg-transparent"
        )}
      >
        <div 
          className="max-w-7xl mx-auto transition-all duration-500 ease-out"
          style={{ 
            paddingLeft: `${navbarPadding * 4}px`,
            paddingRight: `${navbarPadding * 4}px`,
            paddingTop: `${navbarPadding}px`,
            paddingBottom: `${navbarPadding}px`
          }}
        >
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-2 group transition-all duration-500 ease-out"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="relative">
                <Shield 
                  className="text-green-400 group-hover:text-green-300 transition-all duration-500 ease-out"
                  style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                />
                <motion.div
                  className="absolute inset-0 blur-sm opacity-50"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Shield 
                    className="text-green-400"
                    style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                  />
                </motion.div>
              </div>
              <motion.span 
                className="font-bold text-white group-hover:text-green-400 transition-all duration-500 ease-out"
                style={{ fontSize: `${fontSize}px` }}
              >
                SentinelX
              </motion.span>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition-all duration-500 ease-out"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <Icon 
                      className="transition-all duration-500 ease-out"
                      style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                    />
                    <motion.span 
                      className="font-medium transition-all duration-500 ease-out"
                      style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}
                    >
                      {item.name}
                    </motion.span>
                  </motion.a>
                );
              })}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <motion.a
                    href="/login"
                    className="px-4 py-2 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-all duration-500 ease-out"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}
                  >
                    <LogIn className="inline-block mr-2" style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                    Login
                  </motion.a>
                  <motion.a
                    href="/signup"
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-400 text-black font-semibold rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-500 ease-out shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}
                  >
                    <UserPlus className="inline-block mr-2" style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                    Sign Up
                  </motion.a>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex items-center gap-2 px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg transition-all duration-500 ease-out"
                    style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-xs"
                      style={{ width: `${Math.max(16, iconSize + 2)}px`, height: `${Math.max(16, iconSize + 2)}px` }}
                    >
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                    </div>
                    <span className="text-white">{user?.email || 'admin@sentinelx.com'}</span>
                  </motion.div>
                  <motion.button
                    onClick={logout}
                    className="px-4 py-2 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-all duration-500 ease-out"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ fontSize: `${Math.max(12, fontSize - 2)}px` }}
                  >
                    Logout
                  </motion.button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          x: isMobileMenuOpen ? 0 : "100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 z-50 md:hidden"
      >
        {/* Backdrop */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Content */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: isMobileMenuOpen ? 0 : "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute right-0 top-0 h-full w-80 bg-black/95 backdrop-blur-md border-l border-green-500/20"
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-green-500/20">
              <span className="text-white font-semibold">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Navigation Items */}
            <div className="flex-1 p-4">
              <div className="space-y-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg text-slate-300 hover:text-green-400 hover:bg-green-500/10 transition-all"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Mobile Auth Section */}
            <div className="p-4 border-t border-green-500/20">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <motion.a
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center text-slate-300 hover:text-white transition-colors"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LogIn className="h-4 w-4 mr-2 inline" />
                    Login
                  </motion.a>
                  <motion.a
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center bg-gradient-to-r from-green-500 to-green-400 text-black font-semibold rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <UserPlus className="h-4 w-4 mr-2 inline" />
                    Sign Up
                  </motion.a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="px-4 py-2 text-slate-300 text-sm">
                    Welcome, {user?.name}
                  </div>
                  <motion.button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-center text-slate-300 hover:text-red-400 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    Logout
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
