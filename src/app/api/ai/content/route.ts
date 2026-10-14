import { NextRequest, NextResponse } from "next/server";
import { getContentBundle } from "@/lib/content/server";
import { db } from "@/lib/db";
import { buildAiContentSnapshot, type AiRating } from "@/lib/ai/snapshot";
import { AI_CORS_HEADERS, AI_CONTENT_CACHE } from "@/lib/ai/core";

/* ------------------------------------------------------------------ */
/*  GET /api/ai/content — public machine-readable snapshot of the      */
/*  whole site (clinic identity, services, doctors, FAQs, blog quick-  */
/*  answers, smile cases, stats) for AI assistants & answer engines.   */
/*  Public, no auth, CORS * + 1h CDN cache.                            */
/*  ?include=full also emits blog article sections (and service        */
/*  overviews) for consumers that want depth.                          */
/* ------------------------------------------------------------------ */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const includeFull = req.nextUrl.searchParams.get("include") === "full";
    const [bundle, rating] = await Promise.all([
      getContentBundle(),
      liveRating(),
    ]);
    return NextResponse.json(
      buildAiContentSnapshot(bundle, { includeFull, rating }),
      {
        headers: {
          ...AI_CORS_HEADERS,
          "Cache-Control": AI_CONTENT_CACHE,
        },
      }
    );
  } catch (err) {
    console.error("[ai/content] GET error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500, headers: AI_CORS_HEADERS }
    );
  }
}

/* CORS preflight (agents fetching cross-origin from browsers). */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: AI_CORS_HEADERS });
}

/* Live aggregate over approved patient reviews; falls back to the
   clinic-reported figures when none are approved yet.               */
async function liveRating(): Promise<AiRating> {
  try {
    const agg = await db.review.aggregate({
      where: { approved: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    if (agg._count._all > 0 && agg._avg.rating) {
      return {
        average: Math.round(agg._avg.rating * 10) / 10,
        count: agg._count._all,
        source: "verified patient reviews on aristocratdentalcarebd.com",
      };
    }
  } catch {
    /* fall through to clinic-reported figures */
  }
  return {
    average: 4.9,
    count: 3200,
    source: "clinic-reported patient rating",
  };
}
