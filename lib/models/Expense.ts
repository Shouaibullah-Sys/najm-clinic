// lib/models/Expense.ts (can remain mostly same)
import mongoose, { Schema, Types, model } from "mongoose";

export interface IExpense {
  _id: Types.ObjectId;
  date: Date;
  amount: number;
  category: string; // rent, utilities, supplies, maintenance, etc.
  description: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      default: "Other",
    },
    description: {
      type: String,
      required: true,
      default: "",
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret._id = ret._id.toString() as any;
        return ret;
      },
    },
  }
);

expenseSchema.virtual("recordedByRef", {
  ref: "User",
  localField: "recordedBy",
  foreignField: "_id",
  justOne: true,
});

export const Expense =
  mongoose.models.Expense || model<IExpense>("Expense", expenseSchema);
