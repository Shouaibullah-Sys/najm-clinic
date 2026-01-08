// components/ophthalmology/DailyRecordForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OphthalmologyDailyRecord } from "@/types/ophthalmology";

interface DailyRecordFormProps {
  initialData?: OphthalmologyDailyRecord;
  onSubmit: (data: Partial<OphthalmologyDailyRecord>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DailyRecordForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: DailyRecordFormProps) {
  const [formData, setFormData] = useState<Partial<OphthalmologyDailyRecord>>(
    initialData || {
      patientId: "",
      patientName: "",
      patientPhone: "",
      recordType: "examination",
      doctorName: "",
      chiefComplaint: "",
      examinationFindings: "",
      diagnosis: "",
      treatment: "",
      notes: "",
      totalAmount: 0,
      paidAmount: 0,
      paymentStatus: "unpaid",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "totalAmount" || name === "paidAmount" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const calculateDueAmount = () => {
    return (formData.totalAmount || 0) - (formData.paidAmount || 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Record" : "Add New Record"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                name="patientName"
                value={formData.patientName || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientPhone">Patient Phone</Label>
              <Input
                id="patientPhone"
                name="patientPhone"
                value={formData.patientPhone || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recordType">Record Type</Label>
              <Select
                value={formData.recordType}
                onValueChange={(value) =>
                  handleSelectChange("recordType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="examination">Examination</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor Name</Label>
              <Input
                id="doctorName"
                name="doctorName"
                value={formData.doctorName || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Chief Complaint</Label>
            <Textarea
              id="chiefComplaint"
              name="chiefComplaint"
              value={formData.chiefComplaint || ""}
              onChange={handleChange}
              placeholder="Patient's main complaint"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="examinationFindings">Examination Findings</Label>
            <Textarea
              id="examinationFindings"
              name="examinationFindings"
              value={formData.examinationFindings || ""}
              onChange={handleChange}
              placeholder="Detailed examination findings"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis || ""}
                onChange={handleChange}
                placeholder="Diagnosis"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment</Label>
              <Textarea
                id="treatment"
                name="treatment"
                value={formData.treatment || ""}
                onChange={handleChange}
                placeholder="Treatment plan"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Additional notes"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount (AFN)</Label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                value={formData.totalAmount || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidAmount">Paid Amount (AFN)</Label>
              <Input
                id="paidAmount"
                name="paidAmount"
                type="number"
                value={formData.paidAmount || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueAmount">Due Amount (AFN)</Label>
              <Input
                id="dueAmount"
                name="dueAmount"
                type="number"
                value={calculateDueAmount()}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select
              value={formData.paymentStatus}
              onValueChange={(value) =>
                handleSelectChange("paymentStatus", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : initialData
                ? "Update Record"
                : "Create Record"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
