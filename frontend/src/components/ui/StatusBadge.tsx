import React from 'react';

export type StatusVariant =
  | 'available'
  | 'occupied'
  | 'cleaning'
  | 'maintenance'
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'checked_in'
  | 'completed'
  | 'paid'
  | 'unpaid'
  | 'urgent'
  | 'vip';

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  className = '',
  size = 'md',
}) => {
  // Infer variant from status string if not explicitly given
  const normalized = (variant || status.toLowerCase().replace(/[\s-_]/g, '')) as string;

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (['available', 'confirmed', 'completed', 'success', 'clean', 'paid'].some(k => normalized.includes(k))) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40';
    dotColor = 'bg-emerald-500';
  } else if (['pending', 'cleaning', 'inspection', 'preparing', 'unpaid', 'sla'].some(k => normalized.includes(k))) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40';
    dotColor = 'bg-amber-500';
  } else if (['occupied', 'checkedin', 'inprogress', 'ready', 'live'].some(k => normalized.includes(k))) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40';
    dotColor = 'bg-blue-500';
  } else if (['cancelled', 'maintenance', 'urgent', 'danger', 'refunded'].some(k => normalized.includes(k))) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40';
    dotColor = 'bg-rose-500';
  } else if (['reserved', 'vip', 'deluxe'].some(k => normalized.includes(k))) {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800/40';
    dotColor = 'bg-purple-500';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${colorClasses} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
};
