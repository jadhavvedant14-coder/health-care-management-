import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  Pill,
  Download,
  Info,
  ChevronRight,
  SlidersHorizontal,
  Stethoscope,
  Heart,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Share2,
} from "lucide-react";
import { MedicalRecord, TestResult } from "../types";

interface ReportDetailModalProps {
  record: MedicalRecord | null;
  patientName?: string;
  isOpen: boolean;
  onClose: () => void;
  onAskDoctor?: (subject: string, question: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  record,
  patientName = "Patient",
  isOpen,
  onClose,
  onAskDoctor,
}) => {
  // Tab state: "abnormal" (default if any abnormalities exist) or "all"
  const [activeTab, setActiveTab] = useState<"abnormal" | "all" | "raw">("abnormal");
  const [isPlayingECG, setIsPlayingECG] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [questionSent, setQuestionSent] = useState(false);
  const [doctorQuestion, setDoctorQuestion] = useState("");
  const [showAskBox, setShowAskBox] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Categorize tests
  const tests: TestResult[] = record?.extracted_data?.tests || [];
  const abnormalTests = tests.filter(
    (t) => t.status === "HIGH" || t.status === "LOW" || t.status === "ELEVATED"
  );
  const normalTests = tests.filter((t) => t.status === "NORMAL" || !t.status);
  const hasAbnormalities = abnormalTests.length > 0 || (record?.critical_alerts && record.critical_alerts.length > 0);

  // Set default tab on open
  useEffect(() => {
    if (isOpen) {
      if (hasAbnormalities) {
        setActiveTab("abnormal");
      } else {
        setActiveTab("all");
      }
      setDownloadSuccess(false);
      setQuestionSent(false);
      setShowAskBox(false);
      setDoctorQuestion("");
    }
  }, [record?.id, isOpen, hasAbnormalities]);

  // Animated ECG canvas when record is ECG / Cardiology
  useEffect(() => {
    if (!isOpen || !record) return;
    const isEcg =
      record.title.toLowerCase().includes("ecg") ||
      record.title.toLowerCase().includes("echocardiography") ||
      record.category === "Cardiology";

    if (!isEcg) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    // ECG wave generator function
    const getEcgY = (x: number, width: number, height: number): number => {
      const mid = height / 2;
      const cycleLength = 120; // 1 heartbeat every 120px
      const pos = (x + offset) % cycleLength;

      // P wave (small bump)
      if (pos >= 15 && pos < 30) {
        return mid - Math.sin(((pos - 15) / 15) * Math.PI) * 8;
      }
      // PR segment (flat)
      if (pos >= 30 && pos < 40) {
        return mid;
      }
      // Q wave (slight dip)
      if (pos >= 40 && pos < 44) {
        return mid + 4;
      }
      // R wave (sharp peak)
      if (pos >= 44 && pos < 50) {
        return mid - ((pos - 44) / 6) * 36;
      }
      // S wave (sharp drop below baseline)
      if (pos >= 50 && pos < 56) {
        return mid + 14 - ((pos - 50) / 6) * 8;
      }
      // ST segment
      if (pos >= 56 && pos < 70) {
        return mid;
      }
      // T wave (medium broad wave)
      if (pos >= 70 && pos < 95) {
        return mid - Math.sin(((pos - 70) / 25) * Math.PI) * 12;
      }
      // Baseline
      return mid;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint clinical grid
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 0.5;

      const gridSize = 12;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw baseline center line
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw ECG trace
      ctx.strokeStyle = "#0d9488"; // clinical teal-600
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x++) {
        const y = getEcgY(x, canvas.width, canvas.height);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw active scanner pulse dot
      const pulseX = (offset * 1.5) % canvas.width;
      const pulseY = getEcgY(pulseX, canvas.width, canvas.height);
      ctx.fillStyle = "#0f766e";
      ctx.beginPath();
      ctx.arc(pulseX, pulseY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      if (isPlayingECG) {
        offset = (offset + 1.2) % 1200;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, record, isPlayingECG]);

  if (!isOpen || !record) return null;

  const isEcg =
    record.title.toLowerCase().includes("ecg") ||
    record.title.toLowerCase().includes("echocardiography") ||
    record.category === "Cardiology";

  const isPrescription = record.category === "Prescription";
  const isImaging = record.category === "X-Ray" || record.category === "Surgery" || record.title.toLowerCase().includes("mri");

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorQuestion.trim()) return;
    if (onAskDoctor) {
      onAskDoctor(record.title, doctorQuestion);
    }
    setQuestionSent(true);
    setTimeout(() => {
      setShowAskBox(false);
      setQuestionSent(false);
      setDoctorQuestion("");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200/90 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header - Clean, calm, non-alarming */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                {record.category}
              </span>
              <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {record.record_date || record.date}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {record.facility || record.doctor_or_facility}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {record.title}
            </h2>
            <p className="text-xs text-slate-500">
              Patient: <span className="font-semibold text-slate-700">{patientName}</span> • Verified Clinical Document
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Close Report Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Progressive Disclosure */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Calm Plain-Language Takeaway Banner */}
          <div
            className={`p-3.5 rounded-lg border flex items-start gap-3 ${
              hasAbnormalities
                ? "bg-amber-50/70 border-amber-200 text-amber-950"
                : "bg-teal-50/70 border-teal-200 text-teal-950"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {hasAbnormalities ? (
                <AlertTriangle className="w-4 h-4 text-amber-700" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
              )}
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {hasAbnormalities
                    ? `${abnormalTests.length || 1} Finding Flagged For Review`
                    : "Normal Clinical Result"}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    hasAbnormalities
                      ? "bg-amber-200/80 text-amber-900"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {hasAbnormalities ? "Review Recommended" : "All Normal"}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                {record.ai_summary || record.summary}
              </p>
            </div>
          </div>

          {/* ECG Simulated Strip if Cardiology/ECG */}
          {isEcg && (
            <div className="bg-slate-900 rounded-lg p-3 text-white space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30 animate-pulse" />
                  <span className="font-semibold text-teal-400">Rhythm Strip Simulation (Lead II)</span>
                  <span className="text-slate-400 font-mono text-[11px]">74 BPM • Regular Sinus Rhythm</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlayingECG(!isPlayingECG)}
                    className="text-[11px] text-slate-300 hover:text-white px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded transition cursor-pointer"
                  >
                    {isPlayingECG ? "Pause Rhythm" : "Play Rhythm"}
                  </button>
                  <span className="text-[10px] bg-teal-950 text-teal-300 px-1.5 py-0.5 rounded border border-teal-800/60 font-mono">
                    25mm/s • 10mm/mV
                  </span>
                </div>
              </div>

              {/* Canvas Waveform */}
              <div className="relative bg-slate-950 rounded overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={680}
                  height={110}
                  className="w-full h-24 block"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono text-[11px]">
                <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/50">
                  <span className="text-slate-400 text-[10px] block font-sans">Heart Rate</span>
                  <span className="text-emerald-400 font-bold">74 bpm</span>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/50">
                  <span className="text-slate-400 text-[10px] block font-sans">PR Interval</span>
                  <span className="text-slate-200 font-bold">160 ms (Normal)</span>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/50">
                  <span className="text-slate-400 text-[10px] block font-sans">QRS Duration</span>
                  <span className="text-slate-200 font-bold">88 ms (Normal)</span>
                </div>
                <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/50">
                  <span className="text-slate-400 text-[10px] block font-sans">Flagged Metric</span>
                  <span className="text-amber-400 font-bold">LVEF 52% (Borderline)</span>
                </div>
              </div>
            </div>
          )}

          {/* Critical Alerts Banner (if any) */}
          {record.critical_alerts && record.critical_alerts.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Doctor's Flagged Note for Patient</span>
              </div>
              <ul className="list-disc pl-5 text-rose-800 space-y-0.5">
                {record.critical_alerts.map((alert, i) => (
                  <li key={i}>{alert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Progressive Disclosure Filter Tabs - "Flagged Abnormalities" vs "Complete Clinical Panel" */}
          {tests.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("abnormal")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
                      activeTab === "abnormal"
                        ? "border-teal-600 text-teal-800 bg-teal-50/60"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      Flagged Abnormalities Only ({abnormalTests.length})
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-t-md transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 ${
                      activeTab === "all"
                        ? "border-teal-600 text-teal-800 bg-teal-50/60"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <span>All Clinical Parameters ({tests.length})</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {activeTab === "abnormal" ? "Showing only out-of-range metrics" : "Full diagnostic panel"}
                </span>
              </div>

              {/* View 1: Flagged Abnormalities Only (DEFAULT) */}
              {activeTab === "abnormal" && (
                <div className="space-y-2">
                  {abnormalTests.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                      <h4 className="text-xs font-bold text-slate-800">No Abnormal Values Flagged</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        All {tests.length} diagnostic parameters in this report are completely within normal safe medical limits.
                      </p>
                      <button
                        onClick={() => setActiveTab("all")}
                        className="mt-2 text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
                      >
                        Click here to view all normal parameters &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-600">
                        The lab flagged <strong className="text-slate-900">{abnormalTests.length} item(s)</strong> outside standard reference thresholds. The other {normalTests.length} parameter(s) are completely normal.
                      </p>

                      <div className="grid grid-cols-1 gap-2.5">
                        {abnormalTests.map((t, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white rounded-lg border-2 border-amber-200 shadow-2xs hover:border-amber-300 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">
                                  {t.name}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Standard Reference: <strong className="text-slate-700">{t.range || "Standard"}</strong>
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="text-sm font-bold font-mono text-amber-700 block">
                                  {t.value}
                                </span>
                                <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                  {t.status}
                                </span>
                              </div>
                            </div>

                            {/* Reference scale graphic */}
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="text-[10px] font-mono">Normal Limit</span>
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                                <div className="absolute left-0 top-0 bottom-0 w-2/3 bg-emerald-200" title="Safe range" />
                                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-300" title="Elevated range" />
                                <div
                                  className="absolute top-0 bottom-0 w-1.5 bg-amber-700 rounded-full shadow-xs"
                                  style={{ left: "75%" }}
                                  title="Your value"
                                />
                              </div>
                              <span className="text-[10px] font-semibold text-amber-800">Elevated</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View 2: Complete Clinical Panel */}
              {activeTab === "all" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tests.map((t, idx) => {
                      const isAbnormal =
                        t.status === "HIGH" || t.status === "LOW" || t.status === "ELEVATED";
                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                            isAbnormal
                              ? "bg-amber-50/60 border-amber-200"
                              : "bg-slate-50/70 border-slate-200"
                          }`}
                        >
                          <div>
                            <span className="font-semibold text-slate-800 block truncate">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Range: {t.range || "Standard"}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-slate-900 block">
                              {t.value}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                isAbnormal ? "text-amber-700" : "text-emerald-700"
                              }`}
                            >
                              {t.status || "NORMAL"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Medicines breakdown (if prescription / discharge) */}
          {record.extracted_data?.medicines && record.extracted_data.medicines.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                <span>Prescribed Medications ({record.extracted_data.medicines.length})</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {record.extracted_data.medicines.map((med, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-teal-50/40 rounded-lg border border-teal-100/90 flex items-start gap-2.5"
                  >
                    <div className="p-1 rounded bg-teal-100/70 text-teal-700 mt-0.5">
                      <Pill className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">
                        {med.name} {med.dosage}
                      </h4>
                      <p className="text-teal-800 text-[11px]">{med.frequency}</p>
                      {med.duration && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Duration: {med.duration}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ask Doctor Section (On-Demand) */}
          {showAskBox && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>Send a Question to Doctor About This Report</span>
                </span>
                <button
                  onClick={() => setShowAskBox(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {questionSent ? (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Question sent to attending physician. They will reply within 24 hours.</span>
                </div>
              ) : (
                <form onSubmit={handleSendQuestion} className="space-y-2">
                  <textarea
                    rows={2}
                    value={doctorQuestion}
                    onChange={(e) => setDoctorQuestion(e.target.value)}
                    placeholder="E.g., Does my LVEF reading mean I should adjust my daily brisk walk or medications?"
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!doctorQuestion.trim()}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded transition cursor-pointer disabled:opacity-50"
                    >
                      Send Inquiry
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer - Actions */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAskBox(!showAskBox)}
              className="px-3 py-1.5 rounded-md font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Ask Doctor About This</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-md font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Summary Saved!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download Clean PDF</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-md transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
