"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
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
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount (only explicit "light" selects light; default is dark)
  useEffect(() => {
    let preferDark = true;
    try {
      const saved = localStorage.getItem("theme");
      preferDark = saved !== "light";
      document.documentElement.classList.toggle("dark", preferDark);
    } catch {
      document.documentElement.classList.add("dark");
      preferDark = true;
    }
    queueMicrotask(() => {
      setIsDarkMode(preferDark);
      setMounted(true);
    });
  }, []);

  // Apply theme class to root element
  useEffect(() => {
    if (!mounted) return;
    
    try {
      document.documentElement.classList.toggle("dark", isDarkMode);
    } catch (error) {
      console.warn("Could not apply theme class:", error);
    }
  }, [isDarkMode, mounted]);

  // Save theme to localStorage
  useEffect(() => {
    if (!mounted) return;
    
    try {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    } catch (error) {
      // Fallback if localStorage is not available
      console.warn("Could not save theme to localStorage:", error);
    }
  }, [isDarkMode, mounted]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Don't render children until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground transition-theme">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!children) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
