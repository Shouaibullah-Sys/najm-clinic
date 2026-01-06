// app/api/user/online-time/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import { logActivity } from "@/lib/utils/activityLogger";

interface TokenPayload {
  id: string;
  role: string;
  exp: number;
  [key: string]: any;
}

export async function POST(req: NextRequest) {
  try {
    // Use your custom auth instead of NextAuth
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify and decode the token
    const decoded: TokenPayload = jwtDecode(accessToken);
    const userId = decoded.id;

    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    const { minutes } = await req.json();

    // Log the activity using your custom logger
    await logActivity(
      userId,
      "online_time",
      `User was online for ${minutes} minutes`,
      "User",
      userId,
      { minutes }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking online time:", error);

    if (error instanceof Error && error.message.includes("jwt")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
