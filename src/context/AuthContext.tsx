'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authOperation = useRef(0);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    const operation = ++authOperation.current;
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (operation !== authOperation.current) return;

      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (err) {
      if (operation !== authOperation.current) return;
      console.error('Failed to load authenticated user:', err);
      setUser(null);
    } finally {
      if (operation === authOperation.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password?: string): Promise<User | null> => {
    const operation = ++authOperation.current;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const authenticatedUser = data.user || null;
        if (operation === authOperation.current) {
          setUser(authenticatedUser);
        }
        return authenticatedUser;
      }
      if (operation === authOperation.current) setUser(null);
      return null;
    } catch (err) {
      console.error('Login error:', err);
      if (operation === authOperation.current) setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    ++authOperation.current;
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
