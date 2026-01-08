// components/ophthalmology/PatientTable.tsx
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
  Eye,
  FileText,
} from "lucide-react";
import { OphthalmologyPatient } from "@/types/ophthalmology";

interface PatientTableProps {
  patients: OphthalmologyPatient[];
  onEdit?: (patient: OphthalmologyPatient) => void;
  onDelete?: (id: string) => void;
  onView?: (patient: OphthalmologyPatient) => void;
  onAddRecord?: (patient: OphthalmologyPatient) => void;
  onAdd?: () => void;
}

export function PatientTable({
  patients,
  onDelete,
  onEdit,
  onView,
  onAddRecord,
  onAdd,
}: PatientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  const getGenderBadgeColor = (gender: string) => {
    const colors: Record<string, string> = {
      male: "bg-blue-100 text-blue-800",
      female: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[gender] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, patient number, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
        </div>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Total Visits</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.patientNumber}
                  </TableCell>
                  <TableCell className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getGenderBadgeColor(patient.gender)}>
                      {patient.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>{patient.totalVisits}</TableCell>
                  <TableCell className="font-medium">
                    {patient.totalSpent.toLocaleString()} AFN
                  </TableCell>
                  <TableCell>
                    {patient.eyeExaminationHistory.length > 0
                      ? new Date(
                          patient.eyeExaminationHistory[
                            patient.eyeExaminationHistory.length - 1
                          ].examinationDate
                        ).toLocaleDateString()
                      : "-"}
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
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(patient)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {onAddRecord && (
                          <DropdownMenuItem
                            onClick={() => onAddRecord(patient)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Add Record
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(patient)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(patient.id)}
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
    </div>
  );
}
