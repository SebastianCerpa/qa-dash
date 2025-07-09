'use client';

import React, { ReactNode } from 'react';

interface TypographyProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline' | 'label';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning' | 'info';
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
  gutterBottom?: boolean;
}

function Typography({
  children,
  variant = 'body1',
  color = 'primary',
  align = 'left',
  className = '',
  gutterBottom = false,
  ...rest
}: TypographyProps & Omit<React.HTMLAttributes<HTMLElement>, 'color'>) {
  // Definir las clases base para cada variante
  const variantClasses = {
    h1: 'text-2xl font-bold tracking-tight',
    h2: 'text-xl font-semibold tracking-tight',
    h3: 'text-lg font-semibold',
    h4: 'text-base font-semibold',
    h5: 'text-sm font-semibold',
    h6: 'text-sm font-semibold uppercase tracking-wide',
    subtitle1: 'text-lg font-medium',
    subtitle2: 'text-base font-medium',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-sm',
    overline: 'text-sm uppercase tracking-wider',
    label: 'text-sm font-medium',
  };

  // Definir las clases de color
  const colorClasses = {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    tertiary: 'text-gray-500',
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  // Definir las clases de alineación
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  // Definir la clase para el margen inferior
  const gutterClass = gutterBottom ? 'mb-2' : '';

  // Combinar todas las clases
  const combinedClasses = `${variantClasses[variant]} ${colorClasses[color]} ${alignClasses[align]} ${gutterClass} ${className}`;

  // Determinar qué elemento HTML usar basado en la variante
  const Component = (() => {
    switch (variant) {
      case 'h1':
        return 'h1';
      case 'h2':
        return 'h2';
      case 'h3':
        return 'h3';
      case 'h4':
        return 'h4';
      case 'h5':
        return 'h5';
      case 'h6':
        return 'h6';
      case 'subtitle1':
      case 'subtitle2':
        return 'h6';
      case 'body1':
      case 'body2':
        return 'p';
      case 'caption':
      case 'overline':
        return 'span';
      case 'label':
        return 'label';
      default:
        return 'p';
    }
  })();

  return (
    <Component className={combinedClasses} {...rest}>
      {children}
    </Component>
  );
}

export { Typography };

export default Typography;