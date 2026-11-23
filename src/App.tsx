import React, { useState, useEffect, useCallback } from "react";
import { VerticalGuide, PatientSubTab } from "./components/VerticalGuide";
import { PatientPortal } from "./components/PatientPortal";
import { DoctorPortal } from "./components/DoctorPortal";
import { ClinicModule } from "./components/ClinicModule";
import { EmergencyModal } from "./components/EmergencyModal";
import { VoiceModal } from "./components/VoiceModal";
import { LoginScreen } from "./components/LoginScreen";
import { AppState, TabType, Patient } from "./types";
import { initialFallbackState } from "./mockData";
import { AuthUser, authFetch, setSessionToken } from "./lib/authSession";
import {
  Menu,
  X,
  Hourglass as HourglassIcon,
  AlertTriangle,
  Mic,
  LogOut,
} from "lucide-react";

export default function App() {
  // Authenticated user session (held strictly in memory via Bearer token)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [patientSubTab, setPatientSubTab] = useState<PatientSubTab>("summary");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("pat_1");
  const [state, setState] = useState<AppState>(initialFallbackState);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceAppliedQuery, setVoiceAppliedQuery] = useState("");

  const fetchState = useCallback(async () => {
    try {
      const res = await authFetch("/api/state");
      if (res.status === 401) {
        setSessionToken(null);
        setAuthUser(null);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data && data.patients && data.patients.length > 0) {
          setState(data);
          setSelectedPatientId((prev) =>
            data.patients.some((p: Patient) => p.id === prev) ? prev : data.patients[0].id
          );
        }
      }
    } catch (err: any) {
      console.info("State initialized from core clinical records:", err?.message);
    }
  }, []);

  useEffect(() => {
    if (authUser) {
      fetchState();
    }
  }, [authUser, fetchState]);

  const handleAuthenticated = (token: string, user: AuthUser) => {
    setSessionToken(token);
    setAuthUser(user);
    setPatientSubTab("summary");
    setMobileMenuOpen(false);
    setVoiceAppliedQuery("");
    if (user.role === "patient" && user.patientId) {
      setSelectedPatientId(user.patientId);
    }
  };

  const handleSignOut = async () => {
    try {
      await authFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore network error on sign out
    } finally {
      setSessionToken(null);
      setAuthUser(null);
      setState(initialFallbackState);
      setSelectedPatientId("pat_1");
      setMobileMenuOpen(false);
      setIsEmergencyOpen(false);
      setIsVoiceOpen(false);
      setVoiceAppliedQuery("");
    }
  };

  const handleSelectPatient = (patId: string) => {
    if (authUser?.role === "patient") return;
    setSelectedPatientId(patId);
  };

  const handleTabChange = (_tab: TabType) => {
    // Role is strictly locked to the signed-in portal
    setMobileMenuOpen(false);
  };

  const handlePatientSubTabChange = (subTab: PatientSubTab) => {
    setPatientSubTab(subTab);
    setMobileMenuOpen(false);
  };

  const handleVoiceApplyQuery = (query: string) => {
    setVoiceAppliedQuery(query);
  };

  // Gate the entire application behind the 3-mode login screen
  if (!authUser) {
    return <LoginScreen onAuthenticated={handleAuthenticated} />;
  }

  const activeRole = authUser.role;

  const currentPatient =
    state.patients?.find((p) => p.id === selectedPatientId) ||
    state.patients?.[0] ||
    initialFallbackState.patients[0];

  const roleSubtitle =
    activeRole === "patient"
      ? "Patient Portal"
      : activeRole === "doctor"
      ? "Doctor Workstation"
      : "Clinic OPD Desk";

  return (
    <div className="min-h-screen bg-[#ECEEF2] text-slate-800 p-2 sm:p-5 lg:p-8 flex flex-col justify-start items-center antialiased selection:bg-slate-800 selection:text-white">
      {/* Top Application Header (Strict Role-Isolated Session — No Cross-Role Switcher) */}
      <header className="w-full max-w-[1540px] flex flex-wrap items-center justify-between gap-3 pb-4 px-2">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <HourglassIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base leading-tight">Hourglass</span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-medium text-slate-600">{roleSubtitle}</span>
            </div>
            <span className="text-[11px] text-slate-400 block -mt-0.5">
              MediPulse Healthcare Platform
            </span>
          </div>
        </div>

        {/* Right Session Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex flex-col text-right pr-2 border-r border-slate-300/70">
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              {authUser.displayName}
            </span>
            <span className="text-[11px] text-slate-500 leading-tight">{authUser.identifier}</span>
          </div>

          {activeRole !== "clinic" && (
            <button
              onClick={() => setIsEmergencyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-rose-600 text-xs font-semibold shadow-xs hover:bg-rose-50 border border-rose-200 cursor-pointer whitespace-nowrap"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Emergency ICE</span>
              <span className="sm:hidden">ICE</span>
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          ROLE 1: PATIENT PORTAL (Patient only sees patient side)
      ───────────────────────────────────────────────────────────── */}
      {activeRole === "patient" && (
        <div className="w-full max-w-[1540px] bg-[#F4F6F8] rounded-[2.2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-300/40 border border-white/80 p-5 sm:p-7 lg:p-9 flex flex-col lg:flex-row gap-6 lg:gap-10 min-h-[88vh]">
          {/* Mobile Navigation Header (< lg) */}
          <div className="flex lg:hidden items-center justify-between pb-3 border-b border-slate-200/70">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer"
              aria-label="Toggle patient menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>{mobileMenuOpen ? "Close Menu" : "Patient Menu"}</span>
            </button>
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Query</span>
            </button>
          </div>

          {/* Patient-Only Sidebar */}
          <div className={`${mobileMenuOpen ? "block" : "hidden lg:block"}`}>
            <VerticalGuide
              currentTab="patient"
              onTabChange={handleTabChange}
              activePatientSubTab={patientSubTab}
              onPatientSubTabChange={handlePatientSubTabChange}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
              onOpenVoice={() => setIsVoiceOpen(true)}
            />
          </div>

          {/* Patient Main Stage */}
          <main className="flex-1 min-w-0 flex flex-col">
            <PatientPortal
              state={state}
              onRefresh={fetchState}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
              onOpenVoice={() => setIsVoiceOpen(true)}
              initialSearchQuery={voiceAppliedQuery}
              onClearInitialSearch={() => setVoiceAppliedQuery("")}
              activePatientId={selectedPatientId}
              onSelectPatient={handleSelectPatient}
              activeSubTab={patientSubTab}
              onSubTabChange={setPatientSubTab}
            />
          </main>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ROLE 2: DOCTOR PORTAL (Doctor only sees doctor side - Mediq)
      ───────────────────────────────────────────────────────────── */}
      {activeRole === "doctor" && (
        <div className="w-full max-w-[1540px]">
          <DoctorPortal
            state={state}
            onRefresh={fetchState}
            activePatientId={selectedPatientId}
            onSelectPatient={handleSelectPatient}
            signedInDoctor={{
              id: authUser.doctorId || "doc_1",
              name: authUser.displayName,
              specialization: authUser.specialization || "Attending Physician",
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ROLE 3: CLINIC PORTAL (Clinic only sees clinic side)
      ───────────────────────────────────────────────────────────── */}
      {activeRole === "clinic" && (
        <div className="w-full max-w-[1540px] bg-[#F4F6F8] rounded-[2.2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-300/40 border border-white/80 p-5 sm:p-7 lg:p-9 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
            <div>
              <h1 className="text-2xl font-light text-slate-800">
                Clinic OPD &amp; Queue Management
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Live department token queue, doctor schedule, patient check-in, and reception intake.
              </p>
            </div>
            <div className="text-xs font-medium text-emerald-700">Reception Desk Active</div>
          </div>
          <ClinicModule state={state} onRefresh={fetchState} />
        </div>
      )}

      {/* Subtle Bottom Credit */}
      <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-3">
        <span>Hourglass · MediPulse Healthcare Management System</span>
        <span aria-hidden="true">·</span>
        <span className="font-mono text-[11px] text-slate-500">
          Signed in as {authUser.displayName} ({roleSubtitle})
        </span>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        patient={currentPatient}
      />

      {/* Voice Assistant Modal */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onApplyQuery={handleVoiceApplyQuery}
      />
    </div>
  );
}
