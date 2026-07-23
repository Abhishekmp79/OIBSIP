/**
 * AuthContext — holds the current user + token, exposes login/logout helpers.
 *
 * User sessions use the `sh_token` storage key; admin sessions use a separate
 * `sh_admin_token` key so the two apps (user site vs /admin) don't collide.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { api, setToken, clearToken } from '../api';
import type { AuthUser } from '../types';

const ADMIN_TOKEN_KEY = 'sh_admin_token';
const ADMIN_USER_KEY = 'sh_admin_user';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: AuthUser) => void;
  loginAdmin: (token: string, user: AuthUser) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.me();
      setUser(data.user);
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Rehydrate: prefer regular user token, else try admin token.
    const token = localStorage.getItem('sh_token');
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      refresh().finally(() => setLoading(false));
    } else if (adminToken) {
      try {
        setUser(JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || 'null'));
      } catch {
        /* noop */
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [refresh]);

  const login = useCallback((token: string, nextUser: AuthUser) => {
    setToken(token);
    setUser(nextUser);
  }, []);

  const loginAdmin = useCallback((token: string, adminUser: AuthUser) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
    setUser(adminUser);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    loginAdmin,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
