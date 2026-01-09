import { NextRequest, NextResponse } from "next/server";
import { getAllIssuances, getStockItemIssuances } from "@/lib/order-system";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const stockItemId = searchParams.get("stockItemId");

    // Get issuances for specific stock item
    if (stockItemId) {
      const issuances = await getStockItemIssuances(stockItemId);
      return NextResponse.json(issuances);
    }

    // Get all issuances
    const issuances = await getAllIssuances();
    return NextResponse.json(issuances);
  } catch (error: any) {
    console.error("Error fetching issuances:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch issuances" },
      { status: 500 }
    );
  }
}
