// lib/utils/expense.ts

import {
  ExpenseCategory,
  ExpenseSubcategory,
  PaymentMethod,
  ExpenseStatus,
} from "@/lib/types/expense";

export function getCategoryLabel(category: ExpenseCategory): string {
  const categories: Record<ExpenseCategory, string> = {
    rent: "Rent",
    utilities: "Utilities",
    supplies: "Supplies",
    maintenance: "Maintenance",
    salary: "Salary",
    marketing: "Marketing",
    travel: "Travel",
    equipment: "Equipment",
    insurance: "Insurance",
    tax: "Tax",
    software: "Software",
    professional_fees: "Professional Fees",
    office: "Office",
    medical: "Medical",
    glass_supplies: "Glass Supplies",
    other: "Other",
  };
  return categories[category] || category;
}

export function getSubcategoryLabel(
  category: ExpenseCategory,
  subcategory: string
): string {
  const subcategories: Record<string, string> = {
    // Rent
    office_rent: "Office Rent",
    warehouse_rent: "Warehouse Rent",
    clinic_rent: "Clinic Rent",

    // Utilities
    electricity: "Electricity",
    water: "Water",
    internet: "Internet",
    phone: "Phone",
    gas: "Gas",

    // Supplies
    office_supplies: "Office Supplies",
    medical_supplies: "Medical Supplies",
    cleaning_supplies: "Cleaning Supplies",
    glass_materials: "Glass Materials",

    // Add more as needed...
  };

  return subcategories[subcategory] || subcategory;
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  const methods: Record<PaymentMethod, string> = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    credit_card: "Credit Card",
    check: "Check",
    mobile_payment: "Mobile Payment",
  };
  return methods[method] || method;
}

export function getStatusLabel(status: ExpenseStatus): string {
  const statuses: Record<ExpenseStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    paid: "Paid",
  };
  return statuses[status] || status;
}

export function formatCurrency(
  amount: number,
  currency: string = "AFN"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
