import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface ISale extends Document {
  staffId: mongoose.Types.ObjectId | IUser;
  amount: number;
  description: string;
  paymentMethod: "cash" | "card" | "transfer";
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema: Schema = new Schema(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

SaleSchema.index({ staffId: 1, date: -1 });
SaleSchema.index({ date: -1 });

export default mongoose.models.Sale ||
  mongoose.model<ISale>("Sale", SaleSchema);
