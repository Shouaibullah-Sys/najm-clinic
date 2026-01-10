// app/api/glass/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { getGlassStock } from "@/lib/glass-data";

export async function GET() {
  try {
    const stats = await getGlassStock();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching glass dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch glass dashboard stats" },
      { status: 500 }
    );
  }
}
