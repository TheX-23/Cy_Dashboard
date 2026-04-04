"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SignupForm } from '@/components/auth/signup-form';
import { AuthCard } from '@/components/auth/auth-card';

export default function SignupPage() {
  const handleLoginClick = () => {
    // Navigate to login page
    window.location.href = '/auth/login';
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle="Join SentinelX to secure your digital world"
    >
      <SignupForm onLoginClick={handleLoginClick} />
    </AuthCard>
  );
}
