import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { clearStoredAuth, getStoredUser, setStoredAuth, type StoredUser } from '../utils/auth';

type AuthContextValue = {
  user: StoredUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: StoredUser) => void;
  logout: () => void;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('busgoToken'));

  const login = useCallback((nextToken: string, nextUser: StoredUser) => {
    setStoredAuth(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    setToken(localStorage.getItem('busgoToken'));
    setUser(getStoredUser());
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshUser,
    }),
    [login, logout, refreshUser, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
