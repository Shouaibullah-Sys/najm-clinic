// lib/models/DailyCash.ts
import mongoose, { Schema, Types, model } from "mongoose";

export interface IDailyCash {
  _id: Types.ObjectId;
  date: Date;
  openingBalance: number;
  closingBalance: number;
  cashSales: number;
  cardSales: number;
  creditSales: number;
  expenses: number;
  discrepancy: number;
  verifiedBy: Types.ObjectId;
  notes?: string;
  orders: Types.ObjectId[];
  expenseRecords: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const dailyCashSchema = new Schema<IDailyCash>(
  {
    date: { type: Date, required: true, unique: true },
    openingBalance: { type: Number, required: true, min: 0 },
    closingBalance: { type: Number, required: true, min: 0 },
    cashSales: { type: Number, default: 0, min: 0 },
    cardSales: { type: Number, default: 0, min: 0 },
    creditSales: { type: Number, default: 0, min: 0 },
    expenses: { type: Number, default: 0, min: 0 },
    discrepancy: { type: Number, default: 0 },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: String,
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    expenseRecords: [{ type: Schema.Types.ObjectId, ref: "DailyExpense" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add virtuals for population
dailyCashSchema.virtual("orderDetails", {
  ref: "Order",
  localField: "orders",
  foreignField: "_id",
  justOne: false,
});

dailyCashSchema.virtual("expenseDetails", {
  ref: "DailyExpense",
  localField: "expenseRecords",
  foreignField: "_id",
  justOne: false,
});

dailyCashSchema.virtual("verifiedByRef", {
  ref: "User",
  localField: "verifiedBy",
  foreignField: "_id",
  justOne: true,
});

// Change to named export
export const DailyCash =
  mongoose.models.DailyCash || model<IDailyCash>("DailyCash", dailyCashSchema);
