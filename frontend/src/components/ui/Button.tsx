import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-2 gap-1.5 h-9',
    md: 'text-sm px-4.5 py-2.5 gap-2 h-11',
    lg: 'text-base px-6 py-3 gap-2.5 h-12.5',
  };

  const variantClasses = {
    primary: 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm shadow-indigo-500/20 focus:ring-indigo-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-indigo-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
    ghost: 'hover:bg-slate-100 text-slate-700 focus:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 focus:ring-rose-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 focus:ring-emerald-500',
  };

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.01 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.99 } : undefined}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
