// app/ceo/dashboard/components/FinancialCharts.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "react-day-picker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  PieChartIcon,
} from "lucide-react";

interface FinancialData {
  laboratory: {
    dailyData: any[];
    summary: any;
  };
  pharmacy: {
    dailyData: any[];
    summary: any;
  };
}

interface FinancialChartsProps {
  dateRange: DateRange;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function FinancialCharts({ dateRange }: FinancialChartsProps) {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [dateRange]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append("endDate", dateRange.to.toISOString());
      }

      const [labResponse, pharmaResponse] = await Promise.all([
        fetch(`/api/ceo/laboratory-report?${params}`),
        fetch(`/api/ceo/pharmacy-report?${params}`),
      ]);

      if (!labResponse.ok || !pharmaResponse.ok) {
        throw new Error("Failed to fetch chart data");
      }

      const laboratoryData = await labResponse.json();
      const pharmacyData = await pharmaResponse.json();

      setData({
        laboratory: laboratoryData,
        pharmacy: pharmacyData,
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return <div>No chart data available</div>;
  }

  // Prepare combined daily data
  const combinedDailyData = data.laboratory.dailyData.map((labDay: any) => {
    const pharmaDay = data.pharmacy.dailyData.find(
      (pharma: any) => pharma.date === labDay.date
    ) || {
      income: 0,
      expenses: 0,
      prescriptions: 0,
    };

    return {
      date: labDay.date,
      labIncome: labDay.income,
      labExpenses: labDay.expenses,
      pharmaIncome: pharmaDay.income,
      pharmaExpenses: pharmaDay.expenses,
      totalIncome: labDay.income + pharmaDay.income,
      totalExpenses: labDay.expenses + pharmaDay.expenses,
      totalProfit:
        labDay.income +
        pharmaDay.income -
        (labDay.expenses + pharmaDay.expenses),
    };
  });

  // Prepare revenue distribution data
  const revenueDistribution = [
    { name: "Laboratory", value: data.laboratory.summary.totalIncome },
    { name: "Pharmacy", value: data.pharmacy.summary.totalIncome },
  ];

  // Prepare expense distribution data
  const expenseDistribution = [
    { name: "Laboratory", value: data.laboratory.summary.totalExpenses },
    { name: "Pharmacy", value: data.pharmacy.summary.totalExpenses },
  ];

  // Profit margin comparison
  const labProfitMargin =
    data.laboratory.summary.totalIncome > 0
      ? ((data.laboratory.summary.totalIncome -
          data.laboratory.summary.totalExpenses) /
          data.laboratory.summary.totalIncome) *
        100
      : 0;

  const pharmaProfitMargin =
    data.pharmacy.summary.totalIncome > 0
      ? ((data.pharmacy.summary.totalIncome -
          data.pharmacy.summary.totalExpenses) /
          data.pharmacy.summary.totalIncome) *
        100
      : 0;

  const profitMarginData = [
    { department: "Laboratory", margin: labProfitMargin },
    { department: "Pharmacy", margin: pharmaProfitMargin },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue" className=" cursor-pointer">
            Revenue Trends
          </TabsTrigger>
          <TabsTrigger value="profit" className=" cursor-pointer">
            Profit Analysis
          </TabsTrigger>
          <TabsTrigger value="distribution" className=" cursor-pointer">
            Revenue Distribution
          </TabsTrigger>
          <TabsTrigger value="margins" className=" cursor-pointer">
            Profit Margins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUpIcon className="h-5 w-5 mr-2 text-green-600" />
                  Daily Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={combinedDailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="labIncome"
                      stroke="#0088FE"
                      name="Laboratory Income"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="pharmaIncome"
                      stroke="#00C49F"
                      name="Pharmacy Income"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalIncome"
                      stroke="#FF8042"
                      name="Total Income"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSignIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Revenue vs Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={combinedDailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="totalIncome"
                      name="Total Income"
                      fill="#0088FE"
                    />
                    <Bar
                      dataKey="totalExpenses"
                      name="Total Expenses"
                      fill="#FF8042"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUpIcon className="h-5 w-5 mr-2 text-green-600" />
                  Daily Profit Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={combinedDailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalProfit"
                      stroke="#00C49F"
                      name="Total Profit"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDownIcon className="h-5 w-5 mr-2 text-red-600" />
                  Department-wise Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        department: "Laboratory",
                        profit:
                          data.laboratory.summary.totalIncome -
                          data.laboratory.summary.totalExpenses,
                        income: data.laboratory.summary.totalIncome,
                        expenses: data.laboratory.summary.totalExpenses,
                      },
                      {
                        department: "Pharmacy",
                        profit:
                          data.pharmacy.summary.totalIncome -
                          data.pharmacy.summary.totalExpenses,
                        income: data.pharmacy.summary.totalIncome,
                        expenses: data.pharmacy.summary.totalExpenses,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="profit" name="Net Profit" fill="#00C49F" />
                    <Bar dataKey="income" name="Total Income" fill="#0088FE" />
                    <Bar
                      dataKey="expenses"
                      name="Total Expenses"
                      fill="#FF8042"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Revenue Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueDistribution.map((entry, index) => (
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
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2 text-orange-600" />
                  Expense Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseDistribution.map((entry, index) => (
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
        </TabsContent>

        <TabsContent value="margins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit Margin Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitMarginData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis unit="%" />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(1)}%`,
                      "Profit Margin",
                    ]}
                  />
                  <Bar dataKey="margin" name="Profit Margin" fill="#8884d8">
                    {profitMarginData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.margin >= 20
                            ? "#00C49F"
                            : entry.margin >= 10
                            ? "#FFBB28"
                            : "#FF8042"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Combined Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              AFs
              {(
                data.laboratory.summary.totalIncome +
                data.pharmacy.summary.totalIncome
              ).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Laboratory: AFs
              {data.laboratory.summary.totalIncome.toLocaleString()}
              <br />
              Pharmacy: AFs {data.pharmacy.summary.totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Combined Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              AFs
              {(
                data.laboratory.summary.totalIncome -
                data.laboratory.summary.totalExpenses +
                (data.pharmacy.summary.totalIncome -
                  data.pharmacy.summary.totalExpenses)
              ).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Combined profit margin:{" "}
              {(
                ((data.laboratory.summary.totalIncome +
                  data.pharmacy.summary.totalIncome -
                  data.laboratory.summary.totalExpenses -
                  data.pharmacy.summary.totalExpenses) /
                  (data.laboratory.summary.totalIncome +
                    data.pharmacy.summary.totalIncome)) *
                  100 || 0
              ).toFixed(1)}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Laboratory Margin:</span>
                <span
                  className={`font-semibold ${
                    labProfitMargin >= 20
                      ? "text-green-600"
                      : labProfitMargin >= 10
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {labProfitMargin.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pharmacy Margin:</span>
                <span
                  className={`font-semibold ${
                    pharmaProfitMargin >= 20
                      ? "text-green-600"
                      : pharmaProfitMargin >= 10
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {pharmaProfitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
