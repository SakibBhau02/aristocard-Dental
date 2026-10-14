import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-auth";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { services } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";
import {
  appointmentsToCsv,
  describeRange,
  dhakaToday,
  isValidIsoDate,
  rangeFilePart,
} from "@/lib/admin-csv";
import { bad, notFound, ok, readJson, serverError } from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  Admin API — admin-protected appointment management                 */
/*  GET  /api/admin/appointments                                        */
/*        → JSON: list + stats (+ date-range scoped, ?from&to&status)  */
/*        → CSV : ?format=csv exports the filtered set                  */
/*  POST /api/admin/appointments  → update status / schedule / lead      */
/*        fields by refCode (see the POST body contract below)          */
/*  Auth: valid x-admin-code header OR signed session cookie            */
/*        (issued by POST /api/admin/login)                             */
/* ------------------------------------------------------------------ */

const VALID_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;
type Status = (typeof VALID_STATUSES)[number];

/* Must stay byte-identical to the public booking route's slot rule. */
const TIME_SLOT_RE =
  /^(10|11|12|02|03|04|05|06|07|08):[03]0 (AM|PM)$/;

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

/* POST — update appointment fields { refCode, status?, date?, time?, … }

   Every field is optional, but at least one must be present — this one
   endpoint covers the whole daily lead lifecycle:
     • status      confirm / complete / cancel / reopen (the classic path)
     • date + time reschedule the visit (validated like the public POST)
     • doctorSlug / serviceSlug  re-assign ("" clears back to unassigned)
     • followUpDate  the next day the front desk should call ("" clears)
     • adminNotes    internal working notes ≤2000 chars ("" clears)

   Successes flow through the shared ok() helper so every change is
   audit-logged into the Activity Log automatically.                     */
export async function POST(req: NextRequest) {
  try {
    const denied = await isAuthorized(req);
    if (denied) return denied;

    const body = await readJson(req);
    if (!body) {
      return bad("A valid JSON request body is required.");
    }
    const refCode = typeof body.refCode === "string" ? body.refCode.trim().toUpperCase() : "";
    if (!/^ADC-[A-Z0-9]{6,10}$/.test(refCode)) {
      return bad("A valid reference code (ADC-XXXXXXXX) is required.");
    }

    const str = (key: string) => (typeof body[key] === "string" ? (body[key] as string).trim() : null);

    const status = str("status");
    const date = str("date");
    const time = str("time");
    const doctorSlug = str("doctorSlug");
    const serviceSlug = str("serviceSlug");
    const followUpDate = str("followUpDate");
    const adminNotes = str("adminNotes");

    const touched =
      status !== null ||
      date !== null ||
      time !== null ||
      doctorSlug !== null ||
      serviceSlug !== null ||
      followUpDate !== null ||
      adminNotes !== null;
    if (!touched) {
      return bad(
        "Provide at least one field to update (status, date, time, doctorSlug, serviceSlug, followUpDate or adminNotes)."
      );
    }

    /* Validation — mirrors the public booking POST where applicable. */
    if (status !== null && status !== "" && !VALID_STATUSES.includes(status as Status)) {
      return bad(`Status must be one of: ${VALID_STATUSES.join(", ")}.`);
    }
    if (date !== null && date !== "") {
      if (!isValidIsoDate(date)) return bad("Date must be a valid YYYY-MM-DD calendar date.");
      if (date < dhakaToday()) return bad("Appointment date cannot be in the past.");
    }
    if (time !== null && time !== "" && !TIME_SLOT_RE.test(time)) {
      return bad("Time must be one of the clinic's half-hour slots (e.g. 10:30 AM).");
    }
    if (doctorSlug && !doctors.some((d) => d.slug === doctorSlug)) {
      return bad("Unknown doctor selected.");
    }
    if (serviceSlug && !services.some((s) => s.slug === serviceSlug)) {
      return bad("Unknown service selected.");
    }
    if (followUpDate && !isValidIsoDate(followUpDate)) {
      return bad("Follow-up date must be a valid YYYY-MM-DD calendar date (or empty to clear).");
    }
    if (adminNotes !== null && adminNotes.length > 2000) {
      return bad("Admin notes must be under 2000 characters.");
    }

    const existing = await db.appointment.findFirst({
      where: { refCode },
    });
    if (!existing) {
      return notFound("No appointment found with that reference code.");
    }

    /* Build a sparse update — only the provided keys change. Empty strings
       clear optional fields (doctor/service/follow-up/admin notes).       */
    const data: Prisma.AppointmentUpdateInput = {};
    if (status) data.status = status;
    if (date !== null && date !== "") data.date = date;
    if (time !== null && time !== "") data.time = time;
    if (doctorSlug !== null) data.doctorSlug = doctorSlug || null;
    if (serviceSlug !== null) data.serviceSlug = serviceSlug || null;
    if (followUpDate !== null) data.followUpDate = followUpDate || null;
    if (adminNotes !== null) data.adminNotes = adminNotes || null;

    const updated = await db.appointment.update({
      where: { id: existing.id },
      data,
    });

    /* Human-friendly audit message describing what changed. */
    const changes: string[] = [];
    if (status) changes.push(`marked ${status}`);
    if (date && date !== existing.date) changes.push(`moved to ${date} ${updated.time}`);
    else if (time && time !== existing.time) changes.push(`moved to ${updated.date} ${time}`);
    if (doctorSlug !== null && (doctorSlug || null) !== existing.doctorSlug)
      changes.push("doctor reassigned");
    if (serviceSlug !== null && (serviceSlug || null) !== existing.serviceSlug)
      changes.push("treatment updated");
    if (followUpDate !== null && (followUpDate || null) !== existing.followUpDate)
      changes.push(followUpDate ? `follow-up ${followUpDate}` : "follow-up cleared");
    if (adminNotes !== null && (adminNotes || null) !== existing.adminNotes)
      changes.push("lead notes updated");
    const summary = changes.length ? changes.join(" · ") : "no changes";

    return ok(
      req,
      { appointment: updated, id: updated.refCode },
      `Appointment ${updated.refCode} ${summary}.`
    );
  } catch (err) {
    return serverError("appointments", err);
  }
}
