// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    // Verify the refresh token (you might want to add more validation)
    try {
      jwtDecode(refreshToken);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Check if access token is still valid
    if (accessToken) {
      try {
        const decoded: any = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        // If token is still valid for more than 10 minutes, don't refresh
        if (decoded.exp - currentTime > 600) {
          return NextResponse.json({ message: "Token still valid" });
        }
      } catch (error) {
        // Access token is invalid, proceed to refresh
      }
    }

    // In a real implementation, you would:
    // 1. Verify the refresh token against your database
    // 2. Generate a new access token
    // 3. Set the new access token in cookies

    // For now, we'll just return a success response
    // You should replace this with your actual token refresh logic

    // Example of setting new cookies (replace with your actual token generation)
    const response = NextResponse.json({ message: "Session refreshed" });

    // Set new access token (you would generate a real token here)
    response.cookies.set("accessToken", "new-access-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
    });

    // Optionally refresh the refresh token as well
    response.cookies.set("refreshToken", "new-refresh-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Error refreshing session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
