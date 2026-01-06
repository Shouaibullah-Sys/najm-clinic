// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    // Verify the token
    try {
      const decoded: any = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      if (decoded.exp < currentTime) {
        return NextResponse.json({ authenticated: false }, { status: 200 });
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: decoded.id,
          role: decoded.role,
        },
      });
    } catch (error) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
  } catch (error) {
    console.error("Error verifying session:", error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
