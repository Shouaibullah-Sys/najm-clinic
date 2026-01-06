// app/ceo/dashboard/components/MedicineStockReport.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AlertTriangleIcon, CalendarIcon, PackageIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface MedicineStock {
  _id: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  currentQuantity: number;
  originalQuantity: number;
  unitPrice: number;
  sellingPrice: number;
  supplier: string;
}

export default function MedicineStockReport() {
  const [medicines, setMedicines] = useState<MedicineStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "expiring" | "expired" | "lowstock" | "all"
  >("expiring");

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ceo/medicine-stock");
      if (!response.ok) throw new Error("Failed to fetch medicines");

      const data = await response.json();
      setMedicines(data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to load medicine stock");
    } finally {
      setLoading(false);
    }
  };

  const getExpiringSoon = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return medicines.filter((medicine) => {
      const expiryDate = new Date(medicine.expiryDate);
      return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
    });
  };

  const getExpired = () => {
    const today = new Date();
    return medicines.filter(
      (medicine) => new Date(medicine.expiryDate) < today
    );
  };

  const getLowStock = () => {
    return medicines.filter((medicine) => medicine.currentQuantity < 10);
  };

  const getStatusBadge = (medicine: MedicineStock) => {
    const expiryDate = new Date(medicine.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (expiryDate < today) {
      return (
        <Badge variant="destructive" className="text-xs">
          Expired
        </Badge>
      );
    } else if (daysUntilExpiry <= 7) {
      return (
        <Badge variant="destructive" className="text-xs">
          Expiring ({daysUntilExpiry}d)
        </Badge>
      );
    } else if (daysUntilExpiry <= 30) {
      return (
        <Badge variant="secondary" className="text-xs">
          Expiring ({daysUntilExpiry}d)
        </Badge>
      );
    } else if (medicine.currentQuantity < 5) {
      return (
        <Badge variant="destructive" className="text-xs">
          Critical
        </Badge>
      );
    } else if (medicine.currentQuantity < 10) {
      return (
        <Badge variant="secondary" className="text-xs">
          Low
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-xs">
          In Stock
        </Badge>
      );
    }
  };

  const getFilteredMedicines = () => {
    switch (activeTab) {
      case "expiring":
        return getExpiringSoon();
      case "expired":
        return getExpired();
      case "lowstock":
        return getLowStock();
      default:
        return medicines;
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading medicine stock...</div>;
  }

  const filteredMedicines = getFilteredMedicines();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Alert Summary - Mobile responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangleIcon className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-amber-500" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="text-lg lg:text-2xl font-bold text-amber-600">
              {getExpiringSoon().length}
            </div>
            <div className="text-xs text-muted-foreground">Within 30 days</div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarIcon className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-red-500" />
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="text-lg lg:text-2xl font-bold text-red-600">
              {getExpired().length}
            </div>
            <div className="text-xs text-muted-foreground">
              Immediate action
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium flex items-center">
              <PackageIcon className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-orange-500" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="text-lg lg:text-2xl font-bold text-orange-600">
              {getLowStock().length}
            </div>
            <div className="text-xs text-muted-foreground">Below 10 units</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs - Mobile scrollable */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button
          variant={activeTab === "expiring" ? "default" : "outline"}
          onClick={() => setActiveTab("expiring")}
          className="text-xs lg:text-sm whitespace-nowrap"
          size="sm"
        >
          Expiring ({getExpiringSoon().length})
        </Button>
        <Button
          variant={activeTab === "expired" ? "default" : "outline"}
          onClick={() => setActiveTab("expired")}
          className="text-xs lg:text-sm whitespace-nowrap"
          size="sm"
        >
          Expired ({getExpired().length})
        </Button>
        <Button
          variant={activeTab === "lowstock" ? "default" : "outline"}
          onClick={() => setActiveTab("lowstock")}
          className="text-xs lg:text-sm whitespace-nowrap"
          size="sm"
        >
          Low Stock ({getLowStock().length})
        </Button>
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
          className="text-xs lg:text-sm whitespace-nowrap"
          size="sm"
        >
          All ({medicines.length})
        </Button>
      </div>

      {/* Medicines Table - Mobile responsive */}
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-lg lg:text-xl">
            {activeTab === "expiring" && "Expiring Soon Medicines"}
            {activeTab === "expired" && "Expired Medicines"}
            {activeTab === "lowstock" && "Low Stock Medicines"}
            {activeTab === "all" && "All Medicines"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 lg:p-6">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Medicine
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap hidden sm:table-cell">
                    Batch
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Expiry
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Stock
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap hidden md:table-cell">
                    Original
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap hidden lg:table-cell">
                    Unit Price
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap hidden lg:table-cell">
                    Selling Price
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map((medicine) => (
                  <TableRow key={medicine._id}>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 max-w-[100px] lg:max-w-none truncate font-medium">
                      {medicine.name}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 hidden sm:table-cell">
                      {medicine.batchNumber}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                      <span
                        className={
                          new Date(medicine.expiryDate) < new Date()
                            ? "text-red-600"
                            : ""
                        }
                      >
                        {format(new Date(medicine.expiryDate), "MMM dd")}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                      <span
                        className={
                          medicine.currentQuantity < 10
                            ? "text-red-600 font-semibold"
                            : ""
                        }
                      >
                        {medicine.currentQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 hidden md:table-cell">
                      {medicine.originalQuantity}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 hidden lg:table-cell">
                      AFs {medicine.unitPrice}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 hidden lg:table-cell">
                      AFs {medicine.sellingPrice}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4">
                      {getStatusBadge(medicine)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredMedicines.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No medicines found for the selected filter.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile compact view for small screens */}
      <div className="block lg:hidden">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Quick Stock Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {filteredMedicines.slice(0, 5).map((medicine) => (
              <div
                key={medicine._id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {medicine.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Stock: {medicine.currentQuantity} | Exp:{" "}
                    {format(new Date(medicine.expiryDate), "MMM dd")}
                  </div>
                </div>
                <div className="ml-2">{getStatusBadge(medicine)}</div>
              </div>
            ))}
            {filteredMedicines.length > 5 && (
              <div className="text-center text-sm text-muted-foreground">
                +{filteredMedicines.length - 5} more medicines
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
