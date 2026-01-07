// app/api/finance/expenses/summary/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Expense } from "@/lib/models/Expense";
import { authMiddleware } from "@/lib/middleware/auth";

// GET: Get expense summary
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const authResult = await authMiddleware(request);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    const query: any = {};

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Role-based filtering
    if (authResult.user.role === "staff") {
      query.$or = [
        { recordedBy: authResult.user._id },
        { status: { $in: ["approved", "paid"] } },
      ];
    }

    // Use the static method from the model
    const summary = await (Expense as any).getSummary(query);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense summary" },
      { status: 500 }
    );
  }
}
