// lib/middleware/api-auth.ts

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/models/User";

import { IUser } from "@/lib/models/User";

interface AuthResult {
  user: (Omit<IUser, "_id"> & { _id: string }) | null;
  token: string | null;
  error?: string;
}

export async function apiAuthMiddleware(
  request: NextRequest
): Promise<AuthResult> {
  try {
    await dbConnect();

    // Get token from Authorization header or cookies
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    // If no Authorization header, check cookies
    if (!token) {
      const cookies = request.headers.get("cookie") || "";
      const tokenMatch = cookies.match(/accessToken=([^;]+)/);
      token = tokenMatch?.[1] || null;
    }

    if (!token) {
      return {
        user: null,
        token: null,
        error: "No authentication token provided",
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
      email: string;
    };

    // Find user in database
    const user = (await User.findById(decoded.id)
      .select("-password -refreshTokens")
      .lean()) as IUser | null;

    if (!user) {
      return {
        user: null,
        token: null,
        error: "User not found",
      };
    }

    if (!user.approved) {
      return {
        user: null,
        token: null,
        error: "Account pending admin approval",
      };
    }

    if (!user.active) {
      return {
        user: null,
        token: null,
        error: "User account is deactivated",
      };
    }

    return {
      user: {
        ...user,
        _id: user!._id.toString(),
        role: user!.role,
      },
      token,
    };
  } catch (error) {
    console.error("API Auth middleware error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return {
        user: null,
        token: null,
        error: "Token expired",
      };
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return {
        user: null,
        token: null,
        error: "Invalid token",
      };
    }

    return {
      user: null,
      token: null,
      error: "Authentication failed",
    };
  }
}
