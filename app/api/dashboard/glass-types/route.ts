// app/api/dashboard/glass-types/route.ts
import { NextResponse } from "next/server";
import { GlassStock } from "@/lib/models/GlassStock";

export async function GET() {
  try {
    // Aggregate glass types by total area (width * height * quantity)
    const glassTypeData = await GlassStock.aggregate([
      {
        $group: {
          _id: "$glassType",
          totalArea: {
            $sum: {
              $multiply: [
                { $divide: ["$width", 100] }, // Convert width from cm to meters
                { $divide: ["$height", 100] }, // Convert height from cm to meters
                "$currentQuantity",
              ],
            },
          },
          totalCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalArea: -1 },
      },
    ]);

    // Define colors for different glass types
    const colorMap: Record<string, string> = {
      Tempered: "#10B981",
      Laminated: "#8B5CF6",
      Float: "#3B82F6",
      Clear: "#3B82F6",
      Tinted: "#F59E0B",
      Mirrored: "#64748B",
      "Low-E": "#EF4444",
      Insulated: "#06B6D4",
      Patterned: "#A78BFA",
      Borosilicate: "#F97316",
    };

    // Transform data to match frontend expectations
    const formattedData = glassTypeData.map((item, index) => ({
      name: item._id,
      value: Math.round(item.totalArea), // Round to nearest whole number
      color: colorMap[item._id] || `hsl(${(index * 45) % 360}, 70%, 50%)`, // Fallback color
    }));

    // If no data, return empty array
    if (formattedData.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching glass types data:", error);
    return NextResponse.json(
      { error: "Failed to fetch glass types data" },
      { status: 500 }
    );
  }
}
