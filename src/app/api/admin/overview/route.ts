import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { dhakaToday } from "@/lib/admin-csv";
import { services } from "@/lib/data/services";

/* ------------------------------------------------------------------ */
/*  Admin API — combined overview for the dashboard home tab            */
/*  GET /api/admin/overview → cross-module stats + 14-day booking       */
/*  trend + status breakdown + top services + recent activity feed      */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  try {
    const denied = await requireAdminRole(req);
    if (denied) return denied;

    const today = dhakaToday();

    const [
      appointments,
      reviewRows,
      messages,
      subscribers,
      patients,
    ] = await Promise.all([
      db.appointment.findMany({
        select: { date: true, status: true, serviceSlug: true, createdAt: true },
      }),
      db.review.findMany({
        select: { rating: true, approved: true, createdAt: true },
      }),
      db.contactMessage.findMany({
        select: { handled: true, createdAt: true },
      }),
      db.newsletterSubscriber.count(),
      db.patient.count(),
    ]);

    /* ---- Appointment stats ---- */
    const appointmentStats = {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "PENDING").length,
      confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
      completed: appointments.filter((a) => a.status === "COMPLETED").length,
      cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
      today: appointments.filter((a) => a.date === today && a.status !== "CANCELLED")
        .length,
      upcoming: appointments.filter(
        (a) => a.date >= today && (a.status === "PENDING" || a.status === "CONFIRMED")
      ).length,
    };

    /* ---- 14-day booking-created trend (by createdAt, Dhaka day) ---- */
    const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" });
    const trend: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      trend.push({ date: dayFmt.format(d), count: 0 });
    }
    const trendIndex = new Map(trend.map((t) => [t.date, t]));
    for (const a of appointments) {
      const key = dayFmt.format(a.createdAt);
      const bucket = trendIndex.get(key);
      if (bucket) bucket.count += 1;
    }

    /* ---- Top services by booking count ---- */
    const byService = new Map<string, number>();
    for (const a of appointments) {
      const key = a.serviceSlug ?? "general-consultation";
      byService.set(key, (byService.get(key) ?? 0) + 1);
    }
    const serviceNames = new Map(services.map((s) => [s.slug, s.shortName]));
    const topServices = [...byService.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([slug, count]) => ({
        slug,
        name: serviceNames.get(slug) ?? "General Consultation",
        count,
      }));

    /* ---- Reviews / messages / subscribers / patients ---- */
    const approvedReviews = reviewRows.filter((r) => r.approved);
    const reviewStats = {
      total: reviewRows.length,
      pendingApproval: reviewRows.filter((r) => !r.approved).length,
      approved: approvedReviews.length,
      avgRating:
        approvedReviews.length > 0
          ? Math.round(
              (approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
                approvedReviews.length) *
                10
            ) / 10
          : 0,
    };
    const messageStats = {
      total: messages.length,
      unhandled: messages.filter((m) => !m.handled).length,
    };

    return NextResponse.json(
      {
        appointmentStats,
        reviewStats,
        messageStats,
        subscriberStats: { total: subscribers },
        patientStats: { total: patients },
        trend,
        topServices,
        generatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/overview] GET error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
