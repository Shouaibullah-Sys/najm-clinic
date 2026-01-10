"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Warehouse,
  ShoppingCart,
  DollarSign,
  Eye,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  TrendingDown,
  Calendar,
  BarChart,
  Layers,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart as RechartsBar,
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
  AreaChart,
  Area,
} from "recharts";

interface StaffStats {
  glassStock: {
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    lowStock: number;
  };
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  todayExpenses: number;
  weeklyData: Array<{
    day: string;
    orders: number;
    revenue: number;
    expenses: number;
  }>;
  recentOrders: Array<{
    _id: string;
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: Array<{
      glassProduct: string;
      quantity: number;
    }>;
  }>;
  recentExpenses: Array<{
    _id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    status: string;
  }>;
}

interface LowStockItem {
  _id: string;
  name: string;
  glassType: string;
  current: number;
  threshold: number;
  unitPrice: number;
  batchNumber: string;
  percentage: number;
}

interface GlassTypeData {
  name: string;
  value: number;
  color: string;
}

export default function StaffDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [glassTypeData, setGlassTypeData] = useState<GlassTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  useEffect(() => {
    fetchStaffData();
    fetchLowStock();
    fetchGlassTypes();
  }, [timeRange]);

  const fetchStaffData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `/api/dashboard/staff/stats?range=${timeRange}`
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching staff data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      const response = await fetch("/api/dashboard/low-stock");
      if (response.ok) {
        const data = await response.json();
        setLowStockItems(data.lowStockItems || []);
      }
    } catch (error) {
      console.error("Error fetching low stock:", error);
    }
  };

  const fetchGlassTypes = async () => {
    try {
      const response = await fetch("/api/dashboard/glass-types");
      if (response.ok) {
        const data = await response.json();
        setGlassTypeData(data || []);
      } else {
        // Fallback data if API fails
        setGlassTypeData([
          { name: "Clear Glass", value: 35, color: "#3B82F6" },
          { name: "Tempered", value: 25, color: "#10B981" },
          { name: "Laminated", value: 20, color: "#8B5CF6" },
          { name: "Mirror", value: 15, color: "#F59E0B" },
          { name: "Other", value: 5, color: "#EF4444" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching glass types:", error);
      // Fallback data
      setGlassTypeData([
        { name: "Clear Glass", value: 35, color: "#3B82F6" },
        { name: "Tempered", value: 25, color: "#10B981" },
        { name: "Laminated", value: 20, color: "#8B5CF6" },
        { name: "Mirror", value: 15, color: "#F59E0B" },
        { name: "Other", value: 5, color: "#EF4444" },
      ]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
      case "installed":
      case "paid":
      case "approved":
        return "bg-green-100 text-green-800";
      case "processing":
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "pending":
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid time";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return formatDate(dateString);
      }
    } catch (error) {
      return "Just now";
    }
  };

  const handleRefresh = () => {
    fetchStaffData();
    fetchLowStock();
    fetchGlassTypes();
  };

  const calculateNetProfit = () => {
    if (!stats) return 0;
    return stats.todayRevenue - stats.todayExpenses;
  };

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? "text-green-600" : "text-red-600";
  };

  const getProfitIcon = (profit: number) => {
    return profit >= 0 ? (
      <TrendingUp className="h-3 w-3 mr-1" />
    ) : (
      <TrendingDown className="h-3 w-3 mr-1" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const netProfit = calculateNetProfit();
  const profitPercentage = stats?.todayRevenue
    ? (netProfit / stats.todayRevenue) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Glass Shop Dashboard
          </h2>
          <p className="text-sm text-gray-500">
            Manage inventory, orders, and expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg">
            <button
              className={`px-3 py-1 text-sm ${
                timeRange === "day"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600"
              }`}
              onClick={() => setTimeRange("day")}
            >
              Day
            </button>
            <button
              className={`px-3 py-1 text-sm ${
                timeRange === "week"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600"
              }`}
              onClick={() => setTimeRange("week")}
            >
              Week
            </button>
            <button
              className={`px-3 py-1 text-sm ${
                timeRange === "month"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600"
              }`}
              onClick={() => setTimeRange("month")}
            >
              Month
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Today's Revenue
                </p>
                <p className="text-2xl font-bold mt-2">
                  ${(stats?.todayRevenue || 0).toLocaleString()}
                </p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>From glass sales</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button
                size="sm"
                className="w-full"
                onClick={() => router.push("/glass/orders/new")}
              >
                New Sale
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <p
                  className={`text-2xl font-bold mt-2 ${getProfitColor(
                    netProfit
                  )}`}
                >
                  ${netProfit.toLocaleString()}
                </p>
                <div
                  className={`flex items-center text-xs mt-1 ${getProfitColor(
                    netProfit
                  )}`}
                >
                  {getProfitIcon(netProfit)}
                  <span>{profitPercentage.toFixed(1)}% margin</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Revenue: ${(stats?.todayRevenue || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                Expenses: ${(stats?.todayExpenses || 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Glass Inventory
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats?.glassStock?.totalQuantity?.toLocaleString() || "0"}{" "}
                  sqm
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ${(stats?.glassStock?.totalValue || 0).toLocaleString()} value
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Warehouse className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs">
                <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-orange-600">
                  {stats?.glassStock?.lowStock || 0} low stock items
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Today's Orders
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats?.todayOrders || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.pendingOrders || 0} pending
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/glass/orders")}
              >
                View Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance</CardTitle>
              <CardDescription>Revenue vs Expenses trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {stats?.weeklyData && stats.weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke="#EF4444"
                        fill="#EF4444"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No financial data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.slice(0, 4).map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-blue-100 rounded">
                            <ShoppingCart className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {order.invoiceNumber}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {order.customerName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${order.totalAmount.toLocaleString()}
                          </p>
                          <Badge
                            className={`text-xs ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No recent orders
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => router.push("/glass/orders")}
                >
                  View All Orders
                </Button>
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Latest business expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentExpenses && stats.recentExpenses.length > 0 ? (
                    stats.recentExpenses.slice(0, 4).map((expense) => (
                      <div
                        key={expense._id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-red-100 rounded">
                            <FileText className="h-3 w-3 text-red-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {expense.category}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {expense.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">
                            -${expense.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(expense.date)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No recent expenses
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => router.push("/expenses")}
                >
                  View All Expenses
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems && lowStockItems.length > 0 ? (
                  lowStockItems.slice(0, 4).map((item) => (
                    <div key={item._id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.current} sqm
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            item.percentage < 10
                              ? "bg-red-500"
                              : item.percentage < 20
                              ? "bg-orange-500"
                              : "bg-yellow-500"
                          }`}
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{item.glassType}</span>
                        <span>${item.unitPrice}/sqm</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No low stock items
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push("/glass/stock")}
                >
                  View Stock
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push("/glass/stock/add")}
                >
                  Restock
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Glass Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Glass Types</CardTitle>
              <CardDescription>Inventory by glass type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {glassTypeData && glassTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={glassTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {glassTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} sqm`, "Quantity"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No glass type data
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {glassTypeData.slice(0, 4).map((type) => (
                  <div key={type.name} className="flex items-center space-x-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-xs truncate">{type.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
