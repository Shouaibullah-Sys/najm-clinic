import mongoose, { Schema, Types, model } from "mongoose";

export interface IGlassIssuance {
  _id: Types.ObjectId;
  issuanceNumber: string;
  stockItemId: Types.ObjectId;
  orderId: Types.ObjectId;
  orderNumber: string;
  issuedQuantity: number;
  issuedTo: string; // customer name
  issuedBy: Types.ObjectId;
  issuedAt: Date;
  remarks?: string;
  status: "issued" | "returned" | "damaged";
  returnDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const glassIssuanceSchema = new Schema<IGlassIssuance>(
  {
    issuanceNumber: { type: String, required: true, unique: true, index: true },
    stockItemId: {
      type: Schema.Types.ObjectId,
      ref: "GlassStock",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderNumber: { type: String, required: true, index: true },
    issuedQuantity: { type: Number, required: true, min: 0.01 },
    issuedTo: { type: String, required: true },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issuedAt: { type: Date, default: Date.now },
    remarks: { type: String },
    status: {
      type: String,
      enum: ["issued", "returned", "damaged"],
      default: "issued",
      index: true,
    },
    returnDate: { type: Date },
  },
  { timestamps: true }
);

// Generate issuance number
glassIssuanceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const GlassIssuanceModel = mongoose.model<IGlassIssuance>("GlassIssuance");
    const latestIssuance = await GlassIssuanceModel.findOne({
      issuanceNumber: { $regex: `^ISS-${year}${month}${day}` },
    }).sort({ issuanceNumber: -1 });

    let sequence = 1;
    if (latestIssuance) {
      const match = latestIssuance.issuanceNumber.match(/-(\d{4})$/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }

    this.issuanceNumber = `ISS-${year}${month}${day}-${String(
      sequence
    ).padStart(4, "0")}`;
  }
  next();
});

// Indexes
glassIssuanceSchema.index({ issuedAt: -1 });
glassIssuanceSchema.index({ stockItemId: 1, status: 1 });
glassIssuanceSchema.index({ orderId: 1, status: 1 });

export const GlassIssuance =
  mongoose.models.GlassIssuance ||
  model<IGlassIssuance>("GlassIssuance", glassIssuanceSchema);
