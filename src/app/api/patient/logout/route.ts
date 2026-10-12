import { NextRequest, NextResponse } from "next/server";
import {
  PATIENT_SESSION_COOKIE,
  patientSessionCookieOptions,
} from "@/lib/patient-auth";

/* ------------------------------------------------------------------ */
/*  POST /api/patient/logout — clear the session cookie                 */
/* ------------------------------------------------------------------ */

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ success: true, message: "Logged out." });
  res.cookies.set(PATIENT_SESSION_COOKIE, "", patientSessionCookieOptions(0));
  return res;
}
