// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Params is now a Promise
) {
  try {
    const { id } = await params; // Await the params
    const session = await getSession();

    // ... rest of your authorization and logic
  } catch (error) {
    // ... error handling
  }
}
