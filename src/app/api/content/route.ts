import { NextResponse } from "next/server";
import { getContentBundle } from "@/lib/content/server";

/* ------------------------------------------------------------------ */
/*  Public content bundle — one GET powers the whole public site.      */
/*  GET /api/content → ContentBundle (doctors, posts, faqs, cases,     */
/*  services, heroSlides, home, about, settings)                        */
/* ------------------------------------------------------------------ */

export async function GET() {
  try {
    const bundle = await getContentBundle();
    return NextResponse.json(bundle, {
      headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[content] GET error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
