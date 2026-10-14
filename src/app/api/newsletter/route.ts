import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { notifyNewsletterSignup } from "@/lib/integrations";

/* ------------------------------------------------------------------ */
/*  POST /api/newsletter — subscribe an email                          */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    /* Rate limit FIRST so 429s never leak validation info */
    const rl = checkRateLimit(`news:${getClientIp(req)}`, 3, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait a few minutes and try again, or call us at 01715-027522.",
        },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const body = await req.json().catch(() => null);
    const { email } = body ?? {};
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 }
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalized = email.trim().toLowerCase();

    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: normalized },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "You're already on our list — thanks for being with us!",
      });
    }

    await db.newsletterSubscriber.create({
      data: { email: normalized },
    });

    /* First-party analytics event (no Telegram — keeps alerts signal-only). */
    await notifyNewsletterSignup(req);

    return NextResponse.json(
      {
        success: true,
        message: "Subscribed! Dental health tips are on their way.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[newsletter] POST error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
