import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">

      <div className="flex h-screen overflow-hidden relative z-10">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <Sidebar />
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 via-white/80 to-blue-50/30 relative z-10">
            <div className="p-4 lg:p-6">
              <div className="max-w-full mx-auto">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
