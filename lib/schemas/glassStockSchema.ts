// lib/schemas/glassStockSchema.ts
import { z } from "zod";

export const GlassStockSchema = z.object({
  productName: z.string().min(2, "Product name must be at least 2 characters"),
  glassType: z.string().min(1, "Glass type is required"),
  thickness: z.coerce
    .number()
    .min(0.1, "Thickness must be at least 0.1mm")
    .max(50, "Thickness cannot exceed 50mm"),
  color: z.string().optional().nullable(),
  width: z.coerce
    .number()
    .min(1, "Width must be at least 1cm")
    .max(1000, "Width cannot exceed 1000cm"),
  height: z.coerce
    .number()
    .min(1, "Height must be at least 1cm")
    .max(1000, "Height cannot exceed 1000cm"),
  batchNumber: z.string().min(1, "Batch number is required"),
  currentQuantity: z.coerce.number().min(0, "Quantity must be at least 0"),
  originalQuantity: z.coerce
    .number()
    .min(0, "Original quantity must be at least 0"),
  unitPrice: z.coerce.number().min(0, "Unit price must be at least 0"),
  supplier: z.string().min(2, "Supplier must be at least 2 characters"),
  warehouseLocation: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type GlassStockFormValues = z.infer<typeof GlassStockSchema>;
