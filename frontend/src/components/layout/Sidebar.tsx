import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Hotel, BedDouble, Layers, Calendar, Users, Briefcase,
  Utensils, Coffee, Sparkles, CheckSquare, Tag, FileText, CreditCard,
  MessageSquare, AlertOctagon, HelpCircle, ChevronLeft, ChevronRight,
  Search, ShieldAlert, Bell, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/database';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { role } = useAuth();
  const location = useLocation();

  interface NavItem {
    label: string;
    icon: React.ElementType;
    path: string;
    roles: UserRole[];
    badge?: string;
  }

  const navItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'MANAGER', 'RECEPTION', 'HOUSEKEEPING', 'RESTAURANT', 'CUSTOMER'] },
    { label: 'Book a Stay', icon: Search, path: '/search', roles: ['CUSTOMER'] },
    { label: 'Hotels Directory', icon: Hotel, path: '/hotels', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Room Management', icon: BedDouble, path: '/rooms', roles: ['ADMIN', 'MANAGER', 'RECEPTION', 'HOUSEKEEPING'] },
    { label: 'Room Categories', icon: Layers, path: '/room-types', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Bookings Desk', icon: Calendar, path: '/bookings', roles: ['ADMIN', 'MANAGER', 'RECEPTION'] },
    { label: 'My Reservations', icon: Calendar, path: '/my-bookings', roles: ['CUSTOMER'] },
    { label: 'Guest Directory', icon: Users, path: '/customers', roles: ['ADMIN', 'MANAGER', 'RECEPTION'] },
    { label: 'Staff & Roster', icon: Briefcase, path: '/staff', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Restaurant & Menu', icon: Utensils, path: '/restaurant', roles: ['ADMIN', 'MANAGER', 'RESTAURANT', 'CUSTOMER'] },
    { label: 'Food Orders (KOT)', icon: Coffee, path: '/food-orders', roles: ['ADMIN', 'MANAGER', 'RESTAURANT'], badge: 'Live' },
    { label: 'Hotel Services', icon: Sparkles, path: '/services', roles: ['ADMIN', 'MANAGER', 'CUSTOMER'] },
    { label: 'Housekeeping Tasks', icon: CheckSquare, path: '/housekeeping', roles: ['ADMIN', 'MANAGER', 'HOUSEKEEPING'], badge: 'Urgent' },
    { label: 'Promos & Offers', icon: Tag, path: '/offers', roles: ['ADMIN', 'MANAGER', 'CUSTOMER'] },
    { label: 'Invoices & Billing', icon: FileText, path: '/billing', roles: ['ADMIN', 'MANAGER', 'RECEPTION', 'CUSTOMER'] },
    { label: 'Guest Feedback', icon: MessageSquare, path: '/feedback', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Complaints Resolution', icon: AlertOctagon, path: '/complaints', roles: ['ADMIN', 'MANAGER'], badge: 'SLA' },
    { label: 'Inquiries Helpdesk', icon: HelpCircle, path: '/inquiries', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Reports & Audits', icon: BarChart3, path: '/reports', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Notifications', icon: Bell, path: '/notifications', roles: ['ADMIN', 'MANAGER', 'RECEPTION', 'HOUSEKEEPING', 'RESTAURANT', 'CUSTOMER'] },
  ];

  // Filter items matching role
  const allowedItems = navItems.filter((item) => item.roles.includes(role));

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-[#111827] border-r border-slate-200/80 dark:border-white/10 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Hotel className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                  Stay<span className="text-blue-600">Hive</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                  Luxury Hospitality
                </span>
              </motion.div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {allowedItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'opacity-70'}`} />
                {!isCollapsed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between w-full">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role Footer Pill */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-100 dark:border-white/5">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">Connected to MySQL</div>
              <div className="text-[10px] text-slate-400 truncate">33 Entities Synchronized</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onMobileClose} />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="relative w-72 h-full z-10"
          >
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  );
};
