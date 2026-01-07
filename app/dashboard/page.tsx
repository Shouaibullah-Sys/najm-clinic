"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import AdminDashboard from "./components/admin/AdminCeoDashborad";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading && !initialized) {
      if (!isAuthenticated) {
        router.push("/login");
      }
      setInitialized(true);
    }
  }, [isAuthenticated, isLoading, router, initialized]);

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

  // Quick Stats for dashboard
  const quickStats = [
    {
      title: "Total Glass Stock",
      value: "2,548",
      icon: <Warehouse className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12.5%",
      period: "from last month",
    },
    {
      title: "Pending Orders",
      value: "18",
      icon: <ShoppingCart className="h-5 w-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "+3",
      period: "new today",
    },
    {
      title: "Today's Revenue",
      value: "$4,850",
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8.2%",
      period: "from yesterday",
    },
    {
      title: "Consultations Today",
      value: "24",
      icon: <Eye className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+6",
      period: "patients seen",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "order",
      description: "New order from ABC Construction",
      time: "10 min ago",
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      id: 2,
      type: "stock",
      description: "Glass stock updated - 500 sqm",
      time: "30 min ago",
      icon: <Warehouse className="h-4 w-4" />,
    },
    {
      id: 3,
      type: "consultation",
      description: "Dr. Smith completed consultation",
      time: "1 hour ago",
      icon: <Eye className="h-4 w-4" />,
    },
    {
      id: 4,
      type: "payment",
      description: "Payment received - $2,500",
      time: "2 hours ago",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      id: 5,
      type: "expense",
      description: "Monthly rent paid - $1,200",
      time: "3 hours ago",
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  const lowStockItems = [
    {
      id: 1,
      name: "Clear Float Glass 6mm",
      current: 45,
      threshold: 50,
      unit: "sqm",
    },
    {
      id: 2,
      name: "Tempered Glass 8mm",
      current: 32,
      threshold: 60,
      unit: "sqm",
    },
    {
      id: 3,
      name: "Laminated Safety Glass",
      current: 28,
      threshold: 40,
      unit: "sqm",
    },
    {
      id: 4,
      name: "Mirror Glass 4mm",
      current: 15,
      threshold: 30,
      unit: "sqm",
    },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
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
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Role-based Dashboard */}
      {user?.role === "admin" && <AdminDashboard />}
      {user?.role === "staff" && <StaffDashboard />}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
                  {stat.icon}
                </div>
                <div
                  className={`text-sm font-medium ${
                    parseFloat(stat.change) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.period}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Activity & Low Stock */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="border-0 shadow-sm border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Low Stock Items
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">
                  Restock Now
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.map((item) => {
                  const percentage = (item.current / item.threshold) * 100;
                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.current} {item.unit}
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            percentage < 30
                              ? "bg-red-500"
                              : percentage < 50
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          Current: {item.current} {item.unit}
                        </span>
                        <span>
                          Threshold: {item.threshold} {item.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Upcoming Tasks */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => router.push("/glass/orders/new")}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-xs">New Order</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => router.push("/glass/stock/add")}
                >
                  <Package className="h-6 w-6" />
                  <span className="text-xs">Add Stock</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => router.push("/ophthalmologist/records/new")}
                >
                  <Eye className="h-6 w-6" />
                  <span className="text-xs">Add Record</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                  onClick={() => router.push("/expenses/new")}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-xs">Add Expense</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Order #ORD-001</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due today
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Process
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Supplier Payment</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due in 2 days
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Pay Now
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Low Stock Alert</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        4 items need restocking
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Monthly Revenue</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +15.2%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">New Customers</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    +24
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Orders Fulfilled</span>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    +89%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Consultations</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    +32%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
