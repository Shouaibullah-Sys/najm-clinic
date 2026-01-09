// app/api/glass/stock/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GlassStock } from "@/lib/models/GlassStock";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";
    const sortBy = searchParams.get("sortBy") || "fifo"; // Default to FIFO

    const filter: any = {
      currentQuantity: { $gt: 0 }, // Only show items with stock
    };

    if (query) {
      filter.$or = [
        { productName: { $regex: query, $options: "i" } },
        { batchNumber: { $regex: query, $options: "i" } },
        { glassType: { $regex: query, $options: "i" } },
        { supplier: { $regex: query, $options: "i" } },
      ];
    }

    if (type) {
      filter.glassType = type;
    }

    // Determine sort order based on sortBy parameter
    let sortOptions: any = {};
    switch (sortBy) {
      case "fifo":
        // FIFO: oldest first (createdAt), then higher quantity first
        sortOptions = { createdAt: 1, currentQuantity: -1 };
        break;
      case "quantity":
        // Sort by quantity (highest first)
        sortOptions = { currentQuantity: -1, productName: 1 };
        break;
      case "name":
        // Sort by product name alphabetically
        sortOptions = { productName: 1, createdAt: 1 };
        break;
      case "batch":
        // Sort by batch number
        sortOptions = { batchNumber: 1, createdAt: 1 };
        break;
      default:
        // Default to FIFO
        sortOptions = { createdAt: 1, currentQuantity: -1 };
    }

    const stockItems = await GlassStock.find(filter)
      .sort(sortOptions)
      .limit(50)
      .lean();

    // Transform _id to id for frontend compatibility
    const transformedItems = stockItems.map((item: any) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json(transformedItems);
  } catch (error) {
    console.error("Error searching stock:", error);
    return NextResponse.json(
      { error: "Failed to search stock" },
      { status: 500 }
    );
  }
}
