import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export type UserRole = 'business' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  status?: string;
  business?: { id: number; business_name: string };
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
  });

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setState({ user: null, token: null, loading: false });
      return;
    }
    try {
      const { data } = await api.get<{ user: User }>('/auth/me');
      setState((s) => ({ ...s, user: data.user, token, loading: false }));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setState({ user: null, token: null, loading: false });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, loading: false });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ user: null, token: null, loading: false });
  };

  const setUser = (user: User | null) => {
    setState((s) => ({ ...s, user }));
  };

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
