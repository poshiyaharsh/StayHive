import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Sun, Moon, Shield, ChevronDown, Check,
  User, LogOut, Sparkles, Menu, Hotel, Calendar, BedDouble
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useDatabase } from '../../context/DatabaseContext';
import { UserRole } from '../../types/database';

interface HeaderProps {
  onOpenCommand: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommand, onToggleSidebar }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useDatabase();
  const navigate = useNavigate();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string; color: string }[] = [
    { role: 'ADMIN', label: 'Admin', desc: 'Full Executive Oversight & System Control', color: 'bg-rose-500' },
    { role: 'MANAGER', label: 'Hotel Manager', desc: 'Operations, Revenue & Staff Rosters', color: 'bg-blue-600' },
    { role: 'RECEPTION', label: 'Reception Staff', desc: 'Check-Ins, Room Assign & Front Desk', color: 'bg-emerald-600' },
    { role: 'HOUSEKEEPING', label: 'Housekeeping', desc: 'Cleaning Queue & Room Inspections', color: 'bg-amber-500' },
    { role: 'RESTAURANT', label: 'Restaurant Staff', desc: 'Kitchen Order Tickets & Dining Menu', color: 'bg-orange-500' },
    { role: 'CUSTOMER', label: 'Guest / Customer', desc: 'Bookings, In-Room Dining & Services', color: 'bg-indigo-600' },
  ];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 w-full h-[68px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-white/10 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Brand or Search */}
      <div className="flex items-center gap-3 lg:gap-6 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button */}
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-slate-400 text-sm transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Search hotels, rooms, bookings...</span>
            <span className="sm:hidden">Search...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100/60 transition-colors text-xs font-semibold"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Role:</span>
            <span className="uppercase tracking-wider">{role}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Role Dropdown */}
          <AnimatePresence>
            {isRoleDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsRoleDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-2 z-40"
                >
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/5 mb-1">
                    Select Active Persona
                  </div>
                  {roles.map((r) => {
                    const isSelected = role === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role);
                          setIsRoleDropdownOpen(false);
                          if (r.role === 'CUSTOMER') {
                            navigate('/dashboard');
                          } else {
                            navigate('/dashboard');
                          }
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${r.color}`} />
                        <div className="flex-1">
                          <div className="text-sm font-semibold flex items-center justify-between">
                            {r.label}
                            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div className="text-xs text-slate-400 font-normal line-clamp-1">{r.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-4 z-40"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Notifications</div>
                    <span className="text-xs text-blue-600 font-medium">{unreadCount} new</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 mt-2">
                    {notifications.slice(0, 5).map((n) => (
                      <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">Just now</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/20 transition-all"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.first_name || 'User'}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10"
            />
            <div className="hidden lg:block text-left text-xs">
              <div className="font-semibold text-slate-800 dark:text-white leading-tight">
                {user ? `${user.first_name} ${user.last_name}` : 'Aditya Singhania'}
              </div>
              <div className="text-slate-400 text-[10px] capitalize">{role.toLowerCase()}</div>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-2 z-40"
                >
                  <div className="p-3 border-b border-slate-100 dark:border-white/5">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{user?.first_name} {user?.last_name}</div>
                    <div className="text-xs text-slate-400">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
