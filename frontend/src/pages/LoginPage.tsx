import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hotel, Lock, User, Eye, EyeOff, Shield, ArrowRight,
  Sparkles, CheckCircle2, UserCheck, Briefcase, KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserRole } from '../types/database';

interface PersonaOption {
  role: UserRole;
  label: string;
  sublabel: string;
  username: string;
  password: string;
  badgeColor: string;
}

const PERSONAS: PersonaOption[] = [
  {
    role: 'ADMIN',
    label: 'Aditya Singhania',
    sublabel: 'System Admin',
    username: 'admin',
    password: 'admin123',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
  },
  {
    role: 'MANAGER',
    label: 'Vikram Mehta',
    sublabel: 'General Manager',
    username: 'manager_vikram',
    password: 'stayhive123',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
  },
  {
    role: 'RECEPTION',
    label: 'Priya Sharma',
    sublabel: 'Front Desk',
    username: 'reception_priya',
    password: 'stayhive123',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
  },
  {
    role: 'HOUSEKEEPING',
    label: 'Suresh Kumar',
    sublabel: 'Housekeeping Lead',
    username: 'housekeeping_suresh',
    password: 'stayhive123',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
  },
  {
    role: 'RESTAURANT',
    label: 'Anand Joshi',
    sublabel: 'Executive Chef',
    username: 'chef_anand',
    password: 'stayhive123',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800'
  },
  {
    role: 'CUSTOMER',
    label: 'Rahul Sharma',
    sublabel: 'Valued Guest',
    username: 'rahul_sharma',
    password: 'stayhive123',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
  }
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useNotification();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>('admin');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSelectPersona = (persona: PersonaOption) => {
    setSelectedPersona(persona.username);
    setUsername(persona.username);
    setPassword(persona.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showToast('Please enter both username and password', 'warning');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      showToast(
        result.user ? `Welcome back, ${result.user.first_name || result.user.username}!` : 'Signed in successfully',
        'success'
      );
      navigate(from, { replace: true });
    } else {
      showToast(result.message || 'Invalid username or password', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 text-white shadow-xl shadow-blue-500/25 mb-4">
            <Hotel className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Sign in to <span className="text-blue-600 dark:text-blue-400">StayHive</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Hotel Management Platform & Guest Services
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl shadow-slate-900/5 rounded-3xl border border-slate-200/80 dark:border-white/10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Username"
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setSelectedPersona('');
                }}
                placeholder="e.g. admin or manager_vikram"
                leftIcon={<User className="w-4 h-4" />}
                required
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSelectedPersona('');
                  }}
                  placeholder="Enter your password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-sm font-semibold shadow-lg shadow-blue-600/20"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Persona Selector */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                1-Click Persona Quick-Fill
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                Live MySQL Accounts
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PERSONAS.map((p) => {
                const isSelected = selectedPersona === p.username;
                return (
                  <button
                    key={p.username}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm'
                        : 'border-slate-200/70 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {p.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {p.sublabel}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Public Return Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
              ← Back to Public Showcase & Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
