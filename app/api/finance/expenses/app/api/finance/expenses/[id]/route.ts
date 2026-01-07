// app/api/finance/expenses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Expense } from "@/lib/models/Expense";
import { authMiddleware } from "@/lib/middleware/auth";
import mongoose from "mongoose";

// PUT: Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Authenticate user
    const authResult = await authMiddleware(request);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

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

    // Check permissions
    const isAdmin = authResult.user.role === "admin";
    const isCreator =
      expense.recordedBy.toString() === authResult.user._id.toString();

    // Staff can only edit their own pending expenses
    if (!isAdmin && (!isCreator || expense.status !== "pending")) {
      return NextResponse.json(
        { error: "You don't have permission to edit this expense" },
        { status: 403 }
      );
    }

    // Admin can update any field, staff can only update certain fields
    const updateData = isAdmin
      ? data
      : {
          date: data.date,
          description: data.description,
          amount: data.amount,
          category: data.category,
          subcategory: data.subcategory,
          paymentMethod: data.paymentMethod,
          receiptNumber: data.receiptNumber,
          notes: data.notes,
          tags: data.tags,
        };

    // Update expense
    Object.assign(expense, updateData);

    // If admin is approving/rejecting, set approvedBy and approvedAt
    if (
      isAdmin &&
      data.status &&
      ["approved", "rejected"].includes(data.status)
    ) {
      expense.approvedBy = authResult.user._id;
      expense.approvedAt = new Date();
    }

    await expense.save();

    // Populate user data for response
    const populatedExpense = await Expense.findById(expense._id)
      .populate("recordedBy", "name email")
      .populate("approvedBy", "name")
      .lean();

    return NextResponse.json(populatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

// DELETE: Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid expense ID" },
        { status: 400 }
      );
    }

    // Delete expense
    const result = await Expense.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
