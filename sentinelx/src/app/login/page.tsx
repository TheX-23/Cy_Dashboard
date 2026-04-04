"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Shield, Mail, Lock, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { AuthLayout } from '@/components/auth/auth-layout';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
      setIsLoading(false);
    }
  };

  const handleSignupClick = () => {
    router.push('/signup');
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your security dashboard and protect your infrastructure."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {/* Mobile Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center mb-8 lg:hidden"
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
          <span className="ml-3 text-2xl font-bold text-white">SentinelX</span>
        </motion.div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-green-400 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-400 text-black font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <span className="flex items-center justify-center">
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-black border-t-transparent border-r-transparent"
                />
              ) : (
                <>
                  Login to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </span>
          </motion.button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <a
              href="#"
              className="text-green-400 hover:text-green-300 text-sm transition-colors"
            >
              Forgot your password?
            </a>
          </div>
          
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <button
                onClick={handleSignupClick}
                className="text-green-400 hover:text-green-300 font-medium transition-colors inline-flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Sign up for free
              </button>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-xs text-green-400 font-medium">
              Military-grade encryption
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AuthLayout>
  );
}
