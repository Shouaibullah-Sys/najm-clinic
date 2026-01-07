// app/api/dashboard/admin/user-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$active", true] }, 1, 0] },
          },
          approved: {
            $sum: { $cond: [{ $eq: ["$approved", true] }, 1, 0] },
          },
        },
      },
    ]);

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-password -refreshTokens")
      .lean();

    // User activity trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userActivity = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return NextResponse.json({
      userStats,
      recentUsers,
      userActivity,
    });
  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
