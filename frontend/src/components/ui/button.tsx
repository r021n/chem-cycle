import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none rounded-xl focus:outline-none focus:ring-2 focus:ring-chem-sage/40 shrink-0 whitespace-nowrap';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-xs sm:text-sm',
      lg: 'px-5 py-2.5 text-sm',
    };

    const variantStyles = {
      primary: 'bg-chem-forest hover:bg-chem-dark text-chem-glow shadow-subtle border border-transparent',
      secondary: 'bg-chem-subtle hover:bg-chem-glow/60 text-chem-dark border border-chem-border/80',
      outline: 'bg-white hover:bg-chem-subtle text-chem-dark border border-chem-border shadow-xs',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-transparent',
      ghost: 'bg-transparent text-chem-ash hover:bg-chem-subtle hover:text-chem-dark',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-3.5 w-3.5 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
