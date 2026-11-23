import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  Lock,
  Eye,
  RefreshCw,
  Send,
  Zap,
  Check,
  Activity,
  TrendingUp,
  TrendingDown,
  Pill,
  Plus,
  Trash2,
  Search,
  User,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Heart,
  Droplet,
  Stethoscope,
  X,
  Phone,
  MessageSquare,
  FileCheck,
  ArrowLeft,
  SlidersHorizontal,
  MoreVertical,
  Bell,
  Download,
  Edit3,
  CalendarCheck,
  Thermometer,
  Scale,
  Shield,
  Filter,
} from "lucide-react";
import docWilliamImg from "../assets/images/doc_william_cardio_1794862648403.jpg";
import docRajeshImg from "../assets/images/doc_rajesh_sharma_1794862644668.jpg";
import docAnanyaImg from "../assets/images/doc_ananya_sen_1794862645317.jpg";
import docVikramImg from "../assets/images/doc_vikram_patil_1794862646295.jpg";
import docPriyaImg from "../assets/images/doc_priya_deshmukh_1794862648503.jpg";
import docMeeraImg from "../assets/images/doc_meera_nambiar_1794862646518.jpg";
import { AppState, MedicalRecord, Patient } from "../types";
import { ReportDetailModal } from "./ReportDetailModal";
import { authFetch } from "../lib/authSession";

function getSignedInDoctorPortrait(doctorId?: string, name?: string, spec?: string): string {
  const idMap: Record<string, string> = {
    doc_1: docRajeshImg,
    doc_2: docAnanyaImg,
    doc_3: docVikramImg,
    doc_4: docPriyaImg,
    doc_5: docMeeraImg,
  };
  if (doctorId && idMap[doctorId]) return idMap[doctorId];
  const lowerName = (name || "").toLowerCase();
  const lowerSpec = (spec || "").toLowerCase();
  if (lowerName.includes("rajesh")) return docRajeshImg;
  if (lowerName.includes("ananya")) return docAnanyaImg;
  if (lowerName.includes("vikram")) return docVikramImg;
  if (lowerName.includes("priya")) return docPriyaImg;
  if (lowerName.includes("meera")) return docMeeraImg;
  if (lowerSpec.includes("ortho")) return docVikramImg;
  if (lowerSpec.includes("pulmon")) return docPriyaImg;
  if (lowerSpec.includes("gynec") || lowerSpec.includes("obstetric")) return docMeeraImg;
  if (lowerSpec.includes("general") || lowerSpec.includes("diabet")) return docAnanyaImg;
  return docWilliamImg;
}

const AVATAR_PALETTES = [
  "bg-emerald-100 text-emerald-800 border-emerald-200",
  "bg-sky-100 text-sky-800 border-sky-200",
  "bg-amber-100 text-amber-800 border-amber-200",
  "bg-indigo-100 text-indigo-800 border-indigo-200",
  "bg-rose-100 text-rose-800 border-rose-200",
  "bg-teal-100 text-teal-800 border-teal-200",
];

function PatientAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "xl";
}) {
  const parts = (name || "P").trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.slice(0, 2) || "PT").toUpperCase();
  const hash = (name || "").split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const palette = AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
  const sizeClass =
    size === "xl"
      ? "w-20 h-20 rounded-2xl text-xl ring-4 ring-emerald-50 shadow-md"
      : size === "sm"
      ? "w-8 h-8 rounded-full text-[11px]"
      : "w-9 h-9 rounded-full text-xs ring-2 ring-slate-100";

  return (
    <div
      className={`${sizeClass} ${palette} border font-bold flex items-center justify-center shrink-0 select-none`}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

interface DoctorPortalProps {
  state: AppState;
  onRefresh: () => void;
  activePatientId?: string;
  onSelectPatient?: (patientId: string) => void;
  signedInDoctor?: {
    id?: string;
    name: string;
    specialization?: string;
  };
}

type MainTab = "Dashboard" | "Patients" | "Schedule" | "Docs" | "Reports";
type PatientCardSubTab = "Overview" | "Records" | "Treatments" | "Notes";
type VitalMetric = "bp" | "heart_rate" | "temperature" | "weight";

interface ExtendedPatient {
  id: string;
  name: string;
  patientIdCode: string;
  gender: "Female" | "Male" | "Other";
  age: number;
  condition: string;
  lastVisit: string;
  status: "At Risk" | "Under Treatment" | "Active";
  priority: "High" | "Medium" | "Low";
  avatar: string;
  phone: string;
  email?: string;
  allergies: string[];
  chronicConditions: string[];
  contraindications: string[];
  insightText: string;
  upcomingAppointment?: {
    date: string;
    time: string;
    status: "Confirmed" | "Pending" | "Cancelled";
    type: string;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    status: string;
  }>;
}

// Built-in clinical directory matching the Mediq specification from the video
const DIRECTORY_PATIENTS: ExtendedPatient[] = [
  {
    id: "pat_lisa",
    name: "Lisa Holloway",
    patientIdCode: "#8574665",
    gender: "Female",
    age: 23,
    condition: "Hypertension & Asthma",
    lastVisit: "10/04/2026",
    status: "Under Treatment",
    priority: "High",
    avatar: "",
    phone: "+1 (555) 234-8901",
    email: "lisa.holloway@example.com",
    allergies: ["Penicillin", "Peanuts"],
    chronicConditions: [
      "Hypertension (diagnosed 2019)",
      "Type 2 Diabetes (diagnosed 2016)",
      "Mild Persistent Asthma",
    ],
    contraindications: [
      "ACE inhibitors intolerance",
      "High sodium sensitivity",
    ],
    insightText:
      "Patient shows steady improvement in blood pressure with current medication plan. Pulmonary function remains stable with daily corticosteroid inhaler.",
    upcomingAppointment: {
      date: "24/04/2026",
      time: "9:30 - 10:00",
      status: "Confirmed",
      type: "Follow Up Consultation",
    },
    medications: [
      { name: "Metformin", dosage: "500 mg", frequency: "Twice daily", status: "Active" },
      { name: "Lisinopril", dosage: "10 mg", frequency: "Once daily", status: "Active" },
      { name: "Atorvastatin", dosage: "20 mg", frequency: "Once daily (Bedtime)", status: "Active" },
      { name: "Amlodipine", dosage: "5 mg", frequency: "Once daily", status: "Active" },
    ],
  },
  {
    id: "pat_1",
    name: "Rahul Jadhav",
    patientIdCode: "#8574666",
    gender: "Male",
    age: 38,
    condition: "Stage 1 Essential Hypertension",
    lastVisit: "12/04/2026",
    status: "Under Treatment",
    priority: "High",
    avatar: "",
    phone: "+91 98765 43210",
    email: "jadhavvedant14@gmail.com",
    allergies: ["Penicillin (Severe Rash / Anaphylaxis Risk)", "Sulfa Drugs"],
    chronicConditions: [
      "Stage 1 Essential Hypertension",
      "Pre-Diabetes & Borderline Dyslipidemia",
    ],
    contraindications: [
      "Penicillin derivatives (Amoxicillin, Augmentin)",
      "Sulfonamides (Bactrim, Co-trimoxazole)",
    ],
    insightText:
      "Blood pressure stabilizing nicely post-titration to Telmisartan 40mg. Resting pulse rate 72 bpm. Patient adherent to sodium reduction.",
    upcomingAppointment: {
      date: "26/04/2026",
      time: "10:15 - 10:45",
      status: "Confirmed",
      type: "Cardiology Review",
    },
    medications: [
      { name: "Telmisartan", dosage: "40 mg", frequency: "Once daily morning", status: "Active" },
      { name: "Amlodipine", dosage: "5 mg", frequency: "Once daily evening", status: "Active" },
      { name: "Atorvastatin", dosage: "10 mg", frequency: "Once daily bedtime", status: "Active" },
    ],
  },
  {
    id: "pat_david",
    name: "David Wilson",
    patientIdCode: "#8574667",
    gender: "Male",
    age: 51,
    condition: "Cardiac Arrhythmia",
    lastVisit: "22/04/2026",
    status: "At Risk",
    priority: "High",
    avatar: "",
    phone: "+1 (555) 432-9871",
    email: "david.wilson@example.com",
    allergies: ["Aspirin", "Iodinated Contrast"],
    chronicConditions: [
      "Paroxysmal Atrial Fibrillation",
      "Ischemic Cardiomyopathy",
    ],
    contraindications: [
      "NSAIDs (Bleeding risk with anticoagulants)",
      "Non-dihydropyridine CCBs in decompensation",
    ],
    insightText:
      "Recent Holter monitor recorded intermittent runs of supraventricular tachycardia. Anticoagulation INR 2.3 within target. Needs prompt cardiology evaluation.",
    upcomingAppointment: {
      date: "28/04/2026",
      time: "11:00 - 11:45",
      status: "Confirmed",
      type: "Cardiac Electrophysiology Review",
    },
    medications: [
      { name: "Apixaban", dosage: "5 mg", frequency: "Twice daily", status: "Active" },
      { name: "Metoprolol Succinate", dosage: "50 mg", frequency: "Once daily", status: "Active" },
      { name: "Atorvastatin", dosage: "40 mg", frequency: "Once daily", status: "Active" },
    ],
  },
  {
    id: "pat_michael",
    name: "Michael Smith",
    patientIdCode: "#8574668",
    gender: "Male",
    age: 46,
    condition: "Type 2 Diabetes Mellitus",
    lastVisit: "18/04/2026",
    status: "Under Treatment",
    priority: "Medium",
    avatar: "",
    phone: "+1 (555) 789-1234",
    email: "m.smith@example.com",
    allergies: ["Sulfa Drugs"],
    chronicConditions: [
      "Type 2 Diabetes (HbA1c 8.1%)",
      "Diabetic Peripheral Neuropathy",
    ],
    contraindications: ["Sulfonylureas (due to allergy & hypoglycemia episodes)"],
    insightText:
      "Fasting blood sugars oscillating between 145-180 mg/dL. Minimal reduction in HbA1c over 3 months. Lifestyle diet counseling and SGLT2 inhibitor addition recommended.",
    upcomingAppointment: {
      date: "29/04/2026",
      time: "14:00 - 14:30",
      status: "Pending",
      type: "Diabetic Endocrinology Clinic",
    },
    medications: [
      { name: "Metformin ER", dosage: "1000 mg", frequency: "Twice daily with meals", status: "Active" },
      { name: "Empagliflozin", dosage: "10 mg", frequency: "Once daily morning", status: "Active" },
    ],
  },
  {
    id: "pat_annie",
    name: "Annie Lee",
    patientIdCode: "#8574669",
    gender: "Female",
    age: 29,
    condition: "Chronic Migraine with Aura",
    lastVisit: "08/04/2026",
    status: "Active",
    priority: "Low",
    avatar: "",
    phone: "+1 (555) 321-7654",
    email: "annie.lee@example.com",
    allergies: ["Codeine"],
    chronicConditions: ["Migraine with Aura (4-5 episodes/month)"],
    contraindications: ["Opioid analgesics", "Ergotamines with triptans within 24h"],
    insightText:
      "Missed scheduled telehealth session yesterday. Rescheduled for review. Prophylactic Topiramate reduced headache frequency by 40%.",
    upcomingAppointment: {
      date: "30/04/2026",
      time: "15:30 - 16:00",
      status: "Pending",
      type: "Neurology Follow Up",
    },
    medications: [
      { name: "Topiramate", dosage: "50 mg", frequency: "Twice daily", status: "Active" },
      { name: "Sumatriptan", dosage: "50 mg", frequency: "PRN at headache onset", status: "Active" },
    ],
  },
  {
    id: "pat_james",
    name: "James Green",
    patientIdCode: "#8574670",
    gender: "Male",
    age: 41,
    condition: "Lumbar Disc Herniation / Back Pain",
    lastVisit: "15/04/2026",
    status: "Active",
    priority: "Low",
    avatar: "",
    phone: "+1 (555) 876-5432",
    email: "james.green@example.com",
    allergies: ["NSAIDs (Gastric Ulcer history)"],
    chronicConditions: ["L4-L5 Lumbar Disc Protrusion", "Mechanical Back Pain"],
    contraindications: ["Oral NSAIDs (due to active peptic ulcer history)"],
    insightText:
      "Physical therapy adherence is excellent. Lumbar range of motion improved 25 degrees. Pain visual scale reduced from 7/10 to 3/10.",
    upcomingAppointment: {
      date: "02/05/2026",
      time: "10:30 - 11:00",
      status: "Confirmed",
      type: "Orthopedic Rehabilitation",
    },
    medications: [
      { name: "Acetaminophen", dosage: "650 mg", frequency: "Three times daily PRN", status: "Active" },
      { name: "Cyclobenzaprine", dosage: "5 mg", frequency: "Bedtime as needed", status: "Active" },
    ],
  },
  {
    id: "pat_margaret",
    name: "Margaret Wilson",
    patientIdCode: "#8574671",
    gender: "Female",
    age: 67,
    condition: "Osteoarthritis & Routine Checkup",
    lastVisit: "11/04/2026",
    status: "Under Treatment",
    priority: "Medium",
    avatar: "",
    phone: "+1 (555) 998-2211",
    email: "margaret.w@example.com",
    allergies: ["Latex"],
    chronicConditions: [
      "Bilateral Knee Osteoarthritis (Grade 2)",
      "Osteopenia (DEXA T-score -1.8)",
    ],
    contraindications: ["High-impact loading exercises"],
    insightText:
      "Knee joint stiffness improved following intra-articular hyaluronic acid. Dual-energy X-ray absorptiometry scheduled for osteoporosis surveillance.",
    upcomingAppointment: {
      date: "04/05/2026",
      time: "09:00 - 09:30",
      status: "Confirmed",
      type: "Geriatric Wellness Review",
    },
    medications: [
      { name: "Calcium Citrate + Vitamin D3", dosage: "500 mg / 400 IU", frequency: "Twice daily", status: "Active" },
      { name: "Glucosamine Chondroitin", dosage: "1500 mg", frequency: "Once daily", status: "Active" },
    ],
  },
  {
    id: "pat_emily",
    name: "Emily Davis",
    patientIdCode: "#8574672",
    gender: "Female",
    age: 34,
    condition: "Allergic Rhinitis & Sinusitis",
    lastVisit: "05/04/2026",
    status: "Active",
    priority: "Low",
    avatar: "",
    phone: "+1 (555) 667-8899",
    email: "emily.davis@example.com",
    allergies: ["Dust Mites", "Tree Pollen"],
    chronicConditions: ["Allergic Rhinitis"],
    contraindications: ["First-generation sedating antihistamines while working"],
    insightText:
      "Nasal mucosal edema resolved with fluticasone propionate nasal spray. Allergy skin prick testing confirmed cedar allergy.",
    upcomingAppointment: {
      date: "06/05/2026",
      time: "10:15 - 10:45",
      status: "Cancelled",
      type: "Immunology Consultation",
    },
    medications: [
      { name: "Fluticasone Propionate Nasal", dosage: "50 mcg", frequency: "1 spray per nostril daily", status: "Active" },
      { name: "Cetirizine", dosage: "10 mg", frequency: "Once daily at bedtime", status: "Active" },
    ],
  },
  {
    id: "pat_sophia",
    name: "Sophia Martinez",
    patientIdCode: "#8574673",
    gender: "Female",
    age: 28,
    condition: "Hashimoto's Hypothyroidism",
    lastVisit: "14/04/2026",
    status: "Under Treatment",
    priority: "Medium",
    avatar: "",
    phone: "+1 (555) 334-5566",
    email: "sophia.m@example.com",
    allergies: ["Sulfa Drugs"],
    chronicConditions: ["Primary Hypothyroidism (Hashimoto's Thyroiditis)"],
    contraindications: ["Calcium or Iron supplements within 4 hours of Levothyroxine"],
    insightText:
      "TSH normalized to 2.1 mIU/L following dose adjustment to Levothyroxine 75 mcg. Fatigue and cold intolerance significantly decreased.",
    upcomingAppointment: {
      date: "08/05/2026",
      time: "11:45 - 12:30",
      status: "Pending",
      type: "Endocrine Thyroid Panel",
    },
    medications: [
      { name: "Levothyroxine Sodium", dosage: "75 mcg", frequency: "Once daily fasting (30 min before breakfast)", status: "Active" },
      { name: "Selenium", dosage: "200 mcg", frequency: "Once daily", status: "Active" },
    ],
  },
  {
    id: "pat_2",
    name: "Priya Sharma",
    patientIdCode: "#8574674",
    gender: "Female",
    age: 32,
    condition: "Postpartum Care & Mild Anemia",
    lastVisit: "16/04/2026",
    status: "Active",
    priority: "Low",
    avatar: "",
    phone: "+91 98111 22334",
    email: "priya.sharma@example.com",
    allergies: ["Aspirin (Asthma trigger / Bronchospasm)", "NSAIDs"],
    chronicConditions: ["Mild Microcytic Anemia", "Postpartum Wellness"],
    contraindications: ["Aspirin / NSAIDs (bronchospasm trigger)"],
    insightText:
      "Ferritin levels rising nicely on liposomal iron. Hemoglobin 11.4 g/dL. Blood pressure 118/76 mmHg. Baby and mother doing well.",
    upcomingAppointment: {
      date: "10/05/2026",
      time: "13:30 - 14:00",
      status: "Confirmed",
      type: "Routine Postnatal Follow-up",
    },
    medications: [
      { name: "Ferrous Ascorbate", dosage: "100 mg", frequency: "Once daily after meals", status: "Active" },
      { name: "Folic Acid", dosage: "5 mg", frequency: "Once daily", status: "Active" },
    ],
  },
];

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  state,
  onRefresh,
  activePatientId,
  onSelectPatient,
  signedInDoctor,
}) => {
  const matchedRosterDoctor = state.doctors.find((d) => d.id === signedInDoctor?.id);
  const doctorId = signedInDoctor?.id || matchedRosterDoctor?.id || "doc_1";
  const doctorFullName = signedInDoctor?.name || matchedRosterDoctor?.name || "Dr. Rajesh Sharma, MD";
  const doctorShortName = doctorFullName.split(",")[0].trim();
  const doctorSpecialty =
    signedInDoctor?.specialization || matchedRosterDoctor?.specialization || "Specialist Physician";
  const doctorPortrait = getSignedInDoctorPortrait(doctorId, doctorFullName, doctorSpecialty);
  // Navigation tabs from video: "Dashboard", "Patients", "Schedule", "Docs", "Reports"
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("Dashboard");

  // Selected patient for the Patient Card view
  const [selectedPatId, setSelectedPatId] = useState<string>(
    activePatientId || "pat_lisa"
  );

  // View state: when true, renders Screen 3: Patient Card; when false, renders Screen 1 (Dashboard) or Screen 2 (Patients)
  const [showPatientCard, setShowPatientCard] = useState<boolean>(false);

  // Sub-tabs in Patient Card: "Overview", "Records", "Treatments", "Notes"
  const [patientCardTab, setPatientCardTab] = useState<PatientCardSubTab>("Overview");

  // Vitals interactive metric selector: "bp", "heart_rate", "temperature", "weight"
  const [activeVital, setActiveVital] = useState<VitalMetric>("bp");

  // Calendar Day Selector strip (Sun 6 to Sun 13)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(12);

  // Search & Filter in Patients directory
  const [directorySearch, setDirectorySearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Prescription / Clinical note state
  const [soapNotes, setSoapNotes] = useState<string>(
    "Subjective: Patient reports feeling well. No dizziness, headaches, or palpitations.\nObjective: BP 124/80 mmHg, HR 72 bpm, SpO2 99% on room air.\nAssessment: Essential Hypertension well controlled on current regimen.\nPlan: Continue Telmisartan 40mg. Re-check renal profile and electrolytes in 3 months."
  );
  const [newMedName, setNewMedName] = useState("");
  const [newMedDose, setNewMedDose] = useState("");
  const [newMedFreq, setNewMedFreq] = useState("Once daily");
  const [prescriptionSent, setPrescriptionSent] = useState(false);
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);

  // Emergency Break-Glass override
  const [breakGlassActive, setBreakGlassActive] = useState<boolean>(false);

  // Report Detail Modal
  const [selectedRecordForModal, setSelectedRecordForModal] =
    useState<MedicalRecord | null>(null);

  // Schedule, Docs, Reports views state
  const [scheduleViewMode, setScheduleViewMode] = useState<"day" | "week">("day");
  const [docsCategoryFilter, setDocsCategoryFilter] = useState<string>("all");
  const [reportsCategoryFilter, setReportsCategoryFilter] = useState<string>("all");
  const [reportsOnlyAbnormal, setReportsOnlyAbnormal] = useState<boolean>(false);

  // Call simulation & clinical toast
  const [callingPatient, setCallingPatient] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Interactive modals, filter popover, & live clinical state
  const [customPatients, setCustomPatients] = useState<ExtendedPatient[]>([]);
  const [customMedications, setCustomMedications] = useState<
    Record<string, Array<{ name: string; dosage: string; frequency: string; status: string }>>
  >({});
  const [rescheduledMap, setRescheduledMap] = useState<
    Record<string, { date: string; time: string; status: "Confirmed" | "Pending" | "Cancelled"; type: string }>
  >({});
  const [customDashboardAppts, setCustomDashboardAppts] = useState<
    Array<{ id: string; time: string; patientId: string; type: string; status: "Confirmed" | "Pending" | "Cancelled" }>
  >([]);
  const [customScheduleSlots, setCustomScheduleSlots] = useState<
    Array<{ time: string; patId: string; patient: string; type: string; status: string; statusColor: string }>
  >([]);
  const [savedSoapNotesByPatient, setSavedSoapNotesByPatient] = useState<Record<string, string>>({});
  const [noteSavedAt, setNoteSavedAt] = useState<string>("Just now");

  // Calendar filter popover
  const [calendarStatusFilter, setCalendarStatusFilter] = useState<"all" | "Confirmed" | "Pending" | "Cancelled">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // New Patient Registration Modal
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [npName, setNpName] = useState("");
  const [npAge, setNpAge] = useState("35");
  const [npGender, setNpGender] = useState<"Male" | "Female" | "Other">("Male");
  const [npCondition, setNpCondition] = useState("");
  const [npPhone, setNpPhone] = useState("+91 98");
  const [npAllergies, setNpAllergies] = useState("");
  const [npPriority, setNpPriority] = useState<"High" | "Medium" | "Low">("Medium");

  // Add / Reschedule Appointment Modal
  const [appointmentModal, setAppointmentModal] = useState<{
    open: boolean;
    mode: "add" | "reschedule" | "schedule";
    patientId: string;
    date: string;
    time: string;
    type: string;
  }>({
    open: false,
    mode: "add",
    patientId: "pat_lisa",
    date: "2026-04-28",
    time: "15:00 - 15:30",
    type: "Follow Up Consultation",
  });

  // Clinical Chat Drawer
  const [chatDrawerPatientId, setChatDrawerPatientId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Record<string, Array<{ sender: "doctor" | "patient"; text: string; time: string }>>
  >({
    pat_lisa: [
      { sender: "patient", text: `Good morning ${doctorShortName}, my morning BP reading was 122/78 mmHg.`, time: "08:42 AM" },
      { sender: "doctor", text: "Great trend, Lisa. Keep taking Amlodipine 5mg daily and stay hydrated.", time: "09:05 AM" },
    ],
    pat_1: [
      { sender: "patient", text: `${doctorShortName}, I noticed Penicillin is flagged in my chart—should I confirm before dental work?`, time: "Yesterday" },
      { sender: "doctor", text: "Yes, always inform your dentist about your Penicillin allergy. We have logged strict alerts.", time: "Yesterday" },
    ],
  });

  // Sync external patient ID changes
  useEffect(() => {
    if (activePatientId) {
      setSelectedPatId(activePatientId);
    }
  }, [activePatientId]);

  // Merge directory patients with system patients and newly registered custom patients
  const allPatients: ExtendedPatient[] = useMemo(() => {
    const list = DIRECTORY_PATIENTS.map((p) => ({
      ...p,
      upcomingAppointment: rescheduledMap[p.id] || p.upcomingAppointment,
      medications: [...(customMedications[p.id] || []), ...p.medications],
    }));

    state.patients.forEach((p, idx) => {
      if (!list.some((dp) => dp.id === p.id)) {
        list.push({
          id: p.id,
          name: p.name,
          patientIdCode: `#85746${80 + idx}`,
          gender: p.gender === "Female" ? "Female" : "Male",
          age: p.age,
          condition: "Primary Clinical Review",
          lastVisit: "12/04/2026",
          status: "Under Treatment",
          priority: "Medium",
          avatar: "",
          phone: p.phone,
          email: p.email,
          allergies: p.allergies || [],
          chronicConditions: ["Clinical Evaluation on File"],
          contraindications: ["See documented allergies"],
          insightText:
            "Records synced from unified EHR repository. Review prior diagnostics and ongoing medications.",
          upcomingAppointment: rescheduledMap[p.id] || {
            date: "25/04/2026",
            time: "11:30 - 12:00",
            status: "Confirmed",
            type: "Clinical Consultation",
          },
          medications: [
            ...(customMedications[p.id] || []),
            { name: "Telmisartan", dosage: "40 mg", frequency: "Once daily morning", status: "Active" },
          ],
        });
      }
    });

    customPatients.forEach((cp) => {
      list.unshift({
        ...cp,
        upcomingAppointment: rescheduledMap[cp.id] || cp.upcomingAppointment,
        medications: [...(customMedications[cp.id] || []), ...cp.medications],
      });
    });

    return list;
  }, [state.patients, customPatients, customMedications, rescheduledMap]);

  // Current active patient object
  const currentPatient = useMemo(() => {
    return (
      allPatients.find((p) => p.id === selectedPatId) ||
      allPatients[0] ||
      DIRECTORY_PATIENTS[0]
    );
  }, [allPatients, selectedPatId]);

  useEffect(() => {
    if (savedSoapNotesByPatient[currentPatient.id]) {
      setSoapNotes(savedSoapNotesByPatient[currentPatient.id]);
    }
  }, [currentPatient.id]);

  // Open a patient card
  const handleOpenPatientCard = (patientId: string) => {
    setSelectedPatId(patientId);
    setShowPatientCard(true);
    setBreakGlassActive(false);
    if (onSelectPatient) {
      onSelectPatient(patientId);
    }
  };

  // Back from patient card
  const handleBackFromPatientCard = () => {
    setShowPatientCard(false);
  };

  // Calendar Day Strip data
  const calendarDays = [
    { dayName: "Sun", dateNum: 6 },
    { dayName: "Mon", dateNum: 7 },
    { dayName: "Tue", dateNum: 8 },
    { dayName: "Wed", dateNum: 9 },
    { dayName: "Thu", dateNum: 10 },
    { dayName: "Fri", dateNum: 11 },
    { dayName: "Sat", dateNum: 12 },
    { dayName: "Sun", dateNum: 13 },
  ];

  // Appointments for the calendar list
  const upcomingAppointments = useMemo(() => {
    const base = [
      {
        id: "apt_1",
        time: "9:30 - 10:00",
        patient: allPatients.find((p) => p.id === "pat_lisa") || allPatients[0],
        type: "Follow Up",
        status: "Confirmed" as const,
      },
      {
        id: "apt_2",
        time: "10:15 - 10:45",
        patient: allPatients.find((p) => p.id === "pat_emily") || allPatients[1],
        type: "Consultation",
        status: "Cancelled" as const,
      },
      {
        id: "apt_3",
        time: "11:00 - 11:45",
        patient: allPatients.find((p) => p.id === "pat_1") || allPatients[2],
        type: "Consultation",
        status: "Confirmed" as const,
      },
      {
        id: "apt_4",
        time: "11:45 - 12:30",
        patient: allPatients.find((p) => p.id === "pat_sophia") || allPatients[3],
        type: "Follow Up",
        status: "Pending" as const,
      },
    ];
    const added = customDashboardAppts.map((ca) => ({
      id: ca.id,
      time: ca.time,
      patient: allPatients.find((p) => p.id === ca.patientId) || allPatients[0],
      type: ca.type,
      status: ca.status,
    }));
    const merged = [...added, ...base];
    return calendarStatusFilter === "all"
      ? merged
      : merged.filter((a) => a.status === calendarStatusFilter);
  }, [allPatients, customDashboardAppts, calendarStatusFilter]);

  // Needs Attention patients
  const needsAttentionList = [
    {
      title: "Critical Condition",
      patient: allPatients.find((p) => p.id === "pat_david") || allPatients[2],
      timeframe: "Today",
      badgeColor: "bg-rose-500",
      textColor: "text-rose-600",
    },
    {
      title: "No Progress",
      patient: allPatients.find((p) => p.id === "pat_michael") || allPatients[3],
      timeframe: "Today",
      badgeColor: "bg-amber-500",
      textColor: "text-amber-600",
    },
    {
      title: "Missed Appointment",
      patient: allPatients.find((p) => p.id === "pat_annie") || allPatients[4],
      timeframe: "Yesterday",
      badgeColor: "bg-slate-400",
      textColor: "text-slate-500",
    },
  ];

  // Quick active patients list
  const quickActivePatients = [
    allPatients.find((p) => p.id === "pat_james") || allPatients[5],
    allPatients.find((p) => p.id === "pat_margaret") || allPatients[6],
    allPatients.find((p) => p.id === "pat_1") || allPatients[1],
    allPatients.find((p) => p.id === "pat_lisa") || allPatients[0],
  ];

  // Filtered patients for directory table
  const filteredPatients = useMemo(() => {
    return allPatients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(directorySearch.toLowerCase()) ||
        p.condition.toLowerCase().includes(directorySearch.toLowerCase()) ||
        p.patientIdCode.toLowerCase().includes(directorySearch.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        p.status.toLowerCase().replace(" ", "-") === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [allPatients, directorySearch, statusFilter]);

  // Prescription conflict checker
  const drugAllergyWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (!newMedName) return warnings;
    const nameLower = newMedName.toLowerCase();
    currentPatient.allergies.forEach((allergy) => {
      const allergyLower = allergy.toLowerCase();
      if (
        (allergyLower.includes("penicillin") &&
          (nameLower.includes("amoxicillin") ||
            nameLower.includes("ampicillin") ||
            nameLower.includes("penicillin") ||
            nameLower.includes("augmentin"))) ||
        (allergyLower.includes("sulfa") &&
          (nameLower.includes("sulfa") ||
            nameLower.includes("bactrim") ||
            nameLower.includes("septra"))) ||
        (allergyLower.includes("aspirin") &&
          (nameLower.includes("aspirin") ||
            nameLower.includes("nsaid") ||
            nameLower.includes("ibuprofen")))
      ) {
        warnings.push(
          `CRITICAL SAFETY ALERT: '${newMedName}' conflicts with patient's documented ${allergy}!`
        );
      }
    });
    return warnings;
  }, [newMedName, currentPatient]);

  // Submit prescription handler (connected to /api/prescriptions/add)
  const handleSendPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const medItem = {
      name: newMedName.trim(),
      dosage: newMedDose.trim() || "Standard",
      frequency: newMedFreq,
      status: "Active",
    };

    setIsSubmittingRx(true);
    try {
      const response = await authFetch("/api/prescriptions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: currentPatient.id,
          doctor_name: doctorFullName,
          notes: soapNotes,
          medicines: [
            {
              name: medItem.name,
              dosage: medItem.dosage,
              frequency: medItem.frequency,
            },
          ],
        }),
      });

      setCustomMedications((prev) => ({
        ...prev,
        [currentPatient.id]: [medItem, ...(prev[currentPatient.id] || [])],
      }));

      setPrescriptionSent(true);
      setNewMedName("");
      setNewMedDose("");
      showToast(`Prescription for ${medItem.name} (${medItem.dosage}) signed & transmitted.`);
      if (response.ok) {
        onRefresh();
      }
      setTimeout(() => setPrescriptionSent(false), 4000);
    } catch {
      setCustomMedications((prev) => ({
        ...prev,
        [currentPatient.id]: [medItem, ...(prev[currentPatient.id] || [])],
      }));
      setPrescriptionSent(true);
      setTimeout(() => setPrescriptionSent(false), 4000);
    } finally {
      setIsSubmittingRx(false);
    }
  };

  // Register new patient from modal
  const handleCreateNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!npName.trim()) return;
    const newId = `pat_custom_${Date.now()}`;
    const newPat: ExtendedPatient = {
      id: newId,
      name: npName.trim(),
      patientIdCode: `#857${Math.floor(1000 + Math.random() * 8999)}`,
      gender: npGender,
      age: Number(npAge) || 35,
      condition: npCondition.trim() || "General Clinical Evaluation",
      lastVisit: new Date().toLocaleDateString("en-GB"),
      status: "Active",
      priority: npPriority,
      avatar: "",
      phone: npPhone.trim() || "+91 98000 00000",
      allergies: npAllergies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      chronicConditions: [npCondition.trim() || "Initial Intake Assessment"],
      contraindications: ["Verify allergies prior to prescribing"],
      insightText: "Newly registered patient via Mediq Workstation. Ready for vitals and diagnostic review.",
      medications: [],
    };
    setCustomPatients((prev) => [newPat, ...prev]);
    setIsNewPatientModalOpen(false);
    setNpName("");
    setNpCondition("");
    setNpAllergies("");
    showToast(`Patient ${newPat.name} (${newPat.patientIdCode}) registered in directory.`);
    handleOpenPatientCard(newId);
  };

  // Save Appointment / Reschedule from modal
  const handleSaveAppointmentModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPat = allPatients.find((p) => p.id === appointmentModal.patientId) || currentPatient;
    try {
      await authFetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: targetPat.id,
          doctor_id: doctorId,
          clinic_id: matchedRosterDoctor?.clinic_id || "clinic_1",
          date: appointmentModal.date,
          time_slot: appointmentModal.time,
          reason: appointmentModal.type,
        }),
      });
    } catch {
      // keep optimistic clinical state
    }

    if (appointmentModal.mode === "reschedule") {
      setRescheduledMap((prev) => ({
        ...prev,
        [targetPat.id]: {
          date: appointmentModal.date,
          time: appointmentModal.time,
          status: "Confirmed",
          type: appointmentModal.type,
        },
      }));
      showToast(`Rescheduled ${targetPat.name} to ${appointmentModal.date} (${appointmentModal.time}).`);
    } else {
      setCustomDashboardAppts((prev) => [
        {
          id: `apt_doc_${Date.now()}`,
          time: appointmentModal.time,
          patientId: targetPat.id,
          type: appointmentModal.type,
          status: "Confirmed",
        },
        ...prev,
      ]);
      setCustomScheduleSlots((prev) => [
        {
          time: appointmentModal.time,
          patId: targetPat.id,
          patient: targetPat.name,
          type: appointmentModal.type,
          status: "Confirmed",
          statusColor: "bg-blue-50 text-blue-700 border border-blue-200",
        },
        ...prev,
      ]);
      showToast(`Appointment booked for ${targetPat.name} at ${appointmentModal.time}.`);
    }
    setAppointmentModal((prev) => ({ ...prev, open: false }));
    onRefresh();
  };

  // Send clinical chat reply
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatDrawerPatientId || !chatInput.trim()) return;
    const nowLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChatMessages((prev) => ({
      ...prev,
      [chatDrawerPatientId]: [
        ...(prev[chatDrawerPatientId] || []),
        { sender: "doctor", text: chatInput.trim(), time: nowLabel },
      ],
    }));
    setChatInput("");
  };

  // Trigger call modal
  const handleInitiateCall = (pat: ExtendedPatient) => {
    setCallingPatient(pat.name);
    setTimeout(() => {
      setCallingPatient(null);
    }, 4500);
  };

  // Vitals data series
  const vitalsData = {
    bp: {
      title: "Blood Pressure",
      unit: "mmHg",
      current: "124/80",
      status: "Optimal",
      target: "< 130/80 mmHg",
      points: [
        { label: "06 Apr", val: 140, diastolic: 90 },
        { label: "10 Apr", val: 136, diastolic: 88 },
        { label: "14 Apr", val: 132, diastolic: 84 },
        { label: "18 Apr", val: 128, diastolic: 82 },
        { label: "22 Apr", val: 124, diastolic: 80 },
      ],
    },
    heart_rate: {
      title: "Heart Rate",
      unit: "bpm",
      current: "72",
      status: "Normal Sinus",
      target: "60 - 100 bpm",
      points: [
        { label: "06 Apr", val: 82 },
        { label: "10 Apr", val: 78 },
        { label: "14 Apr", val: 75 },
        { label: "18 Apr", val: 74 },
        { label: "22 Apr", val: 72 },
      ],
    },
    temperature: {
      title: "Body Temperature",
      unit: "°F",
      current: "98.4",
      status: "Afebrile",
      target: "97.8 - 99.1 °F",
      points: [
        { label: "06 Apr", val: 98.6 },
        { label: "10 Apr", val: 98.4 },
        { label: "14 Apr", val: 98.5 },
        { label: "18 Apr", val: 98.3 },
        { label: "22 Apr", val: 98.4 },
      ],
    },
    weight: {
      title: "Weight Trend",
      unit: "kg",
      current: "64.2",
      status: "Stable",
      target: "62 - 65 kg",
      points: [
        { label: "06 Apr", val: 66.0 },
        { label: "10 Apr", val: 65.4 },
        { label: "14 Apr", val: 64.9 },
        { label: "18 Apr", val: 64.5 },
        { label: "22 Apr", val: 64.2 },
      ],
    },
  };

  const currentVitalSeries = vitalsData[activeVital];

  // Related timeline records for current patient
  const patientRecords = useMemo(() => {
    return state.timeline.filter(
      (r) => !r.patient_id || r.patient_id === currentPatient.id
    );
  }, [state.timeline, currentPatient.id]);

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          TOP MEDIQ DOCTOR BAR (From Video)
      ───────────────────────────────────────────────────────────── */}
      <header className="w-full bg-white rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand: Mediq */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <span className="font-bold text-xl leading-none">+</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-lg tracking-tight">Mediq</span>
              <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">Plus</span>
            </div>
            <p className="text-[11px] text-slate-400">mediqplus.com · Clinical Hub</p>
          </div>
        </div>

        {/* Center Pill Capsule Tabs */}
        <nav className="flex items-center bg-slate-100/80 p-1.5 rounded-full border border-slate-200/50">
          {(["Dashboard", "Patients", "Schedule", "Docs", "Reports"] as MainTab[]).map(
            (tab) => {
              const isActive = activeMainTab === tab && !showPatientCard;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveMainTab(tab);
                    setShowPatientCard(false);
                  }}
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              );
            }
          )}
        </nav>

        {/* Right Controls: Search, Bell, Doctor Profile */}
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200/60 rounded-full px-3 py-1.5 text-xs text-slate-600 focus-within:ring-2 focus-within:ring-emerald-500/30">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none w-24 lg:w-36 text-xs text-slate-800 placeholder-slate-400"
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
            />
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => onRefresh()}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 relative transition-colors cursor-pointer"
            title="Refresh clinical alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
          </button>

          {/* Doctor Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="relative">
              <img
                src={doctorPortrait}
                alt={doctorShortName}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover object-top ring-2 ring-emerald-500/30"
              />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-800">{doctorShortName}</p>
              <p className="text-[10px] text-slate-400">{doctorSpecialty}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Non-blocking Clinical Toast Banner */}
      {toastMessage && (
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Calling Simulation Modal / Banner */}
      {callingPatient && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5" />
            <span className="text-sm font-medium">
              Connecting secure telehealth call with <strong>{callingPatient}</strong>...
            </span>
          </div>
          <button
            onClick={() => setCallingPatient(null)}
            className="text-xs bg-white text-emerald-800 px-3 py-1 rounded-xl font-semibold cursor-pointer"
          >
            End Call
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SCREEN 3: PATIENT CARD (Patient Context View)
          Shown when a patient is opened
      ───────────────────────────────────────────────────────────── */}
      {showPatientCard ? (
        <div className="w-full flex flex-col space-y-6">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackFromPatientCard}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to {activeMainTab}
              </button>
              <div className="h-4 w-px bg-slate-200" />
              <h1 className="text-base font-semibold text-slate-900">Patient Card</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                Export
              </button>
              <button
                onClick={() => setBreakGlassActive(!breakGlassActive)}
                className={`text-xs font-medium px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                  breakGlassActive
                    ? "bg-rose-600 text-white font-bold"
                    : "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
                title="Emergency EHR Override"
              >
                <Zap className="w-3.5 h-3.5" />
                {breakGlassActive ? "Emergency Override Active" : "Break-Glass"}
              </button>
            </div>
          </div>

          {/* Hero Patient Header Card (From Video) */}
          <div className="w-full bg-white rounded-3xl p-6 lg:p-7 shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Demographics & Avatar (5 cols) */}
            <div className="lg:col-span-4 flex items-start gap-4">
              <div className="relative shrink-0">
                <PatientAvatar name={currentPatient.name} size="xl" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 absolute -bottom-1 -right-1 ring-2 ring-white"></span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {currentPatient.name}
                  </h2>
                  <span className="text-[11px] font-mono text-slate-400">
                    {currentPatient.patientIdCode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                      currentPatient.status === "At Risk"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : currentPatient.status === "Under Treatment"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {currentPatient.status}
                  </span>
                  <span className="text-xs text-slate-400">· Priority {currentPatient.priority}</span>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleInitiateCall(currentPatient)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title={`Call ${currentPatient.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setChatDrawerPatientId(currentPatient.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Open Clinical Chat"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setAppointmentModal({
                        open: true,
                        mode: "add",
                        patientId: currentPatient.id,
                        date: "2026-05-12",
                        time: "10:30 - 11:00",
                        type: "Follow Up Consultation",
                      })
                    }
                    className="text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Schedule Visit
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Stats Grid (4 cols) */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4 py-2 px-3 border-y lg:border-y-0 lg:border-x border-slate-100">
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Gender
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {currentPatient.gender}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Age
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {currentPatient.age} yrs
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Primary Diagnosis
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5 line-clamp-1">
                  {currentPatient.condition}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Last Visit
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {currentPatient.lastVisit}
                </p>
              </div>
            </div>

            {/* Right Upcoming Appointment Card (4 cols) */}
            <div className="lg:col-span-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Upcoming Appointment
                  </p>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {currentPatient.upcomingAppointment?.status || "Confirmed"}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    {currentPatient.upcomingAppointment?.date || "24/04/2026"}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">
                    {currentPatient.upcomingAppointment?.time || "9:30 - 10:00"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {currentPatient.upcomingAppointment?.type || "Follow Up Consultation"}
                </p>
              </div>
              <button
                onClick={() =>
                  setAppointmentModal({
                    open: true,
                    mode: "reschedule",
                    patientId: currentPatient.id,
                    date: currentPatient.upcomingAppointment?.date || "26/04/2026",
                    time: currentPatient.upcomingAppointment?.time || "10:15 - 10:45",
                    type: currentPatient.upcomingAppointment?.type || "Follow Up Consultation",
                  })
                }
                className="mt-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 py-1.5 px-3 rounded-xl transition-colors cursor-pointer text-center"
              >
                Reschedule
              </button>
            </div>

            {/* Bottom Insight Quote / Notice */}
            <div className="lg:col-span-12 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl px-4 py-3 flex items-start gap-3">
              <Activity className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {currentPatient.insightText}
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs: Overview, Records, Treatments, Notes */}
          <div className="flex items-center border-b border-slate-200">
            {(["Overview", "Records", "Treatments", "Notes"] as PatientCardSubTab[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setPatientCardTab(tab)}
                  className={`pb-3 px-5 text-sm font-medium transition-colors cursor-pointer relative ${
                    patientCardTab === tab
                      ? "text-emerald-700 font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                  {patientCardTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"></span>
                  )}
                </button>
              )
            )}
          </div>

          {/* TAB 1: OVERVIEW (From Video) */}
          {patientCardTab === "Overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Card 1: Medical Summary (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Medical Summary
                  </h3>
                  <span className="text-[11px] text-slate-400">Verified EHR</span>
                </div>

                {/* Chronic Conditions */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Chronic Conditions
                  </p>
                  <div className="space-y-1.5">
                    {currentPatient.chronicConditions.map((cond, i) => (
                      <div
                        key={i}
                        className="text-xs text-slate-700 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {cond}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contraindications */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Contraindications
                  </p>
                  <div className="space-y-1.5">
                    {currentPatient.contraindications.map((contra, i) => (
                      <div
                        key={i}
                        className="text-xs text-amber-800 bg-amber-50/70 rounded-xl px-3 py-2 border border-amber-200/50 flex items-center gap-2"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        {contra}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergies (Vital Safety Notice) */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    Allergies & Hypersensitivity
                  </p>
                  <div className="space-y-1.5">
                    {currentPatient.allergies.length > 0 ? (
                      currentPatient.allergies.map((allg, i) => (
                        <div
                          key={i}
                          className="text-xs font-medium text-rose-800 bg-rose-50 rounded-xl px-3 py-2 border border-rose-200 flex items-center justify-between"
                        >
                          <span>{allg}</span>
                          <span className="text-[10px] uppercase font-bold text-rose-600">
                            Strict
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No allergies documented</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Current Medications (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <Pill className="w-4 h-4 text-emerald-600" />
                      Current Medications
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Active pharmacotherapy with frequency and dosage
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPatientCardTab("Treatments");
                    }}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Prescribe
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-medium">
                        <th className="pb-3 font-semibold">Medication</th>
                        <th className="pb-3 font-semibold">Dosage</th>
                        <th className="pb-3 font-semibold">Frequency</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {currentPatient.medications.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 font-semibold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {med.name}
                          </td>
                          <td className="py-3 text-slate-600">{med.dosage}</td>
                          <td className="py-3 text-slate-600">{med.frequency}</td>
                          <td className="py-3">
                            <span className="bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                              {med.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() =>
                                showToast(`Refill ordered for ${med.name} (${med.dosage}) — sent to pharmacy.`)
                              }
                              className="text-[11px] font-medium text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg border border-slate-200 hover:bg-white cursor-pointer"
                            >
                              Refill
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vitals Graph Container (Dynamic per metric tab) */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                        Vitals Tracking &amp; Longitudinal Trend
                      </h4>
                      <p className="text-[11px] text-slate-400 tabular-nums">
                        Current: <strong>{currentVitalSeries.current} {currentVitalSeries.unit}</strong> ({currentVitalSeries.status}) &middot; Target: {currentVitalSeries.target}
                      </p>
                    </div>

                    {/* Vitals metric tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(
                        [
                          { id: "bp", label: "BP" },
                          { id: "heart_rate", label: "Heart Rate" },
                          { id: "temperature", label: "Temp" },
                          { id: "weight", label: "Weight" },
                        ] as Array<{ id: VitalMetric; label: string }>
                      ).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setActiveVital(m.id)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                            activeVital === m.id
                              ? "bg-white text-slate-900 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic SVG Chart rendering */}
                  {(() => {
                    const pts = currentVitalSeries.points;
                    const vals = pts.map((p) => p.val);
                    const minVal = Math.min(...vals);
                    const maxVal = Math.max(...vals);
                    const span = Math.max(0.5, maxVal - minVal);
                    const xs = [25, 135, 245, 355, 470];
                    const coords = pts.map((p, idx) => {
                      const norm = (p.val - minVal) / span;
                      const cy = Math.round(82 - norm * 55);
                      return { cx: xs[idx] || 25 + idx * 110, cy, val: `${p.val}` };
                    });
                    const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.cx} ${c.cy}`).join(" ");
                    const areaPath = `${linePath} L ${coords[coords.length - 1].cx} 118 L ${coords[0].cx} 118 Z`;

                    return (
                      <div className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-4">
                        <div className="h-44 w-full relative flex items-end">
                          {/* Grid lines */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                            <div className="border-b border-dashed border-slate-300 w-full"></div>
                            <div className="border-b border-dashed border-slate-300 w-full"></div>
                            <div className="border-b border-dashed border-slate-300 w-full"></div>
                          </div>

                          {/* SVG Line */}
                          <svg className="w-full h-36 overflow-visible" viewBox="0 0 500 120">
                            <rect x="0" y="30" width="500" height="44" fill="#10B981" fillOpacity="0.08" rx="4" />
                            <path
                              d={linePath}
                              fill="none"
                              stroke="#059669"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path d={areaPath} fill="url(#greenGradient)" fillOpacity="0.15" />
                            <defs>
                              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#059669" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            {coords.map((dot, i) => (
                              <g key={i}>
                                <circle cx={dot.cx} cy={dot.cy} r="5" fill="#ffffff" stroke="#059669" strokeWidth="3" />
                                <text
                                  x={dot.cx}
                                  y={dot.cy - 10}
                                  textAnchor="middle"
                                  fill="#0f172a"
                                  fontSize="10"
                                  fontWeight="bold"
                                >
                                  {dot.val}
                                </text>
                              </g>
                            ))}
                          </svg>
                        </div>

                        {/* Chart X axis dates */}
                        <div className="flex justify-between pt-2 px-3 text-[10px] text-slate-400 font-medium tabular-nums">
                          {pts.map((p, i) => (
                            <span key={i}>{p.label}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RECORDS & DIAGNOSTICS */}
          {patientCardTab === "Records" && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Patient Diagnostic History & Reports
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any record to inspect abnormalities and raw diagnostic panels
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                  {patientRecords.length} records available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {patientRecords.map((rec) => {
                  const abnormalCount =
                    rec.extracted_data?.tests?.filter(
                      (t) => t.status === "HIGH" || t.status === "LOW" || t.status === "ELEVATED"
                    ).length || 0;

                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRecordForModal(rec)}
                      className="bg-slate-50/70 hover:bg-emerald-50/40 p-4 rounded-2xl border border-slate-200/60 hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                              {rec.title}
                            </span>
                            <span className="text-[10px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                              {rec.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {rec.record_date} · {rec.doctor_or_facility}
                          </p>
                        </div>
                        {abnormalCount > 0 ? (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {abnormalCount} Abnormal
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Normal
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                        {rec.ai_summary || rec.raw_text}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-between text-xs text-emerald-700 font-medium">
                        <span>Inspect abnormalities & parameters</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TREATMENTS & PRESCRIPTIONS */}
          {patientCardTab === "Treatments" && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  Prescribe Medication & Dispatch Digital Order
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated contraindication & allergy verification active
                </p>
              </div>

              {/* Drug-Allergy Warning Alert */}
              {drugAllergyWarnings.length > 0 && (
                <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-800">
                      SAFETY CONTRAINDICATION TRIGGERED
                    </h4>
                    {drugAllergyWarnings.map((w, idx) => (
                      <p key={idx} className="text-xs text-rose-700 font-medium mt-1">
                        {w}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {prescriptionSent && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Prescription transmitted successfully to pharmacy & logged in patient EHR.
                </div>
              )}

              <form onSubmit={handleSendPrescription} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Medication Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Telmisartan, Metformin..."
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 40 mg, 500 mg..."
                      value={newMedDose}
                      onChange={(e) => setNewMedDose(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Frequency & Timing
                    </label>
                    <select
                      value={newMedFreq}
                      onChange={(e) => setNewMedFreq(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 bg-white"
                    >
                      <option value="Once daily morning">Once daily morning</option>
                      <option value="Once daily bedtime">Once daily bedtime</option>
                      <option value="Twice daily after meals">Twice daily after meals</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="PRN as needed">PRN as needed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Instructions & SOAP Notes
                  </label>
                  <textarea
                    rows={4}
                    value={soapNotes}
                    onChange={(e) => setSoapNotes(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingRx || drugAllergyWarnings.length > 0}
                    className={`text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                      drugAllergyWarnings.length > 0
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmittingRx ? "Signing & Dispatching..." : "Sign & Dispatch Prescription"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: CLINICAL NOTES */}
          {patientCardTab === "Notes" && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-slate-600" />
                Physician Progress Notes (SOAP Format)
              </h3>
              <p className="text-xs text-slate-400">
                Encrypted clinical documentation stamped with attending physician timestamp
              </p>
              <textarea
                rows={8}
                value={soapNotes}
                onChange={(e) => setSoapNotes(e.target.value)}
                className="w-full text-xs p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono leading-relaxed"
              />
              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-slate-400">
                  Last saved: {noteSavedAt} &middot; {doctorShortName} (Attending)
                </span>
                <button
                  onClick={() => {
                    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    setSavedSoapNotesByPatient((prev) => ({
                      ...prev,
                      [currentPatient.id]: soapNotes,
                    }));
                    setNoteSavedAt(ts);
                    showToast(`Progress note signed at ${ts} for ${currentPatient.name}.`);
                  }}
                  className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Save Progress Note
                </button>
              </div>
            </div>
          )}
        </div>
      ) : activeMainTab === "Patients" ? (
        /* ─────────────────────────────────────────────────────────────
            SCREEN 2: PATIENTS DIRECTORY / TABLE
        ───────────────────────────────────────────────────────────── */
        <div className="w-full flex flex-col space-y-5">
          {/* Patients Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patients</h1>
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  {filteredPatients.length} patients
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your clinical registry, review risk priorities, and launch patient context cards
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    "ID,Name,Gender,Age,Condition,LastVisit,Status,Priority\n" +
                    filteredPatients
                      .map(
                        (p) =>
                          `${p.patientIdCode},${p.name},${p.gender},${p.age},${p.condition},${p.lastVisit},${p.status},${p.priority}`
                      )
                      .join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "mediq_patients_registry.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  showToast("Exported patient registry CSV.");
                }}
                className="text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                Export
              </button>
              <button
                onClick={() => setIsNewPatientModalOpen(true)}
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Patient
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80 flex items-center bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search patients by name or condition..."
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200/60 text-slate-700 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="at-risk">At Risk</option>
                <option value="under-treatment">Under Treatment</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          {/* Patients Registry Table (From Video) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
                    <th className="py-3.5 px-5">Patient</th>
                    <th className="py-3.5 px-3">Gender</th>
                    <th className="py-3.5 px-3">Age</th>
                    <th className="py-3.5 px-4">Condition</th>
                    <th className="py-3.5 px-4">Last Visit</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Priority</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPatients.map((pat) => (
                    <tr
                      key={pat.id}
                      onClick={() => handleOpenPatientCard(pat.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Patient Avatar + Name + ID */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <PatientAvatar name={pat.name} size="md" />
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {pat.name}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">
                              {pat.patientIdCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600">{pat.gender}</td>
                      <td className="py-3.5 px-3 text-slate-600">{pat.age}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {pat.condition}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{pat.lastVisit}</td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                            pat.status === "At Risk"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : pat.status === "Under Treatment"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {pat.status}
                        </span>
                      </td>

                      {/* Priority Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block ${
                            pat.priority === "High"
                              ? "bg-rose-50 text-rose-600 font-bold"
                              : pat.priority === "Medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {pat.priority}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPatientCard(pat.id);
                          }}
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                        >
                          Open Card
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer (From Video) */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <p>Showing page {currentPage} of 6 (Total {filteredPatients.length} records)</p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Previous
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg font-medium transition-colors cursor-pointer ${
                      currentPage === page
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="px-1 text-slate-400">...</span>
                <button
                  onClick={() => setCurrentPage(6)}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  6
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(6, currentPage + 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeMainTab === "Dashboard" ? (
        /* ─────────────────────────────────────────────────────────────
            SCREEN 1: DASHBOARD (From Video)
        ───────────────────────────────────────────────────────────── */
        <div className="w-full flex flex-col space-y-6">
          {/* Greeting Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl lg:text-3xl font-light text-slate-900 tracking-tight">
                Hello, <span className="font-semibold text-slate-900">{doctorShortName}</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Welcome back. You have 12 appointments scheduled for today.
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                All Clinic Systems Operational
              </span>
            </div>
          </div>

          {/* 4 Stat Metric Cards (From Video) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Active Patients */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Active Patients
              </p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">124</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +14%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">vs last week</p>
            </div>

            {/* Metric 2: Appointments Today */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Appointments Today
              </p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">12</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Plus className="w-3 h-3" />
                  +6
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">from last week</p>
            </div>

            {/* Metric 3: Completed Sessions */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Completed Sessions
              </p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">18</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +9%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">vs last week</p>
            </div>

            {/* Metric 4: Avg Visit Time */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Avg Visit Time
              </p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">24 min</span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  +5 min
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">from last month</p>
            </div>
          </div>

          {/* Main 2-Column Dashboard Grid (From Video) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 2/3 Column: Upcoming Appointments & Calendar Selector */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col space-y-5">
              {/* Header with Title, Filter Popover, + Add Appointment */}
              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Upcoming Appointments
                  </h2>
                  {calendarStatusFilter !== "all" && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {calendarStatusFilter}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        calendarStatusFilter !== "all"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                      title="Filter appointments by status"
                    >
                      <Filter className="w-3.5 h-3.5" />
                    </button>
                    {isFilterOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-lg border border-slate-200/80 py-1.5 z-30">
                        {(["all", "Confirmed", "Pending", "Cancelled"] as const).map((statusOpt) => (
                          <button
                            key={statusOpt}
                            onClick={() => {
                              setCalendarStatusFilter(statusOpt);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between cursor-pointer ${
                              calendarStatusFilter === statusOpt
                                ? "bg-slate-100 font-semibold text-slate-900"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span>{statusOpt === "all" ? "All Statuses" : statusOpt}</span>
                            {calendarStatusFilter === statusOpt && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setAppointmentModal({
                        open: true,
                        mode: "add",
                        patientId: allPatients[0]?.id || "pat_lisa",
                        date: "2026-04-28",
                        time: "15:00 - 15:30",
                        type: "Consultation",
                      })
                    }
                    className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Appointment
                  </button>
                </div>
              </div>

              {/* Day of Week Selector Strip (Sun 6 to Sun 13) */}
              <div className="grid grid-cols-8 gap-1.5 sm:gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-200/50">
                {calendarDays.map((item) => {
                  const isSelected = selectedCalendarDay === item.dateNum;
                  return (
                    <button
                      key={item.dateNum}
                      onClick={() => setSelectedCalendarDay(item.dateNum)}
                      className={`flex flex-col items-center justify-center py-2 sm:py-2.5 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-200/60"
                      }`}
                    >
                      <span className="text-[10px] font-medium">{item.dayName}</span>
                      <span className="text-xs sm:text-sm font-bold mt-0.5">
                        {item.dateNum}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Appointments List */}
              <div className="space-y-3 pt-1">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => handleOpenPatientCard(apt.patient.id)}
                    className="p-4 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200/70 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group shadow-2xs"
                  >
                    {/* Time & Patient Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-xl text-center shrink-0">
                        {apt.time}
                      </div>
                      <PatientAvatar name={apt.patient.name} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {apt.patient.name}
                          </h3>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              apt.status === "Confirmed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : apt.status === "Cancelled"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {apt.type} &middot; {apt.patient.condition}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Phone, Chat, Patient Card Button */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInitiateCall(apt.patient);
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title={`Call ${apt.patient.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatDrawerPatientId(apt.patient.id);
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Open Clinical Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPatientCard(apt.patient.id);
                        }}
                        className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Patient Card &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1/3 Column: Needs Attention & Active Patients */}
            <div className="lg:col-span-4 space-y-6">
              {/* Needs Attention Widget (From Video) */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Needs Attention
                  </h2>
                  <button
                    onClick={() => setActiveMainTab("Patients")}
                    className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2.5">
                  {needsAttentionList.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleOpenPatientCard(item.patient.id)}
                      className="p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/50 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.badgeColor}`}></span>
                        <div>
                          <p className={`text-xs font-bold ${item.textColor}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-800 font-medium group-hover:text-emerald-700 transition-colors">
                            {item.patient.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.timeframe}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Patients Widget (From Video) */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Active Patients
                  </h2>
                  <button
                    onClick={() => setActiveMainTab("Patients")}
                    className="text-xs text-slate-400 hover:text-slate-800 cursor-pointer"
                  >
                    Directory
                  </button>
                </div>

                <div className="space-y-2">
                  {quickActivePatients.map((pat) => (
                    <div
                      key={pat.id}
                      onClick={() => handleOpenPatientCard(pat.id)}
                      className="p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <PatientAvatar name={pat.name} size="md" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {pat.name}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {pat.condition}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeMainTab === "Schedule" ? (
        /* ─────────────────────────────────────────────────────────────
            SCREEN 4: CLINICAL SCHEDULE & TIMETABLE
        ───────────────────────────────────────────────────────────── */
        <div className="w-full flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Schedule</h1>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                  12 Appointments Today
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage appointment slots, emergency walk-ins, and outpatient consults
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setScheduleViewMode("day")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    scheduleViewMode === "day"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Day View
                </button>
                <button
                  onClick={() => setScheduleViewMode("week")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    scheduleViewMode === "week"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Week View
                </button>
              </div>

              <button
                onClick={() =>
                  setAppointmentModal({
                    open: true,
                    mode: "schedule",
                    patientId: allPatients[0]?.id || "pat_lisa",
                    date: "2026-04-12",
                    time: "04:15 - 04:45 PM",
                    type: "Cardiology Outpatient Consult",
                  })
                }
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Book Slot
              </button>
            </div>
          </div>

          {/* Schedule Calendar Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {calendarDays.map((cal) => {
              const isSelected = selectedCalendarDay === cal.dateNum;
              return (
                <button
                  key={cal.dateNum}
                  onClick={() => setSelectedCalendarDay(cal.dateNum)}
                  className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105"
                      : "bg-white text-slate-600 border border-slate-200/60 hover:border-slate-300"
                  }`}
                >
                  <span className={`text-[11px] font-medium ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                    {cal.dayName}
                  </span>
                  <span className="text-base font-bold mt-0.5 tabular-nums">{cal.dateNum}</span>
                </button>
              );
            })}
          </div>

          {/* Timetable Slot Grid */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Timeline &middot; April {selectedCalendarDay}, 2026 ({scheduleViewMode === "week" ? "Week Overview" : "Day View"})</span>
              <span className="text-xs font-normal text-slate-400 tabular-nums">Current Time: 10:30 AM</span>
            </h2>

            <div className="space-y-4">
              {[
                ...customScheduleSlots,
                {
                  time: "09:00 - 09:30 AM",
                  patId: "pat_lisa",
                  patient: "Lisa Holloway",
                  type: "Hypertension Follow-Up",
                  status: "Completed",
                  statusColor: "bg-slate-100 text-slate-600",
                },
                {
                  time: "09:30 - 10:00 AM",
                  patId: "pat_1",
                  patient: "Rahul Jadhav",
                  type: "Routine Checkup",
                  status: "Completed",
                  statusColor: "bg-slate-100 text-slate-600",
                },
                {
                  time: "10:15 - 10:45 AM",
                  patId: "pat_emily",
                  patient: "Emily Davis",
                  type: "Immunology Consultation",
                  status: "Cancelled",
                  statusColor: "bg-rose-50 text-rose-600 border border-rose-200",
                },
                {
                  time: "11:00 - 11:45 AM",
                  patId: "pat_1",
                  patient: "Rahul Jadhav",
                  type: "Cardiology Review & ECG",
                  status: "In Progress",
                  statusColor: "bg-emerald-50 text-emerald-700 border border-emerald-200",
                },
                {
                  time: "11:45 - 12:30 PM",
                  patId: "pat_sophia",
                  patient: "Sophia Martinez",
                  type: "Thyroid & Metabolic Review",
                  status: "Confirmed",
                  statusColor: "bg-blue-50 text-blue-700 border border-blue-200",
                },
                {
                  time: "02:00 - 02:45 PM",
                  patId: "pat_david",
                  patient: "David Wilson",
                  type: "Arrhythmia Holter Evaluation",
                  status: "Confirmed",
                  statusColor: "bg-blue-50 text-blue-700 border border-blue-200",
                },
                {
                  time: "03:15 - 04:00 PM",
                  patId: "pat_michael",
                  patient: "Michael Smith",
                  type: "Diabetes HbA1c Management",
                  status: "Confirmed",
                  statusColor: "bg-blue-50 text-blue-700 border border-blue-200",
                },
              ].map((slot, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-32 shrink-0">
                      <span className="text-xs font-bold text-slate-800">{slot.time}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{slot.patient}</h3>
                      <p className="text-xs text-slate-400">{slot.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${slot.statusColor}`}>
                      {slot.status}
                    </span>
                    <button
                      onClick={() => handleOpenPatientCard(slot.patId)}
                      className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Patient Card &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeMainTab === "Docs" ? (
        /* ─────────────────────────────────────────────────────────────
            SCREEN 5: CLINICAL DOCUMENTS & E-PRESCRIPTIONS
        ───────────────────────────────────────────────────────────── */
        <div className="w-full flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Documents</h1>
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  18 Active Records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                E-Prescriptions, consultation summaries, DPDP data sharing consents, and lab referral orders
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={docsCategoryFilter}
                onChange={(e) => setDocsCategoryFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200/80 text-slate-700 rounded-xl px-3 py-2 outline-none cursor-pointer shadow-xs"
              >
                <option value="all">All Document Types</option>
                <option value="rx">E-Prescriptions</option>
                <option value="summary">Discharge Summaries</option>
                <option value="consent">DPDP Consents</option>
                <option value="referral">Referral Slips</option>
              </select>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
                  <th className="py-3.5 px-5">Document ID &amp; Type</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Date Issued</th>
                  <th className="py-3.5 px-4">Signing Doctor</th>
                  <th className="py-3.5 px-4">Security &amp; Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  {
                    docId: "eRx-2026-1049",
                    cat: "rx",
                    type: "E-Prescription",
                    patient: "Lisa Holloway",
                    patId: "pat_lisa",
                    date: "12/04/2026",
                    doctor: `${doctorShortName} (${doctorSpecialty})`,
                    status: "Digitally Signed",
                    badge: "bg-emerald-50 text-emerald-700",
                  },
                  {
                    docId: "eRx-2026-1048",
                    cat: "rx",
                    type: "E-Prescription",
                    patient: "Rahul Jadhav",
                    patId: "pat_1",
                    date: "12/04/2026",
                    doctor: `${doctorShortName} (${doctorSpecialty})`,
                    status: "Digitally Signed",
                    badge: "bg-emerald-50 text-emerald-700",
                  },
                  {
                    docId: "DS-2026-8812",
                    cat: "summary",
                    type: "Discharge Summary",
                    patient: "David Wilson",
                    patId: "pat_david",
                    date: "10/04/2026",
                    doctor: `${doctorShortName} (${doctorSpecialty})`,
                    status: "Locked & Archival",
                    badge: "bg-slate-100 text-slate-600",
                  },
                  {
                    docId: "LR-2026-4401",
                    cat: "referral",
                    type: "Lab Referral Slip",
                    patient: "Michael Smith",
                    patId: "pat_michael",
                    date: "09/04/2026",
                    doctor: `${doctorShortName} (${doctorSpecialty})`,
                    status: "Pending Dispatch",
                    badge: "bg-amber-50 text-amber-700",
                  },
                  {
                    docId: "DPDP-2026-102",
                    cat: "consent",
                    type: "DPDP Consent Record",
                    patient: "Annie Lee",
                    patId: "pat_annie",
                    date: "08/04/2026",
                    doctor: "System Consent Gateway",
                    status: "Active Consent",
                    badge: "bg-blue-50 text-blue-700",
                  },
                ]
                  .filter((d) => docsCategoryFilter === "all" || d.cat === docsCategoryFilter)
                  .map((doc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-bold text-slate-900">{doc.docId}</p>
                          <p className="text-[11px] text-slate-400">{doc.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{doc.patient}</td>
                    <td className="py-3.5 px-4 text-slate-500">{doc.date}</td>
                    <td className="py-3.5 px-4 text-slate-600">{doc.doctor}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${doc.badge}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleOpenPatientCard(doc.patId)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl transition-colors cursor-pointer"
                      >
                        Open Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeMainTab === "Reports" ? (
        /* ─────────────────────────────────────────────────────────────
            SCREEN 6: DIAGNOSTIC REPORTS & LAB ABNORMALITIES FEED
        ───────────────────────────────────────────────────────────── */
        <div className="w-full flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Diagnostic Reports</h1>
                <span className="text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-0.5 rounded-full">
                  4 Abnormal Flags
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any report to inspect parameter abnormalities, ECG waveforms, and reference bounds without clutter
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200/80 px-3 py-2 rounded-xl cursor-pointer shadow-xs">
                <input
                  type="checkbox"
                  checked={reportsOnlyAbnormal}
                  onChange={(e) => setReportsOnlyAbnormal(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium">Show Abnormal Only</span>
              </label>

              <select
                value={reportsCategoryFilter}
                onChange={(e) => setReportsCategoryFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200/80 text-slate-700 rounded-xl px-3 py-2 outline-none cursor-pointer shadow-xs"
              >
                <option value="all">All Specialties</option>
                <option value="Cardiology">Cardiology / ECG</option>
                <option value="Hematology">Hematology / CBC</option>
                <option value="Biochemistry">Biochemistry &amp; Lipids</option>
                <option value="Pulmonary">Pulmonary &amp; Spirometry</option>
              </select>
            </div>
          </div>

          {/* Diagnostic Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.timeline
              .filter((rec: MedicalRecord) => {
                const isAbnormal =
                  (rec.critical_alerts && rec.critical_alerts.length > 0) ||
                  rec.extracted_data?.tests?.some(
                    (t) => t.status === "HIGH" || t.status === "LOW" || t.status === "ELEVATED"
                  );
                if (reportsOnlyAbnormal && !isAbnormal) return false;
                if (
                  reportsCategoryFilter !== "all" &&
                  !rec.category.toLowerCase().includes(reportsCategoryFilter.toLowerCase())
                )
                  return false;
                return true;
              })
              .map((rec: MedicalRecord) => {
                const targetPatient =
                  allPatients.find((p) => p.id === rec.patient_id) || allPatients[0];
                const isAbnormal =
                  (rec.critical_alerts && rec.critical_alerts.length > 0) ||
                  rec.extracted_data?.tests?.some(
                    (t) => t.status === "HIGH" || t.status === "LOW" || t.status === "ELEVATED"
                  );
                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecordForModal(rec)}
                    className="p-5 rounded-3xl bg-white border border-slate-100 hover:border-slate-300 shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {rec.category}
                        </span>
                        {isAbnormal ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            Abnormal
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Normal Range
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {rec.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Patient: <span className="font-semibold text-slate-800">{targetPatient.name}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {rec.doctor_or_facility || rec.facility || "Clinical Lab"} · {rec.record_date || rec.date || "Recent"}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">
                        {rec.critical_alerts && rec.critical_alerts.length > 0 ? `${rec.critical_alerts.length} critical flags` : "Diagnostic review"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecordForModal(rec);
                        }}
                        className="text-xs font-semibold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100 px-2.5 py-1 rounded-xl transition-colors"
                      >
                        Inspect Abnormality &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* Fallback */
        <div className="w-full flex items-center justify-center p-12 text-slate-400">
          Loading section...
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          REPORT DETAIL MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedRecordForModal && (
        <ReportDetailModal
          record={selectedRecordForModal}
          patientName={currentPatient.name}
          isOpen={!!selectedRecordForModal}
          onClose={() => setSelectedRecordForModal(null)}
          onAskDoctor={(subj, q) => {
            setSoapNotes((prev) => `${prev}\n[Follow-up Inquiry on ${subj}]: ${q}`);
            showToast(`Clinical note logged for "${subj}".`);
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: NEW PATIENT REGISTRATION
      ───────────────────────────────────────────────────────────── */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register New Patient</h3>
                <p className="text-xs text-slate-400">Add patient to Mediq clinical directory</p>
              </div>
              <button
                onClick={() => setIsNewPatientModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={npName}
                    onChange={(e) => setNpName(e.target.value)}
                    placeholder="e.g. Rohan Deshpande"
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Age</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={npAge}
                    onChange={(e) => setNpAge(e.target.value)}
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Gender</label>
                  <select
                    value={npGender}
                    onChange={(e: any) => setNpGender(e.target.value)}
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Triage Priority</label>
                  <select
                    value={npPriority}
                    onChange={(e: any) => setNpPriority(e.target.value)}
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Primary Diagnosis / Reason</label>
                <input
                  type="text"
                  value={npCondition}
                  onChange={(e) => setNpCondition(e.target.value)}
                  placeholder="e.g. Hypertension & Dyslipidemia"
                  className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={npPhone}
                    onChange={(e) => setNpPhone(e.target.value)}
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Known Allergies (comma-separated)</label>
                  <input
                    type="text"
                    value={npAllergies}
                    onChange={(e) => setNpAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Sulfa"
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPatientModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                >
                  Register &amp; Open Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: ADD / RESCHEDULE APPOINTMENT
      ───────────────────────────────────────────────────────────── */}
      {appointmentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {appointmentModal.mode === "reschedule" ? "Reschedule Consultation" : "Schedule Clinical Slot"}
                </h3>
                <p className="text-xs text-slate-400">Syncs directly with OPD calendar &amp; patient card</p>
              </div>
              <button
                onClick={() => setAppointmentModal((prev) => ({ ...prev, open: false }))}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointmentModal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Patient</label>
                <select
                  value={appointmentModal.patientId}
                  onChange={(e) =>
                    setAppointmentModal((prev) => ({ ...prev, patientId: e.target.value }))
                  }
                  className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  {allPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientIdCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Date</label>
                  <input
                    type="text"
                    value={appointmentModal.date}
                    onChange={(e) =>
                      setAppointmentModal((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Time Window</label>
                  <input
                    type="text"
                    value={appointmentModal.time}
                    onChange={(e) =>
                      setAppointmentModal((prev) => ({ ...prev, time: e.target.value }))
                    }
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Visit Type / Notes</label>
                <input
                  type="text"
                  value={appointmentModal.type}
                  onChange={(e) =>
                    setAppointmentModal((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAppointmentModal((prev) => ({ ...prev, open: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DRAWER: SECURE CLINICAL CHAT
      ───────────────────────────────────────────────────────────── */}
      {chatDrawerPatientId && (() => {
        const chatPat = allPatients.find((p) => p.id === chatDrawerPatientId) || currentPatient;
        const thread = chatMessages[chatPat.id] || [
          {
            sender: "patient" as const,
            text: `Hello Doctor, following up regarding my ${chatPat.condition} care plan.`,
            time: "09:15 AM",
          },
        ];
        return (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PatientAvatar name={chatPat.name} size="md" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{chatPat.name}</h4>
                    <p className="text-[11px] text-slate-400">Encrypted Clinical Thread &middot; {chatPat.patientIdCode}</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatDrawerPatientId(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
                {thread.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.sender === "doctor" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === "doctor"
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-800 border border-slate-200/80 shadow-2xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1 tabular-nums">
                      {msg.sender === "doctor" ? doctorShortName : chatPat.name} &middot; {msg.time}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Write clinical reply..."
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
