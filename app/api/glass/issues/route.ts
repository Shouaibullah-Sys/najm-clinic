// app/api/glass/issues/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getGlassIssues,
  addGlassIssue,
  updateGlassIssue,
  deleteGlassIssue,
} from "@/lib/glass-data";
import { GlassIssue } from "@/types/glass";

export async function GET() {
  try {
    const issues = await getGlassIssues();
    return NextResponse.json(issues);
  } catch (error) {
    console.error("Error fetching glass issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch glass issues" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "customerId",
      "customerName",
      "customerPhone",
      "type",
      "priority",
      "status",
      "description",
      "assignedTo",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newIssue = await addGlassIssue(body);
    return NextResponse.json(newIssue, { status: 201 });
  } catch (error) {
    console.error("Error creating glass issue:", error);
    return NextResponse.json(
      { error: "Failed to create glass issue" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing issue ID" }, { status: 400 });
    }

    const updatedIssue = await updateGlassIssue(id, updates);
    if (!updatedIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error("Error updating glass issue:", error);
    return NextResponse.json(
      { error: "Failed to update glass issue" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing issue ID" }, { status: 400 });
    }

    const deleted = await deleteGlassIssue(id);
    if (!deleted) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting glass issue:", error);
    return NextResponse.json(
      { error: "Failed to delete glass issue" },
      { status: 500 }
    );
  }
}
