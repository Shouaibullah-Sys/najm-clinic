// components/glass/GlassStockTable.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { GlassStock } from "@/types/glass";

interface GlassStockTableProps {
  stock: GlassStock[];
  onEdit?: (stock: GlassStock) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export function GlassStockTable({
  stock,
  onEdit,
  onDelete,
  onAdd,
}: GlassStockTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStock = stock.filter(
    (item) =>
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm)
  );

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      "single-vision": "bg-blue-100 text-blue-800",
      bifocal: "bg-green-100 text-green-800",
      progressive: "bg-purple-100 text-purple-800",
      photochromic: "bg-yellow-100 text-yellow-800",
      "anti-reflective": "bg-indigo-100 text-indigo-800",
      "blue-light": "bg-cyan-100 text-cyan-800",
      tinted: "bg-pink-100 text-pink-800",
      polarized: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getMaterialBadgeColor = (material: string) => {
    const colors: Record<string, string> = {
      "cr-39": "bg-blue-50 text-blue-700",
      polycarbonate: "bg-gray-50 text-gray-700",
      "high-index-1.67": "bg-purple-50 text-purple-700",
      "high-index-1.74": "bg-indigo-50 text-indigo-700",
      glass: "bg-green-50 text-green-700",
      trivex: "bg-yellow-50 text-yellow-700",
    };
    return colors[material] || "bg-gray-50 text-gray-700";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by brand, model, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
        </div>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Sphere</TableHead>
              <TableHead>Cylinder</TableHead>
              <TableHead>Axis</TableHead>
              <TableHead>Diameter</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price (AFN)</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  No stock items found
                </TableCell>
              </TableRow>
            ) : (
              filteredStock.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.brand}</TableCell>
                  <TableCell>{item.model}</TableCell>
                  <TableCell>
                    <Badge className={getTypeBadgeColor(item.type)}>
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getMaterialBadgeColor(item.material)}>
                      {item.material}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.sphere}</TableCell>
                  <TableCell>{item.cylinder}</TableCell>
                  <TableCell>{item.axis}°</TableCell>
                  <TableCell>{item.diameter}mm</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.stockQuantity <= item.minStockLevel && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={
                          item.stockQuantity <= item.minStockLevel
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {item.stockQuantity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        Sell: {item.sellingPrice.toLocaleString()}
                      </div>
                      <div className="text-gray-500">
                        Cost: {item.costPrice.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
