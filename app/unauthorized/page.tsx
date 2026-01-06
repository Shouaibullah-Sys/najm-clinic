// app/unauthorized/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import ClinicLoadingAnimation from "@/components/ClinicLoadingAnimation";
import { useEffect, useState } from "react";

export default function UnauthorizedPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Don't redirect automatically - let the user decide what to do
  if (!showContent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <ClinicLoadingAnimation />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <ClinicLoadingAnimation />
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
          403 - Unauthorized Access
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          You don&apos;t have permission to access this page. Please contact
          your administrator.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {isAuthenticated ? (
            <>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link
                  href="/login"
                  onClick={() => useAuthStore.getState().logout()}
                >
                  Logout
                </Link>
              </Button>
            </>
          ) : (
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
