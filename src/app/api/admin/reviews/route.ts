import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewsToCsv } from "@/lib/admin-csv";

/* ------------------------------------------------------------------ */
/*  Admin API — passcode-protected review moderation                    */
/*  GET  /api/admin/reviews                                            */
/*        → JSON: list ALL reviews (incl. pending) + stats              */
/*        → CSV : ?format=csv exports every review                     */
/*  POST /api/admin/reviews  → { id, action: approve|reject|delete }    */
/*  Auth: x-admin-code header must match ADMIN_PASSCODE                 */
/* ------------------------------------------------------------------ */

/* Demo passcode — override with ADMIN_PASSCODE env var in production. */
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE ?? "aristocrat-2026";

const VALID_ACTIONS = ["approve", "reject", "delete"] as const;
type Action = (typeof VALID_ACTIONS)[number];

function isAuthorized(req: NextRequest): boolean {
  const code = req.headers.get("x-admin-code") ?? "";
  return code.length > 0 && code === ADMIN_PASSCODE;
}

/* GET — list every review (newest first) + moderation stats. */
export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { error: "Invalid admin passcode." },
        { status: 401 }
      );
    }

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
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { error: "Invalid admin passcode." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 }
      );
    }
    const { id, action } = body ?? {};

    if (!id || typeof id !== "string" || id.length > 40) {
      return NextResponse.json(
        { error: "A valid review id is required." },
        { status: 400 }
      );
    }
    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Action must be one of: ${VALID_ACTIONS.join(", ")}.` },
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
