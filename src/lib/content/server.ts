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
  defaultHomeContent,
  defaultAboutContent,
  normalizeAboutContent,
  defaultSettings,
  type ContentBundle,
  type HomeContent,
  type AboutContent,
  type SiteSettings,
} from "@/lib/content/shared";
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

let cache: { bundle: ContentBundle; at: number } | null = null;
const CACHE_TTL_MS = 5_000;

/** Full content bundle (5s in-process cache to batch RSC + API hits). */
export async function getContentBundle(): Promise<ContentBundle> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.bundle;
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
        db.heroSlide.findMany({ where: { scope: "home" }, orderBy: [{ sort: "asc" }, { updatedAt: "asc" }] }),
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
      heroSlides: heroRows.length
        ? buildHomeHeroSlides(
            heroRows.map((r) => mapHeroSlide(r as unknown as Record<string, unknown>)),
            settings.heroVideoUrls ?? []
          )
        : fallback.heroSlides,
      home,
      about,
      settings,
    };
  } catch (err) {
    console.error("[content] DB read failed — serving static fallback:", err);
    bundle = fallback;
  }

  cache = { bundle, at: Date.now() };
  return bundle;
}

/** Invalidate the in-process cache (called after admin writes). */
export function invalidateContentCache(): void {
  cache = null;
}
