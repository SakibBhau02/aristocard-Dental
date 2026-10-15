import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applyServiceOverlay } from "@/lib/content/shared";
import { services as staticServices } from "@/lib/data/services";
import { guard, readJson, bad, notFound, serverError, ok, s, os, b, strList, clampLen } from "@/lib/content/admin-api";

/* ------------------------------------------------------------------ */
/*  Admin API — Service content editor                                 */
/*  Slugs are LOCKED (referential integrity with appointments, blog    */
/*  refs, cases and search) — only the content overlay is editable.    */
/*  GET  /api/admin/services          → 11 services (merged view)      */
/*  POST /api/admin/services          → { slug, …overlay } update      */
/* ------------------------------------------------------------------ */

type BenefitInput = { title?: unknown; description?: unknown };
type ProcessInput = { step?: unknown; title?: unknown; description?: unknown };
type FaqInput = { question?: unknown; answer?: unknown };

function sanitizeBenefits(v: unknown): { title: string; description: string }[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const out = v
    .map((r) => {
      const o = (r ?? {}) as BenefitInput;
      return {
        title: clampLen(s(o.title).trim(), 150),
        description: clampLen(s(o.description).trim(), 1000),
      };
    })
    .filter((x) => x.title.length > 0 && x.description.length > 0);
  return out.length ? out : null;
}

function sanitizeProcess(v: unknown): { step: string; title: string; description: string }[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const out = v
    .map((r, i) => {
      const o = (r ?? {}) as ProcessInput;
      return {
        step: clampLen(s(o.step).trim() || String(i + 1), 10),
        title: clampLen(s(o.title).trim(), 150),
        description: clampLen(s(o.description).trim(), 1000),
      };
    })
    .filter((x) => x.title.length > 0);
  return out.length ? out : null;
}

function sanitizeFaqs(v: unknown): { question: string; answer: string }[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  const out = v
    .map((r) => {
      const o = (r ?? {}) as FaqInput;
      return {
        question: clampLen(s(o.question).trim(), 400),
        answer: clampLen(s(o.answer).trim(), 2000),
      };
    })
    .filter((x) => x.question.length > 0 && x.answer.length > 0);
  return out.length ? out : null;
}

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const rows = await db.serviceContent.findMany();
    const overlayBySlug = new Map(rows.map((r) => [r.slug, r as unknown as Record<string, unknown>]));
    const merged = staticServices.map((base) => {
      const o = overlayBySlug.get(base.slug);
      const svc = o ? applyServiceOverlay(base, o) : base;
      return { ...svc, hasOverlay: Boolean(o) };
    });
    return NextResponse.json({ services: merged });
  } catch (err) {
    return serverError("services", err);
  }
}

export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = await readJson(req);
    if (!body) return bad("A valid JSON body is required.");
    const slug = s(body.slug).trim();
    const base = staticServices.find((sv) => sv.slug === slug);
    if (!base) return notFound("Unknown service slug. Slugs are fixed for link integrity.");

    const overview = strList(body.overview);
    const ideal = strList(body.ideal);
    const benefits = sanitizeBenefits(body.benefits);
    const process = sanitizeProcess(body.process);
    const faqs = sanitizeFaqs(body.faqs);

    const data = {
      name: clampLen(s(body.name, base.name).trim() || base.name, 120),
      nameBn: os(body.nameBn) ?? base.nameBn,
      shortName: clampLen(s(body.shortName, base.shortName).trim() || base.shortName, 60),
      shortNameBn: os(body.shortNameBn) ?? base.shortNameBn,
      tagline: clampLen(s(body.tagline, base.tagline).trim() || base.tagline, 200),
      taglineBn: os(body.taglineBn) ?? base.taglineBn,
      excerpt: clampLen(s(body.excerpt, base.excerpt).trim() || base.excerpt, 600),
      excerptBn: os(body.excerptBn) ?? base.excerptBn,
      image: os(body.image) ?? base.image,
      icon: s(body.icon, base.icon).trim() || base.icon,
      duration: clampLen(s(body.duration, base.duration).trim() || base.duration, 80),
      longevity: clampLen(s(body.longevity, base.longevity).trim() || base.longevity, 80),
      anesthesia: clampLen(s(body.anesthesia, base.anesthesia).trim() || base.anesthesia, 80),
      featured: b(body.featured, base.featured ?? false),
      overviewJson: JSON.stringify(overview.length ? overview : base.overview),
      benefitsJson: JSON.stringify(benefits ?? base.benefits),
      processJson: JSON.stringify(process ?? base.process),
      idealJson: JSON.stringify(ideal.length ? ideal : base.ideal),
      faqsJson: JSON.stringify(faqs ?? base.faqs),
    };

    const row = await db.serviceContent.upsert({ where: { slug }, create: { slug, ...data }, update: data });
    const merged = applyServiceOverlay(base, row as unknown as Record<string, unknown>);
    return ok(req, { service: merged, slug }, "Service content saved.");
  } catch (err) {
    return serverError("services", err);
  }
}
