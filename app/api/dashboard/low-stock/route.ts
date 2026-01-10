import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { GlassStock } from "@/lib/models/GlassStock";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Get low stock items (less than 20% remaining)
    const lowStockItems = await GlassStock.find({
      $expr: {
        $lt: [{ $divide: ["$currentQuantity", "$originalQuantity"] }, 0.2],
      },
    })
      .select(
        "productName glassType currentQuantity originalQuantity unitPrice batchNumber"
      )
      .sort({ currentQuantity: 1 })
      .limit(10);

    // Format data for frontend
    const formattedItems = lowStockItems.map((item) => ({
      _id: item._id.toString(),
      name: item.productName,
      glassType: item.glassType,
      current: item.currentQuantity,
      threshold: item.originalQuantity,
      unitPrice: item.unitPrice,
      batchNumber: item.batchNumber,
      percentage: Math.round(
        (item.currentQuantity / item.originalQuantity) * 100
      ),
    }));

    return NextResponse.json({
      lowStockItems: formattedItems,
      count: lowStockItems.length,
    });
  } catch (error) {
    console.error("Low stock error:", error);
    return NextResponse.json(
      { error: "Failed to fetch low stock items" },
      { status: 500 }
    );
  }
}
