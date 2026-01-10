"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Eye,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface AdminStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalOrders: number;
  totalStockValue: number;
  totalConsultations: number;
  pendingOrders: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  topProducts: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
  }>;
}

export default function AdminCeoDashboard() {
  const router = useRouter();
  const { data: adminStats, isLoading } = useSWR<AdminStats>(
    "/api/dashboard/admin/stats",
    fetcher,
    { refreshInterval: 600000 } // Refresh every 10 minutes
  );

  const formatMonthYear = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 mb-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const quickActions = [
    {
      title: "Add New Product",
      description: "Add new glass product to inventory",
      icon: <Package className="h-6 w-6" />,
      action: () => router.push("/glass/stock/add"),
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Create Order",
      description: "Create new customer order",
      icon: <FileText className="h-6 w-6" />,
      action: () => router.push("/glass/orders/new"),
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Add Record",
      description: "Add ophthalmology record",
      icon: <Eye className="h-6 w-6" />,
      action: () => router.push("/ophthalmologist/records/new"),
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "View Reports",
      description: "View detailed analytics",
      icon: <BarChart3 className="h-6 w-6" />,
      action: () => router.push("/reports"),
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-8 mb-8">
      {/* CEO Overview Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Executive Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Business performance and key metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            {formatMonthYear()}
          </Button>
          <Button>Export Report</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold mt-2">
                  ${adminStats?.totalRevenue?.toLocaleString() || "0"}
                </p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+12.5% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <p className="text-2xl font-bold mt-2">
                  ${adminStats?.netProfit?.toLocaleString() || "0"}
                </p>
                <div
                  className={`flex items-center text-xs mt-1 ${
                    adminStats?.netProfit && adminStats.netProfit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {adminStats?.netProfit && adminStats.netProfit >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+8.3% growth</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span>-{Math.abs(adminStats?.netProfit || 0)}%</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>
                <p className="text-2xl font-bold mt-2">
                  {adminStats?.totalOrders || 0}
                </p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <span>{adminStats?.pendingOrders || 0} pending</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Stock Value
                </p>
                <p className="text-2xl font-bold mt-2">
                  ${adminStats?.totalStockValue?.toLocaleString() || "0"}
                </p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Package className="h-3 w-3 mr-1" />
                  <span>Inventory value</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {adminStats?.monthlyData && adminStats.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={adminStats.monthlyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Expenses"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stackId="1"
                      stroke="#ffc658"
                      fill="#ffc658"
                      name="Profit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No monthly data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {adminStats?.expenseBreakdown &&
              adminStats.expenseBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={adminStats.expenseBreakdown}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#8884d8" name="Amount ($)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No expense data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
