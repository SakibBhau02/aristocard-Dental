import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  POST /api/newsletter — subscribe an email                          */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
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
