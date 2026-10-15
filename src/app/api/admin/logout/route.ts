import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  sessionCookieOptions,
  getAdminActor,
} from "@/lib/admin-auth";
import { audit } from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  POST /api/admin/logout — clear the session cookie                  */
/*  → 204 (idempotent: works whether or not a session existed).        */
/*  Sign-outs by identified staff are written to the audit log.        */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const actor = await getAdminActor(req).catch(() => null);
  if (actor?.kind === "user") {
    void audit(req, {
      action: "logout",
      entity: "auth",
      label: `${actor.user.displayName} signed out`,
    });
  }

  const res = new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", sessionCookieOptions(0));
  return res;
}
