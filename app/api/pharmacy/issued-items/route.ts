// app/api/pharmacy/issued-items/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getTokenPayload } from "@/lib/auth/jwt";
import { Prescription } from "@/lib/models/Prescription";
import { MedicineStock } from "@/lib/models/MedicineStock";

export async function GET(req: NextRequest) {
  await dbConnect();
  const payload = await getTokenPayload(req);

  if (!payload || !(payload.role === "pharmacy" || payload.role === "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    // Set date range for the selected day
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find prescriptions issued on the selected date
    const dailyPrescriptions = await Prescription.find({
      status: "completed",
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate(
        "items.medicine",
        "name batchNumber unitPrice currentQuantity originalQuantity"
      )
      .populate("issuedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Transform data into daily issued items format
    const issuedItems = [];
    for (const prescription of dailyPrescriptions) {
      for (const item of prescription.items) {
        if (item.medicine && typeof item.medicine !== "string") {
          const medicine = item.medicine as any;
          issuedItems.push({
            _id: `${prescription._id}-${medicine._id}`,
            medicineId: medicine._id,
            name: medicine.name,
            batchNumber: medicine.batchNumber,
            quantityIssued: item.quantity,
            currentStock: medicine.currentQuantity,
            originalStock: medicine.originalQuantity,
            issueDate: prescription.createdAt,
            issuedTo: prescription.patientName,
            issuedBy: prescription.issuedBy?.name || "Unknown",
            unitPrice: item.unitPrice,
            totalPrice:
              item.quantity * item.unitPrice * (1 - item.discount / 100),
            prescriptionId: prescription.invoiceNumber,
          });
        }
      }
    }

    return NextResponse.json(issuedItems);
  } catch (error) {
    console.error("Error fetching daily issued items:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily issued items" },
      { status: 500 }
    );
  }
}
