// lib/schemas/dailyRecordSchema.ts
import { z } from "zod";

export const RecordTypeEnum = ["consultation", "operation", "other"] as const;
export type RecordType = (typeof RecordTypeEnum)[number];

export const PaymentMethodEnum = ["cash", "card", "insurance"] as const;
export type PaymentMethod = (typeof PaymentMethodEnum)[number];

export const RecordStatusEnum = ["paid", "pending", "cancelled"] as const;
export type RecordStatus = (typeof RecordStatusEnum)[number];

export const DailyRecordSchema = z.object({
  date: z.coerce.date().default(new Date()),
  recordType: z.enum(RecordTypeEnum).default("consultation"),
  patientName: z.string().min(1, "Patient name is required"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  paymentMethod: z.enum(PaymentMethodEnum).default("cash"),
  status: z.enum(RecordStatusEnum).default("paid"),
  notes: z.string().optional().nullable(),
});

export type DailyRecordFormValues = z.infer<typeof DailyRecordSchema>;
