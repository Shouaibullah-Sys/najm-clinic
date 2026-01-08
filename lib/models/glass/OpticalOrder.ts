// lib/models/glass/OpticalOrder.ts
import mongoose, { Schema, Types, model, Model, models } from "mongoose";
import {
  OrderStatus,
  OrderType,
  GlassType,
  GlassMaterial,
  GlassSphere,
  GlassCylinder,
  GlassAxis,
  GlassDiameter,
  GlassColor,
} from "@/types/glass";

export type {
  OrderStatus,
  OrderType,
  GlassType,
  GlassMaterial,
  GlassSphere,
  GlassCylinder,
  GlassAxis,
  GlassDiameter,
  GlassColor,
};

export interface ILensPrescription {
  sphere: GlassSphere;
  cylinder: GlassCylinder;
  axis: GlassAxis;
  diameter: GlassDiameter;
  type: GlassType;
  material: GlassMaterial;
  color: GlassColor;
}

export interface IFrame {
  brand: string;
  model: string;
  color: string;
  size: string;
}

export interface IOpticalOrder {
  _id: Types.ObjectId;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: OrderType;
  status: OrderStatus;
  leftLens: ILensPrescription;
  rightLens: ILensPrescription;
  frame: IFrame;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  notes: string;
  createdBy: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  expectedDeliveryDate: Date;
  completedAt?: Date;
}

// Static methods interface
export interface OpticalOrderModel extends Model<IOpticalOrder> {
  generateOrderNumber(): Promise<string>;
  findByStatus(status: OrderStatus): Promise<IOpticalOrder[]>;
  findByCustomer(customerId: string): Promise<IOpticalOrder[]>;
  findPendingOrders(): Promise<IOpticalOrder[]>;
}

const lensPrescriptionSchema = new Schema<ILensPrescription>(
  {
    sphere: { type: String, required: true },
    cylinder: { type: String, required: true },
    axis: { type: Number, required: true, min: 0, max: 180 },
    diameter: { type: Number, required: true },
    type: { type: String, required: true },
    material: { type: String, required: true },
    color: { type: String, required: true },
  },
  { _id: false }
);

const frameSchema = new Schema<IFrame>(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
  },
  { _id: false }
);

const opticalOrderSchema = new Schema<IOpticalOrder, OpticalOrderModel>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    type: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    leftLens: { type: lensPrescriptionSchema, required: true },
    rightLens: { type: lensPrescriptionSchema, required: true },
    frame: { type: frameSchema, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0, default: 0 },
    dueAmount: { type: Number, required: true, min: 0, default: 0 },
    notes: { type: String, default: "" },
    createdBy: { type: String, required: true },
    assignedTo: { type: String, required: true },
    expectedDeliveryDate: { type: Date, required: true },
    completedAt: { type: Date },
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
opticalOrderSchema.index({ orderNumber: 1 }, { unique: true });
opticalOrderSchema.index({ customerId: 1 });
opticalOrderSchema.index({ status: 1 });
opticalOrderSchema.index({ createdAt: -1 });
opticalOrderSchema.index({ expectedDeliveryDate: 1 });

// Static method to generate order number
opticalOrderSchema.statics.generateOrderNumber = async function () {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Find the latest order to get the sequence number
  const latestOrder = await this.findOne().sort({ createdAt: -1 });
  let sequence = 1;

  if (latestOrder) {
    const latestOrderNumber = latestOrder.orderNumber;
    const match = latestOrderNumber.match(/ORD-(\d{4})(\d{2})-(\d{4})/);
    if (match) {
      const orderMonth = match[2];
      const orderSeq = parseInt(match[3], 10);
      if (orderMonth === month && orderSeq >= sequence) {
        sequence = orderSeq + 1;
      }
    }
  }

  const random = String(sequence).padStart(4, "0");
  return `ORD-${year}${month}-${random}`;
};

// Static method to find by status
opticalOrderSchema.statics.findByStatus = async function (status: OrderStatus) {
  return this.find({ status });
};

// Static method to find by customer
opticalOrderSchema.statics.findByCustomer = async function (
  customerId: string
) {
  return this.find({ customerId }).sort({ createdAt: -1 });
};

// Static method to find pending orders
opticalOrderSchema.statics.findPendingOrders = async function () {
  return this.find({
    status: { $in: ["pending", "confirmed", "processing"] },
  }).sort({ expectedDeliveryDate: 1 });
};

export const OpticalOrder =
  models.OpticalOrder ||
  model<IOpticalOrder, OpticalOrderModel>("OpticalOrder", opticalOrderSchema);
