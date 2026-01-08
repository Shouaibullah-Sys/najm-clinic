// app/api/glass/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getGlassOrders,
  addGlassOrder,
  updateGlassOrder,
  deleteGlassOrder,
} from "@/lib/glass-data";
import { GlassOrder } from "@/types/glass";

export async function GET() {
  try {
    const orders = await getGlassOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching glass orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch glass orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "customerId",
      "customerName",
      "customerPhone",
      "type",
      "status",
      "leftLens",
      "rightLens",
      "frame",
      "totalAmount",
      "paidAmount",
      "dueAmount",
      "createdBy",
      "assignedTo",
      "expectedDeliveryDate",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newOrder = await addGlassOrder(body);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating glass order:", error);
    return NextResponse.json(
      { error: "Failed to create glass order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const updatedOrder = await updateGlassOrder(id, updates);
    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating glass order:", error);
    return NextResponse.json(
      { error: "Failed to update glass order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const deleted = await deleteGlassOrder(id);
    if (!deleted) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting glass order:", error);
    return NextResponse.json(
      { error: "Failed to delete glass order" },
      { status: 500 }
    );
  }
}
