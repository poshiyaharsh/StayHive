import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.15 } } : undefined}
      className={`bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all ${
        hover ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-white/20 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
