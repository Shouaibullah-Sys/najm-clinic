// components/admin/AdminDashboard.tsx
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
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Warehouse,
  FileText,
  Eye,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  PieChart as PieChartIcon,
  Download,
  Filter,
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AdminStats {
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyOrders: number;
  glassStockValue: number;
  activeUsers: number;
  pendingApprovals: number;
  profit: number;
  todayCash: any;
  weeklySales: any[];
}

interface UserStat {
  _id: string;
  count: number;
  active: number;
  approved: number;
}

interface RevenueTrend {
  revenueTrend: any[];
  orderTrend: any[];
  expenseTrend: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    fetchAdminData();
    fetchUserStats();
    fetchRevenueTrend();
  }, [timeRange]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch("/api/dashboard/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/dashboard/admin/user-stats");
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.userStats);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchRevenueTrend = async () => {
    try {
      const response = await fetch("/api/dashboard/admin/revenue-trend");
      if (response.ok) {
        const data = await response.json();
        setRevenueTrend(data);
      }
    } catch (error) {
      console.error("Error fetching revenue trend:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRevenueGrowth = () => {
    if (!revenueTrend?.revenueTrend || revenueTrend.revenueTrend.length < 2)
      return 0;

    const recent = revenueTrend.revenueTrend.slice(-2);
    const current = recent[1]?.total || 0;
    const previous = recent[0]?.total || 0;

    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
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

  const revenueData =
    revenueTrend?.revenueTrend.map((item) => ({
      date: item._id,
      revenue: item.total,
      consultations: item.count,
    })) || [];

  const expenseData =
    revenueTrend?.expenseTrend.map((item) => ({
      date: item._id,
      expenses: item.total,
    })) || [];

  const userDistribution = [
    {
      name: "Admin",
      value: userStats.find((s) => s._id === "admin")?.count || 0,
      color: "#3B82F6",
    },
    {
      name: "Staff",
      value: userStats.find((s) => s._id === "staff")?.count || 0,
      color: "#10B981",
    },
  ];

  const monthlyComparison = [
    { month: "Jan", revenue: 42000, expenses: 28000 },
    { month: "Feb", revenue: 45000, expenses: 29000 },
    { month: "Mar", revenue: 48000, expenses: 31000 },
    { month: "Apr", revenue: 52000, expenses: 33000 },
    { month: "May", revenue: 55000, expenses: 35000 },
    { month: "Jun", revenue: 58000, expenses: 37000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Business Overview</h2>
          <p className="text-gray-500">
            Comprehensive analysis of your glass business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange("week")}
          >
            Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange("year")}
          >
            Year
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </p>
                <div className="flex items-center mt-1 text-sm">
                  {getRevenueGrowth() >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={
                      getRevenueGrowth() >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {Math.abs(getRevenueGrowth()).toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-2">from last month</span>
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
                  Monthly Profit
                </p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(stats?.profit || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Revenue: {formatCurrency(stats?.monthlyRevenue || 0)}
                </p>
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
                  Glass Stock Value
                </p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(stats?.glassStockValue || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.monthlyOrders} orders this month
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Warehouse className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Users
                </p>
                <p className="text-2xl font-bold mt-2">{stats?.activeUsers}</p>
                <div className="flex items-center mt-1">
                  <Badge variant="destructive" className="text-xs">
                    {stats?.pendingApprovals} pending
                  </Badge>
                  <span className="text-xs text-gray-500 ml-2">approvals</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value) => [`$${value}`, "Amount"]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue Trend</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    tickFormatter={(value) =>
                      value.split("-").slice(1).join("/")
                    }
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>By role and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistribution}
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
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold">{stats?.activeUsers}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Pending Approvals</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.pendingApprovals}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cash Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Today's Cash Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Opening Balance</span>
                <span className="font-semibold">
                  ${stats?.todayCash?.openingBalance || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cash Sales</span>
                <span className="font-semibold text-green-600">
                  ${stats?.todayCash?.cashSales || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expenses</span>
                <span className="font-semibold text-red-600">
                  ${stats?.todayCash?.expenses || "0"}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>Closing Balance</span>
                  <span>${stats?.todayCash?.closingBalance || "0"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Fulfillment Rate</span>
                <span className="font-semibold text-green-600">94.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="font-semibold text-blue-600">4.8/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Stock Turnover</span>
                <span className="font-semibold text-orange-600">2.3x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-semibold text-purple-600">$850</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => router.push("/admin/users")}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/admin/settings")}
              >
                <Shield className="h-4 w-4 mr-2" />
                System Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/admin/reports")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Reports
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/admin/audit")}
              >
                <Clock className="h-4 w-4 mr-2" />
                View Audit Log
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            Important Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">System Backup Required</p>
                  <p className="text-sm text-gray-600">
                    Last backup was 6 days ago
                  </p>
                </div>
              </div>
              <Button size="sm">Backup Now</Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Monthly Reports Due</p>
                  <p className="text-sm text-gray-600">
                    Generate monthly financial reports
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Generate
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Software Update Available</p>
                  <p className="text-sm text-gray-600">
                    Version 2.1.0 ready to install
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
