// lib/models/Session.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  id: string;
  userId: string;
  expiresAt: Date;
  userRole: "admin" | "staff";
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema: Schema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      enum: ["admin", "staff"],
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add TTL index for automatic expiration
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
