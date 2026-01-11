// app/api/glass/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getGlassCustomers,
  addGlassCustomer,
  updateGlassCustomer,
  deleteGlassCustomer,
} from "@/lib/glass-data";

export async function GET() {
  try {
    const customers = await getGlassCustomers();
    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching glass customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch glass customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["name", "phone"];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newCustomer = await addGlassCustomer(body);
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("Error creating glass customer:", error);
    return NextResponse.json(
      { error: "Failed to create glass customer" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing customer ID" },
        { status: 400 }
      );
    }

    const updatedCustomer = await updateGlassCustomer(id, updates);
    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating glass customer:", error);
    return NextResponse.json(
      { error: "Failed to update glass customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing customer ID" },
        { status: 400 }
      );
    }

    const deleted = await deleteGlassCustomer(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting glass customer:", error);
    return NextResponse.json(
      { error: "Failed to delete glass customer" },
      { status: 500 }
    );
  }
}
