'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  variant?: 'default' | 'card';
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((
  {
    label,
    description,
    error,
    variant = 'default',
    className = '',
    disabled,
    checked,
    ...rest
  },
  ref
) => {
  const baseClasses = 'relative w-4 h-4 border-2 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1';
  
  const variantClasses = {
    default: 'border-gray-300 bg-white',
    card: 'border-gray-300 bg-white',
  };

  const checkedClasses = checked 
    ? 'bg-blue-600 border-blue-600' 
    : 'hover:border-gray-400';
    
  const disabledClasses = disabled 
    ? 'opacity-60 cursor-not-allowed' 
    : 'cursor-pointer';

  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : '';

  const checkboxClasses = `${baseClasses} ${variantClasses[variant]} ${checkedClasses} ${disabledClasses} ${errorClasses} ${className}`;

  const content = (
    <div className="flex items-start space-x-3">
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          {...rest}
        />
        <div className={checkboxClasses}>
          {checked && (
            <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
          )}
        </div>
      </div>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label className={`block text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'} ${error ? 'text-red-600' : ''}`}>
              {label}
            </label>
          )}
          {description && (
            <p className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <div className={`p-4 border rounded-lg ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} ${disabled ? 'opacity-60' : 'hover:border-gray-300'}`}>
        {content}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {content}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export default Checkbox;