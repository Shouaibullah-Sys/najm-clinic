import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Order } from "@/lib/models/Order";
import { GlassStock } from "@/lib/models/GlassStock";
import { Expense } from "@/lib/models/Expense";
import { OphthalmologyRecord } from "@/lib/models/ophthalmology/OphthalmologyRecord";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Get date range for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch all data in parallel
    const [
      orders,
      glassStock,
      expenses,
      ophthalmologyRecords,
      totalGlassStock,
      lowStockItems,
    ] = await Promise.all([
      // Today's orders
      Order.find({
        createdAt: { $gte: today, $lt: tomorrow },
        status: { $nin: ["cancelled"] },
      }),

      // Glass stock status
      GlassStock.find({}).select("currentQuantity originalQuantity"),

      // Today's expenses
      Expense.find({
        createdAt: { $gte: today, $lt: tomorrow },
        status: { $in: ["approved", "paid"] },
      }),

      // Today's ophthalmology records
      OphthalmologyRecord.find({
        createdAt: { $gte: today, $lt: tomorrow },
      }),

      // Aggregate total stock value
      GlassStock.aggregate([
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$currentQuantity" },
            totalValue: {
              $sum: { $multiply: ["$currentQuantity", "$unitPrice"] },
            },
          },
        },
      ]),

      // Low stock items (less than 20% remaining)
      GlassStock.find({
        $expr: {
          $lt: [{ $divide: ["$currentQuantity", "$originalQuantity"] }, 0.2],
        },
      }).limit(10),
    ]);

    // Calculate metrics
    const todaysRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const todaysExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const todaysOphthalmologyRevenue = ophthalmologyRecords.reduce(
      (sum, record) => sum + record.totalAmount,
      0
    );

    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const totalStockValue = totalGlassStock[0]?.totalValue || 0;
    const totalStockQuantity = totalGlassStock[0]?.totalQuantity || 0;

    return NextResponse.json({
      todaysRevenue,
      todaysExpenses,
      todaysOphthalmologyRevenue,
      pendingOrders,
      totalStockValue,
      totalStockQuantity,
      lowStockItemsCount: lowStockItems.length,
      todaysOrdersCount: orders.length,
      todaysConsultations: ophthalmologyRecords.length,
      stats: {
        revenue: {
          today: todaysRevenue,
          change: "+12.5%", // This would need historical data calculation
        },
        orders: {
          today: orders.length,
          pending: pendingOrders,
          change: "+8.2%",
        },
        stock: {
          totalItems: glassStock.length,
          totalQuantity: totalStockQuantity,
          totalValue: totalStockValue,
          lowStock: lowStockItems.length,
        },
        ophthalmology: {
          today: ophthalmologyRecords.length,
          revenue: todaysOphthalmologyRevenue,
          change: "+15.3%",
        },
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
