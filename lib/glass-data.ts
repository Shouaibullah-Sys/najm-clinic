// lib/glass-data.ts
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { GlassStock as GlassStockModel } from "@/lib/models/GlassStock";
import { Order } from "@/lib/models/Order";
import { IGlassStock, IOrder } from "@/lib/models";
import { GlassOrder, GlassStock } from "@/types/glass";

// Helper function to convert database model to API type
function toGlassStockItem(stock: IGlassStock): GlassStock {
  return {
    id: stock._id.toString(),
    productName: stock.productName,
    glassType: stock.glassType,
    thickness: stock.thickness,
    color: stock.color,
    width: stock.width,
    height: stock.height,
    batchNumber: stock.batchNumber,
    currentQuantity: stock.currentQuantity,
    originalQuantity: stock.originalQuantity,
    unitPrice: stock.unitPrice,
    supplier: stock.supplier,
    warehouseLocation: stock.warehouseLocation,
    description: stock.description,
    createdAt: stock.createdAt,
    updatedAt: stock.updatedAt,
    remainingPercentage: (stock.currentQuantity / stock.originalQuantity) * 100,
    totalArea: (
      (stock.width / 100) *
      (stock.height / 100) *
      stock.currentQuantity
    ).toFixed(2),
    totalValue: stock.currentQuantity * stock.unitPrice,
  };
}

function toGlassOrder(order: IOrder): GlassOrder {
  return {
    id: order._id.toString(),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    invoiceNumber: order.invoiceNumber,
    orderType: order.orderType,
    items: order.items.map((item) => ({
      glassProduct: item.glassProduct.toString(),
      quantity: item.quantity,
      discount: item.discount,
      unitPrice: item.unitPrice,
      cutToSize: item.cutToSize,
      dimensions: item.dimensions,
    })),
    totalAmount: order.totalAmount,
    amountPaid: order.amountPaid,
    balanceDue: order.balanceDue,
    paymentMethod: order.paymentMethod,
    deliveryRequired: order.deliveryRequired,
    deliveryAddress: order.deliveryAddress,
    installationRequired: order.installationRequired,
    status: order.status,
    issuedBy:
      typeof order.issuedBy === "string"
        ? order.issuedBy
        : order.issuedBy.toString(),
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

// Database operations for Glass Stock
export async function getGlassStock(): Promise<GlassStock[]> {
  await dbConnect();
  const stock = await GlassStockModel.find().sort({ createdAt: -1 });
  return stock.map(toGlassStockItem);
}

export async function getGlassStockById(
  id: string
): Promise<GlassStock | null> {
  await dbConnect();
  const item = await GlassStockModel.findById(id);
  return item ? toGlassStockItem(item) : null;
}

export async function addGlassStockItem(
  data: Partial<GlassStock>
): Promise<GlassStock> {
  await dbConnect();

  // Validate required fields
  if (
    !data.productName ||
    !data.glassType ||
    !data.thickness ||
    !data.width ||
    !data.height ||
    !data.batchNumber ||
    !data.currentQuantity ||
    !data.originalQuantity ||
    !data.unitPrice ||
    !data.supplier
  ) {
    throw new Error("Missing required fields for glass stock item");
  }

  const item = new GlassStockModel({
    productName: data.productName,
    glassType: data.glassType,
    thickness: data.thickness,
    color: data.color,
    width: data.width,
    height: data.height,
    batchNumber: data.batchNumber,
    currentQuantity: data.currentQuantity,
    originalQuantity: data.originalQuantity,
    unitPrice: data.unitPrice,
    supplier: data.supplier,
    warehouseLocation: data.warehouseLocation,
    description: data.description,
  });

  await item.save();
  return toGlassStockItem(item);
}

export async function updateGlassStockItem(
  id: string,
  data: Partial<GlassStock>
): Promise<GlassStock | null> {
  await dbConnect();
  const item = await GlassStockModel.findByIdAndUpdate(id, data, { new: true });
  return item ? toGlassStockItem(item) : null;
}

export async function deleteGlassStockItem(id: string): Promise<boolean> {
  await dbConnect();
  const result = await GlassStockModel.findByIdAndDelete(id);
  return !!result;
}

// Database operations for Orders
export async function getGlassOrders(): Promise<GlassOrder[]> {
  await dbConnect();
  const orders = await Order.find()
    .populate("issuedBy")
    .sort({ createdAt: -1 });
  return orders.map(toGlassOrder);
}

export async function getGlassOrderById(
  id: string
): Promise<GlassOrder | null> {
  await dbConnect();
  const order = await Order.findById(id).populate("issuedBy");
  return order ? toGlassOrder(order) : null;
}

export async function addGlassOrder(
  data: Partial<GlassOrder>
): Promise<GlassOrder> {
  await dbConnect();

  // Validate required fields
  if (
    !data.customerName ||
    !data.customerPhone ||
    !data.items ||
    !data.issuedBy
  ) {
    throw new Error(
      "Missing required fields: customerName, customerPhone, items, or issuedBy"
    );
  }

  // Validate items
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("Order must have at least one item");
  }

  // Validate issuedBy is a valid ObjectId
  let issuedBy;
  try {
    if (mongoose.Types.ObjectId.isValid(data.issuedBy)) {
      issuedBy = new mongoose.Types.ObjectId(data.issuedBy);
    } else {
      throw new Error("Invalid user ID format for issuedBy");
    }
  } catch (error) {
    throw new Error("Invalid user ID format for issuedBy");
  }

  const order = new Order({
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerAddress: data.customerAddress,
    orderType: data.orderType || "retail",
    items: data.items.map((item) => ({
      glassProduct: new mongoose.Types.ObjectId(item.glassProduct as string),
      quantity: item.quantity,
      discount: item.discount || 0,
      unitPrice: item.unitPrice,
      cutToSize: item.cutToSize || false,
      dimensions: item.dimensions,
    })),
    totalAmount: data.totalAmount || 0,
    amountPaid: data.amountPaid || 0,
    balanceDue: data.balanceDue || 0,
    paymentMethod: data.paymentMethod || "cash",
    deliveryRequired: data.deliveryRequired || false,
    deliveryAddress: data.deliveryAddress,
    installationRequired: data.installationRequired || false,
    status: data.status || "pending",
    issuedBy: issuedBy.toString(), // Convert to string for API compatibility
    notes: data.notes,
    // invoiceNumber will be auto-generated by the pre-save hook
  });

  await order.save();

  // Populate before returning
  const populatedOrder = await Order.findById(order._id).populate(
    "items.glassProduct",
    "productName batchNumber glassType"
  );

  return toGlassOrder(populatedOrder as IOrder);
}

export async function updateGlassOrder(
  id: string,
  data: Partial<GlassOrder>
): Promise<GlassOrder | null> {
  await dbConnect();

  // Don't allow updating invoice number
  if (data.invoiceNumber) {
    delete data.invoiceNumber;
  }

  // Handle issuedBy field if provided
  let updateData = { ...data };
  if (data.issuedBy) {
    try {
      if (mongoose.Types.ObjectId.isValid(data.issuedBy)) {
        updateData.issuedBy = data.issuedBy.toString(); // Convert to string for API compatibility
      } else {
        throw new Error("Invalid user ID format for issuedBy");
      }
    } catch (error) {
      throw new Error("Invalid user ID format for issuedBy");
    }
  }

  const order = await Order.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("items.glassProduct", "productName batchNumber glassType");
  return order ? toGlassOrder(order as IOrder) : null;
}

export async function deleteGlassOrder(id: string): Promise<boolean> {
  await dbConnect();
  const result = await Order.findByIdAndDelete(id);
  return !!result;
}

// Database operations for Glass Customers
export async function getGlassCustomers(): Promise<
  {
    id: string;
    name: string;
    phone: string;
    address: string;
    createdAt: Date;
  }[]
> {
  await dbConnect();
  // Get unique customers from orders
  const orders = await Order.aggregate([
    {
      $group: {
        _id: "$customerPhone",
        name: { $first: "$customerName" },
        phone: { $first: "$customerPhone" },
        address: { $first: "$customerAddress" },
        createdAt: { $first: "$createdAt" },
      },
    },
  ]);

  return orders.map((customer, index) => ({
    id: customer._id,
    name: customer.name,
    phone: customer.phone,
    address: customer.address || "",
    createdAt: customer.createdAt,
  }));
}

export async function addGlassCustomer(data: {
  name: string;
  phone: string;
  address?: string;
}): Promise<{
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
}> {
  // This is a simplified implementation
  // In a real app, you'd want a separate Customer model
  return {
    id: data.phone,
    name: data.name,
    phone: data.phone,
    address: data.address || "",
    createdAt: new Date(),
  };
}

export async function updateGlassCustomer(
  id: string,
  data: { name?: string; phone?: string; address?: string }
): Promise<{
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
} | null> {
  // This is a simplified implementation
  return {
    id,
    name: data.name || "",
    phone: data.phone || id,
    address: data.address || "",
    createdAt: new Date(),
  };
}

export async function deleteGlassCustomer(id: string): Promise<boolean> {
  // This is a simplified implementation
  return true;
}
