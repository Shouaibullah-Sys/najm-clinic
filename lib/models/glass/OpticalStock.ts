// lib/models/glass/OpticalStock.ts
import mongoose, { Schema, Types, model, Model, models } from "mongoose";
import {
  GlassType,
  GlassMaterial,
  GlassSphere,
  GlassCylinder,
  GlassAxis,
  GlassDiameter,
  GlassColor,
} from "@/types/glass";

// Re-export types for convenience
export type {
  GlassType,
  GlassMaterial,
  GlassSphere,
  GlassCylinder,
  GlassAxis,
  GlassDiameter,
  GlassColor,
};

export interface IOpticalStock {
  _id: Types.ObjectId;
  barcode: string;
  brand: string;
  model: string;
  type: GlassType;
  material: GlassMaterial;
  sphere: GlassSphere;
  cylinder: GlassCylinder;
  axis: GlassAxis;
  diameter: GlassDiameter;
  color: GlassColor;
  stockQuantity: number;
  minStockLevel: number;
  costPrice: number;
  sellingPrice: number;
  supplierId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Static methods interface
export interface OpticalStockModel extends Model<IOpticalStock> {
  findLowStock(): Promise<IOpticalStock[]>;
  searchByBrand(brand: string): Promise<IOpticalStock[]>;
  searchByType(type: GlassType): Promise<IOpticalStock[]>;
}

const opticalStockSchema = new Schema<IOpticalStock, OpticalStockModel>(
  {
    barcode: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    type: { type: String, required: true },
    material: { type: String, required: true },
    sphere: { type: String, required: true },
    cylinder: { type: String, required: true },
    axis: { type: Number, required: true, min: 0, max: 180 },
    diameter: { type: Number, required: true },
    color: { type: String, required: true },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    minStockLevel: { type: Number, required: true, min: 0, default: 10 },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    supplierId: { type: String, required: true },
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

// Virtual for isLowStock
opticalStockSchema.virtual("isLowStock").get(function () {
  return this.stockQuantity <= this.minStockLevel;
});

// Static method to find low stock items
opticalStockSchema.statics.findLowStock = async function () {
  return this.find({ $expr: { $lte: ["$stockQuantity", "$minStockLevel"] } });
};

// Static method to search by brand
opticalStockSchema.statics.searchByBrand = async function (brand: string) {
  return this.find({ brand: { $regex: brand, $options: "i" } });
};

// Static method to search by type
opticalStockSchema.statics.searchByType = async function (type: GlassType) {
  return this.find({ type });
};

// Index for efficient searching
opticalStockSchema.index({ brand: 1, model: 1 });
opticalStockSchema.index({ type: 1 });
opticalStockSchema.index({ stockQuantity: 1 });
opticalStockSchema.index({ barcode: 1 }, { unique: true });

export const OpticalStock =
  models.OpticalStock ||
  model<IOpticalStock, OpticalStockModel>("OpticalStock", opticalStockSchema);
