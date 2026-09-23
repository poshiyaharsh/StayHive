import React from 'react';

export type BadgeVariant =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'cleaning'
  | 'maintenance'
  | 'confirmed'
  | 'pending'
  | 'delivered'
  | 'urgent'
  | 'high'
  | 'medium'
  | 'low'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant | string;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const normalizedVariant = String(variant).toLowerCase();

  const variantStyles: Record<string, { bg: string; dotColor: string }> = {
    available: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', dotColor: 'bg-emerald-500' },
    occupied: { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800', dotColor: 'bg-blue-500' },
    reserved: { bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800', dotColor: 'bg-purple-500' },
    cleaning: { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', dotColor: 'bg-amber-500' },
    maintenance: { bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800', dotColor: 'bg-orange-500' },
    confirmed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', dotColor: 'bg-emerald-500' },
    'checked-in': { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800', dotColor: 'bg-blue-500' },
    'checked-out': { bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', dotColor: 'bg-slate-400' },
    pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', dotColor: 'bg-amber-500' },
    preparing: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800', dotColor: 'bg-indigo-500' },
    ready: { bg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800', dotColor: 'bg-teal-500' },
    delivered: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', dotColor: 'bg-emerald-500' },
    cancelled: { bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800', dotColor: 'bg-rose-500' },
    completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', dotColor: 'bg-emerald-500' },
    urgent: { bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800', dotColor: 'bg-rose-500' },
    high: { bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800', dotColor: 'bg-orange-500' },
    medium: { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', dotColor: 'bg-amber-500' },
    low: { bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', dotColor: 'bg-slate-400' },
    paid: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', dotColor: 'bg-emerald-500' },
    unpaid: { bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800', dotColor: 'bg-rose-500' },
    neutral: { bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', dotColor: 'bg-slate-400' }
  };

  const style = variantStyles[normalizedVariant] || variantStyles.neutral;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${style.bg} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />}
      {children}
    </span>
  );
};
