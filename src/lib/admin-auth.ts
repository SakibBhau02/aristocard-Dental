import { createHash, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  Admin authentication — shared by /api/admin/* routes               */
/*  Demo passcode by default; override with ADMIN_PASSCODE env var.    */
/*  Comparison is constant-time (timing-safe) against a digest so the  */
/*  passcode length / prefix is never leaked through response timing.  */
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
  return verifyAdminCode(adminCodeFromRequest(req)) ? null : adminUnauthorized();
}
