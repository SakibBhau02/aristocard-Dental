import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recordTrackingEvent } from "@/lib/integrations";

/* ------------------------------------------------------------------ */
/*  POST /api/track — public first-party analytics beacon              */
/*                                                                     */
/*  Accepts { type, path?, label?, session?, referrer?, meta? } from    */
/*  the client tracker. Rate-limited per IP, strictly allow-listed      */
/*  types, always answers 204 (sendBeacon ignores bodies anyway) so     */
/*  bad payloads never leak information.                                */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    /* 60 events per 5 minutes per IP — generous for humans, tight for loops */
    const rl = checkRateLimit(`trk:${getClientIp(req)}`, 60, 5 * 60 * 1000);
    if (!rl.allowed) {
      return new NextResponse(null, {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new NextResponse(null, { status: 204 });
    }

    const { type, path, label, session, referrer, meta } = body as Record<string, unknown>;
    if (typeof type !== "string") {
      return new NextResponse(null, { status: 204 });
    }

    /* Staff panel traffic is dropped — never analysed, never stored. */
    if (typeof path === "string" && path.startsWith("/admin")) {
      return new NextResponse(null, { status: 204 });
    }

    await recordTrackingEvent(req, {
      type,
      path: typeof path === "string" ? path : null,
      label: typeof label === "string" ? label : null,
      session: typeof session === "string" ? session : null,
      referrer: typeof referrer === "string" ? referrer : null,
      meta:
        meta && typeof meta === "object" && !Array.isArray(meta)
          ? (meta as Record<string, unknown>)
          : null,
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    /* never let analytics break anything */
    return new NextResponse(null, { status: 204 });
  }
}
