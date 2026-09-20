import React from 'react';
import { cn } from '../../lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div
        className={cn(
          'rounded-none border-black border-t-transparent animate-spin',
          sizeMap[size],
          className
        )}
      />
      {label && <p className="text-xs font-mono font-bold uppercase text-neutral-600">{label}</p>}
    </div>
  );
};
