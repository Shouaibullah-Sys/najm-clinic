// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/lib/models/User";
import dbConnect from "@/lib/dbConnect";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  if (!process.env.JWT_SECRET) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return NextResponse.json(
      { error: "Authorization token required" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    await dbConnect();

    const user = (await User.findById(decoded.id)
      .select("-password -refreshTokens")
      .lean()) as any;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      approved: user.approved,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
