// lib/glass-data.ts
import dbConnect from "@/lib/dbConnect";
import {
  OpticalStock,
  OpticalOrder,
  OpticalIssue,
  OpticalCustomer,
  OpticalSupplier,
  IOpticalStock,
  IOpticalOrder,
  IOpticalIssue,
  IOpticalCustomer,
  IOpticalSupplier,
} from "@/lib/models/glass";
import {
  GlassStock,
  GlassOrder,
  GlassIssue,
  GlassCustomer,
  GlassSupplier,
  GlassDashboardStats,
} from "@/types/glass";

// Helper function to convert database model to API type
function toGlassStock(stock: IOpticalStock): GlassStock {
  return {
    id: stock._id.toString(),
    barcode: stock.barcode,
    brand: stock.brand,
    model: stock.model,
    type: stock.type,
    material: stock.material,
    sphere: stock.sphere,
    cylinder: stock.cylinder,
    axis: stock.axis,
    diameter: stock.diameter,
    color: stock.color,
    stockQuantity: stock.stockQuantity,
    minStockLevel: stock.minStockLevel,
    costPrice: stock.costPrice,
    sellingPrice: stock.sellingPrice,
    supplierId: stock.supplierId,
    createdAt: stock.createdAt,
    updatedAt: stock.updatedAt,
  };
}

function toGlassOrder(order: IOpticalOrder): GlassOrder {
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    type: order.type,
    status: order.status,
    leftLens: order.leftLens,
    rightLens: order.rightLens,
    frame: order.frame,
    totalAmount: order.totalAmount,
    paidAmount: order.paidAmount,
    dueAmount: order.dueAmount,
    notes: order.notes,
    createdBy: order.createdBy,
    assignedTo: order.assignedTo,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    expectedDeliveryDate: order.expectedDeliveryDate,
  };
}

function toGlassIssue(issue: IOpticalIssue): GlassIssue {
  return {
    id: issue._id.toString(),
    issueNumber: issue.issueNumber,
    orderId: issue.orderId,
    customerId: issue.customerId,
    customerName: issue.customerName,
    customerPhone: issue.customerPhone,
    type: issue.type,
    priority: issue.priority,
    status: issue.status,
    description: issue.description,
    resolution: issue.resolution,
    assignedTo: issue.assignedTo,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    resolvedAt: issue.resolvedAt,
  };
}

function toGlassCustomer(customer: IOpticalCustomer): GlassCustomer {
  return {
    id: customer._id.toString(),
    customerNumber: customer.customerNumber,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    prescriptionHistory: customer.prescriptionHistory.map((ph) => ({
      id: ph._id.toString(),
      date: ph.date,
      rightEye: ph.rightEye,
      leftEye: ph.leftEye,
      pd: ph.pd,
      doctorName: ph.doctorName,
      clinicName: ph.clinicName,
    })),
    totalOrders: customer.totalOrders,
    totalSpent: customer.totalSpent,
    notes: customer.notes,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

function toGlassSupplier(supplier: IOpticalSupplier): GlassSupplier {
  return {
    id: supplier._id.toString(),
    supplierCode: supplier.supplierCode,
    name: supplier.name,
    contactPerson: supplier.contactPerson,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    city: supplier.city,
    products: supplier.products,
    totalOrders: supplier.totalOrders,
    totalSpent: supplier.totalSpent,
    paymentTerms: supplier.paymentTerms,
    status: supplier.status,
    notes: supplier.notes,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  };
}

// Database operations for Glass Stock
export async function getGlassStock(): Promise<GlassStock[]> {
  await dbConnect();
  const stock = await OpticalStock.find().sort({ createdAt: -1 });
  return stock.map(toGlassStock);
}

export async function addGlassStock(
  data: Partial<GlassStock>
): Promise<GlassStock> {
  await dbConnect();
  const stock = new OpticalStock({
    barcode: data.barcode || `GLS-${Date.now()}`,
    brand: data.brand,
    model: data.model,
    type: data.type,
    material: data.material,
    sphere: data.sphere,
    cylinder: data.cylinder,
    axis: data.axis,
    diameter: data.diameter,
    color: data.color,
    stockQuantity: data.stockQuantity,
    minStockLevel: data.minStockLevel,
    costPrice: data.costPrice,
    sellingPrice: data.sellingPrice,
    supplierId: data.supplierId,
  });
  await stock.save();
  return toGlassStock(stock);
}

export async function updateGlassStock(
  id: string,
  updates: Partial<GlassStock>
): Promise<GlassStock | null> {
  await dbConnect();
  const stock = await OpticalStock.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );
  return stock ? toGlassStock(stock) : null;
}

export async function deleteGlassStock(id: string): Promise<boolean> {
  await dbConnect();
  const result = await OpticalStock.findByIdAndDelete(id);
  return !!result;
}

export async function getLowStockItems(): Promise<GlassStock[]> {
  await dbConnect();
  const stock = await OpticalStock.findLowStock();
  return stock.map(toGlassStock);
}

// Database operations for Glass Orders
export async function getGlassOrders(): Promise<GlassOrder[]> {
  await dbConnect();
  const orders = await OpticalOrder.find().sort({ createdAt: -1 });
  return orders.map(toGlassOrder);
}

export async function addGlassOrder(
  data: Partial<GlassOrder>
): Promise<GlassOrder> {
  await dbConnect();
  const order = new OpticalOrder({
    orderNumber: await OpticalOrder.generateOrderNumber(),
    customerId: data.customerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    type: data.type,
    status: data.status || "pending",
    leftLens: data.leftLens,
    rightLens: data.rightLens,
    frame: data.frame,
    totalAmount: data.totalAmount,
    paidAmount: data.paidAmount || 0,
    dueAmount: data.dueAmount || data.totalAmount - (data.paidAmount || 0),
    notes: data.notes || "",
    createdBy: data.createdBy,
    assignedTo: data.assignedTo,
    expectedDeliveryDate: data.expectedDeliveryDate,
  });
  await order.save();
  return toGlassOrder(order);
}

export async function updateGlassOrder(
  id: string,
  updates: Partial<GlassOrder>
): Promise<GlassOrder | null> {
  await dbConnect();
  const order = await OpticalOrder.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );
  return order ? toGlassOrder(order) : null;
}

export async function deleteGlassOrder(id: string): Promise<boolean> {
  await dbConnect();
  const result = await OpticalOrder.findByIdAndDelete(id);
  return !!result;
}

export async function getPendingOrders(): Promise<GlassOrder[]> {
  await dbConnect();
  const orders = await OpticalOrder.findPendingOrders();
  return orders.map(toGlassOrder);
}

// Database operations for Glass Issues
export async function getGlassIssues(): Promise<GlassIssue[]> {
  await dbConnect();
  const issues = await OpticalIssue.find().sort({ createdAt: -1 });
  return issues.map(toGlassIssue);
}

export async function addGlassIssue(
  data: Partial<GlassIssue>
): Promise<GlassIssue> {
  await dbConnect();
  const issue = new OpticalIssue({
    issueNumber: await OpticalIssue.generateIssueNumber(),
    orderId: data.orderId,
    customerId: data.customerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    type: data.type,
    priority: data.priority,
    status: data.status || "open",
    description: data.description,
    resolution: data.resolution,
    assignedTo: data.assignedTo,
    resolvedAt: data.resolvedAt,
  });
  await issue.save();
  return toGlassIssue(issue);
}

export async function updateGlassIssue(
  id: string,
  updates: Partial<GlassIssue>
): Promise<GlassIssue | null> {
  await dbConnect();
  const issue = await OpticalIssue.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );
  return issue ? toGlassIssue(issue) : null;
}

export async function deleteGlassIssue(id: string): Promise<boolean> {
  await dbConnect();
  const result = await OpticalIssue.findByIdAndDelete(id);
  return !!result;
}

export async function getOpenIssues(): Promise<GlassIssue[]> {
  await dbConnect();
  const issues = await OpticalIssue.findOpenIssues();
  return issues.map(toGlassIssue);
}

// Database operations for Glass Customers
export async function getGlassCustomers(): Promise<GlassCustomer[]> {
  await dbConnect();
  const customers = await OpticalCustomer.find().sort({ createdAt: -1 });
  return customers.map(toGlassCustomer);
}

export async function addGlassCustomer(
  data: Partial<GlassCustomer>
): Promise<GlassCustomer> {
  await dbConnect();
  const customer = new OpticalCustomer({
    customerNumber: await OpticalCustomer.generateCustomerNumber(),
    name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    prescriptionHistory: data.prescriptionHistory || [],
    totalOrders: 0,
    totalSpent: 0,
    notes: data.notes,
  });
  await customer.save();
  return toGlassCustomer(customer);
}

export async function updateGlassCustomer(
  id: string,
  updates: Partial<GlassCustomer>
): Promise<GlassCustomer | null> {
  await dbConnect();
  const customer = await OpticalCustomer.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );
  return customer ? toGlassCustomer(customer) : null;
}

export async function deleteGlassCustomer(id: string): Promise<boolean> {
  await dbConnect();
  const result = await OpticalCustomer.findByIdAndDelete(id);
  return !!result;
}

// Database operations for Glass Suppliers
export async function getGlassSuppliers(): Promise<GlassSupplier[]> {
  await dbConnect();
  const suppliers = await OpticalSupplier.find().sort({ createdAt: -1 });
  return suppliers.map(toGlassSupplier);
}

export async function addGlassSupplier(
  data: Partial<GlassSupplier>
): Promise<GlassSupplier> {
  await dbConnect();
  const supplier = new OpticalSupplier({
    supplierCode: await OpticalSupplier.generateSupplierCode(),
    name: data.name,
    contactPerson: data.contactPerson,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    products: data.products || [],
    totalOrders: 0,
    totalSpent: 0,
    paymentTerms: data.paymentTerms,
    status: data.status || "active",
    notes: data.notes,
  });
  await supplier.save();
  return toGlassSupplier(supplier);
}

export async function updateGlassSupplier(
  id: string,
  updates: Partial<GlassSupplier>
): Promise<GlassSupplier | null> {
  await dbConnect();
  const supplier = await OpticalSupplier.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );
  return supplier ? toGlassSupplier(supplier) : null;
}

export async function deleteGlassSupplier(id: string): Promise<boolean> {
  await dbConnect();
  const result = await OpticalSupplier.findByIdAndDelete(id);
  return !!result;
}

// Dashboard stats
export async function getGlassDashboardStats(): Promise<GlassDashboardStats> {
  await dbConnect();

  const [stock, orders, customers, suppliers, lowStock, openIssues] =
    await Promise.all([
      OpticalStock.find(),
      OpticalOrder.find(),
      OpticalCustomer.find(),
      OpticalSupplier.find(),
      OpticalStock.findLowStock(),
      OpticalIssue.findOpenIssues(),
    ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt) >= today
  ).length;

  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;

  const monthlyRevenue = orders
    .filter((o) => {
      const orderDate = new Date(o.createdAt);
      return (
        orderDate.getMonth() === thisMonth &&
        orderDate.getFullYear() === thisYear
      );
    })
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    totalStock: stock.reduce((sum, s) => sum + s.stockQuantity, 0),
    lowStockItems: lowStock.length,
    totalOrders: orders.length,
    pendingOrders,
    todayOrders,
    monthlyRevenue,
    monthlyExpenses: 0, // TODO: Calculate from expenses if needed
    customerCount: customers.length,
    supplierCount: suppliers.length,
  };
}
