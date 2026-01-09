// Stock Types
export interface GlassStock {
  id: string;
  productName: string;
  glassType: string;
  thickness: number;
  color?: string;
  width: number;
  height: number;
  batchNumber: string;
  currentQuantity: number;
  originalQuantity: number;
  unitPrice: number;
  supplier: string;
  warehouseLocation?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  remainingPercentage: number;
  totalArea: string;
  totalValue: number;
}

// Order Types
export interface GlassOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  invoiceNumber: string; // This is correct
  orderType: "retail" | "wholesale" | "contract";
  items: OrderItem[];
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: "cash" | "card" | "credit";
  deliveryRequired: boolean;
  deliveryAddress?: string;
  installationRequired: boolean;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "delivered"
    | "installed"
    | "cancelled";
  issuedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  glassProduct:
    | string
    | {
        id: string;
        productName: string;
        batchNumber: string;
        glassType: string;
      };
  quantity: number;
  discount: number;
  unitPrice: number;
  cutToSize?: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

// Issuance Types
export interface GlassIssuance {
  id: string;
  issuanceNumber: string;
  stockItemId: string;
  stockItem?: {
    id: string;
    productName: string;
    batchNumber: string;
    glassType: string;
  };
  orderId: string;
  orderNumber: string;
  issuedQuantity: number;
  issuedTo: string;
  issuedBy: string;
  issuedAt: Date;
  remarks?: string;
  status: "issued" | "returned" | "damaged";
  returnDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Stats
export interface GlassDashboardStats {
  // Order stats
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  monthlyRevenue: number;

  // Stock stats
  totalStockItems: number;
  totalStockValue: number;
  totalStockArea: number;
  lowStockItems: number;

  // Issuance stats
  issuedThisMonth: number;

  // Customer stats
  totalCustomers: number;
  totalSuppliers: number;
}

// Form Schemas (using zod)
import { z } from "zod";

export const GlassStockSchema = z.object({
  productName: z.string().min(2, "Product name must be at least 2 characters"),
  glassType: z.string().min(1, "Glass type is required"),
  thickness: z.coerce
    .number()
    .min(0.1, "Thickness must be at least 0.1mm")
    .max(50, "Thickness cannot exceed 50mm"),
  color: z.string().optional(),
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
  warehouseLocation: z.string().optional(),
  description: z.string().optional(),
});

export const OrderItemSchema = z.object({
  glassProduct: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  discount: z.coerce.number().min(0).max(100).default(0),
  unitPrice: z.coerce.number().min(0, "Unit price must be at least 0"),
  cutToSize: z.boolean().default(false),
  dimensions: z
    .object({
      width: z.coerce.number().min(0.1, "Width must be at least 0.1"),
      height: z.coerce.number().min(0.1, "Height must be at least 0.1"),
    })
    .optional(),
});

export const OrderSchema = z.object({
  customerName: z
    .string()
    .min(2, "Customer name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  customerAddress: z.string().optional(),
  orderType: z.enum(["retail", "wholesale", "contract"]).default("retail"),
  items: z.array(OrderItemSchema).min(1, "At least one item is required"),
  amountPaid: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(["cash", "card", "credit"]).default("cash"),
  deliveryRequired: z.boolean().default(false),
  deliveryAddress: z.string().optional(),
  installationRequired: z.boolean().default(false),
  status: z
    .enum([
      "pending",
      "processing",
      "completed",
      "delivered",
      "installed",
      "cancelled",
    ])
    .default("pending"),
  issuedBy: z.string().min(1, "Issued by is required"),
  notes: z.string().optional(),
});

export type GlassStockFormValues = z.infer<typeof GlassStockSchema>;
export type OrderFormValues = z.infer<typeof OrderSchema>;
export type OrderItemFormValues = z.infer<typeof OrderItemSchema>;
