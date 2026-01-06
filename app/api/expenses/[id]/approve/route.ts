import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Expense } from "@/lib/models";
import { expenseApprovalSchema } from "@/lib/validations";

interface Params {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can approve/reject expenses
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = expenseApprovalSchema.parse(body);
    const { id } = params;

    await dbConnect();

    const expense = await Expense.findById(id);
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    if (expense.status !== "pending") {
      return NextResponse.json(
        { error: "Expense has already been processed" },
        { status: 400 }
      );
    }

    // Update expense status
    if (validatedData.approved) {
      expense.status = "approved";
      expense.approvedBy = session.user.id;
      expense.approvedAt = new Date();
      expense.rejectionReason = undefined;
    } else {
      expense.status = "rejected";
      expense.approvedBy = session.user.id;
      expense.approvedAt = new Date();
      expense.rejectionReason = validatedData.rejectionReason;
    }

    await expense.save();
    await expense.populate("staffId", "name email");
    await expense.populate("approvedBy", "name email");

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Expense approval error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
