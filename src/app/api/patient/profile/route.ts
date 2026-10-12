import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  PATIENT_PUBLIC_SELECT,
  getPatientFromRequest,
  patientUnauthorized,
} from "@/lib/patient-auth";

/* ------------------------------------------------------------------ */
/*  PUT /api/patient/profile — update name / email (session required)   */
/* ------------------------------------------------------------------ */

export async function PUT(req: NextRequest) {
  try {
    const patient = await getPatientFromRequest(req);
    if (!patient) return patientUnauthorized();

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 }
      );
    }
    const { name, email } = body ?? {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { error: "Name must be at least 2 characters." },
          { status: 400 }
        );
      }
    }
    if (email !== undefined && email !== null && email !== "") {
      if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "Please provide a valid email address." },
          { status: 400 }
        );
      }
    }

    const updated = await db.patient.update({
      where: { id: patient.id },
      data: {
        ...(typeof name === "string" ? { name: name.trim() } : {}),
        ...(email === null
          ? { email: null }
          : typeof email === "string"
            ? { email: email.trim() || null }
            : {}),
      },
      select: PATIENT_PUBLIC_SELECT,
    });

    return NextResponse.json({
      success: true,
      patient: updated,
      message: "Profile updated.",
    });
  } catch (err) {
    console.error("[patient/profile] error:", err);
    return NextResponse.json(
      { error: "Could not update your profile. Please try again." },
      { status: 500 }
    );
  }
}
