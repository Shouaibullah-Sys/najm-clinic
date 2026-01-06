// app/api/ceo/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import { LaboratoryRecord } from "@/lib/models/LaboratoryRecord";
import { LaboratoryExpense } from "@/lib/models/LaboratoryExpenses";
import { Prescription } from "@/lib/models/Prescription";
import { Expense } from "@/lib/models/Expense";
import { MedicineStock } from "@/lib/models/MedicineStock";

interface TokenPayload {
  id: string;
  role: string;
  [key: string]: any;
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is CEO
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: TokenPayload = jwtDecode(accessToken);

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

    // Build date filter
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const prescriptionDateFilter: any = {};
    if (startDate && endDate) {
      prescriptionDateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Calculate laboratory financials
    const laboratoryRecords = await LaboratoryRecord.find(dateFilter);
    const laboratoryIncome = laboratoryRecords.reduce(
      (sum, record) => sum + record.amountCharged,
      0
    );

    const laboratoryExpenses = await LaboratoryExpense.find(dateFilter);
    const laboratoryExpenseAmount = laboratoryExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const laboratoryProfit = laboratoryIncome - laboratoryExpenseAmount;
    const laboratoryProfitMargin =
      laboratoryIncome > 0 ? (laboratoryProfit / laboratoryIncome) * 100 : 0;

    // Calculate pharmacy financials
    const prescriptions = await Prescription.find(prescriptionDateFilter);
    const pharmacyIncome = prescriptions.reduce(
      (sum, prescription) => sum + prescription.totalAmount,
      0
    );

    const pharmacyExpenses = await Expense.find({
      ...dateFilter,
      category: "pharmacy",
    });
    const pharmacyExpenseAmount = pharmacyExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const pharmacyProfit = pharmacyIncome - pharmacyExpenseAmount;
    const pharmacyProfitMargin =
      pharmacyIncome > 0 ? (pharmacyProfit / pharmacyIncome) * 100 : 0;

    // Calculate medicine alerts
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringSoon = await MedicineStock.countDocuments({
      expiryDate: {
        $gte: today,
        $lte: thirtyDaysFromNow,
      },
    });

    const expired = await MedicineStock.countDocuments({
      expiryDate: {
        $lt: today,
      },
    });

    const lowStock = await MedicineStock.countDocuments({
      currentQuantity: {
        $lt: 10,
      },
    });

    return NextResponse.json({
      laboratory: {
        income: laboratoryIncome,
        expenses: laboratoryExpenseAmount,
        profit: laboratoryProfit,
        profitMargin: laboratoryProfitMargin,
      },
      pharmacy: {
        income: pharmacyIncome,
        expenses: pharmacyExpenseAmount,
        profit: pharmacyProfit,
        profitMargin: pharmacyProfitMargin,
      },
      medicineAlerts: {
        expiringSoon,
        expired,
        lowStock,
      },
      totalPrescriptions: prescriptions.length,
    });
  } catch (error) {
    console.error("Error fetching CEO dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
