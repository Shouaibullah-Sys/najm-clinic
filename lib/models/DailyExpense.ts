// lib/models/DailyExpense.ts
import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser } from "./User";

export type ExpenseType =
  | "normal"
  | "staff_salary"
  | "clinic_rent"
  | "medical_supplies"
  | "equipment"
  | "utilities"
  | "other";

export type ExpenseCategory =
  | "operational"
  | "salary"
  | "rent"
  | "supplies"
  | "equipment"
  | "utilities"
  | "miscellaneous";

export interface IDailyExpense extends Document {
  date: Date;
  description: string;
  amount: number;
  expenseType: ExpenseType;
  category: ExpenseCategory;
  receiptNumber?: string;
  recordedBy: mongoose.Types.ObjectId | IUser;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyExpenseSchema = new Schema<IDailyExpense>(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    expenseType: {
      type: String,
      required: true,
      enum: [
        "normal",
        "staff_salary",
        "clinic_rent",
        "medical_supplies",
        "equipment",
        "utilities",
        "other",
      ],
      default: "normal",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "operational",
        "salary",
        "rent",
        "supplies",
        "equipment",
        "utilities",
        "miscellaneous",
      ],
      default: "operational",
    },
    receiptNumber: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Add indexes for efficient querying
DailyExpenseSchema.index({ date: -1 });
DailyExpenseSchema.index({ expenseType: 1, date: -1 });
DailyExpenseSchema.index({ category: 1, date: -1 });
DailyExpenseSchema.index({ recordedBy: 1, date: -1 });

// Virtual field for day's date (without time)
DailyExpenseSchema.virtual("dayDate").get(function () {
  const date = new Date(this.date);
  date.setHours(0, 0, 0, 0);
  return date;
});

// Pre-save hook to auto-calculate category based on expense type only if not manually set
DailyExpenseSchema.pre("save", function (next) {
  // Only auto-set category if it's not explicitly provided or is default
  if (!this.category || this.category === "operational") {
    const categoryMap: Record<ExpenseType, ExpenseCategory> = {
      normal: "operational",
      staff_salary: "salary",
      clinic_rent: "rent",
      medical_supplies: "supplies",
      equipment: "equipment",
      utilities: "utilities",
      other: "miscellaneous",
    };
    this.category =
      categoryMap[this.expenseType as ExpenseType] || "operational";
  }
  next();
});

// Type definitions for summary responses
export interface DailySummary {
  date: Date;
  totalExpenses: number;
  totalAmount: number;
  byType: Record<ExpenseType, number>;
  byCategory: Record<ExpenseCategory, number>;
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalExpenses: number;
  totalAmount: number;
  dailyBreakdown: Record<
    string,
    {
      count: number;
      amount: number;
      details: Array<{
        description: string;
        amount: number;
        type: ExpenseType;
      }>;
    }
  >;
}

export interface ExpenseAnalysis {
  period: { startDate: Date; endDate: Date };
  totalExpenses: number;
  totalAmount: number;
  averageDailyExpense: number;
  topExpenses: Array<{
    date: Date;
    description: string;
    amount: number;
    type: ExpenseType;
    category: ExpenseCategory;
  }>;
  categoryDistribution: Record<
    ExpenseCategory,
    { count: number; amount: number; percentage: number }
  >;
}

// Static method for daily expense summary
DailyExpenseSchema.statics.getDailySummary = async function (
  date: Date
): Promise<DailySummary> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const expenses = await this.find({
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  // Use aggregation for better performance
  const result = await this.aggregate([
    {
      $match: { date: { $gte: startOfDay, $lte: endOfDay } },
    },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        normal: {
          $sum: { $cond: [{ $eq: ["$expenseType", "normal"] }, "$amount", 0] },
        },
        staff_salary: {
          $sum: {
            $cond: [{ $eq: ["$expenseType", "staff_salary"] }, "$amount", 0],
          },
        },
        clinic_rent: {
          $sum: {
            $cond: [{ $eq: ["$expenseType", "clinic_rent"] }, "$amount", 0],
          },
        },
        medical_supplies: {
          $sum: {
            $cond: [
              { $eq: ["$expenseType", "medical_supplies"] },
              "$amount",
              0,
            ],
          },
        },
        equipment: {
          $sum: {
            $cond: [{ $eq: ["$expenseType", "equipment"] }, "$amount", 0],
          },
        },
        utilities: {
          $sum: {
            $cond: [{ $eq: ["$expenseType", "utilities"] }, "$amount", 0],
          },
        },
        other: {
          $sum: { $cond: [{ $eq: ["$expenseType", "other"] }, "$amount", 0] },
        },
        operational: {
          $sum: {
            $cond: [{ $eq: ["$category", "operational"] }, "$amount", 0],
          },
        },
        salary: {
          $sum: { $cond: [{ $eq: ["$category", "salary"] }, "$amount", 0] },
        },
        rent: {
          $sum: { $cond: [{ $eq: ["$category", "rent"] }, "$amount", 0] },
        },
        supplies: {
          $sum: { $cond: [{ $eq: ["$category", "supplies"] }, "$amount", 0] },
        },
        equipmentCat: {
          $sum: { $cond: [{ $eq: ["$category", "equipment"] }, "$amount", 0] },
        },
        utilitiesCat: {
          $sum: { $cond: [{ $eq: ["$category", "utilities"] }, "$amount", 0] },
        },
        miscellaneous: {
          $sum: {
            $cond: [{ $eq: ["$category", "miscellaneous"] }, "$amount", 0],
          },
        },
      },
    },
  ]).exec();

  const agg = result[0] || {
    totalExpenses: 0,
    totalAmount: 0,
    normal: 0,
    staff_salary: 0,
    clinic_rent: 0,
    medical_supplies: 0,
    equipment: 0,
    utilities: 0,
    other: 0,
    operational: 0,
    salary: 0,
    rent: 0,
    supplies: 0,
    equipmentCat: 0,
    utilitiesCat: 0,
    miscellaneous: 0,
  };

  return {
    date: startOfDay,
    totalExpenses: agg.totalExpenses,
    totalAmount: agg.totalAmount,
    byType: {
      normal: agg.normal,
      staff_salary: agg.staff_salary,
      clinic_rent: agg.clinic_rent,
      medical_supplies: agg.medical_supplies,
      equipment: agg.equipment,
      utilities: agg.utilities,
      other: agg.other,
    },
    byCategory: {
      operational: agg.operational,
      salary: agg.salary,
      rent: agg.rent,
      supplies: agg.supplies,
      equipment: agg.equipmentCat,
      utilities: agg.utilitiesCat,
      miscellaneous: agg.miscellaneous,
    },
  };
};

// Static method for monthly expense summary
DailyExpenseSchema.statics.getMonthlySummary = async function (
  year: number,
  month: number
): Promise<MonthlySummary> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const expenses = await this.find({
    date: { $gte: startDate, $lte: endDate },
  }).lean();

  const summary: MonthlySummary = {
    year,
    month,
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce(
      (sum: number, expense: IDailyExpense) => sum + expense.amount,
      0
    ),
    dailyBreakdown: {},
  };

  // Calculate daily breakdown using aggregation for better performance
  const dailyBreakdownAgg = await this.aggregate([
    {
      $match: { date: { $gte: startDate, $lte: endDate } },
    },
    {
      $group: {
        _id: { $dayOfMonth: "$date" },
        count: { $sum: 1 },
        amount: { $sum: "$amount" },
        details: {
          $push: {
            description: "$description",
            amount: "$amount",
            type: "$expenseType",
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]).exec();

  dailyBreakdownAgg.forEach((day) => {
    summary.dailyBreakdown[day._id.toString()] = {
      count: day.count,
      amount: day.amount,
      details: day.details,
    };
  });

  return summary;
};

// Static method for expense analysis by period
DailyExpenseSchema.statics.getExpenseAnalysis = async function (
  startDate: Date,
  endDate: Date
): Promise<ExpenseAnalysis> {
  const expenses = await this.find({
    date: { $gte: startDate, $lte: endDate },
  })
    .sort({ amount: -1 })
    .limit(10)
    .lean();

  const totalAmount = expenses.reduce(
    (sum: number, expense: IDailyExpense) => sum + expense.amount,
    0
  );

  const daysDiff = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Use aggregation for category distribution
  const categoryDistributionAgg = await this.aggregate([
    {
      $match: { date: { $gte: startDate, $lte: endDate } },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        amount: { $sum: "$amount" },
      },
    },
  ]).exec();

  const analysis: ExpenseAnalysis = {
    period: { startDate, endDate },
    totalExpenses: expenses.length,
    totalAmount,
    averageDailyExpense: daysDiff > 0 ? totalAmount / daysDiff : 0,
    topExpenses: expenses.map((expense: IDailyExpense) => ({
      date: expense.date,
      description: expense.description,
      amount: expense.amount,
      type: expense.expenseType as ExpenseType,
      category: expense.category as ExpenseCategory,
    })),
    categoryDistribution: {} as ExpenseAnalysis["categoryDistribution"],
  };

  // Build category distribution from aggregation results
  const categories: ExpenseCategory[] = [
    "operational",
    "salary",
    "rent",
    "supplies",
    "equipment",
    "utilities",
    "miscellaneous",
  ];

  const aggMap = new Map<string, { count: number; amount: number }>();
  categoryDistributionAgg.forEach((cat) => {
    aggMap.set(cat._id, { count: cat.count, amount: cat.amount });
  });

  categories.forEach((category) => {
    const catData = aggMap.get(category) || { count: 0, amount: 0 };
    analysis.categoryDistribution[category] = {
      count: catData.count,
      amount: catData.amount,
      percentage: totalAmount > 0 ? (catData.amount / totalAmount) * 100 : 0,
    };
  });

  return analysis;
};

// Interface for static methods
interface IDailyExpenseModel extends Model<IDailyExpense> {
  getDailySummary(date: Date): Promise<DailySummary>;
  getMonthlySummary(year: number, month: number): Promise<MonthlySummary>;
  getExpenseAnalysis(startDate: Date, endDate: Date): Promise<ExpenseAnalysis>;
}

// Export the model, interface, and types
export const DailyExpense: IDailyExpenseModel =
  (mongoose.models.DailyExpense as IDailyExpenseModel) ||
  mongoose.model<IDailyExpense, IDailyExpenseModel>(
    "DailyExpense",
    DailyExpenseSchema
  );

export default DailyExpense;
