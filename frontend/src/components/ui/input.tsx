import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full font-sans">
        {label && (
          <label htmlFor={inputId} className="block text-[11px] font-sans font-medium uppercase tracking-wider text-chem-ash mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            'w-full bg-chem-subtle/70 px-3.5 py-2.5 text-xs sm:text-sm text-chem-dark border border-chem-border rounded-xl placeholder:text-chem-ash/50 focus:bg-white focus:outline-none focus:border-chem-sage transition-all disabled:opacity-50 disabled:bg-chem-subtle',
            error && 'border-rose-400 focus:border-rose-500 bg-rose-50/30',
            className
          )}
          {...props}
        />
        {helperText && !error && <p className="mt-1 text-[11px] text-chem-ash">{helperText}</p>}
        {error && <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
