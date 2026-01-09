// app/api/finance/expenses/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Expense } from "@/lib/models/Expense";
import { apiHandler } from "@/lib/middleware/api-handler";
import { z } from "zod";
import { Parser } from "json2csv";

// Validation schemas
const expenseSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  description: z.string().min(1, "Description is required").max(500),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum([
    "rent",
    "utilities",
    "supplies",
    "maintenance",
    "salary",
    "marketing",
    "travel",
    "equipment",
    "insurance",
    "tax",
    "software",
    "professional_fees",
    "office",
    "medical",
    "glass_supplies",
    "other",
  ]),
  subcategory: z.string().optional(),
  paymentMethod: z.enum([
    "cash",
    "bank_transfer",
    "credit_card",
    "check",
    "mobile_payment",
  ]),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "paid"]).optional(),
  tags: z.array(z.string()).optional(),
});

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  export: z.enum(["csv"]).optional(),
});

// GET: Fetch expenses with filtering
async function GETHandler(request: NextRequest, context: { user: any }) {
  await dbConnect();

  const { searchParams } = request.nextUrl;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const exportFormat = searchParams.get("export");

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

  // Category filter
  if (category) {
    query.category = category;
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Search filter
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { receiptNumber: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
    ];
  }

  // Role-based filtering
  if (context.user.role === "staff") {
    query.$or = [
      { recordedBy: context.user._id },
      { status: { $in: ["approved", "paid"] } },
    ];
  }

  // Fetch expenses
  const expenses = await Expense.find(query)
    .populate("recordedBy", "name email")
    .sort({ date: -1, createdAt: -1 })
    .lean();

  // Export to CSV
  if (exportFormat === "csv") {
    const fields = [
      { label: "Date", value: "date" },
      { label: "Description", value: "description" },
      { label: "Amount", value: "amount" },
      { label: "Category", value: "category" },
      { label: "Subcategory", value: "subcategory" },
      { label: "Payment Method", value: "paymentMethod" },
      { label: "Receipt Number", value: "receiptNumber" },
      { label: "Status", value: "status" },
      { label: "Recorded By", value: "recordedBy.name" },
      { label: "Notes", value: "notes" },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(
      expenses.map((expense) => ({
        ...expense,
        date: new Date(expense.date).toLocaleDateString(),
        amount: expense.amount.toFixed(2),
        recordedBy: (expense.recordedBy as any)?.name || "",
      }))
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="expenses-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  }

  return NextResponse.json(expenses);
}

// POST: Create new expense
async function POSTHandler(request: NextRequest, context: { user: any }) {
  await dbConnect();

  const data = await request.json();

  // Determine status based on user role
  const status =
    context.user.role === "admin" ? data.status || "approved" : "pending";

  // Create expense
  const expense = new Expense({
    ...data,
    recordedBy: context.user._id,
    status,
  });

  await expense.save();

  // Populate for response
  const populatedExpense = await Expense.findById(expense._id)
    .populate("recordedBy", "name email")
    .lean();

  return NextResponse.json(populatedExpense, { status: 201 });
}

// Export handlers with middleware
export const GET = async (request: NextRequest) =>
  apiHandler(request, GETHandler, {
    requireAuth: true,
    validate: { query: querySchema },
  });

export const POST = async (request: NextRequest) =>
  apiHandler(request, POSTHandler, {
    requireAuth: true,
    requiredRoles: ["admin", "staff"],
    validate: { body: expenseSchema },
  });
