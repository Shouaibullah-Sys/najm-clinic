// lib/auth.ts
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export interface UserSession {
  user: {
    _id: string;
    name: string;
    email: string;
    role: "admin" | "staff";
    phone: string;
    avatar?: string;
    approved: boolean;
    active: boolean;
  };
}

export async function getServerSession(req?: any): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return null;
    }

    // Decode the token to get user info
    const decoded: any = jwtDecode(accessToken);

    // In a real app, you would verify the token and fetch user from DB
    // For now, we'll return the decoded info
    return {
      user: {
        _id: decoded.id,
        name: decoded.name || "User",
        email: decoded.email,
        role: decoded.role,
        phone: decoded.phone || "",
        approved: decoded.approved || true,
        active: decoded.active !== false,
      },
    };
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}
