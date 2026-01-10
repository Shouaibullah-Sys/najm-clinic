import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Order } from "@/lib/models/Order";
import { GlassStock } from "@/lib/models/GlassStock";
import { Expense } from "@/lib/models/Expense";
import { OphthalmologyRecord } from "@/lib/models/ophthalmology/OphthalmologyRecord";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get data for last 7 days
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const [weeklyOrders, weeklyRevenue, glassTypes, recentActivities] =
      await Promise.all([
        // Weekly orders count
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: lastWeek, $lt: tomorrow },
              status: { $nin: ["cancelled"] },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
              revenue: { $sum: "$totalAmount" },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Total weekly revenue
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: lastWeek, $lt: tomorrow },
              status: { $nin: ["cancelled"] },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
            },
          },
        ]),

        // Glass type distribution
        GlassStock.aggregate([
          {
            $group: {
              _id: "$glassType",
              totalQuantity: { $sum: "$currentQuantity" },
              totalValue: {
                $sum: { $multiply: ["$currentQuantity", "$unitPrice"] },
              },
            },
          },
          { $sort: { totalQuantity: -1 } },
        ]),

        // Recent activities (combining orders, expenses, and records)
        Order.find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .select("invoiceNumber customerName totalAmount status createdAt"),
      ]);

    // Format weekly data for charts
    const weeklyData = weeklyOrders.map((day) => ({
      date: day._id,
      orders: day.count,
      revenue: day.revenue,
    }));

    // Format glass types for pie chart
    const glassTypeData = glassTypes.map((type, index) => ({
      name: type._id,
      value: type.totalQuantity,
      color: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"][index % 5],
    }));

    // Format recent activities
    const activities = recentActivities.map((order) => ({
      id: order._id.toString(),
      type: "order",
      description: `New order: ${order.invoiceNumber} from ${order.customerName}`,
      amount: order.totalAmount,
      time: order.createdAt,
      icon: "shopping-cart",
    }));

    return NextResponse.json({
      weeklyData,
      weeklyRevenue: weeklyRevenue[0]?.totalRevenue || 0,
      glassTypeData,
      recentActivities: activities,
    });
  } catch (error) {
    console.error("Quick stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quick stats" },
      { status: 500 }
    );
  }
}
