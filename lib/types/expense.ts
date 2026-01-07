// lib/types/expense.ts

export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "supplies"
  | "maintenance"
  | "salary"
  | "marketing"
  | "travel"
  | "equipment"
  | "insurance"
  | "tax"
  | "software"
  | "professional_fees"
  | "office"
  | "medical"
  | "glass_supplies"
  | "other";

export type ExpenseSubcategory = {
  rent: ["office_rent", "warehouse_rent", "clinic_rent"];
  utilities: ["electricity", "water", "internet", "phone", "gas"];
  supplies: [
    "office_supplies",
    "medical_supplies",
    "cleaning_supplies",
    "glass_materials"
  ];
  maintenance: [
    "equipment_repair",
    "building_maintenance",
    "vehicle_maintenance"
  ];
  salary: ["staff_salary", "doctor_salary", "admin_salary", "bonus"];
  marketing: ["advertising", "promotions", "website", "brochures"];
  travel: ["transportation", "accommodation", "meals", "fuel"];
  equipment: ["medical_equipment", "office_equipment", "tools", "computers"];
  insurance: ["health_insurance", "property_insurance", "liability_insurance"];
  tax: ["income_tax", "property_tax", "sales_tax"];
  software: ["subscription", "license", "maintenance"];
  professional_fees: ["legal", "accounting", "consulting"];
  office: ["stationery", "printing", "postage", "refreshments"];
  medical: ["medicines", "instruments", "disposables"];
  glass_supplies: ["glass_sheets", "frames", "tools", "chemicals"];
  other: ["miscellaneous", "donations", "gifts"];
}[ExpenseCategory][number];

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "credit_card"
  | "check"
  | "mobile_payment";
export type ExpenseStatus = "pending" | "approved" | "rejected" | "paid";

export interface ExpenseSummary {
  total: number;
  byCategory: Record<ExpenseCategory, number>;
  byMonth: Record<string, number>;
  byPaymentMethod: Record<PaymentMethod, number>;
}

export interface MonthlyExpenseReport {
  year: number;
  month: number;
  totalExpenses: number;
  averageExpense: number;
  categoryBreakdown: Record<
    ExpenseCategory,
    { count: number; amount: number; percentage: number }
  >;
  topExpenses: any[];
  comparison: {
    previousMonth: number;
    percentageChange: number;
  };
}
