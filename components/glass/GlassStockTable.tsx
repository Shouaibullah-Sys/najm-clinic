"use client";

import { useState } from "react";
import { GlassStock } from "@/types/glass";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
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

interface GlassStockTableProps {
  stock: GlassStock[];
  onEdit: (item: GlassStock) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function GlassStockTable({
  stock,
  onEdit,
  onDelete,
  onAdd,
}: GlassStockTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GlassStock | null>(null);

  const handleDeleteClick = (item: GlassStock) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedItem) {
      onDelete(selectedItem.id);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const getStockStatus = (quantity: number, originalQuantity: number) => {
    const percentage = (quantity / originalQuantity) * 100;
    if (quantity <= 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (percentage <= 20)
      return { label: "Low Stock", color: "bg-orange-100 text-orange-800" };
    if (percentage <= 50)
      return { label: "Medium Stock", color: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Batch No.</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">No stock items found</p>
                    <Button onClick={onAdd} size="sm">
                      Add Your First Stock Item
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              stock.map((item) => {
                const status = getStockStatus(
                  item.currentQuantity,
                  item.originalQuantity
                );
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div>{item.productName}</div>
                        {item.color && (
                          <div className="text-sm text-gray-500">
                            Color: {item.color}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{item.glassType}</div>
                        <div className="text-sm text-gray-500">
                          {item.thickness}mm
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.width} × {item.height} cm
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.batchNumber}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>
                          {item.currentQuantity} / {item.originalQuantity}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${item.remainingPercentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.unitPrice.toLocaleString()} AFN</TableCell>
                    <TableCell className="font-medium">
                      {item.totalValue.toLocaleString()} AFN
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stock Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedItem?.productName}</span>
              ? This action cannot be undone. Stock item will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
