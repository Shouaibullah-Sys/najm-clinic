// app/laboratory/dashboard/page.tsx

"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

// Import TanStack Table components and hooks
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface LabRecord {
  _id: string;
  amountPaid: number;
  testType: string;
  date: string;
  description?: string;
  doctorName?: string;
}

interface Expense {
  _id: string;
  amount: number;
  expenseType: string;
  date: string;
  description?: string;
}

interface TestTypeData {
  name: string;
  value: number;
}

interface ExpenseTypeData {
  name: string;
  value: number;
}

interface MonthlyData {
  name: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface Metrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  testTypeData: TestTypeData[];
  expenseTypeData: ExpenseTypeData[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Fetch data
  const { data: records, isLoading: recordsLoading } = useSWR<LabRecord[]>(
    `/api/laboratory/records?${new URLSearchParams({
      startDate: startDate?.toISOString() || "",
      endDate: endDate?.toISOString() || "",
    })}`,
    fetcher
  );

  const { data: expenses, isLoading: expensesLoading } = useSWR<Expense[]>(
    `/api/laboratory/expenses?${new URLSearchParams({
      startDate: startDate?.toISOString() || "",
      endDate: endDate?.toISOString() || "",
    })}`,
    fetcher
  );

  // Calculate metrics
  const metrics = useMemo<Metrics | null>(() => {
    const validRecords = Array.isArray(records) ? records : [];
    const validExpenses = Array.isArray(expenses) ? expenses : [];

    if (validRecords.length === 0 && validExpenses.length === 0) return null;

    const totalRevenue = validRecords.reduce(
      (sum: number, record: LabRecord) => sum + (record?.amountPaid || 0),
      0
    );
    const totalExpenses = validExpenses.reduce(
      (sum: number, expense: Expense) => sum + (expense?.amount || 0),
      0
    );
    const netProfit = totalRevenue - totalExpenses;

    // Group by test type - using Record<string, number> properly
    const testTypeData = validRecords.reduce(
      (acc: Record<string, number>, record: LabRecord) => {
        if (record?.testType && typeof record.amountPaid === "number") {
          acc[record.testType] =
            (acc[record.testType] || 0) + record.amountPaid;
        }
        return acc;
      },
      {} as Record<string, number>
    ); // Initialize as empty Record

    // Group by expense type - using Record<string, number> properly
    const expenseTypeData = validExpenses.reduce(
      (acc: Record<string, number>, expense: Expense) => {
        if (expense?.expenseType && typeof expense.amount === "number") {
          const type =
            expense.expenseType === "doctor_salary"
              ? "Doctor Salaries"
              : "Other Expenses";
          acc[type] = (acc[type] || 0) + expense.amount;
        }
        return acc;
      },
      {} as Record<string, number>
    ); // Initialize as empty Record

    function isLabRecord(item: LabRecord | Expense): item is LabRecord {
      return "testType" in item;
    }

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      testTypeData: Object.entries(testTypeData).map(([name, value]) => ({
        name,
        value,
      })),
      expenseTypeData: Object.entries(expenseTypeData).map(([name, value]) => ({
        name,
        value,
      })),
    };
  }, [records, expenses]);

  // Monthly data for line chart
  const monthlyData = useMemo<MonthlyData[]>(() => {
    const validRecords = Array.isArray(records) ? records : [];
    const validExpenses = Array.isArray(expenses) ? expenses : [];

    if (validRecords.length === 0 && validExpenses.length === 0) return [];

    // Group records by month - using Record<string, number> properly
    const monthlyRecords: Record<string, number> = {};
    validRecords.forEach((record: LabRecord) => {
      if (record?.date && typeof record.amountPaid === "number") {
        try {
          const month = format(new Date(record.date), "MMM yyyy");
          monthlyRecords[month] =
            (monthlyRecords[month] || 0) + record.amountPaid;
        } catch (error) {
          console.error("Error formatting record date:", error);
        }
      }
    });

    // Group expenses by month - using Record<string, number> properly
    const monthlyExpenses: Record<string, number> = {};
    validExpenses.forEach((expense: Expense) => {
      if (expense?.date && typeof expense.amount === "number") {
        try {
          const month = format(new Date(expense.date), "MMM yyyy");
          monthlyExpenses[month] =
            (monthlyExpenses[month] || 0) + expense.amount;
        } catch (error) {
          console.error("Error formatting expense date:", error);
        }
      }
    });

    // Combine data
    const allMonths = new Set([
      ...Object.keys(monthlyRecords),
      ...Object.keys(monthlyExpenses),
    ]);

    return Array.from(allMonths)
      .map((month) => ({
        name: month,
        revenue: monthlyRecords[month] || 0,
        expenses: monthlyExpenses[month] || 0,
        profit: (monthlyRecords[month] || 0) - (monthlyExpenses[month] || 0),
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [records, expenses]);

  // Combine records and expenses for the transactions table
  const combinedTransactions = useMemo(() => {
    const validRecords = Array.isArray(records) ? records : [];
    const validExpenses = Array.isArray(expenses) ? expenses : [];

    const recordsWithType = validRecords.map((record) => ({
      ...record,
      type: "record",
      displayAmount: record.amountPaid,
      displayType: "Revenue",
      displayName: record.testType,
    }));

    const expensesWithType = validExpenses.map((expense) => ({
      ...expense,
      type: "expense",
      displayAmount: -expense.amount,
      displayType:
        expense.expenseType === "doctor_salary" ? "Doctor Salary" : "Expense",
      displayName: expense.description || "Expense",
    }));

    return [...recordsWithType, ...expensesWithType].sort((a, b) => {
      try {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } catch {
        return 0;
      }
    });
  }, [records, expenses]);

  // Define columns for the transactions table
  const transactionColumns: ColumnDef<any>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        try {
          return format(new Date(row.original.date), "PP");
        } catch {
          return "Invalid Date";
        }
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        return row.original.displayType;
      },
    },
    {
      accessorKey: "name",
      header: "Description",
      cell: ({ row }) => {
        return (
          <div className="max-w-[200px] truncate">
            {row.original.displayName}
            {row.original.doctorName && (
              <div className="text-sm text-muted-foreground">
                Dr. {row.original.doctorName}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.original.displayAmount;
        const isPositive = amount >= 0;

        return (
          <div
            className={`font-bold ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : "-"}AFN {Math.abs(amount).toFixed(2)}
          </div>
        );
      },
    },
  ];

  // Setup TanStack Table with pagination for transactions
  const transactionsTable = useReactTable({
    data: combinedTransactions,
    columns: transactionColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10, // Set default page size to 10 rows
      },
    },
  });

  // Function to generate pagination items
  const generatePaginationItems = () => {
    const currentPage = transactionsTable.getState().pagination.pageIndex + 1;
    const pageCount = transactionsTable.getPageCount();
    const items = [];

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => transactionsTable.previousPage()}
          className={
            !transactionsTable.getCanPreviousPage()
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    // Page numbers with ellipsis for many pages
    if (pageCount <= 6) {
      // Show all pages if there are 6 or fewer
      for (let i = 1; i <= pageCount; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => transactionsTable.setPageIndex(i - 1)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => transactionsTable.setPageIndex(0)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is beyond 3
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Calculate which page numbers to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(pageCount - 1, currentPage + 1);

      // Adjust if we're near the start or end
      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= pageCount - 2) {
        startPage = pageCount - 3;
      }

      // Show the calculated page numbers
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => transactionsTable.setPageIndex(i - 1)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is not near the end
      if (currentPage < pageCount - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      items.push(
        <PaginationItem key={pageCount}>
          <PaginationLink
            onClick={() => transactionsTable.setPageIndex(pageCount - 1)}
            isActive={currentPage === pageCount}
            className="cursor-pointer"
          >
            {pageCount}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => transactionsTable.nextPage()}
          className={
            !transactionsTable.getCanNextPage()
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    return items;
  };

  if (recordsLoading || expensesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Laboratory Financial Dashboard</h1>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Start Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>End Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={(date) => (startDate ? date < startDate : false)}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="secondary"
            onClick={() => {
              setStartDate(undefined);
              setEndDate(undefined);
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              AFN {metrics?.totalRevenue?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              AFN {metrics?.totalExpenses?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                metrics?.netProfit && metrics.netProfit >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              AFN {metrics?.netProfit?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
                <Bar dataKey="profit" fill="#ffc658" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Test Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.testTypeData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {metrics?.testTypeData?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.expenseTypeData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {metrics?.expenseTypeData?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Transactions Table */}
            <div className="rounded-md border mb-4">
              <Table>
                <TableHeader>
                  {transactionsTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {transactionsTable.getRowModel().rows?.length ? (
                    transactionsTable.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={transactionColumns.length}
                        className="h-24 text-center"
                      >
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {transactionsTable.getRowModel().rows.length} of{" "}
                {combinedTransactions.length} transactions
              </div>

              <Pagination className="my-0">
                <PaginationContent>
                  {generatePaginationItems()}
                </PaginationContent>
              </Pagination>

              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                  value={`${transactionsTable.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    transactionsTable.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue
                      placeholder={
                        transactionsTable.getState().pagination.pageSize
                      }
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
