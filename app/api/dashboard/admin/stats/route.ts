// app/api/dashboard/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { GlassStock } from "@/lib/models/GlassStock";
import { Order } from "@/lib/models/Order.ts";
import { DailyRecord } from "@/lib/models/DailyRecord";
import { DailyExpense } from "@/lib/models/DailyExpense";
import { User } from "@/lib/models/User";
import { DailyCash } from "@/lib/models/DailyCash";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Total revenue (monthly)
    const monthlyRevenue = await DailyRecord.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth },
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Total expenses (monthly)
    const monthlyExpenses = await DailyExpense.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Total orders (monthly)
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Total glass stock value
    const glassStockValue = await GlassStock.aggregate([
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ["$currentQuantity", "$unitPrice"] },
          },
        },
      },
    ]);

    // Active users
    const activeUsers = await User.countDocuments({ active: true });

    // Pending approvals
    const pendingApprovals = await User.countDocuments({ approved: false });

    // Weekly sales trend
    const weeklySales = await DailyRecord.aggregate([
      {
        $match: {
          date: { $gte: startOfWeek },
          status: "paid",
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Daily cash status
    const todayCash = await DailyCash.findOne({
      date: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        ),
      },
    });

    const stats = {
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      monthlyExpenses: monthlyExpenses[0]?.total || 0,
      monthlyOrders,
      glassStockValue: glassStockValue[0]?.totalValue || 0,
      activeUsers,
      pendingApprovals,
      weeklySales,
      todayCash: todayCash || null,
      profit:
        (monthlyRevenue[0]?.total || 0) - (monthlyExpenses[0]?.total || 0),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
