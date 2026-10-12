import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getPatientFromRequest,
  patientUnauthorized,
  hashPassword,
  verifyPassword,
} from "@/lib/patient-auth";

/* ------------------------------------------------------------------ */
/*  PUT /api/patient/password — change password (session required)      */
/*  { currentPassword, newPassword }                                    */
/* ------------------------------------------------------------------ */

export async function PUT(req: NextRequest) {
  try {
    const session = await getPatientFromRequest(req);
    if (!session) return patientUnauthorized();

    const rl = checkRateLimit(`pat:pw:${getClientIp(req)}`, 5, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const body = await req.json().catch(() => null);
    const { currentPassword, newPassword } = body ?? {};
    if (
      !body ||
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return NextResponse.json(
        { error: "Current and new passwords are required." },
        { status: 400 }
      );
    }
    if (
      newPassword.length < 8 ||
      newPassword.length > 100 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return NextResponse.json(
        {
          error:
            "New password must be at least 8 characters and include both letters and numbers.",
        },
        { status: 400 }
      );
    }

    const patient = await db.patient.findUnique({ where: { id: session.id } });
    if (!patient || !verifyPassword(currentPassword, patient.passwordHash)) {
      return NextResponse.json(
        { error: "Your current password is incorrect." },
        { status: 403 }
      );
    }
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "The new password must be different from the current one." },
        { status: 400 }
      );
    }

    await db.patient.update({
      where: { id: patient.id },
      data: { passwordHash: hashPassword(newPassword) },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated. Use it next time you log in.",
    });
  } catch (err) {
    console.error("[patient/password] error:", err);
    return NextResponse.json(
      { error: "Could not change your password. Please try again." },
      { status: 500 }
    );
  }
}
