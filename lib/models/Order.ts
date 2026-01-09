// lib/models/Order.ts
import mongoose, { Schema, Types, model } from "mongoose";

export interface OrderItem {
  glassProduct: Types.ObjectId;
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
  issuedBy: Types.ObjectId | string; // Allow both ObjectId and string
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>(
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
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String },
    invoiceNumber: { type: String, unique: true, index: true },
    orderType: {
      type: String,
      required: true,
      enum: ["retail", "wholesale", "contract"],
      default: "retail",
      index: true,
    },
    items: [orderItemSchema],
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
      index: true,
    },
    issuedBy: {
      type: Schema.Types.Mixed, // Allow both ObjectId and string
      required: true,
      // Note: We're not using ref here since it could be string or ObjectId
    },
    notes: String,
  },
  { timestamps: true }
);

// Generate invoice number
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const OrderModel = mongoose.model<IOrder>("Order");
    const latestOrder = await OrderModel.findOne({
      invoiceNumber: { $regex: `^INV-${year}${month}${day}` },
    }).sort({ invoiceNumber: -1 });

    let sequence = 1;
    if (latestOrder) {
      const match = latestOrder.invoiceNumber.match(/-(\d{4})$/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }

    this.invoiceNumber = `INV-${year}${month}${day}-${String(sequence).padStart(
      4,
      "0"
    )}`;
  }
  next();
});

// Calculate balance due before saving
orderSchema.pre("save", function (next) {
  if (this.isModified("totalAmount") || this.isModified("amountPaid")) {
    this.balanceDue = this.totalAmount - this.amountPaid;
  }

  // Calculate total amount from items if not provided
  if (
    (this.isModified("items") || !this.totalAmount) &&
    this.items.length > 0
  ) {
    this.totalAmount = this.items.reduce((total, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const discountAmount = itemTotal * (item.discount / 100);
      return total + (itemTotal - discountAmount);
    }, 0);

    this.balanceDue = this.totalAmount - this.amountPaid;
  }

  next();
});

// Indexes
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerPhone: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ invoiceNumber: 1 });

export const Order =
  mongoose.models.Order || model<IOrder>("Order", orderSchema);
