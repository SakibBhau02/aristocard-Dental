import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/admin-auth";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/session — is there a live cookie session?           */
/*  → 200 { authenticated: true, expiresAt }                           */
/*  → 401 { authenticated: false }  (no/expired/invalid cookie)         */
/*  Lets the admin page restore a signed-in staff member on mount      */
/*  without ever re-sending or storing the passcode client-side.       */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const expiresAt = verifySessionToken(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  return NextResponse.json(
    { authenticated: expiresAt !== null, ...(expiresAt !== null ? { expiresAt } : {}) },
    { status: expiresAt !== null ? 200 : 401, headers: { "Cache-Control": "no-store" } }
  );
}
