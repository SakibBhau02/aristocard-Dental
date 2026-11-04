import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services } from "@/lib/data/services";

/* ------------------------------------------------------------------ */
/*  /api/reviews — approved patient reviews (read only)                */
/*  GET → approved reviews, newest first, take 50 + aggregate          */
/*        optional ?service=<slug> filters the list                    */
/*                                                                     */
/*  The public site cannot submit reviews any more: every review is    */
/*  written and published from the admin panel (Admin → Reviews).      */
/* ------------------------------------------------------------------ */

const SERVICE_SLUGS = new Set(services.map((s) => s.slug));

/* GET — approved reviews only (newest first) + site-wide aggregate. */
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const service = params.get("service");
    const serviceFilter =
      service && SERVICE_SLUGS.has(service) ? service : null;

    const where = {
      approved: true,
      ...(serviceFilter ? { serviceSlug: serviceFilter } : {}),
    };

    const [reviews, agg] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      /* Site-wide aggregate is always over ALL approved reviews,
         regardless of the service filter on the list itself. */
      db.review.aggregate({
        where: { approved: true },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      reviews,
      aggregate: {
        average: agg._avg.rating
          ? Math.round(agg._avg.rating * 10) / 10
          : 0,
        count: agg._count._all,
      },
    });
  } catch (err) {
    console.error("[reviews] GET error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
