import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { dhakaToday, patientsToCsv } from "@/lib/admin-csv";

/* ------------------------------------------------------------------ */
/*  Admin API — patient portal accounts                                 */
/*  GET /api/admin/patients             → { patients, stats } (csv too) */
/*  GET /api/admin/patients?phone=01…   → one account + their bookings  */
/*  (password hashes are NEVER selected or exported)                    */
/* ------------------------------------------------------------------ */

const PATIENT_SELECT = {
  id: true,
  name: true,
  phone: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: "Invalid admin passcode." }, { status: 401 });
    }

    /* ---- Single patient drill-down (?phone=) → account + bookings ---- */
    const phone = req.nextUrl.searchParams.get("phone")?.replace(/[-\s]/g, "");
    if (phone) {
      if (!/^01[3-9]\d{8}$/.test(phone)) {
        return NextResponse.json(
          { error: "A valid phone number is required." },
          { status: 400 }
        );
      }
      const [patient, appointments] = await Promise.all([
        db.patient.findUnique({ where: { phone }, select: PATIENT_SELECT }),
        db.appointment.findMany({
          where: { phone },
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        }),
      ]);
      if (!patient) {
        return NextResponse.json(
          { error: "No patient account found for that phone." },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { patient, appointments },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    /* ---- List + stats (or CSV) ---- */
    const [patients, appointmentGroups] = await Promise.all([
      db.patient.findMany({
        orderBy: { createdAt: "desc" },
        select: PATIENT_SELECT,
        take: 1000,
      }),
      db.appointment.groupBy({
        by: ["phone"],
        _count: { _all: true },
      }),
    ]);
    const countByPhone = new Map(
      appointmentGroups.map((g) => [g.phone, g._count._all])
    );

    if (req.nextUrl.searchParams.get("format") === "csv") {
      const csv = patientsToCsv(
        patients.map((p) => ({
          id: p.id,
          name: p.name,
          phone: p.phone,
          email: p.email,
          createdAt: p.createdAt,
          appointmentCount: countByPhone.get(p.phone) ?? 0,
        }))
      );
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="patient-accounts-${dhakaToday()}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const now = Date.now();
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    const stats = {
      total: patients.length,
      newThisWeek: patients.filter((p) => now - p.createdAt.getTime() <= WEEK).length,
      withAppointments: patients.filter((p) => (countByPhone.get(p.phone) ?? 0) > 0)
        .length,
    };

    return NextResponse.json(
      {
        patients: patients.map((p) => ({
          ...p,
          appointmentCount: countByPhone.get(p.phone) ?? 0,
        })),
        stats,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/patients] GET error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
