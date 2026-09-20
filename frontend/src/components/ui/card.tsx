import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'solid' | 'highlight';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white rounded-2xl border border-chem-border shadow-subtle',
    flat: 'bg-white rounded-2xl border border-chem-border/70',
    solid: 'bg-chem-dark text-chem-glow rounded-2xl border border-chem-dark shadow-subtle',
    highlight: 'bg-white rounded-3xl border border-chem-border shadow-subtle',
  };

  return (
    <div className={cn('p-6 transition-all', variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
};
