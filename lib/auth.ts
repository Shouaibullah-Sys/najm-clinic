// lib/auth.ts
// Re-export everything from client (safe for client components)
export {
  authClient,
  useAppSession,
  signIn,
  signOut,
  useSession,
  type AppUser,
} from "./auth-client";

// Export server-only handler for API routes
export { handler } from "./auth-server";

// Server-only session helper - use in API routes and server components only
import "server-only";
import { auth } from "./auth-server";

export async function getSession(cookie: string) {
  try {
    const session = await auth.api.getSession({
      headers: {
        cookie,
      },
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Also export auth for direct server-side use
export { auth };
