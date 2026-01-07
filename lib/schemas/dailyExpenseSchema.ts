// lib/schemas/dailyExpenseSchema.ts
import { z } from "zod";

export const ExpenseTypeEnum = [
  "normal",
  "staff_salary",
  "clinic_rent",
  "medical_supplies",
  "equipment",
  "utilities",
  "other",
] as const;
export type ExpenseType = (typeof ExpenseTypeEnum)[number];

export const ExpenseCategoryEnum = [
  "operational",
  "salary",
  "rent",
  "supplies",
  "equipment",
  "utilities",
  "miscellaneous",
] as const;
export type ExpenseCategory = (typeof ExpenseCategoryEnum)[number];

export const DailyExpenseSchema = z.object({
  date: z.coerce.date().default(new Date()),
  description: z.string().min(3, "Description must be at least 3 characters"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  expenseType: z.enum(ExpenseTypeEnum).default("normal"),
  category: z.enum(ExpenseCategoryEnum).default("operational"),
  receiptNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type DailyExpenseFormValues = z.infer<typeof DailyExpenseSchema>;
