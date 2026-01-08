// app/ophthalmology/appointments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { OphthalmologyAppointment } from "@/types/ophthalmology";
import { AppointmentCalendar } from "@/components/ophthalmology/AppointmentCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OphthalmologyAppointmentsPage() {
  const [appointments, setAppointments] = useState<OphthalmologyAppointment[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/ophthalmology/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment: OphthalmologyAppointment) => {
    console.log("Edit appointment:", appointment);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const response = await fetch(`/api/ophthalmology/appointments/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setAppointments(appointments.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const response = await fetch(
        `/api/ophthalmology/appointments/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed" }),
        }
      );
      if (response.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const response = await fetch(
        `/api/ophthalmology/appointments/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );
      if (response.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const handleAdd = () => {
    console.log("Add new appointment");
    // TODO: Implement add appointment modal
  };

  const filteredAppointments =
    statusFilter === "all"
      ? appointments
      : appointments.filter((a) => a.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-gray-500">
            Manage patient appointments and schedules
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter by Status</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <AppointmentCalendar
            appointments={filteredAppointments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onAdd={handleAdd}
          />
        </CardContent>
      </Card>
    </div>
  );
}
