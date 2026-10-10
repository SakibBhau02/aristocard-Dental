import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  createSessionToken,
  sessionCookieOptions,
  verifyAdminCode,
} from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/* ------------------------------------------------------------------ */
/*  POST /api/admin/login — exchange passcode for a session cookie     */
/*  Body: { code: string }                                             */
/*  → 200 { success, expiresAt }  + Set-Cookie adc_admin_session       */
/*  → 401 invalid passcode    → 429 rate-limited (5 attempts / 10 min) */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  /* Brute-force guard FIRST (before body parse) — mirrors public routes. */
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-login:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again, or call the clinic." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, rl.retryAfterSec ?? 60)),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "A valid JSON request body is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
  const code =
    typeof (body as Record<string, unknown>).code === "string"
      ? ((body as { code: string }).code).trim()
      : "";

  if (!verifyAdminCode(code)) {
    return NextResponse.json(
      { error: "Invalid admin passcode." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { token, expiresAt } = createSessionToken();
  const res = NextResponse.json(
    { success: true, expiresAt },
    { headers: { "Cache-Control": "no-store" } }
  );
  res.cookies.set(
    ADMIN_SESSION_COOKIE,
    token,
    sessionCookieOptions(Math.ceil(ADMIN_SESSION_TTL_MS / 1000))
  );
  return res;
}
