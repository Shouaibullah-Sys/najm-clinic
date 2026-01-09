// app/api/glass/optical-stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getOpticalGlassStock,
  addOpticalGlassStock,
  updateOpticalGlassStock,
  deleteOpticalGlassStock,
} from "@/lib/glass-data";

export async function GET() {
  try {
    const stock = await getOpticalGlassStock();
    return NextResponse.json(stock);
  } catch (error) {
    console.error("Error fetching optical glass stock:", error);
    return NextResponse.json(
      { error: "Failed to fetch optical glass stock" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields for OPTICAL GLASS STOCK
    const requiredFields = [
      "brand",
      "model",
      "type",
      "material",
      "sphere",
      "cylinder",
      "axis",
      "diameter",
      "color",
      "stockQuantity",
      "minStockLevel",
      "costPrice",
      "sellingPrice",
      "supplierId",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 }
      );
    }

    const newStock = await addOpticalGlassStock(body);
    return NextResponse.json(newStock, { status: 201 });
  } catch (error) {
    console.error("Error creating optical glass stock:", error);
    return NextResponse.json(
      { error: "Failed to create optical glass stock" },
      { status: 500 }
    );
  }
}
