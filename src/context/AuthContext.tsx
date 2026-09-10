import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types/user';
import { userService } from '../services/userService';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'itsm_auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const found = await userService.findByEmail(email.trim().toLowerCase());
      if (!found) {
        return { success: false, message: 'No account found with this email.' };
      }
      if (found.password !== password) {
        return { success: false, message: 'Incorrect password.' };
      }
      if (found.status === 'Inactive') {
        return { success: false, message: 'Your account has been deactivated. Contact an admin.' };
      }
      const authUser: AuthUser = {
        id: found.id,
        fullName: found.fullName,
        email: found.email,
        role: found.role,
        department: found.department,
      };
      setUser(authUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Unable to reach the server. Is JSON Server running?' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
