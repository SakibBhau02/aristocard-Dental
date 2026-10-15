import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getPatientFromRequest,
  patientUnauthorized,
} from "@/lib/patient-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { notifyAppointmentRescheduled } from "@/lib/integrations";

/* ------------------------------------------------------------------ */
/*  POST /api/patient/reschedule — move YOUR OWN appointment to a      */
/*  new date/time slot.                                                 */
/*  { refCode, date, time, notes? } — the session is bound to the      */
/*  account phone, so the booking must belong to THAT phone (same     */
/*  ownership model as /api/patient/cancel). Status and refCode stay  */
/*  untouched; only the schedule (and optionally the patient note)    */
/*  changes.                                                            */
/* ------------------------------------------------------------------ */

/* Must stay byte-identical to the booking route's slot rule. */
const TIME_SLOT_RE =
  /^(10|11|12|02|03|04|05|06|07|08):[03]0 (AM|PM)$/;

const REF_RE = /^ADC-[A-Z0-9]{6,10}$/;

export async function POST(req: NextRequest) {
  try {
    /* Rate limit FIRST so 429s never leak validation info */
    const rl = checkRateLimit(
      `pat:resched:${getClientIp(req)}`,
      8,
      10 * 60 * 1000
    );
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait a few minutes and try again, or call us at 01715-027522.",
        },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const patient = await getPatientFromRequest(req);
    if (!patient) return patientUnauthorized();

    const body = await req.json().catch(() => null);
    const refCode =
      typeof body?.refCode === "string" ? body.refCode.trim().toUpperCase() : "";
    const date = typeof body?.date === "string" ? body.date.trim() : "";
    const time = typeof body?.time === "string" ? body.time.trim() : "";
    const notes =
      typeof body?.notes === "string" ? body.notes.trim().slice(0, 1000) : "";

    if (!REF_RE.test(refCode)) {
      return NextResponse.json(
        { error: "A valid reference code (ADC-XXXXXXXX) is required." },
        { status: 400 }
      );
    }

    /* Validation (mirrors the public booking POST) */
    const errors: string[] = [];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00`))) {
      errors.push("A valid new appointment date is required.");
    } else {
      const chosen = new Date(`${date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        errors.push("The new appointment date cannot be in the past.");
      }
    }
    if (!TIME_SLOT_RE.test(time)) {
      errors.push("Please choose a valid time slot.");
    }
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
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
        { error: "This appointment is cancelled — please book a new one instead." },
        { status: 409 }
      );
    }
    if (appointment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This appointment has already been completed." },
        { status: 409 }
      );
    }

    /* A past appointment cannot be pushed around after the fact. */
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(`${appointment.date}T00:00:00`) < today) {
      return NextResponse.json(
        { error: "Past appointments cannot be rescheduled — please book a new visit." },
        { status: 409 }
      );
    }

    /* Duplicate check: same phone + new date + new slot (status != CANCELLED).
       The appointment being moved itself is excluded, of course.          */
    const duplicate = await db.appointment.findFirst({
      where: {
        phone: patient.phone,
        date,
        time,
        status: { not: "CANCELLED" },
        id: { not: appointment.id },
      },
    });
    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "You already have another appointment booked for this date and time. Please choose a different slot or call us to reschedule.",
        },
        { status: 409 }
      );
    }

    const unchanged = appointment.date === date && appointment.time === time;
    if (unchanged) {
      return NextResponse.json(
        {
          error:
            "That is already the appointment's date and time — pick a new slot to reschedule.",
        },
        { status: 409 }
      );
    }

    const updated = await db.appointment.update({
      where: { id: appointment.id },
      data: {
        date,
        time,
        /* An optional note REPLACES the patient note (the dialog explains
           it as "tell us why / anything we should know").               */
        ...(notes ? { notes } : {}),
      },
    });

    /* Server-side analytics + Telegram alert (both fail silently — a
       reschedule must never break on either).                        */
    await notifyAppointmentRescheduled(req, {
      refCode: updated.refCode,
      name: updated.name,
      phone: updated.phone,
      oldDate: appointment.date,
      oldTime: appointment.time,
      newDate: updated.date,
      newTime: updated.time,
      serviceSlug: updated.serviceSlug,
      doctorSlug: updated.doctorSlug,
      notes: updated.notes,
    });

    /* Same select shape /api/patient/me returns for appointments. */
    return NextResponse.json(
      {
        success: true,
        appointment: {
          id: updated.id,
          refCode: updated.refCode,
          name: updated.name,
          phone: updated.phone,
          email: updated.email,
          date: updated.date,
          time: updated.time,
          doctorSlug: updated.doctorSlug,
          serviceSlug: updated.serviceSlug,
          notes: updated.notes,
          status: updated.status,
          source: updated.source,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
        message:
          "Your appointment has been rescheduled. We'll see you at the new time.",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[patient/reschedule] error:", err);
    return NextResponse.json(
      { error: "Could not reschedule the appointment. Please try again." },
      { status: 500 }
    );
  }
}
