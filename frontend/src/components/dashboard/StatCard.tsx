import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  timeframe?: string;
  icon: React.ElementType;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  timeframe = 'vs last month',
  icon: Icon,
  iconColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400',
}) => {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-luxury-hover transition-all"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</span>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={`inline-flex items-center font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
            {change}
          </span>
          <span className="text-slate-400">{timeframe}</span>
        </div>
      )}
    </motion.div>
  );
};
