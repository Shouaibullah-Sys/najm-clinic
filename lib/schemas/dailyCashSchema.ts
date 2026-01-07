// lib/schemas/dailyCashSchema.ts
import { z } from "zod";

export const DailyCashSchema = z.object({
  date: z.coerce.date(),
  openingBalance: z.coerce.number().min(0, "Opening balance must be positive"),
  closingBalance: z.coerce.number().min(0, "Closing balance must be positive"),
  cashSales: z.coerce.number().min(0, "Cash sales must be positive").default(0),
  cardSales: z.coerce.number().min(0, "Card sales must be positive").default(0),
  creditSales: z.coerce
    .number()
    .min(0, "Credit sales must be positive")
    .default(0),
  expenses: z.coerce.number().min(0, "Expenses must be positive").default(0),
  discrepancy: z.coerce.number().default(0),
  notes: z.string().optional().nullable(),
});

export type DailyCashFormValues = z.infer<typeof DailyCashSchema>;
