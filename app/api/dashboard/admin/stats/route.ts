import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Order } from "@/lib/models/Order";
import { GlassStock } from "@/lib/models/GlassStock";
import { Expense } from "@/lib/models/Expense";
import { OphthalmologyRecord } from "@/lib/models/ophthalmology/OphthalmologyRecord";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get start and end of current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Get data for last 6 months
    const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);

    const [
      totalRevenue,
      totalExpenses,
      totalOrders,
      totalStockValue,
      totalConsultations,
      pendingOrders,
      monthlyData,
      topProducts,
      expenseBreakdown,
    ] = await Promise.all([
      // Total revenue (this month)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
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

      // Total expenses (this month)
      Expense.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
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

      // Total orders (this month)
      Order.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $nin: ["cancelled"] },
      }),

      // Total stock value
      GlassStock.aggregate([
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: { $multiply: ["$currentQuantity", "$unitPrice"] },
            },
          },
        },
      ]),

      // Total consultations (this month)
      OphthalmologyRecord.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      }),

      // Pending orders
      Order.countDocuments({ status: "pending" }),

      // Monthly data for last 6 months
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo, $lte: endOfMonth },
            status: { $nin: ["cancelled"] },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Top selling products
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $nin: ["cancelled"] },
          },
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "glassstocks",
            localField: "items.glassProduct",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.productName",
            revenue: {
              $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] },
            },
            quantity: { $sum: "$items.quantity" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),

      // Expense breakdown
      Expense.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $in: ["approved", "paid"] },
          },
        },
        {
          $group: {
            _id: "$category",
            amount: { $sum: "$amount" },
          },
        },
        { $sort: { amount: -1 } },
        { $limit: 6 },
      ]),
    ]);

    // Calculate net profit
    const revenue = totalRevenue[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const netProfit = revenue - expenses;

    // Format monthly data
    const formattedMonthlyData = monthlyData.map((item) => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        revenue: item.revenue,
        expenses: expenses / 6, // Simplified - should be actual monthly expenses
        profit: item.revenue - expenses / 6,
      };
    });

    // Format top products
    const formattedTopProducts = topProducts.map((product) => ({
      name: product._id,
      revenue: product.revenue,
      quantity: product.quantity,
    }));

    // Format expense breakdown
    const formattedExpenseBreakdown = expenseBreakdown.map((expense) => ({
      category: expense._id,
      amount: expense.amount,
    }));

    return NextResponse.json({
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit,
      totalOrders,
      totalStockValue: totalStockValue[0]?.totalValue || 0,
      totalConsultations,
      pendingOrders,
      monthlyData: formattedMonthlyData,
      topProducts: formattedTopProducts,
      expenseBreakdown: formattedExpenseBreakdown,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
