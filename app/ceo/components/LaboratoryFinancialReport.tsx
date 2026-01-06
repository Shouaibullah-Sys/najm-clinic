// app/ceo/dashboard/components/LaboratoryFinancialReport.tsx
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
import { DownloadIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { toast } from "sonner";

interface LaboratoryReport {
  records: any[];
  expenses: any[];
  dailyData: any[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    totalRecords: number;
    totalExpenseItems: number;
  };
}

interface LaboratoryFinancialReportProps {
  dateRange: DateRange;
}

export default function LaboratoryFinancialReport({
  dateRange,
}: LaboratoryFinancialReportProps) {
  const [data, setData] = useState<LaboratoryReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append("endDate", dateRange.to.toISOString());
      }

      const response = await fetch(`/api/ceo/laboratory-report?${params}`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching laboratory report:", error);
      toast.error("Failed to load laboratory report");
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

      const response = await fetch(`/api/ceo/export-laboratory?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laboratory-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Laboratory report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading laboratory report...</div>;
  }

  if (!data) {
    return <div className="p-4 text-center">No data available</div>;
  }

  const profit = data.summary.totalIncome - data.summary.totalExpenses;
  const profitMargin =
    data.summary.totalIncome > 0
      ? (profit / data.summary.totalIncome) * 100
      : 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Summary Cards - Mobile responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="text-lg lg:text-2xl font-bold text-green-600">
              AFs {data.summary.totalIncome.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.summary.totalRecords} records
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
              Afs {data.summary.totalExpenses.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.summary.totalExpenseItems} items
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
              Afs {profit.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground flex items-center mt-1">
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

      {/* Recent Records - Mobile responsive table */}
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-lg lg:text-xl">
            Recent Laboratory Records
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
                    Test Type
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Charged
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Paid
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap hidden md:table-cell">
                    Recorded By
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.slice(0, 10).map((record) => (
                  <TableRow key={record._id}>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                      {format(new Date(record.date), "MMM dd")}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 max-w-[80px] lg:max-w-none truncate">
                      {record.patientName}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 hidden sm:table-cell max-w-[100px] lg:max-w-none truncate">
                      {record.testType}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                      AFs {record.amountCharged}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                      Afs {record.amountPaid}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 hidden md:table-cell max-w-[80px] lg:max-w-none truncate">
                      {record.recordedBy?.name || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.records.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No records found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses - Mobile responsive table */}
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-lg lg:text-xl">
            Recent Laboratory Expenses
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
                    Description
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap hidden sm:table-cell">
                    Type
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap hidden md:table-cell">
                    Recorded By
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.expenses.slice(0, 10).map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                      {format(new Date(expense.date), "MMM dd")}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 max-w-[100px] lg:max-w-none truncate">
                      {expense.description}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 hidden sm:table-cell">
                      <Badge
                        variant={
                          expense.expenseType === "doctor_salary"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {expense.expenseType.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                      AFs {expense.amount}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 hidden md:table-cell max-w-[80px] lg:max-w-none truncate">
                      {expense.recordedBy?.name || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.expenses.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No expenses found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile-friendly summary for small screens */}
      <div className="block lg:hidden">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Quick Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Income:</span>
              <span className="text-sm font-medium text-green-600">
                AFs {data.summary.totalIncome.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expenses:</span>
              <span className="text-sm font-medium text-red-600">
                AFs {data.summary.totalExpenses.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Profit:</span>
              <span
                className={`text-sm font-medium ${
                  profit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                AFs {profit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Margin:</span>
              <span className="text-sm font-medium flex items-center">
                {profitMargin.toFixed(1)}%
                {profit >= 0 ? (
                  <TrendingUpIcon className="h-3 w-3 ml-1 text-green-600" />
                ) : (
                  <TrendingDownIcon className="h-3 w-3 ml-1 text-red-600" />
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
