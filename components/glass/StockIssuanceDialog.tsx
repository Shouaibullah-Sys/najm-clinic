"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassStock } from "@/types/glass";

export interface StockIssuanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    invoiceNumber: string; // Changed from orderNumber to invoiceNumber
    customerName: string;
  };
  onSuccess: () => void;
}

export function StockIssuanceDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: StockIssuanceDialogProps) {
  const [stockItems, setStockItems] = useState<GlassStock[]>([]);
  const [selectedStockItem, setSelectedStockItem] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchStockItems();
    }
  }, [open]);

  const fetchStockItems = async () => {
    try {
      const response = await fetch("/api/stock");
      if (response.ok) {
        const data = await response.json();
        setStockItems(data);
      }
    } catch (error) {
      console.error("Error fetching stock items:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStockItem || !quantity) {
      setError("Please select a stock item and enter quantity");
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stockItemId: selectedStockItem,
          quantity: qty,
          issuedBy: "current-user-id", // Replace with actual user ID
          remarks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to issue stock");
      }

      // Reset form
      setSelectedStockItem("");
      setQuantity("");
      setRemarks("");

      // Close dialog and notify parent
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = stockItems.find((item) => item.id === selectedStockItem);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Issue Stock to Order</DialogTitle>
          <DialogDescription>
            Issue stock from inventory to order {order.invoiceNumber} for{" "}
            {order.customerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Order Number</Label>
                <Input value={order.invoiceNumber} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Customer</Label>
                <Input value={order.customerName} readOnly />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockItem">Select Stock Item *</Label>
              <Select
                value={selectedStockItem}
                onValueChange={setSelectedStockItem}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a stock item" />
                </SelectTrigger>
                <SelectContent>
                  {stockItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.productName} - {item.glassType} (
                      {item.currentQuantity} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItem && (
              <div className="border rounded-md p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>{" "}
                    {selectedItem.glassType}
                  </div>
                  <div>
                    <span className="text-gray-500">Dimensions:</span>{" "}
                    {selectedItem.width} × {selectedItem.height} cm
                  </div>
                  <div>
                    <span className="text-gray-500">Available:</span>{" "}
                    {selectedItem.currentQuantity}
                  </div>
                  <div>
                    <span className="text-gray-500">Batch:</span>{" "}
                    {selectedItem.batchNumber}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity to Issue *</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
              {selectedItem && quantity && (
                <p className="text-sm text-gray-500">
                  After issuance:{" "}
                  {selectedItem.currentQuantity - parseFloat(quantity) || 0}{" "}
                  will remain
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any notes about this issuance..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Issuing..." : "Issue Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
