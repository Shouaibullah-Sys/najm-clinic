// components/auth/protected-route.tsx
"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "staff";
  requireApproved?: boolean;
  requireActive?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireApproved = true,
  requireActive = true,
  fallback = null,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(
        `${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`
      );
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check if user is active
  if (requireActive && !user.active) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Account Deactivated
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your account has been deactivated. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  // Check if user is approved
  if (requireApproved && !user.approved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Account Pending Approval
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your account is pending admin approval. You'll be notified once
            approved.
          </p>
        </div>
      </div>
    );
  }

  // Check role permissions
  if (requiredRole) {
    if (requiredRole === "admin" && user.role !== "admin") {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Admin privileges required to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Convenience components
export function AdminRoute({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function StaffRoute({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="staff" fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

// Higher Order Component for role protection
export function withProtection<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, "children">
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
