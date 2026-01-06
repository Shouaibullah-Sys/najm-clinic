// app/ceo/dashboard/components/PrescriptionHistory.tsx
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
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  SearchIcon,
  DownloadIcon,
  EyeIcon,
  PackageIcon,
  CreditCardIcon,
  ShieldIcon,
  PrinterIcon,
} from "lucide-react";
import { toast } from "sonner";
import { generatePharmacyReceipt } from "@/utils/generatePharmacyReceipt";

interface PrescriptionItem {
  medicine: {
    name: string;
    batchNumber: string;
  };
  quantity: number;
  unitPrice: number;
  discount: number;
}

interface Prescription {
  _id: string;
  patientName: string;
  patientPhone: string;
  invoiceNumber: string;
  items: PrescriptionItem[];
  totalAmount: number;
  amountPaid: number;
  paymentMethod: string;
  status: string;
  issuedBy?: {
    name: string;
  };
  createdAt: string;
}

interface PrescriptionHistoryProps {
  dateRange: DateRange;
}

export default function PrescriptionHistory({
  dateRange,
}: PrescriptionHistoryProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPrescriptions();
  }, [dateRange]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.append("endDate", dateRange.to.toISOString());
      }

      const response = await fetch(`/api/ceo/prescriptions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch prescriptions");

      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      toast.error("Failed to load prescription history");
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

      const response = await fetch(`/api/ceo/export-prescriptions?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prescription-history-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Prescription history exported successfully");
    } catch (error) {
      console.error("Error exporting prescriptions:", error);
      toast.error("Failed to export prescription history");
    }
  };

  const handlePrintReceipt = (prescription: Prescription) => {
    try {
      const receiptData = {
        patientName: prescription.patientName,
        patientPhone: prescription.patientPhone,
        invoiceNumber: prescription.invoiceNumber,
        items: prescription.items,
        totalAmount: prescription.totalAmount,
        amountPaid: prescription.amountPaid,
        paymentMethod: prescription.paymentMethod,
        createdAt: prescription.createdAt,
        issuedBy: prescription.issuedBy,
      };

      generatePharmacyReceipt(receiptData);
      toast.success("Receipt generated successfully");
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error("Failed to generate receipt");
    }
  };

  const handleGenerateReport = () => {
    try {
      if (prescriptions.length === 0) {
        toast.error("No prescriptions available to generate report");
        return;
      }

      prescriptions.forEach((prescription, index) => {
        setTimeout(() => {
          const receiptData = {
            patientName: prescription.patientName,
            patientPhone: prescription.patientPhone,
            invoiceNumber: prescription.invoiceNumber,
            items: prescription.items,
            totalAmount: prescription.totalAmount,
            amountPaid: prescription.amountPaid,
            paymentMethod: prescription.paymentMethod,
            createdAt: prescription.createdAt,
            issuedBy: prescription.issuedBy,
          };
          generatePharmacyReceipt(receiptData);
        }, index * 500);
      });

      toast.success(`Generating ${prescriptions.length} receipts...`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <PackageIcon className="h-3 w-3 lg:h-4 lg:w-4" />;
      case "card":
        return <CreditCardIcon className="h-3 w-3 lg:h-4 lg:w-4" />;
      case "insurance":
        return <ShieldIcon className="h-3 w-3 lg:h-4 lg:w-4" />;
      default:
        return <PackageIcon className="h-3 w-3 lg:h-4 lg:w-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "bg-green-100 text-green-800";
      case "card":
        return "bg-blue-100 text-blue-800";
      case "insurance":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.invoiceNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.patientPhone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrescriptions = filteredPrescriptions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading) {
    return (
      <div className="p-4 text-center">Loading prescription history...</div>
    );
  }

  const totalRevenue = prescriptions.reduce(
    (sum, prescription) => sum + prescription.totalAmount,
    0
  );
  const totalPrescriptions = prescriptions.length;
  const averagePrescriptionValue =
    totalPrescriptions > 0 ? totalRevenue / totalPrescriptions : 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium">
              Total Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="text-lg lg:text-2xl font-bold text-blue-600">
              {totalPrescriptions.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Selected period</div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="text-lg lg:text-2xl font-bold text-green-600">
              AFs {totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              All prescriptions
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <div className="text-lg lg:text-2xl font-bold text-purple-600">
              AFs {averagePrescriptionValue.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Per prescription
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="pb-2 p-4 lg:p-6">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0 space-y-2">
            <Button
              onClick={handleExport}
              size="sm"
              className="w-full text-xs lg:text-sm"
            >
              <DownloadIcon className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={handleGenerateReport}
              size="sm"
              variant="outline"
              className="w-full text-xs lg:text-sm"
              disabled={prescriptions.length === 0}
            >
              <PrinterIcon className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
              PDF Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-lg lg:text-xl">
            Prescription History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 pt-0">
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-3 h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients, invoices, phones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 lg:pl-10 text-sm"
              />
            </div>
            <Button
              onClick={fetchPrescriptions}
              variant="outline"
              size="sm"
              className="text-xs lg:text-sm"
            >
              Refresh
            </Button>
          </div>

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
                    Invoice
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Items
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Total
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap hidden md:table-cell">
                    Method
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPrescriptions.map((prescription) => (
                  <TableRow key={prescription._id}>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap">
                      {format(new Date(prescription.createdAt), "MMM dd")}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 max-w-[80px] lg:max-w-none truncate">
                      <div>
                        <div className="font-medium truncate">
                          {prescription.patientName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {prescription.patientPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 font-mono hidden sm:table-cell">
                      {prescription.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4">
                      <div className="flex flex-col truncate lg:w-52 w-12">
                        <span>{prescription.items.length} items</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[100px] lg:max-w-none">
                          {prescription.items
                            .map((item: any) => item.medicine?.name)
                            .join(", ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 whitespace-nowrap font-semibold">
                      AFs {prescription.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4 hidden md:table-cell">
                      <Badge
                        className={`text-xs ${getPaymentMethodColor(
                          prescription.paymentMethod
                        )}`}
                      >
                        <div className="flex items-center gap-1">
                          {getPaymentMethodIcon(prescription.paymentMethod)}
                          {prescription.paymentMethod}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4">
                      <Badge
                        className={`text-xs ${getStatusColor(
                          prescription.status
                        )}`}
                      >
                        {prescription.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs lg:text-sm p-2 lg:p-4">
                      <Button
                        className="cursor-pointer"
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintReceipt(prescription)}
                        title="Generate Receipt"
                      >
                        <PrinterIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-2 sm:space-y-0">
              <div className="text-xs lg:text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(
                  startIndex + itemsPerPage,
                  filteredPrescriptions.length
                )}{" "}
                of {filteredPrescriptions.length} entries
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {filteredPrescriptions.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No prescriptions found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
