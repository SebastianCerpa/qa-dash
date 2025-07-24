'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from "next-auth/react";
import {
  ChartBarIcon,
  CheckCircleIcon,
  BeakerIcon,
  BoltIcon,
  UsersIcon,
  TicketIcon,
  ArrowPathIcon,
  CogIcon,
  ChevronUpIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  ClipboardDocumentListIcon,
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
  const { data: session } = useSession();
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleSwitchAccount = () => {
    router.push("/login");
  };

  return (
    <div className="bg-slate-800/95 backdrop-blur-sm w-64 min-h-screen border-r border-slate-700/50 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-base">QA</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white">
              QA PanDash
            </h1>
            <p className="text-sm text-slate-400 font-medium">Quality Assurance</p>
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
                  ${isActive
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
                  ${isActive
                    ? 'bg-white/20 shadow-lg backdrop-blur-sm'
                    : isHovered
                      ? 'bg-white/10 shadow-sm'
                      : 'bg-transparent'
                  }
                `}>
                  <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-300 group-hover:text-white'
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

      {/* Footer - User Profile */}
      <div className="absolute bottom-6 left-4 right-4 px-2">
        <div className="relative">
          <div
            className="flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-700/80 rounded-xl px-3 py-3 transition-all duration-200 cursor-pointer group border border-slate-600/50"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="relative">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-xl object-cover shadow-md"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-white">
                    {session?.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-slate-700 rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-sm text-slate-400 truncate">{session?.user?.role || "User"}</p>
            </div>
            <ChevronUpIcon
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
            />
          </div>

          {/* Dropdown (appears above the user info) */}
          {showUserMenu && (
            <div className="absolute left-0 right-0 bottom-full mb-3 bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 py-3 z-[9999] w-full max-w-[256px] overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50">
                <p className="text-sm font-semibold text-white truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-sm text-slate-400 truncate">
                  {session?.user?.email || "user@example.com"}
                </p>
                <p className="text-sm text-blue-400 font-medium mt-1 truncate">
                  {session?.user?.role || "User"}
                </p>
              </div>

              <div className="py-2">
                <button
                  onClick={handleSwitchAccount}
                  className="w-full text-left px-6 py-3 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-3 rounded-xl mx-2"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">Switch Account</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-6 py-3 text-sm text-red-400 hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-3 rounded-xl mx-2"
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <span className="truncate">Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
