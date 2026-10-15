import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { notifyMessageSent } from "@/lib/integrations";

/* ------------------------------------------------------------------ */
/*  POST /api/contact — save a contact message                         */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    /* Rate limit FIRST so 429s never leak validation info */
    const rl = checkRateLimit(`contact:${getClientIp(req)}`, 3, 60 * 60 * 1000);
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
    const { name, email, phone, subject, message } = body ?? {};
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "A valid JSON request body is required." },
        { status: 400 }
      );
    }

    const errors: string[] = [];

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.push("Your name is required.");
    }
    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.push("A valid email address is required.");
    }
    if (phone && (typeof phone !== "string" || phone.replace(/\D/g, "").length < 6)) {
      errors.push("Please provide a valid phone number.");
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      errors.push("Your message must be at least 10 characters.");
    }
    if (message && typeof message === "string" && message.length > 2000) {
      errors.push("Message must be under 2000 characters.");
    }
    if (typeof subject !== "string" && subject !== undefined && subject !== null) {
      errors.push("Subject must be plain text.");
    } else if (typeof subject === "string" && subject.length > 200) {
      errors.push("Subject must be under 200 characters.");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    await db.contactMessage.create({
      data: {
        name: (name as string).trim(),
        email: (email as string).trim(),
        phone: typeof phone === "string" ? phone.trim() || null : null,
        subject: typeof subject === "string" ? subject.trim() || null : null,
        message: (message as string).trim(),
      },
    });

    /* Server-side analytics + optional Telegram alert (fail-silent). */
    await notifyMessageSent(req, {
      name: (name as string).trim(),
      email: (email as string).trim(),
      phone: typeof phone === "string" ? phone.trim() || null : null,
      subject: typeof subject === "string" ? subject.trim() || null : null,
      message: (message as string).trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message received. Our team will reply within a few hours.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[contact] POST error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again or call us directly." },
      { status: 500 }
    );
  }
}
