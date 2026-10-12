/* ------------------------------------------------------------------ */
/*  CMS shared layer — types, defaults, row↔domain mappers.             */
/*  Client-safe (NO Prisma imports). Used by:                          */
/*   • src/lib/content/server.ts  (DB → ContentBundle)                 */
/*   • /api/admin/* routes         (payload → DB rows)                 */
/*   • content-provider.tsx        (public site context)               */
/*   • admin editor panels         (form defaults)                     */
/* ------------------------------------------------------------------ */

import type { BlogPost, Doctor, FAQ, Service } from "@/lib/types";
import type { SmileCase } from "@/lib/data/smile-cases";
import type { HeroSlide } from "@/lib/data/hero-media";
import { parseYouTubeId, buildHeroSlides } from "@/lib/data/hero-media";
import { services as staticServices } from "@/lib/data/services";
import { doctors as staticDoctors, testimonials as staticTestimonials } from "@/lib/data/doctors";
import { blogPosts as staticPosts } from "@/lib/data/blog";
import { generalFaqs as staticFaqs } from "@/lib/data/faqs";
import { smileCases as staticCases } from "@/lib/data/smile-cases";
import { homeHeroImages, heroVideoUrls } from "@/lib/data/hero-media";
import { dictionary } from "@/lib/data/dictionary";
const en = dictionary.en;
const bn = dictionary.bn;
import { site, clinicStats, highlights as staticHighlights } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Page-level editable content shapes                                 */
/* ------------------------------------------------------------------ */

export type HomeHeroContent = {
  badge: string; badgeBn?: string;
  titleA: string; titleABn?: string;
  titleB: string; titleBBn?: string;
  description: string; descriptionBn?: string;
  ctaBook: string; ctaBookBn?: string;
  ctaExplore: string; ctaExploreBn?: string;
  trust: string[]; trustBn?: string[];
};

export type StatItem = {
  value: number;
  suffix: string;
  label: string;
  labelBn?: string;
  decimals?: number;
};

export type WhyContent = {
  eyebrow: string; eyebrowBn?: string;
  titleA: string; titleABn?: string;
  titleB: string; titleBBn?: string;
  description: string; descriptionBn?: string;
  quote: string; quoteBn?: string;
  quoteBy: string; quoteByBn?: string;
  ratingNote: string; ratingNoteBn?: string;
  highlights: { icon: string; title: string; titleBn?: string; description: string; descriptionBn?: string }[];
};

export type SectionHead = {
  eyebrow: string; eyebrowBn?: string;
  titleA: string; titleABn?: string;
  titleB: string; titleBBn?: string;
  description: string; descriptionBn?: string;
  cta?: string; ctaBn?: string;
};

export type FacilityContent = SectionHead & {
  cards: { title: string; titleBn?: string; text: string; textBn?: string }[];
};

export type HomeContent = {
  hero: HomeHeroContent;
  stats: StatItem[];
  why: WhyContent;
  services: SectionHead;
  facility: FacilityContent;
  galleryPreview: SectionHead;
  testimonials: SectionHead;
  doctors: SectionHead;
  faq: SectionHead & { stillTitle?: string; stillTitleBn?: string };
};

export type TimelineItem = {
  year: string;
  icon: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
};

export type StoryStatItem = {
  value: string;
  label: string;
  labelBn?: string;
};

export type AboutContent = {
  eyebrow: string; eyebrowBn?: string;
  title: string; titleBn?: string;
  description: string; descriptionBn?: string;
  storyBadge: string; storyBadgeBn?: string;
  storyQuote: string; storyQuoteBn?: string;
  storyP2: string; storyP2Bn?: string;
  storyStats: StoryStatItem[];
  missionEyebrow: string; missionEyebrowBn?: string;
  missionTitle: string; missionTitleBn?: string;
  missionHeading: string; missionHeadingBn?: string;
  missionText: string; missionTextBn?: string;
  visionHeading: string; visionHeadingBn?: string;
  visionText: string; visionTextBn?: string;
  journeyEyebrow: string; journeyEyebrowBn?: string;
  journeyTitle: string; journeyTitleBn?: string;
  timeline: TimelineItem[];
  founderName: string; founderNameBn?: string;
  founderRole: string; founderRoleBn?: string;
  founderChipTitle: string; founderChipTitleBn?: string;
  founderChipNote: string; founderChipNoteBn?: string;
  founderItems: { title: string; titleBn?: string; text: string; textBn?: string }[];
  valuesEyebrow: string; valuesEyebrowBn?: string;
  valuesTitle: string; valuesTitleBn?: string;
  values: { icon: string; title: string; titleBn?: string; description: string; descriptionBn?: string }[];
  specialistsTitle: string; specialistsTitleBn?: string;
  specialistsDescription: string; specialistsDescriptionBn?: string;
  ctaTitle: string; ctaTitleBn?: string;
  ctaDescription: string; ctaDescriptionBn?: string;
};

export type SiteSettings = {
  name: string;
  shortName: string;
  tagline: string; taglineBn?: string;
  phone: string;
  phoneRaw: string;
  emergencyPhone: string;
  email: string;
  address: string;
  addressShort: string;
  hours: string; hoursBn?: string;
  hoursFriday: string; hoursFridayBn?: string;
  established: number;
  patientsServed: number;
  facebook: string;
  instagram: string;
  linkedin: string;
  heroVideoUrls: string[];
};

/* ------------------------------------------------------------------ */
/*  Defaults (mirrors today's static content — seed + fallback)         */
/* ------------------------------------------------------------------ */

export function defaultHomeContent(): HomeContent {
  const h = en.home;
  const hb = bn.home;
  return {
    hero: {
      badge: h.hero.badge, badgeBn: hb.hero.badge,
      titleA: h.hero.titleA, titleABn: hb.hero.titleA,
      titleB: h.hero.titleB, titleBBn: hb.hero.titleB,
      description: h.hero.description, descriptionBn: hb.hero.description,
      ctaBook: h.hero.ctaBook, ctaBookBn: hb.hero.ctaBook,
      ctaExplore: h.hero.ctaExplore, ctaExploreBn: hb.hero.ctaExplore,
      trust: h.hero.trust, trustBn: hb.hero.trust,
    },
    stats: clinicStats.map((s, i) => ({
      value: s.value,
      suffix: s.suffix,
      label: s.label,
      labelBn: hb.stats[i]?.label,
      decimals: (s as { decimals?: number }).decimals,
    })),
    why: {
      eyebrow: h.why.eyebrow, eyebrowBn: hb.why.eyebrow,
      titleA: h.why.titleA, titleABn: hb.why.titleA,
      titleB: h.why.titleB, titleBBn: hb.why.titleB,
      description: h.why.description, descriptionBn: hb.why.description,
      quote: h.why.quote, quoteBn: hb.why.quote,
      quoteBy: h.why.quoteBy, quoteByBn: hb.why.quoteBy,
      ratingNote: h.why.ratingNote, ratingNoteBn: hb.why.ratingNote,
      highlights: h.why.highlights.map((hi, i) => ({
        icon: staticHighlights[i]?.icon ?? "ShieldCheck",
        title: hi.title, titleBn: hb.why.highlights[i]?.title,
        description: hi.description, descriptionBn: hb.why.highlights[i]?.description,
      })),
    },
    services: {
      eyebrow: h.services.eyebrow, eyebrowBn: hb.services.eyebrow,
      titleA: h.services.titleA, titleABn: hb.services.titleA,
      titleB: h.services.titleB, titleBBn: hb.services.titleB,
      description: h.services.description, descriptionBn: hb.services.description,
      cta: h.services.viewAll, ctaBn: hb.services.viewAll,
    },
    facility: {
      eyebrow: h.facility.eyebrow, eyebrowBn: hb.facility.eyebrow,
      titleA: h.facility.titleA, titleABn: hb.facility.titleA,
      titleB: h.facility.titleB, titleBBn: hb.facility.titleB,
      description: h.facility.description, descriptionBn: hb.facility.description,
      cards: h.facility.cards.map((c, i) => ({
        title: c.title, titleBn: hb.facility.cards[i]?.title,
        text: c.text, textBn: hb.facility.cards[i]?.text,
      })),
    },
    galleryPreview: {
      eyebrow: h.galleryPreview.eyebrow, eyebrowBn: hb.galleryPreview.eyebrow,
      titleA: h.galleryPreview.titleA, titleABn: hb.galleryPreview.titleA,
      titleB: h.galleryPreview.titleB, titleBBn: hb.galleryPreview.titleB,
      description: h.galleryPreview.description, descriptionBn: hb.galleryPreview.description,
      cta: h.galleryPreview.ctaGallery, ctaBn: hb.galleryPreview.ctaGallery,
    },
    testimonials: {
      eyebrow: h.testimonials.eyebrow, eyebrowBn: hb.testimonials.eyebrow,
      titleA: h.testimonials.titleA, titleABn: hb.testimonials.titleA,
      titleB: h.testimonials.titleB, titleBBn: hb.testimonials.titleB,
      description: h.testimonials.description, descriptionBn: hb.testimonials.description,
    },
    doctors: {
      eyebrow: h.doctors.eyebrow, eyebrowBn: hb.doctors.eyebrow,
      titleA: h.doctors.titleA, titleABn: hb.doctors.titleA,
      titleB: h.doctors.titleB, titleBBn: hb.doctors.titleB,
      description: h.doctors.description, descriptionBn: hb.doctors.description,
      cta: h.doctors.viewBoard, ctaBn: hb.doctors.viewBoard,
    },
    faq: {
      eyebrow: h.faq.eyebrow, eyebrowBn: hb.faq.eyebrow,
      titleA: h.faq.titleA, titleABn: hb.faq.titleA,
      titleB: h.faq.titleB, titleBBn: hb.faq.titleB,
      description: h.faq.description, descriptionBn: hb.faq.description,
      cta: h.faq.viewAll, ctaBn: hb.faq.viewAll,
      stillTitle: h.faq.stillTitle, stillTitleBn: hb.faq.stillTitle,
    },
  };
}

/* Journey timeline presentation defaults — year + icon per milestone.
   Kept beside the defaults so blobs saved BEFORE these fields existed
   heal per-index (arrays are replaced wholesale by the deep merge). */
const TIMELINE_META = [
  { year: "2019", icon: "Heart" },
  { year: "2021", icon: "Microscope" },
  { year: "2023", icon: "Sparkles" },
  { year: "2025", icon: "Users" },
] as const;

export function defaultAboutContent(): AboutContent {
  const a = en.about;
  const ab = bn.about;
  return {
    eyebrow: a.eyebrow, eyebrowBn: ab.eyebrow,
    title: a.title, titleBn: ab.title,
    description: a.description, descriptionBn: ab.description,
    storyBadge: a.storyBadge, storyBadgeBn: ab.storyBadge,
    storyQuote: a.storyQuote, storyQuoteBn: ab.storyQuote,
    storyP2: a.storyP2, storyP2Bn: ab.storyP2,
    storyStats: [
      { value: "6+", label: a.storyStats[0].label, labelBn: ab.storyStats[0].label },
      { value: "11", label: a.storyStats[1].label, labelBn: ab.storyStats[1].label },
      { value: "4.9★", label: a.storyStats[2].label, labelBn: ab.storyStats[2].label },
    ],
    missionEyebrow: a.missionEyebrow, missionEyebrowBn: ab.missionEyebrow,
    missionTitle: a.missionTitle, missionTitleBn: ab.missionTitle,
    missionHeading: a.missionHeading, missionHeadingBn: ab.missionHeading,
    missionText: a.missionText, missionTextBn: ab.missionText,
    visionHeading: a.visionHeading, visionHeadingBn: ab.visionHeading,
    visionText: a.visionText, visionTextBn: ab.visionText,
    journeyEyebrow: a.journeyEyebrow, journeyEyebrowBn: ab.journeyEyebrow,
    journeyTitle: a.journeyTitle, journeyTitleBn: ab.journeyTitle,
    timeline: a.timeline.map((t, i) => ({
      year: TIMELINE_META[i]?.year ?? "2024",
      icon: TIMELINE_META[i]?.icon ?? "Sparkles",
      title: t.title, titleBn: ab.timeline[i]?.title,
      description: t.description, descriptionBn: ab.timeline[i]?.description,
    })),
    founderName: "Dr. Shazia Khanam",
    founderNameBn: "ডা. শাজিয়া খানম",
    founderRole: a.founderRole, founderRoleBn: ab.founderRole,
    founderChipTitle: a.founderChipTitle, founderChipTitleBn: ab.founderChipTitle,
    founderChipNote: a.founderChipNote, founderChipNoteBn: ab.founderChipNote,
    founderItems: a.founderItems.map((f, i) => ({
      title: f.title, titleBn: ab.founderItems[i]?.title,
      text: f.text, textBn: ab.founderItems[i]?.text,
    })),
    valuesEyebrow: a.valuesEyebrow, valuesEyebrowBn: ab.valuesEyebrow,
    valuesTitle: a.valuesTitle, valuesTitleBn: ab.valuesTitle,
    values: a.values.map((v, i) => ({
      icon: ["BadgeCheck", "ShieldCheck", "HeartHandshake", "Award"][i] ?? "BadgeCheck",
      title: v.title, titleBn: ab.values[i]?.title,
      description: v.description, descriptionBn: ab.values[i]?.description,
    })),
    specialistsTitle: a.specialistsTitle, specialistsTitleBn: ab.specialistsTitle,
    specialistsDescription: a.specialistsDescription, specialistsDescriptionBn: ab.specialistsDescription,
    ctaTitle: a.ctaTitle, ctaTitleBn: ab.ctaTitle,
    ctaDescription: a.ctaDescription, ctaDescriptionBn: ab.ctaDescription,
  };
}

/* Defensive healer for About blobs saved before a field existed.
   deepMerge replaces ARRAYS wholesale, so an old blob's timeline items
   keep lacking year/icon even after merging — refill per-index from
   the defaults so the public bundle is always complete. */
export function normalizeAboutContent(about: AboutContent): AboutContent {
  const defaults = defaultAboutContent();
  const obj = (v: unknown): Record<string, unknown> =>
    v !== null && typeof v === "object" ? (v as Record<string, unknown>) : {};
  const timeline = (Array.isArray(about.timeline) ? about.timeline : defaults.timeline).map(
    (t, i) => {
      const raw = obj(t);
      return {
        year: str(raw.year) || defaults.timeline[i]?.year || "2024",
        icon: str(raw.icon) || defaults.timeline[i]?.icon || "Sparkles",
        title: str(raw.title),
        titleBn: ostr(raw.titleBn),
        description: str(raw.description),
        descriptionBn: ostr(raw.descriptionBn),
      };
    }
  );
  const storyStats = Array.isArray(about.storyStats)
    ? about.storyStats.map((s) => {
        const raw = obj(s);
        return {
          value: str(raw.value),
          label: str(raw.label),
          labelBn: ostr(raw.labelBn),
        };
      })
    : defaults.storyStats;
  return {
    ...about,
    timeline,
    storyStats,
    founderName: str(about.founderName).trim() || defaults.founderName,
  };
}

export function defaultSettings(): SiteSettings {
  return {
    name: site.name,
    shortName: site.shortName,
    tagline: site.tagline,
    taglineBn: site.taglineBn,
    phone: site.phone,
    phoneRaw: site.phoneRaw,
    emergencyPhone: site.emergencyPhone,
    email: site.email,
    address: site.address,
    addressShort: site.addressShort,
    hours: site.hours,
    hoursBn: bn.footer.hours,
    hoursFriday: site.hoursFriday,
    hoursFridayBn: undefined,
    established: site.established,
    patientsServed: site.patientsServed,
    facebook: site.social.facebook,
    instagram: site.social.instagram,
    linkedin: site.social.linkedin,
    heroVideoUrls: [...heroVideoUrls],
  };
}

/* ------------------------------------------------------------------ */
/*  The full bundle served to the public site                          */
/* ------------------------------------------------------------------ */

export type ContentBundle = {
  doctors: Doctor[];
  posts: BlogPost[];
  faqs: FAQ[];
  cases: SmileCase[];
  services: Service[];
  heroSlides: HeroSlide[];
  home: HomeContent;
  about: AboutContent;
  settings: SiteSettings;
};

export function staticBundle(): ContentBundle {
  const settings = defaultSettings();
  const videos = settings.heroVideoUrls
    .map(parseYouTubeId)
    .filter((id): id is string => Boolean(id))
    .map((id) => ({ type: "youtube", id }) as HeroSlide);
  return {
    doctors: staticDoctors,
    posts: staticPosts,
    faqs: staticFaqs,
    cases: staticCases,
    services: staticServices,
    heroSlides: buildHeroSlides(homeHeroImages, videos),
    home: defaultHomeContent(),
    about: defaultAboutContent(),
    settings,
  };
}


/* ------------------------------------------------------------------ */
/*  Deep merge — DB sparse overrides over defaults                     */
/* ------------------------------------------------------------------ */

export function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (Array.isArray(base) || Array.isArray(override)) {
    /* Arrays are replaced wholesale (never merged item-by-item). */
    return (Array.isArray(override) ? override : base) as T;
  }
  if (typeof base === "object" && typeof override === "object" && base !== null) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
      const b = (base as Record<string, unknown>)[k];
      out[k] = b !== undefined && b !== null && typeof b === "object" && !Array.isArray(b) && v !== null && typeof v === "object" && !Array.isArray(v)
        ? deepMerge(b, v)
        : v;
    }
    return out as T;
  }
  return (override as T) ?? base;
}

export function featuredServices(list: Service[], count = 4): Service[] {
  const f = list.filter((s) => s.featured);
  return (f.length >= count ? f : [...f, ...list.filter((s) => !s.featured)]).slice(0, count);
}

/* ------------------------------------------------------------------ */
/*  Safe JSON helpers                                                  */
/* ------------------------------------------------------------------ */

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return (v === null || v === undefined) ? fallback : (v as T);
  } catch {
    return fallback;
  }
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function ostr(v: unknown): string | undefined {
  const s = str(v).trim();
  return s.length ? s : undefined;
}

function num(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function bool(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

/* ------------------------------------------------------------------ */
/*  Row → domain mappers (shapes returned by admin GET endpoints)      */
/* ------------------------------------------------------------------ */

export type DoctorRow = {
  id: string; slug: string; legacyId: number; sort: number; name: string;
  credentials: string[]; role: string; roleBn?: string; department: string; departmentBn?: string;
  bio: string; experienceYears: number; patientsTreated: number; rating: number;
  specializations: string[]; languages: string[]; consultationDays: string[];
  accent: string; photo?: string; active: boolean;
};

type RawDoctor = Record<string, unknown> & { credentialsJson?: string; specializationsJson?: string; languagesJson?: string; consultationDaysJson?: string };

export function mapDoctor(row: RawDoctor): DoctorRow {
  return {
    id: str(row.id),
    slug: str(row.slug),
    legacyId: num(row.legacyId, 0),
    sort: num(row.sort, 0),
    name: str(row.name),
    credentials: parseJson<string[]>(row.credentialsJson, []),
    role: str(row.role),
    roleBn: ostr(row.roleBn),
    department: str(row.department),
    departmentBn: ostr(row.departmentBn),
    bio: str(row.bio),
    experienceYears: num(row.experienceYears, 1),
    patientsTreated: num(row.patientsTreated, 0),
    rating: num(row.rating, 4.8),
    specializations: parseJson<string[]>(row.specializationsJson, []),
    languages: parseJson<string[]>(row.languagesJson, ["Bangla", "English"]),
    consultationDays: parseJson<string[]>(row.consultationDaysJson, []),
    accent: str(row.accent, "#012c5f"),
    photo: ostr(row.photo),
    active: row.active === undefined ? true : Boolean(row.active),
  };
}

/** DB DoctorRow → public Doctor type (as consumed by the site). */
export function doctorRowToDoctor(row: DoctorRow): Doctor {
  const numericId = row.legacyId || Math.abs(
    Array.from(row.id).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7)
  ) % 100000;
  return {
    slug: row.slug,
    id: numericId,
    name: row.name,
    credentials: row.credentials,
    role: row.role,
    roleBn: row.roleBn,
    department: row.department,
    departmentBn: row.departmentBn,
    bio: row.bio,
    experienceYears: row.experienceYears,
    patientsTreated: row.patientsTreated,
    rating: row.rating,
    specializations: row.specializations,
    languages: row.languages,
    consultationDays: row.consultationDays,
    verified: true,
    accent: row.accent,
  };
}

export type BlogRow = {
  id: string; slug: string; title: string; titleBn?: string; excerpt: string; excerptBn?: string;
  category: string; readTime: string; date: string; updated?: string; author: string;
  authorCredentials: string; featured: boolean; tags: string[]; serviceRefs?: string[];
  image?: string; imageAlt?: string; quickAnswer: string; quickAnswerBn?: string;
  sections: BlogPost["sections"]; sectionsBn?: BlogPost["sections"];
  status: "PUBLISHED" | "DRAFT";
};

type RawPost = Record<string, unknown> & { tagsJson?: string; serviceRefsJson?: string; sectionsJson?: string; sectionsBnJson?: string };

const emptySections: BlogPost["sections"] = [];

export function mapBlogPost(row: RawPost): BlogRow {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
    titleBn: ostr(row.titleBn),
    excerpt: str(row.excerpt),
    excerptBn: ostr(row.excerptBn),
    category: str(row.category, "General"),
    readTime: str(row.readTime, "5 min read"),
    date: str(row.date),
    updated: ostr(row.updated),
    author: str(row.author, "Dr. Shazia Khanam"),
    authorCredentials: str(row.authorCredentials, "BDS, MDS"),
    featured: Boolean(row.featured),
    tags: parseJson<string[]>(row.tagsJson, []),
    serviceRefs: parseJson<string[] | null>(row.serviceRefsJson, null) ?? undefined,
    image: ostr(row.image),
    imageAlt: ostr(row.imageAlt),
    quickAnswer: str(row.quickAnswer),
    quickAnswerBn: ostr(row.quickAnswerBn),
    sections: parseJson<BlogPost["sections"]>(row.sectionsJson, emptySections),
    sectionsBn: parseJson<BlogPost["sections"] | null>(row.sectionsBnJson, null) ?? undefined,
    status: row.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
  };
}

export function blogRowToPost(row: BlogRow): BlogPost {
  const { id: _id, status: _status, ...rest } = row;
  return { ...rest, updated: rest.updated ?? rest.date };
}

export type FaqRow = {
  id: string; sort: number; question: string; questionBn?: string;
  answer: string; answerBn?: string; active: boolean;
};

export function mapFaq(row: Record<string, unknown>): FaqRow {
  return {
    id: str(row.id),
    sort: num(row.sort, 0),
    question: str(row.question),
    questionBn: ostr(row.questionBn),
    answer: str(row.answer),
    answerBn: ostr(row.answerBn),
    active: row.active === undefined ? true : Boolean(row.active),
  };
}

export type CaseRow = {
  id: string; slug: string; sort: number; treatment: string; category: SmileCase["category"];
  serviceSlug?: string; beforeSrc: string; afterSrc: string; beforeAlt?: string; afterAlt?: string;
  title: string; patient: string; age: number; duration: string; procedures: string[];
  result: string; featured: boolean;
};

export function mapCase(row: Record<string, unknown>): CaseRow {
  const cat = str(row.category, "Cosmetic");
  const validCats = ["Cosmetic", "Orthodontics", "Restorative", "Preventive"] as const;
  return {
    id: str(row.id),
    slug: str(row.slug),
    sort: num(row.sort, 0),
    treatment: str(row.treatment),
    category: (validCats as readonly string[]).includes(cat) ? (cat as SmileCase["category"]) : "Cosmetic",
    serviceSlug: ostr(row.serviceSlug),
    beforeSrc: str(row.beforeSrc),
    afterSrc: str(row.afterSrc),
    beforeAlt: ostr(row.beforeAlt),
    afterAlt: ostr(row.afterAlt),
    title: str(row.title),
    patient: str(row.patient),
    age: num(row.age, 30),
    duration: str(row.duration),
    procedures: parseJson<string[]>(row.proceduresJson as string, []),
    result: str(row.result),
    featured: Boolean(row.featured),
  };
}

export function caseRowToSmileCase(row: CaseRow): SmileCase {
  return {
    id: row.slug,
    treatment: row.treatment,
    category: row.category,
    serviceSlug: row.serviceSlug ?? "",
    beforeSrc: row.beforeSrc,
    afterSrc: row.afterSrc,
    beforeAlt: row.beforeAlt ?? row.title,
    afterAlt: row.afterAlt ?? row.title,
    title: row.title,
    patient: row.patient,
    age: row.age,
    duration: row.duration,
    procedures: row.procedures,
    result: row.result,
    featured: row.featured,
  };
}

/* Service overlay: DB overlay (sparse) applied over the static base. */
type RawServiceContent = Record<string, unknown> & {
  overviewJson?: string; benefitsJson?: string; processJson?: string; idealJson?: string; faqsJson?: string;
};

export function applyServiceOverlay(base: Service, o: RawServiceContent): Service {
  const benefits = parseJson<Service["benefits"] | null>(o.benefitsJson, null);
  const process = parseJson<Service["process"] | null>(o.processJson, null);
  const faqs = parseJson<Service["faqs"] | null>(o.faqsJson, null);
  return {
    ...base,
    name: str(o.name, base.name),
    nameBn: ostr(o.nameBn) ?? base.nameBn,
    shortName: str(o.shortName, base.shortName),
    shortNameBn: ostr(o.shortNameBn) ?? base.shortNameBn,
    icon: str(o.icon, base.icon) || base.icon,
    image: ostr(o.image) ?? base.image,
    tagline: str(o.tagline, base.tagline),
    taglineBn: ostr(o.taglineBn) ?? base.taglineBn,
    excerpt: str(o.excerpt, base.excerpt),
    excerptBn: ostr(o.excerptBn) ?? base.excerptBn,
    overview: parseJson<string[] | null>(o.overviewJson, null) ?? base.overview,
    benefits: Array.isArray(benefits) && benefits.length ? benefits : base.benefits,
    process: Array.isArray(process) && process.length ? process : base.process,
    ideal: parseJson<string[] | null>(o.idealJson, null) ?? base.ideal,
    faqs: Array.isArray(faqs) && faqs.length ? faqs : base.faqs,
    duration: str(o.duration, base.duration),
    longevity: str(o.longevity, base.longevity),
    anesthesia: str(o.anesthesia, base.anesthesia),
    featured: bool(o.featured) ?? base.featured,
  };
}

export type HeroSlideRow = {
  id: string; scope: string; sort: number; kind: "image" | "youtube";
  src: string; alt?: string; active: boolean;
};

export function mapHeroSlide(row: Record<string, unknown>): HeroSlideRow {
  const src = str(row.src);
  let kind: "image" | "youtube" = str(row.kind, "image") === "youtube" ? "youtube" : "image";
  if (kind === "image" && parseYouTubeId(src)) kind = "youtube";
  return {
    id: str(row.id),
    scope: str(row.scope, "home"),
    sort: num(row.sort, 0),
    kind,
    src,
    alt: ostr(row.alt),
    active: row.active === undefined ? true : Boolean(row.active),
  };
}

export function heroSlideRowToSlide(row: HeroSlideRow): HeroSlide {
  if (row.kind === "youtube") {
    const id = parseYouTubeId(row.src);
    if (id) return { type: "youtube", id };
    return { type: "image", src: row.src, alt: row.alt ?? "" };
  }
  return { type: "image", src: row.src, alt: row.alt ?? "" };
}

export function buildHomeHeroSlides(rows: HeroSlideRow[], videoUrls: string[]): HeroSlide[] {
  const images = rows
    .filter((r) => r.active && r.kind === "image")
    .sort((a, b) => a.sort - b.sort)
    .map(heroSlideRowToSlide);
  const dbVideos = rows
    .filter((r) => r.active && r.kind === "youtube")
    .sort((a, b) => a.sort - b.sort)
    .map(heroSlideRowToSlide)
    .filter((s) => s.type === "youtube");
  const settingsVideos = videoUrls
    .map(parseYouTubeId)
    .filter((id): id is string => Boolean(id))
    .map((id) => ({ type: "youtube", id }) as HeroSlide);
  const slides = buildHeroSlides(images, [...dbVideos, ...settingsVideos]);
  return slides.length ? slides : buildHeroSlides(homeHeroImages, settingsVideos);
}

/* ------------------------------------------------------------------ */
/*  Testimonials remain static (patient-submitted reviews live in the  */
/*  Review table and are moderated from the admin panel).              */
/* ------------------------------------------------------------------ */
export { staticTestimonials as testimonials };

/* ------------------------------------------------------------------ */
/*  Bilingual field resolution: prefer the Bangla twin when the site  */
/*  is in Bangla mode AND a non-empty twin exists.                     */
/* ------------------------------------------------------------------ */
export function pickBn<T>(en: T, bn: T | undefined | null, isBn: boolean): T {
  return isBn && bn !== undefined && bn !== null ? bn : en;
}
