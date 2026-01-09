// app/glass/orders/new/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassStock, OrderItemFormValues } from "@/types/glass";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, Trash2, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockItems, setStockItems] = useState<GlassStock[]>([]);
  const [filteredStock, setFilteredStock] = useState<GlassStock[]>([]);
  const [showStockDialog, setShowStockDialog] = useState(false);

  // Order form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderType, setOrderType] = useState<
    "retail" | "wholesale" | "contract"
  >("retail");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "card" | "credit"
  >("cash");
  const [amountPaid, setAmountPaid] = useState<string>("0");
  const [deliveryRequired, setDeliveryRequired] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [installationRequired, setInstallationRequired] = useState(false);
  const [notes, setNotes] = useState("");

  // Cart/selected items
  const [cartItems, setCartItems] = useState<
    Array<{
      stockItem: GlassStock;
      quantity: number;
      discount: number;
      cutToSize: boolean;
      dimensions?: { width: number; height: number };
    }>
  >([]);

  useEffect(() => {
    fetchStockItems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = stockItems.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.glassType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStock(filtered);
    } else {
      setFilteredStock(stockItems.slice(0, 20)); // Show first 20 items
    }
  }, [searchTerm, stockItems]);

  const fetchStockItems = async () => {
    try {
      const response = await fetch("/api/glass/stock");
      if (response.ok) {
        const data = await response.json();
        setStockItems(data);
        setFilteredStock(data.slice(0, 20));
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
      toast("Error", {
        description: "Failed to load stock items",
      });
    }
  };

  const addToCart = (item: GlassStock) => {
    // Check if item already in cart
    const existingIndex = cartItems.findIndex(
      (cartItem) => cartItem.stockItem.id === item.id
    );

    if (existingIndex >= 0) {
      // Increase quantity if already in cart
      const updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += 1;
      setCartItems(updatedCart);
    } else {
      // Add new item to cart
      setCartItems([
        ...cartItems,
        {
          stockItem: item,
          quantity: 1,
          discount: 0,
          cutToSize: false,
        },
      ]);
    }

    toast("Added to order", {
      description: `${item.productName} added to order`,
    });
  };

  const removeFromCart = (index: number) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
  };

  const updateCartItem = (index: number, updates: any) => {
    const updatedCart = [...cartItems];
    updatedCart[index] = { ...updatedCart[index], ...updates };
    setCartItems(updatedCart);
  };

  const calculateItemTotal = (item: (typeof cartItems)[0]) => {
    const basePrice = item.quantity * item.stockItem.unitPrice;
    const discountAmount = basePrice * (item.discount / 100);
    return basePrice - discountAmount;
  };

  const calculateOrderTotal = () => {
    return cartItems.reduce(
      (total, item) => total + calculateItemTotal(item),
      0
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!customerName || !customerPhone) {
      toast("Validation Error", {
        description: "Customer name and phone are required",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast("Validation Error", {
        description: "Please add at least one item to the order",
      });
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        orderType,
        items: cartItems.map((item) => ({
          glassProduct: item.stockItem.id,
          quantity: item.quantity,
          discount: item.discount,
          unitPrice: item.stockItem.unitPrice,
          cutToSize: item.cutToSize,
          dimensions: item.dimensions,
        })),
        amountPaid: parseFloat(amountPaid) || 0,
        paymentMethod,
        deliveryRequired,
        deliveryAddress: deliveryRequired ? deliveryAddress : undefined,
        installationRequired,
        issuedBy: "current-user-id", // Replace with actual user ID
        notes,
        status: "pending",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const order = await response.json();

      toast("Order Created", {
        description: `Order ${order.invoiceNumber} created successfully`,
      });

      // Redirect to orders page
      router.push("/glass/orders");
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast("Error", {
        description: error.message || "Failed to create order",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Create New Order
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Add customer details and select glass items from stock
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading || cartItems.length === 0}
        >
          {loading ? "Creating..." : "Create Order"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Address</Label>
                <Input
                  id="customerAddress"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter customer address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderType">Order Type</Label>
                  <Select
                    value={orderType}
                    onValueChange={(value: any) => setOrderType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value: any) => setPaymentMethod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amountPaid">Amount Paid (AFN)</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="deliveryRequired"
                    checked={deliveryRequired}
                    onChange={(e) => setDeliveryRequired(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="deliveryRequired">Delivery Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="installationRequired"
                    checked={installationRequired}
                    onChange={(e) => setInstallationRequired(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="installationRequired">
                    Installation Required
                  </Label>
                </div>
              </div>

              {deliveryRequired && (
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Input
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter delivery address"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes or instructions..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cart & Order Summary */}
        <div className="space-y-6">
          {/* Cart Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Items</CardTitle>
                <Badge variant="outline">{cartItems.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Stock Items
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Glass Items from Stock</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by product name, type, batch number, or supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Available</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStock.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center py-8"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <p className="text-gray-500">
                                    No stock items found
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSearchTerm("")}
                                  >
                                    Clear Search
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredStock.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div className="font-medium">
                                    {item.productName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.batchNumber}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {item.glassType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {item.width} × {item.height} cm
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {item.currentQuantity}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {Math.round(item.remainingPercentage)}%
                                    remaining
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {item.unitPrice.toLocaleString()} AFN
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      addToCart(item);
                                      setShowStockDialog(false);
                                    }}
                                    disabled={item.currentQuantity <= 0}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {cartItems.length === 0 ? (
                <div className="text-center py-8 border rounded-md">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No items added yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click "Browse Stock Items" to add items
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-md p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {item.stockItem.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.stockItem.glassType} • {item.stockItem.width}{" "}
                            × {item.stockItem.height} cm
                          </div>
                          <div className="text-xs text-gray-400">
                            Batch: {item.stockItem.batchNumber}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label
                            htmlFor={`quantity-${index}`}
                            className="text-xs"
                          >
                            Quantity
                          </Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            max={item.stockItem.currentQuantity}
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartItem(index, {
                                quantity: parseInt(e.target.value) || 1,
                              })
                            }
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`discount-${index}`}
                            className="text-xs"
                          >
                            Discount %
                          </Label>
                          <Input
                            id={`discount-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) =>
                              updateCartItem(index, {
                                discount: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="h-8"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`cutToSize-${index}`}
                          checked={item.cutToSize}
                          onChange={(e) =>
                            updateCartItem(index, {
                              cutToSize: e.target.checked,
                            })
                          }
                          className="rounded border-gray-300"
                        />
                        <Label
                          htmlFor={`cutToSize-${index}`}
                          className="text-sm"
                        >
                          Cut to Size
                        </Label>
                      </div>

                      {item.cutToSize && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label
                              htmlFor={`width-${index}`}
                              className="text-xs"
                            >
                              Width (cm)
                            </Label>
                            <Input
                              id={`width-${index}`}
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={item.dimensions?.width || ""}
                              onChange={(e) =>
                                updateCartItem(index, {
                                  dimensions: {
                                    ...item.dimensions,
                                    width: parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label
                              htmlFor={`height-${index}`}
                              className="text-xs"
                            >
                              Height (cm)
                            </Label>
                            <Input
                              id={`height-${index}`}
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={item.dimensions?.height || ""}
                              onChange={(e) =>
                                updateCartItem(index, {
                                  dimensions: {
                                    ...item.dimensions,
                                    height: parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                              className="h-8"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-gray-500">
                          Item Total:
                        </span>
                        <span className="font-medium">
                          {calculateItemTotal(item).toLocaleString()} AFN
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{calculateOrderTotal().toLocaleString()} AFN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="text-green-600">
                    {parseFloat(amountPaid || "0").toLocaleString()} AFN
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Balance Due</span>
                  <span
                    className={`font-bold text-lg ${
                      calculateOrderTotal() - parseFloat(amountPaid || "0") > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {(
                      calculateOrderTotal() - parseFloat(amountPaid || "0")
                    ).toLocaleString()}{" "}
                    AFN
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || cartItems.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Create Order
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
