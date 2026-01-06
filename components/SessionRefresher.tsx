// components/SessionRefresher.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionRefresher() {
  const router = useRouter();

  useEffect(() => {
    const refreshSession = async () => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Session refresh failed");
        }

        // Optionally, you can trigger a router refresh to update any client-side state
        router.refresh();
      } catch (error) {
        console.error("Failed to refresh session:", error);
        // Redirect to login if refresh fails
        router.push("/login");
      }
    };

    const interval = setInterval(refreshSession, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
