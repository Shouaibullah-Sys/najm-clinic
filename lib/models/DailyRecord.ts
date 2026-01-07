// lib/models/DailyRecord.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IDailyRecord extends Document {
  date: Date;
  recordType: "consultation" | "operation" | "other";
  patientName: string;
  description: string;
  amount: number;
  paymentMethod: "cash" | "card" | "insurance";
  status: "paid" | "pending" | "cancelled";
  recordedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDailySummary {
  date: Date;
  totalRecords: number;
  totalAmount: number;
  consultationCount: number;
  operationCount: number;
  otherCount: number;
  cashAmount: number;
  cardAmount: number;
  insuranceAmount: number;
  paidCount: number;
  pendingCount: number;
}

export interface IMonthlySummary {
  year: number;
  month: number;
  totalRecords: number;
  totalAmount: number;
  consultationAmount: number;
  operationAmount: number;
  otherAmount: number;
  dailyAverages: Record<string, { count: number; amount: number }>;
}

const DailyRecordSchema = new Schema<IDailyRecord>(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    recordType: {
      type: String,
      required: true,
      enum: ["consultation", "operation", "other"],
      default: "consultation",
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
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
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "card", "insurance"],
      default: "cash",
    },
    status: {
      type: String,
      required: true,
      enum: ["paid", "pending", "cancelled"],
      default: "paid",
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
DailyRecordSchema.index({ date: -1 });
DailyRecordSchema.index({ recordType: 1, date: -1 });
DailyRecordSchema.index({ recordedBy: 1, date: -1 });
DailyRecordSchema.index({ patientName: "text", description: "text" });

// Virtual field for day's date (without time)
DailyRecordSchema.virtual("dayDate").get(function () {
  const date = new Date(this.date);
  date.setHours(0, 0, 0, 0);
  return date;
});

// Pre-save hook to format patient name
DailyRecordSchema.pre("save", function (next) {
  if (this.patientName) {
    this.patientName = this.patientName
      .split(" ")
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  }
  next();
});

// Static method for daily summary
DailyRecordSchema.statics.getDailySummary = async function (
  date: Date
): Promise<IDailySummary> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const records = await this.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: "cancelled" },
  });

  const summary: IDailySummary = {
    date: startOfDay,
    totalRecords: records.length,
    totalAmount: records.reduce(
      (sum: number, record: IDailyRecord) => sum + record.amount,
      0
    ),
    consultationCount: records.filter(
      (r: IDailyRecord) => r.recordType === "consultation"
    ).length,
    operationCount: records.filter(
      (r: IDailyRecord) => r.recordType === "operation"
    ).length,
    otherCount: records.filter((r: IDailyRecord) => r.recordType === "other")
      .length,
    cashAmount: records
      .filter((r: IDailyRecord) => r.paymentMethod === "cash")
      .reduce((sum: number, r: IDailyRecord) => sum + r.amount, 0),
    cardAmount: records
      .filter((r: IDailyRecord) => r.paymentMethod === "card")
      .reduce((sum: number, r: IDailyRecord) => sum + r.amount, 0),
    insuranceAmount: records
      .filter((r: IDailyRecord) => r.paymentMethod === "insurance")
      .reduce((sum: number, r: IDailyRecord) => sum + r.amount, 0),
    paidCount: records.filter((r: IDailyRecord) => r.status === "paid").length,
    pendingCount: records.filter((r: IDailyRecord) => r.status === "pending")
      .length,
  };

  return summary;
};

// Static method for monthly summary
DailyRecordSchema.statics.getMonthlySummary = async function (
  year: number,
  month: number
): Promise<IMonthlySummary> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const records = await this.find({
    date: { $gte: startDate, $lte: endDate },
    status: { $ne: "cancelled" },
  });

  const summary: IMonthlySummary = {
    year,
    month,
    totalRecords: records.length,
    totalAmount: records.reduce(
      (sum: number, record: IDailyRecord) => sum + record.amount,
      0
    ),
    consultationAmount: records
      .filter((r: IDailyRecord) => r.recordType === "consultation")
      .reduce((sum: number, r: IDailyRecord) => sum + r.amount, 0),
    operationAmount: records
      .filter((r: IDailyRecord) => r.recordType === "operation")
      .reduce((sum: number, r: IDailyRecord) => sum + r.amount, 0),
    otherAmount: records
      .filter((r: IDailyRecord) => r.recordType === "other")
      .reduce((sum: number, r: IDailyRecord) => sum + r.amount, 0),
    dailyAverages: {},
  };

  // Calculate daily averages
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayRecords = records.filter(
      (r: IDailyRecord) =>
        r.date.getDate() === day && r.date.getMonth() === month - 1
    );
    if (dayRecords.length > 0) {
      summary.dailyAverages[day] = {
        count: dayRecords.length,
        amount: dayRecords.reduce(
          (sum: number, r: IDailyRecord) => sum + r.amount,
          0
        ),
      };
    }
  }

  return summary;
};

// Export the model and interface
export const DailyRecord: Model<IDailyRecord> =
  mongoose.models.DailyRecord ||
  mongoose.model<IDailyRecord>("DailyRecord", DailyRecordSchema);
