import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Admin authentication — shared by /api/admin/* routes               */
/*                                                                     */
/*  AUTH PATHS                                                         */
/*   1. Staff accounts (AdminUser table) — username + password via     */
/*      POST /api/admin/auth/login → signed httpOnly session cookie    */
/*      carrying {sub, username, displayName, role, exp}.              */
/*   2. Trusted automation — x-admin-code header (ADMIN_PASSCODE env,  */
/*      demo default "aristocrat-2026"), treated as OWNER.             */
/*                                                                     */
/*  RBAC — roles are enforced centrally in requireAdminRole():         */
/*   OWNER  everything, incl. site settings + staff management         */
/*   EDITOR all content/engagement mutations; settings & users = read  */
/*   VIEWER read-only (GET) across the panel                           */
/*  Route-scope rules baked in:                                        */
/*   • /api/admin/settings  non-GET  → OWNER only                      */
/*   • /api/admin/users     all      → OWNER only                      */
/*  All comparisons are constant-time (no timing leaks).               */
/* ------------------------------------------------------------------ */

export const ADMIN_SESSION_COOKIE = "adc_admin_session";
export const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export type AdminRole = "OWNER" | "EDITOR" | "VIEWER";
export const ADMIN_ROLES: AdminRole[] = ["OWNER", "EDITOR", "VIEWER"];
const ROLE_RANK: Record<AdminRole, number> = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

export type AdminSessionUser = {
  sub: string;
  username: string;
  displayName: string;
  role: AdminRole;
};

export type AdminActor =
  | { kind: "user"; user: AdminSessionUser }
  | { kind: "automation" };

/* ------------------------------------------------------------------ */
/*  Automation passcode (header path)                                   */
/* ------------------------------------------------------------------ */

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE ?? "aristocrat-2026";

function sha256(input: string): Buffer {
  return createHash("sha256").update(input, "utf8").digest();
}

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
/*  Token = base64url(JSON payload) + "." + hmacSha256(payload)         */
/*  Payload: { sub, username, displayName, role, exp }                  */
/*  The role is ALSO re-checked against the DB on privileged requests  */
/*  so demoting/deactivating a user invalidates their live session.    */
/* ------------------------------------------------------------------ */

const SESSION_SECRET = sha256(
  `adc-admin-session-v2:${ADMIN_PASSCODE}:${process.env.ADMIN_SESSION_SECRET ?? "staff"}`
);

type SessionPayload = AdminSessionUser & { exp: number };

function b64url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function sessionHmac(payload: string): string {
  return createHmac("sha256", SESSION_SECRET).update(payload, "utf8").digest("hex");
}

/** Mints a fresh signed session token for a staff user. */
export function createSessionToken(
  user: AdminSessionUser,
  ttlMs: number = ADMIN_SESSION_TTL_MS
): { token: string; expiresAt: number } {
  const payload: SessionPayload = { ...user, exp: Date.now() + ttlMs };
  const body = b64url(JSON.stringify(payload));
  return { token: `${body}.${sessionHmac(body)}`, expiresAt: payload.exp };
}

/** Constant-time session token check → payload, or null. */
export function verifySessionToken(
  token: string | null | undefined
): SessionPayload | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^[0-9a-f]{64}$/.test(sig)) return null;
  const expected = Buffer.from(sessionHmac(body), "hex");
  const provided = Buffer.from(sig, "hex");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (
      typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp) ||
      Date.now() >= payload.exp ||
      typeof payload.sub !== "string" ||
      typeof payload.username !== "string" ||
      !ADMIN_ROLES.includes(payload.role)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Actor resolution                                                    */
/* ------------------------------------------------------------------ */

function roleFromDb(role: string): AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole) ? (role as AdminRole) : "VIEWER";
}

/**
 * Resolves who is calling: a logged-in staff user (session cookie) or
 * trusted automation (passcode header). Sessions are re-validated against
 * the DB so deactivated/demoted accounts lose access immediately.
 * Returns null when the request is unauthenticated.
 */
export async function getAdminActor(req: NextRequest): Promise<AdminActor | null> {
  const payload = verifySessionToken(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (payload) {
    const row = await db.adminUser
      .findUnique({ where: { id: payload.sub }, select: { role: true, active: true } })
      .catch(() => null);
    if (!row || !row.active) return null; // deactivated mid-session → treat as logged out
    return {
      kind: "user",
      user: {
        sub: payload.sub,
        username: payload.username,
        displayName: payload.displayName,
        role: roleFromDb(row.role), // DB role wins over the (older) token role
      },
    };
  }
  if (verifyAdminCode(adminCodeFromRequest(req))) return { kind: "automation" };
  return null;
}

/** Back-compat sync boolean (session payload valid OR passcode header). */
export function isAdminAuthorized(req: NextRequest): boolean {
  return (
    verifySessionToken(req.cookies.get(ADMIN_SESSION_COOKIE)?.value) !== null ||
    verifyAdminCode(adminCodeFromRequest(req))
  );
}

/* ------------------------------------------------------------------ */
/*  Central RBAC gate                                                   */
/* ------------------------------------------------------------------ */

/** Routes that require OWNER regardless of method. */
const OWNER_ONLY_PATHS = ["/api/admin/users"];

/** Routes where mutating verbs require OWNER. */
const OWNER_ONLY_MUTATIONS = ["/api/admin/settings"];

function json(status: number, body: Record<string, unknown>): NextResponse {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * Guard for every admin route. Returns null when the caller is
 * authenticated AND authorized for this method+path; otherwise a ready
 * 401/403 response.
 */
export async function requireAdminRole(req: NextRequest): Promise<NextResponse | null> {
  const actor = await getAdminActor(req);
  if (!actor) return json(401, { error: "Authentication required." });

  const path = req.nextUrl.pathname;
  const mutating = req.method !== "GET" && req.method !== "HEAD";
  const effectiveRole: AdminRole = actor.kind === "automation" ? "OWNER" : actor.user.role;

  if (OWNER_ONLY_PATHS.some((p) => path.startsWith(p)) && effectiveRole !== "OWNER") {
    return json(403, { error: "Owner access required for staff management." });
  }
  if (
    mutating &&
    OWNER_ONLY_MUTATIONS.some((p) => path.startsWith(p)) &&
    effectiveRole !== "OWNER"
  ) {
    return json(403, { error: "Owner access required to change site settings." });
  }
  if (mutating && effectiveRole === "VIEWER") {
    return json(403, { error: "Your account is read-only." });
  }
  return null;
}

/** Sync guard kept for non-DB-dependent call sites (session OR passcode). */
export function requireAdmin(req: NextRequest): NextResponse | null {
  return isAdminAuthorized(req) ? null : adminUnauthorized();
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
