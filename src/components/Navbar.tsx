import React from "react";
import {
  Activity,
  User,
  Stethoscope,
  Building2,
  ShieldCheck,
  GitBranch,
  AlertTriangle,
  Mic,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { TabType, Patient } from "../types";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: TabType) => void;
  onOpenEmergency: () => void;
  onOpenVoice: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  systemStatus?: {
    python: boolean;
    gemini: boolean;
  };
  pendingConsentCount?: number;
  patients?: Patient[];
  selectedPatientId?: string;
  onSelectPatient?: (patientId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenEmergency,
  onOpenVoice,
  onRefresh = () => {},
  isRefreshing = false,
  pendingConsentCount = 0,
  patients = [],
  selectedPatientId = "",
  onSelectPatient,
}) => {
  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: "patient", label: "Patient Care", icon: <User className="w-3.5 h-3.5" /> },
    { id: "doctor", label: "Doctor Portal", icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: "clinic", label: "Clinic OPD", icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: "consent", label: "Consent & Access", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: "python", label: "Engine & Logs", icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: "flowchart", label: "Architecture", icon: <GitBranch className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Bar */}
        <div className="flex items-center justify-between h-13">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-slate-900 text-base tracking-tight">
                Medi<span className="text-teal-600">Pulse</span>
              </span>
              <span className="text-[11px] text-teal-800 font-medium bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/50 hidden sm:inline">
                Clinical EHR
              </span>
            </div>
          </div>

          {/* Center Tabs - Clean & Horizontal */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Portal Navigation">
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "text-teal-900 bg-teal-50 border border-teal-200 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className={isActive ? "text-teal-600" : "text-slate-400"}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.id === "consent" && pendingConsentCount > 0 && (
                    <span className="ml-0.5 px-1 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                      {pendingConsentCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Active Patient Quick Dropdown */}
            {patients.length > 0 && onSelectPatient && (
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs border border-teal-200/80 rounded-md bg-teal-50/50 text-teal-900">
                <span className="text-teal-700/80 text-[11px] font-medium hidden sm:inline">Patient:</span>
                <select
                  id="navbar-patient-select"
                  value={selectedPatientId}
                  onChange={(e) => onSelectPatient(e.target.value)}
                  className="bg-transparent font-medium text-teal-950 focus:outline-none cursor-pointer text-xs"
                  title="Switch active patient"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id} className="text-slate-900 bg-white">
                      {p.name} ({p.age}y)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Voice Assistant */}
            <button
              id="navbar-voice-btn"
              onClick={onOpenVoice}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100/80 border border-teal-200/60 rounded-md transition-colors cursor-pointer"
              title="Voice Clinical Search"
            >
              <Mic className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Voice</span>
            </button>

            {/* Emergency Mode Button */}
            <button
              id="navbar-emergency-btn"
              onClick={onOpenEmergency}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
              title="Emergency Health Card"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Emergency</span>
            </button>

            {/* Sync Refresh */}
            <button
              id="navbar-refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-teal-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tier */}
        <nav className="flex md:hidden space-x-1 overflow-x-auto py-1.5 border-t border-slate-100 scrollbar-none" aria-label="Mobile Navigation">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "text-teal-900 bg-teal-50 border border-teal-200 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === "consent" && pendingConsentCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
