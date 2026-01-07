// lib/models/Order.ts
import mongoose, { Schema, Types } from "mongoose";
import { IGlassStock } from "./GlassStock";

export interface OrderItem {
  glassProduct: Types.ObjectId | IGlassStock;
  quantity: number;
  discount: number;
  unitPrice: number;
  cutToSize?: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface IOrder {
  _id: Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  invoiceNumber: string;
  orderType: "retail" | "wholesale" | "contract";
  items: OrderItem[];
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: "cash" | "card" | "credit";
  deliveryRequired: boolean;
  deliveryAddress?: string;
  installationRequired: boolean;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "delivered"
    | "installed"
    | "cancelled";
  issuedBy: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String },
    invoiceNumber: { type: String, required: true, unique: true },
    orderType: {
      type: String,
      required: true,
      enum: ["retail", "wholesale", "contract"],
      default: "retail",
    },
    items: [
      {
        glassProduct: {
          type: Schema.Types.ObjectId,
          ref: "GlassStock",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        discount: { type: Number, default: 0, min: 0, max: 100 },
        unitPrice: { type: Number, required: true, min: 0 },
        cutToSize: { type: Boolean, default: false },
        dimensions: {
          width: { type: Number, min: 0.1 },
          height: { type: Number, min: 0.1 },
        },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, required: true, min: 0 },
    balanceDue: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "card", "credit"],
      default: "cash",
    },
    deliveryRequired: { type: Boolean, default: false },
    deliveryAddress: { type: String },
    installationRequired: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "delivered",
        "installed",
        "cancelled",
      ],
      default: "pending",
    },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: String,
  },
  { timestamps: true }
);

// Add pre-save hook to update glass stock when order is completed
orderSchema.pre("save", async function (next) {
  if (this.status === "completed" && this.isModified("status")) {
    for (const item of this.items) {
      await mongoose.model("GlassStock").findByIdAndUpdate(item.glassProduct, {
        $inc: { currentQuantity: -item.quantity },
      });
    }
  }
  next();
});

// Calculate balance due before saving
orderSchema.pre("save", function (next) {
  this.balanceDue = this.totalAmount - this.amountPaid;
  next();
});

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);
