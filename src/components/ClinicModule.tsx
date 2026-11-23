import React, { useState } from "react";
import {
  Building2,
  Plus,
  UserPlus,
  Clock,
  Calendar,
  Check,
} from "lucide-react";
import { AppState } from "../types";
import { authFetch } from "../lib/authSession";

interface ClinicModuleProps {
  state: AppState;
  onRefresh: () => void;
}

export const ClinicModule: React.FC<ClinicModuleProps> = ({ state, onRefresh }) => {
  const [showAddClinic, setShowAddClinic] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [activeClinicFilter, setActiveClinicFilter] = useState<string>("all");
  const [updatingAptId, setUpdatingAptId] = useState<string | null>(null);

  // Clinic Form
  const [clinicName, setClinicName] = useState("");
  const [clinicLocation, setClinicLocation] = useState("");
  const [clinicContact, setClinicContact] = useState("");
  const [clinicDepts, setClinicDepts] = useState("");

  // Doctor Form
  const [docClinicId, setDocClinicId] = useState(state.clinics[0]?.id || "");
  const [docName, setDocName] = useState("");
  const [docSpec, setDocSpec] = useState("");
  const [docExp, setDocExp] = useState("8 Years");
  const [docFee, setDocFee] = useState(700);

  // Financial & Operational Metrics
  const totalConsultations = state.appointments.length;
  const completedAppointments = state.appointments.filter((a) => a.status === "Completed").length;
  const confirmedAppointments = state.appointments.filter((a) => a.status === "Confirmed").length;

  const totalRevenue = state.appointments.reduce((sum, apt) => {
    const doc = state.doctors.find((d) => d.id === apt.doctor_id);
    const fee = doc ? doc.fee : 600;
    return apt.status !== "Cancelled" ? sum + fee : sum;
  }, 0);

  const realizedRevenue = state.appointments.reduce((sum, apt) => {
    const doc = state.doctors.find((d) => d.id === apt.doctor_id);
    const fee = doc ? doc.fee : 600;
    return apt.status === "Completed" ? sum + fee : sum;
  }, 0);

  const filteredAppointments = state.appointments.filter((a) => {
    if (activeClinicFilter === "all") return true;
    return a.clinic_id === activeClinicFilter;
  });

  const handleUpdateStatus = async (aptId: string, status: "Confirmed" | "Completed" | "Cancelled") => {
    setUpdatingAptId(aptId);
    try {
      await authFetch("/api/appointments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment_id: aptId, status }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingAptId(null);
    }
  };

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName) return;
    try {
      await authFetch("/api/clinics/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clinicName,
          location: clinicLocation,
          contact: clinicContact,
          departments: clinicDepts,
        }),
      });
      setClinicName("");
      setClinicLocation("");
      setShowAddClinic(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docSpec) return;
    try {
      await authFetch("/api/doctors/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinic_id: docClinicId,
          name: docName,
          specialization: docSpec,
          experience: docExp,
          fee: docFee,
          slots: ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM"],
        }),
      });
      setDocName("");
      setDocSpec("");
      setShowAddDoctor(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-3.5 py-1">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900">
            Clinic &amp; Hospital Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rosters, consultation slots, clinic branches, and daily OPD operational flow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddClinic(!showAddClinic)}
            className="px-2.5 py-1.5 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-900 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            <span>Add Branch</span>
          </button>
          <button
            onClick={() => setShowAddDoctor(!showAddDoctor)}
            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Clean Minimalist KPIs Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-teal-50/50 border border-teal-200/80 rounded-lg p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-teal-800 block uppercase tracking-wider">
            Realized OPD Revenue
          </span>
          <span className="text-lg font-bold text-teal-950 font-mono tabular-nums mt-0.5 block">
            ₹{realizedRevenue.toLocaleString()}
          </span>
          <span className="text-[11px] text-teal-700/80 mt-0.5 block">
            {completedAppointments} completed visits
          </span>
        </div>

        <div className="bg-sky-50/50 border border-sky-200/80 rounded-lg p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-sky-800 block uppercase tracking-wider">
            Projected Pipeline
          </span>
          <span className="text-lg font-bold text-sky-950 font-mono tabular-nums mt-0.5 block">
            ₹{totalRevenue.toLocaleString()}
          </span>
          <span className="text-[11px] text-sky-700/80 mt-0.5 block">
            {confirmedAppointments} scheduled slots
          </span>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-lg p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-800 block uppercase tracking-wider">
            Active Physicians
          </span>
          <span className="text-lg font-bold text-emerald-950 font-mono tabular-nums mt-0.5 block">
            {state.doctors.length} Doctors
          </span>
          <span className="text-[11px] text-emerald-700/80 mt-0.5 block">
            Across {state.clinics.length} locations
          </span>
        </div>

        <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-lg p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-indigo-800 block uppercase tracking-wider">
            Completion Rate
          </span>
          <span className="text-lg font-bold text-indigo-950 font-mono tabular-nums mt-0.5 block">
            {totalConsultations > 0 ? Math.round((completedAppointments / totalConsultations) * 100) : 0}%
          </span>
          <span className="text-[11px] text-indigo-700/80 mt-0.5 block">
            {completedAppointments} / {totalConsultations} encounters
          </span>
        </div>
      </div>

      {/* Add Clinic Form */}
      {showAddClinic && (
        <form onSubmit={handleCreateClinic} className="bg-white border border-teal-200 rounded-lg p-4 space-y-3 text-xs shadow-2xs">
          <span className="font-bold text-slate-900 block text-xs">Register New Clinic Branch</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Clinic name (e.g. Sunrise Polyclinic)"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-teal-500"
            />
            <input
              type="text"
              required
              placeholder="Location (e.g. Shivajinagar, Pune)"
              value={clinicLocation}
              onChange={(e) => setClinicLocation(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-teal-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Contact number"
              value={clinicContact}
              onChange={(e) => setClinicContact(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-teal-500"
            />
            <input
              type="text"
              placeholder="Departments (e.g. Cardiology, Pathology)"
              value={clinicDepts}
              onChange={(e) => setClinicDepts(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-teal-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddClinic(false)}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold shadow-2xs"
            >
              Save Clinic
            </button>
          </div>
        </form>
      )}

      {/* Add Doctor Form */}
      {showAddDoctor && (
        <form onSubmit={handleCreateDoctor} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-xs">
          <span className="font-semibold text-slate-900 block text-sm">Onboard Doctor</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={docClinicId}
              onChange={(e) => setDocClinicId(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white"
            >
              {state.clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="Full name & degree (e.g. Dr. Sneha Kulkarni, MD)"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-md"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Specialization (e.g. Diabetologist)"
              value={docSpec}
              onChange={(e) => setDocSpec(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-md"
            />
            <input
              type="text"
              placeholder="Experience (e.g. 10 Years)"
              value={docExp}
              onChange={(e) => setDocExp(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-md"
            />
            <input
              type="number"
              placeholder="Fee (₹)"
              value={docFee}
              onChange={(e) => setDocFee(Number(e.target.value))}
              className="px-2.5 py-1.5 border border-slate-200 rounded-md"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddDoctor(false)}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold shadow-2xs cursor-pointer"
            >
              Save Doctor
            </button>
          </div>
        </form>
      )}

      {/* Directory Grids: Clinics & Doctors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Clinics List */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-3.5 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-xs">
              Clinics &amp; Branches ({state.clinics.length})
            </h2>
          </div>
          <div className="space-y-2 text-xs">
            {state.clinics.map((clinic) => {
              const count = state.doctors.filter((d) => d.clinic_id === clinic.id).length;
              return (
                <div key={clinic.id} className="p-2.5 border border-slate-200/80 rounded-md space-y-1 bg-slate-50/40">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">{clinic.name}</span>
                    <span className="text-teal-700 font-semibold text-[11px] bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200/50">{count} doctors</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {clinic.location} &middot; {clinic.contact}
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    Depts: {clinic.departments}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctors Roster */}
        <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-3.5 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-xs">
              Physician Directory ({state.doctors.length})
            </h2>
          </div>
          <div className="space-y-2 text-xs">
            {state.doctors.map((doc) => {
              const cl = state.clinics.find((c) => c.id === doc.clinic_id);
              return (
                <div key={doc.id} className="p-2.5 border border-slate-200/80 rounded-md space-y-1 bg-slate-50/40">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{doc.name}</span>
                    <span className="font-mono tabular-nums text-teal-800 font-bold bg-teal-50 px-1.5 py-0.2 rounded text-[11px]">₹{doc.fee}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {doc.specialization} &middot; {doc.experience} &middot; {cl?.name || "Main Clinic"}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {doc.slots.map((s, idx) => (
                      <span key={idx} className="text-[10px] text-slate-500 font-mono">
                        {s}{idx < doc.slots.length - 1 ? " ·" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* OPD Queue & Dispatch */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
          <h2 className="font-bold text-slate-900 text-xs">
            Central OPD Queue ({filteredAppointments.length})
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Branch:</span>
            <select
              value={activeClinicFilter}
              onChange={(e) => setActiveClinicFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Branches</option>
              {state.clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">No appointments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-medium text-[11px]">
                  <th className="py-2 px-3">Patient</th>
                  <th className="py-2 px-3">Physician</th>
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Complaint</th>
                  <th className="py-2 px-3">Fee</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => {
                  const pat = state.patients.find((p) => p.id === apt.patient_id);
                  const doc = state.doctors.find((d) => d.id === apt.doctor_id);
                  const isUpdating = updatingAptId === apt.id;

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-900 block">{pat?.name || "Patient"}</span>
                        <span className="text-[11px] text-slate-400">{pat?.phone}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {doc?.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {apt.date} {apt.time_slot}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                        {apt.reason || "Consultation"}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-900">
                        ₹{doc?.fee || 600}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-600 font-medium">{apt.status}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {apt.status !== "Completed" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(apt.id, "Completed")}
                              className="text-emerald-700 hover:underline cursor-pointer font-medium text-[11px]"
                            >
                              Check-Out
                            </button>
                          )}
                          {apt.status !== "Cancelled" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(apt.id, "Cancelled")}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer text-[11px]"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
