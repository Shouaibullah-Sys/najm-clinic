// types/glass.ts

// Glass Stock Types
export type GlassType =
  | "single-vision"
  | "bifocal"
  | "progressive"
  | "photochromic"
  | "anti-reflective"
  | "blue-light"
  | "tinted"
  | "polarized";

export type GlassMaterial =
  | "cr-39"
  | "polycarbonate"
  | "high-index-1.67"
  | "high-index-1.74"
  | "glass"
  | "trivex";

export type GlassSphere =
  | "-6.00"
  | "-5.50"
  | "-5.00"
  | "-4.50"
  | "-4.00"
  | "-3.50"
  | "-3.00"
  | "-2.75"
  | "-2.50"
  | "-2.25"
  | "-2.00"
  | "-1.75"
  | "-1.50"
  | "-1.25"
  | "-1.00"
  | "-0.75"
  | "-0.50"
  | "-0.25"
  | "0.00"
  | "+0.25"
  | "+0.50"
  | "+0.75"
  | "+1.00"
  | "+1.25"
  | "+1.50"
  | "+1.75"
  | "+2.00"
  | "+2.25"
  | "+2.50"
  | "+2.75"
  | "+3.00"
  | "+3.50"
  | "+4.00"
  | "+4.50"
  | "+5.00"
  | "+5.50"
  | "+6.00";

export type GlassCylinder =
  | "-2.00"
  | "-1.75"
  | "-1.50"
  | "-1.25"
  | "-1.00"
  | "-0.75"
  | "-0.50"
  | "-0.25"
  | "0.00"
  | "+0.25"
  | "+0.50"
  | "+0.75"
  | "+1.00"
  | "+1.25"
  | "+1.50"
  | "+1.75"
  | "+2.00";

export type GlassAxis = number; // 0-180

export type GlassDiameter = 50 | 55 | 60 | 65 | 70 | 75 | 80;

export type GlassColor =
  | "clear"
  | "white"
  | "brown"
  | "grey"
  | "green"
  | "blue"
  | "pink"
  | "purple";

export interface GlassStock {
  id: string;
  barcode: string;
  brand: string;
  model: string;
  type: GlassType;
  material: GlassMaterial;
  sphere: GlassSphere;
  cylinder: GlassCylinder;
  axis: GlassAxis;
  diameter: GlassDiameter;
  color: GlassColor;
  stockQuantity: number;
  minStockLevel: number;
  costPrice: number;
  sellingPrice: number;
  supplierId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready"
  | "delivered"
  | "cancelled";

export type OrderType = "new" | "repeat" | "repair" | "adjustment";

export interface GlassOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: OrderType;
  status: OrderStatus;
  leftLens: {
    sphere: GlassSphere;
    cylinder: GlassCylinder;
    axis: GlassAxis;
    diameter: GlassDiameter;
    type: GlassType;
    material: GlassMaterial;
    color: GlassColor;
  };
  rightLens: {
    sphere: GlassSphere;
    cylinder: GlassCylinder;
    axis: GlassAxis;
    diameter: GlassDiameter;
    type: GlassType;
    material: GlassMaterial;
    color: GlassColor;
  };
  frame: {
    brand: string;
    model: string;
    color: string;
    size: string;
  };
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  notes: string;
  createdBy: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  expectedDeliveryDate: Date;
}

// Glass Issue Types
export type IssueType =
  | "scratch"
  | "breakage"
  | "wrong-prescription"
  | "frame-damage"
  | "lens-popping"
  | "other";

export type IssuePriority = "low" | "medium" | "high" | "urgent";

export type IssueStatus = "open" | "in-progress" | "resolved" | "closed";

export interface GlassIssue {
  id: string;
  issueNumber: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  description: string;
  resolution?: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// Customer Types
export interface GlassCustomer {
  id: string;
  customerNumber: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  prescriptionHistory: PrescriptionRecord[];
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriptionRecord {
  id: string;
  date: Date;
  rightEye: {
    sphere: GlassSphere;
    cylinder: GlassCylinder;
    axis: GlassAxis;
  };
  leftEye: {
    sphere: GlassSphere;
    cylinder: GlassCylinder;
    axis: GlassAxis;
  };
  pd: number;
  doctorName?: string;
  clinicName?: string;
}

// Supplier Types
export type SupplierStatus = "active" | "inactive" | "suspended";

export interface GlassSupplier {
  id: string;
  supplierCode: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  products: string[];
  totalOrders: number;
  totalSpent: number;
  paymentTerms: string;
  status: SupplierStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Stats Types
export interface GlassDashboardStats {
  totalStock: number;
  lowStockItems: number;
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  customerCount: number;
  supplierCount: number;
}

// Filter Types
export interface GlassStockFilter {
  type?: GlassType;
  material?: GlassMaterial;
  sphere?: GlassSphere;
  cylinder?: GlassCylinder;
  brand?: string;
  minStock?: number;
  maxStock?: number;
}

export interface OrderFilter {
  status?: OrderStatus;
  type?: OrderType;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IssueFilter {
  status?: IssueStatus;
  type?: IssueType;
  priority?: IssuePriority;
}
