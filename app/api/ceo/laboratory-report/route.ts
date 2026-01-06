// app/api/ceo/laboratory-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import { LaboratoryRecord } from "@/lib/models/LaboratoryRecord";
import { LaboratoryExpense } from "@/lib/models/LaboratoryExpenses";

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
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get laboratory records with details
    const records = await LaboratoryRecord.find(dateFilter)
      .populate("recordedBy", "name email")
      .sort({ date: -1 });

    // Get laboratory expenses
    const expenses = await LaboratoryExpense.find(dateFilter)
      .populate("recordedBy", "name email")
      .sort({ date: -1 });

    // Calculate daily breakdown
    const dailyBreakdown: { [key: string]: any } = {};

    records.forEach((record) => {
      const date = record.date.toISOString().split("T")[0];
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          date,
          income: 0,
          expenses: 0,
          records: 0,
        };
      }
      dailyBreakdown[date].income += record.amountCharged;
      dailyBreakdown[date].records += 1;
    });

    expenses.forEach((expense) => {
      const date = expense.date.toISOString().split("T")[0];
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          date,
          income: 0,
          expenses: 0,
          records: 0,
        };
      }
      dailyBreakdown[date].expenses += expense.amount;
    });

    const dailyData = Object.values(dailyBreakdown).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      records,
      expenses,
      dailyData,
      summary: {
        totalIncome: records.reduce(
          (sum, record) => sum + record.amountCharged,
          0
        ),
        totalExpenses: expenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        ),
        totalRecords: records.length,
        totalExpenseItems: expenses.length,
      },
    });
  } catch (error) {
    console.error("Error fetching laboratory report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
