// Import from auth-server (server-side only)
import { handler } from "@/lib/auth-server";

// Better-auth catch-all route handler
export const GET = handler;
export const POST = handler;

// Also handle other HTTP methods that better-auth might need
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const HEAD = handler;
export const OPTIONS = handler;
