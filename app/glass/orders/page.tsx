"use client";

import { useEffect, useState } from "react";
import { GlassOrder, GlassIssuance } from "@/types/glass";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Package, Eye, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StockIssuanceDialog } from "@/components/glass/StockIssuanceDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default function GlassOrdersPage() {
  const [orders, setOrders] = useState<GlassOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [issuanceDialogOpen, setIssuanceDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<GlassOrder | null>(null);
  const [viewOrderDialogOpen, setViewOrderDialogOpen] = useState(false);
  const [selectedViewOrder, setSelectedViewOrder] = useState<GlassOrder | null>(
    null
  );
  const [editOrderDialogOpen, setEditOrderDialogOpen] = useState(false);
  const [orderIssuances, setOrderIssuances] = useState<GlassIssuance[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderIssuances = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}?issuances=true`);
      if (response.ok) {
        const data = await response.json();
        setOrderIssuances(data);
      }
    } catch (error) {
      console.error("Error fetching issuances:", error);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm)
  );

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      delivered: "bg-purple-100 text-purple-800",
      installed: "bg-indigo-100 text-indigo-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      retail: "bg-blue-100 text-blue-800",
      wholesale: "bg-green-100 text-green-800",
      contract: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const handleIssueStock = (order: GlassOrder) => {
    setSelectedOrder(order);
    setIssuanceDialogOpen(true);
  };

  const handleViewOrder = async (order: GlassOrder) => {
    setSelectedViewOrder(order);
    await fetchOrderIssuances(order.id);
    setViewOrderDialogOpen(true);
  };

  const handleEditOrder = (order: GlassOrder) => {
    setSelectedViewOrder(order);
    setEditOrderDialogOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    )
      return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchOrders();
        alert("Order deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  };

  const handleOrderStatusUpdate = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
        alert(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const calculateTotalItems = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Glass Orders</h2>
          <p className="text-gray-500">
            Manage customer orders and issue stock
          </p>
        </div>
        <Link href="/glass/orders/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Orders List</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by customer name, invoice number, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-gray-500">No orders found</p>
                        <Link href="/glass/orders/new">
                          <Button size="sm">Create Your First Order</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{order.invoiceNumber}</span>
                          {order.deliveryRequired && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Delivery
                            </Badge>
                          )}
                          {order.installationRequired && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Installation
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customerPhone}
                          </div>
                          {order.customerAddress && (
                            <div className="text-xs text-gray-400 truncate max-w-50">
                              {order.customerAddress}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(order.orderType)}>
                          {order.orderType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {calculateTotalItems(order.items)} items
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.totalAmount.toLocaleString()} AFN
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            order.balanceDue > 0
                              ? "text-red-600 font-medium"
                              : "text-green-600"
                          }
                        >
                          {order.balanceDue.toLocaleString()} AFN
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleIssueStock(order)}
                            disabled={
                              order.status === "delivered" ||
                              order.status === "cancelled" ||
                              order.status === "completed"
                            }
                            className="h-8 px-3"
                            title="Issue stock from inventory"
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Issue
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditOrder(order)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Order
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
                                Update Status
                              </div>

                              {order.status === "processing" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOrderStatusUpdate(
                                      order.id,
                                      "completed"
                                    )
                                  }
                                >
                                  <Badge className="bg-green-100 text-green-800 mr-2 px-1">
                                    ✓
                                  </Badge>
                                  Mark as Completed
                                </DropdownMenuItem>
                              )}
                              {order.status === "completed" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOrderStatusUpdate(
                                      order.id,
                                      "delivered"
                                    )
                                  }
                                >
                                  <Badge className="bg-blue-100 text-blue-800 mr-2 px-1">
                                    ✓
                                  </Badge>
                                  Mark as Delivered
                                </DropdownMenuItem>
                              )}
                              {order.status === "delivered" &&
                                order.installationRequired && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOrderStatusUpdate(
                                        order.id,
                                        "installed"
                                      )
                                    }
                                  >
                                    <Badge className="bg-purple-100 text-purple-800 mr-2 px-1">
                                      ✓
                                    </Badge>
                                    Mark as Installed
                                  </DropdownMenuItem>
                                )}
                              {order.status !== "cancelled" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOrderStatusUpdate(
                                      order.id,
                                      "cancelled"
                                    )
                                  }
                                  className="text-red-600"
                                >
                                  <Badge className="bg-red-100 text-red-800 mr-2 px-1">
                                    ×
                                  </Badge>
                                  Cancel Order
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleDeleteOrder(order.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Issuance Dialog */}
      {selectedOrder && (
        <StockIssuanceDialog
          open={issuanceDialogOpen}
          onOpenChange={setIssuanceDialogOpen}
          order={selectedOrder}
          onSuccess={() => {
            fetchOrders(); // Refresh orders after successful issuance
          }}
        />
      )}

      {/* View Order Details Dialog */}
      <Dialog open={viewOrderDialogOpen} onOpenChange={setViewOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order Details - {selectedViewOrder?.invoiceNumber}
            </DialogTitle>
            <DialogDescription>Complete order information</DialogDescription>
          </DialogHeader>

          {selectedViewOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Customer Information
                    </h3>
                    <div className="border rounded-md p-4 space-y-2">
                      <div className="font-medium text-lg">
                        {selectedViewOrder.customerName}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Phone:</span>{" "}
                        {selectedViewOrder.customerPhone}
                      </div>
                      {selectedViewOrder.customerAddress && (
                        <div className="text-sm">
                          <span className="text-gray-500">Address:</span>{" "}
                          {selectedViewOrder.customerAddress}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Order Information
                    </h3>
                    <div className="border rounded-md p-4 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Status</div>
                        <Badge
                          className={getStatusBadgeColor(
                            selectedViewOrder.status
                          )}
                        >
                          {selectedViewOrder.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Type</div>
                        <Badge
                          className={getTypeBadgeColor(
                            selectedViewOrder.orderType
                          )}
                        >
                          {selectedViewOrder.orderType}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Created</div>
                        <div className="text-sm">
                          {new Date(
                            selectedViewOrder.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Payment</div>
                        <div className="text-sm">
                          {selectedViewOrder.paymentMethod}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500">Delivery</div>
                        <div className="text-sm">
                          {selectedViewOrder.deliveryRequired
                            ? `Required${
                                selectedViewOrder.deliveryAddress
                                  ? ` (${selectedViewOrder.deliveryAddress})`
                                  : ""
                              }`
                            : "Not Required"}
                        </div>
                      </div>
                      {selectedViewOrder.installationRequired && (
                        <div className="col-span-2">
                          <div className="text-xs text-gray-500">
                            Installation
                          </div>
                          <div className="text-sm">Required</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Financial Information
                    </h3>
                    <div className="border rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Total Amount:</span>
                        <span className="font-medium text-lg">
                          {selectedViewOrder.totalAmount.toLocaleString()} AFN
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Amount Paid:</span>
                        <span className="font-medium text-green-600">
                          {selectedViewOrder.amountPaid.toLocaleString()} AFN
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-3">
                        <span className="text-gray-500 font-medium">
                          Balance Due:
                        </span>
                        <span
                          className={`font-bold text-lg ${
                            selectedViewOrder.balanceDue > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {selectedViewOrder.balanceDue.toLocaleString()} AFN
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Payment Status:</span>
                        <Badge
                          className={
                            selectedViewOrder.balanceDue === 0
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {selectedViewOrder.balanceDue === 0
                            ? "Paid in Full"
                            : "Partial Payment"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Issued Stock */}
                  {orderIssuances.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Issued Stock ({orderIssuances.length})
                      </h3>
                      <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                        {orderIssuances.map((issuance) => (
                          <div
                            key={issuance.id}
                            className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0"
                          >
                            <div>
                              <div className="font-medium">
                                {issuance.issuanceNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                Qty: {issuance.issuedQuantity}
                              </div>
                            </div>
                            <Badge
                              className={
                                issuance.status === "issued"
                                  ? "bg-blue-100 text-blue-800"
                                  : issuance.status === "returned"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {issuance.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Order Items ({selectedViewOrder.items.length})
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Dimensions</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedViewOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {typeof item.glassProduct === "object"
                                  ? item.glassProduct.productName
                                  : "Product ID: " + item.glassProduct}
                              </div>
                              {item.cutToSize && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">
                                  Cut to Size
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.dimensions ? (
                              <div className="text-sm">
                                {item.dimensions.width} ×{" "}
                                {item.dimensions.height} cm
                              </div>
                            ) : (
                              <span className="text-gray-400"> -</span>
                            )}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.unitPrice.toLocaleString()} AFN
                          </TableCell>
                          <TableCell>{item.discount}%</TableCell>
                          <TableCell className="font-medium">
                            {(
                              item.quantity *
                              item.unitPrice *
                              (1 - item.discount / 100)
                            ).toLocaleString()}{" "}
                            AFN
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Notes */}
              {selectedViewOrder.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Notes
                  </h3>
                  <div className="border rounded-md p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedViewOrder.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editOrderDialogOpen} onOpenChange={setEditOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Order - {selectedViewOrder?.invoiceNumber}
            </DialogTitle>
            <DialogDescription>Update order details</DialogDescription>
          </DialogHeader>

          {selectedViewOrder && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <p className="text-gray-500">Edit form coming soon...</p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditOrderDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setEditOrderDialogOpen(false);
                    fetchOrders();
                  }}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
