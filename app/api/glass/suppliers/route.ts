// app/api/glass/suppliers/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getGlassSuppliers,
  addGlassSupplier,
  updateGlassSupplier,
  deleteGlassSupplier,
} from "@/lib/glass-data";

export async function GET() {
  try {
    const suppliers = await getGlassSuppliers();
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Error fetching glass suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch glass suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "contactPerson",
      "phone",
      "paymentTerms",
      "status",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newSupplier = await addGlassSupplier(body);
    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    console.error("Error creating glass supplier:", error);
    return NextResponse.json(
      { error: "Failed to create glass supplier" },
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
        { error: "Missing supplier ID" },
        { status: 400 }
      );
    }

    const updatedSupplier = await updateGlassSupplier(id, updates);
    if (!updatedSupplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error updating glass supplier:", error);
    return NextResponse.json(
      { error: "Failed to update glass supplier" },
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
        { error: "Missing supplier ID" },
        { status: 400 }
      );
    }

    const deleted = await deleteGlassSupplier(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting glass supplier:", error);
    return NextResponse.json(
      { error: "Failed to delete glass supplier" },
      { status: 500 }
    );
  }
}
