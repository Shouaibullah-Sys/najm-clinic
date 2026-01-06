// components/auth/protected-route.tsx
"use client";

import { useSession } from "@/lib/auth-client";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: "admin" | "staff";
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  fallback = null,
}: ProtectedRouteProps) {
  const { data: session, isPending } = useSession();

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Authentication is now handled by middleware
  // This component just shows loading states
  if (!session?.user) {
    return <>{fallback}</>;
  }

  // For now, allow all authenticated users
  // Role and permission checks can be added later if needed
  return <>{children}</>;
}
