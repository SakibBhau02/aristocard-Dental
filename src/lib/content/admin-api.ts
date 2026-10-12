import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { invalidateContentCache } from "@/lib/content/server";

/* ------------------------------------------------------------------ */
/*  Shared helpers for the CMS admin API routes                        */
/* ------------------------------------------------------------------ */

export function guard(req: NextRequest): NextResponse | null {
  return isAdminAuthorized(req)
    ? null
    : NextResponse.json({ error: "Invalid admin passcode." }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

export async function readJson(req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function bad(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(scope: string, err: unknown): NextResponse {
  console.error(`[admin/${scope}] error:`, err);
  return NextResponse.json({ error: "Internal server error." }, { status: 500 });
}

export function ok(data: Record<string, unknown>, message?: string): NextResponse {
  invalidateContentCache();
  return NextResponse.json({ success: true, ...(message ? { message } : {}), ...data });
}

/* ---------------- field extractors (defensive) ---------------- */

export function s(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export function os(v: unknown): string | null {
  const val = s(v).trim();
  return val.length ? val : null;
}

export function n(v: unknown, fallback: number): number {
  const num = Number(v);
  return Number.isFinite(num) ? num : fallback;
}

export function b(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

export function strList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => x.trim());
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length >= 2 && slug.length <= 80;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function clamp(nv: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, nv));
}

export function clampLen(sv: string, max: number): string {
  return sv.length > max ? sv.slice(0, max) : sv;
}
