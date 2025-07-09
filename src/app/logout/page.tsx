"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LogoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!session && !isLoggingOut) {
      router.push("/login");
    }
  }, [session, router, isLoggingOut]);

  useEffect(() => {
    // Countdown timer for automatic logout
    if (countdown > 0 && session) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && session) {
      handleLogout();
    }
  }, [countdown, session]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push("/login");
  };

  const cancelLogout = () => {
    router.push("/");
  };

  if (!session && !isLoggingOut) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/90 border border-gray-200 shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">Q</span>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Signing Out
          </h1>
          
          <p className="text-gray-600 mb-8">
            You are being signed out of your account.
            <br />
            Automatic logout in <span className="font-bold">{countdown}</span> seconds.
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Sign Out Now
            </Button>
            
            <Button 
              onClick={cancelLogout}
              variant="outline"
              className="w-full border border-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}