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
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StaffStats {
  glassStock: {
    totalItems: number;
    totalQuantity: number;
    lowStock: number;
  };
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  todaysConsultations: number;
  weeklyData: Array<{ day: string; orders: number; revenue: number }>;
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

interface RecentOrder {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    glassProduct: {
      productName: string;
    };
    quantity: number;
  }>;
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
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [glassTypeData, setGlassTypeData] = useState<GlassTypeData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStaffData();
    fetchLowStock();
    fetchGlassTypes();
  }, []);

  const fetchStaffData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/dashboard/staff/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setRecentOrders(data.recentOrders || []);
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
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
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

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Staff Dashboard
        </h2>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Glass Stock
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats?.glassStock?.totalQuantity?.toLocaleString() || "0"}{" "}
                  sqm
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.glassStock?.totalItems || 0} items
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Warehouse className="h-6 w-6 text-blue-600" />
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
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button
                size="sm"
                className="w-full"
                onClick={() => router.push("/glass/orders/new")}
              >
                New Order
              </Button>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-xs text-gray-500 mt-1">
                  From glass sales & consultations
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+12.5% from yesterday</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Consultations
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats?.todaysConsultations || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Today's appointments
                </p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <Eye className="h-6 w-6 text-pink-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/ophthalmologist/records/new")}
              >
                Add Record
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
              <CardDescription>Orders vs Revenue trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {stats?.weeklyData && stats.weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.weeklyData}>
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
                      <Line
                        type="monotone"
                        dataKey="orders"
                        name="Orders"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue ($)"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No weekly data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.slice(0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded">
                          <ShoppingCart className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {order.invoiceNumber}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {order.customerName} • {order.items?.length || 0}{" "}
                            items
                          </p>
                          <p className="text-xs text-gray-400">
                            {getTimeAgo(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${order.totalAmount.toLocaleString()}
                        </p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent orders
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => router.push("/glass/orders")}
              >
                View All Orders
              </Button>
            </CardContent>
          </Card>
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
                  lowStockItems.slice(0, 3).map((item) => (
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
                      <p className="text-xs text-gray-500 truncate">
                        {item.glassType} • ${item.unitPrice}/sqm
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No low stock items
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => router.push("/glass/stock")}
              >
                View All Stock
              </Button>
            </CardContent>
          </Card>

          {/* Glass Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Glass Types</CardTitle>
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
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {glassTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No glass type data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
