import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { GlassIssuance } from "@/lib/models/GlassIssuance";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const stockItemId = searchParams.get("stockItemId");
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");

    // Build filter
    const filter: any = {};
    if (stockItemId) filter.stockItemId = stockItemId;
    if (orderId) filter.orderId = orderId;
    if (status) filter.status = status;

    // Get glass issuances
    const issuances = await GlassIssuance.find(filter)
      .populate("stockItemId", "productName glassType thickness")
      .populate("orderId", "orderNumber")
      .populate("issuedBy", "name email")
      .sort({ issuedAt: -1 })
      .lean();

    // Transform _id to id for frontend compatibility
    const transformedIssuances = issuances.map((issuance: any) => ({
      ...issuance,
      id: issuance._id.toString(),
      _id: undefined,
      stockItemId: issuance.stockItemId
        ? {
            ...issuance.stockItemId,
            id: issuance.stockItemId._id.toString(),
            _id: undefined,
          }
        : null,
      orderId: issuance.orderId
        ? {
            ...issuance.orderId,
            id: issuance.orderId._id.toString(),
            _id: undefined,
          }
        : null,
      issuedBy: issuance.issuedBy
        ? {
            ...issuance.issuedBy,
            id: issuance.issuedBy._id.toString(),
            _id: undefined,
          }
        : null,
    }));

    return NextResponse.json(transformedIssuances);
  } catch (error: any) {
    console.error("Error fetching glass issues:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch glass issues" },
      { status: 500 }
    );
  }
}
