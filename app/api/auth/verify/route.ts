// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  if (!process.env.JWT_SECRET) {
    return NextResponse.json(
      { authenticated: false, error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_SECRET
      ) as JwtPayload;
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp < currentTime) {
        return NextResponse.json({ authenticated: false }, { status: 200 });
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: decoded.id,
          role: decoded.role,
          email: decoded.email,
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
