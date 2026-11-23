import React from "react";
import { ShieldCheck, History } from "lucide-react";
import { AppState } from "../types";
import { authFetch } from "../lib/authSession";

interface ConsentAuditViewProps {
  state: AppState;
  onRefresh: () => void;
}

export const ConsentAuditView: React.FC<ConsentAuditViewProps> = ({
  state,
  onRefresh,
}) => {
  const patient = state.patients[0];

  const handleApprove = async (consentId: string) => {
    await authFetch("/api/consents/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent_id: consentId, decision: "Approved" }),
    });
    onRefresh();
  };

  const handleReject = async (consentId: string) => {
    await authFetch("/api/consents/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent_id: consentId, decision: "Rejected" }),
    });
    onRefresh();
  };

  const handleRevoke = async (consentId: string) => {
    await authFetch("/api/consents/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent_id: consentId }),
    });
    onRefresh();
  };

  return (
    <div className="space-y-3.5 py-1">
      {/* Overview */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-3.5">
        <h1 className="text-base font-bold tracking-tight text-slate-900">
          Access Control &amp; Consent Governance
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 max-w-2xl">
          Role-based health record access governance, time-based validity limits (24 hours / 7 days), and tamper-evident audit logs.
        </p>
      </div>

      {/* 2 Columns: Active Consents & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Active & Pending Consents */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-xs">
              Consent Authorizations ({state.consents.length})
            </h2>
            <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/50 text-xs font-semibold">Patient: {patient?.name}</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {state.consents.map((consent) => {
              const doc = state.doctors.find((d) => d.id === consent.doctor_id);
              const isApproved = consent.status === "Approved";
              const isPending = consent.status === "Pending";

              return (
                <div
                  key={consent.id}
                  className="p-3 border border-slate-200/80 rounded-md space-y-2 bg-slate-50/40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {doc ? doc.name : "Physician"}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {doc?.specialization} &middot; Duration: {consent.duration_type}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        isApproved
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : isPending
                          ? "bg-amber-50 text-amber-900 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {consent.status}
                    </span>
                  </div>

                  <div className="text-slate-700 text-[11px]">
                    <span className="text-slate-400 font-medium">Authorized: </span>
                    <span className="font-medium text-slate-900">{consent.requested_record_types.join(", ")}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                    <span>Requested: {consent.created_at.slice(0, 16)}</span>
                    <div className="flex gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApprove(consent.id)}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-2xs cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(consent.id)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {isApproved && (
                        <button
                          onClick={() => handleRevoke(consent.id)}
                          className="text-rose-600 hover:underline cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Trail */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-xs">
              System Audit Trail ({state.consents.length + state.appointments.length} events)
            </h2>
            <span className="text-slate-400 text-xs">Immutable Logs</span>
          </div>

          <div className="space-y-2 text-xs">
            {state.consents.map((c) => {
              const doc = state.doctors.find((d) => d.id === c.doctor_id);
              return (
                <div key={`audit-${c.id}`} className="py-2 border-b border-slate-100 last:border-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-slate-800">
                      Consent {c.status}: {doc?.name || "Doctor"}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {c.created_at.slice(0, 16)}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Scope: {c.requested_record_types.join(", ")} · Validity: {c.duration_type}
                  </p>
                </div>
              );
            })}
            {state.appointments.slice(0, 4).map((a) => (
              <div key={`audit-apt-${a.id}`} className="py-2 border-b border-slate-100 last:border-0">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-slate-800">
                    OPD Encounter: {a.status}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {a.date} {a.time_slot}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Complaint: {a.reason || "General visit"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
