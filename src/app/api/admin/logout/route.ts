import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/admin-auth";

/* ------------------------------------------------------------------ */
/*  POST /api/admin/logout — clear the session cookie                  */
/*  → 204 (idempotent: works whether or not a session existed)         */
/* ------------------------------------------------------------------ */

export async function POST() {
  const res = new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", sessionCookieOptions(0));
  return res;
}
