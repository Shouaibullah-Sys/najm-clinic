//components/providers/auth-provider.tsx
"use client";

import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

// Simple provider - better-auth 1.4.10 doesn't require a provider component
export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}
