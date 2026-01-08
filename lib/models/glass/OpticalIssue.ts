// lib/models/glass/OpticalIssue.ts
import mongoose, { Schema, Types, model, Model, models } from "mongoose";
import { IssueType, IssuePriority, IssueStatus } from "@/types/glass";

export type { IssueType, IssuePriority, IssueStatus };

export interface IOpticalIssue {
  _id: Types.ObjectId;
  issueNumber: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  description: string;
  resolution?: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// Static methods interface
export interface OpticalIssueModel extends Model<IOpticalIssue> {
  generateIssueNumber(): Promise<string>;
  findByStatus(status: IssueStatus): Promise<IOpticalIssue[]>;
  findByCustomer(customerId: string): Promise<IOpticalIssue[]>;
  findOpenIssues(): Promise<IOpticalIssue[]>;
}

const opticalIssueSchema = new Schema<IOpticalIssue, OpticalIssueModel>(
  {
    issueNumber: { type: String, required: true, unique: true },
    orderId: { type: String },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    type: { type: String, required: true },
    priority: { type: String, required: true },
    status: { type: String, required: true, default: "open" },
    description: { type: String, required: true },
    resolution: { type: String },
    assignedTo: { type: String, required: true },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: unknown, ret: any) => {
        delete ret.__v;
        ret.id = ret._id?.toString();
        return ret;
      },
    },
  }
);

// Indexes
opticalIssueSchema.index({ issueNumber: 1 }, { unique: true });
opticalIssueSchema.index({ customerId: 1 });
opticalIssueSchema.index({ status: 1 });
opticalIssueSchema.index({ priority: 1 });
opticalIssueSchema.index({ createdAt: -1 });

// Static method to generate issue number
opticalIssueSchema.statics.generateIssueNumber = async function () {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Find the latest issue to get the sequence number
  const latestIssue = await this.findOne().sort({ createdAt: -1 });
  let sequence = 1;

  if (latestIssue) {
    const latestIssueNumber = latestIssue.issueNumber;
    const match = latestIssueNumber.match(/ISS-(\d{4})(\d{2})-(\d{4})/);
    if (match) {
      const issueMonth = match[2];
      const issueSeq = parseInt(match[3], 10);
      if (issueMonth === month && issueSeq >= sequence) {
        sequence = issueSeq + 1;
      }
    }
  }

  const random = String(sequence).padStart(4, "0");
  return `ISS-${year}${month}-${random}`;
};

// Static method to find by status
opticalIssueSchema.statics.findByStatus = async function (status: IssueStatus) {
  return this.find({ status }).sort({ priority: -1, createdAt: -1 });
};

// Static method to find by customer
opticalIssueSchema.statics.findByCustomer = async function (
  customerId: string
) {
  return this.find({ customerId }).sort({ createdAt: -1 });
};

// Static method to find open issues
opticalIssueSchema.statics.findOpenIssues = async function () {
  return this.find({
    status: { $in: ["open", "in-progress"] },
  }).sort({ priority: -1, createdAt: -1 });
};

export const OpticalIssue =
  models.OpticalIssue ||
  model<IOpticalIssue, OpticalIssueModel>("OpticalIssue", opticalIssueSchema);
