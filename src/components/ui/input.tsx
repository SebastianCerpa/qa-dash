'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    fullWidth = false,
    className = '',
    disabled,
    ...rest
  },
  ref
) => {
  return (
    <div className={cn(fullWidth ? 'w-full' : '')}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          disabled={disabled}
          {...rest}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground mt-1">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };

export default Input;
