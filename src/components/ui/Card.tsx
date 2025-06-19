import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient';
  icon?: ReactNode;
  headerActions?: ReactNode;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

function Card({ 
  title, 
  children, 
  className = '', 
  footer, 
  variant = 'default',
  icon,
  headerActions
}: CardProps) {
  const baseClasses = 'bg-white overflow-hidden transition-all duration-200';
  
  const variantClasses = {
    default: 'shadow-sm hover:shadow-md rounded-xl border border-gray-200',
    elevated: 'shadow-lg hover:shadow-xl rounded-xl border border-gray-100 transform hover:scale-[1.01]',
    bordered: 'border-2 border-gray-200 hover:border-gray-300 rounded-xl',
    gradient: 'shadow-lg hover:shadow-xl rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                  {icon}
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            {headerActions && (
              <div className="flex items-center space-x-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
}

function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white ${className}`}>
      {children}
    </div>
  );
}

function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

export { Card, CardHeader, CardContent, CardTitle };
export default Card;