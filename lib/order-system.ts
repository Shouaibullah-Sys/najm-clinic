// lib/order-system.ts
import dbConnect from "@/lib/dbConnect";
import { GlassStock } from "@/lib/models/GlassStock";
import { Order, IOrder, OrderItem as IOrderItem } from "@/lib/models/Order";
import { GlassIssuance, IGlassIssuance } from "@/lib/models/GlassIssuance";
import { GlassOrder, GlassIssuance as GlassIssuanceType } from "@/types/glass";

export interface OrderData extends GlassOrder {
  // Already matches GlassOrder interface
}

export interface IssuanceData extends GlassIssuanceType {
  // Already matches GlassIssuance interface
}

function toOrderData(order: IOrder & { items: any[] }): OrderData {
  return {
    id: order._id.toString(),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    invoiceNumber: order.invoiceNumber,
    orderType: order.orderType,
    items: order.items.map((item: any) => ({
      glassProduct: item.glassProduct._id
        ? {
            id: item.glassProduct._id.toString(),
            productName: item.glassProduct.productName,
            batchNumber: item.glassProduct.batchNumber,
            glassType: item.glassProduct.glassType,
          }
        : item.glassProduct.toString(),
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
    issuedBy: order.issuedBy.toString(),
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function toIssuanceData(
  issuance: IGlassIssuance & { stockItemId?: any }
): IssuanceData {
  return {
    id: issuance._id.toString(),
    issuanceNumber: issuance.issuanceNumber,
    stockItemId:
      issuance.stockItemId._id?.toString() || issuance.stockItemId.toString(),
    stockItem: issuance.stockItemId.productName
      ? {
          id: issuance.stockItemId._id?.toString(),
          productName: issuance.stockItemId.productName,
          batchNumber: issuance.stockItemId.batchNumber,
          glassType: issuance.stockItemId.glassType,
        }
      : undefined,
    orderId: issuance.orderId.toString(),
    orderNumber: issuance.orderNumber,
    issuedQuantity: issuance.issuedQuantity,
    issuedTo: issuance.issuedTo,
    issuedBy: issuance.issuedBy.toString(),
    issuedAt: issuance.issuedAt,
    remarks: issuance.remarks,
    status: issuance.status,
    returnDate: issuance.returnDate,
    createdAt: issuance.createdAt,
    updatedAt: issuance.updatedAt,
  };
}

// ORDER FUNCTIONS
export async function getAllOrders(): Promise<OrderData[]> {
  await dbConnect();
  const orders = await Order.find()
    .populate("items.glassProduct", "productName batchNumber glassType")
    .sort({ createdAt: -1 });
  return orders.map((order: any) => toOrderData(order));
}

export async function getOrder(id: string): Promise<OrderData | null> {
  await dbConnect();
  const order = await Order.findById(id).populate(
    "items.glassProduct",
    "productName batchNumber glassType"
  );
  return order ? toOrderData(order as any) : null;
}

export async function getOrdersByStatus(status: string): Promise<OrderData[]> {
  await dbConnect();
  const orders = await Order.find({ status })
    .populate("items.glassProduct", "productName batchNumber glassType")
    .sort({ createdAt: -1 });
  return orders.map((order: any) => toOrderData(order));
}

export async function getOrdersByCustomer(phone: string): Promise<OrderData[]> {
  await dbConnect();
  const orders = await Order.find({ customerPhone: phone })
    .populate("items.glassProduct", "productName batchNumber glassType")
    .sort({ createdAt: -1 });
  return orders.map((order: any) => toOrderData(order));
}

// In lib/order-system.ts, update the createOrder function:
export async function createOrder(orderData: any): Promise<OrderData> {
  await dbConnect();

  // Validate items
  if (!orderData.items || orderData.items.length === 0) {
    throw new Error("Order must have at least one item");
  }

  // Generate invoice number
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const OrderModel = mongoose.model<IOrder>("Order");
  const latestOrder = await OrderModel.findOne({
    invoiceNumber: { $regex: `^INV-${year}${month}${day}` },
  }).sort({ invoiceNumber: -1 });

  let sequence = 1;
  if (latestOrder) {
    const match = latestOrder.invoiceNumber.match(/-(\d{4})$/);
    if (match) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }

  const invoiceNumber = `INV-${year}${month}${day}-${String(sequence).padStart(
    4,
    "0"
  )}`;

  // Calculate total amount from items
  const totalAmount = orderData.items.reduce((total: number, item: any) => {
    const itemTotal = item.quantity * item.unitPrice;
    const discountAmount = itemTotal * (item.discount / 100);
    return total + (itemTotal - discountAmount);
  }, 0);

  const amountPaid = orderData.amountPaid || 0;
  const balanceDue = totalAmount - amountPaid;

  // Validate issuedBy is a valid ObjectId
  let issuedBy;
  try {
    // If it's not a valid ObjectId, use a default or throw error
    if (mongoose.Types.ObjectId.isValid(orderData.issuedBy)) {
      issuedBy = new mongoose.Types.ObjectId(orderData.issuedBy);
    } else {
      // Use a default user ID or get from session
      // For now, let's create a placeholder or get from environment
      issuedBy = new mongoose.Types.ObjectId(); // This creates a new ID
      // Or use a default admin user ID from your database
      // issuedBy = new mongoose.Types.ObjectId(process.env.DEFAULT_USER_ID);
    }
  } catch (error) {
    throw new Error("Invalid user ID format for issuedBy");
  }

  const order = new Order({
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    customerAddress: orderData.customerAddress,
    orderType: orderData.orderType || "retail",
    items: orderData.items.map((item: any) => ({
      glassProduct: new mongoose.Types.ObjectId(item.glassProduct),
      quantity: item.quantity,
      discount: item.discount || 0,
      unitPrice: item.unitPrice,
      cutToSize: item.cutToSize || false,
      dimensions: item.dimensions,
    })),
    totalAmount,
    amountPaid,
    balanceDue,
    paymentMethod: orderData.paymentMethod || "cash",
    deliveryRequired: orderData.deliveryRequired || false,
    deliveryAddress: orderData.deliveryAddress,
    installationRequired: orderData.installationRequired || false,
    status: orderData.status || "pending",
    issuedBy: issuedBy,
    notes: orderData.notes,
    // invoiceNumber will be auto-generated by the pre-save hook
  });

  await order.save();

  // Populate before returning
  const populatedOrder = await Order.findById(order._id).populate(
    "items.glassProduct",
    "productName batchNumber glassType"
  );

  return toOrderData(populatedOrder as any);
}

export async function updateOrder(
  id: string,
  updates: any
): Promise<OrderData | null> {
  await dbConnect();

  // Don't allow updating invoice number
  if (updates.invoiceNumber) {
    delete updates.invoiceNumber;
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("items.glassProduct", "productName batchNumber glassType");

  return order ? toOrderData(order as any) : null;
}

export async function deleteOrder(id: string): Promise<boolean> {
  await dbConnect();

  // Check if order has any issuances
  const issuances = await GlassIssuance.findOne({ orderId: id });

  if (issuances) {
    throw new Error(
      "Cannot delete order that has stock issuances. Delete issuances first."
    );
  }

  const result = await Order.findByIdAndDelete(id);
  return !!result;
}

// ISSUANCE FUNCTIONS
export async function issueStockToOrder(
  orderId: string,
  stockItemId: string,
  quantity: number,
  issuedBy: string,
  remarks?: string
): Promise<{
  success: boolean;
  issuance: IssuanceData;
  remainingStock: number;
}> {
  await dbConnect();
  const session = await GlassStock.startSession();
  session.startTransaction();

  try {
    // Get order
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if order is in a state that allows issuing
    if (["cancelled", "delivered", "installed"].includes(order.status)) {
      throw new Error(
        `Cannot issue stock for order with status: ${order.status}`
      );
    }

    // Get stock item
    const stockItem = await GlassStock.findById(stockItemId).session(session);
    if (!stockItem) {
      throw new Error("Stock item not found");
    }

    // Check stock availability
    if (stockItem.currentQuantity < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${stockItem.currentQuantity}, Requested: ${quantity}`
      );
    }

    // Create issuance record
    const issuance = new GlassIssuance({
      stockItemId: stockItemId,
      orderId: orderId,
      orderNumber: order.invoiceNumber,
      issuedQuantity: quantity,
      issuedTo: order.customerName,
      issuedBy: issuedBy,
      remarks: remarks,
      status: "issued",
    });

    // Deduct from stock
    stockItem.currentQuantity -= quantity;

    // Update order status to processing if it was pending
    if (order.status === "pending") {
      order.status = "processing";
    }

    // Save changes
    await issuance.save({ session });
    await stockItem.save({ session });
    await order.save({ session });

    await session.commitTransaction();

    return {
      success: true,
      issuance: toIssuanceData(issuance),
      remainingStock: stockItem.currentQuantity,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function getAllIssuances(): Promise<IssuanceData[]> {
  await dbConnect();
  const issuances = await GlassIssuance.find()
    .populate("stockItemId", "productName batchNumber glassType")
    .sort({ issuedAt: -1 });
  return issuances.map((issuance: any) => toIssuanceData(issuance));
}

export async function getOrderIssuances(
  orderId: string
): Promise<IssuanceData[]> {
  await dbConnect();
  const issuances = await GlassIssuance.find({ orderId })
    .populate("stockItemId", "productName batchNumber glassType")
    .sort({ issuedAt: -1 });
  return issuances.map((issuance: any) => toIssuanceData(issuance));
}

export async function getStockItemIssuances(
  stockItemId: string
): Promise<IssuanceData[]> {
  await dbConnect();
  const issuances = await GlassIssuance.find({ stockItemId })
    .populate("stockItemId", "productName batchNumber glassType")
    .sort({ issuedAt: -1 });
  return issuances.map((issuance: any) => toIssuanceData(issuance));
}

export async function returnStock(
  issuanceId: string,
  remarks?: string
): Promise<{ success: boolean; issuance: IssuanceData }> {
  await dbConnect();
  const session = await GlassStock.startSession();
  session.startTransaction();

  try {
    const issuance = await GlassIssuance.findById(issuanceId).session(session);
    if (!issuance) {
      throw new Error("Issuance record not found");
    }

    if (issuance.status === "returned") {
      throw new Error("Stock already returned");
    }

    // Get stock item
    const stockItem = await GlassStock.findById(issuance.stockItemId).session(
      session
    );
    if (!stockItem) {
      throw new Error("Stock item not found");
    }

    // Return stock to inventory
    stockItem.currentQuantity += issuance.issuedQuantity;

    // Update issuance record
    issuance.status = "returned";
    issuance.returnDate = new Date();
    if (remarks) {
      issuance.remarks = issuance.remarks
        ? `${issuance.remarks} | Returned: ${remarks}`
        : `Returned: ${remarks}`;
    }

    await issuance.save({ session });
    await stockItem.save({ session });

    await session.commitTransaction();

    return {
      success: true,
      issuance: toIssuanceData(issuance),
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function markIssuanceDamaged(
  issuanceId: string,
  remarks?: string
): Promise<{ success: boolean; issuance: IssuanceData }> {
  await dbConnect();

  const issuance = await GlassIssuance.findById(issuanceId);
  if (!issuance) {
    throw new Error("Issuance record not found");
  }

  if (issuance.status === "damaged") {
    throw new Error("Stock already marked as damaged");
  }

  issuance.status = "damaged";
  if (remarks) {
    issuance.remarks = issuance.remarks
      ? `${issuance.remarks} | Damaged: ${remarks}`
      : `Damaged: ${remarks}`;
  }

  await issuance.save();

  return {
    success: true,
    issuance: toIssuanceData(issuance),
  };
}

// DASHBOARD STATS
export async function getDashboardStats() {
  await dbConnect();

  const [orders, issuances, stock] = await Promise.all([
    Order.find(),
    GlassIssuance.find(),
    GlassStock.find(),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  // Order stats
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

  // Issuance stats
  const issuedThisMonth = issuances
    .filter((i) => {
      const issuedDate = new Date(i.issuedAt);
      return (
        issuedDate.getMonth() === thisMonth &&
        issuedDate.getFullYear() === thisYear
      );
    })
    .reduce((sum, i) => sum + i.issuedQuantity, 0);

  // Stock stats
  const totalStockValue = stock.reduce(
    (sum, s) => sum + s.currentQuantity * s.unitPrice,
    0
  );

  const totalStockArea = stock.reduce(
    (sum, s) => sum + (s.width / 100) * (s.height / 100) * s.currentQuantity,
    0
  );

  const lowStockItems = stock.filter((s) => s.currentQuantity <= 10).length;

  // Customer stats (unique customers by phone)
  const uniqueCustomers = new Set(orders.map((o) => o.customerPhone)).size;

  return {
    // Order stats
    totalOrders: orders.length,
    pendingOrders,
    todayOrders,
    monthlyRevenue: Math.round(monthlyRevenue),

    // Stock stats
    totalStockItems: stock.length,
    totalStockValue: Math.round(totalStockValue),
    totalStockArea: parseFloat(totalStockArea.toFixed(2)),
    lowStockItems,

    // Issuance stats
    issuedThisMonth,

    // Customer stats
    totalCustomers: uniqueCustomers,
    totalSuppliers: new Set(stock.map((s) => s.supplier)).size,
  };
}
