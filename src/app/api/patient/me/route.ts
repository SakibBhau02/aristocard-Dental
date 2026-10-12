import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getPatientFromRequest,
  patientUnauthorized,
} from "@/lib/patient-auth";
import { dhakaToday } from "@/lib/admin-csv";

/* ------------------------------------------------------------------ */
/*  GET /api/patient/me — full logged-in dashboard payload              */
/*  Session cookie required. Returns:                                   */
/*    patient  — profile (no secrets)                                   */
/*    appointments — FULL history for the account phone (incl. notes,   */
/*                   source, timestamps) — richer than the anonymous    */
/*                   phone lookup on purpose                            */
/*    reviews  — review-form submissions matching this phone            */
/*    stats    — total / upcoming / completed / cancelled counts        */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  try {
    const patient = await getPatientFromRequest(req);
    if (!patient) return patientUnauthorized();

    const [appointments, reviews] = await Promise.all([
      db.appointment.findMany({
        where: { phone: patient.phone },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
      db.review.findMany({
        where: { phone: patient.phone },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          title: true,
          message: true,
          serviceSlug: true,
          approved: true,
          createdAt: true,
        },
      }),
    ]);

    const today = dhakaToday();
    const stats = {
      totalAppointments: appointments.length,
      upcoming: appointments.filter(
        (a) => a.date >= today && (a.status === "PENDING" || a.status === "CONFIRMED")
      ).length,
      completed: appointments.filter((a) => a.status === "COMPLETED").length,
      cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
      reviews: reviews.length,
    };

    return NextResponse.json(
      { patient, appointments, reviews, stats },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[patient/me] error:", err);
    return NextResponse.json(
      { error: "Could not load your dashboard. Please try again." },
      { status: 500 }
    );
  }
}
