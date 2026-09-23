import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types/database';
import apiClient from '../api/client';

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
}

export const defaultRoleProfiles: Record<UserRole, User> = {
  ADMIN: {
    id: 1,
    username: 'admin',
    email: 'admin@stayhive.com',
    first_name: 'Aditya',
    last_name: 'Singhania',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: { id: 1, name: 'ADMIN', description: 'System Administrator' },
    is_active: true,
    created_at: new Date().toISOString()
  },
  MANAGER: {
    id: 2,
    username: 'manager_vikram',
    email: 'vikram.mehta@stayhive.com',
    first_name: 'Vikram',
    last_name: 'Mehta',
    phone: '+91 98765 43211',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: { id: 2, name: 'MANAGER', description: 'General Hotel Manager' },
    is_active: true,
    created_at: new Date().toISOString()
  },
  RECEPTION: {
    id: 3,
    username: 'reception_priya',
    email: 'priya.sharma@stayhive.com',
    first_name: 'Priya',
    last_name: 'Sharma',
    phone: '+91 98765 43212',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    role: { id: 3, name: 'RECEPTION', description: 'Front Desk Reception' },
    is_active: true,
    created_at: new Date().toISOString()
  },
  HOUSEKEEPING: {
    id: 4,
    username: 'housekeeping_suresh',
    email: 'suresh.kumar@stayhive.com',
    first_name: 'Suresh',
    last_name: 'Kumar',
    phone: '+91 98765 43213',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: { id: 4, name: 'HOUSEKEEPING', description: 'Housekeeping Lead' },
    is_active: true,
    created_at: new Date().toISOString()
  },
  RESTAURANT: {
    id: 5,
    username: 'chef_anand',
    email: 'anand.joshi@stayhive.com',
    first_name: 'Anand',
    last_name: 'Joshi',
    phone: '+91 98765 43214',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    role: { id: 5, name: 'RESTAURANT', description: 'Executive Head Chef' },
    is_active: true,
    created_at: new Date().toISOString()
  },
  CUSTOMER: {
    id: 6,
    username: 'rahul_sharma',
    email: 'rahul.sharma@gmail.com',
    first_name: 'Rahul',
    last_name: 'Sharma',
    phone: '+91 98220 11223',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    role: { id: 6, name: 'CUSTOMER', description: 'Valued Guest (Gold Tier)' },
    is_active: true,
    created_at: new Date().toISOString()
  }
};

const personaPasswords: Record<UserRole, string> = {
  ADMIN: 'admin123',
  MANAGER: 'stayhive123',
  RECEPTION: 'stayhive123',
  HOUSEKEEPING: 'stayhive123',
  RESTAURANT: 'stayhive123',
  CUSTOMER: 'stayhive123',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const extractRole = (userData: User): UserRole => {
    if (typeof userData.role === 'string') {
      return userData.role as UserRole;
    }
    if (userData.role?.name) {
      return userData.role.name as UserRole;
    }
    if (userData.role_detail?.name) {
      return userData.role_detail.name as UserRole;
    }
    return 'CUSTOMER';
  };

  // Verify stored token on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('stayhive_access_token');
      if (!accessToken) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await apiClient.get('/auth/me/');
        if (isMounted && response.data?.success && response.data?.data) {
          const userData = response.data.data;
          const userRole = extractRole(userData);
          setUser(userData);
          setRole(userRole);
          localStorage.setItem('stayhive_active_role', userRole);
        } else if (isMounted) {
          setUser(null);
        }
      } catch (err) {
        console.warn('Authentication token invalid or expired:', err);
        if (isMounted) {
          localStorage.removeItem('stayhive_access_token');
          localStorage.removeItem('stayhive_refresh_token');
          localStorage.removeItem('stayhive_active_role');
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const handleAuthExpired = () => {
      if (isMounted) {
        setUser(null);
        localStorage.removeItem('stayhive_access_token');
        localStorage.removeItem('stayhive_refresh_token');
        localStorage.removeItem('stayhive_active_role');
      }
    };

    window.addEventListener('stayhive:auth_expired', handleAuthExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('stayhive:auth_expired', handleAuthExpired);
    };
  }, []);

  const login = async (username: string, password?: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login/', {
        username,
        password: password || 'stayhive123',
      });

      if (response.data?.success) {
        const { access, refresh, user: userData, role: userRole } = response.data.data;
        localStorage.setItem('stayhive_access_token', access);
        localStorage.setItem('stayhive_refresh_token', refresh);
        localStorage.setItem('stayhive_active_role', userRole);
        setUser(userData);
        setRole(userRole as UserRole);
        setIsLoading(false);
        return { success: true, message: 'Logged in successfully', user: userData };
      }

      setIsLoading(false);
      return { success: false, message: response.data?.message || 'Login failed' };
    } catch (err: any) {
      setIsLoading(false);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.non_field_errors?.[0] ||
        'Invalid username or password';
      return { success: false, message: errorMsg };
    }
  };

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('stayhive_refresh_token');
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (err) {
      console.warn('Logout notification failed:', err);
    } finally {
      localStorage.removeItem('stayhive_access_token');
      localStorage.removeItem('stayhive_refresh_token');
      localStorage.removeItem('stayhive_active_role');
      setUser(null);
      setRole('CUSTOMER');
    }
  }, []);

  const switchRole = async (newRole: UserRole) => {
    // Attempt authenticating as that persona from database
    const profile = defaultRoleProfiles[newRole];
    const password = personaPasswords[newRole];
    if (profile) {
      try {
        const res = await login(profile.username, password);
        if (res.success) return;
      } catch {
        // Fallback to local profile
      }
      setRole(newRole);
      localStorage.setItem('stayhive_active_role', newRole);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
