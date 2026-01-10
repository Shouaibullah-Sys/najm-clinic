// lib/models/DailyRecord.ts
import mongoose, { Schema, Types, model } from "mongoose";

export interface IDailyRecord {
  _id: Types.ObjectId;
  patientName: string;
  testType: string;
  phoneNumber: string;
  amountCharged: number;
  amountPaid: number;
  discount: number;
  paymentStatus: "paid" | "unpaid" | "partial";
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dailyRecordSchema = new Schema<IDailyRecord>(
  {
    patientName: { type: String, required: true, index: true },
    testType: { type: String, required: true, index: true },
    phoneNumber: { type: String, required: true },
    amountCharged: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "unpaid",
      index: true,
    },
    date: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Add virtual for balance due
dailyRecordSchema.virtual("balanceDue").get(function () {
  return this.amountCharged - this.amountPaid - this.discount;
});

// Indexes for better query performance
dailyRecordSchema.index({ date: -1 });
dailyRecordSchema.index({ paymentStatus: 1 });
dailyRecordSchema.index({ testType: 1 });

export const DailyRecord =
  mongoose.models.DailyRecord ||
  model<IDailyRecord>("DailyRecord", dailyRecordSchema);

// Type for summary calculations
export interface IDailySummary {
  totalCharged: number;
  totalPaid: number;
  totalDiscount: number;
  totalBalance: number;
  totalRecords: number;
}

// Type for monthly summary
export interface IMonthlySummary {
  month: string;
  year: number;
  totalCharged: number;
  totalPaid: number;
  totalDiscount: number;
  totalBalance: number;
  totalRecords: number;
}
