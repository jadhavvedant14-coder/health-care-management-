export interface Clinic {
  id: string;
  name: string;
  location: string;
  contact: string;
  departments: string;
}

export interface Doctor {
  id: string;
  clinic_id: string;
  name: string;
  specialization: string;
  experience: string;
  fee: number;
  slots: string[];
  slots_json?: string;
}

export type TabType =
  | "flowchart"
  | "patient"
  | "doctor"
  | "clinic"
  | "consent"
  | "python";

export interface AuditLog {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  blood_group: string;
  allergies: string[];
  allergies_json?: string;
  emergency_contact: {
    name: string;
    relation: string;
    phone: string;
  };
  emergency_contact_json?: string;
  qr_token: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  date: string;
  time_slot: string;
  status: "Confirmed" | "Completed" | "Cancelled";
  reason?: string;
  created_at: string;
}

export interface TestResult {
  name: string;
  value: string;
  status: "NORMAL" | "HIGH" | "LOW" | "ELEVATED";
  range?: string;
}

export interface MedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
}

export interface ExtractedData {
  tests: TestResult[];
  medicines: MedicineItem[];
  vitals?: {
    bp?: string;
    pulse?: string;
    spo2?: string;
    weight?: string;
    [key: string]: string | undefined;
  };
  allergies_noted?: string[];
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  title: string;
  category: "Prescription" | "Lab Report" | "X-Ray" | "Surgery" | "Cardiology" | "Discharge Summary";
  date?: string;
  record_date: string;
  facility?: string;
  doctor_or_facility: string;
  summary?: string;
  raw_text: string;
  extracted_data_json?: string;
  extracted_data?: ExtractedData;
  ai_summary: string;
  critical_alerts: string[];
  critical_alerts_json?: string;
  file_name?: string;
  created_at: string;
}

export interface AccessConsent {
  id: string;
  doctor_id: string;
  patient_id: string;
  requested_record_types: string[];
  requested_record_types_json?: string;
  duration_type: "24 hours" | "7 days" | "Permanent";
  status: "Pending" | "Approved" | "Rejected" | "Revoked" | "Expired";
  granted_at?: string | null;
  expires_at?: string | null;
  access_logs: Array<{
    action: string;
    by: string;
    timestamp: string;
  }>;
  access_logs_json?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  patient_id: string;
  medicine_name: string;
  dosage: string;
  timing: string;
  frequency: string;
  instructions?: string;
  active: number;
  created_at: string;
}

export interface AppState {
  clinics: Clinic[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  consents: AccessConsent[];
  reminders: Reminder[];
  timeline: MedicalRecord[];
  audit_logs: AuditLog[];
}
