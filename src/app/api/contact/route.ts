import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  POST /api/contact — save a contact message                         */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body ?? {};

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
    if (subject && typeof subject !== "string" && subject.length > 200) {
      errors.push("Subject must be under 200 characters.");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    await db.contactMessage.create({
      data: {
        name: (name as string).trim(),
        email: (email as string).trim(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: (message as string).trim(),
      },
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
