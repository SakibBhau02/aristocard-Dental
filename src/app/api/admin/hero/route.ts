import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapHeroSlide } from "@/lib/content/shared";
import { guard, readJson, bad, notFound, serverError, ok, s, os, b, n, clamp, clampLen } from "@/lib/content/admin-api";
import { parseYouTubeId } from "@/lib/data/hero-media";

/* ------------------------------------------------------------------ */
/*  Admin API — Home hero slides (images + YouTube videos)            */
/*  GET  /api/admin/hero  → { slides }                                */
/*  POST /api/admin/hero  → create/update slide ({id?, kind, src…})   */
/*         { action:"reorder", ids:[…] } reorders                     */
/*  DELETE ?id=… removes a slide                                      */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  try {
    const rows = await db.heroSlide.findMany({ where: { scope: "home" }, orderBy: [{ sort: "asc" }, { updatedAt: "asc" }] });
    return NextResponse.json({
      slides: rows.map((r) => mapHeroSlide(r as unknown as Record<string, unknown>)),
    });
  } catch (err) {
    return serverError("hero", err);
  }
}

export async function POST(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  try {
    const body = await readJson(req);
    if (!body) return bad("A valid JSON body is required.");

    /* ---- reorder ---- */
    if (s(body.action) === "reorder") {
      const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
      if (ids.length === 0) return bad("A non-empty ids array is required.");
      await db.$transaction(ids.map((id, i) => db.heroSlide.update({ where: { id }, data: { sort: i } })));
      return ok({}, "Slide order saved.");
    }

    /* ---- slide create / update ---- */
    const id = os(body.id);
    const kind = s(body.kind) === "youtube" ? "youtube" : "image";
    const src = clampLen(s(body.src).trim(), 500);
    if (!src) return bad("An image path or YouTube URL is required.");
    if (kind === "image" && !src.startsWith("/")) return bad("Image path must start with / (upload an image first).");
    if (kind === "youtube" && !parseYouTubeId(src)) return bad("That does not look like a valid YouTube link.");

    const data = {
      scope: "home",
      sort: Math.round(clamp(n(body.sort, 0), 0, 999)),
      kind,
      src,
      alt: os(body.alt),
      active: b(body.active, true),
    };

    if (id) {
      const existing = await db.heroSlide.findUnique({ where: { id } });
      if (!existing) return notFound("No slide found with that id.");
      const row = await db.heroSlide.update({ where: { id }, data });
      return ok({ slide: mapHeroSlide(row as unknown as Record<string, unknown>) }, "Slide updated.");
    }
    const max = await db.heroSlide.aggregate({ where: { scope: "home" }, _max: { sort: true } });
    const row = await db.heroSlide.create({ data: { ...data, sort: (max._max.sort ?? -1) + 1 } });
    return ok({ slide: mapHeroSlide(row as unknown as Record<string, unknown>), id: row.id }, "Slide added.");
  } catch (err) {
    return serverError("hero", err);
  }
}

export async function DELETE(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  try {
    const id = req.nextUrl.searchParams.get("id") ?? "";
    if (!id) return bad("An ?id= query parameter is required.");
    const existing = await db.heroSlide.findUnique({ where: { id } });
    if (!existing) return notFound("No slide found with that id.");
    await db.heroSlide.delete({ where: { id } });
    return ok({ id }, "Slide removed.");
  } catch (err) {
    return serverError("hero", err);
  }
}
