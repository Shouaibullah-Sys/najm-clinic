// lib/models/glass/OpticalSupplier.ts
import mongoose, { Schema, Types, model, Model, models } from "mongoose";
import { SupplierStatus } from "@/types/glass";

export type { SupplierStatus };

export interface IOpticalSupplier {
  _id: Types.ObjectId;
  supplierCode: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  products: string[];
  totalOrders: number;
  totalSpent: number;
  paymentTerms: string;
  status: SupplierStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Static methods interface
export interface OpticalSupplierModel extends Model<IOpticalSupplier> {
  generateSupplierCode(): Promise<string>;
  findActiveSuppliers(): Promise<IOpticalSupplier[]>;
  searchByName(name: string): Promise<IOpticalSupplier[]>;
}

const opticalSupplierSchema = new Schema<
  IOpticalSupplier,
  OpticalSupplierModel
>(
  {
    supplierCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    products: [{ type: String }],
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    paymentTerms: { type: String, required: true },
    status: { type: String, required: true, default: "active" },
    notes: { type: String },
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
opticalSupplierSchema.index({ supplierCode: 1 }, { unique: true });
opticalSupplierSchema.index({ name: "text" });
opticalSupplierSchema.index({ status: 1 });

// Static method to generate supplier code
opticalSupplierSchema.statics.generateSupplierCode = async function () {
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `SUP-${random}`;
};

// Static method to find active suppliers
opticalSupplierSchema.statics.findActiveSuppliers = async function () {
  return this.find({ status: "active" });
};

// Static method to search by name
opticalSupplierSchema.statics.searchByName = async function (name: string) {
  return this.find({
    name: { $regex: name, $options: "i" },
  });
};

export const OpticalSupplier =
  models.OpticalSupplier ||
  model<IOpticalSupplier, OpticalSupplierModel>(
    "OpticalSupplier",
    opticalSupplierSchema
  );
