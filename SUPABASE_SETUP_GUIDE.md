# 🔐 Supabase Authentication Setup Guide

## 📋 **OVERVIEW**

This guide will help you connect SentinelX to Supabase for authentication instead of the custom backend.

---

## 🛠️ **STEP 1: CREATE SUPABASE PROJECT**

### **1. Sign Up for Supabase**
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub, Google, or email
4. Create a new project

### **2. Get Project Credentials**
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[project-id].supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🔧 **STEP 2: CONFIGURE FRONTEND**

### **1. Update Environment Variables**
Create a `.env.local` file in `sentinelx/` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Authentication Provider
NEXT_PUBLIC_AUTH_PROVIDER=supabase

# Application Configuration
NEXT_PUBLIC_APP_NAME=SentinelX
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Configuration
NODE_ENV=development
```

### **2. Install Required Dependencies**
```bash
cd sentinelx
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

---

## 📝 **STEP 3: CREATE SUPABASE AUTH HOOK**

### **Create Supabase Auth Hook**
Create `src/hooks/use-supabase-auth.ts`:

```typescript
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClientComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient<any>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createClientComponentClient();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            role: session.user.user_metadata?.role || 'user',
          };
          setUser(userData);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
          role: session.user.user_metadata?.role || 'user',
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: 'user' },
        },
      });

      if (error) {
        throw error;
      }

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      router.push('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
          role: session.user.user_metadata?.role || 'user',
        };
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Check auth error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    supabase,
    signIn,
    signUp,
    signOut,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## 🗄️ **STEP 4: SETUP DATABASE TABLES**

### **1. Create Users Table**
In Supabase dashboard, go to **SQL Editor** and run:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### **2. Enable Row Level Security**
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## 🔧 **STEP 5: UPDATE APP COMPONENTS**

### **1. Update Layout**
In `src/app/layout.tsx`, wrap with Supabase AuthProvider:

```typescript
import { AuthProvider } from '@/hooks/use-supabase-auth';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### **2. Update Login/Signup Pages**
Replace the auth hook imports:

```typescript
// Before
import { useAuth } from '@/hooks/use-auth';

// After
import { useAuth } from '@/hooks/use-supabase-auth';
```

---

## 🚀 **STEP 6: TEST THE SETUP**

### **1. Restart Development Server**
```bash
cd sentinelx
npm run dev
```

### **2. Test Authentication**
1. Navigate to http://localhost:3001/signup
2. Create a new account
3. Try logging in
4. Check browser console for any errors

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues**

#### **Supabase Connection Error**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### **Auth Hook Not Working**
- Ensure `.env.local` is in the correct directory
- Check that environment variables are properly set
- Verify Supabase project is active

#### **Database Permissions Error**
- Check that RLS policies are correctly applied
- Verify user has necessary permissions
- Check Supabase logs for errors

---

## 📊 **BENEFITS OF SUPABASE**

### **✅ Advantages**
- **Real-time Database**: Built-in real-time subscriptions
- **Authentication**: Complete auth system out of the box
- **Security**: Row-level security policies
- **Scalability**: Managed database service
- **File Storage**: Built-in file uploads
- **Edge Functions**: Serverless functions available

### **🔄 Migration Path**
1. **Phase 1**: Get Supabase authentication working
2. **Phase 2**: Migrate user data to Supabase
3. **Phase 3**: Update API calls to use Supabase
4. **Phase 4**: Remove custom backend dependency

---

## 📞 **SUPPORT**

### **Documentation**
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Integration](https://supabase.com/docs/guides/with-nextjs)
- [Auth Helpers](https://supabase.com/docs/reference/javascript/auth-helpers-nextjs)

### **Common Issues**
1. **Environment Variables**: Ensure they're in `.env.local`
2. **CORS**: Configure Supabase to allow your domain
3. **RLS Policies**: Start with permissive policies for testing
4. **TypeScript**: Update types to match your database schema

---

## 🎯 **QUICK START CHECKLIST**

- [ ] Create Supabase project
- [ ] Get project URL and anon key
- [ ] Update `.env.local` with Supabase credentials
- [ ] Install Supabase dependencies
- [ ] Create Supabase auth hook
- [ ] Update app layout with AuthProvider
- [ ] Create users table in Supabase
- [ ] Test signup and login flow
- [ ] Verify session persistence

---

## 🎉 **NEXT STEPS**

Once you complete this setup:

1. **Restart Frontend**: `npm run dev`
2. **Test Authentication**: Create account and login
3. **Verify Dashboard**: Check user data loads
4. **Test Real-time**: Verify real-time features work

Your SentinelX app will then be fully integrated with Supabase authentication! 🚀

---

**Setup Guide Created**: $(date)
**Status**: 📋 **READY FOR IMPLEMENTATION**
