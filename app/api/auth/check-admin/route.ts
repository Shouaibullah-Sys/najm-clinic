// app/api/auth/check-admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  if (!process.env.JWT_SECRET) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { isAdmin: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET) as JwtPayload;
    } catch (error) {
      return NextResponse.json(
        { isAdmin: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const isAdmin = decoded.role === "admin";

    if (!isAdmin) {
      return NextResponse.json(
        { isAdmin: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      isAdmin: true,
      user: {
        id: decoded.id,
        email: decoded.email,
      },
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { isAdmin: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
