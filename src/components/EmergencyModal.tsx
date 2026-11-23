import React, { useState } from "react";
import {
  AlertTriangle,
  X,
  QrCode,
  Phone,
  Copy,
  Check,
} from "lucide-react";
import { Patient } from "../types";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrExpiryHours, setQrExpiryHours] = useState(24);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/emergency?token=${patient.qr_token}&exp=${qrExpiryHours}h`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              Emergency Health Card
            </h2>
            <p className="text-xs text-slate-400">
              Immediate clinical responder access &amp; vitals
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Patient Card */}
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-md">
            <div>
              <span className="text-slate-400 text-[11px] block uppercase">Patient</span>
              <h3 className="text-base font-bold text-slate-900">{patient.name}</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {patient.age} yrs · {patient.gender}
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px] block uppercase">Blood Group</span>
              <span className="font-bold text-base text-rose-700 font-mono">
                {patient.blood_group}
              </span>
            </div>
          </div>

          {/* Critical Allergies */}
          <div className="p-4 border border-rose-200 bg-rose-50/50 rounded-md space-y-2">
            <div className="flex items-center gap-1.5 text-rose-900 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Documented Hypersensitivities:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((all, idx) => (
                <span
                  key={idx}
                  className="font-medium text-rose-950"
                >
                  {all}{idx < patient.allergies.length - 1 ? " ·" : ""}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-rose-800">
              Avoid penicillin derivatives, sulfonamides, or associated cross-reactive formulations.
            </p>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 border border-slate-200 rounded-md space-y-1">
            <span className="text-slate-400 text-[11px] block uppercase">Primary Emergency Contact</span>
            <div className="flex justify-between items-baseline pt-1">
              <div>
                <p className="font-semibold text-slate-900">{patient.emergency_contact.name}</p>
                <p className="text-slate-500 text-[11px]">{patient.emergency_contact.relation}</p>
              </div>
              <span className="font-mono text-slate-900 font-medium">
                {patient.emergency_contact.phone}
              </span>
            </div>
          </div>

          {/* QR Share Token */}
          <div className="p-4 border border-slate-200 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Emergency QR Token</span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Validity:</span>
                <select
                  value={qrExpiryHours}
                  onChange={(e) => setQrExpiryHours(Number(e.target.value))}
                  className="border border-slate-200 rounded px-1.5 py-0.5 text-xs bg-white"
                >
                  <option value={1}>1 hour</option>
                  <option value={24}>24 hours</option>
                  <option value={72}>72 hours</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded border border-slate-200 flex items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="space-y-1 text-[11px] text-slate-500 flex-1">
                <p>Scan with any camera or ER triage terminal for temporary record handoff.</p>
                <p className="font-mono text-[10px] text-slate-400 truncate">{patient.qr_token}</p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="mt-1 text-slate-900 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Link Copied" : "Copy Token Link"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
          >
            Close Emergency Card
          </button>
        </div>
      </div>
    </div>
  );
};
