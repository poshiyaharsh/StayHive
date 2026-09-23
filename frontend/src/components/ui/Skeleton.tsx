import React from 'react';

interface SkeletonProps {
  className?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', circle = false }) => {
  return (
    <div
      className={`skeleton-shimmer bg-slate-200 dark:bg-slate-800/80 ${
        circle ? 'rounded-full' : 'rounded-xl'
      } ${className}`}
    />
  );
};
