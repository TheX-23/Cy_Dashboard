"use client";

import { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  isLoading?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, showPasswordToggle, isLoading, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputType = showPasswordToggle && props.type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : props.type;

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-slate-300 block">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          
          <input
            {...props}
            ref={ref}
            type={inputType}
            className={cn(
              "w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 focus:shadow-lg focus:shadow-green-500/25",
              "transition-all duration-300",
              icon ? "pl-12" : "",
              error ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500" : "",
              isLoading ? "opacity-50 cursor-not-allowed" : "",
              className
            )}
            disabled={isLoading}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          {showPasswordToggle && props.type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-green-400 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent animate-spin"></div>
            </div>
          )}
          
          {/* Glow effect on focus */}
          {isFocused && (
            <div className="absolute inset-0 rounded-lg border-2 border-green-400 opacity-20 pointer-events-none animate-pulse"></div>
          )}
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
