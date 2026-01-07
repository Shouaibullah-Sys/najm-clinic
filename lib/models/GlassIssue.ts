// lib/models/GlassIssue.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IGlassIssue extends Document {
  glassProductId: mongoose.Types.ObjectId;
  quantity: number;
  issueDate: Date;
  issuedTo: string; // Customer name or company
  issuedBy: string; // Staff name
  orderId?: string;
  projectName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GlassIssueSchema: Schema = new Schema(
  {
    glassProductId: {
      type: Schema.Types.ObjectId,
      ref: "GlassStock",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    issuedTo: {
      type: String,
      required: true,
      trim: true,
    },
    issuedBy: {
      type: String,
      required: true,
      trim: true,
    },
    orderId: {
      type: String,
      trim: true,
    },
    projectName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
GlassIssueSchema.index({ issueDate: -1 });
GlassIssueSchema.index({ glassProductId: 1, issueDate: -1 });

export const GlassIssue =
  mongoose.models.GlassIssue ||
  mongoose.model<IGlassIssue>("GlassIssue", GlassIssueSchema);
