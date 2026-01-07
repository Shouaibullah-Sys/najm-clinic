// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/models/User";

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

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token required" },
        { status: 401 }
      );
    }

    // Verify refresh token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET) as JwtPayload;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    if (decoded.type !== "refresh") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find user and validate refresh token
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      );
    }

    // Check if refresh token exists in user's refreshTokens array
    if (!user.refreshTokens?.includes(refreshToken)) {
      // Token has been invalidated (user logged out or token rotated)
      return NextResponse.json(
        { error: "Refresh token invalidated" },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Optionally generate new refresh token (rotation)
    const newRefreshToken = jwt.sign(
      {
        id: user._id,
        type: "refresh",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update refresh tokens in database
    const currentTokens: string[] = Array.isArray(user.refreshTokens)
      ? (user.refreshTokens as string[])
      : [];
    const filteredTokens: string[] = [];
    currentTokens.forEach((token: string) => {
      if (token !== refreshToken) {
        filteredTokens.push(token);
      }
    });
    user.refreshTokens = filteredTokens;
    user.refreshTokens.push(newRefreshToken);

    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    const response = NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    // Set new cookies
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
