/* ------------------------------------------------------------------ */
/*  Public AI data API — shared constants.                              */
/*  Canonical origin mirrors src/app/sitemap.ts and the JSON-LD @ids     */
/*  (https://aristocratdentalcarebd.com) so every URL we emit for       */
/*  machines agrees with the URLs we already advertise to crawlers.     */
/* ------------------------------------------------------------------ */

export const AI_BASE = "https://aristocratdentalcarebd.com";

export const AI_DOCS_URL = `${AI_BASE}/llms.txt`;
export const AI_CONTENT_URL = `${AI_BASE}/api/ai/content`;
export const AI_ASK_URL = `${AI_BASE}/api/ai/ask?q=your+dental+question`;

/* CORS + cache policy for the public AI endpoints. AI agents fetch     */
/* cross-origin (no server-side proxy), hence the wildcard origin.      */
export const AI_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const AI_CONTENT_CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";
export const AI_ASK_CACHE = "public, s-maxage=600, stale-while-revalidate=3600";
