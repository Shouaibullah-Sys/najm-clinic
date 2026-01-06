// components/SessionChecker.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Cookies from "universal-cookie";

export default function SessionChecker() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, initialize, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const cookies = new Cookies();

  useEffect(() => {
    // Initialize auth state on component mount
    const initAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setIsChecking(false);
      }
    };

    initAuth();
  }, [initialize]);

  useEffect(() => {
    // Only check authentication status after initialization is complete
    if (isLoading || isChecking) return;

    const publicPaths = ["/login", "/register", "/forgot-password"];
    const isPublicPath = publicPaths.includes(pathname);

    // If not authenticated and trying to access a protected route, redirect to login
    if (!isAuthenticated && !isPublicPath) {
      router.push("/login");
      return;
    }

    // If authenticated and trying to access a public route, redirect to dashboard
    if (isAuthenticated && isPublicPath) {
      router.push("/dashboard");
      return;
    }

    // Check if access token is expired and try to refresh it
    const checkTokenExpiration = async () => {
      const accessToken = cookies.get("accessToken");

      if (accessToken) {
        try {
          // Simple check for token expiration (you might want to use jwt-decode for a proper check)
          const tokenParts = accessToken.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            // If token expires in less than 5 minutes, try to refresh it
            if (expirationTime - currentTime < 5 * 60 * 1000) {
              try {
                await useAuthStore.getState().refreshAccessToken();
              } catch (error) {
                console.error("Token refresh failed:", error);
                logout();
                router.push("/login");
              }
            }
          }
        } catch (error) {
          console.error("Token validation error:", error);
        }
      }
    };

    checkTokenExpiration();
  }, [isAuthenticated, isLoading, isChecking, pathname, router, logout]);

  // Show nothing while checking or loading
  if (isLoading || isChecking) {
    return null;
  }

  return null;
}
