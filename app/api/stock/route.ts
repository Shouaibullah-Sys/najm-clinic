// app/api/stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getAllStock,
  getStockItem,
  addStockItem,
  updateStockItem,
  deleteStockItem,
  searchStock,
  getStockStats,
  getLowStockItems,
} from "@/lib/stock-management";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const search = searchParams.get("search") || "";
    const glassType = searchParams.get("glassType") || "";
    const supplier = searchParams.get("supplier") || "";
    const minQuantity = searchParams.get("minQuantity");
    const maxQuantity = searchParams.get("maxQuantity");
    const lowStock = searchParams.get("lowStock");
    const stats = searchParams.get("stats");

    // Get specific stock item
    if (id) {
      const item = await getStockItem(id);
      if (!item) {
        return NextResponse.json(
          { error: "Stock item not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(item);
    }

    // Get dashboard stats
    if (stats) {
      const statsData = await getStockStats();
      return NextResponse.json(statsData);
    }

    // Get low stock items
    if (lowStock) {
      const lowStockItems = await getLowStockItems();
      return NextResponse.json(lowStockItems);
    }

    // Search stock with filters
    const filters: any = {};
    if (glassType) filters.glassType = glassType;
    if (supplier) filters.supplier = supplier;
    if (minQuantity) filters.minQuantity = parseInt(minQuantity);
    if (maxQuantity) filters.maxQuantity = parseInt(maxQuantity);

    if (search || Object.keys(filters).length > 0) {
      const stock = await searchStock(search, filters);
      return NextResponse.json(stock);
    }

    // Get all stock
    const stock = await getAllStock();
    return NextResponse.json(stock);
  } catch (error: any) {
    console.error("Error fetching stock:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stock" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      "productName",
      "glassType",
      "thickness",
      "width",
      "height",
      "batchNumber",
      "currentQuantity",
      "originalQuantity",
      "unitPrice",
      "supplier",
    ];

    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const stockItem = await addStockItem(data);
    return NextResponse.json(stockItem, { status: 201 });
  } catch (error: any) {
    console.error("Error creating stock item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create stock item" },
      { status: 500 }
    );
  }
}
