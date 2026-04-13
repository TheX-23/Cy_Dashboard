"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mock authentication for development
const USE_MOCK_AUTH = true;

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Mock authentication with specific credentials
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Valid credentials
          const validCredentials = [
            { email: 'admin@sentinelx.com', password: 'admin123', name: 'Admin User', role: 'Administrator' },
            { email: 'security@sentinelx.com', password: 'security123', name: 'Security Analyst', role: 'Security Analyst' },
            { email: 'analyst@sentinelx.com', password: 'analyst123', name: 'Threat Analyst', role: 'Analyst' },
            { email: 'demo@sentinelx.com', password: 'demo123', name: 'Demo User', role: 'User' }
          ];
          
          const credential = validCredentials.find(cred => cred.email === email && cred.password === password);
          
          if (!credential) {
            throw new Error('Invalid email or password');
          }
          
          const user: User = {
            id: credential.email === 'admin@sentinelx.com' ? '1' : 
                credential.email === 'security@sentinelx.com' ? '2' :
                credential.email === 'analyst@sentinelx.com' ? '3' : '4',
            email: credential.email,
            name: credential.name,
            role: credential.role,
          };

          // Store token in localStorage for route protection
          localStorage.setItem('token', 'mock-jwt-token-' + Date.now());
          localStorage.setItem('user', JSON.stringify(user));

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          // Mock signup - accept any email/password for demo
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const user: User = {
            id: '1',
            email: email,
            name: name || email.split('@')[0] || 'Demo User',
            role: 'user',
          };

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        // Mock logout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear auth state immediately
        set({ user: null, isAuthenticated: false });
        
        // Redirect to landing page (before login page)
        window.location.href = '/';
      },

      checkAuth: async () => {
        try {
          // Mock check auth - check if user is stored
          const persisted = get();
          if (persisted?.user && persisted?.isAuthenticated) {
            set({ user: persisted.user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
