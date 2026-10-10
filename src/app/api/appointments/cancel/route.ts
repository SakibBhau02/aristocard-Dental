import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  POST /api/appointments/cancel — cancel a booking (verified)        */
/*  Requires BOTH refCode and the phone used at booking time           */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const refCode = typeof body?.refCode === "string" ? body.refCode.trim().toUpperCase() : "";
    const phone = typeof body?.phone === "string" ? body.phone.replace(/[-\s]/g, "") : "";

    if (!/^ADC-[A-Z0-9]{6,10}$/.test(refCode)) {
      return NextResponse.json(
        { error: "A valid reference code (ADC-XXXXXXXX) is required." },
        { status: 400 }
      );
    }
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please confirm the phone number used at booking." },
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

    /* Security: phone must match the booking phone */
    if (appointment.phone !== phone) {
      return NextResponse.json(
        { error: "Phone number does not match this booking. Please call us for help." },
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
    console.error("[appointments/cancel] error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again or call us directly." },
      { status: 500 }
    );
  }
}
