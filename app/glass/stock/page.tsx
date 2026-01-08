// app/glass/stock/page.tsx
"use client";

import { useEffect, useState } from "react";
import { GlassStockTable } from "@/components/glass/GlassStockTable";
import { GlassStockForm } from "@/components/glass/GlassStockForm";
import { GlassStock } from "@/types/glass";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function GlassStockPage() {
  const [stock, setStock] = useState<GlassStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await fetch("/api/glass/stock");
      if (response.ok) {
        const data = await response.json();
        setStock(data);
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: GlassStock) => {
    console.log("Edit item:", item);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/glass/stock/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setStock(stock.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting stock:", error);
    }
  };

  const handleAdd = () => {
    setShowAddDialog(true);
  };

  const handleFormSuccess = () => {
    setShowAddDialog(false);
    fetchStock();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Glass Stock</h2>
          <p className="text-gray-500">Manage your glass inventory</p>
        </div>
      </div>

      <GlassStockTable
        stock={stock}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Glass Stock</DialogTitle>
          </DialogHeader>
          <GlassStockForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
