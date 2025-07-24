'use client';

import React, { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  variant?: 'default' | 'small' | 'large';
}

function Label({ 
  children, 
  required = false, 
  variant = 'default', 
  className = '', 
  ...rest 
}: LabelProps) {
  const baseClasses = 'font-medium text-gray-700';
  
  const variantClasses = {
    default: 'text-sm',
    small: 'text-sm',
    large: 'text-base',
  };

  const labelClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <label className={labelClasses} {...rest}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export { Label };

export default Label;
