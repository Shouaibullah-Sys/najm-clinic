import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { CashAtHand } from "@/lib/models";
import { cashCreateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: any = {};

    // Role-based filtering
    if (session.user.role === "staff") {
      query.staffId = session.user.id;
    }

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [cashRecords, total] = await Promise.all([
      CashAtHand.find(query)
        .populate("staffId", "name email")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CashAtHand.countDocuments(query),
    ]);

    return NextResponse.json({
      cashRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Cash records fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = cashCreateSchema.parse(body);

    await dbConnect();

    const cashRecord = new CashAtHand({
      ...validatedData,
      staffId: session.user.id,
      date: validatedData.date || new Date(),
    });

    await cashRecord.save();
    await cashRecord.populate("staffId", "name email");

    return NextResponse.json(cashRecord, { status: 201 });
  } catch (error) {
    console.error("Cash record creation error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
