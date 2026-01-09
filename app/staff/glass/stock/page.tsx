"use client";

import { useEffect, useState } from "react";
import { GlassStock } from "@/types/glass";
import { GlassStockTable } from "@/components/glass/GlassStockTable";
import { GlassStockForm } from "@/components/glass/GlassStockForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function GlassStockPage() {
  const [stock, setStock] = useState<GlassStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<GlassStock | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/glass/stock/${itemToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setStock(stock.filter((item) => item.id !== itemToDelete));
      }
    } catch (error) {
      console.error("Error deleting stock:", error);
      alert("Failed to delete stock item");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleAdd = () => {
    setShowAddDialog(true);
  };

  const handleFormSuccess = () => {
    setShowAddDialog(false);
    setShowEditDialog(false);
    setEditingItem(null);
    fetchStock();
  };

  const getStockStats = () => {
    const totalValue = stock.reduce(
      (sum, item) => sum + item.currentQuantity * item.unitPrice,
      0
    );

    const totalItems = stock.reduce(
      (sum, item) => sum + item.currentQuantity,
      0
    );

    const lowStockItems = stock.filter(
      (item) => item.currentQuantity <= 10
    ).length;

    return {
      totalValue: Math.round(totalValue).toLocaleString(),
      totalItems,
      lowStockItems,
      totalProducts: stock.length,
    };
  };

  const stats = getStockStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto dark:border-blue-400"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Loading stock data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight dark:text-white">
            Glass Stock Inventory
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your glass inventory and track stock levels
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Stock
        </Button>
      </div>

      {/* Stock Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Products
          </div>
          <div className="text-2xl font-bold dark:text-white">
            {stats.totalProducts}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Different glass types
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Items
          </div>
          <div className="text-2xl font-bold dark:text-white">
            {stats.totalItems}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Total pieces in stock
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Value
          </div>
          <div className="text-2xl font-bold dark:text-white">
            {stats.totalValue} AFN
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Current stock value
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Low Stock
          </div>
          <div
            className={`text-2xl font-bold ${
              stats.lowStockItems > 0
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {stats.lowStockItems}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Items below threshold
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
        <GlassStockTable
          stock={stock}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAdd={handleAdd}
        />
      </div>

      {/* Add Stock Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Add New Glass Stock
            </DialogTitle>
          </DialogHeader>
          <GlassStockForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Stock Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Edit Glass Stock
            </DialogTitle>
          </DialogHeader>
          {editingItem && (
            <GlassStockForm
              initialData={editingItem}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowEditDialog(false);
                setEditingItem(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              This action cannot be undone. This will permanently delete the
              stock item from the database. Any orders referencing this item may
              be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 dark:text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
