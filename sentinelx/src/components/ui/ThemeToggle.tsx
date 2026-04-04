"use client";

import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${className} ${
        isDarkMode
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-gray-600'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
      }`}
      aria-label="Toggle theme"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
};
