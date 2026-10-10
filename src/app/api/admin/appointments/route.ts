import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Admin API — passcode-protected appointment management               */
/*  GET  /api/admin/appointments  → list + stats                        */
/*  POST /api/admin/appointments  → update status by refCode            */
/*  Auth: x-admin-code header must match ADMIN_PASSCODE                 */
/* ------------------------------------------------------------------ */

/* Demo passcode — override with ADMIN_PASSCODE env var in production. */
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE ?? "aristocrat-2026";

const VALID_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
type Status = (typeof VALID_STATUSES)[number];

function isAuthorized(req: NextRequest): boolean {
  const code = req.headers.get("x-admin-code") ?? "";
  return code.length > 0 && code === ADMIN_PASSCODE;
}

/* GET — list all appointments (newest first) + summary stats */
export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { error: "Invalid admin passcode." },
        { status: 401 }
      );
    }

    const statusFilter = req.nextUrl.searchParams.get("status");
    const where =
      statusFilter && (VALID_STATUSES as readonly string[]).includes(statusFilter)
        ? { status: statusFilter as Status }
        : {};

    const [appointments, all] = await Promise.all([
      db.appointment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      db.appointment.findMany({
        select: { status: true, date: true },
      }),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const stats = {
      total: all.length,
      pending: all.filter((a) => a.status === "PENDING").length,
      confirmed: all.filter((a) => a.status === "CONFIRMED").length,
      completed: all.filter((a) => a.status === "COMPLETED").length,
      cancelled: all.filter((a) => a.status === "CANCELLED").length,
      today: all.filter((a) => a.date === today && a.status !== "CANCELLED").length,
      upcoming: all.filter(
        (a) => a.date >= today && (a.status === "PENDING" || a.status === "CONFIRMED")
      ).length,
    };

    return NextResponse.json({ appointments, stats });
  } catch (err) {
    console.error("[admin/appointments] GET error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* POST — update appointment status { refCode, status } */
export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { error: "Invalid admin passcode." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { refCode, status } = body ?? {};

    if (!refCode || typeof refCode !== "string" || !/^ADC-[A-Z0-9]{6,10}$/.test(refCode.toUpperCase())) {
      return NextResponse.json(
        { error: "A valid reference code (ADC-XXXXXXXX) is required." },
        { status: 400 }
      );
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(", ")}.` },
        { status: 400 }
      );
    }

    const existing = await db.appointment.findFirst({
      where: { refCode: refCode.toUpperCase() },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "No appointment found with that reference code." },
        { status: 404 }
      );
    }

    const updated = await db.appointment.update({
      where: { id: existing.id },
      data: { status: status as Status },
    });

    return NextResponse.json({
      success: true,
      appointment: {
        refCode: updated.refCode,
        name: updated.name,
        status: updated.status,
      },
      message: `Appointment ${updated.refCode} marked ${status}.`,
    });
  } catch (err) {
    console.error("[admin/appointments] POST error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
