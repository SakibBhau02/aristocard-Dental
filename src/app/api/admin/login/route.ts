import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  createSessionToken,
  sessionCookieOptions,
  type AdminRole,
  type AdminSessionUser,
} from "@/lib/admin-auth";
import { verifyPassword } from "@/lib/password";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import { audit } from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  POST /api/admin/login — staff username + password login            */
/*  Body: { username: string, password: string }                       */
/*  → 200 { success, user: {username, displayName, role}, expiresAt }  */
/*        + Set-Cookie adc_admin_session (httpOnly, 8h)                */
/*  → 401 invalid credentials    → 429 rate-limited (5 / 10 min)       */
/*  Every attempt (success AND failure) is written to the audit log.   */
/* ------------------------------------------------------------------ */

function roleFromDb(role: string): AdminRole {
  return (["OWNER", "EDITOR", "VIEWER"] as const).includes(role as AdminRole)
    ? (role as AdminRole)
    : "VIEWER";
}

export async function POST(req: NextRequest) {
  /* Brute-force guard FIRST (before body parse) — per IP and per
     username, so one account can't be hammered from many IPs. */
  const ip = getClientIp(req);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "A valid JSON request body is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
  const raw = body as Record<string, unknown>;
  const username =
    typeof raw.username === "string" ? raw.username.trim().toLowerCase() : "";
  const password = typeof raw.password === "string" ? raw.password : "";

  const rlIp = checkRateLimit(`admin-login:${ip}`, 5, 10 * 60 * 1000);
  const rlUser = username
    ? checkRateLimit(`admin-login-user:${username}`, 5, 10 * 60 * 1000)
    : { allowed: true as const, retryAfterSec: null };
  if (!rlIp.allowed || !rlUser.allowed) {
    const retry = Math.max(rlIp.retryAfterSec ?? 0, rlUser.retryAfterSec ?? 0, 60);
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again, or call the clinic." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, retry)),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const fail = (message: string) =>
    NextResponse.json({ error: message }, { status: 401, headers: { "Cache-Control": "no-store" } });

  if (!username || !password) {
    return fail("Enter both your username and password.");
  }

  const user = await db.adminUser.findUnique({ where: { username } }).catch(() => null);
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    void audit(req, {
      action: "login-failed",
      entity: "auth",
      label: username,
      actorName: username,
      actorLabel: null,
      actorRole: null,
    });
    return fail("Incorrect username or password.");
  }

  const sessionUser: AdminSessionUser = {
    sub: user.id,
    username: user.username,
    displayName: user.displayName,
    role: roleFromDb(user.role),
  };
  const { token, expiresAt } = createSessionToken(sessionUser);

  await db.adminUser
    .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    .catch(() => null);

  void audit(req, {
    action: "login",
    entity: "auth",
    label: `${sessionUser.displayName} (${sessionUser.role}) signed in`,
    actorName: sessionUser.username,
    actorLabel: sessionUser.displayName,
    actorRole: sessionUser.role,
  });

  const res = NextResponse.json(
    { success: true, user: sessionUser, expiresAt },
    { headers: { "Cache-Control": "no-store" } }
  );
  res.cookies.set(
    ADMIN_SESSION_COOKIE,
    token,
    sessionCookieOptions(Math.ceil(ADMIN_SESSION_TTL_MS / 1000))
  );
  return res;
}
