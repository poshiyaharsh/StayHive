import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/database';
import apiClient from '../api/client';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  isLoading: boolean;
}

const defaultRoleProfiles: Record<UserRole, User> = {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('stayhive_active_role');
    return (savedRole as UserRole) || 'ADMIN';
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedRole = (localStorage.getItem('stayhive_active_role') as UserRole) || 'ADMIN';
    return defaultRoleProfiles[savedRole] || defaultRoleProfiles.ADMIN;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('stayhive_active_role', newRole);
    const profile = defaultRoleProfiles[newRole];
    setUser(profile);
  };

  const login = async (username: string, password: string = 'stayhive123') => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login/', { username, password });
      if (response.data?.success) {
        const { access, refresh, user: userData, role: userRole } = response.data.data;
        localStorage.setItem('stayhive_access_token', access);
        localStorage.setItem('stayhive_refresh_token', refresh);
        localStorage.setItem('stayhive_active_role', userRole);
        setUser(userData);
        setRole(userRole);
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.warn('Backend login fallback to mock profile:', err);
      // Fallback matching role
      const matchedRole = Object.keys(defaultRoleProfiles).find(
        (r) => defaultRoleProfiles[r as UserRole].username === username
      ) as UserRole || 'ADMIN';
      switchRole(matchedRole);
    }
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('stayhive_access_token');
    localStorage.removeItem('stayhive_refresh_token');
    switchRole('CUSTOMER');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        isLoading,
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
