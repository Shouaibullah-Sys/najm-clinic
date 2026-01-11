import { NextRequest, NextResponse } from "next/server";
import { issueStockToOrder, returnStock } from "@/lib/order-system";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const data = await request.json();

    const requiredFields = ["stockItemId", "quantity", "issuedBy"];
    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await issueStockToOrder(
      id,
      data.stockItemId,
      data.quantity,
      data.issuedBy,
      data.remarks
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error issuing stock:", error);
    return NextResponse.json(
      { error: error.message || "Failed to issue stock" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const issuanceId = searchParams.get("issuanceId");
    const action = searchParams.get("action");

    if (!issuanceId) {
      return NextResponse.json(
        { error: "Issuance ID is required" },
        { status: 400 }
      );
    }

    if (action === "return") {
      const data = await request.json();
      const result = await returnStock(issuanceId, data.remarks);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error processing issuance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process issuance" },
      { status: 500 }
    );
  }
}
