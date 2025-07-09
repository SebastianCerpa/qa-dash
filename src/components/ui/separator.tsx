'use client';

import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

function Separator({ 
  orientation = 'horizontal', 
  className = '' 
}: SeparatorProps) {
  const baseClasses = 'bg-gray-200';
  
  const orientationClasses = {
    horizontal: 'w-full h-px my-2',
    vertical: 'h-full w-px mx-2',
  };

  return (
    <div 
      className={`${baseClasses} ${orientationClasses[orientation]} ${className}`}
      role="separator"
    />
  );
}

export { Separator };