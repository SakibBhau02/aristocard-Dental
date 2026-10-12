import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  PATIENT_PUBLIC_SELECT,
  createPatientSessionToken,
  patientSessionCookieOptions,
  PATIENT_SESSION_TTL_MS,
  PATIENT_SESSION_COOKIE,
  verifyPassword,
} from "@/lib/patient-auth";

/* ------------------------------------------------------------------ */
/*  POST /api/patient/login — { phone, password } → session cookie      */
/*  Same generic 401 for unknown phone AND wrong password (never       */
/*  reveal which one was wrong).                                       */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const rl = checkRateLimit(`pat:login:${getClientIp(req)}`, 10, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const body = await req.json().catch(() => null);
    const { phone, password } = body ?? {};
    if (
      !body ||
      typeof body !== "object" ||
      typeof phone !== "string" ||
      typeof password !== "string" ||
      !password
    ) {
      return NextResponse.json(
        { error: "Phone number and password are required." },
        { status: 400 }
      );
    }

    const normalizedPhone = phone.replace(/[-\s]/g, "");
    if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { error: "Please provide a valid Bangladeshi mobile number (e.g. 01712345678)." },
        { status: 400 }
      );
    }

    const patient = await db.patient.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!patient || !verifyPassword(password, patient.passwordHash)) {
      return NextResponse.json(
        { error: "Incorrect phone number or password." },
        { status: 401 }
      );
    }

    const { token } = createPatientSessionToken(patient.id);
    const res = NextResponse.json(
      {
        success: true,
        patient: {
          id: patient.id,
          phone: patient.phone,
          name: patient.name,
          email: patient.email,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
        },
        message: "Welcome back!",
      },
      { status: 200 }
    );
    res.cookies.set(
      PATIENT_SESSION_COOKIE,
      token,
      patientSessionCookieOptions(Math.floor(PATIENT_SESSION_TTL_MS / 1000))
    );
    return res;
  } catch (err) {
    console.error("[patient/login] error:", err);
    return NextResponse.json(
      { error: "Could not log you in. Please try again." },
      { status: 500 }
    );
  }
}
