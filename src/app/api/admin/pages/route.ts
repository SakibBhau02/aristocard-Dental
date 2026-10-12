import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultHomeContent, defaultAboutContent, defaultSettings, deepMerge } from "@/lib/content/shared";
import { guard, readJson, bad, serverError, ok, s, n } from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  Admin API — Page content blocks (Home / About) + Site settings     */
/*  GET  /api/admin/pages  → { home, about } merged over defaults      */
/*  POST /api/admin/pages  → { key: "home"|"about", data: {...} }      */
/* ------------------------------------------------------------------ */

const KEYS = ["home", "about"] as const;

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const rows = await db.pageBlock.findMany();
    const read = (key: string, fallback: unknown): unknown => {
      const row = rows.find((r) => r.key === key);
      if (!row) return fallback;
      try {
        const parsed = JSON.parse(row.dataJson);
        return parsed && typeof parsed === "object" ? deepMerge(fallback, parsed) : fallback;
      } catch {
        return fallback;
      }
    };
    return NextResponse.json({
      home: read("home", defaultHomeContent()),
      about: read("about", defaultAboutContent()),
    });
  } catch (err) {
    return serverError("pages", err);
  }
}

export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = await readJson(req);
    if (!body) return bad("A valid JSON body is required.");
    const key = s(body.key);
    if (!(KEYS as readonly string[]).includes(key)) return bad('key must be "home" or "about".');
    const data = body.data;
    if (!data || typeof data !== "object") return bad('A "data" object is required.');

    const serialized = JSON.stringify(data);
    if (serialized.length > 200_000) return bad("Page content is too large (200 KB limit).");

    await db.pageBlock.upsert({
      where: { key },
      create: { key, dataJson: serialized },
      update: { dataJson: serialized },
    });
    return ok(req, { key }, "Page content saved.");
  } catch (err) {
    return serverError("pages", err);
  }
}
