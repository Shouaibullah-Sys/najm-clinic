// provider/SessionProvider.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuthStore, User } from "@/store/useAuthStore";

interface SessionContextType {
  user: User | null;
  status: "authenticated" | "unauthenticated" | "loading";
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  status: "unauthenticated",
  isLoading: true,
});

export const useSession = () => useContext(SessionContext);

export default function CustomSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const status = isLoading
    ? "loading"
    : isAuthenticated
    ? "authenticated"
    : "unauthenticated";

  const value = {
    user,
    status,
    isLoading,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
