import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard, serverError, ok } from "@/lib/content/admin-api";
import { getIntegrations } from "@/lib/integrations";

/* ------------------------------------------------------------------ */
/*  Admin API — Analytics (first-party server-side tracking)           */
/*                                                                     */
/*  GET    /api/admin/analytics?days=7|30|90 → aggregated dashboard    */
/*  DELETE /api/admin/analytics            → purge all events (OWNER)  */
/*                                                                     */
/*  Everything is computed in JS from a slim projection of the range   */
/*  (id/type/path/label/session/device/referrer/createdAt) — SQLite    */
/*  stays happy and the shapes stay exact.                             */
/* ------------------------------------------------------------------ */

const MAX_DAYS = 90;

function dayKey(d: Date, tzHours: number): string {
  const local = new Date(d.getTime() + tzHours * 3_600_000);
  return local.toISOString().slice(0, 10);
}

function hostOf(referrer: string): string | null {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function tally(list: string[], top: number): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of list) {
    if (!item) continue;
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label, count]) => ({ label, count }));
}

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const daysRaw = Number(req.nextUrl.searchParams.get("days") ?? 30);
    const days = Math.min(MAX_DAYS, Math.max(1, Number.isFinite(daysRaw) ? daysRaw : 30));

    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [rows, totalCount, cfg] = await Promise.all([
      db.trackingEvent.findMany({
        where: { createdAt: { gte: from } },
        select: {
          type: true,
          path: true,
          label: true,
          session: true,
          device: true,
          referrer: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50_000,
      }),
      db.trackingEvent.count(),
      getIntegrations(),
    ]);

    /* Client-side local timezone of the ADMIN browser (so the day chart
       matches what the viewer expects). Defaults to clinic time (UTC+6). */
    const tzParam = Number(req.nextUrl.searchParams.get("tz") ?? 6);
    const tz = Number.isFinite(tzParam) ? Math.max(-14, Math.min(14, tzParam)) : 6;

    const summary = {
      pageViews: 0,
      sessions: new Set<string>(),
      searches: 0,
      bookingClicks: 0,
      callClicks: 0,
      appointments: 0,
      messages: 0,
      reviews: 0,
      newsletter: 0,
      languageToggles: 0,
    };
    const daily = new Map<string, { pageViews: number; events: number; appointments: number }>();
    const paths: string[] = [];
    const searches: string[] = [];
    const referrers: string[] = [];

    /* zero-fill every day in the range first */
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      daily.set(dayKey(d, tz), { pageViews: 0, events: 0, appointments: 0 });
    }

    for (const r of rows) {
      if (r.session) summary.sessions.add(r.session);
      switch (r.type) {
        case "page_view":
          summary.pageViews++;
          if (r.path) paths.push(r.path);
          break;
        case "search":
          summary.searches++;
          if (r.label) searches.push(r.label.toLowerCase());
          break;
        case "booking_click":
          summary.bookingClicks++;
          break;
        case "cta_call":
        case "cta_whatsapp":
          summary.callClicks++;
          break;
        case "appointment_booked":
          summary.appointments++;
          break;
        case "message_sent":
          summary.messages++;
          break;
        case "review_submitted":
          summary.reviews++;
          break;
        case "newsletter_signup":
          summary.newsletter++;
          break;
        case "language":
          summary.languageToggles++;
          break;
      }
      if (r.referrer) {
        const host = hostOf(r.referrer);
        if (host && host !== "aristocratdentalcarebd.com" && !host.includes("localhost")) {
          referrers.push(host);
        }
      }
      const key = dayKey(r.createdAt, tz);
      const bucket = daily.get(key);
      if (bucket) {
        bucket.events++;
        if (r.type === "page_view") bucket.pageViews++;
        if (r.type === "appointment_booked") bucket.appointments++;
      }
    }

    const recent = rows.slice(0, 30).map((r) => ({
      type: r.type,
      path: r.path,
      label: r.label,
      device: r.device,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        days,
        totalEventsStored: totalCount,
        trackingEnabled: cfg.trackingEnabled,
        integrations: {
          ga4: Boolean(cfg.ga4Id),
          gtm: Boolean(cfg.gtmId),
          facebook: Boolean(cfg.fbPixelId),
          tiktok: Boolean(cfg.tiktokPixelId),
          telegram: Boolean(cfg.telegramBotToken && cfg.telegramChatId),
        },
        summary: {
          ...summary,
          sessions: summary.sessions.size,
        },
        daily: [...daily.entries()].map(([date, v]) => ({ date, ...v })),
        topPages: tally(paths, 8),
        topSearches: tally(searches, 8),
        referrers: tally(referrers, 6),
        devices: tally(rows.map((r) => r.device ?? "unknown"), 5),
        recent,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return serverError("analytics", err);
  }
}

/* Purge every stored event (OWNER only via OWNER_ONLY_MUTATIONS). */
export async function DELETE(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    await db.trackingEvent.deleteMany({});
    return ok(req, {}, "Analytics data cleared.");
  } catch (err) {
    return serverError("analytics", err);
  }
}
