'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartBarIcon,
  CheckCircleIcon,
  BeakerIcon,
  BoltIcon,
  UsersIcon,
  TicketIcon,
  ArrowPathIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: ChartBarIcon,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50'
  },
  { 
    name: 'Tasks', 
    href: '/tasks', 
    icon: CheckCircleIcon,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50'
  },
  { 
    name: 'Test Management', 
    href: '/test-management', 
    icon: BeakerIcon,
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-50 to-violet-50'
  },
  { 
    name: 'Sprints', 
    href: '/sprints', 
    icon: BoltIcon,
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-50 to-amber-50'
  },
  { 
    name: 'Team', 
    href: '/team', 
    icon: UsersIcon,
    gradient: 'from-indigo-500 to-blue-500',
    bgGradient: 'from-indigo-50 to-blue-50'
  },
  { 
    name: 'Tickets', 
    href: '/tickets', 
    icon: TicketIcon,
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-50 to-rose-50'
  },
  { 
    name: 'Workflows', 
    href: '/workflows', 
    icon: ArrowPathIcon,
    gradient: 'from-teal-500 to-cyan-500',
    bgGradient: 'from-teal-50 to-cyan-50'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: CogIcon,
    gradient: 'from-gray-500 to-slate-500',
    bgGradient: 'from-gray-50 to-slate-50'
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="bg-slate-800/95 backdrop-blur-sm w-64 min-h-screen border-r border-slate-700/50 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">🎯</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              QA Dashboard
            </h1>
            <p className="text-xs text-slate-400 font-medium">Quality Assurance</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isHovered = hoveredItem === item.name;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform
                  ${
                    isActive
                      ? 'bg-white/10 text-white shadow-lg scale-[1.02] border border-white/20'
                      : 'text-slate-300 hover:text-white hover:scale-[1.02]'
                  }
                  ${isHovered && !isActive ? 'bg-white/5 shadow-md backdrop-blur-sm' : ''}
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-400 to-pink-500 rounded-r-full shadow-sm" />
                )}
                
                {/* Icon */}
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-300
                  ${
                    isActive 
                      ? 'bg-white/20 shadow-lg backdrop-blur-sm' 
                      : isHovered 
                        ? 'bg-white/10 shadow-sm' 
                        : 'bg-transparent'
                  }
                `}>
                  <item.icon className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'text-white scale-110' : 'text-slate-300 group-hover:text-white'
                  }`} />
                </div>
                
                {/* Text */}
                <span className={`
                  transition-all duration-300
                  ${isActive ? 'font-semibold' : 'font-medium'}
                `}>
                  {item.name}
                </span>
                
                {/* Hover effect */}
                {isHovered && !isActive && (
                  <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-4 right-4">

      </div>
    </div>
  );
}