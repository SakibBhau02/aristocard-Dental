import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { reviewsToCsv } from "@/lib/admin-csv";

/* ------------------------------------------------------------------ */
/*  Admin API — admin-protected review moderation                       */
/*  GET  /api/admin/reviews                                            */
/*        → JSON: list ALL reviews (incl. pending) + stats              */
/*        → CSV : ?format=csv exports every review                     */
/*  POST /api/admin/reviews  → { id, action: approve|reject|delete }    */
/*  Auth: valid x-admin-code header OR signed session cookie            */
/*        (issued by POST /api/admin/login)                             */
/* ------------------------------------------------------------------ */

const VALID_ACTIONS = ["create", "update", "approve", "reject", "delete"] as const;
type Action = (typeof VALID_ACTIONS)[number];

type ReviewFields = {
  name: string;
  rating: number;
  treatment: string | null;
  title: string | null;
  message: string;
  approved: boolean;
};

/* Shared validation for create/update — the admin panel and the API
   must agree on what a valid review looks like. */
function parseFields(body: Record<string, unknown>): ReviewFields | string {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const treatment = typeof body.treatment === "string" ? body.treatment.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const rating = typeof body.rating === "number" ? body.rating : NaN;

  if (name.length < 2 || name.length > 60) return "Patient name must be 2–60 characters.";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return "Rating must be a whole number from 1 to 5.";
  if (message.length < 10 || message.length > 600)
    return "Review text must be 10–600 characters.";
  if (treatment.length > 60) return "Treatment label must be 60 characters or fewer.";
  if (title.length > 80) return "Review title must be 80 characters or fewer.";

  return {
    name,
    rating,
    message,
    treatment: treatment || null,
    title: title || null,
    approved: body.approved !== false,
  };
}

async function isAuthorized(req: NextRequest): Promise<NextResponse | null> {
  /* Central RBAC gate (src/lib/admin-auth.ts) — session roles or passcode. */
  return requireAdminRole(req);
}

/* GET — list every review (newest first) + moderation stats. */
export async function GET(req: NextRequest) {
  try {
    const denied = await isAuthorized(req);
    if (denied) return denied;

    /* ---------------- CSV export branch ---------------- */
    if (req.nextUrl.searchParams.get("format") === "csv") {
      const rows = await db.review.findMany({
        orderBy: { createdAt: "desc" },
        take: 5000,
      });
      const csv = reviewsToCsv(rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="reviews-all.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    /* ---------------- JSON branch ---------------- */
    const [reviews, agg] = await Promise.all([
      db.review.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      /* Average rating shown to the public = over approved reviews only. */
      db.review.aggregate({
        where: { approved: true },
        _avg: { rating: true },
      }),
    ]);

    const approvedRows = reviews.filter((r) => r.approved);
    const stats = {
      total: reviews.length,
      pending: reviews.length - approvedRows.length,
      approved: approvedRows.length,
      average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
    };

    return NextResponse.json({ reviews, stats });
  } catch (err) {
    console.error("[admin/reviews] GET error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* POST — moderate a review { id, action } */
export async function POST(req: NextRequest) {
  try {
    const denied = await isAuthorized(req);
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 }
      );
    }
    const { id, action } = body ?? {};

    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Action must be one of: ${VALID_ACTIONS.join(", ")}.` },
        { status: 400 }
      );
    }

    /* ---- create / update: the owner writes the review by hand ---- */
    if (action === "create" || action === "update") {
      const fields = parseFields(body as Record<string, unknown>);
      if (typeof fields === "string") {
        return NextResponse.json({ error: fields }, { status: 400 });
      }
      if (action === "create") {
        const created = await db.review.create({ data: fields });
        return NextResponse.json({
          success: true,
          review: created,
          message: "Review added.",
        });
      }
      if (!id || typeof id !== "string" || id.length > 40) {
        return NextResponse.json({ error: "A valid review id is required." }, { status: 400 });
      }
      const exists = await db.review.findFirst({ where: { id } });
      if (!exists) {
        return NextResponse.json({ error: "No review found with that id." }, { status: 404 });
      }
      const updated = await db.review.update({ where: { id }, data: fields });
      return NextResponse.json({
        success: true,
        review: updated,
        message: "Review updated.",
      });
    }

    /* ---- moderation actions need an existing row ---- */
    if (!id || typeof id !== "string" || id.length > 40) {
      return NextResponse.json(
        { error: "A valid review id is required." },
        { status: 400 }
      );
    }

    const existing = await db.review.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "No review found with that id." },
        { status: 404 }
      );
    }

    if (action === "delete") {
      await db.review.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        id,
        action,
        message: "Review deleted.",
      });
    }

    const updated = await db.review.update({
      where: { id },
      data: { approved: action === "approve" },
    });

    return NextResponse.json({
      success: true,
      id,
      action,
      approved: updated.approved,
      message: `Review ${updated.approved ? "approved" : "un-approved"}.`,
    });
  } catch (err) {
    console.error("[admin/reviews] POST error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
