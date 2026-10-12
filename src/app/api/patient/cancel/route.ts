import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getPatientFromRequest,
  patientUnauthorized,
} from "@/lib/patient-auth";

/* ------------------------------------------------------------------ */
/*  POST /api/patient/cancel — cancel your own appointment              */
/*  { refCode } — the session is bound to the account phone, so the     */
/*  booking must belong to THAT phone (no re-typing the number, unlike  */
/*  the anonymous /api/appointments/cancel flow).                       */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const patient = await getPatientFromRequest(req);
    if (!patient) return patientUnauthorized();

    const body = await req.json().catch(() => null);
    const refCode =
      typeof body?.refCode === "string" ? body.refCode.trim().toUpperCase() : "";

    if (!/^ADC-[A-Z0-9]{6,10}$/.test(refCode)) {
      return NextResponse.json(
        { error: "A valid reference code (ADC-XXXXXXXX) is required." },
        { status: 400 }
      );
    }

    const appointment = await db.appointment.findFirst({
      where: { refCode },
    });
    if (!appointment) {
      return NextResponse.json(
        { error: "No appointment found with that reference code." },
        { status: 404 }
      );
    }
    if (appointment.phone !== patient.phone) {
      return NextResponse.json(
        { error: "This booking is not linked to your account." },
        { status: 403 }
      );
    }
    if (appointment.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This appointment is already cancelled." },
        { status: 409 }
      );
    }
    if (appointment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This appointment has already been completed." },
        { status: 409 }
      );
    }

    const updated = await db.appointment.update({
      where: { id: appointment.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      appointment: {
        refCode: updated.refCode,
        status: updated.status,
        date: updated.date,
        time: updated.time,
      },
      message: "Your appointment has been cancelled. We hope to see you again soon.",
    });
  } catch (err) {
    console.error("[patient/cancel] error:", err);
    return NextResponse.json(
      { error: "Could not cancel the appointment. Please try again." },
      { status: 500 }
    );
  }
}
