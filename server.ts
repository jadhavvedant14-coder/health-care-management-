import express from "express";
import path from "path";
import fs from "fs";
import { execFile } from "child_process";
import { promisify } from "util";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { clinicalCore } from "./src/server/clinicalCore";
import { authStore, AuthRole } from "./src/server/authStore";

dotenv.config();

// Determine directory safely in both development (tsx) and production bundle (dist/server.cjs)
const currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

const execFileAsync = promisify(execFile);
const PYTHON_PATH = process.env.PYTHON_PATH || "python3";

// Resolve Python engine script whether running directly via tsx (cwd) or bundled inside dist/
function getEngineScriptPath(): string {
  const candidate1 = path.join(process.cwd(), "python_backend", "healthcare_engine.py");
  const candidate2 = path.join(currentDir, "python_backend", "healthcare_engine.py");
  const candidate3 = path.join(currentDir, "..", "python_backend", "healthcare_engine.py");
  if (fs.existsSync(candidate1)) return candidate1;
  if (fs.existsSync(candidate2)) return candidate2;
  if (fs.existsSync(candidate3)) return candidate3;
  return candidate1;
}

const ENGINE_SCRIPT = getEngineScriptPath();

// Gemini AI client (Server-Side only)
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (e) {
    console.warn("Gemini client initialization notice:", e);
  }
}

// Track Python availability gracefully without crashing on Cloud Run
let pythonAvailable: boolean | null = null;

async function checkPythonAvailability(): Promise<boolean> {
  if (pythonAvailable !== null) return pythonAvailable;
  try {
    if (!fs.existsSync(ENGINE_SCRIPT)) {
      pythonAvailable = false;
      return false;
    }
    const { stdout } = await execFileAsync(PYTHON_PATH, [ENGINE_SCRIPT, "init-db"], {
      maxBuffer: 5 * 1024 * 1024,
      timeout: 4000,
    });
    const parsed = JSON.parse(stdout.trim());
    const isReady = Boolean(parsed && parsed.status === "success");
    pythonAvailable = isReady;
    if (pythonAvailable) {
      console.log("Python 3.10 Engine & SQLite connected successfully.");
    }
    return isReady;
  } catch (e) {
    console.log("Python engine not detected in runtime environment. Operating in High-Performance Native Clinical Core mode.");
    pythonAvailable = false;
    return false;
  }
}

async function runPythonRaw(action: string, payload?: any): Promise<any> {
  const args = [ENGINE_SCRIPT, action];
  if (payload !== undefined) {
    args.push(typeof payload === "string" ? payload : JSON.stringify(payload));
  }
  const { stdout } = await execFileAsync(PYTHON_PATH, args, {
    maxBuffer: 10 * 1024 * 1024,
    timeout: 5000,
  });
  return JSON.parse(stdout.trim());
}

async function startServer() {
  const app = express();
  // Port resolution: prioritize CLI arg, DEFAULT_APP_PORT, production PORT (Render/Cloud Run), or 3000
  let PORT = 3000;
  const portArgIndex = process.argv.indexOf("--port");
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const p = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(p) && p > 0) PORT = p;
  } else if (process.env.DEFAULT_APP_PORT) {
    const p = parseInt(process.env.DEFAULT_APP_PORT, 10);
    if (!isNaN(p) && p > 0) PORT = p;
  } else if (process.env.NODE_ENV === "production" && process.env.PORT) {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p) && p > 0) PORT = p;
  } else if (process.env.PORT && process.env.PORT !== "8080") {
    const p = parseInt(process.env.PORT, 10);
    if (!isNaN(p) && p > 0) PORT = p;
  }

  app.use(express.json({ limit: "15mb" }));

  // Proactively check Python on boot
  checkPythonAvailability();

  // ================= AUTH HELPERS & MIDDLEWARE =================
  const extractBearerToken = (req: express.Request): string | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7).trim();
    return token.length > 0 ? token : null;
  };

  const requireAuth: express.RequestHandler = (req, res, next) => {
    const token = extractBearerToken(req);
    const user = authStore.verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: "Authentication required. Please sign in." });
    }
    (req as any).authUser = user;
    next();
  };

  const requireRole = (...allowedRoles: AuthRole[]): express.RequestHandler => {
    return (req, res, next) => {
      const token = extractBearerToken(req);
      const user = authStore.verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: "Authentication required. Please sign in." });
      }
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: "Access denied for your current portal role." });
      }
      (req as any).authUser = user;
      next();
    };
  };

  // ================= AUTH API ROUTES =================

  // Public auth status (returns role setup status + selectable directory profiles)
  app.get("/api/auth/status", (req, res) => {
    const status = authStore.getStatus();
    const state = clinicalCore.getState();
    res.json({
      ...status,
      patients: state.patients.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email || `${p.name.toLowerCase().replace(/\s+/g, ".")}@hourglass.health`,
      })),
      doctors: state.doctors.map((d) => ({
        id: d.id,
        name: d.name,
        specialization: d.specialization,
        email: `${d.name
          .toLowerCase()
          .replace(/^dr\.?\s*/i, "")
          .split(",")[0]
          .trim()
          .replace(/\s+/g, ".")}@mediq.health`,
      })),
      clinics: state.clinics.map((c) => ({
        id: c.id,
        name: c.name,
        location: c.location,
        email: `desk.${c.id}@cityhealth.clinic`,
      })),
    });
  });

  // First-run atomic role passcode setup (only succeeds if role has no env passcode and is unclaimed)
  app.post("/api/auth/setup", (req, res) => {
    const result = authStore.claimRoleAccess(req.body || {});
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    res.json({ token: result.token, user: result.user });
  });

  // Register a new user account for any of the 3 roles
  app.post("/api/auth/register", (req, res) => {
    const result = authStore.registerAccount(req.body || {});
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    res.json({ token: result.token, user: result.user });
  });

  // Sign in for Patient, Doctor, or Clinic role
  app.post("/api/auth/login", (req, res) => {
    const result = authStore.login(req.body || {});
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    res.json({ token: result.token, user: result.user });
  });

  // Verify current Bearer session
  app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ user: (req as any).authUser });
  });

  // Sign out and revoke session token
  app.post("/api/auth/logout", (req, res) => {
    authStore.revokeToken(extractBearerToken(req));
    res.json({ status: "ok" });
  });

  // ================= CLINICAL API ROUTES =================

  // Health Check
  app.get("/api/health", async (req, res) => {
    const hasPython = await checkPythonAvailability();
    res.json({
      status: "ok",
      engine: hasPython ? "python3_sqlite" : "native_clinical_core",
      python_engine: hasPython,
      has_gemini: !!process.env.GEMINI_API_KEY,
      model: "gemini-3.8-flash",
    });
  });

  // Helper to scope state strictly to the signed-in patient when role === "patient"
  const scopeStateForUser = (rawState: any, authUser: { role: AuthRole; patientId?: string }) => {
    if (authUser.role !== "patient" || !authUser.patientId) {
      return rawState;
    }
    const pid = authUser.patientId;
    return {
      ...rawState,
      patients: (rawState.patients || []).filter((p: any) => p.id === pid),
      timeline: (rawState.timeline || []).filter((r: any) => r.patient_id === pid),
      appointments: (rawState.appointments || []).filter((a: any) => a.patient_id === pid),
      consents: (rawState.consents || []).filter((c: any) => c.patient_id === pid),
      reminders: (rawState.reminders || []).filter((r: any) => r.patient_id === pid),
      audit_logs: (rawState.audit_logs || []).filter((l: any) => l.user_role === "Patient"),
    };
  };

  // Get full unified state (Protected by Bearer auth; patient sessions strictly receive only their own records)
  app.get("/api/state", requireAuth, async (req, res) => {
    const authUser = (req as any).authUser;
    try {
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const data = await runPythonRaw("get-state");
          return res.json(scopeStateForUser(data, authUser));
        } catch (pyErr) {
          console.warn("Python get-state returned error, serving via Native Clinical Core:", pyErr);
        }
      }
      res.json(scopeStateForUser(clinicalCore.getState(), authUser));
    } catch (err: any) {
      res.json(scopeStateForUser(clinicalCore.getState(), authUser));
    }
  });

  // Process Document & Run OCR / Classification / Extraction via Python + optional Gemini
  app.post("/api/documents/process", requireRole("patient", "doctor"), async (req, res) => {
    try {
      const authUser = (req as any).authUser;
      const { text, file_name, patient_id, facility, title } = req.body;
      const effectivePatientId =
        authUser.role === "patient" && authUser.patientId
          ? authUser.patientId
          : patient_id || "pat_1";
      const hasPython = await checkPythonAvailability();
      let result: any = null;

      if (hasPython) {
        try {
          result = await runPythonRaw("process-document", {
            text: text || "",
            file_name: file_name || "report.pdf",
            patient_id: effectivePatientId,
            facility: facility || "Diagnostic Facility",
            title: title || "Uploaded Medical Document",
          });
        } catch (pyErr) {
          console.warn("Python document process failed, fallback to Native Clinical Core:", pyErr);
        }
      }

      if (!result) {
        result = clinicalCore.processDocument({
          text: text || "",
          file_name: file_name || "report.pdf",
          patient_id: effectivePatientId,
          facility: facility || "Diagnostic Facility",
          title: title || "Uploaded Medical Document",
        });
      }

      // If Gemini is available, generate richer clinical observations
      if (aiClient && text) {
        try {
          const prompt = `You are a clinical AI assistant for a healthcare management system.
Analyze the following medical text extracted from a patient report (${file_name}):
"""
${text}
"""
Provide a concise 2-sentence clinical summary and identify any critical alerts (allergies, abnormal labs, high-risk medication interactions).
Return JSON with format:
{
  "gemini_summary": "...",
  "gemini_critical_alerts": ["..."]
}`;
          const aiResponse = await aiClient.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });
          const geminiData = JSON.parse(aiResponse.text?.trim() || "{}");
          if (geminiData.gemini_summary) {
            result.gemini_enhancement = geminiData;
          }
        } catch (aiErr) {
          console.warn("Gemini enrichment skipped:", aiErr);
        }
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Build longitudinal timeline
  app.get("/api/timeline/:patientId", requireRole("patient", "doctor"), async (req, res) => {
    const authUser = (req as any).authUser;
    if (authUser.role === "patient" && authUser.patientId && req.params.patientId !== authUser.patientId) {
      return res.status(403).json({ error: "You can only access your own medical timeline." });
    }
    try {
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const timeline = await runPythonRaw("build-timeline", req.params.patientId);
          return res.json(timeline);
        } catch (e) {
          // fallback to native
        }
      }
      const timeline = clinicalCore.buildTimeline(req.params.patientId);
      res.json(timeline);
    } catch (err: any) {
      const timeline = clinicalCore.buildTimeline(req.params.patientId);
      res.json(timeline);
    }
  });

  // AI Search ("Ask Your Medical History")
  app.post("/api/search", requireRole("patient", "doctor"), async (req, res) => {
    try {
      const authUser = (req as any).authUser;
      const { patient_id, query } = req.body;
      const targetPatId =
        authUser.role === "patient" && authUser.patientId
          ? authUser.patientId
          : patient_id || "pat_1";
      const hasPython = await checkPythonAvailability();
      let searchResult: any = null;

      if (hasPython) {
        try {
          searchResult = await runPythonRaw("search", [targetPatId, query || ""]);
        } catch (e) {
          // fallback to native
        }
      }

      if (!searchResult) {
        searchResult = clinicalCore.search(targetPatId, query || "");
      }

      // If user asks a conversational question and Gemini is available:
      let conversationalAnswer = null;
      if (aiClient && query) {
        try {
          const timeline = clinicalCore.buildTimeline(targetPatId);
          const pat = clinicalCore.getPatient(targetPatId);
          const contextSummary = timeline
            .map((t: any) => `[${t.record_date || t.date}] (${t.category}) ${t.title}: ${t.summary || t.ai_summary} Alerts: ${(t.critical_alerts || []).join("; ")}`)
            .join("\n");

          const prompt = `You are an AI Healthcare Assistant answering questions for patient ${pat?.name || "Rahul Jadhav"} based strictly on their clinical record:
Medical Records History:
${contextSummary}

Question: "${query}"

Provide a friendly, highly accurate, and empathetic medical answer based on their history. Mention exact dates and values if present, and give safety guidance if any allergies or high values are relevant. Keep it under 120 words.`;

          const aiResponse = await aiClient.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
          });
          conversationalAnswer = aiResponse.text?.trim();
        } catch (aiErr) {
          console.warn("Conversational search fallback:", aiErr);
        }
      }

      res.json({
        ...searchResult,
        conversational_answer: conversationalAnswer,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Book appointment
  app.post("/api/appointments/book", requireRole("patient", "doctor", "clinic"), async (req, res) => {
    try {
      const authUser = (req as any).authUser;
      const bookingPayload =
        authUser.role === "patient" && authUser.patientId
          ? { ...req.body, patient_id: authUser.patientId }
          : req.body;
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const result = await runPythonRaw("book-appointment", bookingPayload);
          // Sync with core
          clinicalCore.bookAppointment(bookingPayload);
          return res.json(result);
        } catch (e) {
          // fallback
        }
      }
      const result = clinicalCore.bookAppointment(bookingPayload);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update appointment status (Doctor / Clinic check-in, completion, cancel)
  app.post("/api/appointments/status", requireRole("clinic", "doctor"), async (req, res) => {
    try {
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const result = await runPythonRaw("update-appointment-status", req.body);
          clinicalCore.updateAppointmentStatus(req.body);
          return res.json(result);
        } catch (e) {
          // fallback
        }
      }
      const result = clinicalCore.updateAppointmentStatus(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Request Access (Doctor -> Patient)
  app.post("/api/consents/request", requireRole("doctor"), async (req, res) => {
    try {
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const result = await runPythonRaw("request-consent", req.body);
          clinicalCore.requestConsent(req.body);
          return res.json(result);
        } catch (e) {
          // fallback
        }
      }
      const result = clinicalCore.requestConsent(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Respond to Consent (Patient -> Approve / Reject)
  app.post("/api/consents/respond", requireRole("patient"), async (req, res) => {
    try {
      const authUser = (req as any).authUser;
      const targetConsent = clinicalCore.getState().consents.find((c) => c.id === req.body?.consent_id);
      if (targetConsent && authUser.patientId && targetConsent.patient_id !== authUser.patientId) {
        return res.status(403).json({ error: "You can only manage your own consent requests." });
      }
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const result = await runPythonRaw("respond-consent", req.body);
          clinicalCore.respondConsent(req.body);
          return res.json(result);
        } catch (e) {
          // fallback
        }
      }
      const result = clinicalCore.respondConsent(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Revoke Consent (Patient)
  app.post("/api/consents/revoke", requireRole("patient"), async (req, res) => {
    try {
      const authUser = (req as any).authUser;
      const targetConsent = clinicalCore.getState().consents.find((c) => c.id === req.body?.consent_id);
      if (targetConsent && authUser.patientId && targetConsent.patient_id !== authUser.patientId) {
        return res.status(403).json({ error: "You can only revoke your own consent records." });
      }
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const result = await runPythonRaw("revoke-consent", req.body);
          clinicalCore.revokeConsent(req.body);
          return res.json(result);
        } catch (e) {
          // fallback
        }
      }
      const result = clinicalCore.revokeConsent(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Doctor Prescription / Notes
  app.post("/api/prescriptions/add", requireRole("doctor"), async (req, res) => {
    try {
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const result = await runPythonRaw("add-prescription", req.body);
          clinicalCore.addPrescription(req.body);
          return res.json(result);
        } catch (e) {
          // fallback
        }
      }
      const result = clinicalCore.addPrescription(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Reminder
  app.post("/api/reminders/add", requireRole("patient"), async (req, res) => {
    try {
      const authUser = (req as any).authUser;
      const remPayload = authUser.patientId
        ? { ...req.body, patient_id: authUser.patientId }
        : req.body;
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const result = await runPythonRaw("add-reminder", remPayload);
          clinicalCore.addReminder(remPayload);
          return res.json(result);
        } catch (e) {
          // fallback
        }
      }
      const result = clinicalCore.addReminder(remPayload);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Toggle Reminder
  app.post("/api/reminders/toggle", requireRole("patient"), async (req, res) => {
    try {
      const authUser = (req as any).authUser;
      const targetRem = clinicalCore.getState().reminders.find((r) => r.id === req.body?.reminder_id);
      if (targetRem && authUser.patientId && targetRem.patient_id !== authUser.patientId) {
        return res.status(403).json({ error: "You can only update your own medication reminders." });
      }
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const result = await runPythonRaw("toggle-reminder", req.body);
          clinicalCore.toggleReminder(req.body);
          return res.json(result);
        } catch (e) {
          // fallback
        }
      }
      const result = clinicalCore.toggleReminder(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Doctor (Hospital Module)
  app.post("/api/doctors/add", requireRole("clinic"), async (req, res) => {
    try {
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const result = await runPythonRaw("add-doctor", req.body);
          clinicalCore.addDoctor(req.body);
          return res.json(result);
        } catch (e) {
          // fallback
        }
      }
      const result = clinicalCore.addDoctor(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Clinic (Hospital Module)
  app.post("/api/clinics/add", requireRole("clinic"), async (req, res) => {
    try {
      const hasPython = await checkPythonAvailability();
      if (hasPython) {
        try {
          const result = await runPythonRaw("add-clinic", req.body);
          clinicalCore.addClinic(req.body);
          return res.json(result);
        } catch (e) {
          // fallback
        }
      }
      const result = clinicalCore.addClinic(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Multi-Language & Voice processing (English, Hindi, Marathi)
  app.post("/api/voice-process", requireRole("patient", "doctor"), async (req, res) => {
    try {
      const { transcript, language } = req.body;

      let processed = {
        transcript,
        language: language || "en",
        english_translation: transcript,
        extracted_intent: "General Inquiry",
        suggested_query: transcript,
      };

      if (aiClient && transcript) {
        try {
          const prompt = `You are a multilingual Indian healthcare assistant.
Input text spoken by patient in language '${language}' (${language === "hi" ? "Hindi" : language === "mr" ? "Marathi" : "English"}):
"${transcript}"

Translate this to English if not already English, identify the medical intent (e.g., Symptom Logging, Search Past Blood Test, Appointment Booking, Prescription Query), and formulate a clean search query or medical note.
Return JSON:
{
  "english_translation": "...",
  "extracted_intent": "...",
  "suggested_query": "..."
}`;
          const aiResponse = await aiClient.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: { responseMimeType: "application/json" },
          });
          const parsed = JSON.parse(aiResponse.text?.trim() || "{}");
          processed = { ...processed, ...parsed };
        } catch (e) {
          console.warn("Voice NLP fallback:", e);
        }
      }

      res.json(processed);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ================= VITE / STATIC SERVING =================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for HTML5 client routing in dev mode
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api")) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        next(e);
      }
    });
  } else {
    const candidateDist1 = path.join(process.cwd(), "dist");
    const candidateDist2 = path.join(currentDir, "dist");
    const candidateDist3 = currentDir;
    const distPath = fs.existsSync(path.join(candidateDist1, "index.html"))
      ? candidateDist1
      : fs.existsSync(path.join(candidateDist2, "index.html"))
      ? candidateDist2
      : candidateDist3;

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`  VITE v8.3.0  ready in 120 ms`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`Healthcare Management System running on http://0.0.0.0:${PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} in use, retrying in 1s...`);
      setTimeout(() => {
        server.close();
        server.listen(PORT, "0.0.0.0");
      }, 1000);
    } else {
      console.error("Server error:", err);
    }
  });

  process.on("SIGTERM", () => {
    server.close(() => process.exit(0));
  });
  process.on("SIGINT", () => {
    server.close(() => process.exit(0));
  });
}

startServer();
