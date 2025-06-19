"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleSwitchAccount = () => {
    router.push("/login");
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        <div className="flex items-center flex-1 max-w-2xl">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks, projects, or team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:bg-white transition-all duration-200 text-sm font-medium"
            />
          </div>
        </div>

        {/* Right side - Actions and User */}
        <div className="flex items-center space-x-4">
          {/* Add Task Button */}
          <button className="px-4 py-2 bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            + Add Task
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-xl transition-all duration-200 group"
            >
              <BellIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                3
              </span>
            </button>
          </div>

          {/* User Info */}
          <div className="relative flex items-center space-x-3 pl-4 border-l border-gray-200/50">
            <div
              className="flex items-center space-x-2 hover:bg-gray-50/80 rounded-xl px-3 py-2 transition-all duration-200 cursor-pointer group"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="relative">
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-xl object-cover shadow-md"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold text-white">
                      {session?.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">QA Engineer</p>
              </div>
              <ChevronDownIcon
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 py-3 z-50">
                <div className="px-6 py-4 border-b border-gray-100/50">
                  <p className="text-sm font-semibold text-gray-900">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.email || "user@example.com"}
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    QA Engineer
                  </p>
                </div>

                <div className="py-2">
                  <button
                    onClick={handleSwitchAccount}
                    className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors duration-200 flex items-center space-x-3 rounded-xl mx-2"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 text-gray-400" />
                    <span>Switch Account</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50/80 transition-colors duration-200 flex items-center space-x-3 rounded-xl mx-2"
                  >
                    <ArrowLeftOnRectangleIcon className="h-4 w-4 text-red-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
