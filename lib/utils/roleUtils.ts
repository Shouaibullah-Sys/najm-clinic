// lib/utils/roleUtils.ts
export type UserRole = "admin" | "staff";

export interface RoutePermissions {
  path: string;
  allowedRoles: UserRole[];
  description: string;
}

export const routePermissions: RoutePermissions[] = [
  // Admin only routes
  {
    path: "/admin",
    allowedRoles: ["admin"],
    description: "Admin dashboard and management",
  },
  {
    path: "/glass/suppliers",
    allowedRoles: ["admin"],
    description: "Supplier management",
  },
  {
    path: "/glass/analytics",
    allowedRoles: ["admin"],
    description: "Advanced analytics",
  },
  {
    path: "/glass/settings",
    allowedRoles: ["admin"],
    description: "Glass shop settings",
  },
  {
    path: "/expenses/approve",
    allowedRoles: ["admin"],
    description: "Expense approval",
  },
  {
    path: "/expenses/analytics",
    allowedRoles: ["admin"],
    description: "Expense analytics",
  },
  {
    path: "/reports/financial",
    allowedRoles: ["admin"],
    description: "Financial reports",
  },
  {
    path: "/reports/advanced",
    allowedRoles: ["admin"],
    description: "Advanced reports",
  },
  {
    path: "/api/admin",
    allowedRoles: ["admin"],
    description: "Admin API endpoints",
  },

  // Staff routes (accessible by both)
  {
    path: "/dashboard",
    allowedRoles: ["admin", "staff"],
    description: "Dashboard",
  },
  {
    path: "/glass/orders",
    allowedRoles: ["admin", "staff"],
    description: "Order management",
  },
  {
    path: "/glass/stock",
    allowedRoles: ["admin", "staff"],
    description: "Stock management",
  },
  {
    path: "/expenses",
    allowedRoles: ["admin", "staff"],
    description: "Expense management",
  },
  {
    path: "/reports/sales",
    allowedRoles: ["admin", "staff"],
    description: "Sales reports",
  },
  {
    path: "/reports/inventory",
    allowedRoles: ["admin", "staff"],
    description: "Inventory reports",
  },
];

export function isRouteAllowed(path: string, userRole: UserRole): boolean {
  const permission = routePermissions.find((p) => path.startsWith(p.path));
  if (!permission) {
    // Default to allow for routes not explicitly listed (safer approach)
    return true;
  }
  return permission.allowedRoles.includes(userRole);
}

export function getUserRoleDescription(role: UserRole): string {
  const descriptions = {
    admin: "Administrator - Full system access",
    staff: "Staff - Glass management access",
  };
  return descriptions[role] || role;
}

export function getAllowedRoutesForRole(role: UserRole): RoutePermissions[] {
  return routePermissions.filter((permission) =>
    permission.allowedRoles.includes(role)
  );
}
