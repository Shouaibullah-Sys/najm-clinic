// types/ophthalmology.ts

export interface OphthalmologyPatient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  address?: string;
  city?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
  eyeExaminationHistory: EyeExamination[];
  totalVisits: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface EyeExamination {
  id: string;
  patientId: string;
  examinationDate: string;
  doctorName: string;
  rightEye: {
    sphere: number;
    cylinder: number;
    axis: number;
    visualAcuity: string;
    intraocularPressure?: number;
  };
  leftEye: {
    sphere: number;
    cylinder: number;
    axis: number;
    visualAcuity: string;
    intraocularPressure?: number;
  };
  diagnosis?: string;
  recommendations?: string;
  prescriptions?: string[];
  followUpDate?: string;
}

export interface OphthalmologyDailyRecord {
  id: string;
  recordNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  recordDate: string;
  recordType:
    | "examination"
    | "consultation"
    | "treatment"
    | "surgery"
    | "follow-up";
  doctorName: string;
  chiefComplaint?: string;
  examinationFindings?: string;
  diagnosis?: string;
  treatment?: string;
  prescriptions?: string[];
  notes?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: "paid" | "partial" | "unpaid";
  createdAt: string;
  updatedAt: string;
}

export interface OphthalmologyAppointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType:
    | "examination"
    | "consultation"
    | "follow-up"
    | "surgery"
    | "emergency";
  doctorName: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  reason?: string;
  notes?: string;
  duration: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface OphthalmologyDashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingRecords: number;
  completedToday: number;
  weeklyAppointments: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  lowStockItems: number;
}
