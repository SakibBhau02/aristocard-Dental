import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole, getAdminActor } from "@/lib/admin-auth";
import { invalidateContentCache } from "@/lib/content/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Shared helpers for the CMS admin API routes                        */
/*                                                                     */
/*  • guard(req)  — async RBAC gate (see @/lib/admin-auth).            */
/*  • ok(req, …)  — success envelope + cache invalidation + audit log. */
/*  • audit(…)    — fire-and-forget AdminActivity rows.                */
/* ------------------------------------------------------------------ */

/** Async RBAC gate: null when allowed, else a 401/403 response. */
export async function guard(req: NextRequest): Promise<NextResponse | null> {
  return requireAdminRole(req);
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

/* ------------------------------------------------------------------ */
/*  Audit trail                                                         */
/* ------------------------------------------------------------------ */

export type AuditEvent = {
  action: string;
  entity: string;
  label?: string | null;
  /* Explicit actor override — used by the auth routes where no session
     cookie exists yet (login) or it is about to be cleared (logout). */
  actorName?: string;
  actorLabel?: string | null;
  actorRole?: string | null;
};

/** Best-effort audit row — never blocks or breaks the API response. */
export async function audit(
  req: NextRequest,
  event: AuditEvent
): Promise<void> {
  try {
    let actorName = event.actorName;
    let actorLabel = event.actorLabel ?? null;
    let actorRole = event.actorRole ?? null;

    if (!actorName) {
      const actor = await getAdminActor(req);
      if (actor?.kind === "user") {
        actorName = actor.user.username;
        actorLabel = actor.user.displayName;
        actorRole = actor.user.role;
      } else if (actor?.kind === "automation") {
        actorName = "automation";
        actorLabel = "Automation";
        actorRole = "OWNER";
      } else {
        actorName = "unknown";
        actorLabel = null;
        actorRole = null;
      }
    }

    await db.adminActivity.create({
      data: {
        actor: actorName,
        actorLabel,
        role: actorRole,
        action: event.action,
        entity: event.entity,
        label: event.label ?? null,
      },
    });
  } catch (err) {
    console.error("[admin/audit] failed to record activity:", err);
  }
}

/* ------------------------------------------------------------------ */
/*  Success envelope                                                    */
/* ------------------------------------------------------------------ */

/**
 * Success response + content-cache invalidation + automatic audit row.
 * The audit entry is derived from the request itself (method + route →
 * action, entity) so every admin mutation is logged uniformly.
 */
export async function ok(
  req: NextRequest,
  data: Record<string, unknown>,
  message?: string
): Promise<NextResponse> {
  invalidateContentCache();

  /* Derive entity from /api/admin/<entity>/… */
  const match = req.nextUrl.pathname.match(/^\/api\/admin\/([a-z-]+)/);
  const entity = match ? match[1] : "api";
  const lower = (message ?? "").toLowerCase();
  let action: string;
  if (req.method === "DELETE") action = "delete";
  else if (lower.includes("order")) action = "reorder";
  else if (lower.includes("created") || lower.includes("added")) action = "create";
  else action = "update";
  const label =
    (typeof data.slug === "string" && data.slug) ||
    (typeof data.key === "string" && data.key) ||
    (typeof data.id === "string" && data.id) ||
    message ||
    null;

  void audit(req, { action, entity, label });

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
