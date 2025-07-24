'use client';

import React from 'react';
import { Card } from './card';
import { ChartBarIcon, UserIcon, CurrencyDollarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
}

export default function CardDemo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <MetricCard 
        title="Earn of the Month" 
        value="$3548.09" 
        icon={<CurrencyDollarIcon className="h-6 w-6 text-purple-500" />}
      />
      
      <MetricCard 
        title="Earn Growth" 
        value="$67435" 
        change="+5.6%" 
        trend="up"
        icon={<ChartBarIcon className="h-6 w-6 text-green-500" />}
      />
      
      <MetricCard 
        title="Conversation Rate" 
        value="78.8%" 
        icon={<ChatBubbleLeftRightIcon className="h-6 w-6 text-orange-500" />}
      />
      
      <MetricCard 
        title="Gross Profit Margin" 
        value="34.00%" 
        icon={<ChartBarIcon className="h-6 w-6 text-blue-500" />}
      />
    </div>
  );
}

function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        );
      case "down":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline mt-1">
            <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
            {change && (
              <span className={`ml-2 text-sm font-medium ${getTrendColor()}`}>
                <span className="flex items-center">
                  {getTrendIcon()}
                  {change}
                </span>
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="p-2 bg-gray-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
