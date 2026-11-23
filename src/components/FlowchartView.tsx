import React from "react";
import {
  User,
  Building2,
  Stethoscope,
  ShieldCheck,
  Cpu,
  Database,
  Calendar,
  Search,
  AlertTriangle,
  FileCheck2,
  Clock,
  QrCode,
  Mic,
  ArrowRight,
} from "lucide-react";

interface FlowchartViewProps {
  onNavigate: (tab: string) => void;
  onOpenEmergency: () => void;
  onOpenVoice: () => void;
}

export const FlowchartView: React.FC<FlowchartViewProps> = ({
  onNavigate,
  onOpenEmergency,
  onOpenVoice,
}) => {
  return (
    <div className="space-y-8 py-2">
      {/* Editorial Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Architecture &amp; System Flow
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          Unified clinical EHR platform connecting patient self-care, doctor consultations, OPD administration, and access governance.
        </p>
      </div>

      {/* 4 Primary Pillars */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Core Portals &amp; Workflows
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Patient Portal */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Patient Portal</h3>
                  <p className="text-xs text-slate-400">Self-care &amp; records</p>
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-300">·</span>
                  <span>Patient profile &amp; emergency vitals</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-300">·</span>
                  <span>Search &amp; book OPD appointments</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-300">·</span>
                  <span>Upload medical reports (OCR extraction)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-300">·</span>
                  <span>Longitudinal medical timeline</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-300">·</span>
                  <span>Manage access consent &amp; requests</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate("patient")}
              className="mt-4 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Open Patient Care</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Clinic / Hospital Module */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between hover:border-teal-300 transition-colors">
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 border border-teal-200/50 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Clinic &amp; Hospital</h3>
                  <p className="text-xs text-slate-400">OPD ops &amp; roster</p>
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Multi-branch clinic directory</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Physician onboarding &amp; fee schedules</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Central OPD queue &amp; check-in status</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Operational consultation revenue</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate("clinic")}
              className="mt-4 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Manage Clinics &amp; Doctors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. Doctor Consultation Side */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between hover:border-teal-300 transition-colors">
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 border border-teal-200/50 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Doctor Consultation</h3>
                  <p className="text-xs text-slate-400">Clinical safety &amp; notes</p>
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Longitudinal biomarker trends (HbA1c, Lipids)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Active cross-encounter regimen tracking</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Real-time drug allergy safety checker</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Order sets &amp; digital prescription issuance</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate("doctor")}
              className="mt-4 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Open Doctor Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. Access Control & Consent */}
          <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between hover:border-teal-300 transition-colors">
            <div>
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-700 border border-teal-200/50 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Access Control</h3>
                  <p className="text-xs text-slate-400">Consent &amp; audit trails</p>
                </div>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Physician record access requests</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Patient approve / reject / revoke actions</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Granular scope &amp; duration limits (24h/7d)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal-400">&bull;</span>
                  <span>Tamper-evident audit trail</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate("consent")}
              className="mt-4 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Manage Consents &amp; Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Tier: Document Processing & Database Layer */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Processing &amp; Data Pipeline
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Document Processing Engine */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-slate-700" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Document Processing Engine
                </h3>
              </div>
              <span className="text-xs text-slate-400">OCR &amp; NLP</span>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <strong className="text-slate-900 block font-medium">1. Text Extraction</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">Scans raw text from clinical reports, prescriptions, and lab tests.</p>
              </div>
              <div>
                <strong className="text-slate-900 block font-medium">2. Classification</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">Categorizes into Lab Report, Prescription, Radiology, or Discharge.</p>
              </div>
              <div>
                <strong className="text-slate-900 block font-medium">3. Parameter Extraction</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">Parses glucose, HbA1c, creatinine, blood pressure, and dosages.</p>
              </div>
              <div>
                <strong className="text-slate-900 block font-medium">4. Summarization</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">Extracts critical findings into a longitudinal timeline.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => onNavigate("python")}
                className="text-xs font-medium text-slate-900 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect Engine Implementation</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Database Layer */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-slate-700" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Database &amp; Storage Architecture
                </h3>
              </div>
              <span className="text-xs text-slate-400">SQLite3 (healthcare.db)</span>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <strong className="text-slate-900 block font-medium">Original Records</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">Raw clinical documents and attachment metadata.</p>
              </div>
              <div>
                <strong className="text-slate-900 block font-medium">Structured Parameters</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">Normal ranges, diagnostic values, and active drug regimens.</p>
              </div>
              <div>
                <strong className="text-slate-900 block font-medium">Appointments &amp; Slots</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">Doctor schedules, patient bookings, and clinic rosters.</p>
              </div>
              <div>
                <strong className="text-slate-900 block font-medium">Access Logs</strong>
                <p className="text-slate-500 text-[11px] mt-0.5">Timestamped audit records for all viewing and grant events.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => onNavigate("python")}
                className="text-xs font-medium text-slate-900 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
              >
                <span>View Database Tables</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Navigation Grid */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Platform Capabilities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate("patient")}
            className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-slate-900 font-medium text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Medical Timeline</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Chronological history across all consultations and lab tests.
            </p>
          </button>

          <button
            onClick={() => onNavigate("patient")}
            className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-slate-900 font-medium text-xs mb-1">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Semantic Search</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Query medical history with natural language questions.
            </p>
          </button>

          <button
            onClick={() => onNavigate("doctor")}
            className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-slate-900 font-medium text-xs mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Allergy Protection</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Cross-checks drug prescriptions against known sensitivities.
            </p>
          </button>

          <button
            onClick={() => onNavigate("patient")}
            className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-slate-900 font-medium text-xs mb-1">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Report Summarizer</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Synthesizes multi-page lab findings into clear summaries.
            </p>
          </button>

          <button
            onClick={() => onNavigate("patient")}
            className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-slate-900 font-medium text-xs mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Medication Reminders</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Daily dosage schedules, timings, and adherence tracking.
            </p>
          </button>

          <button
            onClick={onOpenEmergency}
            className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-rose-700 font-medium text-xs mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Emergency Mode</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Quick emergency health card with blood group and critical flags.
            </p>
          </button>

          <button
            onClick={onOpenEmergency}
            className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-slate-900 font-medium text-xs mb-1">
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span>QR Sharing</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Temporary QR tokens for instant, secure physician handoff.
            </p>
          </button>

          <button
            onClick={onOpenVoice}
            className="p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-slate-900 font-medium text-xs mb-1">
              <Mic className="w-3.5 h-3.5 text-slate-500" />
              <span>Voice Entry</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Voice assistant with English, Hindi, and Marathi query support.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
