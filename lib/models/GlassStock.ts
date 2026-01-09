import mongoose, { Schema, Types, model } from "mongoose";

export interface IGlassStock {
  _id: Types.ObjectId;
  productName: string;
  glassType: string;
  thickness: number; // in mm
  color?: string;
  width: number; // in cm
  height: number; // in cm
  batchNumber: string;
  currentQuantity: number; // in square meters or pieces
  originalQuantity: number;
  unitPrice: number; // per square meter or per piece
  supplier: string;
  warehouseLocation?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const glassStockSchema = new Schema<IGlassStock>(
  {
    productName: { type: String, required: true, index: true },
    glassType: { type: String, required: true, index: true }, // tempered, laminated, float, etc.
    thickness: { type: Number, required: true, min: 0.1 }, // in mm
    color: { type: String },
    width: { type: Number, required: true, min: 0.1 },
    height: { type: Number, required: true, min: 0.1 },
    batchNumber: { type: String, required: true, unique: true, index: true },
    currentQuantity: { type: Number, required: true, min: 0 },
    originalQuantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    supplier: { type: String, required: true, index: true },
    warehouseLocation: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add virtual for remaining stock percentage
glassStockSchema.virtual("remainingPercentage").get(function () {
  return (this.currentQuantity / this.originalQuantity) * 100;
});

// Add virtual for total area (width * height * quantity)
glassStockSchema.virtual("totalArea").get(function () {
  const widthInMeters = this.width / 100; // assuming width in cm
  const heightInMeters = this.height / 100; // assuming height in cm
  return (widthInMeters * heightInMeters * this.currentQuantity).toFixed(2);
});

// Add virtual for total value
glassStockSchema.virtual("totalValue").get(function () {
  return this.currentQuantity * this.unitPrice;
});

// Indexes for better query performance
glassStockSchema.index({ currentQuantity: 1 }); // For low stock queries
glassStockSchema.index({ glassType: 1, supplier: 1 }); // For filtering
glassStockSchema.index({ createdAt: -1 }); // For recent items

export const GlassStock =
  mongoose.models.GlassStock ||
  model<IGlassStock>("GlassStock", glassStockSchema);
