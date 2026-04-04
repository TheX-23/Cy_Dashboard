import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ShieldAlert } from 'lucide-react';

interface ThreatNewsToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  hasNotifications: boolean;
}

export const ThreatNewsToggle: React.FC<ThreatNewsToggleProps> = ({
  isOpen,
  onToggle,
  hasNotifications
}) => {
  return (
    <motion.button
      onClick={onToggle}
      className="z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-accent dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.8 }}
    >
      {/* Icon */}
      <ShieldAlert className="w-6 h-6 text-green-400" />
    </motion.button>
  );
};

export default ThreatNewsToggle;
