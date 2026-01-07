// app/api/dashboard/staff/recent-orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { Order } from "@/lib/models/Order";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session || session.user.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("items.glassProduct", "productName glassType")
      .populate("issuedBy", "name")
      .lean();

    return NextResponse.json({ recentOrders });
  } catch (error) {
    console.error("Recent orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}