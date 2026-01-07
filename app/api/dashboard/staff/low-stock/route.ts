// app/api/dashboard/staff/low-stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { GlassStock } from "@/lib/models/GlassStock";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session || session.user.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const lowStockItems = await GlassStock.find({
      currentQuantity: { $lt: 20 }, // Threshold for low stock
    })
      .sort({ currentQuantity: 1 })
      .limit(10)
      .lean();

    return NextResponse.json({ lowStockItems });
  } catch (error) {
    console.error("Low stock error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
