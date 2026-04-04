"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { AuthCard } from '@/components/auth/auth-card';

export default function LoginPage() {
  const handleSignupClick = () => {
    // Navigate to signup page
    window.location.href = '/auth/signup';
  };

  const handleForgotPasswordClick = () => {
    // Handle forgot password
    console.log('Forgot password clicked');
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to your SentinelX account"
    >
      <LoginForm />
    </AuthCard>
  );
}
