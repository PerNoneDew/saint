export type UserRole = 'admin' | 'health_officer' | 'student' | 'staff' | 'faculty' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string;
  employeeId?: string;
  facultyId?: string;
  adminId?: string;
  officerId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface MedicineDispensing {
  id: string;
  medicineId: string;
  medicineName: string;
  patientId: string;
  patientName: string;
  patientRole: UserRole;
  quantity: number;
  unit: string;
  dispensedBy: string;
  dispensedAt: string;
  reason: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
  userName: string;
  userRole?: UserRole;
  department?: string;
  studentId?: string;
  employeeId?: string;
  facultyId?: string;
  adminId?: string;
  officerId?: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  height: string;
  weight: string;
  bmi?: string;
  vision?: string;
  dentalStatus?: string;
  lastCheckup: string;
  nextCheckup?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes: string;
  dispensingHistory?: MedicineDispensing[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export type PatientServiceClassification =
  | 'medical_certificate'
  | 'health_clearance'
  | 'consultation'
  | 'dental_consultation'
  | 'referral_external'
  | 'referral_specialist'
  | 'first_aid'
  | 'medicine_request'
  | 'laboratory_request'
  | 'other';

export type RequestType = PatientServiceClassification;

export type RequestStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'released' | 'forwarded';

export interface Request {
  id: string;
  userId: string;
  userName: string;
  userRole?: UserRole;
  type: RequestType;
  description: string;
  status: RequestStatus;
  attachments: string[];
  submittedAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  remarks?: string;
  forwardedBy?: string;
  referralPersonnel?: string;
  referralFacility?: string;
  referralReason?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  expiryDate: string;
  supplier: string;
  lastUpdated: string;
  primaryKeyDate?: string;
}

export type ExpenseCategory = 'medicines' | 'equipment' | 'supplies' | 'services' | 'other';
export type ExpenseStatus = 'recorded' | 'verified' | 'liquidated';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  recordedBy: string;
  receiptNo: string;
  status: ExpenseStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  liquidatedAt?: string;
}

export type NotificationType = 'announcement' | 'status_update' | 'alert' | 'reminder' | 'approval' | 'rejection';

export interface Notification {
  id: string;
  title: string;
  message: string;
  recipientRoles: UserRole[];
  recipientIds?: string[];
  sentBy: string;
  sentAt: string;
  type: NotificationType;
  read: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'system';
}

export interface BackupRecord {
  id: string;
  filename: string;
  size: string;
  createdAt: string;
  createdBy: string;
  status: 'completed' | 'failed' | 'in_progress';
  type: 'manual' | 'scheduled';
}

export interface DataSnapshot {
  id: string;
  name: string;
  createdAt: string;
  type: 'backup' | 'pre_reset' | 'initial';
  data: {
    users: User[];
    healthRecords: HealthRecord[];
    requests: Request[];
    inventory: Medicine[];
    expenses: Expense[];
    notifications: Notification[];
    auditLogs: AuditLog[];
    dispensingHistory: MedicineDispensing[];
  };
}

export type Page =
  | 'dashboard'
  | 'users'
  | 'health-records'
  | 'requests'
  | 'inventory'
  | 'liquidation'
  | 'notifications'
  | 'reports'
  | 'audit-trail'
  | 'backup-recovery';
