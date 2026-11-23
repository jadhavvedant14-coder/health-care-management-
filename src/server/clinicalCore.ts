import fs from "fs";
import path from "path";
import { AppState, MedicalRecord, Appointment, AccessConsent, Reminder, Doctor, Clinic } from "../types";
import { initialFallbackState } from "../mockData";

// Data directory for persistent storage
const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "clinical_store.json");

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (e) {
      // Ignore directory creation errors if read-only
    }
  }
}

export class ClinicalCore {
  private state: AppState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppState {
    try {
      ensureDirectoryExists(DATA_DIR);
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.patients && parsed.doctors && parsed.clinics) {
          // Guarantee that all registered patients (including Ananya Iyer) are present
          for (const p of initialFallbackState.patients) {
            if (!parsed.patients.some((existing: any) => existing.id === p.id)) {
              parsed.patients.push(p);
            }
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Could not load stored clinical state, using initial fallback:", err);
    }
    // Deep clone initial fallback state
    return JSON.parse(JSON.stringify(initialFallbackState));
  }

  private saveState(): void {
    try {
      ensureDirectoryExists(DATA_DIR);
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not persist clinical state to disk (in-memory mode):", err);
    }
  }

  public getState(): AppState {
    return this.state;
  }

  public getPatient(patientId: string) {
    return this.state.patients.find((p) => p.id === patientId) || this.state.patients[0];
  }

  public buildTimeline(patientId: string): MedicalRecord[] {
    const records = this.state.timeline.filter((r) => r.patient_id === patientId);
    // Sort descending by record_date / created_at
    return records.sort((a, b) => {
      const dateA = new Date(a.record_date || a.created_at).getTime();
      const dateB = new Date(b.record_date || b.created_at).getTime();
      return dateB - dateA;
    });
  }

  public search(patientId: string, query: string) {
    const qLower = (query || "").toLowerCase().trim();
    const records = this.state.timeline.filter((r) => r.patient_id === patientId);

    if (!qLower) {
      return {
        query,
        total_matches: records.length,
        results: records.map((r) => ({
          record_id: r.id,
          title: r.title,
          category: r.category,
          date: r.record_date,
          summary: r.ai_summary,
          critical_alerts: r.critical_alerts,
          relevance_score: 1,
        })),
      };
    }

    const tokens = qLower.split(/\s+/).filter((t) => t.length > 1);
    const results: any[] = [];

    for (const r of records) {
      const corpus = `${r.title} ${r.category} ${r.raw_text} ${r.ai_summary} ${r.doctor_or_facility}`.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (corpus.includes(t)) {
          score += 1;
        }
      }
      if (score > 0) {
        results.push({
          record_id: r.id,
          title: r.title,
          category: r.category,
          date: r.record_date,
          summary: r.ai_summary,
          critical_alerts: r.critical_alerts,
          relevance_score: score,
        });
      }
    }

    results.sort((a, b) => b.relevance_score - a.relevance_score);

    return {
      query,
      total_matches: results.length,
      results,
    };
  }

  public parseDocumentContent(textContent: string, fileName: string = "document.pdf") {
    const textLower = textContent.toLowerCase();

    // 1. Classification
    let category: "Lab Report" | "Prescription" | "X-Ray" | "Surgery" | "Cardiology" = "Lab Report";
    if (["rx", "prescription", "tab.", "cap.", "mg", "twice daily", "before bed"].some((k) => textLower.includes(k))) {
      category = "Prescription";
    } else if (["x-ray", "radiograph", "ct scan", "mri", "ultrasound", "sonography"].some((k) => textLower.includes(k))) {
      category = "X-Ray";
    } else if (["surgery", "operative", "discharge summary", "anesthesia", "incision"].some((k) => textLower.includes(k))) {
      category = "Surgery";
    } else if (["ecg", "echo", "echocardiogram", "ejection fraction", "cardiac"].some((k) => textLower.includes(k))) {
      category = "Cardiology";
    }

    // 2. Extract Tests
    const tests: any[] = [];
    const testDefs = [
      { regex: /(?:fasting blood sugar|fbs|glucose fasting)[\s:]+([0-9\.]+)\s*(mg\/dl)?/i, name: "Fasting Blood Sugar", unit: "mg/dL", low: 70, high: 100 },
      { regex: /(?:hba1c|glycated hemoglobin)[\s:]+([0-9\.]+)\s*(%)?/i, name: "HbA1c", unit: "%", low: 4.0, high: 5.7 },
      { regex: /(?:total cholesterol|cholesterol)[\s:]+([0-9\.]+)\s*(mg\/dl)?/i, name: "Total Cholesterol", unit: "mg/dL", low: 120, high: 200 },
      { regex: /(?:triglycerides|tg)[\s:]+([0-9\.]+)\s*(mg\/dl)?/i, name: "Triglycerides", unit: "mg/dL", low: 40, high: 150 },
      { regex: /(?:creatinine|serum creatinine)[\s:]+([0-9\.]+)\s*(mg\/dl)?/i, name: "Serum Creatinine", unit: "mg/dL", low: 0.6, high: 1.2 },
      { regex: /(?:hemoglobin|hb)[\s:]+([0-9\.]+)\s*(g\/dl)?/i, name: "Hemoglobin", unit: "g/dL", low: 12.0, high: 16.5 },
      { regex: /(?:platelet count|platelets)[\s:]+([0-9\.]+)/i, name: "Platelet Count", unit: "cells/mcL", low: 150000, high: 450000 },
      { regex: /(?:wbc|tlc)[\s:]+([0-9\.]+)/i, name: "Total Leukocyte Count (WBC)", unit: "/cumm", low: 4000, high: 11000 },
      { regex: /(?:tsh|thyroid stimulating hormone)[\s:]+([0-9\.]+)\s*(μiu\/ml|miu\/l|uiu\/ml)?/i, name: "TSH (Thyroid Stimulating Hormone)", unit: "μIU/mL", low: 0.4, high: 4.5 },
    ];

    for (const def of testDefs) {
      const match = textContent.match(def.regex);
      if (match) {
        const val = parseFloat(match[1]);
        if (!isNaN(val)) {
          let status: "NORMAL" | "HIGH" | "LOW" = "NORMAL";
          if (val < def.low) status = "LOW";
          else if (val > def.high) status = "HIGH";

          tests.push({
            name: def.name,
            value: `${val} ${def.unit}`,
            status,
            range: `${def.low} - ${def.high} ${def.unit}`,
          });
        }
      }
    }

    // 3. Extract Medicines
    const medicines: any[] = [];
    const medRegex = /(?:tab\.?|cap\.?|syr\.?|inj\.?)?\s*([a-zA-Z]{3,25})\s+(\d+\s*(?:mg|ml|mcg|gm))\s*[-–—:]?\s*([^\n\r,]+)?/gi;
    let medMatch;
    while ((medMatch = medRegex.exec(textContent)) !== null) {
      const medName = medMatch[1].trim();
      const dosage = medMatch[2].trim();
      const timing = medMatch[3] ? medMatch[3].trim() : "As directed";
      const ignored = ["patient", "blood", "total", "normal", "date", "report", "hospital", "clinic", "test", "level"];
      if (!ignored.includes(medName.toLowerCase())) {
        medicines.push({
          name: medName.charAt(0).toUpperCase() + medName.slice(1),
          dosage,
          frequency: timing || "Daily",
          duration: "Prescribed period",
        });
      }
    }

    // 4. Extract Vitals
    const vitals: Record<string, string> = {};
    const bpMatch = textContent.match(/(?:bp|blood pressure)[\s:]+([0-9]{2,3}\/[0-9]{2,3})/i);
    if (bpMatch) vitals.bp = `${bpMatch[1]} mmHg`;

    const pulseMatch = textContent.match(/(?:pulse|heart rate)[\s:]+([0-9]{2,3})\s*(?:bpm)?/i);
    if (pulseMatch) vitals.pulse = `${pulseMatch[1]} bpm`;

    const spo2Match = textContent.match(/(?:spo2|oxygen saturation)[\s:]+([0-9]{2,3})\s*%?/i);
    if (spo2Match) vitals.spo2 = `${spo2Match[1]}%`;

    // 5. Critical Alerts & Allergies
    const critical_alerts: string[] = [];
    const allergies_noted: string[] = [];

    if (/penicillin|amoxicillin|ampicillin|augmentin/i.test(textContent) && /allerg|contraindicat|hypersensitiv/i.test(textContent)) {
      critical_alerts.push("CRITICAL: Severe Penicillin / Beta-lactam allergy flagged in document context.");
      allergies_noted.push("Penicillin Derivatives");
    }
    if (/sulfa|sulfonamide|bactrim|septra/i.test(textContent) && /allerg|contraindicat/i.test(textContent)) {
      critical_alerts.push("WARNING: Sulfonamide / Sulfa drug hypersensitivity detected.");
      allergies_noted.push("Sulfa Drugs");
    }
    if (/aspirin|nsaid|ibuprofen|diclofenac/i.test(textContent) && /allerg|contraindicat|bronchospasm/i.test(textContent)) {
      critical_alerts.push("CRITICAL: Aspirin / NSAID allergy flagged; risk of acute bronchospasm.");
      allergies_noted.push("Aspirin / NSAIDs");
    }
    if (/contrast dye|radiocontrast|iodinated/i.test(textContent) && /allerg|contraindicat|reaction/i.test(textContent)) {
      critical_alerts.push("CRITICAL: Radiocontrast / Iodinated dye allergy documented.");
      allergies_noted.push("Radiocontrast Dye");
    }
    if (/latex/i.test(textContent) && /allerg|protocol|safe|free/i.test(textContent)) {
      critical_alerts.push("SAFETY ALERT: Latex allergy noted; implement latex-safe precautions.");
      allergies_noted.push("Latex");
    }
    if (/peanut/i.test(textContent) && /allerg|anaphylax/i.test(textContent)) {
      critical_alerts.push("CRITICAL: Severe Peanut hypersensitivity / anaphylaxis risk noted.");
      allergies_noted.push("Peanuts");
    }

    for (const t of tests) {
      if (t.status === "HIGH") {
        critical_alerts.push(`Abnormal finding: ${t.name} is HIGH (${t.value}).`);
      } else if (t.status === "LOW") {
        critical_alerts.push(`Abnormal finding: ${t.name} is LOW (${t.value}).`);
      }
    }

    // 6. AI Summary
    const summaryParts: string[] = [];
    summaryParts.push(`Processed ${category} from '${fileName}'.`);
    if (tests.length > 0) {
      summaryParts.push(`Extracted ${tests.length} diagnostic parameters: ${tests.map((t) => `${t.name}: ${t.value} (${t.status})`).join(", ")}.`);
    }
    if (medicines.length > 0) {
      summaryParts.push(`Prescribed medications identified: ${medicines.map((m) => `${m.name} (${m.dosage})`).join(", ")}.`);
    }
    if (Object.keys(vitals).length > 0) {
      summaryParts.push(`Documented vitals: ${Object.entries(vitals).map(([k, v]) => `${k.toUpperCase()} ${v}`).join(", ")}.`);
    }
    if (allergies_noted.length > 0) {
      summaryParts.push(`Hypersensitivity precautions identified for: ${allergies_noted.join(", ")}.`);
    }
    if (tests.length === 0 && medicines.length === 0) {
      summaryParts.push("Clinical assessment text recorded. Findings logged to patient longitudinal health record.");
    }

    const ai_summary = summaryParts.join(" ");

    return {
      category,
      record_date: new Date().toISOString().split("T")[0],
      extracted_data: {
        tests,
        medicines,
        vitals,
        allergies_noted,
      },
      critical_alerts,
      ai_summary,
    };
  }

  public processDocument(params: {
    text: string;
    file_name?: string;
    patient_id?: string;
    facility?: string;
    title?: string;
  }) {
    const { text, file_name = "uploaded_report.pdf", patient_id = "pat_1", facility = "Clinical Diagnostics Hub", title } = params;
    const parsed = this.parseDocumentContent(text, file_name);
    const recId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newRecord: MedicalRecord = {
      id: recId,
      patient_id,
      title: title || `${parsed.category} - ${file_name}`,
      category: parsed.category,
      record_date: parsed.record_date,
      doctor_or_facility: facility,
      summary: parsed.ai_summary,
      raw_text: text,
      extracted_data: parsed.extracted_data,
      ai_summary: parsed.ai_summary,
      critical_alerts: parsed.critical_alerts,
      file_name,
      created_at: new Date().toISOString(),
    };

    this.state.timeline.unshift(newRecord);

    // Audit log
    const patient = this.getPatient(patient_id);
    this.state.audit_logs.unshift({
      id: `log_${Date.now()}`,
      user_name: patient?.name || "Patient",
      user_role: "Patient",
      action: "Uploaded & Analyzed Medical Document",
      details: `${newRecord.title} (${newRecord.category})`,
      timestamp: new Date().toISOString(),
    });

    this.saveState();

    return {
      status: "success",
      record_id: recId,
      document_analysis: parsed,
      full_record: newRecord,
    };
  }

  public bookAppointment(payload: {
    patient_id: string;
    doctor_id: string;
    clinic_id: string;
    date: string;
    time_slot: string;
    reason?: string;
  }) {
    const aptId = `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newApt: Appointment = {
      id: aptId,
      patient_id: payload.patient_id,
      doctor_id: payload.doctor_id,
      clinic_id: payload.clinic_id,
      date: payload.date,
      time_slot: payload.time_slot,
      status: "Confirmed",
      reason: payload.reason || "Clinical Follow-up & Evaluation",
      created_at: new Date().toISOString(),
    };

    this.state.appointments.unshift(newApt);

    const doc = this.state.doctors.find((d) => d.id === payload.doctor_id);
    const pat = this.getPatient(payload.patient_id);

    this.state.audit_logs.unshift({
      id: `log_${Date.now()}`,
      user_name: pat?.name || "Patient",
      user_role: "Patient",
      action: "Booked Clinical Appointment",
      details: `With ${doc?.name || "Doctor"} on ${payload.date} at ${payload.time_slot}`,
      timestamp: new Date().toISOString(),
    });

    this.saveState();
    return { status: "success", appointment_id: aptId, appointment: newApt };
  }

  public updateAppointmentStatus(payload: { appointment_id: string; status: "Confirmed" | "Completed" | "Cancelled" }) {
    const apt = this.state.appointments.find((a) => a.id === payload.appointment_id);
    if (apt) {
      apt.status = payload.status;
      this.saveState();
      return { status: "success", appointment_id: payload.appointment_id };
    }
    return { status: "error", message: "Appointment not found" };
  }

  public requestConsent(payload: {
    doctor_id: string;
    patient_id: string;
    requested_record_types: string[];
    duration_type: "24 hours" | "7 days" | "Permanent";
  }) {
    const conId = `con_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const doc = this.state.doctors.find((d) => d.id === payload.doctor_id);
    const pat = this.getPatient(payload.patient_id);
    const nowIso = new Date().toISOString();

    const newConsent: AccessConsent = {
      id: conId,
      doctor_id: payload.doctor_id,
      patient_id: payload.patient_id,
      requested_record_types: payload.requested_record_types,
      duration_type: payload.duration_type,
      status: "Pending",
      granted_at: null,
      expires_at: null,
      access_logs: [
        {
          action: "Requested Access for Consultation",
          by: doc?.name || "Doctor",
          timestamp: nowIso,
        },
      ],
      created_at: nowIso,
    };

    this.state.consents.unshift(newConsent);

    this.state.audit_logs.unshift({
      id: `log_${Date.now()}`,
      user_name: doc?.name || "Doctor",
      user_role: "Doctor",
      action: "Requested EHR Access Consent",
      details: `Target: ${pat?.name || "Patient"}, Types: ${payload.requested_record_types.join(", ")} (${payload.duration_type})`,
      timestamp: nowIso,
    });

    this.saveState();
    return { status: "success", consent_id: conId, consent: newConsent };
  }

  public respondConsent(payload: { consent_id: string; decision: "Approved" | "Rejected" }) {
    const con = this.state.consents.find((c) => c.id === payload.consent_id);
    if (!con) return { status: "error", message: "Consent record not found" };

    const now = new Date();
    const nowIso = now.toISOString();

    con.status = payload.decision;
    if (payload.decision === "Approved") {
      con.granted_at = nowIso;
      if (con.duration_type === "24 hours") {
        con.expires_at = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      } else if (con.duration_type === "7 days") {
        con.expires_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        con.expires_at = null;
      }
      con.access_logs.push({
        action: `Approved by Patient for ${con.duration_type}`,
        by: "Patient",
        timestamp: nowIso,
      });
    } else {
      con.access_logs.push({
        action: "Rejected by Patient",
        by: "Patient",
        timestamp: nowIso,
      });
    }

    const pat = this.getPatient(con.patient_id);
    this.state.audit_logs.unshift({
      id: `log_${Date.now()}`,
      user_name: pat?.name || "Patient",
      user_role: "Patient",
      action: `${payload.decision} Access Consent`,
      details: `Consent ID: ${con.id} (${con.duration_type})`,
      timestamp: nowIso,
    });

    this.saveState();
    return { status: "success", consent_id: con.id, decision: payload.decision };
  }

  public revokeConsent(payload: { consent_id: string }) {
    const con = this.state.consents.find((c) => c.id === payload.consent_id);
    if (!con) return { status: "error", message: "Consent not found" };

    const nowIso = new Date().toISOString();
    con.status = "Revoked";
    con.access_logs.push({
      action: "Revoked by Patient",
      by: "Patient",
      timestamp: nowIso,
    });

    const pat = this.getPatient(con.patient_id);
    this.state.audit_logs.unshift({
      id: `log_${Date.now()}`,
      user_name: pat?.name || "Patient",
      user_role: "Patient",
      action: "Revoked Access Consent",
      details: `Consent ID: ${con.id}`,
      timestamp: nowIso,
    });

    this.saveState();
    return { status: "success", consent_id: con.id };
  }

  public addPrescription(payload: {
    patient_id: string;
    doctor_name: string;
    notes: string;
    medicines: Array<{ name: string; dosage: string; frequency: string; duration?: string }>;
  }) {
    const { patient_id, doctor_name = "Consultant Doctor", notes = "", medicines = [] } = payload;
    const pat = this.getPatient(patient_id);

    let rawText = `Doctor Prescription by ${doctor_name}\nNotes: ${notes}\n`;
    for (const m of medicines) {
      rawText += `- ${m.name} ${m.dosage} (${m.frequency})\n`;
    }

    const parsed = this.parseDocumentContent(rawText, "doctor_prescription.pdf");
    const recId = `rec_rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Check allergy contraindications against patient's known allergies
    const patientAllergies = (pat?.allergies || []).map((a) => a.toLowerCase());
    const criticalAlerts = [...parsed.critical_alerts];

    for (const m of medicines) {
      const medLower = m.name.toLowerCase();
      if (
        patientAllergies.some((a) => a.includes("penicillin")) &&
        ["amoxicillin", "ampicillin", "augmentin", "penicillin", "piperacillin"].some((k) => medLower.includes(k))
      ) {
        criticalAlerts.unshift(`CONTRAINDICATION WARNING: ${m.name} prescribed to patient with documented Penicillin allergy!`);
      }
      if (
        patientAllergies.some((a) => a.includes("aspirin") || a.includes("nsaid")) &&
        ["aspirin", "ibuprofen", "diclofenac", "naproxen", "combiflam", "mefenamic"].some((k) => medLower.includes(k))
      ) {
        criticalAlerts.unshift(`CONTRAINDICATION WARNING: ${m.name} prescribed to patient with severe NSAID / Aspirin hypersensitivity!`);
      }
      if (
        patientAllergies.some((a) => a.includes("sulfa")) &&
        ["sulfa", "sulfamethoxazole", "bactrim", "septra"].some((k) => medLower.includes(k))
      ) {
        criticalAlerts.unshift(`CONTRAINDICATION WARNING: ${m.name} is a Sulfa drug! Patient has recorded Sulfa allergy.`);
      }
    }

    const newRecord: MedicalRecord = {
      id: recId,
      patient_id,
      title: `Prescription & Clinical Notes by ${doctor_name}`,
      category: "Prescription",
      record_date: new Date().toISOString().split("T")[0],
      doctor_or_facility: doctor_name,
      summary: parsed.ai_summary,
      raw_text: rawText,
      extracted_data: {
        tests: [],
        vitals: {},
        medicines,
        allergies_noted: parsed.extracted_data.allergies_noted,
      },
      ai_summary: parsed.ai_summary,
      critical_alerts: criticalAlerts,
      file_name: "rx_portal_entry.pdf",
      created_at: new Date().toISOString(),
    };

    this.state.timeline.unshift(newRecord);

    // Automatically create reminders for prescribed medicines
    for (const med of medicines) {
      const remId = `rem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      this.state.reminders.unshift({
        id: remId,
        patient_id,
        medicine_name: med.name,
        dosage: med.dosage,
        timing: med.frequency.includes("morning") ? "09:00 AM" : "01:00 PM & 08:00 PM",
        frequency: med.frequency,
        instructions: `Take as prescribed by ${doctor_name}`,
        active: 1,
        created_at: new Date().toISOString(),
      });
    }

    // Audit log
    this.state.audit_logs.unshift({
      id: `log_${Date.now()}`,
      user_name: doctor_name,
      user_role: "Doctor",
      action: "Issued Digital Prescription",
      details: `For ${pat?.name || "Patient"}: ${medicines.map((m) => m.name).join(", ")}`,
      timestamp: new Date().toISOString(),
    });

    this.saveState();
    return { status: "success", record_id: recId, record: newRecord };
  }

  public addReminder(payload: {
    patient_id: string;
    medicine_name: string;
    dosage?: string;
    timing?: string;
    frequency?: string;
    instructions?: string;
  }) {
    const remId = `rem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRem: Reminder = {
      id: remId,
      patient_id: payload.patient_id,
      medicine_name: payload.medicine_name,
      dosage: payload.dosage || "1 dose",
      timing: payload.timing || "09:00 AM",
      frequency: payload.frequency || "Daily",
      instructions: payload.instructions || "Take with water",
      active: 1,
      created_at: new Date().toISOString(),
    };

    this.state.reminders.unshift(newRem);
    this.saveState();
    return { status: "success", reminder_id: remId, reminder: newRem };
  }

  public toggleReminder(payload: { reminder_id: string; active: number }) {
    const rem = this.state.reminders.find((r) => r.id === payload.reminder_id);
    if (rem) {
      rem.active = payload.active;
      this.saveState();
      return { status: "success" };
    }
    return { status: "error", message: "Reminder not found" };
  }

  public addDoctor(payload: {
    name: string;
    specialization: string;
    clinic_id?: string;
    experience?: string;
    fee?: number;
    slots?: string[];
  }) {
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: Doctor = {
      id: docId,
      clinic_id: payload.clinic_id || this.state.clinics[0]?.id || "clinic_1",
      name: payload.name,
      specialization: payload.specialization,
      experience: payload.experience || "5 Years",
      fee: Number(payload.fee) || 600,
      slots: payload.slots || ["10:00 AM", "02:00 PM", "05:00 PM"],
    };

    this.state.doctors.push(newDoc);
    this.saveState();
    return { status: "success", doctor_id: docId, doctor: newDoc };
  }

  public addClinic(payload: {
    name: string;
    location: string;
    contact?: string;
    departments?: string;
  }) {
    const clId = `clinic_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newClinic: Clinic = {
      id: clId,
      name: payload.name,
      location: payload.location,
      contact: payload.contact || "+91 99999 00000",
      departments: payload.departments || "General Medicine, Diagnostics",
    };

    this.state.clinics.push(newClinic);
    this.saveState();
    return { status: "success", clinic_id: clId, clinic: newClinic };
  }
}

export const clinicalCore = new ClinicalCore();
