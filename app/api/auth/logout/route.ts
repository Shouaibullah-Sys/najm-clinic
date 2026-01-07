// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/models/User";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function POST(request: NextRequest) {
  if (!process.env.JWT_SECRET) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      try {
        // Decode token to get user ID
        const decoded = jwt.decode(refreshToken) as JwtPayload;

        if (decoded?.id) {
          await dbConnect();

          // Remove the refresh token from user's list
          await User.findByIdAndUpdate(decoded.id, {
            $pull: { refreshTokens: refreshToken },
          });
        }
      } catch (error) {
        console.error("Error removing refresh token:", error);
        // Continue with logout even if token removal fails
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear cookies
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
