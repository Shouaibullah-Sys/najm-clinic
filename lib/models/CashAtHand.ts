// lib/models/CashAtHand.ts
import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface ICashAtHand extends Document {
  staffId: mongoose.Types.ObjectId | IUser;
  amount: number;
  date: Date;
  description: string;
  type: "opening" | "closing" | "adjustment";
  createdAt: Date;
  updatedAt: Date;
}

const CashAtHandSchema: Schema = new Schema(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["opening", "closing", "adjustment"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

CashAtHandSchema.index({ staffId: 1, date: -1 });
CashAtHandSchema.index({ date: -1 });

// Change from export default to named export
export const CashAtHand =
  mongoose.models.CashAtHand ||
  mongoose.model<ICashAtHand>("CashAtHand", CashAtHandSchema);
