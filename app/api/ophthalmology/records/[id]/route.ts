// app/api/ophthalmology/records/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getOphthalmologyRecordById,
  updateOphthalmologyRecord,
  deleteOphthalmologyRecord,
} from "@/lib/ophthalmology-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getOphthalmologyRecordById(id);

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error fetching ophthalmology record:", error);
    return NextResponse.json(
      { error: "Failed to fetch ophthalmology record" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { id: bodyId, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
    }

    const updatedRecord = await updateOphthalmologyRecord(id, updates);

    if (!updatedRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error("Error updating ophthalmology record:", error);
    return NextResponse.json(
      { error: "Failed to update ophthalmology record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
    }

    const deleted = await deleteOphthalmologyRecord(id);

    if (!deleted) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ophthalmology record:", error);
    return NextResponse.json(
      { error: "Failed to delete ophthalmology record" },
      { status: 500 }
    );
  }
}
