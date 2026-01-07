// app/api/pharmacy/stock/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MedicineStock } from "@/lib/models/GlassStock";
import dbConnect from "@/lib/dbConnect";
import { getTokenPayload } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  await dbConnect();
  const payload = await getTokenPayload(req);

  if (!payload || !(payload.role === "admin" || payload.role === "pharmacy")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const reportType = searchParams.get("type");
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    let query = {};

    switch (reportType) {
      case "expired":
        query = { expiryDate: { $lt: today } };
        break;
      case "expiring-soon":
        query = {
          expiryDate: {
            $gte: today,
            $lte: thirtyDaysFromNow,
          },
        };
        break;
      case "low-stock":
        query = {
          $expr: {
            $lt: [
              { $divide: ["$currentQuantity", "$originalQuantity"] },
              0.2, // 20% threshold for low stock
            ],
          },
        };
        break;
      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }

    const medicines = await MedicineStock.find(query)
      .sort({ expiryDate: 1 })
      .lean();

    return NextResponse.json({ data: medicines });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
