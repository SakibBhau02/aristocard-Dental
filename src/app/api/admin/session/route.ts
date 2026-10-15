import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminActor,
} from "@/lib/admin-auth";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/session — is there a live staff session?            */
/*  → 200 { authenticated: true, user: {…}, expiresAt }                */
/*  → 401 { authenticated: false }                                     */
/*  The DB is re-checked, so deactivated or demoted accounts fail      */
/*  immediately, and role changes apply without re-login.              */
/* ------------------------------------------------------------------ */

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req).catch(() => null);
  if (!actor) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (actor.kind === "automation") {
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          sub: "automation",
          username: "automation",
          displayName: "Automation",
          role: "OWNER",
        },
        expiresAt: null,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const cookie = req.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  let expiresAt: number | null = null;
  try {
    const payload = JSON.parse(Buffer.from(cookie.split(".")[0], "base64url").toString("utf8"));
    if (typeof payload?.exp === "number") expiresAt = payload.exp;
  } catch {
    expiresAt = null;
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: actor.user,
      expiresAt,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
