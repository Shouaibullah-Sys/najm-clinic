// types/better-auth.d.ts
import "better-auth";

declare module "better-auth" {
  interface User {
    role: string;
    isActive: boolean;
    permissions: string[];
    lastLoginAt?: Date | null;
  }

  interface Session {
    user: User;
  }
}

declare module "better-auth/react" {
  interface UseSessionReturn {
    data: {
      user: import("better-auth").User;
    } | null;
    isPending: boolean;
    error: Error | null;
  }
}
