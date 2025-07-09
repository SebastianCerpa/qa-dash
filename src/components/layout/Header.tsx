"use client";

import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

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

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Add Task Button */}
          <button className="px-4 py-2 bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105">
            + Add Task
          </button>

          {/* Notifications removed */}
        </div>
      </div>
    </header>
  );
}
