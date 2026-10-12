import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  PATIENT_PUBLIC_SELECT,
  createPatientSessionToken,
  hashPassword,
  patientSessionCookieOptions,
  PATIENT_SESSION_TTL_MS,
  PATIENT_SESSION_COOKIE,
} from "@/lib/patient-auth";

/* ------------------------------------------------------------------ */
/*  POST /api/patient/register — create a patient account               */
/*  { name, phone, password, email? } → sets the session cookie         */
/*  Signing up with a phone that already has bookings links them       */
/*  automatically (appointments join by phone at query time).          */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const rl = checkRateLimit(`pat:reg:${getClientIp(req)}`, 5, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const body = await req.json().catch(() => null);
    const { name, phone, email, password } = body ?? {};
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.push("Please enter your full name (min 2 characters).");
    }
    const normalizedPhone =
      typeof phone === "string" ? phone.replace(/[-\s]/g, "") : "";
    if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) {
      errors.push("Please provide a valid Bangladeshi mobile number (e.g. 01712345678).");
    }
    if (
      !password ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 100 ||
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      errors.push("Password must be at least 8 characters and include both letters and numbers.");
    }
    if (
      email &&
      (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      errors.push("Please provide a valid email address.");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    const existing = await db.patient.findUnique({
      where: { phone: normalizedPhone },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        {
          error:
            "An account already exists for this phone number. Please log in instead.",
        },
        { status: 409 }
      );
    }

    const patient = await db.patient.create({
      data: {
        phone: normalizedPhone,
        name: (name as string).trim(),
        email: typeof email === "string" && email.trim() ? email.trim() : null,
        passwordHash: hashPassword(password as string),
      },
      select: PATIENT_PUBLIC_SELECT,
    });

    const { token } = createPatientSessionToken(patient.id);
    const res = NextResponse.json(
      {
        success: true,
        patient,
        message:
          "Welcome! Your patient account is ready — your booking history is linked to your number.",
      },
      { status: 201 }
    );
    res.cookies.set(
      PATIENT_SESSION_COOKIE,
      token,
      patientSessionCookieOptions(Math.floor(PATIENT_SESSION_TTL_MS / 1000))
    );
    return res;
  } catch (err) {
    console.error("[patient/register] error:", err);
    return NextResponse.json(
      { error: "Could not create your account. Please try again." },
      { status: 500 }
    );
  }
}
