// app/ophthalmology/records/page.tsx
"use client";

import { useEffect, useState } from "react";
import { OphthalmologyDailyRecord } from "@/types/ophthalmology";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DailyRecordForm } from "@/components/ophthalmology/DailyRecordForm";

export default function OphthalmologyRecordsPage() {
  const [records, setRecords] = useState<OphthalmologyDailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<OphthalmologyDailyRecord | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/ophthalmology/records");
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(
    (record) =>
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.recordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientPhone.includes(searchTerm)
  );

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      partial: "bg-yellow-100 text-yellow-800",
      unpaid: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      examination: "bg-blue-100 text-blue-800",
      consultation: "bg-green-100 text-green-800",
      treatment: "bg-purple-100 text-purple-800",
      surgery: "bg-red-100 text-red-800",
      "follow-up": "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const handleSubmit = async (data: Partial<OphthalmologyDailyRecord>) => {
    try {
      const url = editingRecord
        ? `/api/ophthalmology/records/${editingRecord.id}`
        : "/api/ophthalmology/records";
      const method = editingRecord ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchRecords();
        setShowForm(false);
        setEditingRecord(null);
      }
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  const handleEdit = (record: OphthalmologyDailyRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`/api/ophthalmology/records/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setRecords(records.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading records...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {editingRecord ? "Edit Record" : "Add New Record"}
            </h2>
            <p className="text-gray-500">
              {editingRecord
                ? "Update the record details"
                : "Create a new daily record"}
            </p>
          </div>
        </div>
        <DailyRecordForm
          initialData={editingRecord || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daily Records</h2>
          <p className="text-gray-500">
            Manage patient visits, examinations, and treatments
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Records List</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by patient name, record number, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.recordNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.patientPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(record.recordType)}>
                          {record.recordType}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.doctorName}</TableCell>
                      <TableCell>
                        {new Date(record.recordDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.totalAmount.toLocaleString()} AFN
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            record.dueAmount > 0
                              ? "text-red-600 font-medium"
                              : "text-green-600"
                          }
                        >
                          {record.dueAmount.toLocaleString()} AFN
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusBadgeColor(record.paymentStatus)}
                        >
                          {record.paymentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
