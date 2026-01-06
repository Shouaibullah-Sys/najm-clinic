//lib/validation.ts

import { z } from "zod";

// User validation schemas
export const userCreateSchema = z.object({
  email: z.email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["admin", "staff"]),
});

export const userUpdateSchema = userCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Sale validation schemas
export const saleCreateSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  paymentMethod: z.enum(["cash", "card", "transfer"]),
  date: z.date().optional(),
});

export const saleUpdateSchema = saleCreateSchema.partial();

// Cash at hand validation schemas
export const cashCreateSchema = z.object({
  amount: z.number(),
  description: z.string().min(3, "Description must be at least 3 characters"),
  type: z.enum(["opening", "closing", "adjustment"]),
  date: z.date().optional(),
});

export const cashUpdateSchema = cashCreateSchema.partial();

// Expense validation schemas
export const expenseCreateSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  date: z.date().optional(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const expenseApprovalSchema = z
  .object({
    approved: z.boolean(),
    rejectionReason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.approved && !data.rejectionReason) {
        return false;
      }
      return true;
    },
    {
      message: "Rejection reason is required when rejecting an expense",
    }
  );

// Type exports
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type SaleCreateInput = z.infer<typeof saleCreateSchema>;
export type SaleUpdateInput = z.infer<typeof saleUpdateSchema>;
export type CashCreateInput = z.infer<typeof cashCreateSchema>;
export type CashUpdateInput = z.infer<typeof cashUpdateSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;
export type ExpenseApprovalInput = z.infer<typeof expenseApprovalSchema>;
