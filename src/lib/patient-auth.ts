import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

/* Re-exported for the patient API routes (single hashing implementation
   now lives in @/lib/password, shared with admin accounts). */
export { hashPassword, verifyPassword };

/* ------------------------------------------------------------------ */
/*  Patient account authentication — powers the Patient Portal (/portal)
    Passwords: scrypt with per-account random salt ("scrypt:salt:hash")
    Sessions:  signed httpOnly cookie `adc_patient_session`, 30-day TTL.
               Token = `${patientId}.${expiresAt}.${hmac(...)}` so the
               server can resolve the patient WITHOUT trusting a client-
               supplied id; the HMAC binds id+expiry and the secret is
               never exposed. Rotating PATIENT_SESSION_SECRET logs
               everyone out.                                            */
/* ------------------------------------------------------------------ */

export const PATIENT_SESSION_COOKIE = "adc_patient_session";
export const PATIENT_SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const SESSION_SECRET = createHash("sha256")
  .update(`adc-patient-session-v1:${process.env.PATIENT_SESSION_SECRET ?? "aristocrat-care-2026"}`)
  .digest();

/* ------------------------------------------------------------------ */
/*  Session tokens                                                      */
/* ------------------------------------------------------------------ */

function sessionHmac(payload: string): string {
  return createHmac("sha256", SESSION_SECRET).update(payload, "utf8").digest("hex");
}

/** Mint a signed session token for a patient id. */
export function createPatientSessionToken(
  patientId: string,
  ttlMs: number = PATIENT_SESSION_TTL_MS
): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + ttlMs;
  const payload = `${patientId}.${expiresAt}`;
  return { token: `${payload}.${sessionHmac(payload)}`, expiresAt };
}

/** Verify a session token → patientId, or null (invalid/expired/tampered). */
export function verifyPatientSessionToken(
  token: string | null | undefined
): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [patientId, expStr, sig] = parts;
  if (!patientId || !/^[0-9a-z]{20,}$/i.test(patientId)) return null;
  if (!/^\d{1,15}$/.test(expStr) || !/^[0-9a-f]{64}$/.test(sig)) return null;
  const expiresAt = Number(expStr);
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return null;
  const expected = Buffer.from(sessionHmac(`${patientId}.${expStr}`), "hex");
  const provided = Buffer.from(sig, "hex");
  return expected.length === provided.length && timingSafeEqual(expected, provided)
    ? patientId
    : null;
}

/* ------------------------------------------------------------------ */
/*  Request helpers                                                     */
/* ------------------------------------------------------------------ */

/** Public shape returned to the browser (never the passwordHash). */
export const PATIENT_PUBLIC_SELECT = {
  id: true,
  phone: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Resolve the signed-in patient from the request cookie → Patient | null. */
export async function getPatientFromRequest(req: NextRequest) {
  const token = req.cookies.get(PATIENT_SESSION_COOKIE)?.value;
  const patientId = verifyPatientSessionToken(token);
  if (!patientId) return null;
  try {
    return await db.patient.findUnique({
      where: { id: patientId },
      select: PATIENT_PUBLIC_SELECT,
    });
  } catch {
    return null;
  }
}

/** Cookie attributes for issuing/clearing the patient session cookie. */
export function patientSessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Standard 401 for patient endpoints. */
export function patientUnauthorized(): NextResponse {
  return NextResponse.json(
    { error: "Please log in to your patient account." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}
