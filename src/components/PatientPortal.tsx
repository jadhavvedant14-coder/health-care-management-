import React, { useState, useMemo, useEffect } from "react";
import {
  Upload,
  Calendar,
  Search,
  Clock,
  AlertTriangle,
  FileText,
  Pill,
  ShieldCheck,
  CheckCircle2,
  Mic,
  RefreshCw,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Activity,
  User,
  Phone,
  Droplet,
  ExternalLink,
  Check,
  Eye,
  Stethoscope,
  ArrowRight,
  Info,
  Ticket,
  MoreHorizontal,
  CalendarPlus,
  Baby,
  Sparkles,
  Brain,
  ShieldAlert,
  Flame,
  Star,
  X,
  Bell,
  MapPin,
  FileUp,
  Leaf,
} from "lucide-react";
import { AppState, MedicalRecord, Patient, Doctor } from "../types";
import { ReportDetailModal } from "./ReportDetailModal";
import { PatientSubTab } from "./VerticalGuide";
import { authFetch } from "../lib/authSession";

import docRajeshImg from "../assets/images/doc_rajesh_sharma_1794862644668.jpg";
import docAnanyaImg from "../assets/images/doc_ananya_sen_1794862645317.jpg";
import docVikramImg from "../assets/images/doc_vikram_patil_1794862646295.jpg";
import docPriyaImg from "../assets/images/doc_priya_deshmukh_1794862648503.jpg";
import docMeeraImg from "../assets/images/doc_meera_nambiar_1794862646518.jpg";

const DOCTOR_PORTRAITS: Record<string, string> = {
  doc_1: docRajeshImg,
  doc_2: docAnanyaImg,
  doc_3: docVikramImg,
  doc_4: docPriyaImg,
  doc_5: docMeeraImg,
};

function getDoctorPortrait(doctor?: Partial<Doctor> | null): string {
  if (!doctor) return docRajeshImg;
  if (doctor.id && DOCTOR_PORTRAITS[doctor.id]) {
    return DOCTOR_PORTRAITS[doctor.id];
  }
  const spec = (doctor.specialization || "").toLowerCase();
  const name = (doctor.name || "").toLowerCase();
  if (spec.includes("cardio") || name.includes("rajesh")) return docRajeshImg;
  if (spec.includes("general") || spec.includes("diabet") || name.includes("ananya")) return docAnanyaImg;
  if (spec.includes("ortho") || name.includes("vikram")) return docVikramImg;
  if (spec.includes("pulmon") || name.includes("priya")) return docPriyaImg;
  if (spec.includes("obstetric") || spec.includes("gynec") || name.includes("meera")) return docMeeraImg;
  return docRajeshImg;
}

interface PatientPortalProps {
  state: AppState;
  onRefresh: () => void;
  onOpenEmergency: () => void;
  onOpenVoice: () => void;
  initialSearchQuery?: string;
  onClearInitialSearch?: () => void;
  activePatientId?: string;
  onSelectPatient?: (id: string) => void;
  activeSubTab?: PatientSubTab;
  onSubTabChange?: (subTab: PatientSubTab) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  state,
  onRefresh,
  onOpenEmergency,
  onOpenVoice,
  initialSearchQuery = "",
  onClearInitialSearch,
  activePatientId,
  onSelectPatient = () => {},
  activeSubTab: controlledSubTab,
  onSubTabChange,
}) => {
  // Local or controlled subtab
  const [internalSubTab, setInternalSubTab] = useState<PatientSubTab>("summary");
  const activeSubTab = controlledSubTab !== undefined ? controlledSubTab : internalSubTab;

  const setSubTab = (tab: PatientSubTab) => {
    if (onSubTabChange) {
      onSubTabChange(tab);
    } else {
      setInternalSubTab(tab);
    }
  };

  const patient: Patient =
    (activePatientId ? state.patients.find((p) => p.id === activePatientId) : null) ||
    state.patients[0] || {
      id: "pat_1",
      name: "Rahul Jadhav",
      age: 38,
      gender: "Male",
      blood_group: "B+ Positive",
      allergies: ["Penicillin", "Sulfa Drugs"],
      emergency_contact: { name: "Sunita Jadhav", relation: "Spouse", phone: "+91 98765 43211" },
      phone: "+91 98765 43210",
      qr_token: "PAT-EMERGENCY-QR-TOKEN-9921",
    };

  const isAnanya = patient.id === "pat_4" || patient.name.includes("Ananya");

  // Progressive Disclosure: Report Detail Modal (Click to inspect abnormality / full report)
  const [inspectingRecord, setInspectingRecord] = useState<MedicalRecord | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Search & Filter state
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [resultCardIndex, setResultCardIndex] = useState(0);

  // Appointments
  const patientAppointments = state.appointments.filter(
    (a) => a.patient_id === patient.id
  );

  // Primary appointment & assigned doctor
  const primaryAppointment = patientAppointments[0];
  const assignedDoctor: Doctor =
    (primaryAppointment ? state.doctors.find((d) => d.id === primaryAppointment.doctor_id) : null) ||
    (isAnanya
      ? state.doctors.find((d) => d.specialization.toLowerCase().includes("pulmon") || d.id === "doc_4")
      : state.doctors[0]) ||
    state.doctors[0] || {
      id: "doc_1",
      clinic_id: "clinic_1",
      name: "Dr. Rajesh Sharma, MD",
      specialization: "Cardiologist",
      experience: "14 Years",
      fee: 800,
      slots: ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"],
    };

  // Interactive Appointment Queue state (right panel)
  const [queueDoctorId, setQueueDoctorId] = useState<string>(assignedDoctor.id);
  const [isQueueDropdownOpen, setIsQueueDropdownOpen] = useState<boolean>(false);

  // Upload Form
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFacility, setUploadFacility] = useState("City Diagnostic Labs");
  const [uploadText, setUploadText] = useState("");
  const [uploadFileName, setUploadFileName] = useState("clinical_report.pdf");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<any | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Booking Form
  const [selectedClinicId, setSelectedClinicId] = useState(assignedDoctor.clinic_id || state.clinics[0]?.id || "");
  const [selectedDoctorId, setSelectedDoctorId] = useState(assignedDoctor.id || state.doctors[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState("2026-10-06");
  const [selectedSlot, setSelectedSlot] = useState(assignedDoctor.slots?.[0] || "10:00 AM");
  const [bookingReason, setBookingReason] = useState("Routine consultation and clinical follow-up");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Reminders / Medications
  const [remMedName, setRemMedName] = useState("");
  const [remDosage, setRemDosage] = useState("");
  const [remTiming, setRemTiming] = useState("09:00 AM");
  const [remFreq, setRemFreq] = useState("Daily Morning");
  const [showAddRem, setShowAddRem] = useState(false);
  const [isAddingRem, setIsAddingRem] = useState(false);

  // Records & consents for active patient
  const patientRecords = state.timeline.filter((rec) => rec.patient_id === patient.id);
  const patientConsents = state.consents.filter((c) => c.patient_id === patient.id);
  const patientReminders = state.reminders.filter((r) => r.patient_id === patient.id);

  // Voice / Clinical Search Answer Banner
  const [voiceSearchBanner, setVoiceSearchBanner] = useState<{
    query: string;
    answer: string | null;
    matchedRecordIds: string[];
  } | null>(null);

  // Inpatient & Records Sorting & Filtering state
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>("all");
  const [recordSortOrder, setRecordSortOrder] = useState<
    "newest" | "oldest" | "abnormal_first" | "by_type"
  >("newest");
  const [recordSearchQuery, setRecordSearchQuery] = useState<string>("");

  // Patient Account & Settings state
  const [iceName, setIceName] = useState(patient.emergency_contact?.name || "Sunita Jadhav");
  const [iceRelation, setIceRelation] = useState(patient.emergency_contact?.relation || "Spouse");
  const [icePhone, setIcePhone] = useState(patient.emergency_contact?.phone || "+91 98765 43211");
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [notifyRefill, setNotifyRefill] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [consentToast, setConsentToast] = useState<string | null>(null);

  // Keep queue & booking defaults aligned when switching patient profile
  useEffect(() => {
    setQueueDoctorId(assignedDoctor.id);
    setSelectedDoctorId(assignedDoctor.id);
    setSelectedClinicId(assignedDoctor.clinic_id || state.clinics[0]?.id || "");
    setSelectedSlot(assignedDoctor.slots?.[0] || "10:00 AM");
    setResultCardIndex(0);
    setIceName(patient.emergency_contact?.name || "");
    setIceRelation(patient.emergency_contact?.relation || "");
    setIcePhone(patient.emergency_contact?.phone || "");
    setVoiceSearchBanner(null);
  }, [patient.id]);

  // Execute voice/AI clinical history query when passed from VoiceModal
  useEffect(() => {
    if (!initialSearchQuery || !initialSearchQuery.trim()) return;
    let cancelled = false;
    const runVoiceSearch = async () => {
      setSubTab("inpatient");
      setRecordTypeFilter("all");
      try {
        const res = await authFetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: patient.id,
            query: initialSearchQuery,
          }),
        });
        if (res.ok && !cancelled) {
          const data = await res.json();
          const matchedIds = (data.results || []).map((r: any) => r.record_id).filter(Boolean);
          setVoiceSearchBanner({
            query: initialSearchQuery,
            answer:
              data.conversational_answer ||
              (matchedIds.length > 0
                ? `Found ${matchedIds.length} clinical record(s) relevant to "${initialSearchQuery}".`
                : `No exact document keywords matched "${initialSearchQuery}". Showing full clinical records below.`),
            matchedRecordIds: matchedIds,
          });
        }
      } catch {
        if (!cancelled) {
          setRecordSearchQuery(initialSearchQuery);
        }
      }
    };
    runVoiceSearch();
    return () => {
      cancelled = true;
    };
  }, [initialSearchQuery, patient.id]);

  // Filtered and sorted records for the Inpatient & Records view
  const filteredAndSortedRecords = useMemo(() => {
    let list = [...patientRecords];

    if (recordSearchQuery.trim()) {
      const q = recordSearchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.doctor_or_facility && r.doctor_or_facility.toLowerCase().includes(q)) ||
          (r.ai_summary && r.ai_summary.toLowerCase().includes(q))
      );
    }

    if (recordTypeFilter !== "all") {
      list = list.filter((r) => {
        const cat = r.category.toLowerCase();
        const title = r.title.toLowerCase();
        if (recordTypeFilter === "inpatient") {
          return (
            cat.includes("discharge") ||
            cat.includes("surgery") ||
            title.includes("inpatient") ||
            title.includes("admission") ||
            title.includes("discharge")
          );
        }
        if (recordTypeFilter === "lab") {
          return (
            cat.includes("lab") ||
            title.includes("blood") ||
            title.includes("cbc") ||
            title.includes("lipid") ||
            title.includes("glucose") ||
            title.includes("panel") ||
            title.includes("urinalysis")
          );
        }
        if (recordTypeFilter === "cardiology") {
          return (
            cat.includes("cardio") ||
            title.includes("ecg") ||
            title.includes("heart") ||
            title.includes("holter") ||
            title.includes("arrhythmia")
          );
        }
        if (recordTypeFilter === "imaging") {
          return (
            cat.includes("x-ray") ||
            title.includes("x-ray") ||
            title.includes("radiology") ||
            title.includes("ct") ||
            title.includes("mri")
          );
        }
        if (recordTypeFilter === "prescription") {
          return (
            cat.includes("prescription") ||
            title.includes("prescription") ||
            title.includes("medication") ||
            title.includes("titration")
          );
        }
        return true;
      });
    }

    list.sort((a, b) => {
      if (recordSortOrder === "newest") {
        return (b.record_date || "").localeCompare(a.record_date || "");
      }
      if (recordSortOrder === "oldest") {
        return (a.record_date || "").localeCompare(b.record_date || "");
      }
      if (recordSortOrder === "abnormal_first") {
        const aAbnormal =
          (a.critical_alerts && a.critical_alerts.length > 0) ||
          a.extracted_data?.tests?.some((t) => t.status !== "NORMAL")
            ? 1
            : 0;
        const bAbnormal =
          (b.critical_alerts && b.critical_alerts.length > 0) ||
          b.extracted_data?.tests?.some((t) => t.status !== "NORMAL")
            ? 1
            : 0;
        return bAbnormal - aAbnormal;
      }
      if (recordSortOrder === "by_type") {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });

    if (voiceSearchBanner && voiceSearchBanner.matchedRecordIds.length > 0 && !recordSearchQuery.trim()) {
      list = list.filter((r) => voiceSearchBanner.matchedRecordIds.includes(r.id));
    }

    return list;
  }, [patientRecords, recordSearchQuery, recordTypeFilter, recordSortOrder, voiceSearchBanner]);

  // Medicines list
  const latestMedList: Array<{ name: string; dosage: string; frequency: string; source: string }> = [];
  patientRecords.forEach((rec) => {
    if (rec.extracted_data?.medicines) {
      rec.extracted_data.medicines.forEach((med) => {
        if (!latestMedList.some((m) => m.name.toLowerCase() === med.name.toLowerCase())) {
          latestMedList.push({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            source: rec.title,
          });
        }
      });
    }
  });

  // Real staffed clinical specialties matching state.doctors
  const matchesSpecialty = (doc: Doctor, specId: string | null) => {
    if (!specId || specId === "all") return true;
    const s = doc.specialization.toLowerCase();
    if (specId === "cardiology") return s.includes("cardio");
    if (specId === "general") return s.includes("general") || s.includes("diabet");
    if (specId === "orthopedics") return s.includes("ortho");
    if (specId === "pulmonology") return s.includes("pulmon");
    if (specId === "obgyn") return s.includes("obstetric") || s.includes("gynec");
    return true;
  };

  const specialties = [
    { id: "all", label: "All Doctors", icon: <Stethoscope className="w-4 h-4" /> },
    { id: "cardiology", label: "Cardiology", icon: <Heart className="w-4 h-4" /> },
    { id: "general", label: "General Care", icon: <Plus className="w-4 h-4" /> },
    { id: "orthopedics", label: "Orthopedics", icon: <Activity className="w-4 h-4" /> },
    { id: "pulmonology", label: "Pulmonology", icon: <Flame className="w-4 h-4" /> },
    { id: "obgyn", label: "OB-GYN", icon: <Baby className="w-4 h-4" /> },
  ].map((spec) => ({
    ...spec,
    count: state.doctors.filter((d) => matchesSpecialty(d, spec.id)).length,
  }));

  const filteredDoctors = useMemo(() => {
    const q = doctorSearch.toLowerCase().trim();
    return state.doctors.filter((doc) => {
      if (!matchesSpecialty(doc, selectedSpecialty)) return false;
      if (q) {
        const clinicName = state.clinics.find((c) => c.id === doc.clinic_id)?.name || "";
        return (
          doc.name.toLowerCase().includes(q) ||
          doc.specialization.toLowerCase().includes(q) ||
          clinicName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.doctors, state.clinics, selectedSpecialty, doctorSearch]);

  // Helper for report status
  const getRecordStatus = (rec: MedicalRecord) => {
    const tests = rec.extracted_data?.tests || [];
    const abnormal = tests.filter(
      (t) => t.status === "HIGH" || t.status === "LOW" || t.status === "ELEVATED"
    );
    const hasAlerts = rec.critical_alerts && rec.critical_alerts.length > 0;

    if (abnormal.length > 0 || hasAlerts) {
      return {
        isAbnormal: true,
        label: `${abnormal.length || 1} Parameter Flagged`,
        hint: abnormal.length > 0 ? abnormal.map((a) => a.name).join(", ") : "Clinical alert",
        dotColor: "bg-amber-500",
      };
    }
    return {
      isAbnormal: false,
      label: `Normal (${tests.length || "Standard"})`,
      hint: "Within reference range",
      dotColor: "bg-emerald-500",
    };
  };

  const handleOpenReport = (record: MedicalRecord) => {
    setInspectingRecord(record);
    setIsReportModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      const res = await authFetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.id,
          doctor_id: selectedDoctorId,
          clinic_id: selectedClinicId,
          date: selectedDate,
          time_slot: selectedSlot,
          reason: bookingReason,
        }),
      });
      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => setBookingSuccess(false), 4000);
        onRefresh();
      }
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsBooking(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadText.trim()) return;
    setIsUploading(true);
    setUploadSuccess(null);
    setUploadError(null);
    try {
      const res = await authFetch("/api/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.id,
          title: uploadTitle || "Clinical Report",
          facility: uploadFacility,
          text: uploadText,
          file_name: uploadFileName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUploadSuccess(data);
        setUploadText("");
        setUploadTitle("");
        onRefresh();
      } else {
        setUploadError("Could not process document. Please verify the text and try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Network error while connecting to clinical document parser.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remMedName.trim()) return;
    setIsAddingRem(true);
    try {
      const res = await authFetch("/api/reminders/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.id,
          medicine_name: remMedName,
          dosage: remDosage || "1 tab",
          timing: remTiming,
          frequency: remFreq,
        }),
      });
      if (res.ok) {
        setRemMedName("");
        setRemDosage("");
        setShowAddRem(false);
        onRefresh();
      }
    } finally {
      setIsAddingRem(false);
    }
  };

  const handleToggleReminder = async (remId: string, currentActive: number) => {
    try {
      const res = await authFetch("/api/reminders/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminder_id: remId, active: currentActive === 1 ? 0 : 1 }),
      });
      if (res.ok) onRefresh();
    } catch {
      // ignore
    }
  };

  const handleConsentAction = async (
    consentId: string,
    action: "Approved" | "Rejected" | "Revoke"
  ) => {
    try {
      const endpoint = action === "Revoke" ? "/api/consents/revoke" : "/api/consents/respond";
      const body =
        action === "Revoke"
          ? { consent_id: consentId }
          : { consent_id: consentId, decision: action };
      const res = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setConsentToast(
          action === "Revoke"
            ? "Access consent revoked immediately in compliance with DPDP Act."
            : `Consent request ${action.toLowerCase()} successfully.`
        );
        setTimeout(() => setConsentToast(null), 4000);
        onRefresh();
      }
    } catch {
      // ignore
    }
  };

  // Compute live queue metrics for right panel
  const activeQueueDoctor =
    state.doctors.find((d) => d.id === queueDoctorId) || assignedDoctor;
  const queueMetrics = useMemo(() => {
    const docIdx = Math.max(
      0,
      state.doctors.findIndex((d) => d.id === activeQueueDoctor.id)
    );
    const prefixes = ["C", "G", "O", "P", "W"];
    const baseWaiting = [18, 14, 11, 15, 12];
    const baseTurn = [4, 2, 5, 3, 6];
    const docApptsCount = state.appointments.filter(
      (a) => a.doctor_id === activeQueueDoctor.id && a.status === "Confirmed"
    ).length;
    const totalQueue = (baseWaiting[docIdx] || 12) + docApptsCount;
    const myTurn = Math.min(totalQueue, (baseTurn[docIdx] || 3) + (patientAppointments.some((a) => a.doctor_id === activeQueueDoctor.id) ? 0 : 1));
    const token = `${prefixes[docIdx] || "Q"}${10 + myTurn + docApptsCount}`;
    const etaSlot = activeQueueDoctor.slots?.[0] || "10:00 AM";
    return { token, myTurn, totalQueue, etaSlot };
  }, [activeQueueDoctor, state.doctors, state.appointments, patientAppointments]);

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row gap-8 lg:gap-10">
      {/* ============================================================== */}
      {/* CENTER STAGE (Dashboard / Subviews with High Whitespace)       */}
      {/* ============================================================== */}
      <div className="flex-1 space-y-7 min-w-0">
        {/* Spacious Top Welcome Bar (Strictly scoped to signed-in patient) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-slate-800">
              Welcome, {patient.name.split(" ")[0]}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {patient.name} &middot; ID: {patient.id.toUpperCase()} &middot; Blood Group {patient.blood_group}
            </p>
          </div>
        </div>

        {/* ========================================================== */}
        {/* MAIN VIEW: SUMMARY / DASHBOARD                             */}
        {/* ========================================================== */}
        {activeSubTab === "summary" && (
          <div className="space-y-7">
            {/* 1. HERO APPOINTMENT BANNER (Side-by-Side: Text Left, Unique Portrait Right — Zero Overlap) */}
            <div className="rounded-3xl bg-gradient-to-br from-[#DFE3E8] via-[#E4E8ED] to-[#D5DBE1] p-6 md:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs border border-white/60">
              {/* Left Column: Appointment Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Your Next Appointment
                  </span>
                  <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight leading-tight">
                    {assignedDoctor.name}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    {assignedDoctor.specialization} &middot; {assignedDoctor.experience} Exp &middot;{" "}
                    {state.clinics.find((c) => c.id === assignedDoctor.clinic_id)?.name || "City Health Hospital"}
                  </p>
                </div>

                {/* Bottom Frosted Info Strip */}
                <div className="self-start">
                  <div className="bg-slate-900/75 backdrop-blur-md text-white/95 rounded-2xl px-4 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium shadow-sm border border-white/10 tabular-nums">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>
                        {primaryAppointment
                          ? `${primaryAppointment.date} · ${primaryAppointment.time_slot}`
                          : `2026-10-06 · ${assignedDoctor.slots?.[0] || "10:00 AM"}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/85 whitespace-nowrap">
                      <Ticket className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>
                        Room {assignedDoctor.id === "doc_4" ? "B-07" : assignedDoctor.id === "doc_5" ? "C-12" : "A-03"} &middot;{" "}
                        {primaryAppointment ? primaryAppointment.id.toUpperCase() : "OPD-204"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Dedicated Non-Overlapping Portrait Frame */}
              <div className="shrink-0 self-center sm:self-auto">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-md border-2 border-white/80 bg-slate-200">
                  <img
                    src={getDoctorPortrait(assignedDoctor)}
                    alt={assignedDoctor.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>

            {/* 2. CIRCULAR ACTION BAR (Each button opens a unique section) */}
            <div className="flex items-center justify-start gap-6 sm:gap-9 py-1 overflow-x-auto scrollbar-none">
              {/* Circle 1: Book */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setSelectedSpecialty(null);
                    setSubTab("appointments");
                  }}
                  className="w-14 h-14 rounded-full bg-white shadow-xs hover:shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all duration-150 cursor-pointer border border-white/80 group"
                  title="Book Doctor Appointment"
                >
                  <CalendarPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Book</span>
              </div>

              {/* Circle 2: Pharmacy */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  onClick={() => setSubTab("pharmacy")}
                  className="w-14 h-14 rounded-full bg-white shadow-xs hover:shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all duration-150 cursor-pointer border border-white/80 group"
                  title="Pharmacy & Medications"
                >
                  <Pill className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Pharmacy</span>
              </div>

              {/* Circle 3: Inpatient / Records */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  onClick={() => setSubTab("inpatient")}
                  className="w-14 h-14 rounded-full bg-white shadow-xs hover:shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all duration-150 cursor-pointer border border-white/80 group"
                  title="Inpatient & Clinical Records"
                >
                  <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Inpatient</span>
              </div>

              {/* Circle 4: Upload Report */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  onClick={() => setSubTab("upload")}
                  className="w-14 h-14 rounded-full bg-white shadow-xs hover:shadow-md flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all duration-150 cursor-pointer border border-white/80 group"
                  title="Upload & Analyze Clinical Report"
                >
                  <FileUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Upload</span>
              </div>
            </div>

            {/* 3. TWO-COLUMN BOTTOM SECTION: Health Tips + Result & History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {/* Health Tips Card (Clean Icon Tiles) */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-slate-800">Health Tips</h3>
                <div className="bg-white rounded-3xl p-5 shadow-xs border border-white/80 space-y-4">
                  {/* Tip 1 */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                      <Droplet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Stay Hydrated</h4>
                      <p className="text-xs text-slate-500 leading-snug">
                        Drink enough water throughout the day to support kidney and metabolic health.
                      </p>
                    </div>
                  </div>

                  {/* Tip 2 */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Move Every Hour</h4>
                      <p className="text-xs text-slate-500 leading-snug">
                        A brisk 25-minute daily walk helps keep blood pressure and HbA1c steady.
                      </p>
                    </div>
                  </div>

                  {/* Tip 3 */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Balanced Meals</h4>
                      <p className="text-xs text-slate-500 leading-snug">
                        Include fiber-rich vegetables and reduce sodium below 2g daily.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result & History Card (Interactive cycling + Progressive Disclosure) */}
              {(() => {
                const activeRec =
                  patientRecords.length > 0
                    ? patientRecords[resultCardIndex % patientRecords.length]
                    : null;
                const recStatus = activeRec ? getRecordStatus(activeRec) : null;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-800">Result &amp; History</h3>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        {patientRecords.length > 1 && (
                          <span className="text-[11px] font-medium text-slate-400 mr-1 tabular-nums">
                            {(resultCardIndex % patientRecords.length) + 1}/{patientRecords.length}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            setResultCardIndex((prev) =>
                              patientRecords.length > 0
                                ? (prev - 1 + patientRecords.length) % patientRecords.length
                                : 0
                            )
                          }
                          className="p-1 rounded-lg hover:bg-white hover:text-slate-800 cursor-pointer transition-colors"
                          title="Previous Record"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setResultCardIndex((prev) =>
                              patientRecords.length > 0 ? (prev + 1) % patientRecords.length : 0
                            )
                          }
                          className="p-1 rounded-lg hover:bg-white hover:text-slate-800 cursor-pointer transition-colors"
                          title="Next Record"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-xs border border-white/80 space-y-4">
                      {/* Item 1: Latest Document */}
                      <div className="flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                            <span
                              className={`w-1.5 h-1.5 rounded-full inline-block ${
                                recStatus?.dotColor || "bg-emerald-500"
                              }`}
                            />
                            <span>Latest Clinical Record</span>
                          </div>
                          <div className="font-semibold text-slate-800 text-sm">
                            {activeRec?.title || "Routine Wellness Check"}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap tabular-nums">
                          {activeRec?.record_date || "2026-09-12"}
                        </span>
                      </div>

                      <div className="h-px bg-slate-100" />

                      {/* Item 2: Active Medication */}
                      <div className="flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            <span>Active Medication</span>
                          </div>
                          <div className="font-semibold text-slate-800 text-sm">
                            {latestMedList[0]
                              ? `${latestMedList[0].name} ${latestMedList[0].dosage}`
                              : "No active prescriptions"}
                          </div>
                        </div>
                        <button
                          onClick={() => setSubTab("pharmacy")}
                          className="text-[11px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer whitespace-nowrap"
                        >
                          Pharmacy &rarr;
                        </button>
                      </div>

                      <div className="h-px bg-slate-100" />

                      {/* Item 3: Diagnostic Findings */}
                      <div className="flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                            <span
                              className={`w-1.5 h-1.5 rounded-full inline-block ${
                                recStatus?.dotColor || "bg-emerald-500"
                              }`}
                            />
                            <span>Diagnostic Status</span>
                          </div>
                          <div className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                            <span>
                              {activeRec && recStatus
                                ? `${activeRec.category} — ${recStatus.label}`
                                : "All Parameters Normal"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {activeRec && (
                            <button
                              onClick={() => handleOpenReport(activeRec)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="h-px bg-slate-100" />

                      {/* Item 4: Facility / Clinic */}
                      <div className="flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            <span>Care Facility</span>
                          </div>
                          <div className="font-semibold text-slate-800 text-sm">
                            {activeRec?.doctor_or_facility ||
                              (isAnanya ? "Metro Care Pediatrics" : "City Health Hospital")}
                          </div>
                        </div>
                        <button
                          onClick={() => setSubTab("inpatient")}
                          className="text-[11px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer whitespace-nowrap"
                        >
                          All Records &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}


        {/* ========================================================== */}
        {/* SUBVIEW: PHARMACY & MEDICATIONS                            */}
        {/* ========================================================== */}
        {activeSubTab === "pharmacy" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Pharmacy &amp; Medication Reminders</h2>
                <p className="text-xs text-slate-400">
                  Verified clinical prescriptions and interactive daily dose reminders.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddRem(!showAddRem)}
                  className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Reminder
                </button>
                <button
                  onClick={() => setSubTab("summary")}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-1.5 rounded-xl bg-white shadow-xs cursor-pointer whitespace-nowrap"
                >
                  &larr; Dashboard
                </button>
              </div>
            </div>

            {showAddRem && (
              <form
                onSubmit={handleAddReminder}
                className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/70 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
              >
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={remMedName}
                    onChange={(e) => setRemMedName(e.target.value)}
                    placeholder="e.g. Vitamin D3"
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Dosage</label>
                  <input
                    type="text"
                    value={remDosage}
                    onChange={(e) => setRemDosage(e.target.value)}
                    placeholder="e.g. 1000 IU"
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500">Timing</label>
                  <input
                    type="text"
                    value={remTiming}
                    onChange={(e) => setRemTiming(e.target.value)}
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAddingRem}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                >
                  {isAddingRem ? "Saving..." : "Save Reminder"}
                </button>
              </form>
            )}

            {/* Active Dose Reminders */}
            {patientReminders.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-white/80 space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">Daily Dose Schedule</h3>
                <div className="divide-y divide-slate-100">
                  {patientReminders.map((rem) => (
                    <div key={rem.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {rem.medicine_name} <span className="text-xs font-normal text-slate-500">{rem.dosage}</span>
                        </p>
                        <p className="text-xs text-slate-500 tabular-nums">
                          {rem.timing} &middot; {rem.frequency}
                          {rem.instructions ? ` · ${rem.instructions}` : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleReminder(rem.id, rem.active)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                          rem.active === 1
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {rem.active === 1 ? "Active" : "Paused"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestMedList.map((med, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-5 shadow-xs border border-white/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                      <Pill className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-emerald-700">Prescribed</span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-800">{med.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {med.dosage} &middot; {med.frequency}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    Source: {med.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUBVIEW: APPOINTMENTS, DOCTOR DIRECTORY & CONSULTATION BOOKING */}
        {/* ========================================================== */}
        {activeSubTab === "appointments" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Specialists &amp; Appointment Booking
                </h2>
                <p className="text-xs text-slate-400">
                  Browse staffed specialists, pick an open slot, or review scheduled visits.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(selectedSpecialty && selectedSpecialty !== "all") || doctorSearch ? (
                  <button
                    onClick={() => {
                      setSelectedSpecialty(null);
                      setDoctorSearch("");
                    }}
                    className="text-xs text-slate-700 bg-slate-200/70 hover:bg-slate-200 font-medium px-3 py-1.5 rounded-xl cursor-pointer whitespace-nowrap"
                  >
                    Clear Filter
                  </button>
                ) : null}
                <button
                  onClick={() => setSubTab("summary")}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-1.5 rounded-xl bg-white shadow-xs cursor-pointer whitespace-nowrap"
                >
                  &larr; Dashboard
                </button>
              </div>
            </div>

            {/* Filtered Doctor Directory with Unique Non-Overlapping Portraits */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  Available Specialists ({filteredDoctors.length})
                </h3>
                {selectedSpecialty && selectedSpecialty !== "all" && (
                  <span className="text-xs text-slate-500 capitalize">
                    Filtered by {specialties.find((s) => s.id === selectedSpecialty)?.label}
                  </span>
                )}
              </div>

              {filteredDoctors.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center text-xs text-slate-500 space-y-2 border border-white/80">
                  <p className="font-semibold text-slate-700">No doctors match &ldquo;{doctorSearch}&rdquo;</p>
                  <button
                    onClick={() => {
                      setDoctorSearch("");
                      setSelectedSpecialty(null);
                    }}
                    className="text-xs font-semibold text-slate-900 underline cursor-pointer"
                  >
                    Show all specialists
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDoctors.map((doc) => {
                    const clinic = state.clinics.find((c) => c.id === doc.clinic_id);
                    const isSelectedDoc = selectedDoctorId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setSelectedDoctorId(doc.id);
                          setSelectedClinicId(doc.clinic_id);
                          if (doc.slots?.[0]) setSelectedSlot(doc.slots[0]);
                        }}
                        className={`bg-white rounded-3xl p-4 shadow-xs border transition-all cursor-pointer flex items-start gap-4 ${
                          isSelectedDoc
                            ? "border-slate-900 ring-1 ring-slate-900/10"
                            : "border-white/80 hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={getDoctorPortrait(doc)}
                          alt={doc.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-2xl object-cover object-top shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                                {doc.name}
                              </h4>
                              <span className="text-xs font-bold text-slate-800 shrink-0 tabular-nums">
                                &#8377;{doc.fee}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {doc.specialization} &middot; {doc.experience}
                            </p>
                            {clinic && (
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{clinic.name}</span>
                              </p>
                            )}
                          </div>

                          {/* Clickable Time Slots */}
                          <div className="flex flex-wrap gap-1.5">
                            {doc.slots.map((slot) => {
                              const isActiveSlot = isSelectedDoc && selectedSlot === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDoctorId(doc.id);
                                    setSelectedClinicId(doc.clinic_id);
                                    setSelectedSlot(slot);
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-medium tabular-nums transition-colors cursor-pointer ${
                                    isActiveSlot
                                      ? "bg-slate-900 text-white"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Booking Form Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-white/80 space-y-4">
              <h3 className="text-base font-semibold text-slate-800">Confirm Consultation Slot</h3>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Selected Specialist</label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => {
                        const doc = state.doctors.find((d) => d.id === e.target.value);
                        setSelectedDoctorId(e.target.value);
                        if (doc) {
                          setSelectedClinicId(doc.clinic_id);
                          if (doc.slots?.[0]) setSelectedSlot(doc.slots[0]);
                        }
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                      {state.doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} &mdash; {d.specialization} (&#8377;{d.fee})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Date &amp; Slot</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 tabular-nums"
                      />
                      <input
                        type="text"
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        placeholder="11:30 AM"
                        className="w-28 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Reason for Visit</label>
                  <input
                    type="text"
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {bookingSuccess && (
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Consultation scheduled! Hero card &amp; queue updated.
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isBooking}
                    className="ml-auto px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {isBooking ? "Confirming..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Appointments */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-800">
                Scheduled Appointments ({patientAppointments.length})
              </h3>
              <div className="space-y-3">
                {patientAppointments.map((apt) => {
                  const doc = state.doctors.find((d) => d.id === apt.doctor_id);
                  return (
                    <div
                      key={apt.id}
                      className="bg-white rounded-3xl p-4 shadow-xs border border-white/80 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={getDoctorPortrait(doc)}
                          alt={doc?.name || "Doctor"}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-2xl object-cover object-top shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-slate-800 text-sm truncate">
                            {doc?.name || "Specialist Doctor"} &middot; {doc?.specialization}
                          </div>
                          <div className="text-xs text-slate-500 tabular-nums">
                            {apt.date} at {apt.time_slot} &middot; {apt.reason}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        {apt.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUBVIEW: UPLOAD CLINICAL REPORT (OCR & AI EXTRACTION)      */}
        {/* ========================================================== */}
        {activeSubTab === "upload" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Upload &amp; Analyze Clinical Report
                </h2>
                <p className="text-xs text-slate-400">
                  Import a lab report, ECG summary, or prescription to automatically extract vitals, values, and clinical alerts.
                </p>
              </div>
              <button
                onClick={() => setSubTab("summary")}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-1.5 rounded-xl bg-white shadow-xs cursor-pointer whitespace-nowrap"
              >
                &larr; Dashboard
              </button>
            </div>

            {/* 1-Click Sample Clinical Report Presets */}
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-white/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">
                  Try a sample diagnostic report or paste your own text:
                </span>
                <label className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Load Local File
                  <input
                    type="file"
                    accept=".txt,.csv,.json,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadFileName(file.name);
                      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^.]+$/, ""));
                      if (file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (typeof ev.target?.result === "string") setUploadText(ev.target.result);
                        };
                        reader.readAsText(file);
                      } else if (!uploadText) {
                        setUploadText(`Scanned document: ${file.name}\nFasting Blood Sugar: 118 mg/dL\nHbA1c: 6.4 %\nHemoglobin: 13.8 g/dL\nBP: 126/82 mmHg`);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: "Sample: Metabolic & HbA1c Lab",
                    title: "Follow-Up Metabolic & Lipid Panel",
                    facility: "City Diagnostic Labs",
                    fileName: "metabolic_panel_oct2026.pdf",
                    text: "CITY DIAGNOSTIC LABS\nFasting Blood Sugar: 132 mg/dL\nHbA1c: 6.9 %\nTotal Cholesterol: 218 mg/dL\nTriglycerides: 175 mg/dL\nSerum Creatinine: 0.9 mg/dL\nBP: 132/84 mmHg",
                  },
                  {
                    label: "Sample: Cardiology Discharge Rx",
                    title: "Cardiology Titration Prescription",
                    facility: "City Health Heart Institute",
                    fileName: "cardiology_rx_oct2026.pdf",
                    text: "RX PRESCRIPTION\nTab. Telmisartan 40 mg - Once daily morning\nTab. Rosuvastatin 10 mg - Once daily bedtime\nBP: 124/78 mmHg\nPulse: 70 bpm\nNote: Known Penicillin allergy documented.",
                  },
                  {
                    label: "Sample: CBC & Thyroid Panel",
                    title: "Complete Blood Count & TSH",
                    facility: "Metro Care Pathology",
                    fileName: "cbc_thyroid_oct2026.pdf",
                    text: "HEMATOLOGY & THYROID REPORT\nHemoglobin: 13.6 g/dL\nWBC: 7200 /cumm\nPlatelet Count: 245000\nTSH: 2.4 uIU/mL",
                  },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUploadTitle(sample.title);
                      setUploadFacility(sample.facility);
                      setUploadFileName(sample.fileName);
                      setUploadText(sample.text);
                      setUploadSuccess(null);
                      setUploadError(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Form */}
            <form
              onSubmit={handleUploadSubmit}
              className="bg-white rounded-3xl p-6 shadow-xs border border-white/80 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600">Document Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. HbA1c & Lipid Panel"
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Hospital / Diagnostic Lab</label>
                  <input
                    type="text"
                    value={uploadFacility}
                    onChange={(e) => setUploadFacility(e.target.value)}
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">File Name</label>
                  <input
                    type="text"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Extracted Text / Clinical Values
                </label>
                <textarea
                  rows={6}
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder="Paste lab test parameters, vitals, or prescription lines..."
                  className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-2xl p-3 font-mono"
                  required
                />
              </div>

              {uploadError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {uploadError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUploading || !uploadText.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isUploading ? "Processing Clinical Data..." : "Process & Add to Health Record"}
                </button>
              </div>
            </form>

            {/* Processed Result Output */}
            {uploadSuccess?.full_record && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Processed &amp; Added: {uploadSuccess.full_record.title}</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200">
                    {uploadSuccess.full_record.category}
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {uploadSuccess.full_record.ai_summary}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleOpenReport(uploadSuccess.full_record)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Inspect Extracted Report
                  </button>
                  <button
                    onClick={() => setSubTab("inpatient")}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    View in Inpatient &amp; Records &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* SUBVIEW: INPATIENT & CLINICAL RECORDS (Unified & Sortable) */}
        {/* ========================================================== */}
        {(activeSubTab === "inpatient" ||
          activeSubTab === "timeline" ||
          activeSubTab === "laboratory") && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Inpatient &amp; Clinical Records
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Longitudinal history of inpatient admissions, laboratory tests, cardiology diagnostics, and discharge summaries.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setSubTab("upload")}
                  className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <FileUp className="w-3.5 h-3.5" />
                  Upload Report
                </button>
                <button
                  onClick={() => setSubTab("summary")}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3.5 py-1.5 rounded-xl bg-white shadow-xs cursor-pointer whitespace-nowrap"
                >
                  &larr; Dashboard
                </button>
              </div>
            </div>

            {/* Voice / Clinical AI Search Answer Banner */}
            {voiceSearchBanner && (
              <div className="bg-teal-50/80 border border-teal-200 rounded-3xl p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-900">
                    <Mic className="w-3.5 h-3.5 text-teal-600" />
                    <span>Voice Clinical Query: &ldquo;{voiceSearchBanner.query}&rdquo;</span>
                  </div>
                  <button
                    onClick={() => {
                      setVoiceSearchBanner(null);
                      if (onClearInitialSearch) onClearInitialSearch();
                    }}
                    className="text-xs font-medium text-teal-700 hover:text-teal-900 cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
                {voiceSearchBanner.answer && (
                  <p className="text-xs text-teal-950 leading-relaxed">
                    {voiceSearchBanner.answer}
                  </p>
                )}
              </div>
            )}

            {/* Type Filtering & Sorting Toolbar (Requested Feature) */}
            <div className="bg-white rounded-3xl p-4 shadow-xs border border-white/80 space-y-3">
              {/* Type Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Type:
                </span>
                {[
                  { id: "all", label: "All Records", count: patientRecords.length },
                  {
                    id: "inpatient",
                    label: "Inpatient / Hospital",
                    count: patientRecords.filter(
                      (r) =>
                        r.category.toLowerCase().includes("discharge") ||
                        r.category.toLowerCase().includes("surgery") ||
                        r.title.toLowerCase().includes("inpatient") ||
                        r.title.toLowerCase().includes("admission")
                    ).length,
                  },
                  {
                    id: "lab",
                    label: "Lab & Blood Tests",
                    count: patientRecords.filter(
                      (r) =>
                        r.category.toLowerCase().includes("lab") ||
                        r.title.toLowerCase().includes("blood") ||
                        r.title.toLowerCase().includes("cbc") ||
                        r.title.toLowerCase().includes("lipid") ||
                        r.title.toLowerCase().includes("glucose")
                    ).length,
                  },
                  {
                    id: "cardiology",
                    label: "Cardiology & ECG",
                    count: patientRecords.filter(
                      (r) =>
                        r.category.toLowerCase().includes("cardio") ||
                        r.title.toLowerCase().includes("ecg") ||
                        r.title.toLowerCase().includes("heart")
                    ).length,
                  },
                  {
                    id: "imaging",
                    label: "Radiology & Imaging",
                    count: patientRecords.filter(
                      (r) =>
                        r.category.toLowerCase().includes("x-ray") ||
                        r.title.toLowerCase().includes("x-ray") ||
                        r.title.toLowerCase().includes("scan")
                    ).length,
                  },
                  {
                    id: "prescription",
                    label: "Prescriptions",
                    count: patientRecords.filter(
                      (r) =>
                        r.category.toLowerCase().includes("prescription") ||
                        r.title.toLowerCase().includes("medication")
                    ).length,
                  },
                ].map((type) => {
                  const isSelected = recordTypeFilter === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setRecordTypeFilter(type.id)}
                      className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                      }`}
                    >
                      <span>{type.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? "bg-white/20 text-white" : "bg-white text-slate-500"
                        }`}
                      >
                        {type.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Sort Controls Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {/* Search Bar */}
                <div className="w-full sm:w-72 flex items-center bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 text-xs text-slate-700">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search records by test or hospital..."
                    value={recordSearchQuery}
                    onChange={(e) => setRecordSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400"
                  />
                  {recordSearchQuery && (
                    <button
                      onClick={() => setRecordSearchQuery("")}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Order Dropdown */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs text-slate-400 font-medium">Sort By:</span>
                  <select
                    value={recordSortOrder}
                    onChange={(e: any) => setRecordSortOrder(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200/80 text-slate-700 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="newest">Newest Date First</option>
                    <option value="oldest">Oldest Date First</option>
                    <option value="abnormal_first">Flagged / Abnormalities First</option>
                    <option value="by_type">Group by Category / Type</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Inpatient Records List (User's preferred format) */}
            <div className="space-y-4">
              {filteredAndSortedRecords.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">No records found matching filters</p>
                  <p className="text-xs text-slate-400">Try changing your type filter or clearing the search term.</p>
                  <button
                    onClick={() => {
                      setRecordTypeFilter("all");
                      setRecordSearchQuery("");
                    }}
                    className="mt-2 text-xs font-semibold text-slate-800 underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredAndSortedRecords.map((rec) => {
                  const status = getRecordStatus(rec);
                  const tests = rec.extracted_data?.tests || [];

                  return (
                    <div
                      key={rec.id}
                      onClick={() => handleOpenReport(rec)}
                      className="bg-white rounded-3xl p-5 shadow-xs border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group"
                    >
                      {/* Left: Metadata & Clinical Details */}
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Tags Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {rec.record_date}
                          </span>
                          <span className="text-[11px] text-slate-600 font-medium">
                            {rec.doctor_or_facility || rec.facility || "Clinical Diagnostics"}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md">
                            {rec.category}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              status.isAbnormal
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {status.isAbnormal && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                            {status.label}
                          </span>
                        </div>

                        {/* Title & Summary */}
                        <div>
                          <h4 className="text-base font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {rec.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                            {rec.ai_summary || rec.summary}
                          </p>
                        </div>

                        {/* Test Parameter Preview Tags (Progressive Preview) */}
                        {tests.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {tests.slice(0, 4).map((t, idx) => (
                              <span
                                key={idx}
                                className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                  t.status === "HIGH" || t.status === "LOW" || t.status === "ELEVATED"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-slate-50 text-slate-600 border border-slate-100"
                                }`}
                              >
                                {t.name}: <strong>{t.value}</strong>
                              </span>
                            ))}
                            {tests.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{tests.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReport(rec);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold whitespace-nowrap self-start md:self-center transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        Inspect Report &rarr;
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUBVIEW: PATIENT SETTINGS & ACCOUNT PREFERENCES            */}
        {/* ========================================================== */}
        {activeSubTab === "settings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Account &amp; Health Settings
                </h2>
                <p className="text-xs text-slate-400">
                  Personal profile, emergency contact, notifications, and patient data consent.
                </p>
              </div>
              <button
                onClick={() => setSubTab("summary")}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3.5 py-1.5 rounded-xl bg-white shadow-xs cursor-pointer"
              >
                &larr; Back to Dashboard
              </button>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Settings and contact preferences saved successfully!
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Patient Profile & Emergency Contact */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-white/80 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Full Name</label>
                    <p className="font-semibold text-slate-800 mt-0.5">{patient.name}</p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Patient ID</label>
                    <p className="font-mono font-semibold text-slate-800 mt-0.5">{patient.id}</p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Age &amp; Gender</label>
                    <p className="font-semibold text-slate-800 mt-0.5">{patient.age} yrs &middot; {patient.gender}</p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium">Blood Group</label>
                    <p className="font-semibold text-emerald-700 mt-0.5">{patient.blood_group}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-rose-500" />
                    Emergency Contact (In Case of Emergency - ICE)
                  </h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">Contact Name</label>
                        <input
                          type="text"
                          value={iceName}
                          onChange={(e) => setIceName(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Relationship</label>
                        <input
                          type="text"
                          value={iceRelation}
                          onChange={(e) => setIceRelation(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 mt-0.5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Emergency Phone</label>
                      <input
                        type="text"
                        value={icePhone}
                        onChange={(e) => setIcePhone(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Notifications & Communication */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-white/80 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-500" />
                  Notifications &amp; Reminders
                </h3>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                    <div>
                      <p className="font-semibold text-slate-800">Appointment Reminders</p>
                      <p className="text-[11px] text-slate-400">SMS &amp; WhatsApp reminders 24h prior to consultation</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifySms}
                      onChange={(e) => setNotifySms(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                    <div>
                      <p className="font-semibold text-slate-800">Daily Medication Nudges</p>
                      <p className="text-[11px] text-slate-400">Audio and banner prompts for prescribed morning doses</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyRefill}
                      onChange={(e) => setNotifyRefill(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
                    <div>
                      <p className="font-semibold text-slate-800">New Diagnostic Results</p>
                      <p className="text-[11px] text-slate-400">Notify as soon as lab tests or ECG scans are processed</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifyWhatsApp}
                      onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>
                </div>
              </div>

              {/* Card 3: Patient Health Data Sharing (DPDP Compliance) */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xs border border-white/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      My Health Data Permissions (DPDP Sovereignty)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Under the Digital Personal Data Protection Act, you control which clinicians can access your health locker.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {patientConsents.filter((c) => c.status === "Approved").length} Active
                  </span>
                </div>

                {consentToast && (
                  <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between">
                    <span>{consentToast}</span>
                    <button onClick={() => setConsentToast(null)} className="text-slate-400 hover:text-white cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {patientConsents.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-500">
                      No active clinician access requests for this profile.
                    </div>
                  ) : (
                    patientConsents.map((con) => {
                      const doc = state.doctors.find((d) => d.id === con.doctor_id);
                      return (
                        <div
                          key={con.id}
                          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getDoctorPortrait(doc)}
                              alt={doc?.name || "Clinician"}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-xl object-cover object-top shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-800">
                                {doc?.name || con.doctor_id} &middot; {doc?.specialization || "Specialist"}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Scope: {con.requested_record_types.join(", ")} &middot; {con.duration_type} &middot; Status:{" "}
                                <strong
                                  className={
                                    con.status === "Approved"
                                      ? "text-emerald-700"
                                      : con.status === "Pending"
                                      ? "text-amber-700"
                                      : "text-rose-700"
                                  }
                                >
                                  {con.status}
                                </strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {con.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => handleConsentAction(con.id, "Approved")}
                                  className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-xl cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleConsentAction(con.id, "Rejected")}
                                  className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1 rounded-xl border border-slate-200 cursor-pointer"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {con.status === "Approved" && (
                              <button
                                onClick={() => handleConsentAction(con.id, "Revoke")}
                                className="text-xs font-medium text-rose-600 hover:text-rose-800 px-3 py-1 rounded-xl border border-rose-200 hover:bg-rose-50 cursor-pointer"
                              >
                                Revoke Access
                              </button>
                            )}
                            {(con.status === "Revoked" || con.status === "Rejected") && (
                              <button
                                onClick={() => handleConsentAction(con.id, "Approved")}
                                className="text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1 rounded-xl border border-slate-200 hover:bg-white cursor-pointer"
                              >
                                Restore Access
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patient, null, 2));
                      const downloadAnchor = document.createElement("a");
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `health_locker_${patient.id}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Download Complete Health Locker (JSON)
                  </button>

                  <button
                    onClick={() => {
                      setSettingsSaved(true);
                      setTimeout(() => setSettingsSaved(false), 3000);
                    }}
                    className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* RIGHT SIDE PANEL: "Find a doctor" & "Appointment queue"       */}
      {/* ============================================================== */}
      <div className="w-full lg:w-80 shrink-0 space-y-7">
        {/* 1. FIND A DOCTOR SECTION (Real Staffed Specialties Only) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Find a doctor</h3>
            {selectedSpecialty && selectedSpecialty !== "all" && (
              <button
                onClick={() => setSelectedSpecialty(null)}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubTab("appointments");
            }}
            className="relative"
          >
            <input
              type="text"
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              placeholder="Search doctor or specialty..."
              className="w-full bg-white rounded-2xl px-4 py-3 pr-10 text-xs text-slate-800 shadow-xs border border-white/80 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
            {doctorSearch ? (
              <button
                type="button"
                onClick={() => setDoctorSearch("")}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
            )}
          </form>

          {/* 3x2 Staffed Specialties Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {specialties.map((spec) => {
              const isSelected = selectedSpecialty === spec.id;
              return (
                <button
                  key={spec.id}
                  onClick={() => {
                    const next = isSelected ? null : spec.id;
                    setSelectedSpecialty(next);
                    const matchingDoc = state.doctors.find((d) => matchesSpecialty(d, next));
                    if (matchingDoc) {
                      setSelectedDoctorId(matchingDoc.id);
                      setSelectedClinicId(matchingDoc.clinic_id);
                      if (matchingDoc.slots?.[0]) setSelectedSlot(matchingDoc.slots[0]);
                    }
                    setSubTab("appointments");
                  }}
                  className={`rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1 transition-all duration-150 cursor-pointer aspect-square ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white hover:bg-white/90 text-slate-700 shadow-xs border border-white/80 hover:shadow-sm"
                  }`}
                >
                  <span className={isSelected ? "text-white" : "text-slate-600"}>
                    {spec.icon}
                  </span>
                  <span className="text-[11px] font-medium leading-tight">
                    {spec.label}
                  </span>
                  <span
                    className={`text-[10px] tabular-nums ${
                      isSelected ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {spec.count} {spec.count === 1 ? "doc" : "docs"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. APPOINTMENT QUEUE SECTION (Live Interactive Doctor Dropdown) */}
        <div className="space-y-3 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Appointment queue</h3>
            <span className="text-[11px] font-medium text-emerald-700">Live OPD</span>
          </div>

          {/* Interactive Selected Doctor Selector Card */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsQueueDropdownOpen(!isQueueDropdownOpen)}
              className="w-full bg-white rounded-2xl p-3.5 shadow-xs border border-white/80 hover:border-slate-200 flex items-center justify-between gap-3 cursor-pointer text-left transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={getDoctorPortrait(activeQueueDoctor)}
                  alt={activeQueueDoctor.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl object-cover object-top shrink-0"
                />
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[11px] text-slate-400 font-medium block truncate">
                    {activeQueueDoctor.specialization}
                  </span>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {activeQueueDoctor.name}
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                  isQueueDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isQueueDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-slate-200/80 py-1.5 z-30 max-h-64 overflow-y-auto">
                {state.doctors.map((doc) => {
                  const active = doc.id === activeQueueDoctor.id;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setQueueDoctorId(doc.id);
                        setIsQueueDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                        active ? "bg-slate-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <img
                        src={getDoctorPortrait(doc)}
                        alt={doc.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-lg object-cover object-top shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{doc.specialization}</p>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3-Column Stats Card (Queue, Position, ETA) */}
          <div className="bg-slate-200/60 rounded-2xl p-4 flex items-center justify-between text-center tabular-nums">
            {/* Queue */}
            <div className="space-y-0.5 flex-1 border-r border-slate-300/60">
              <span className="text-[10px] text-slate-500 font-medium">Token</span>
              <div className="text-base font-bold text-slate-800">{queueMetrics.token}</div>
            </div>

            {/* Position */}
            <div className="space-y-0.5 flex-1 border-r border-slate-300/60">
              <span className="text-[10px] text-slate-500 font-medium">Position</span>
              <div className="text-xs font-semibold text-slate-800">
                <span className="text-base font-bold">{queueMetrics.myTurn}</span> of {queueMetrics.totalQueue}
              </div>
            </div>

            {/* ETA */}
            <div className="space-y-0.5 flex-1">
              <span className="text-[10px] text-slate-500 font-medium">Next Slot</span>
              <div className="text-sm font-bold text-slate-800">{queueMetrics.etaSlot}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedDoctorId(activeQueueDoctor.id);
              setSelectedClinicId(activeQueueDoctor.clinic_id);
              if (activeQueueDoctor.slots?.[0]) setSelectedSlot(activeQueueDoctor.slots[0]);
              setSubTab("appointments");
            }}
            className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-white/80 shadow-xs transition-colors cursor-pointer"
          >
            Book Slot with {activeQueueDoctor.name.split(",")[0]} &rarr;
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* REPORT DETAIL MODAL (Progressive Disclosure)                   */}
      {/* ============================================================== */}
      {inspectingRecord && (
        <ReportDetailModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setInspectingRecord(null);
          }}
          record={inspectingRecord}
        />
      )}
    </div>
  );
};
