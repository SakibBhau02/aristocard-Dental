import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  appointmentsToCsv,
  describeRange,
  dhakaToday,
  isValidIsoDate,
  rangeFilePart,
} from "@/lib/admin-csv";

/* ------------------------------------------------------------------ */
/*  Admin API — admin-protected appointment management                 */
/*  GET  /api/admin/appointments                                        */
/*        → JSON: list + stats (+ date-range scoped, ?from&to&status)  */
/*        → CSV : ?format=csv exports the filtered set                  */
/*  POST /api/admin/appointments  → update status by refCode            */
/*  Auth: valid x-admin-code header OR signed session cookie            */
/*        (issued by POST /api/admin/login)                             */
/* ------------------------------------------------------------------ */

const VALID_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
type Status = (typeof VALID_STATUSES)[number];

async function isAuthorized(req: NextRequest): Promise<NextResponse | null> {
  /* Central RBAC gate (src/lib/admin-auth.ts) — session roles or passcode. */
  return requireAdminRole(req);
}

/* GET — list appointments (newest first) + summary stats.
   Optional query params:
     from / to : YYYY-MM-DD date-range filter (invalid values ignored)
     status    : limit the list to one status
     format=csv: return the filtered set as a CSV download instead       */
export async function GET(req: NextRequest) {
  try {
    const denied = await isAuthorized(req);
    if (denied) return denied;

    const params = req.nextUrl.searchParams;

    /* Date range — anything that isn't a valid calendar date is ignored. */
    let from = params.get("from");
    let to = params.get("to");
    if (from && !isValidIsoDate(from)) from = null;
    if (to && !isValidIsoDate(to)) to = null;

    /* Status filter (list only — stats stay a full range overview). */
    const statusParam = params.get("status");
    const statusFilter =
      statusParam && (VALID_STATUSES as readonly string[]).includes(statusParam)
        ? (statusParam as Status)
        : null;

    /* Shared date-range where (used by list, stats and CSV). */
    const dateWhere: Prisma.AppointmentWhereInput = {};
    if (from && to) dateWhere.date = { gte: from, lte: to };
    else if (from) dateWhere.date = { gte: from };
    else if (to) dateWhere.date = { lte: to };

    const where: Prisma.AppointmentWhereInput = {
      ...dateWhere,
      ...(statusFilter ? { status: statusFilter } : {}),
    };

    /* ---------------- CSV export branch ---------------- */
    if (params.get("format") === "csv") {
      const rows = await db.appointment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5000,
      });
      const csv = appointmentsToCsv(rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="appointments-${rangeFilePart(from, to)}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    /* ---------------- JSON branch ---------------- */
    const [appointments, rangeRows] = await Promise.all([
      db.appointment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      /* Stats are computed from the date-range-filtered set (status-agnostic),
         so the stat cards always give a full overview of the active range.  */
      db.appointment.findMany({
        where: dateWhere,
        select: { status: true, date: true },
      }),
    ]);

    const today = dhakaToday();
    const stats = {
      total: rangeRows.length,
      pending: rangeRows.filter((a) => a.status === "PENDING").length,
      confirmed: rangeRows.filter((a) => a.status === "CONFIRMED").length,
      completed: rangeRows.filter((a) => a.status === "COMPLETED").length,
      cancelled: rangeRows.filter((a) => a.status === "CANCELLED").length,
      today: rangeRows.filter((a) => a.date === today && a.status !== "CANCELLED").length,
      upcoming: rangeRows.filter(
        (a) => a.date >= today && (a.status === "PENDING" || a.status === "CONFIRMED")
      ).length,
    };

    const range =
      from || to
        ? {
            from,
            to,
            label: describeRange(from, to),
            total: rangeRows.length,
          }
        : null;

    return NextResponse.json({ appointments, stats, range });
  } catch (err) {
    console.error("[admin/appointments] GET error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* POST — update appointment status { refCode, status } */
export async function POST(req: NextRequest) {
  try {
    const denied = await isAuthorized(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 }
      );
    }
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
