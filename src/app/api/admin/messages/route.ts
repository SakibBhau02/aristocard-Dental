import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { dhakaToday, messagesToCsv } from "@/lib/admin-csv";

/* ------------------------------------------------------------------ */
/*  Admin API — contact-message inbox                                   */
/*  GET  /api/admin/messages  → { messages, stats }  (?format=csv)      */
/*  POST /api/admin/messages  → { id, handled } mark handled / new      */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: "Invalid admin passcode." }, { status: 401 });
    }

    const rows = await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    if (req.nextUrl.searchParams.get("format") === "csv") {
      const csv = messagesToCsv(rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="contact-messages-${dhakaToday()}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const today = dhakaToday();
    const stats = {
      total: rows.length,
      unhandled: rows.filter((m) => !m.handled).length,
      handled: rows.filter((m) => m.handled).length,
      today: rows.filter(
        (m) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(m.createdAt) === today
      ).length,
    };

    return NextResponse.json(
      { messages: rows, stats },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[admin/messages] GET error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* POST — toggle handled flag { id, handled } */
export async function POST(req: NextRequest) {
  try {
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: "Invalid admin passcode." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const { id, handled } = body ?? {};
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "A message id is required." },
        { status: 400 }
      );
    }
    if (typeof handled !== "boolean") {
      return NextResponse.json(
        { error: "`handled` must be true or false." },
        { status: 400 }
      );
    }

    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "No message found with that id." },
        { status: 404 }
      );
    }

    const updated = await db.contactMessage.update({
      where: { id },
      data: { handled },
    });

    return NextResponse.json({
      success: true,
      message: updated.handled ? "Marked as handled." : "Marked as new.",
      id: updated.id,
      handled: updated.handled,
    });
  } catch (err) {
    console.error("[admin/messages] POST error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
