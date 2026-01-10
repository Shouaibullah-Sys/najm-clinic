import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Order } from "@/lib/models/Order";
import { GlassStock } from "@/lib/models/GlassStock";
import { Expense } from "@/lib/models/Expense";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "week";

    // Calculate date ranges
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let startDate = new Date();
    if (range === "day") {
      startDate = today;
    } else if (range === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Fetch all data in parallel
    const [
      glassStock,
      todayOrders,
      todayRevenue,
      pendingOrders,
      todayExpenses,
      weeklyData,
      recentOrders,
      recentExpenses,
    ] = await Promise.all([
      // Glass stock overview
      GlassStock.aggregate([
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            totalQuantity: { $sum: "$currentQuantity" },
            totalValue: {
              $sum: { $multiply: ["$currentQuantity", "$unitPrice"] },
            },
            lowStock: {
              $sum: {
                $cond: [
                  {
                    $lt: [
                      { $divide: ["$currentQuantity", "$originalQuantity"] },
                      0.2,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      // Today's orders count
      Order.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
        status: { $nin: ["cancelled"] },
      }),

      // Today's revenue
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            status: { $nin: ["cancelled"] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),

      // Pending orders
      Order.countDocuments({ status: "pending" }),

      // Today's expenses
      Expense.aggregate([
        {
          $match: {
            createdAt: { $gte: today, $lt: tomorrow },
            status: { $in: ["approved", "paid"] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      // Weekly/Monthly data for charts
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lt: tomorrow },
            status: { $nin: ["cancelled"] },
          },
        },
        {
          $addFields: {
            timeGroup:
              range === "day"
                ? { $hour: "$createdAt" }
                : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
        },
        {
          $group: {
            _id: "$timeGroup",
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: range === "day" ? 24 : 30 },
      ]),

      // Recent orders
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select("invoiceNumber customerName totalAmount status createdAt")
        .lean(),

      // Recent expenses
      Expense.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select("amount category description date status")
        .lean(),
    ]);

    // Also get expenses data for the same period to calculate expenses per time period
    const expenseData = await Expense.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: tomorrow },
          status: { $in: ["approved", "paid"] },
        },
      },
      {
        $addFields: {
          timeGroup:
            range === "day"
              ? { $hour: "$createdAt" }
              : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
      },
      {
        $group: {
          _id: "$timeGroup",
          expenses: { $sum: "$amount" },
        },
      },
    ]);

    // Create a map of expenses by time period for easy lookup
    const expenseMap = new Map();
    expenseData.forEach((item) => {
      expenseMap.set(item._id.toString(), item.expenses);
    });

    // Format weekly data
    const formattedWeeklyData = weeklyData.map((item) => {
      const timeKey = item._id.toString();
      const label =
        range === "day"
          ? `${item._id}:00`
          : new Date(item._id).toLocaleDateString("en-US", {
              weekday: "short",
            });

      // Get expenses for this period from the expense map
      const expenseForPeriod = expenseMap.get(timeKey) || 0;

      return {
        day: label,
        orders: item.count,
        revenue: item.revenue,
        expenses: expenseForPeriod,
      };
    });

    return NextResponse.json({
      glassStock: {
        totalItems: glassStock[0]?.totalItems || 0,
        totalQuantity: glassStock[0]?.totalQuantity || 0,
        totalValue: glassStock[0]?.totalValue || 0,
        lowStock: glassStock[0]?.lowStock || 0,
      },
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      pendingOrders,
      todayExpenses: todayExpenses[0]?.total || 0,
      weeklyData: formattedWeeklyData,
      recentOrders: recentOrders.map((order) => ({
        _id: (order as any)._id.toString(),
        invoiceNumber: (order as any).invoiceNumber,
        customerName: (order as any).customerName,
        totalAmount: (order as any).totalAmount,
        status: (order as any).status,
        createdAt: (order as any).createdAt,
        items: [], // You might want to populate this with actual items
      })),
      recentExpenses: recentExpenses.map((expense) => ({
        _id: (expense as any)._id.toString(),
        amount: (expense as any).amount,
        category: (expense as any).category,
        description: (expense as any).description,
        date: (expense as any).date?.toString() || new Date().toISOString(),
        status: (expense as any).status,
      })),
    });
  } catch (error) {
    console.error("Staff stats error:", error);
    return NextResponse.json(
      {
        glassStock: {
          totalItems: 0,
          totalQuantity: 0,
          totalValue: 0,
          lowStock: 0,
        },
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        todayExpenses: 0,
        weeklyData: [],
        recentOrders: [],
        recentExpenses: [],
      },
      { status: 200 }
    );
  }
}
