// lib/middleware/api-logger.ts

import dbConnect from "@/lib/dbConnect";
import { APILog } from "@/lib/models/APILog";

interface LogData {
  path: string;
  method: string;
  status?: number;
  userRole?: string;
  requiredRoles?: string[];
  [key: string]: any;
}

export async function logAPIActivity(
  userId: string,
  activityType: string,
  metadata: LogData
): Promise<void> {
  try {
    await dbConnect();

    await APILog.create({
      userId,
      activityType,
      metadata,
      ipAddress: "127.0.0.1", // You can extract from request if needed
      userAgent: "API",
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to log API activity:", error);
  }
}
