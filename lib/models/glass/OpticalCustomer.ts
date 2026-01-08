// lib/models/glass/OpticalCustomer.ts
import mongoose, { Schema, Types, model, Model, models } from "mongoose";
import { GlassSphere, GlassCylinder, GlassAxis } from "@/types/glass";

export type { GlassSphere, GlassCylinder, GlassAxis };

export interface IPrescriptionRecord {
  _id: Types.ObjectId;
  date: Date;
  rightEye: {
    sphere: GlassSphere;
    cylinder: GlassCylinder;
    axis: GlassAxis;
  };
  leftEye: {
    sphere: GlassSphere;
    cylinder: GlassCylinder;
    axis: GlassAxis;
  };
  pd: number;
  doctorName?: string;
  clinicName?: string;
}

export interface IOpticalCustomer {
  _id: Types.ObjectId;
  customerNumber: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  prescriptionHistory: IPrescriptionRecord[];
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Static methods interface
export interface OpticalCustomerModel extends Model<IOpticalCustomer> {
  generateCustomerNumber(): Promise<string>;
  findByPhone(phone: string): Promise<IOpticalCustomer | null>;
  searchByName(name: string): Promise<IOpticalCustomer[]>;
}

const prescriptionRecordSchema = new Schema<IPrescriptionRecord>(
  {
    date: { type: Date, required: true },
    rightEye: {
      sphere: { type: String, required: true },
      cylinder: { type: String, required: true },
      axis: { type: Number, required: true, min: 0, max: 180 },
    },
    leftEye: {
      sphere: { type: String, required: true },
      cylinder: { type: String, required: true },
      axis: { type: Number, required: true, min: 0, max: 180 },
    },
    pd: { type: Number, required: true },
    doctorName: { type: String },
    clinicName: { type: String },
  },
  { _id: true }
);

const opticalCustomerSchema = new Schema<
  IOpticalCustomer,
  OpticalCustomerModel
>(
  {
    customerNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    prescriptionHistory: [prescriptionRecordSchema],
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
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
opticalCustomerSchema.index({ customerNumber: 1 }, { unique: true });
opticalCustomerSchema.index({ phone: 1 }, { unique: true });
opticalCustomerSchema.index({ name: "text" });

// Static method to generate customer number
opticalCustomerSchema.statics.generateCustomerNumber = async function () {
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `CUST-${random}`;
};

// Static method to find by phone
opticalCustomerSchema.statics.findByPhone = async function (phone: string) {
  return this.findOne({ phone });
};

// Static method to search by name
opticalCustomerSchema.statics.searchByName = async function (name: string) {
  return this.find({
    name: { $regex: name, $options: "i" },
  });
};

export const OpticalCustomer =
  models.OpticalCustomer ||
  model<IOpticalCustomer, OpticalCustomerModel>(
    "OpticalCustomer",
    opticalCustomerSchema
  );
