// app/api/ophthalmology/records/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getOphthalmologyRecords,
  addOphthalmologyRecord,
} from "@/lib/ophthalmology-data";

export async function GET() {
  try {
    const records = await getOphthalmologyRecords();
    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching ophthalmology records:", error);
    return NextResponse.json(
      { error: "Failed to fetch ophthalmology records" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields (patientId and recordNumber are auto-generated)
    const requiredFields = [
      "patientName",
      "patientPhone",
      "recordType",
      "doctorName",
      "totalAmount",
      "paidAmount",
      "paymentStatus",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newRecord = await addOphthalmologyRecord(body);
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating ophthalmology record:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create ophthalmology record", details: errorMessage },
      { status: 500 }
    );
  }
}
