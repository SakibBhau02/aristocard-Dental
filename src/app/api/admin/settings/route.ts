import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultSettings, type SiteSettings } from "@/lib/content/shared";
import { guard, readJson, bad, serverError, ok, s, n, strList, clampLen } from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  Admin API — Site settings (clinic contact info, socials, hero      */
/*  YouTube video URLs). Merged over defaults like the page blocks.    */
/*  GET  /api/admin/settings  → merged settings                        */
/*  POST /api/admin/settings  → full settings object                   */
/* ------------------------------------------------------------------ */

function sanitizeSettings(raw: Record<string, unknown>): Record<string, unknown> {
  const heroVideoUrls = strList(raw.heroVideoUrls)
    .map((u) => clampLen(u.trim(), 300))
    .filter((u) => u.length > 5)
    .slice(0, 6);
  const url = (v: unknown, fallback: string): string => {
    const sv = s(v).trim();
    return /^https?:\/\//.test(sv) ? clampLen(sv, 300) : fallback;
  };
  return {
    name: clampLen(s(raw.name).trim() || "Aristocrat Dental Care & Orthodontic Center", 150),
    shortName: clampLen(s(raw.shortName).trim() || "Aristocrat Dental Care", 80),
    tagline: clampLen(s(raw.tagline).trim() || "Excellence in Every Smile!", 120),
    taglineBn: clampLen(s(raw.taglineBn).trim(), 120) || undefined,
    phone: clampLen(s(raw.phone).trim() || "01715-027522", 30),
    phoneRaw: clampLen(s(raw.phoneRaw).trim() || "+8801715027522", 30),
    emergencyPhone: clampLen(s(raw.emergencyPhone).trim() || "+8801601000950", 30),
    email: clampLen(s(raw.email).trim() || "aristocratdentalcare01@gmail.com", 150),
    address: clampLen(s(raw.address).trim() || "Aristocrat Dental Care & Orthodontic Center, Uttara, Dhaka, Bangladesh", 250),
    addressShort: clampLen(s(raw.addressShort).trim() || "Uttara, Dhaka, Bangladesh", 120),
    hours: clampLen(s(raw.hours).trim() || "Sat – Thu: 10:00 AM – 9:00 PM", 120),
    hoursBn: clampLen(s(raw.hoursBn).trim(), 120) || undefined,
    hoursFriday: clampLen(s(raw.hoursFriday).trim() || "Friday: Closed (Emergency on call)", 120),
    hoursFridayBn: clampLen(s(raw.hoursFridayBn).trim(), 120) || undefined,
    established: Math.round(n(raw.established, 2019)),
    patientsServed: Math.round(n(raw.patientsServed, 50000)),
    facebook: url(raw.facebook, "https://www.facebook.com/aristocratdental"),
    instagram: url(raw.instagram, "https://www.instagram.com/aristocratdentalcare01"),
    linkedin: url(raw.linkedin, "https://www.linkedin.com/company/aristocrat-dental-care-orthodontic-center"),
    heroVideoUrls,
  };
}

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const row = await db.pageBlock.findUnique({ where: { key: "settings" } });
    let settings: SiteSettings = defaultSettings();
    if (row) {
      try {
        const parsed = JSON.parse(row.dataJson);
        if (parsed && typeof parsed === "object") {
          settings = { ...defaultSettings(), ...sanitizeSettings(parsed) } as SiteSettings;
        }
      } catch {
        /* fall back to defaults */
      }
    }
    return NextResponse.json({ settings });
  } catch (err) {
    return serverError("settings", err);
  }
}

export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = await readJson(req);
    if (!body || typeof body !== "object") return bad("A valid JSON body is required.");
    const merged = { ...defaultSettings(), ...sanitizeSettings(body) };
    await db.pageBlock.upsert({
      where: { key: "settings" },
      create: { key: "settings", dataJson: JSON.stringify(merged) },
      update: { dataJson: JSON.stringify(merged) },
    });
    return ok(req, { settings: merged }, "Site settings saved.");
  } catch (err) {
    return serverError("settings", err);
  }
}
