// lib/schemas/glassIssueSchema.ts
import { z } from "zod";

export const GlassIssueSchema = z.object({
  glassProductId: z.string().min(1, "Glass product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  issueDate: z.coerce.date().default(new Date()),
  issuedTo: z.string().min(1, "Issued to is required"),
  issuedBy: z.string().min(1, "Issued by is required"),
  orderId: z.string().optional().nullable(),
  projectName: z.string().optional().nullable(),
});

export type GlassIssueFormValues = z.infer<typeof GlassIssueSchema>;
