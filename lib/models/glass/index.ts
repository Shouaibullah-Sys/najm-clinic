// lib/models/glass/index.ts

// Re-export types for convenience
export type {
  GlassType,
  GlassMaterial,
  GlassSphere,
  GlassCylinder,
  GlassAxis,
  GlassDiameter,
  GlassColor,
  OrderStatus,
  OrderType,
  IssueType,
  IssuePriority,
  IssueStatus,
  SupplierStatus,
} from "@/types/glass";

export {
  OpticalStock,
  type IOpticalStock,
  type OpticalStockModel,
} from "./OpticalStock";

export {
  OpticalOrder,
  type IOpticalOrder,
  type OpticalOrderModel,
  type ILensPrescription,
  type IFrame,
} from "./OpticalOrder";

export {
  OpticalIssue,
  type IOpticalIssue,
  type OpticalIssueModel,
} from "./OpticalIssue";

export {
  OpticalCustomer,
  type IOpticalCustomer,
  type OpticalCustomerModel,
  type IPrescriptionRecord,
} from "./OpticalCustomer";

export {
  OpticalSupplier,
  type IOpticalSupplier,
  type OpticalSupplierModel,
} from "./OpticalSupplier";
