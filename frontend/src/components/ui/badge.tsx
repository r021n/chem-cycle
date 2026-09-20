import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'solid' | 'outline' | 'teacher' | 'student' | 'warm' | 'danger' | 'glow';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-chem-subtle text-chem-ash border border-chem-border/70',
    solid: 'bg-chem-dark text-chem-glow border border-transparent',
    outline: 'bg-transparent text-chem-ash border border-chem-border',
    teacher: 'bg-chem-forest text-chem-glow border border-transparent font-semibold',
    student: 'bg-chem-subtle text-chem-forest border border-chem-border/70 font-semibold',
    warm: 'bg-amber-50 text-chem-warm border border-amber-200 font-semibold',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold',
    glow: 'bg-chem-glow/70 text-chem-forest border border-chem-sage/30 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-[11px] font-sans rounded-full uppercase tracking-wider',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
