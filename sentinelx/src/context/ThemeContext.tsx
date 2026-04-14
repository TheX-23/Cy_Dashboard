"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  isDarkMode: boolean;
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync state from persisted preference once mounted.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      setIsDarkMode(saved !== "light");
    } catch {
      setIsDarkMode(true);
    }
  }, []);

  // Apply class and persist whenever theme changes.
  useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", isDarkMode);
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    } catch (error) {
      console.warn("Could not persist/apply theme:", error);
    }
  }, [isDarkMode]);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const value = useMemo(() => ({
    isDarkMode,
    theme: (isDarkMode ? 'dark' : 'light') as Theme,
    toggleTheme
  }), [isDarkMode, toggleTheme]);

  if (!children) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
