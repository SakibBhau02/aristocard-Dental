import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapFaq } from "@/lib/content/shared";
import { guard, readJson, bad, notFound, serverError, ok, s, os, b, clamp, clampLen } from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  Admin API — FAQ management (CRUD + reorder)                        */
/*  GET    /api/admin/faqs         → all FAQs (incl. inactive)         */
/*  POST   /api/admin/faqs         → create / update / reorder         */
/*         { action: "reorder", ids: [...] } reorders everything       */
/*  DELETE /api/admin/faqs?id=…    → remove                             */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  try {
    const rows = await db.faq.findMany({ orderBy: [{ sort: "asc" }, { updatedAt: "asc" }] });
    return NextResponse.json({ faqs: rows.map((r) => mapFaq(r as unknown as Record<string, unknown>)) });
  } catch (err) {
    return serverError("faqs", err);
  }
}

export async function POST(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  try {
    const body = await readJson(req);
    if (!body) return bad("A valid JSON body is required.");

    /* ---- reorder action ---- */
    if (s(body.action) === "reorder") {
      const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
      if (ids.length === 0) return bad("A non-empty ids array is required for reorder.");
      await db.$transaction(
        ids.map((id, i) => db.faq.update({ where: { id }, data: { sort: i } }))
      );
      const rows = await db.faq.findMany({ orderBy: [{ sort: "asc" }, { updatedAt: "asc" }] });
      return ok({ faqs: rows.map((r) => mapFaq(r as unknown as Record<string, unknown>)) }, "FAQ order saved.");
    }

    const id = os(body.id);
    const question = clampLen(s(body.question).trim(), 400);
    if (question.length < 5) return bad("Question must be at least 5 characters.");
    const answer = clampLen(s(body.answer).trim(), 3000);
    if (answer.length < 10) return bad("Answer must be at least 10 characters.");

    const data = {
      sort: Math.round(clamp(Number(body.sort ?? 999), 0, 9999)),
      question,
      questionBn: os(body.questionBn),
      answer,
      answerBn: os(body.answerBn),
      active: b(body.active, true),
    };

    if (id) {
      const existing = await db.faq.findUnique({ where: { id } });
      if (!existing) return notFound("No FAQ found with that id.");
      const row = await db.faq.update({ where: { id }, data });
      return ok({ faq: mapFaq(row as unknown as Record<string, unknown>), id }, "FAQ updated.");
    }
    const max = await db.faq.aggregate({ _max: { sort: true } });
    const row = await db.faq.create({ data: { ...data, sort: (max._max.sort ?? -1) + 1 } });
    return ok({ faq: mapFaq(row as unknown as Record<string, unknown>), id: row.id }, "FAQ created.");
  } catch (err) {
    return serverError("faqs", err);
  }
}

export async function DELETE(req: NextRequest) {
  const denied = guard(req);
  if (denied) return denied;
  try {
    const id = req.nextUrl.searchParams.get("id") ?? "";
    if (!id) return bad("An ?id= query parameter is required.");
    const existing = await db.faq.findUnique({ where: { id } });
    if (!existing) return notFound("No FAQ found with that id.");
    await db.faq.delete({ where: { id } });
    return ok({ id }, "FAQ deleted.");
  } catch (err) {
    return serverError("faqs", err);
  }
}
