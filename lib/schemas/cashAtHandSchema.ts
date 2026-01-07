// lib/schemas/cashAtHandSchema.ts
import { z } from "zod";

export const CashAtHandTypeEnum = ["opening", "closing", "adjustment"] as const;
export type CashAtHandType = (typeof CashAtHandTypeEnum)[number];

export const CashAtHandSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be positive"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  type: z.enum(CashAtHandTypeEnum),
  date: z.coerce.date().default(new Date()),
});

export type CashAtHandFormValues = z.infer<typeof CashAtHandSchema>;
