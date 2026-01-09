import { NextRequest, NextResponse } from "next/server";
import {
  getStockItem,
  updateStockItem,
  deleteStockItem,
} from "@/lib/stock-management";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const item = await getStockItem(params.id);
    if (!item) {
      return NextResponse.json(
        { error: "Stock item not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(item);
  } catch (error: any) {
    console.error("Error fetching stock item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stock item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const data = await request.json();
    const updatedItem = await updateStockItem(params.id, data);

    if (!updatedItem) {
      return NextResponse.json(
        { error: "Stock item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error("Error updating stock item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update stock item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const success = await deleteStockItem(params.id);

    if (!success) {
      return NextResponse.json(
        { error: "Stock item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting stock item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete stock item" },
      { status: 500 }
    );
  }
}
