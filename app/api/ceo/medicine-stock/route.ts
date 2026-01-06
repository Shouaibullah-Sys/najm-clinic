// app/api/ceo/medicine-stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";
import dbConnect from "@/lib/dbConnect";
import { MedicineStock } from "@/lib/models/MedicineStock";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwtDecode(accessToken);

    if (decoded.role !== "ceo") {
      return NextResponse.json(
        { error: "CEO access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const medicines = await MedicineStock.find().sort({ expiryDate: 1 });

    return NextResponse.json(medicines);
  } catch (error) {
    console.error("Error fetching medicine stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
