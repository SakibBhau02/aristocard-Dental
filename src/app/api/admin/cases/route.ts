import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapCase } from "@/lib/content/shared";
import {
  guard, readJson, bad, notFound, serverError, ok,
  s, os, n, b, strList, validSlug, clamp, clampLen,
} from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  Admin API — Smile Gallery case studies (full CRUD)                 */
/*  GET    /api/admin/cases        → all cases                         */
/*  POST   /api/admin/cases        → create (no id) / update (id)      */
/*  DELETE /api/admin/cases?id=…   → remove                             */
/* ------------------------------------------------------------------ */

const VALID_CATS = ["Cosmetic", "Orthodontics", "Restorative", "Preventive"] as const;

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const rows = await db.smileCase.findMany({ orderBy: [{ sort: "asc" }, { updatedAt: "asc" }] });
    return NextResponse.json({ cases: rows.map((r) => mapCase(r as unknown as Record<string, unknown>)) });
  } catch (err) {
    return serverError("cases", err);
  }
}

export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = await readJson(req);
    if (!body) return bad("A valid JSON body is required.");

    const id = os(body.id);
    const title = clampLen(s(body.title).trim(), 200);
    if (title.length < 4) return bad("Case title must be at least 4 characters.");

    const slug = os(body.slug) ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!validSlug(slug)) return bad("Slug must be lowercase letters, numbers and hyphens (2-80 chars).");

    const treatment = clampLen(s(body.treatment).trim(), 120);
    if (treatment.length < 2) return bad("Treatment name is required.");
    const beforeSrc = s(body.beforeSrc).trim();
    const afterSrc = s(body.afterSrc).trim();
    if (!beforeSrc.startsWith("/")) return bad("Before image path must start with / (e.g. /images/… or /uploads/…).");
    if (!afterSrc.startsWith("/")) return bad("After image path must start with / (e.g. /images/… or /uploads/…).");

    const categoryInput = s(body.category, "Cosmetic");
    const category = (VALID_CATS as readonly string[]).includes(categoryInput) ? categoryInput : "Cosmetic";
    const patient = clampLen(s(body.patient).trim(), 80);
    if (patient.length < 1) return bad("Patient label is required (e.g. \"R. Ahmed\").");
    const result = clampLen(s(body.result).trim(), 2000);
    if (result.length < 10) return bad("Result description must be at least 10 characters.");

    const data = {
      slug,
      sort: Math.round(clamp(n(body.sort, 0), 0, 9999)),
      treatment,
      category,
      serviceSlug: os(body.serviceSlug),
      beforeSrc,
      afterSrc,
      beforeAlt: os(body.beforeAlt),
      afterAlt: os(body.afterAlt),
      title,
      patient,
      age: Math.round(clamp(n(body.age, 30), 0, 120)),
      duration: clampLen(s(body.duration).trim(), 120),
      proceduresJson: JSON.stringify(strList(body.procedures)),
      result,
      featured: b(body.featured, false),
    };

    if (id) {
      const existing = await db.smileCase.findUnique({ where: { id } });
      if (!existing) return notFound("No case found with that id.");
      if (slug !== existing.slug) {
        const clash = await db.smileCase.findUnique({ where: { slug } });
        if (clash && clash.id !== id) return bad("Another case already uses that slug.");
      }
      const row = await db.smileCase.update({ where: { id }, data });
      return ok(req, { case: mapCase(row as unknown as Record<string, unknown>), id }, "Case updated.");
    }
    const clash = await db.smileCase.findUnique({ where: { slug } });
    if (clash) return bad("A case with that slug already exists.");
    const row = await db.smileCase.create({ data });
    return ok(req, { case: mapCase(row as unknown as Record<string, unknown>), id: row.id }, "Case created.");
  } catch (err) {
    return serverError("cases", err);
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const id = req.nextUrl.searchParams.get("id") ?? "";
    if (!id) return bad("An ?id= query parameter is required.");
    const existing = await db.smileCase.findUnique({ where: { id } });
    if (!existing) return notFound("No case found with that id.");
    await db.smileCase.delete({ where: { id } });
    return ok(req, { id }, "Case deleted.");
  } catch (err) {
    return serverError("cases", err);
  }
}
