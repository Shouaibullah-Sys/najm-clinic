// app/ophthalmology/patients/page.tsx
"use client";

import { useEffect, useState } from "react";
import { OphthalmologyPatient } from "@/types/ophthalmology";
import { PatientTable } from "@/components/ophthalmology/PatientTable";
import { PatientForm } from "@/components/ophthalmology/PatientForm";

export default function OphthalmologyPatientsPage() {
  const [patients, setPatients] = useState<OphthalmologyPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] =
    useState<OphthalmologyPatient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/ophthalmology/patients");
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<OphthalmologyPatient>) => {
    try {
      const url = editingPatient
        ? `/api/ophthalmology/patients/${editingPatient.id}`
        : "/api/ophthalmology/patients";
      const method = editingPatient ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchPatients();
        setShowForm(false);
        setEditingPatient(null);
      }
    } catch (error) {
      console.error("Error saving patient:", error);
    }
  };

  const handleEdit = (patient: OphthalmologyPatient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;

    try {
      const response = await fetch(`/api/ophthalmology/patients/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPatients(patients.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  const handleView = (patient: OphthalmologyPatient) => {
    console.log("View patient:", patient);
    // TODO: Implement view details modal or page
  };

  const handleAddRecord = (patient: OphthalmologyPatient) => {
    console.log("Add record for patient:", patient);
    // TODO: Navigate to records page with patient pre-selected
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading patients...</p>
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
              {editingPatient ? "Edit Patient" : "Add New Patient"}
            </h2>
            <p className="text-gray-500">
              {editingPatient
                ? "Update patient information"
                : "Register a new patient"}
            </p>
          </div>
        </div>
        <PatientForm
          initialData={editingPatient || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
          <p className="text-gray-500">
            Manage patient records and eye examination history
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      <PatientTable
        patients={patients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onAddRecord={handleAddRecord}
        onAdd={() => setShowForm(true)}
      />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
