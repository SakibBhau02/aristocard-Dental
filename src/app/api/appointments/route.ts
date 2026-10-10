import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/* ------------------------------------------------------------------ */
/*  POST /api/appointments — create a new appointment booking          */
/* ------------------------------------------------------------------ */

function generateRefCode(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `ADC-${stamp}${rand}`;
}

const TIME_SLOT_RE =
  /^(10|11|12|02|03|04|05|06|07|08):[03]0 (AM|PM)$/;

export async function POST(req: NextRequest) {
  try {
    /* Rate limit FIRST so 429s never leak validation info */
    const rl = checkRateLimit(`apt:${getClientIp(req)}`, 5, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait a few minutes and try again, or call us at 01715-027522.",
        },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const body = await req.json().catch(() => null);
    const {
      name,
      phone,
      email,
      date,
      time,
      doctorSlug,
      serviceSlug,
      notes,
    } = body ?? {};
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 }
      );
    }

    /* Validation */
    const errors: string[] = [];

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.push("Patient name is required (min 2 characters).");
    }
    if (!phone || typeof phone !== "string") {
      errors.push("Phone number is required.");
    } else {
      const normalized = phone.replace(/[-\s]/g, "");
      if (!/^01[3-9]\d{8}$/.test(normalized)) {
        errors.push("Please provide a valid Bangladeshi mobile number (e.g. 01712345678).");
      }
    }
    if (email && (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      errors.push("Please provide a valid email address.");
    }
    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push("A valid appointment date is required.");
    } else {
      const chosen = new Date(`${date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        errors.push("Appointment date cannot be in the past.");
      }
    }
    if (!time || typeof time !== "string" || !TIME_SLOT_RE.test(time)) {
      errors.push("Please choose a valid time slot.");
    }
    if (serviceSlug && !services.some((s) => s.slug === serviceSlug)) {
      errors.push("Unknown service selected.");
    }
    if (doctorSlug && !doctors.some((d) => d.slug === doctorSlug)) {
      errors.push("Unknown doctor selected.");
    }
    if (typeof notes !== "string" && notes !== undefined && notes !== null) {
      errors.push("Notes must be plain text.");
    } else if (typeof notes === "string" && notes.trim().length > 1000) {
      errors.push("Notes must be under 1000 characters.");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors[0], errors },
        { status: 400 }
      );
    }

    /* Duplicate check: same phone + same date + same slot */
    const normalizedPhone = (phone as string).replace(/[-\s]/g, "");
    const duplicate = await db.appointment.findFirst({
      where: {
        phone: normalizedPhone,
        date,
        time,
        status: { not: "CANCELLED" },
      },
    });
    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "You already have an appointment booked for this date and time. Please choose a different slot or call us to reschedule.",
        },
        { status: 409 }
      );
    }

    const appointment = await db.appointment.create({
      data: {
        refCode: generateRefCode(),
        name: (name as string).trim(),
        phone: normalizedPhone,
        email: typeof email === "string" ? email.trim() || null : null,
        date,
        time,
        doctorSlug: typeof doctorSlug === "string" ? doctorSlug || null : null,
        serviceSlug: typeof serviceSlug === "string" ? serviceSlug || null : null,
        notes: typeof notes === "string" ? notes.trim() || null : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        id: appointment.refCode,
        appointment: {
          refCode: appointment.refCode,
          name: appointment.name,
          date: appointment.date,
          time: appointment.time,
          status: appointment.status,
        },
        message:
          "Appointment request received. Our team will call to confirm your slot.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[appointments] POST error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again or call us directly." },
      { status: 500 }
    );
  }
}

/* GET /api/appointments?ref=ADC-XXXX | ?phone=01XXXXXXXXX — lookup bookings (privacy-safe) */
export async function GET(req: NextRequest) {
  try {
    const ref = req.nextUrl.searchParams.get("ref")?.trim().toUpperCase();
    const phone = req.nextUrl.searchParams.get("phone")?.replace(/[-\s]/g, "");

    const select = {
      refCode: true,
      name: true,
      date: true,
      time: true,
      status: true,
      serviceSlug: true,
      doctorSlug: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    };

    /* Lookup by reference code */
    if (ref) {
      if (!/^ADC-[A-Z0-9]{6,10}$/.test(ref)) {
        return NextResponse.json(
          { error: "Reference codes look like ADC-XXXXXXXX. Please check and try again." },
          { status: 400 }
        );
      }
      const appointment = await db.appointment.findFirst({
        where: { refCode: ref },
        select,
      });
      if (!appointment) {
        return NextResponse.json(
          { error: "No appointment found with that reference code." },
          { status: 404 }
        );
      }
      return NextResponse.json({ appointments: [appointment] });
    }

    /* Lookup by phone */
    if (!phone || !/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "A valid phone number (e.g. 01712345678) is required." },
        { status: 400 }
      );
    }
    const appointments = await db.appointment.findMany({
      where: { phone },
      select,
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json({ appointments });
  } catch (err) {
    console.error("[appointments] GET error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
