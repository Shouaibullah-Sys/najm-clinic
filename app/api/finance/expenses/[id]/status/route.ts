// app/api/finance/expenses/[id]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Expense } from "@/lib/models/Expense";
import { authMiddleware } from "@/lib/middleware/auth";
import mongoose from "mongoose";

// PATCH: Update expense status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Authenticate user
    const authResult = await authMiddleware(request);
    if (!authResult.user || authResult.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = ["pending", "approved", "rejected", "paid"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid expense ID" },
        { status: 400 }
      );
    }

    // Find expense
    const expense = await Expense.findById(id);
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Update status
    expense.status = status;

    await expense.save();

    // Populate user data for response
    const populatedExpense = await Expense.findById(expense._id)
      .populate("recordedBy", "name email")
      .lean();

    return NextResponse.json(populatedExpense);
  } catch (error) {
    console.error("Error updating expense status:", error);
    return NextResponse.json(
      { error: "Failed to update expense status" },
      { status: 500 }
    );
  }
}
