"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import AdminDashboard from "./components/admin/AdminCeoDashboard";
import StaffDashboard from "@/components/staff/StaffDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Warehouse,
  ShoppingCart,
  DollarSign,
  Users,
  FileText,
  Eye,
  TrendingUp,
  Package,
  Clock,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DashboardStats {
  todaysRevenue: number;
  todaysExpenses: number;
  todaysOphthalmologyRevenue: number;
  pendingOrders: number;
  totalStockValue: number;
  totalStockQuantity: number;
  lowStockItemsCount: number;
  todaysOrdersCount: number;
  todaysConsultations: number;
  stats: {
    revenue: { today: number; change: string };
    orders: { today: number; pending: number; change: string };
    stock: {
      totalItems: number;
      totalQuantity: number;
      totalValue: number;
      lowStock: number;
    };
    ophthalmology: { today: number; revenue: number; change: string };
  };
}

interface QuickStats {
  weeklyData: Array<{ date: string; orders: number; revenue: number }>;
  weeklyRevenue: number;
  glassTypeData: Array<{ name: string; value: number; color: string }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    time: string;
    icon: string;
  }>;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useSWR<DashboardStats>(
    "/api/dashboard/stats",
    fetcher,
    { refreshInterval: 300000 } // Refresh every 5 minutes
  );

  const { data: quickStats, isLoading: quickStatsLoading } = useSWR<QuickStats>(
    "/api/dashboard/quick-stats",
    fetcher
  );

  const { data: lowStockItems, isLoading: lowStockLoading } = useSWR(
    "/api/dashboard/low-stock",
    fetcher
  );

  useEffect(() => {
    if (!authLoading && !initialized) {
      if (!isAuthenticated) {
        router.push("/login");
      }
      setInitialized(true);
    }
  }, [isAuthenticated, authLoading, router, initialized]);

  const isLoading =
    authLoading || statsLoading || quickStatsLoading || lowStockLoading;

  if (isLoading || !initialized) {
    return (
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64 mt-8" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />;
      case "expense":
        return <FileText className="h-4 w-4" />;
      case "record":
        return <Eye className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date safely
  const formatDate = (date: Date, formatType: "long" | "short" = "long") => {
    try {
      if (formatType === "long") {
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
      }
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
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

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Welcome back,{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {user?.name}
              </span>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                {user?.role === "admin" ? "Administrator" : "Staff"}
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatDate(new Date(), "long")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Refresh data
                window.location.reload();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(new Date(), "short")}
            </Button>
          </div>
        </div>
      </div>

      {/* Role-based Dashboard */}
      {user?.role === "admin" && <AdminDashboard />}
      {user?.role === "staff" && <StaffDashboard />}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Today's Revenue
                </p>
                <p className="text-2xl font-bold mt-2">
                  ${stats?.todaysRevenue?.toLocaleString() || "0"}
                </p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>
                    +{stats?.stats.revenue.change || "12.5%"} from yesterday
                  </span>
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
                <p className="text-sm font-medium text-gray-500">
                  Total Stock Value
                </p>
                <p className="text-2xl font-bold mt-2">
                  ${stats?.totalStockValue?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.totalStockQuantity?.toLocaleString() || "0"} sqm
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Warehouse className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats?.pendingOrders || 0}
                </p>
                <div className="flex items-center text-xs mt-1">
                  <AlertCircle className="h-3 w-3 mr-1 text-orange-500" />
                  <span className="text-orange-600">
                    {stats?.lowStockItemsCount || 0} low stock items
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Today's Consultations
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats?.todaysConsultations || 0}
                </p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>+{stats?.stats.ophthalmology.change || "15.3%"}</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {quickStats?.weeklyData && quickStats.weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={quickStats.weeklyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Glass Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Glass Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {quickStats?.glassTypeData &&
              quickStats.glassTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={quickStats.glassTypeData}
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
                      {quickStats.glassTypeData.map((entry, index) => (
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

      {/* Recent Activities & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickStats?.recentActivities &&
              quickStats.recentActivities.length > 0 ? (
                quickStats.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {getIconForType(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(activity.time)}
                      </p>
                    </div>
                    <div className="text-right">
                      {activity.amount && (
                        <p className="text-sm font-semibold">
                          ${activity.amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent activities
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Low Stock Alerts
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/glass/stock")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems?.lowStockItems &&
              lowStockItems.lowStockItems.length > 0 ? (
                lowStockItems.lowStockItems.map((item: any) => (
                  <div key={item._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.glassType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {item.current} sqm
                        </p>
                        <p className="text-xs text-gray-500">
                          ${item.unitPrice}/sqm
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.percentage < 10
                            ? "bg-red-500"
                            : item.percentage < 20
                            ? "bg-orange-500"
                            : "bg-yellow-500"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No low stock items
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
