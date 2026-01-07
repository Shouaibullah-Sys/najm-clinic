// app/api/auth/[...all]/route.ts
import { handler } from "@/lib/auth-server";

// Better-auth catch-all route handler
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as HEAD,
  handler as OPTIONS,
};
