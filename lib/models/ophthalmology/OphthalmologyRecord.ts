// lib/models/ophthalmology/OphthalmologyRecord.ts
import mongoose, { Schema, Types, model, Model } from "mongoose";

export interface IOphthalmologyRecord {
  _id: Types.ObjectId;
  recordNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  recordDate: Date;
  recordType:
    | "examination"
    | "consultation"
    | "treatment"
    | "surgery"
    | "follow-up";
  doctorName: string;
  chiefComplaint?: string;
  examinationFindings?: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string[];
  notes?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: "paid" | "partial" | "unpaid";
  createdAt: Date;
  updatedAt: Date;
}

interface OphthalmologyRecordModel extends Model<IOphthalmologyRecord> {
  generateRecordNumber(): Promise<string>;
}

const ophthalmologyRecordSchema = new Schema<
  IOphthalmologyRecord,
  OphthalmologyRecordModel
>(
  {
    recordNumber: { type: String, required: true, unique: true },
    patientId: {
      type: String,
      required: false,
      default: () => new Types.ObjectId().toString(),
    },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    recordDate: { type: Date, required: true, default: Date.now },
    recordType: {
      type: String,
      required: true,
      enum: [
        "examination",
        "consultation",
        "treatment",
        "surgery",
        "follow-up",
      ],
    },
    doctorName: { type: String, required: true },
    chiefComplaint: { type: String },
    examinationFindings: { type: String },
    diagnosis: { type: String },
    treatment: { type: String },
    prescriptions: [{ type: String }],
    notes: { type: String },
    totalAmount: { type: Number, required: true, min: 0, default: 0 },
    paidAmount: { type: Number, required: true, min: 0, default: 0 },
    dueAmount: { type: Number, required: true, min: 0, default: 0 },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid",
    },
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

// Static method to generate record number
ophthalmologyRecordSchema.statics.generateRecordNumber = async function () {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  // Find the last record created today
  const lastRecord = await this.findOne({
    recordNumber: { $regex: `^OPH-${year}${month}` },
  }).sort({ createdAt: -1 });

  if (!lastRecord) {
    return `OPH-${year}${month}-001`;
  }

  // Extract the sequential number and increment
  const lastNumber = lastRecord.recordNumber.split("-").pop();
  const nextNumber = String(parseInt(lastNumber || "0") + 1).padStart(3, "0");

  return `OPH-${year}${month}-${nextNumber}`;
};

// Indexes for efficient searching (recordNumber already has unique index from schema)
ophthalmologyRecordSchema.index({ patientName: 1 });
ophthalmologyRecordSchema.index({ patientPhone: 1 });
ophthalmologyRecordSchema.index({ recordDate: -1 });
ophthalmologyRecordSchema.index({ doctorName: 1 });

// Delete cached model to allow schema changes to take effect
if (mongoose.models.OphthalmologyRecord) {
  delete mongoose.models.OphthalmologyRecord;
}

export const OphthalmologyRecord = model<
  IOphthalmologyRecord,
  OphthalmologyRecordModel
>("OphthalmologyRecord", ophthalmologyRecordSchema);
