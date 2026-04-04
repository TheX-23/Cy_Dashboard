"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { InputField } from './input-field';
import { cn } from '@/lib/utils/cn';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface SignupFormProps {
  onLoginClick?: () => void;
}

export function SignupForm({ onLoginClick }: SignupFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: 'Empty', color: 'text-slate-400' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'text-red-400' };
    if (score <= 3) return { score, label: 'Fair', color: 'text-yellow-400' };
    if (score <= 4) return { score, label: 'Good', color: 'text-blue-400' };
    return { score, label: 'Strong', color: 'text-green-400' };
  };

  const handleInputChange = (field: keyof SignupFormData) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate successful signup
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      localStorage.setItem('user_email', formData.email);
      localStorage.setItem('user_name', formData.name);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      setErrors({ email: 'Email already exists' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <InputField
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => handleInputChange('name')(e?.target?.value || '')}
          error={errors.name}
          icon={<User className="h-4 w-4" />}
          isLoading={isLoading}
          autoComplete="name"
        />

        {/* Email Field */}
        <InputField
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email')(e?.target?.value || '')}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
          isLoading={isLoading}
          autoComplete="email"
        />

        {/* Password Field */}
        <div className="space-y-2">
          <InputField
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => handleInputChange('password')(e?.target?.value || '')}
            error={errors.password}
            icon={<Lock className="h-4 w-4" />}
            showPasswordToggle={true}
            isLoading={isLoading}
            autoComplete="new-password"
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Password Strength</span>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 flex-1 rounded-full transition-all duration-300",
                      i < passwordStrength.score 
                        ? "bg-green-400" 
                        : "bg-slate-600"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword')(e?.target?.value || '')}
          error={errors.confirmPassword}
          icon={<Lock className="h-4 w-4" />}
          showPasswordToggle={true}
          isLoading={isLoading}
          autoComplete="new-password"
        />

        {/* Terms and Conditions */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer hover:text-green-400 transition-colors">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms')(e.target.checked)}
              className="w-4 h-4 border border-green-500/30 rounded bg-black/50 text-green-400 focus:ring-2 focus:ring-green-500/50 focus:ring-offset-0 mt-1"
            />
            <span className="flex-1">
              I agree to the{' '}
              <button
                type="button"
                className="text-green-400 hover:text-green-300 underline transition-colors"
              >
                Terms and Conditions
              </button>
              {' '}and{' '}
              <button
                type="button"
                className="text-green-400 hover:text-green-300 underline transition-colors"
              >
                Privacy Policy
              </button>
            </span>
          </label>
          
          {errors.agreeToTerms && (
            <div className="flex items-center gap-2 text-red-400 text-sm animate-pulse">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.agreeToTerms}</span>
            </div>
          )}
        </div>

        {/* Signup Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !formData.agreeToTerms}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full py-3 px-4 rounded-lg font-medium transition-all duration-300",
            "bg-gradient-to-r from-green-400 to-cyan-400 text-black",
            "hover:from-green-500 hover:to-cyan-500",
            "shadow-lg shadow-green-500/25 hover:shadow-green-500/40",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "relative overflow-hidden"
          )}
        >
          {/* Button Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-cyan-400 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <Check className="h-4 w-4" />
              </>
            )}
          </span>
        </motion.button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
            <span className="px-4 bg-black/80 text-xs text-slate-400 uppercase">or</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-600 rounded-lg text-slate-300 hover:border-green-500/50 hover:text-green-400 transition-all duration-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.09-1.38-.52-1.38-.52H2.18c-.88 0-1.38.52-1.38.52V8.38c0-.88.52-1.38 1.52-1.38h18.5c.88 0 1.52.64 1.52 1.52v3.5c0 .88-.64 1.52-1.52 1.52h-18.5c-.88 0-1.52-.64-1.52-1.52v-3.5z"/>
              <path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5zm-1.72-1.5c.66 0 1.2.54 1.2 1.2 0 .66-.54 1.2-1.2H8.08c-.66 0-1.2-.54-1.2-1.2 0-.66.54-1.2 1.2h3.4c.66 0 1.2.54 1.2.1.2zm1.44-2.63c0-.63.18-1.08.18-1.08s1.08-.18 1.08-.18v1.25c0 .63-.18 1.08-.18 1.08-.18h4.32c.63 0 1.08.18 1.08.18 1.08-.18 1.08.18v-1.25z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-600 rounded-lg text-slate-300 hover:border-green-500/50 hover:text-green-400 transition-all duration-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.373 0 12 5.373 0 12-5.373 0-12zm0 1c5.653 0 10.417 4.42 10.917 9.917v.083c0 .5-.417.917-.917.917-.5 0-.917-.417-.917-.917v-.083c-.5 0-.917.417-.917-.917z"/>
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <span className="text-slate-400 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              Sign in
            </button>
          </span>
        </div>
      </form>
    </motion.div>
  );
}
