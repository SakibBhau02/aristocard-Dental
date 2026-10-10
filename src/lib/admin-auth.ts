import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  Admin authentication — shared by /api/admin/* routes               */
/*  Two auth paths are accepted:                                       */
/*    1. x-admin-code header  (back-compat, e.g. curl/automation)      */
/*    2. adc_admin_session cookie — signed, expiring session token     */
/*       issued by POST /api/admin/login (the browser path)            */
/*  Demo passcode by default; override with ADMIN_PASSCODE env var.    */
/*  Comparisons are constant-time so passcode/token length or prefix   */
/*  is never leaked through response timing.                           */
/* ------------------------------------------------------------------ */

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE ?? "aristocrat-2026";

/* Session cookie: 8 hours, httpOnly (never readable by JS), sameSite=lax
   (blocks cross-site POSTs). The HMAC key is derived from the passcode so
   rotating ADMIN_PASSCODE also invalidates every issued session. */
export const ADMIN_SESSION_COOKIE = "adc_admin_session";
export const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function sha256(input: string): Buffer {
  return createHash("sha256").update(input, "utf8").digest();
}

/* ------------------------------------------------------------------ */
/*  Passcode verification (header path)                                 */
/* ------------------------------------------------------------------ */

/** Constant-time passcode check. */
export function verifyAdminCode(code: string | null | undefined): boolean {
  if (!code) return false;
  const a = sha256(code);
  const b = sha256(ADMIN_PASSCODE);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Extracts the passcode from the x-admin-code header. */
export function adminCodeFromRequest(req: NextRequest): string {
  return req.headers.get("x-admin-code") ?? "";
}

/* ------------------------------------------------------------------ */
/*  Session tokens (cookie path)                                        */
/*  Format: `${expiresAtMs}.${hmacSha256(expiresAtMs)}`                 */
/* ------------------------------------------------------------------ */

const SESSION_SECRET = sha256(`adc-admin-session-v1:${ADMIN_PASSCODE}`);

function sessionHmac(payload: string): string {
  return createHmac("sha256", SESSION_SECRET).update(payload, "utf8").digest("hex");
}

/** Mints a fresh signed session token. */
export function createSessionToken(
  ttlMs: number = ADMIN_SESSION_TTL_MS
): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + ttlMs;
  return { token: `${expiresAt}.${sessionHmac(String(expiresAt))}`, expiresAt };
}

/** Constant-time session token check → expiry timestamp, or null. */
export function verifySessionToken(
  token: string | null | undefined
): number | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d{1,15}$/.test(expStr) || !/^[0-9a-f]{64}$/.test(sig)) return null;
  const expiresAt = Number(expStr);
  if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return null;
  const expected = Buffer.from(sessionHmac(expStr), "hex");
  const provided = Buffer.from(sig, "hex");
  return expected.length === provided.length && timingSafeEqual(expected, provided)
    ? expiresAt
    : null;
}

/* ------------------------------------------------------------------ */
/*  Request helpers                                                     */
/* ------------------------------------------------------------------ */

/** True when the request carries a valid passcode header OR a valid session cookie. */
export function isAdminAuthorized(req: NextRequest): boolean {
  if (verifyAdminCode(adminCodeFromRequest(req))) return true;
  return verifySessionToken(req.cookies.get(ADMIN_SESSION_COOKIE)?.value) !== null;
}

/** Cookie attributes for issuing/clearing the session cookie. */
export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Standard 401 response for failed admin auth. */
export function adminUnauthorized(): NextResponse {
  return NextResponse.json(
    { error: "Invalid admin code." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

/** Guard helper: returns null when authorized, else the 401 response. */
export function requireAdmin(
  req: NextRequest
): NextResponse | null {
  return isAdminAuthorized(req) ? null : adminUnauthorized();
}
