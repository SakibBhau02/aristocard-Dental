import { NextRequest, NextResponse } from "next/server";
import { getContentBundle } from "@/lib/content/server";
import { retrieveAnswers, type AskLang } from "@/lib/ai/retrieval";
import { AI_BASE, AI_CORS_HEADERS, AI_ASK_CACHE, AI_DOCS_URL } from "@/lib/ai/core";

/* ------------------------------------------------------------------ */
/*  GET /api/ai/ask?q=<dental question>[&lang=bn]                      */
/*  Lightweight retrieval endpoint for AI agents: keyword-scored       */
/*  top-5 matches across FAQs, treatments and blog quick-answers       */
/*  (English + বাংলা, deterministic, no external services).           */
/*  Public, no auth, CORS * + 10min CDN cache.                         */
/* ------------------------------------------------------------------ */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const q = (params.get("q") ?? "").trim();
    const lang: AskLang = params.get("lang") === "bn" ? "bn" : "en";

    if (q.length < 2) {
      return NextResponse.json(
        {
          error: "Missing or too-short query.",
          usage: "GET /api/ai/ask?q=<dental question>&lang=<en|bn>",
          example: `${AI_BASE}/api/ai/ask?q=how much do implants cost`,
          docs: AI_DOCS_URL,
        },
        { status: 400, headers: AI_CORS_HEADERS }
      );
    }
    if (q.length > 300) {
      return NextResponse.json(
        {
          error: "Query too long (max 300 characters).",
          usage: "GET /api/ai/ask?q=<dental question>&lang=<en|bn>",
          docs: AI_DOCS_URL,
        },
        { status: 400, headers: AI_CORS_HEADERS }
      );
    }

    const bundle = await getContentBundle();
    return NextResponse.json(retrieveAnswers(bundle, q, lang), {
      headers: {
        ...AI_CORS_HEADERS,
        "Cache-Control": AI_ASK_CACHE,
      },
    });
  } catch (err) {
    console.error("[ai/ask] GET error:", err);
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
