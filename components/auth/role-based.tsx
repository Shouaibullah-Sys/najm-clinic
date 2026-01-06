// components/auth/role-based.tsx
"use client";

import { useAppSession } from "@/lib/auth-client"; // Use the custom typed hook
import { ReactNode } from "react";

interface RoleBasedProps {
  children: ReactNode;
  allowedRoles: ("admin" | "staff")[];
  fallback?: ReactNode;
}

export function RoleBased({
  children,
  allowedRoles,
  fallback = null,
}: RoleBasedProps) {
  const { session } = useAppSession();

  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function AdminOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleBased allowedRoles={["admin"]} fallback={fallback}>
      {children}
    </RoleBased>
  );
}

export function StaffOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleBased allowedRoles={["staff", "admin"]} fallback={fallback}>
      {children}
    </RoleBased>
  );
}

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: ("admin" | "staff")[]
) {
  return function WithRoleWrapper(props: P) {
    const { session } = useAppSession();

    if (!session?.user || !allowedRoles.includes(session.user.role)) {
      return null;
    }

    return <Component {...props} />;
  };
}
