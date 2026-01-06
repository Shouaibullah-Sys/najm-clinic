// app/ceo/dashboard/components/PharmacyFinancialReport.tsx
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
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  DownloadIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  PackageIcon,
  CreditCardIcon,
  ShieldIcon,
  AlertCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationProps } from "../dashboard/page";

interface PharmacyReport {
  prescriptions: any[];
  expenses: any[];
  dailyData: any[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    totalPrescriptions: number;
    totalExpenseItems: number;
  };
}

interface PharmacyFinancialReportProps {
  dateRange: DateRange;
  pagination: PaginationProps;
}

export default function PharmacyFinancialReport({
  dateRange,
  pagination,
}: PharmacyFinancialReportProps) {
  const [data, setData] = useState<PharmacyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [
    dateRange,
    pagination.pagination.currentPage,
    pagination.pagination.itemsPerPage,
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pagination.pagination.currentPage.toString(),
        limit: pagination.pagination.itemsPerPage.toString(),
      });

      if (dateRange.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append("endDate", dateRange.to.toISOString());
      }

      const response = await fetch(`/api/ceo/pharmacy-report?${params}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      if (!result || !result.summary) {
        throw new Error("Invalid data structure received from server");
      }

      setData(result);

      if (result.pagination) {
        pagination.onPageChange(1);
      }
    } catch (error) {
      console.error("Error fetching pharmacy report:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load pharmacy report"
      );
      toast.error("Failed to load pharmacy report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append("endDate", dateRange.to.toISOString());
      }

      const response = await fetch(`/api/ceo/export-pharmacy?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pharmacy-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Pharmacy report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <PackageIcon className="h-3 w-3 lg:h-4 lg:w-4" />;
      case "card":
        return <CreditCardIcon className="h-3 w-3 lg:h-4 lg:w-4" />;
      case "insurance":
        return <ShieldIcon className="h-3 w-3 lg:h-4 lg:w-4" />;
      default:
        return <PackageIcon className="h-3 w-3 lg:h-4 lg:w-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800";
      case "card":
        return "bg-blue-100 text-blue-800";
      case "insurance":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const safeData = data || {
    prescriptions: [],
    expenses: [],
    dailyData: [],
    summary: {
      totalIncome: 0,
      totalExpenses: 0,
      totalPrescriptions: 0,
      totalExpenseItems: 0,
    },
  };

  const profit = safeData.summary.totalIncome - safeData.summary.totalExpenses;
  const profitMargin =
    safeData.summary.totalIncome > 0
      ? (profit / safeData.summary.totalIncome) * 100
      : 0;

  const paymentMethodBreakdown = safeData.prescriptions.reduce(
    (acc, prescription) => {
      const method = prescription.paymentMethod || "unknown";
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count += 1;
      acc[method].total += prescription.totalAmount || 0;
      return acc;
    },
    {} as any
  );

  if (loading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2 p-4 lg:p-6">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                <Skeleton className="h-6 lg:h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-48 lg:h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircleIcon className="h-8 w-8 lg:h-12 lg:w-12 text-red-500 mb-4" />
        <h3 className="text-base lg:text-lg font-semibold mb-2">
          Failed to load data
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchData} size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <PackageIcon className="h-8 w-8 lg:h-12 lg:w-12 text-gray-400 mb-4" />
        <h3 className="text-base lg:text-lg font-semibold mb-2">
          No data available
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          No pharmacy data found for the selected date range.
        </p>
        <Button onClick={fetchData} size="sm">
          Refresh Data
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="text-lg lg:text-2xl font-bold text-green-600">
              AFs {safeData.summary.totalIncome.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {safeData.summary.totalPrescriptions} prescriptions
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="text-lg lg:text-2xl font-bold text-red-600">
              AFs {safeData.summary.totalExpenses.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {safeData.summary.totalExpenseItems} items
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div
              className={`text-lg lg:text-2xl font-bold ${
                profit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              AFs {profit.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground flex items-center">
              {profit >= 0 ? (
                <TrendingUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDownIcon className="h-3 w-3 mr-1" />
              )}
              Margin: {profitMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <Button
              onClick={handleExport}
              size="sm"
              className="w-full text-xs lg:text-sm"
            >
              <DownloadIcon className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              Export
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-lg lg:text-xl">Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {Object.entries(paymentMethodBreakdown).map(
              ([method, breakdownData]: [string, any]) => (
                <div
                  key={method}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div
                      className={`p-1 lg:p-2 rounded-full ${getPaymentMethodColor(
                        method
                      )}`}
                    >
                      {getPaymentMethodIcon(method)}
                    </div>
                    <div>
                      <div className="font-medium text-sm capitalize">
                        {method}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {breakdownData.count} presc.
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">
                      AFs {breakdownData.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {safeData.summary.totalIncome > 0
                        ? (
                            (breakdownData.total /
                              safeData.summary.totalIncome) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Prescriptions */}
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-lg lg:text-xl">
            Recent Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 lg:p-6">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Date
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Patient
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap hidden sm:table-cell">
                    Invoice
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Items
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Total
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap hidden md:table-cell">
                    Method
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeData.prescriptions.map((prescription) => (
                  <TableRow key={prescription._id || prescription.id}>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                      {prescription.createdAt
                        ? format(new Date(prescription.createdAt), "MMM dd")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 max-w-[80px] lg:max-w-none truncate">
                      <div>
                        <div className="font-medium truncate">
                          {prescription.patientName || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {prescription.patientPhone || "No phone"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 font-mono hidden sm:table-cell">
                      {prescription.invoiceNumber || "N/A"}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4">
                      {prescription.items?.length || 0} items
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                      AFs {prescription.totalAmount || 0}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 hidden md:table-cell">
                      <Badge
                        className={`text-xs ${getPaymentMethodColor(
                          prescription.paymentMethod || "unknown"
                        )}`}
                      >
                        <div className="flex items-center gap-1">
                          {getPaymentMethodIcon(
                            prescription.paymentMethod || "unknown"
                          )}
                          {prescription.paymentMethod || "unknown"}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4">
                      <Badge
                        variant={
                          prescription.status === "completed"
                            ? "default"
                            : prescription.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {prescription.status || "unknown"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {safeData.prescriptions.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No prescriptions found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
