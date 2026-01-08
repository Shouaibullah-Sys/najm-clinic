// app/api/glass/stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getGlassStock,
  addGlassStock,
  updateGlassStock,
  deleteGlassStock,
} from "@/lib/glass-data";
import { GlassStock } from "@/types/glass";

export async function GET() {
  try {
    const stock = await getGlassStock();
    return NextResponse.json(stock);
  } catch (error) {
    console.error("Error fetching glass stock:", error);
    return NextResponse.json(
      { error: "Failed to fetch glass stock" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
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

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newStock = await addGlassStock(body);
    return NextResponse.json(newStock, { status: 201 });
  } catch (error) {
    console.error("Error creating glass stock:", error);
    return NextResponse.json(
      { error: "Failed to create glass stock" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing stock ID" }, { status: 400 });
    }

    const updatedStock = await updateGlassStock(id, updates);
    if (!updatedStock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    return NextResponse.json(updatedStock);
  } catch (error) {
    console.error("Error updating glass stock:", error);
    return NextResponse.json(
      { error: "Failed to update glass stock" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing stock ID" }, { status: 400 });
    }

    const deleted = await deleteGlassStock(id);
    if (!deleted) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting glass stock:", error);
    return NextResponse.json(
      { error: "Failed to delete glass stock" },
      { status: 500 }
    );
  }
}
