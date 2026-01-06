// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import Cookies from "universal-cookie";
import { jwtDecode } from "jwt-decode";

// Activity logging function for middleware
async function logMiddlewareActivity(
  userId: string,
  activityType: string,
  description: string,
  entityType: string,
  request: NextRequest,
  metadata?: Record<string, any>
) {
  try {
    // Extract IP address from headers
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Send to API for logging
    await fetch(`${request.nextUrl.origin}/api/log/middleware-activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        activityType,
        description,
        entityType,
        ipAddress,
        userAgent,
        metadata: {
          ...metadata,
          path: request.nextUrl.pathname,
          method: request.method,
        },
      }),
    });
  } catch (error) {
    console.error("Failed to log middleware activity:", error);
  }
}

export async function middleware(request: NextRequest) {
  const cookies = new Cookies(request.headers.get("cookie"));
  const accessToken = cookies.get("accessToken");

  if (!accessToken) {
    // Log access attempt without token
    await logMiddlewareActivity(
      "unknown",
      "authentication",
      "Attempted to access protected route without authentication",
      "Route",
      request,
      { path: request.nextUrl.pathname }
    );

    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded: any = jwtDecode(accessToken);
    const role = decoded.role;
    const userId = decoded.id;
    const path = request.nextUrl.pathname;

    // Special logging for admin activities page
    if (path.startsWith("/admin/activities")) {
      await logMiddlewareActivity(
        userId,
        "view",
        `Accessed admin activities dashboard`,
        "Admin",
        request
      );
    }

    // Admin access to all routes
    if (role === "admin") {
      // Log admin access to protected routes
      if (path.startsWith("/admin")) {
        await logMiddlewareActivity(
          userId,
          "view",
          `Accessed admin route: ${path}`,
          "Admin",
          request
        );
      }
      return NextResponse.next();
    }

    // CEO access
    if (role === "ceo") {
      if (path.startsWith("/ceo")) {
        return NextResponse.next();
      }
      if (path.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/ceo/dashboard", request.url));
      }

      // Log unauthorized CEO access attempt
      await logMiddlewareActivity(
        userId,
        "authorization",
        `Attempted to access unauthorized route: ${path}`,
        "Route",
        request,
        { requiredRole: "ceo", userRole: role }
      );

      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Laboratory routes
    if (path.startsWith("/laboratory")) {
      if (role === "laboratory") {
        return NextResponse.next();
      }

      // Log unauthorized laboratory access attempt
      await logMiddlewareActivity(
        userId,
        "authorization",
        `Attempted to access laboratory route without permission: ${path}`,
        "Route",
        request,
        { requiredRole: "laboratory", userRole: role }
      );

      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Pharmacy routes - allow both pharmacy and admin
    if (path.startsWith("/pharmacy")) {
      if (role === "pharmacy") {
        return NextResponse.next();
      }

      // Log unauthorized pharmacy access attempt
      await logMiddlewareActivity(
        userId,
        "authorization",
        `Attempted to access pharmacy route without permission: ${path}`,
        "Route",
        request,
        { requiredRole: "pharmacy", userRole: role }
      );

      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Default deny - log unauthorized access attempt
    await logMiddlewareActivity(
      userId,
      "authorization",
      `Attempted to access unknown protected route: ${path}`,
      "Route",
      request,
      { userRole: role }
    );

    return NextResponse.redirect(new URL("/unauthorized", request.url));
  } catch (error) {
    // Log token decoding error
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await logMiddlewareActivity(
      "unknown",
      "error",
      "Failed to decode access token",
      "Authentication",
      request,
      { error: errorMessage }
    );

    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/admin/:path*",
    "/laboratory/:path*",
    "/pharmacy/:path*",
    "/ceo/:path*",
    "/dashboard/:path*",
  ],
};
