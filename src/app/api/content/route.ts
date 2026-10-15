import { NextRequest, NextResponse } from "next/server";
import { getContentBundle } from "@/lib/content/server";

/* ------------------------------------------------------------------ */
/*  Public content bundle — one GET powers the whole public site.      */
/*  GET /api/content → ContentBundle (doctors, posts, faqs, cases,     */
/*  services, heroSlides, home, about, settings)                        */
/* ------------------------------------------------------------------ */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const bundle = await getContentBundle();
    /* Freshness policy: admin panels MUST see their own writes instantly,
       so the default response is uncacheable. The public site benefits
       from a short CDN/browser window instead — opt in with ?cache=1.
       (Previously max-age=30 was always sent, so the admin panel's
       post-save refresh() kept replaying a stale bundle for ~30–90s —
       edits looked "lost" even though the database was already updated.) */
    const cacheable = req.nextUrl.searchParams.get("cache") === "1";
    return NextResponse.json(bundle, {
      headers: cacheable
        ? { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" }
        : { "Cache-Control": "no-store, max-age=0, must-revalidate" },
    });
  } catch (err) {
    console.error("[content] GET error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
