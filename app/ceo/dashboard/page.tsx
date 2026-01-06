// app/ceo/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  CalendarIcon,
  DownloadIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  PackageIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Import your auth store
import { useAuthStore, UserRole } from "@/store/useAuthStore";

// Components
import LaboratoryFinancialReport from "../components/LaboratoryFinancialReport";
import PharmacyFinancialReport from "../components/PharmacyFinancialReport";
import MedicineStockReport from "../components/MedicineStockReport";
import PrescriptionHistory from "../components/PrescriptionHistory";
import FinancialCharts from "../components/FinancialCharts";

interface DashboardStats {
  laboratory: {
    income: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  };
  pharmacy: {
    income: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  };
  medicineAlerts: {
    expiringSoon: number;
    expired: number;
    lowStock: number;
  };
  totalPrescriptions: number;
}

// Pagination interface for child components
export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationProps {
  pagination: PaginationConfig;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export default function CEODashboardPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    initialize,
    logout,
  } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // Pagination states for different report sections
  const [pharmacyPagination, setPharmacyPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [laboratoryPagination, setLaboratoryPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [prescriptionPagination, setPrescriptionPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [medicinePagination, setMedicinePagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
  });

  // Create a safe date range that's never undefined
  const safeDateRange: DateRange = {
    from: dateRange?.from || startOfMonth(new Date()),
    to: dateRange?.to || endOfMonth(new Date()),
  };

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      await initialize();

      if (!authLoading) {
        if (!isAuthenticated) {
          router.push("/login");
          return;
        }

        // Check if user has CEO role
        if (user?.role !== "ceo" && user?.role !== "admin") {
          router.push("/unauthorized");
          return;
        }

        // If authenticated and authorized, fetch dashboard data
        fetchDashboardData();
      }
    };

    checkAuth();
  }, [isAuthenticated, authLoading, user?.role, router, initialize]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString());
      }

      // Get access token from auth store or cookies
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        toast.error("Authentication required");
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/ceo/dashboard?${params}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        try {
          await useAuthStore.getState().refreshAccessToken();
          // Retry the request with new token
          const newToken = useAuthStore.getState().accessToken;
          const retryResponse = await fetch(`/api/ceo/dashboard?${params}`, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });

          if (!retryResponse.ok) throw new Error("Retry failed");

          const data = await retryResponse.json();
          setStats(data);
        } catch (refreshError) {
          toast.error("Session expired. Please login again.");
          logout();
          router.push("/login");
          return;
        }
      } else if (response.status === 403) {
        router.push("/unauthorized");
        return;
      } else if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      } else {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: "laboratory" | "pharmacy" | "all") => {
    try {
      const { accessToken } = useAuthStore.getState();

      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }

      const params = new URLSearchParams();
      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString());
      }
      params.append("type", type);

      const response = await fetch(`/api/ceo/export?${params}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ceo-report-${type}-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  // Pagination handlers
  const handlePharmacyPageChange = (page: number) => {
    setPharmacyPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleLaboratoryPageChange = (page: number) => {
    setLaboratoryPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePrescriptionPageChange = (page: number) => {
    setPrescriptionPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleMedicinePageChange = (page: number) => {
    setMedicinePagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (section: string, itemsPerPage: number) => {
    switch (section) {
      case "pharmacy":
        setPharmacyPagination((prev) => ({
          ...prev,
          itemsPerPage,
          currentPage: 1,
        }));
        break;
      case "laboratory":
        setLaboratoryPagination((prev) => ({
          ...prev,
          itemsPerPage,
          currentPage: 1,
        }));
        break;
      case "prescription":
        setPrescriptionPagination((prev) => ({
          ...prev,
          itemsPerPage,
          currentPage: 1,
        }));
        break;
      case "medicine":
        setMedicinePagination((prev) => ({
          ...prev,
          itemsPerPage,
          currentPage: 1,
        }));
        break;
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Show unauthorized message if user doesn't have CEO role
  if (
    !authLoading &&
    isAuthenticated &&
    user?.role !== "ceo" &&
    user?.role !== "admin"
  ) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <ShieldAlertIcon className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access the CEO Dashboard.
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className=" cursor-pointer"
          >
            Go to Your Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Show main loading state
  if (loading && !stats) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with User Info */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">CEO Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of laboratory and pharmacy operations
            {user && (
              <span className="ml-2 text-sm bg-primary/10 px-2 py-1 rounded">
                Welcome, {user.name} ({user.role})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => handleExport("all")}
            variant="outline"
            className=" cursor-pointer"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export All Reports
          </Button>
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            className=" cursor-pointer"
          >
            <RefreshCwIcon className="h-4 w-4 mr-2 cursor-pointer" />
            Refresh
          </Button>
          <Button
            onClick={logout}
            variant="outline"
            className="text-red-600 cursor-pointer"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Date Range Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              className="w-full sm:w-auto"
            />
            <div className="flex flex-col gap-2">
              <div className="text-sm text-muted-foreground">
                Selected:{" "}
                {safeDateRange.from ? format(safeDateRange.from, "PPP") : ""} -{" "}
                {safeDateRange.to ? format(safeDateRange.to, "PPP") : ""}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className=" cursor-pointer"
                  onClick={() =>
                    setDateRange({
                      from: subDays(new Date(), 7),
                      to: new Date(),
                    })
                  }
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  className=" cursor-pointer"
                  size="sm"
                  onClick={() =>
                    setDateRange({
                      from: startOfMonth(new Date()),
                      to: endOfMonth(new Date()),
                    })
                  }
                >
                  This Month
                </Button>
                <Button
                  variant="outline"
                  className=" cursor-pointer"
                  size="sm"
                  onClick={() =>
                    setDateRange({
                      from: subDays(new Date(), 30),
                      to: new Date(),
                    })
                  }
                >
                  Last 30 Days
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Laboratory Metrics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Laboratory Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                AFs {stats.laboratory.income.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                Profit: AFs {stats.laboratory.profit.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Laboratory Profit Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  stats.laboratory.profitMargin >= 20
                    ? "text-green-600"
                    : stats.laboratory.profitMargin >= 10
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {stats.laboratory.profitMargin.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Expenses: AFs {stats.laboratory.expenses.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Pharmacy Metrics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Pharmacy Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                AFs {stats.pharmacy.income.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                Profit: AFs {stats.pharmacy.profit.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Pharmacy Profit Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  stats.pharmacy.profitMargin >= 20
                    ? "text-green-600"
                    : stats.pharmacy.profitMargin >= 10
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {stats.pharmacy.profitMargin.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Expenses: AFs {stats.pharmacy.expenses.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Medicine Alerts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangleIcon className="h-4 w-4 mr-1 text-amber-500" />
                Medicine Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Expiring Soon:</span>
                  <span className="font-semibold text-amber-600">
                    {stats.medicineAlerts.expiringSoon}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Expired:</span>
                  <span className="font-semibold text-red-600">
                    {stats.medicineAlerts.expired}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Low Stock:</span>
                  <span className="font-semibold text-orange-600">
                    {stats.medicineAlerts.lowStock}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <PackageIcon className="h-4 w-4 mr-1 text-blue-500" />
                Total Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalPrescriptions.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Within selected date range
              </div>
            </CardContent>
          </Card>

          {/* Overall Performance */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-semibold">
                    Total Revenue: AFs
                    {(
                      stats.laboratory.income + stats.pharmacy.income
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Combined laboratory and pharmacy
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    Total Profit: AFs
                    {(
                      stats.laboratory.profit + stats.pharmacy.profit
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Combined net profit
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Reports */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="charts" className=" cursor-pointer">
            Financial
          </TabsTrigger>
          <TabsTrigger value="laboratory" className=" cursor-pointer">
            Laboratory
          </TabsTrigger>
          <TabsTrigger value="pharmacy" className=" cursor-pointer">
            Pharmacy
          </TabsTrigger>
          <TabsTrigger value="medicine" className=" cursor-pointer">
            Medicine
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className=" cursor-pointer">
            Prescription
          </TabsTrigger>
        </TabsList>
        <TabsContent value="charts">
          <FinancialCharts dateRange={safeDateRange} />
        </TabsContent>
        <TabsContent value="laboratory">
          <LaboratoryFinancialReport dateRange={safeDateRange} />
        </TabsContent>
        <TabsContent value="pharmacy">
          <PharmacyFinancialReport
            dateRange={safeDateRange}
            pagination={{
              pagination: pharmacyPagination,
              onPageChange: handlePharmacyPageChange,
              onItemsPerPageChange: (itemsPerPage) =>
                handleItemsPerPageChange("pharmacy", itemsPerPage),
            }}
          />
        </TabsContent>

        <TabsContent value="medicine">
          <MedicineStockReport />
        </TabsContent>

        <TabsContent value="prescriptions">
          <PrescriptionHistory dateRange={safeDateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
