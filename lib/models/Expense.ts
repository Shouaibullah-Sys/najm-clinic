// lib/models/Expense.ts (can remain mostly same)
import mongoose, { Schema, Types, model, Model } from "mongoose";

// Import types for the summary
import { ExpenseCategory, PaymentMethod } from "@/lib/types/expense";

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

// Static method interface
export interface ExpenseModel extends Model<IExpense> {
  getSummary(query: any): Promise<{
    total: number;
    byCategory: Record<ExpenseCategory, number>;
    byMonth: Record<string, number>;
    byPaymentMethod: Record<PaymentMethod, number>;
  }>;
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

// Static method to get expense summary
(expenseSchema.statics as any).getSummary = async function (query: any) {
  const now = new Date();
  const thisYear = now.getFullYear();

  // Aggregate for total amount
  const totalResult = await this.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const total = totalResult[0]?.total || 0;

  // Aggregate by category
  const byCategoryResult = await this.aggregate([
    { $match: query },
    { $group: { _id: "$category", amount: { $sum: "$amount" } } },
  ]);

  const byCategory: Record<ExpenseCategory, number> = {
    rent: 0,
    utilities: 0,
    supplies: 0,
    maintenance: 0,
    salary: 0,
    marketing: 0,
    travel: 0,
    equipment: 0,
    insurance: 0,
    tax: 0,
    software: 0,
    professional_fees: 0,
    office: 0,
    medical: 0,
    glass_supplies: 0,
    other: 0,
  };

  byCategoryResult.forEach((item: any) => {
    if (item._id in byCategory) {
      byCategory[item._id as ExpenseCategory] = item.amount;
    }
  });

  // Aggregate by month (current year)
  const byMonthResult = await this.aggregate([
    {
      $match: {
        ...query,
        date: {
          $gte: new Date(thisYear, 0, 1),
          $lte: new Date(thisYear, 11, 31, 23, 59, 59),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$date" },
        amount: { $sum: "$amount" },
      },
    },
  ]);

  const byMonth: Record<string, number> = {};
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  byMonthResult.forEach((item: any) => {
    const monthName = monthNames[item._id - 1];
    byMonth[monthName] = item.amount;
  });

  return {
    total,
    byCategory,
    byMonth,
    byPaymentMethod: {
      cash: 0,
      bank_transfer: 0,
      credit_card: 0,
      check: 0,
      mobile_payment: 0,
    },
  };
};

export const Expense =
  mongoose.models.Expense ||
  model<IExpense, ExpenseModel>("Expense", expenseSchema);
