// lib/models/MedicineStock.ts
import mongoose, { Schema, Types, model } from "mongoose";

export interface IMedicineStock {
  _id: Types.ObjectId;
  name: string;
  batchNumber: string;
  currentQuantity: number;
  originalQuantity: number;
  unitPrice: number;
  supplier: string;
  expiryDate: Date;
  manufacturingDate?: Date;
  category?: string;
  description?: string;
  warehouseLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const medicineStockSchema = new Schema<IMedicineStock>(
  {
    name: { type: String, required: true },
    batchNumber: { type: String, required: true, unique: true },
    currentQuantity: { type: Number, required: true, min: 0 },
    originalQuantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    supplier: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    manufacturingDate: { type: Date },
    category: { type: String },
    description: { type: String },
    warehouseLocation: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add virtual for remaining stock percentage
medicineStockSchema.virtual("remainingPercentage").get(function () {
  return (this.currentQuantity / this.originalQuantity) * 100;
});

export const MedicineStock =
  mongoose.models.MedicineStock ||
  model<IMedicineStock>("MedicineStock", medicineStockSchema);
