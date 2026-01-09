import { NextRequest, NextResponse } from "next/server";
import {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrdersByStatus,
  getOrdersByCustomer,
  getDashboardStats,
} from "@/lib/order-system";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const customerPhone = searchParams.get("customerPhone");
    const search = searchParams.get("search");
    const stats = searchParams.get("stats");

    // Get dashboard stats
    if (stats) {
      const statsData = await getDashboardStats();
      return NextResponse.json(statsData);
    }

    // Get specific order
    if (id) {
      const order = await getOrder(id);
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json(order);
    }

    // Get orders by status
    if (status) {
      const orders = await getOrdersByStatus(status);
      return NextResponse.json(orders);
    }

    // Get orders by customer
    if (customerPhone) {
      const orders = await getOrdersByCustomer(customerPhone);
      return NextResponse.json(orders);
    }

    // Search orders (simple search by customer name or invoice number)
    if (search) {
      const allOrders = await getAllOrders();
      const filtered = allOrders.filter(
        (order) =>
          order.customerName.toLowerCase().includes(search.toLowerCase()) ||
          order.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
          order.customerPhone.includes(search)
      );
      return NextResponse.json(filtered);
    }

    // Get all orders
    const orders = await getAllOrders();
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      "customerName",
      "customerPhone",
      "items",
      "issuedBy",
    ];

    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate items
    if (!Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: "Order must have at least one item" },
        { status: 400 }
      );
    }

    const order = await createOrder(data);
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const updatedOrder = await updateOrder(id, data);

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteOrder(id);

    if (!success) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete order" },
      { status: 500 }
    );
  }
}
