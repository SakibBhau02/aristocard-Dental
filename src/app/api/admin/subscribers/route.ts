import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { dhakaToday, subscribersToCsv } from "@/lib/admin-csv";

/* ------------------------------------------------------------------ */
/*  Admin API — newsletter subscribers                                  */
/*  GET /api/admin/subscribers → { subscribers, stats }  (?format=csv)  */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: "Invalid admin passcode." }, { status: 401 });
    }

    const rows = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    if (req.nextUrl.searchParams.get("format") === "csv") {
      const csv = subscribersToCsv(rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="newsletter-subscribers-${dhakaToday()}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const stats = {
      total: rows.length,
      last7Days: rows.filter((s) => now - s.createdAt.getTime() <= 7 * DAY).length,
      last30Days: rows.filter((s) => now - s.createdAt.getTime() <= 30 * DAY).length,
    };

    return NextResponse.json(
      { subscribers: rows, stats },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/subscribers] GET error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
