import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guard, serverError, n, clamp } from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  Admin API — activity feed (audit log)                              */
/*  GET /api/admin/activity?limit=50[&entity=blog]                     */
/*  → { activity: [{ id, actor, actorLabel, role, action, entity,      */
/*                  label, createdAt }] }                              */
/*  Newest first. Readable by every signed-in staff member             */
/*  (EDITor+); writes only ever happen server-side.                    */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const limit = Math.round(clamp(n(req.nextUrl.searchParams.get("limit"), 50), 1, 200));
    const entity = req.nextUrl.searchParams.get("entity")?.trim();

    const rows = await db.adminActivity.findMany({
      where: entity ? { entity } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ activity: rows });
  } catch (err) {
    return serverError("activity", err);
  }
}
