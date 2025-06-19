import React from 'react';
import { TaskStatus, TaskPriority, TestType } from '@/store/useStore';

interface BadgeProps {
  label: string;
  variant?: 'status' | 'priority' | 'testType' | 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export default function Badge({ 
  label, 
  variant = 'default', 
  className = '', 
  size = 'md',
  icon 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-semibold rounded-full transition-all duration-200 border';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };
  
  // Status colors
  const getStatusClasses = (status: string) => {
    switch (status as TaskStatus) {
      case 'Todo':
        return 'bg-gray-100 text-gray-800 border-gray-200 shadow-sm';
      case 'In Progress':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 shadow-sm';
      case 'Review':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 shadow-sm';
      case 'Done':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 shadow-sm';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 shadow-sm';
    }
  };

  // Priority colors
  const getPriorityClasses = (priority: string) => {
    switch (priority as TaskPriority) {
      case 'Low':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 shadow-sm';
      case 'Medium':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 shadow-sm';
      case 'High':
        return 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200 shadow-sm';
      case 'Critical':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200 shadow-sm';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 shadow-sm';
    }
  };

  // Test type colors
  const getTestTypeClasses = (testType: string) => {
    switch (testType as TestType) {
      case 'Positive':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 shadow-sm';
      case 'Negative':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200 shadow-sm';
      case 'Functional':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 shadow-sm';
      case 'Non-functional':
        return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200 shadow-sm';
      case 'Regression':
        return 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 border-orange-200 shadow-sm';
      case 'API':
        return 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border-indigo-200 shadow-sm';
      case 'Exploratory':
        return 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-200 shadow-sm';
      case 'Boundary':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 shadow-sm';
      case 'Smoke':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 shadow-sm';
      case 'Stress':
        return 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border-red-200 shadow-sm';
      case 'Accessibility':
        return 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 border-teal-200 shadow-sm';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 shadow-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'status':
        return getStatusClasses(label);
      case 'priority':
        return getPriorityClasses(label);
      case 'testType':
        return getTestTypeClasses(label);
      case 'success':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 shadow-sm';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 shadow-sm';
      case 'danger':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200 shadow-sm';
      case 'info':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 shadow-sm';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 shadow-sm';
    }
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${getVariantClasses()} ${className}`}>
      {icon && <span className="mr-1.5 flex items-center">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}