// lib/auth-client.ts
"use client";

import { createAuthClient } from "better-auth/react";

// Client-side auth instance
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  basePath: "/api/auth",
});

// Export typed functions
export const { signIn, signOut, useSession } = authClient;

// Type for extended user
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  lastLoginAt?: Date;
  image?: string;
  emailVerified: boolean;
}

// Safe session hook
export function useAppSession() {
  const { data: session, isPending, error } = useSession();

  return {
    session: session
      ? {
          user: session.user as unknown as AppUser,
        }
      : null,
    isPending,
    error,
  };
}
