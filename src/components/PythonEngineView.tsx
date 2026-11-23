import React, { useState } from "react";
import { Terminal, Play, RefreshCw, Database, Code2 } from "lucide-react";
import { AppState } from "../types";
import { authFetch } from "../lib/authSession";

interface PythonEngineViewProps {
  state: AppState;
  onRefresh: () => void;
}

export const PythonEngineView: React.FC<PythonEngineViewProps> = ({ state, onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState<"code" | "sandbox" | "db">("code");
  const [testText, setTestText] = useState(
    `LAB REPORT - CLINICAL PATHOLOGY
Patient: Rahul Jadhav | Age: 38
Fasting Blood Sugar: 126 mg/dL (HIGH)
HbA1c: 7.2 % (HIGH)
Cholesterol: 215 mg/dL (ELEVATED)
Blood Pressure: 136/88 mmHg`
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<any | null>(null);

  const handleRunPythonExtraction = async () => {
    setIsExecuting(true);
    try {
      const res = await authFetch("/api/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: "pat_1",
          title: "Sandbox Test Extraction",
          facility: "Python CLI Sandbox",
          file_name: "test_sandbox_run.txt",
          text: testText,
        }),
      });
      const data = await res.json();
      setExecutionOutput(data);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-3.5 py-1">
      {/* Overview */}
      <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs p-3.5">
        <h1 className="text-base font-bold tracking-tight text-slate-900">
          Engine Architecture &amp; Database Layer
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 max-w-2xl">
          Core NLP extraction, classification, and SQLite3 database schema (<code className="font-mono text-teal-800 bg-teal-50 px-1 py-0.2 rounded border border-teal-200/50">healthcare.db</code>).
        </p>
      </div>

      {/* Sub-Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 pb-1.5">
        <button
          onClick={() => setActiveSubTab("code")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "code"
              ? "bg-teal-600 text-white shadow-2xs"
              : "text-slate-600 hover:text-teal-900 hover:bg-teal-50"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Engine Pipeline</span>
        </button>

        <button
          onClick={() => setActiveSubTab("sandbox")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "sandbox"
              ? "bg-teal-600 text-white shadow-2xs"
              : "text-slate-600 hover:text-teal-900 hover:bg-teal-50"
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Interactive OCR Sandbox</span>
        </button>

        <button
          onClick={() => setActiveSubTab("db")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === "db"
              ? "bg-teal-600 text-white shadow-2xs"
              : "text-slate-600 hover:text-teal-900 hover:bg-teal-50"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>SQLite Database</span>
        </button>
      </div>

      {/* Pipeline View */}
      {activeSubTab === "code" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
            <h2 className="font-semibold text-slate-900 text-xs">Extraction &amp; Classification Methods</h2>
            <div className="space-y-3 text-xs">
              <div className="border-b border-slate-100 pb-2">
                <code className="font-mono font-medium text-slate-900">classify_document(text)</code>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Categorizes input into Lab Report, Prescription, Radiology, or Surgical Summary based on vocabulary tokens.
                </p>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <code className="font-mono font-medium text-slate-900">extract_lab_metrics(text)</code>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Regex engine detecting glucose, HbA1c, creatinine, cholesterol, and blood pressure with clinical reference bounds.
                </p>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <code className="font-mono font-medium text-slate-900">extract_critical_alerts(text, allergies)</code>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Cross-checks prescribed agents against documented patient hypersensitivities (e.g. Penicillin, Sulfonamides).
                </p>
              </div>

              <div>
                <code className="font-mono font-medium text-slate-900">search_patient_records(patient_id, query)</code>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Keyword matching across diagnostic values, summaries, and facilities.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
            <h2 className="font-semibold text-slate-900 text-xs">Persistence Pipeline</h2>
            <div className="space-y-3 text-xs text-slate-600">
              <p className="text-[11px] leading-relaxed">
                Database operations interface with SQLite (<code className="font-mono text-slate-800">healthcare.db</code>).
                All tables enforce foreign keys for patients, clinical encounters, and access tokens.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] space-y-1">
                <div>• patients (id, name, age, blood_group, allergies)</div>
                <div>• medical_records (id, patient_id, category, summary, tests, medicines)</div>
                <div>• appointments (id, patient_id, doctor_id, date, status)</div>
                <div>• access_consents (id, doctor_id, patient_id, duration, status)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sandbox View */}
      {activeSubTab === "sandbox" && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 text-xs">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">Interactive OCR &amp; Parameter Sandbox</h2>
            <p className="text-slate-500 mt-0.5">Test real-time parsing against simulated diagnostic text.</p>
          </div>

          <textarea
            rows={5}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full p-3 font-mono text-xs border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:border-slate-400"
          />

          <div className="flex justify-end">
            <button
              onClick={handleRunPythonExtraction}
              disabled={isExecuting}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-md font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Execute Parsing</span>
            </button>
          </div>

          {executionOutput && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
              <span className="font-medium text-slate-900 block">Output Result:</span>
              <pre className="font-mono text-[11px] text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {JSON.stringify(executionOutput, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* DB Tables View */}
      {activeSubTab === "db" && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-sm">Live SQLite Database Records</h2>
            <button
              onClick={onRefresh}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="font-semibold text-slate-800 block mb-1">
                Patients Table ({state.patients.length} records)
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-slate-200">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-2">ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Age</th>
                      <th className="p-2">Blood Group</th>
                      <th className="p-2">Allergies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.patients.map((p) => (
                      <tr key={p.id}>
                        <td className="p-2 font-mono text-[11px] text-slate-400">{p.id}</td>
                        <td className="p-2 font-medium text-slate-900">{p.name}</td>
                        <td className="p-2 font-mono">{p.age}</td>
                        <td className="p-2">{p.blood_group}</td>
                        <td className="p-2 text-slate-600">{p.allergies?.join(", ") || "None"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-800 block mb-1">
                Timeline Records ({state.timeline.length} records)
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-slate-200">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Title</th>
                      <th className="p-2">Facility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {state.timeline.slice(0, 5).map((t) => (
                      <tr key={t.id}>
                        <td className="p-2 font-mono text-[11px] text-slate-400">{t.record_date}</td>
                        <td className="p-2 text-slate-600">{t.category}</td>
                        <td className="p-2 font-medium text-slate-900">{t.title}</td>
                        <td className="p-2 text-slate-500">{t.doctor_or_facility}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
