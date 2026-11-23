// In-memory session token store (never written to localStorage or sessionStorage)
let inMemoryToken: string | null = null;

export type AuthRole = "patient" | "doctor" | "clinic";

export interface AuthUser {
  role: AuthRole;
  displayName: string;
  identifier: string;
  patientId?: string;
  doctorId?: string;
  specialization?: string;
  clinicId?: string;
}

export function setSessionToken(token: string | null): void {
  inMemoryToken = token;
}

export function getSessionToken(): string | null {
  return inMemoryToken;
}

export function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (inMemoryToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${inMemoryToken}`);
  }
  return fetch(input, {
    ...init,
    headers,
  });
}
