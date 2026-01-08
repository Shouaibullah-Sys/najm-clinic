// components/ophthalmology/PatientForm.tsx
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
import { OphthalmologyPatient } from "@/types/ophthalmology";

interface PatientFormProps {
  initialData?: OphthalmologyPatient;
  onSubmit: (data: Partial<OphthalmologyPatient>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PatientForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PatientFormProps) {
  const [formData, setFormData] = useState<Partial<OphthalmologyPatient>>(
    initialData || {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      gender: "male",
      address: "",
      city: "",
      emergencyContact: "",
      emergencyPhone: "",
      medicalHistory: [],
      allergies: [],
      currentMedications: [],
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (
    name: string,
    value: string,
    setter: (val: string[]) => void
  ) => {
    const values = value.split(",").map((v) => v.trim());
    setter(values);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Patient" : "Add New Patient"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              placeholder="Full address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">
              Medical History (comma-separated)
            </Label>
            <Textarea
              id="medicalHistory"
              name="medicalHistory"
              value={formData.medicalHistory?.join(", ") || ""}
              onChange={(e) =>
                handleArrayChange("medicalHistory", e.target.value, (val) =>
                  setFormData((prev) => ({
                    ...prev,
                    medicalHistory: val,
                  }))
                )
              }
              placeholder="e.g., Diabetes, Hypertension"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies (comma-separated)</Label>
            <Textarea
              id="allergies"
              name="allergies"
              value={formData.allergies?.join(", ") || ""}
              onChange={(e) =>
                handleArrayChange("allergies", e.target.value, (val) =>
                  setFormData((prev) => ({
                    ...prev,
                    allergies: val,
                  }))
                )
              }
              placeholder="e.g., Penicillin, Aspirin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications">
              Current Medications (comma-separated)
            </Label>
            <Textarea
              id="currentMedications"
              name="currentMedications"
              value={formData.currentMedications?.join(", ") || ""}
              onChange={(e) =>
                handleArrayChange("currentMedications", e.target.value, (val) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentMedications: val,
                  }))
                )
              }
              placeholder="e.g., Metformin, Lisinopril"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : initialData
                ? "Update Patient"
                : "Add Patient"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
