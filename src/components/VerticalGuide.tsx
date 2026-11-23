import React from "react";
import {
  LayoutGrid,
  Calendar,
  MessageSquare,
  Pill,
  FlaskConical,
  Activity,
  HeartHandshake,
  Settings,
  Stethoscope,
  Building2,
  ShieldCheck,
  Terminal,
  GitBranch,
  AlertTriangle,
  Mic,
  Hourglass as HourglassIcon,
} from "lucide-react";
import { TabType } from "../types";

export type PatientSubTab =
  | "summary"
  | "appointments"
  | "pharmacy"
  | "inpatient"
  | "timeline"
  | "laboratory"
  | "settings"
  | "upload";

interface VerticalGuideProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  activePatientSubTab?: PatientSubTab;
  onPatientSubTabChange?: (subTab: PatientSubTab) => void;
  onOpenEmergency: () => void;
  onOpenVoice: () => void;
  pendingConsentCount?: number;
}

export const VerticalGuide: React.FC<VerticalGuideProps> = ({
  currentTab,
  onTabChange,
  activePatientSubTab = "summary",
  onPatientSubTabChange = () => {},
  onOpenEmergency,
  onOpenVoice,
}) => {
  // Navigation items matching the reference screenshot:
  // Dashboard, Appointments, Messages, Pharmacy, Inpatient, Support, Settings
  // Note: Laboratory is merged into Inpatient (as requested)
  const primaryNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutGrid className="w-4 h-4" />,
      onClick: () => {
        onTabChange("patient");
        onPatientSubTabChange("summary");
      },
      isActive: currentTab === "patient" && activePatientSubTab === "summary",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: <Calendar className="w-4 h-4" />,
      onClick: () => {
        onTabChange("patient");
        onPatientSubTabChange("appointments");
      },
      isActive: currentTab === "patient" && activePatientSubTab === "appointments",
    },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: onOpenVoice,
      isActive: false,
      badge: "AI Voice",
    },
    {
      id: "pharmacy",
      label: "Pharmacy",
      icon: <Pill className="w-4 h-4" />,
      onClick: () => {
        onTabChange("patient");
        onPatientSubTabChange("pharmacy");
      },
      isActive: currentTab === "patient" && activePatientSubTab === "pharmacy",
    },
    {
      id: "inpatient",
      label: "Inpatient",
      icon: <Activity className="w-4 h-4" />,
      onClick: () => {
        onTabChange("patient");
        onPatientSubTabChange("inpatient");
      },
      isActive:
        currentTab === "patient" &&
        (activePatientSubTab === "inpatient" ||
          activePatientSubTab === "timeline" ||
          activePatientSubTab === "laboratory"),
    },
    {
      id: "support",
      label: "Support",
      icon: <HeartHandshake className="w-4 h-4" />,
      onClick: onOpenEmergency,
      isActive: false,
      badge: "ICE",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
      onClick: () => {
        onTabChange("patient");
        onPatientSubTabChange("settings");
      },
      isActive: currentTab === "patient" && activePatientSubTab === "settings",
    },
  ];

  return (
    <aside className="w-full lg:w-56 xl:w-60 shrink-0 flex flex-col justify-between py-2 lg:py-4 px-2 lg:px-3 select-none">
      <div className="space-y-6">
        {/* Brand / Logo - Soft minimalist emblem */}
        <div className="flex items-center gap-3 px-3 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 text-white flex items-center justify-center shadow-xs">
            <HourglassIcon className="w-5 h-5 text-slate-100" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
              Hourglass
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Patient Health Portal</p>
          </div>
        </div>

        {/* Primary Vertical Navigation List with generous spacing */}
        <nav className="space-y-1.5" aria-label="Vertical Guide">
          {primaryNavItems.map((item) => {
            const active = item.isActive;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all duration-150 cursor-pointer text-left ${
                  active
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={active ? "text-slate-900" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-200/60 text-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Patient Footer Information */}
      <div className="pt-6 border-t border-slate-200/60 px-3 text-slate-400 text-[11px] space-y-1">
        <p className="font-medium text-slate-600">Personal Health Portal</p>
        <p className="text-[10px] text-slate-400">DPDP Encrypted &middot; v2.4</p>
      </div>
    </aside>
  );
};
