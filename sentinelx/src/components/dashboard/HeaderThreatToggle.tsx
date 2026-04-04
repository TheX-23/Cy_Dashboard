import React from 'react';
import { motion } from 'framer-motion';
import { Bell, ShieldAlert } from 'lucide-react';

interface HeaderThreatToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  hasNotifications: boolean;
  isMobile?: boolean;
}

export const HeaderThreatToggle: React.FC<HeaderThreatToggleProps> = ({
  isOpen,
  onToggle,
  hasNotifications,
  isMobile = false
}) => {
  return (
    <motion.button
      onClick={onToggle}
      className={`relative flex items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-accent dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 ${
        isMobile ? "h-10 w-10" : "h-12 w-12"
      }`}
      whileHover={{ scale: 1.1 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.8 }}
    >
      {/* Icon */}
      <ShieldAlert 
        className={`text-green-400 ${
          isMobile ? 'w-5 h-5' : 'w-6 h-6'
        }`} 
      />
      
      {/* Notification Badge */}
      {hasNotifications && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-card bg-red-500 dark:border-gray-800"
        />
      )}
    </motion.button>
  );
};

export default HeaderThreatToggle;
