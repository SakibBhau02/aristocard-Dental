import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services } from "@/lib/data/services";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/* ------------------------------------------------------------------ */
/*  /api/reviews — public patient reviews                              */
/*  POST → submit a review (always PENDING moderation)                 */
/*  GET  → approved reviews, newest first, take 50 + aggregate         */
/*         optional ?service=<slug> filters the list                   */
/* ------------------------------------------------------------------ */

const SERVICE_SLUGS = new Set(services.map((s) => s.slug));

/* POST — public submission. Created with approved:false (moderation). */
export async function POST(req: NextRequest) {
  try {
    /* Rate limit FIRST so 429s never leak validation info */
    const rl = checkRateLimit(`review:${getClientIp(req)}`, 3, 60 * 60 * 1000);
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
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 }
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone =
      typeof body.phone === "string" ? body.phone.replace(/[-\s]/g, "") : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const serviceSlug =
      typeof body.serviceSlug === "string" && body.serviceSlug.trim()
        ? body.serviceSlug.trim()
        : null;
    const rating = typeof body.rating === "number" ? body.rating : NaN;

    if (name.length < 2 || name.length > 60) {
      return NextResponse.json(
        { error: "Please enter your name (2–60 characters)." },
        { status: 400 }
      );
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Please choose a star rating from 1 to 5." },
        { status: 400 }
      );
    }
    if (message.length < 10 || message.length > 600) {
      return NextResponse.json(
        { error: "Your review must be between 10 and 600 characters." },
        { status: 400 }
      );
    }
    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid Bangladeshi phone number (e.g. 01712-345678)." },
        { status: 400 }
      );
    }
    if (title.length > 80) {
      return NextResponse.json(
        { error: "Review title must be 80 characters or fewer." },
        { status: 400 }
      );
    }
    if (serviceSlug && !SERVICE_SLUGS.has(serviceSlug)) {
      return NextResponse.json(
        { error: "Please choose a treatment from the list." },
        { status: 400 }
      );
    }

    await db.review.create({
      data: {
        name,
        phone: phone || null,
        rating,
        serviceSlug,
        title: title || null,
        message,
        approved: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your review will appear after our team approves it.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[reviews] POST error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again or call us directly." },
      { status: 500 }
    );
  }
}

/* GET — approved reviews only (newest first) + site-wide aggregate. */
export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const service = params.get("service");
    const serviceFilter =
      service && SERVICE_SLUGS.has(service) ? service : null;

    const where = {
      approved: true,
      ...(serviceFilter ? { serviceSlug: serviceFilter } : {}),
    };

    const [reviews, agg] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      /* Site-wide aggregate is always over ALL approved reviews,
         regardless of the service filter on the list itself. */
      db.review.aggregate({
        where: { approved: true },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      reviews,
      aggregate: {
        average: agg._avg.rating
          ? Math.round(agg._avg.rating * 10) / 10
          : 0,
        count: agg._count._all,
      },
    });
  } catch (err) {
    console.error("[reviews] GET error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
