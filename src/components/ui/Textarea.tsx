'use client';

import React, { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((
  {
    label,
    error,
    helperText,
    variant = 'default',
    fullWidth = false,
    resize = 'vertical',
    className = '',
    disabled,
    rows = 4,
    ...rest
  },
  ref
) => {
  const baseClasses = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  
  const variantClasses = {
    default: 'border border-gray-300 rounded-lg px-3 py-2 bg-white hover:border-gray-400',
    filled: 'border-0 rounded-lg px-3 py-2 bg-gray-100 hover:bg-gray-200 focus:bg-white',
    outlined: 'border-2 border-gray-300 rounded-lg px-3 py-2 bg-transparent hover:border-gray-400',
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  const textareaClasses = `${baseClasses} ${variantClasses[variant]} ${resizeClasses[resize]} ${errorClasses} ${disabledClasses} ${widthClasses} ${className}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={textareaClasses}
        disabled={disabled}
        rows={rows}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };

export default Textarea;