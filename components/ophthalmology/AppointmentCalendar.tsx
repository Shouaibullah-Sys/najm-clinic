// components/ophthalmology/AppointmentCalendar.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Check,
  X,
} from "lucide-react";
import { OphthalmologyAppointment } from "@/types/ophthalmology";

interface AppointmentCalendarProps {
  appointments: OphthalmologyAppointment[];
  onEdit?: (appointment: OphthalmologyAppointment) => void;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onAdd?: () => void;
}

export function AppointmentCalendar({
  appointments,
  onEdit,
  onDelete,
  onComplete,
  onCancel,
  onAdd,
}: AppointmentCalendarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.patientPhone.includes(searchTerm) ||
      appointment.appointmentNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      "no-show": "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      examination: "bg-blue-100 text-blue-800",
      consultation: "bg-green-100 text-green-800",
      "follow-up": "bg-purple-100 text-purple-800",
      surgery: "bg-red-100 text-red-800",
      emergency: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by patient name, phone, or appointment number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
        </div>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Appointment
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Appointment #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        {appointment.appointmentNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patientPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          appointment.appointmentDate
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{appointment.appointmentTime}</TableCell>
                      <TableCell>
                        <Badge
                          className={getTypeBadgeColor(
                            appointment.appointmentType
                          )}
                        >
                          {appointment.appointmentType}
                        </Badge>
                      </TableCell>
                      <TableCell>{appointment.doctorName}</TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusBadgeColor(appointment.status)}
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {onEdit && (
                              <DropdownMenuItem
                                onClick={() => onEdit(appointment)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onComplete &&
                              appointment.status !== "completed" && (
                                <DropdownMenuItem
                                  onClick={() => onComplete(appointment.id)}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                            {onCancel && appointment.status !== "cancelled" && (
                              <DropdownMenuItem
                                onClick={() => onCancel(appointment.id)}
                                className="text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(appointment.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
