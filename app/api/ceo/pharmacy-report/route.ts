// app/api/ceo/pharmacy-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import { Prescription } from "@/lib/models/Prescription";
import { Expense } from "@/lib/models/Expense";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwtDecode(accessToken);

    if (decoded.role !== "ceo") {
      return NextResponse.json(
        { error: "CEO access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get prescriptions with details
    const prescriptions = await Prescription.find(dateFilter)
      .populate("items.medicine", "name batchNumber sellingPrice")
      .populate("issuedBy", "name email")
      .sort({ createdAt: -1 });

    // Get pharmacy expenses
    const expenses = await Expense.find({
      ...dateFilter,
      category: "pharmacy",
    })
      .populate("recordedBy", "name email")
      .sort({ date: -1 });

    // Calculate daily breakdown
    const dailyBreakdown: { [key: string]: any } = {};

    prescriptions.forEach((prescription) => {
      const date = prescription.createdAt.toISOString().split("T")[0];
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          date,
          income: 0,
          expenses: 0,
          prescriptions: 0,
        };
      }
      dailyBreakdown[date].income += prescription.totalAmount;
      dailyBreakdown[date].prescriptions += 1;
    });

    expenses.forEach((expense) => {
      const date = expense.date.toISOString().split("T")[0];
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          date,
          income: 0,
          expenses: 0,
          prescriptions: 0,
        };
      }
      dailyBreakdown[date].expenses += expense.amount;
    });

    const dailyData = Object.values(dailyBreakdown).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      prescriptions,
      expenses,
      dailyData,
      summary: {
        totalIncome: prescriptions.reduce(
          (sum, prescription) => sum + prescription.totalAmount,
          0
        ),
        totalExpenses: expenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        ),
        totalPrescriptions: prescriptions.length,
        totalExpenseItems: expenses.length,
      },
    });
  } catch (error) {
    console.error("Error fetching pharmacy report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
