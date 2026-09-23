import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, Calendar, Utensils, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDatabase } from '../../context/DatabaseContext';

export const MobileNav: React.FC = () => {
  const { role } = useAuth();
  const { notifications } = useDatabase();
  const location = useLocation();

  const isCustomer = role === 'CUSTOMER';
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const items = isCustomer
    ? [
        { label: 'Explore', icon: Search, path: '/search' },
        { label: 'My Stays', icon: Calendar, path: '/my-bookings' },
        { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Dining', icon: Utensils, path: '/restaurant' },
        { label: 'Profile', icon: User, path: '/profile' },
      ]
    : [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Rooms', icon: Calendar, path: '/rooms' },
        { label: 'Bookings', icon: Calendar, path: '/bookings' },
        { label: 'Orders', icon: Utensils, path: '/food-orders' },
        { label: 'Alerts', icon: Bell, path: '/notifications', badge: unreadCount },
      ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-white/10 px-2 py-2 flex items-center justify-around">
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors relative ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 mb-0.5" />
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-blue-600 text-white rounded-full text-[9px] font-bold">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
