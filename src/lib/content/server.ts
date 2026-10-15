import { db } from "@/lib/db";
import {
  staticBundle,
  deepMerge,
  mapDoctor,
  mapBlogPost,
  mapFaq,
  mapCase,
  mapHeroSlide,
  applyServiceOverlay,
  doctorRowToDoctor,
  blogRowToPost,
  caseRowToSmileCase,
  buildHomeHeroSlides,
  buildPageHeroSlides,
  defaultHomeContent,
  defaultAboutContent,
  normalizeAboutContent,
  defaultSettings,
  type ContentBundle,
  type HomeContent,
  type AboutContent,
  type SiteSettings,
} from "@/lib/content/shared";
import type { HeroSlide } from "@/lib/data/hero-media";
import { services as staticServices } from "@/lib/data/services";

/* ------------------------------------------------------------------ */
/*  Server-side content loader — DB with per-collection static         */
/*  fallback. Used by page.tsx (RSC) and GET /api/content.             */
/*  Safe to call in parallel with other queries.                       */
/* ------------------------------------------------------------------ */

function mergePageBlock<T>(
  raw: string | null | undefined,
  defaults: T
): T {
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaults;
    /* Sparse DEEP override merge: DB values win, missing keys fall back. */
    return deepMerge(defaults, parsed);
  } catch {
    return defaults;
  }
}

let cache: { bundle: ContentBundle; at: number; version: number } | null = null;
const CACHE_TTL_MS = 5_000;

/* Cross-instance freshness: serverless deployments run many isolated
   processes, so an in-process cache alone would let instance B serve a
   pre-edit bundle for up to CACHE_TTL_MS after instance A handled the
   write (admin saves "don't stick" for a few seconds). Derive a cheap
   version stamp from the newest content `updatedAt` and key the cache on
   it — any instance that observes a newer version rebuilds immediately.
   Falls back to the time-based TTL only if the probe query fails. */
async function contentVersion(): Promise<number> {
  const stamps = await Promise.all([
    db.doctor.aggregate({ _max: { updatedAt: true } }),
    db.blogPost.aggregate({ _max: { updatedAt: true } }),
    db.faq.aggregate({ _max: { updatedAt: true } }),
    db.smileCase.aggregate({ _max: { updatedAt: true } }),
    db.serviceContent.aggregate({ _max: { updatedAt: true } }),
    db.heroSlide.aggregate({ _max: { updatedAt: true } }),
    db.pageBlock.aggregate({ _max: { updatedAt: true } }),
  ]);
  let max = 0;
  for (const s of stamps) {
    const t = (s._max as Record<string, Date | null> | undefined)?.updatedAt;
    if (t) max = Math.max(max, new Date(t).getTime());
  }
  return max;
}

/** Full content bundle (version-keyed in-process cache to batch hits). */
export async function getContentBundle(): Promise<ContentBundle> {
  let version = 0;
  try {
    version = await contentVersion();
    if (cache && cache.version === version) return cache.bundle;
  } catch {
    /* probe failed — fall through to the time-based guard below */
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.bundle;
  }
  const fallback = staticBundle();

  let bundle: ContentBundle;
  try {
    const [doctorRows, postRows, faqRows, caseRows, serviceRows, heroRows, pageRows] =
      await Promise.all([
        db.doctor.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] }),
        db.blogPost.findMany({ where: { status: "PUBLISHED" }, orderBy: { date: "desc" } }),
        db.faq.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { updatedAt: "asc" }] }),
        db.smileCase.findMany({ orderBy: [{ sort: "asc" }, { updatedAt: "asc" }] }),
        db.serviceContent.findMany(),
        db.heroSlide.findMany({ orderBy: [{ scope: "asc" }, { sort: "asc" }, { updatedAt: "asc" }] }),
        db.pageBlock.findMany(),
      ]);

    const overlayBySlug = new Map(serviceRows.map((r) => [r.slug, r as unknown as Record<string, unknown>]));
    const services = staticServices.map((base) => {
      const o = overlayBySlug.get(base.slug);
      return o ? applyServiceOverlay(base, o) : base;
    });

    const home = mergePageBlock<HomeContent>(
      pageRows.find((p) => p.key === "home")?.dataJson,
      fallback.home
    );
    /* normalizeAboutContent: the deep merge replaces arrays wholesale, so
       blobs saved before timeline.year/icon existed must be healed per-item. */
    const about = normalizeAboutContent(
      mergePageBlock<AboutContent>(
        pageRows.find((p) => p.key === "about")?.dataJson,
        fallback.about
      )
    );
    const settings = mergePageBlock<SiteSettings>(
      pageRows.find((p) => p.key === "settings")?.dataJson,
      fallback.settings
    );

    const homeHeroRows = heroRows.filter((r) => r.scope === "home");
    /* Per-page backdrops: group active non-home rows by scope; scopes with
       at least one usable slide land in the bundle — otherwise the page
       keeps its curated static set. */
    const pageHeroSlides: Record<string, HeroSlide[]> = {};
    const rowsByScope = new Map<string, ReturnType<typeof mapHeroSlide>[]>();
    for (const r of heroRows) {
      if (r.scope === "home") continue;
      const mapped = mapHeroSlide(r as unknown as Record<string, unknown>);
      if (!mapped.active) continue;
      const list = rowsByScope.get(r.scope) ?? [];
      list.push(mapped);
      rowsByScope.set(r.scope, list);
    }
    for (const [scope, rows] of rowsByScope) {
      const slides = buildPageHeroSlides(rows);
      if (slides.length > 0) pageHeroSlides[scope] = slides;
    }

    bundle = {
      doctors: doctorRows.length
        ? doctorRows.map((r) => doctorRowToDoctor(mapDoctor(r as unknown as Record<string, unknown>)))
        : fallback.doctors,
      posts: postRows.length
        ? postRows.map((r) => blogRowToPost(mapBlogPost(r as unknown as Record<string, unknown>)))
        : fallback.posts,
      faqs: faqRows.length
        ? faqRows.map((r) => {
            const f = mapFaq(r as unknown as Record<string, unknown>);
            return { question: f.question, answer: f.answer, questionBn: f.questionBn, answerBn: f.answerBn };
          })
        : fallback.faqs,
      cases: caseRows.length
        ? caseRows.map((r) => caseRowToSmileCase(mapCase(r as unknown as Record<string, unknown>)))
        : fallback.cases,
      services,
      heroSlides: homeHeroRows.length
        ? buildHomeHeroSlides(
            homeHeroRows.map((r) => mapHeroSlide(r as unknown as Record<string, unknown>)),
            settings.heroVideoUrls ?? []
          )
        : fallback.heroSlides,
      pageHeroSlides,
      home,
      about,
      settings,
    };
  } catch (err) {
    console.error("[content] DB read failed — serving static fallback:", err);
    bundle = fallback;
  }

  cache = { bundle, at: Date.now(), version };
  return bundle;
}

/** Invalidate the in-process cache (called after admin writes). */
export function invalidateContentCache(): void {
  cache = null;
}
