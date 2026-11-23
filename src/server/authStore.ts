import crypto from "crypto";
import fs from "fs";
import path from "path";

export type AuthRole = "patient" | "doctor" | "clinic";

export interface SessionUser {
  role: AuthRole;
  displayName: string;
  identifier: string;
  patientId?: string;
  doctorId?: string;
  specialization?: string;
  clinicId?: string;
}

interface StoredAccount {
  role: AuthRole;
  identifier: string;
  displayName: string;
  patientId?: string;
  doctorId?: string;
  specialization?: string;
  clinicId?: string;
  passwordHash: string; // format: saltHex:keyHex (scrypt)
  createdAt: string;
}

interface RoleClaim {
  passwordHash: string;
  claimedAt: string;
}

interface PersistedAuthData {
  roleClaims: Partial<Record<AuthRole, RoleClaim>>;
  accounts: StoredAccount[];
}

interface SessionEntry {
  user: SessionUser;
  expiresAt: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const AUTH_STORE_PATH = path.join(DATA_DIR, "auth_store.json");
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const VALID_ROLES: AuthRole[] = ["patient", "doctor", "clinic"];

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPasswordHash(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(keyHex, "hex");
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function verifyEnvPasscode(input: string, expected: string): boolean {
  const a = crypto.createHash("sha256").update(input, "utf8").digest();
  const b = crypto.createHash("sha256").update(expected, "utf8").digest();
  return crypto.timingSafeEqual(a, b);
}

function getEnvPasscode(role: AuthRole): string | null {
  const raw =
    role === "patient"
      ? process.env.PATIENT_PASSCODE
      : role === "doctor"
      ? process.env.DOCTOR_PASSCODE
      : process.env.CLINIC_PASSCODE;
  const trimmed = (raw || "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isValidRole(value: unknown): value is AuthRole {
  return typeof value === "string" && (VALID_ROLES as string[]).includes(value);
}

function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

function defaultDisplayName(role: AuthRole, identifier: string): string {
  const cleaned = identifier.trim();
  if (cleaned.includes("@")) {
    const prefix = cleaned.split("@")[0].replace(/[._-]+/g, " ").trim();
    if (prefix) {
      const titled = prefix.replace(/\b\w/g, (ch) => ch.toUpperCase());
      if (role === "doctor" && !/^dr\b/i.test(titled)) return `Dr. ${titled}`;
      return titled;
    }
  }
  if (role === "doctor") return cleaned || "Attending Physician";
  if (role === "clinic") return cleaned || "City Health OPD Desk";
  return cleaned || "Patient User";
}

export class AuthStore {
  private data: PersistedAuthData;
  private sessions: Map<string, SessionEntry> = new Map();

  constructor() {
    this.data = this.load();
  }

  private load(): PersistedAuthData {
    try {
      if (fs.existsSync(AUTH_STORE_PATH)) {
        const parsed = JSON.parse(fs.readFileSync(AUTH_STORE_PATH, "utf-8"));
        if (parsed && typeof parsed === "object") {
          return {
            roleClaims: parsed.roleClaims && typeof parsed.roleClaims === "object" ? parsed.roleClaims : {},
            accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
          };
        }
      }
    } catch {
      // fallback to clean in-memory store
    }
    return { roleClaims: {}, accounts: [] };
  }

  private save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(AUTH_STORE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch {
      // in-memory fallback when filesystem is read-only
    }
  }

  private createSession(user: SessionUser): { token: string; user: SessionUser } {
    const token = crypto.randomBytes(32).toString("hex");
    this.sessions.set(token, {
      user,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return { token, user };
  }

  public getStatus() {
    const buildRoleStatus = (role: AuthRole) => {
      const envConfigured = getEnvPasscode(role) !== null;
      const claimed = Boolean(this.data.roleClaims[role]);
      const accountCount = this.data.accounts.filter((a) => a.role === role).length;
      return {
        envConfigured,
        initialized: envConfigured || claimed || accountCount > 0,
        needsSetup: !envConfigured && !claimed,
      };
    };

    return {
      roles: {
        patient: buildRoleStatus("patient"),
        doctor: buildRoleStatus("doctor"),
        clinic: buildRoleStatus("clinic"),
      },
    };
  }

  public claimRoleAccess(payload: {
    role: unknown;
    identifier?: unknown;
    displayName?: unknown;
    password?: unknown;
    patientId?: unknown;
    doctorId?: unknown;
    specialization?: unknown;
    clinicId?: unknown;
  }): { ok: true; token: string; user: SessionUser } | { ok: false; status: number; error: string } {
    if (!isValidRole(payload.role)) {
      return { ok: false, status: 400, error: "Invalid role selected." };
    }
    const role = payload.role;

    if (getEnvPasscode(role) !== null || this.data.roleClaims[role]) {
      return {
        ok: false,
        status: 409,
        error: "Access for this portal is already configured. Please sign in with your password.",
      };
    }

    const password = typeof payload.password === "string" ? payload.password : "";
    if (password.length < 6 || password.length > 128) {
      return {
        ok: false,
        status: 400,
        error: "Please choose a password between 6 and 128 characters.",
      };
    }

    const rawIdentifier =
      typeof payload.identifier === "string" && payload.identifier.trim().length > 0
        ? payload.identifier.trim()
        : role === "doctor"
        ? "rajesh.sharma@mediq.health"
        : role === "clinic"
        ? "desk@cityhealth.clinic"
        : "rahul.jadhav@hourglass.health";

    const displayName =
      typeof payload.displayName === "string" && payload.displayName.trim().length > 0
        ? payload.displayName.trim().slice(0, 80)
        : defaultDisplayName(role, rawIdentifier);

    const patientId =
      role === "patient" && typeof payload.patientId === "string" && payload.patientId.trim()
        ? payload.patientId.trim()
        : role === "patient"
        ? "pat_1"
        : undefined;

    const doctorId =
      role === "doctor" && typeof payload.doctorId === "string" && payload.doctorId.trim()
        ? payload.doctorId.trim()
        : role === "doctor"
        ? "doc_1"
        : undefined;

    const specialization =
      role === "doctor" &&
      typeof payload.specialization === "string" &&
      payload.specialization.trim()
        ? payload.specialization.trim().slice(0, 80)
        : role === "doctor"
        ? "Specialist Physician"
        : undefined;

    const clinicId =
      role === "clinic" && typeof payload.clinicId === "string" && payload.clinicId.trim()
        ? payload.clinicId.trim()
        : role === "clinic"
        ? "clinic_1"
        : undefined;

    this.data.roleClaims[role] = {
      passwordHash: hashPassword(password),
      claimedAt: new Date().toISOString(),
    };
    this.save();

    const session = this.createSession({
      role,
      displayName,
      identifier: normalizeIdentifier(rawIdentifier),
      patientId,
      doctorId,
      specialization,
      clinicId,
    });
    return { ok: true, ...session };
  }

  public registerAccount(payload: {
    role: unknown;
    identifier?: unknown;
    displayName?: unknown;
    password?: unknown;
    patientId?: unknown;
    doctorId?: unknown;
    specialization?: unknown;
    clinicId?: unknown;
  }): { ok: true; token: string; user: SessionUser } | { ok: false; status: number; error: string } {
    if (!isValidRole(payload.role)) {
      return { ok: false, status: 400, error: "Invalid role selected." };
    }
    const role = payload.role;
    const rawIdentifier = typeof payload.identifier === "string" ? payload.identifier.trim() : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (rawIdentifier.length < 3 || rawIdentifier.length > 100) {
      return { ok: false, status: 400, error: "Please enter a valid email or staff ID." };
    }
    if (password.length < 6 || password.length > 128) {
      return { ok: false, status: 400, error: "Password must be between 6 and 128 characters." };
    }

    const normalized = normalizeIdentifier(rawIdentifier);
    const exists = this.data.accounts.some((a) => a.role === role && a.identifier === normalized);
    if (exists) {
      return {
        ok: false,
        status: 409,
        error: "An account with this identifier already exists for this portal. Please sign in.",
      };
    }

    const displayName =
      typeof payload.displayName === "string" && payload.displayName.trim().length > 0
        ? payload.displayName.trim().slice(0, 80)
        : defaultDisplayName(role, rawIdentifier);

    const patientId =
      role === "patient" && typeof payload.patientId === "string" && payload.patientId.trim()
        ? payload.patientId.trim()
        : role === "patient"
        ? "pat_1"
        : undefined;

    const doctorId =
      role === "doctor" && typeof payload.doctorId === "string" && payload.doctorId.trim()
        ? payload.doctorId.trim()
        : role === "doctor"
        ? `doc_custom_${Date.now()}`
        : undefined;

    const specialization =
      role === "doctor" &&
      typeof payload.specialization === "string" &&
      payload.specialization.trim()
        ? payload.specialization.trim().slice(0, 80)
        : role === "doctor"
        ? "Attending Physician"
        : undefined;

    const clinicId =
      role === "clinic" && typeof payload.clinicId === "string" && payload.clinicId.trim()
        ? payload.clinicId.trim()
        : role === "clinic"
        ? "clinic_1"
        : undefined;

    const newAccount: StoredAccount = {
      role,
      identifier: normalized,
      displayName,
      patientId,
      doctorId,
      specialization,
      clinicId,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    this.data.accounts.push(newAccount);
    this.save();

    const session = this.createSession({
      role,
      displayName: newAccount.displayName,
      identifier: newAccount.identifier,
      patientId: newAccount.patientId,
      doctorId: newAccount.doctorId,
      specialization: newAccount.specialization,
      clinicId: newAccount.clinicId,
    });
    return { ok: true, ...session };
  }

  public login(payload: {
    role: unknown;
    identifier?: unknown;
    displayName?: unknown;
    password?: unknown;
    patientId?: unknown;
    doctorId?: unknown;
    specialization?: unknown;
    clinicId?: unknown;
  }): { ok: true; token: string; user: SessionUser } | { ok: false; status: number; error: string } {
    if (!isValidRole(payload.role)) {
      return { ok: false, status: 400, error: "Invalid role selected." };
    }
    const role = payload.role;
    const password = typeof payload.password === "string" ? payload.password : "";
    if (!password) {
      return { ok: false, status: 400, error: "Password is required." };
    }

    const rawIdentifier =
      typeof payload.identifier === "string" && payload.identifier.trim().length > 0
        ? payload.identifier.trim()
        : role === "doctor"
        ? "rajesh.sharma@mediq.health"
        : role === "clinic"
        ? "desk@cityhealth.clinic"
        : "rahul.jadhav@hourglass.health";
    const normalized = normalizeIdentifier(rawIdentifier);

    // 1. Check registered individual account for this role + identifier
    const matchedAccount = this.data.accounts.find(
      (a) => a.role === role && a.identifier === normalized
    );
    if (matchedAccount) {
      if (!verifyPasswordHash(password, matchedAccount.passwordHash)) {
        return { ok: false, status: 401, error: "Incorrect password. Please try again." };
      }
      const session = this.createSession({
        role,
        displayName: matchedAccount.displayName,
        identifier: matchedAccount.identifier,
        patientId: matchedAccount.patientId,
        doctorId: matchedAccount.doctorId,
        specialization: matchedAccount.specialization,
        clinicId: matchedAccount.clinicId,
      });
      return { ok: true, ...session };
    }

    // 2. Check environment-configured role passcode (overrides claimed fallback)
    const envPass = getEnvPasscode(role);
    const displayName =
      typeof payload.displayName === "string" && payload.displayName.trim().length > 0
        ? payload.displayName.trim().slice(0, 80)
        : defaultDisplayName(role, rawIdentifier);
    const patientId =
      role === "patient" && typeof payload.patientId === "string" && payload.patientId.trim()
        ? payload.patientId.trim()
        : role === "patient"
        ? "pat_1"
        : undefined;
    const doctorId =
      role === "doctor" && typeof payload.doctorId === "string" && payload.doctorId.trim()
        ? payload.doctorId.trim()
        : role === "doctor"
        ? "doc_1"
        : undefined;
    const specialization =
      role === "doctor" &&
      typeof payload.specialization === "string" &&
      payload.specialization.trim()
        ? payload.specialization.trim().slice(0, 80)
        : role === "doctor"
        ? "Specialist Physician"
        : undefined;
    const clinicId =
      role === "clinic" && typeof payload.clinicId === "string" && payload.clinicId.trim()
        ? payload.clinicId.trim()
        : role === "clinic"
        ? "clinic_1"
        : undefined;

    if (envPass !== null) {
      if (!verifyEnvPasscode(password, envPass)) {
        return { ok: false, status: 401, error: "Incorrect password for this portal." };
      }
      const session = this.createSession({
        role,
        displayName,
        identifier: normalized,
        patientId,
        doctorId,
        specialization,
        clinicId,
      });
      return { ok: true, ...session };
    }

    // 3. Check claimed role password hash
    const claim = this.data.roleClaims[role];
    if (claim) {
      if (!verifyPasswordHash(password, claim.passwordHash)) {
        return { ok: false, status: 401, error: "Incorrect password for this portal." };
      }
      const session = this.createSession({
        role,
        displayName,
        identifier: normalized,
        patientId,
        doctorId,
        specialization,
        clinicId,
      });
      return { ok: true, ...session };
    }

    return {
      ok: false,
      status: 401,
      error: "No password is set for this portal yet. Use first-time setup to activate it.",
    };
  }

  public verifyToken(token: string | null | undefined): SessionUser | null {
    if (!token) return null;
    const entry = this.sessions.get(token);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.sessions.delete(token);
      return null;
    }
    return entry.user;
  }

  public revokeToken(token: string | null | undefined): void {
    if (token) {
      this.sessions.delete(token);
    }
  }
}

export const authStore = new AuthStore();
