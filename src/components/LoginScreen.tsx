import React, { useEffect, useState } from "react";
import {
  Hourglass as HourglassIcon,
  User,
  Stethoscope,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AuthRole, AuthUser } from "../lib/authSession";

interface RoleStatusInfo {
  envConfigured: boolean;
  initialized: boolean;
  needsSetup: boolean;
}

interface AuthStatusResponse {
  roles: Record<AuthRole, RoleStatusInfo>;
  patients: Array<{ id: string; name: string; email: string }>;
  doctors: Array<{ id: string; name: string; specialization: string; email: string }>;
  clinics: Array<{ id: string; name: string; location: string; email: string }>;
}

interface LoginScreenProps {
  onAuthenticated: (token: string, user: AuthUser) => void;
}

const ROLE_META: Record<
  AuthRole,
  {
    label: string;
    portalTitle: string;
    headline: string;
    description: string;
    identifierLabel: string;
    defaultIdentifier: string;
    defaultDisplayName: string;
    capabilities: string[];
  }
> = {
  patient: {
    label: "Patient",
    portalTitle: "Hourglass Patient Portal",
    headline: "Your health history, appointments, and pharmacy in one calm workspace.",
    description:
      "Sign in as a patient to view your clinical reports, upload diagnostics, manage prescriptions, and control DPDP data consent.",
    identifierLabel: "Patient Email or ID",
    defaultIdentifier: "rahul.jadhav@hourglass.health",
    defaultDisplayName: "Rahul Jadhav",
    capabilities: [
      "View strictly your own clinical records and lab results",
      "Book specialists and track live OPD queue position",
      "Approve or revoke doctor record access under DPDP rules",
    ],
  },
  doctor: {
    label: "Doctor",
    portalTitle: "Mediq Clinical Workstation",
    headline: "Clinical context, allergy safety checks, and digital prescribing.",
    description:
      "Sign in with your physician profile to inspect patient histories, review biomarker trends, record SOAP notes, and sign prescriptions.",
    identifierLabel: "Physician Email or Medical ID",
    defaultIdentifier: "rajesh.sharma@mediq.health",
    defaultDisplayName: "Dr. Rajesh Sharma, MD",
    capabilities: [
      "Sign in under any attending physician profile or register a new doctor",
      "Cross-check new prescriptions against documented drug allergies",
      "Monitor patient vitals trends, SOAP notes, and diagnostic reports",
    ],
  },
  clinic: {
    label: "Clinic",
    portalTitle: "Clinic OPD Administration",
    headline: "Central queue dispatch, physician rosters, and branch operations.",
    description:
      "Sign in as front-desk or clinic administration staff to manage branches, onboard doctors, check out OPD visits, and track consultation flow.",
    identifierLabel: "Clinic Desk Email or Staff ID",
    defaultIdentifier: "desk.clinic_1@cityhealth.clinic",
    defaultDisplayName: "City Health Super-Speciality Hospital",
    capabilities: [
      "Manage multi-branch clinics and specialist fee schedules",
      "Track central OPD queue status and patient check-outs",
      "Onboard new physicians with live slot availability",
    ],
  },
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthenticated }) => {
  const [selectedRole, setSelectedRole] = useState<AuthRole>("patient");
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("pat_1");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("doc_1");
  const [selectedDoctorSpec, setSelectedDoctorSpec] = useState<string>("Cardiologist");
  const [selectedClinicId, setSelectedClinicId] = useState<string>("clinic_1");

  const [identifier, setIdentifier] = useState<string>(ROLE_META.patient.defaultIdentifier);
  const [displayName, setDisplayName] = useState<string>(ROLE_META.patient.defaultDisplayName);
  const [specializationInput, setSpecializationInput] = useState<string>("General Physician");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch("/api/auth/status");
      if (res.ok) {
        const data: AuthStatusResponse = await res.json();
        setAuthStatus(data);
        if (data.patients && data.patients.length > 0) {
          const firstPat = data.patients[0];
          setSelectedPatientId(firstPat.id);
          setIdentifier(firstPat.email);
          setDisplayName(firstPat.name);
        }
        if (data.doctors && data.doctors.length > 0) {
          setSelectedDoctorId(data.doctors[0].id);
          setSelectedDoctorSpec(data.doctors[0].specialization);
        }
        if (data.clinics && data.clinics.length > 0) {
          setSelectedClinicId(data.clinics[0].id);
        }
      }
    } catch {
      // Keep defaults if status call fails transiently
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const roleStatus = authStatus?.roles?.[selectedRole];
  const isFirstRunSetup = mode === "signin" && Boolean(roleStatus?.needsSetup);
  const meta = ROLE_META[selectedRole];

  const handleRoleSwitch = (role: AuthRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setPassword("");
    setConfirmPassword("");
    setMode("signin");

    if (role === "patient" && authStatus?.patients?.length) {
      const matched =
        authStatus.patients.find((p) => p.id === selectedPatientId) || authStatus.patients[0];
      setSelectedPatientId(matched.id);
      setIdentifier(matched.email);
      setDisplayName(matched.name);
    } else if (role === "doctor" && authStatus?.doctors?.length) {
      const matched =
        authStatus.doctors.find((d) => d.id === selectedDoctorId) || authStatus.doctors[0];
      setSelectedDoctorId(matched.id);
      setSelectedDoctorSpec(matched.specialization);
      setIdentifier(matched.email);
      setDisplayName(matched.name);
    } else if (role === "clinic" && authStatus?.clinics?.length) {
      const matched =
        authStatus.clinics.find((c) => c.id === selectedClinicId) || authStatus.clinics[0];
      setSelectedClinicId(matched.id);
      setIdentifier(matched.email);
      setDisplayName(matched.name);
    } else {
      setIdentifier(ROLE_META[role].defaultIdentifier);
      setDisplayName(ROLE_META[role].defaultDisplayName);
    }
  };

  const handlePatientProfileChange = (patId: string) => {
    setSelectedPatientId(patId);
    const matched = authStatus?.patients?.find((p) => p.id === patId);
    if (matched) {
      setIdentifier(matched.email);
      setDisplayName(matched.name);
    }
  };

  const handleDoctorProfileChange = (docId: string) => {
    setSelectedDoctorId(docId);
    const matched = authStatus?.doctors?.find((d) => d.id === docId);
    if (matched) {
      setIdentifier(matched.email);
      setDisplayName(matched.name);
      setSelectedDoctorSpec(matched.specialization);
    }
  };

  const handleClinicProfileChange = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    const matched = authStatus?.clinics?.find((c) => c.id === clinicId);
    if (matched) {
      setIdentifier(matched.email);
      setDisplayName(matched.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if ((isFirstRunSetup || mode === "register") && password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter to confirm.");
      return;
    }

    const endpoint =
      mode === "register"
        ? "/api/auth/register"
        : isFirstRunSetup
        ? "/api/auth/setup"
        : "/api/auth/login";

    setSubmitting(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          identifier: identifier.trim(),
          displayName: displayName.trim() || meta.defaultDisplayName,
          password,
          patientId: selectedRole === "patient" ? selectedPatientId : undefined,
          doctorId:
            selectedRole === "doctor"
              ? mode === "register"
                ? undefined
                : selectedDoctorId
              : undefined,
          specialization:
            selectedRole === "doctor"
              ? mode === "register"
                ? specializationInput.trim() || "Attending Physician"
                : selectedDoctorSpec
              : undefined,
          clinicId: selectedRole === "clinic" ? selectedClinicId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Unable to sign in. Please verify your credentials.");
        if (res.status === 409) {
          loadStatus();
        }
        return;
      }
      if (data.token && data.user) {
        onAuthenticated(data.token, data.user);
      }
    } catch {
      setErrorMsg("Could not reach the authentication server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEEF2] text-slate-800 p-4 sm:p-8 flex flex-col items-center justify-center antialiased selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-[1040px] bg-white rounded-[2rem] shadow-xl shadow-slate-300/40 border border-white/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Editorial Column */}
        <div className="lg:col-span-5 bg-[#F4F6F8] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/70">
          <div className="space-y-8">
            {/* Brand Lockup */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <HourglassIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg tracking-tight block leading-tight">
                  Hourglass
                </span>
                <span className="text-xs text-slate-500 block">
                  MediPulse Healthcare Platform
                </span>
              </div>
            </div>

            {/* Dynamic Role Context */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-teal-700">{meta.portalTitle}</p>
              <h1 className="text-2xl sm:text-[1.7rem] font-semibold text-slate-900 tracking-tight leading-snug text-balance">
                {meta.headline}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">{meta.description}</p>
            </div>

            {/* Capabilities */}
            <div className="space-y-3 pt-2 border-t border-slate-200/80">
              {meta.capabilities.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Authentication Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                {mode === "register"
                  ? `Register ${meta.label} Account`
                  : isFirstRunSetup
                  ? `Activate ${meta.label} Portal`
                  : `Sign in to ${meta.label} Portal`}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your role and profile below. Each session unlocks only its authorized workspace.
              </p>
            </div>

            {/* 3-Mode Role Selector */}
            <div
              className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/70"
              role="tablist"
              aria-label="Portal login role"
            >
              {(
                [
                  { id: "patient", label: "Patient", Icon: User },
                  { id: "doctor", label: "Doctor", Icon: Stethoscope },
                  { id: "clinic", label: "Clinic", Icon: Building2 },
                ] as const
              ).map(({ id, label, Icon }) => {
                const active = selectedRole === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleRoleSwitch(id)}
                    className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* First-Run Setup Notice */}
            {!statusLoading && isFirstRunSetup && (
              <div className="rounded-xl bg-teal-50/70 border border-teal-200/80 px-4 py-3 text-xs text-teal-900 leading-relaxed">
                <span className="font-semibold block">First-time portal activation</span>
                Choose a password below to secure the {meta.label.toLowerCase()} portal. You will
                use this password whenever signing in as {meta.label.toLowerCase()}.
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient Profile Selector (Patient Role, Sign In mode) */}
              {selectedRole === "patient" &&
                mode === "signin" &&
                authStatus?.patients &&
                authStatus.patients.length > 0 && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="patient-profile-select"
                      className="text-xs font-medium text-slate-700 block"
                    >
                      Patient Account
                    </label>
                    <select
                      id="patient-profile-select"
                      value={selectedPatientId}
                      onChange={(e) => handlePatientProfileChange(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
                    >
                      {authStatus.patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              {/* Doctor Profile Selector (Doctor Role, Sign In mode) */}
              {selectedRole === "doctor" &&
                mode === "signin" &&
                authStatus?.doctors &&
                authStatus.doctors.length > 0 && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="doctor-profile-select"
                      className="text-xs font-medium text-slate-700 block"
                    >
                      Physician Profile
                    </label>
                    <select
                      id="doctor-profile-select"
                      value={selectedDoctorId}
                      onChange={(e) => handleDoctorProfileChange(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
                    >
                      {authStatus.doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              {/* Clinic Branch Selector (Clinic Role, Sign In mode) */}
              {selectedRole === "clinic" &&
                mode === "signin" &&
                authStatus?.clinics &&
                authStatus.clinics.length > 0 && (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="clinic-profile-select"
                      className="text-xs font-medium text-slate-700 block"
                    >
                      Clinic Branch Desk
                    </label>
                    <select
                      id="clinic-profile-select"
                      value={selectedClinicId}
                      onChange={(e) => handleClinicProfileChange(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
                    >
                      {authStatus.clinics.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              {/* Full Name (Registration mode) */}
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-display-name"
                    className="text-xs font-medium text-slate-700 block"
                  >
                    {selectedRole === "doctor"
                      ? "Physician Full Name"
                      : selectedRole === "clinic"
                      ? "Clinic / Desk Name"
                      : "Full Name"}
                  </label>
                  <input
                    id="auth-display-name"
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={
                      selectedRole === "doctor"
                        ? "e.g. Dr. Sneha Kulkarni, MD"
                        : meta.defaultDisplayName
                    }
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
                  />
                </div>
              )}

              {/* Specialization (Doctor Registration mode) */}
              {mode === "register" && selectedRole === "doctor" && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-specialization"
                    className="text-xs font-medium text-slate-700 block"
                  >
                    Specialization
                  </label>
                  <input
                    id="auth-specialization"
                    type="text"
                    required
                    value={specializationInput}
                    onChange={(e) => setSpecializationInput(e.target.value)}
                    placeholder="e.g. Cardiologist, Orthopedic Surgeon"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
                  />
                </div>
              )}

              {/* Identifier / Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-identifier"
                  className="text-xs font-medium text-slate-700 block"
                >
                  {meta.identifierLabel}
                </label>
                <input
                  id="auth-identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={meta.defaultIdentifier}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-password"
                  className="text-xs font-medium text-slate-700 block"
                >
                  {isFirstRunSetup ? "Create Portal Password" : "Password"}
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete={
                      isFirstRunSetup || mode === "register" ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full min-h-[44px] px-3.5 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (First-Run Setup or Registration) */}
              {(isFirstRunSetup || mode === "register") && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="auth-confirm-password"
                    className="text-xs font-medium text-slate-700 block"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400"
                  />
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-700 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || statusLoading}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "register"
                        ? `Create ${meta.label} Account`
                        : isFirstRunSetup
                        ? `Set Password & Enter ${meta.label} Portal`
                        : `Sign In as ${meta.label}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign In / Register Account */}
            {!isFirstRunSetup && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  {mode === "signin"
                    ? `Need a separate ${meta.label.toLowerCase()} login?`
                    : "Already have credentials?"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = mode === "signin" ? "register" : "signin";
                    setMode(nextMode);
                    setErrorMsg(null);
                    setPassword("");
                    setConfirmPassword("");
                    if (nextMode === "register") {
                      setDisplayName("");
                      setIdentifier("");
                    } else {
                      handleRoleSwitch(selectedRole);
                    }
                  }}
                  className="font-semibold text-slate-900 hover:underline cursor-pointer"
                >
                  {mode === "signin" ? "Register account" : "Back to sign in"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Hourglass · MediPulse Healthcare Management System
      </p>
    </div>
  );
};
