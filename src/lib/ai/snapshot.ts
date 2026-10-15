/* ------------------------------------------------------------------ */
/*  Public AI data snapshot — builder behind GET /api/ai/content.       */
/*  Pure function: ContentBundle (+ live review rating) → stable,       */
/*  self-describing JSON shaped for LLM / answer-engine consumption.    */
/*  Field names are stable; bilingual fields are always present and     */
/*  null when the Bangla variant is unavailable. Every resource URL     */
/*  is absolute over the canonical origin.                              */
/* ------------------------------------------------------------------ */

import type { ContentBundle } from "@/lib/content/shared";
import {
  AI_BASE,
  AI_ASK_URL,
  AI_CONTENT_URL,
  AI_DOCS_URL,
} from "@/lib/ai/core";

export type AiRating = {
  average: number;
  count: number;
  source: string;
};

export type AiContentOptions = {
  /** `?include=full` — also emit blog sections (and service overviews). */
  includeFull?: boolean;
  /** Live aggregate over approved patient reviews (supplied by the route). */
  rating?: AiRating;
};

const DEFAULT_RATING: AiRating = {
  average: 4.9,
  count: 3200,
  source: "clinic-reported patient rating",
};

/* Machine-readable opening hours — mirrors the Dentist JSON-LD emitted
   in src/app/layout.tsx and the settings hours (Sat–Thu 10:00–21:00,
   Friday closed with emergency on call). */
const OPENING_HOURS_SPECIFICATION = [
  {
    dayOfWeek: [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
    ],
    opens: "10:00",
    closes: "21:00",
  },
];

/* The Doctor domain type may or may not expose `photo` (admin-uploaded
   portraits are being added to the doctor CMS concurrently) — read it
   defensively so the snapshot picks the field up either way. */
function doctorPhoto(doc: unknown): string | null {
  const p = (doc as { photo?: unknown }).photo;
  return typeof p === "string" && p.trim() ? p.trim() : null;
}

/** Relative site path → absolute canonical URL (absolutes pass through). */
function absoluteUrl(path: string | null | undefined): string | null {
  if (!path || !path.trim()) return null;
  const p = path.trim();
  if (/^https?:\/\//i.test(p)) return p;
  return `${AI_BASE}${p.startsWith("/") ? "" : "/"}${p}`;
}

export function buildAiContentSnapshot(
  bundle: ContentBundle,
  opts: AiContentOptions = {}
) {
  const { settings, home } = bundle;
  const includeFull = opts.includeFull === true;
  const rating = opts.rating ?? DEFAULT_RATING;

  const services = bundle.services.map((s) => ({
    slug: s.slug,
    name: s.name,
    nameBn: s.nameBn ?? null,
    shortName: s.shortName,
    category: s.category,
    duration: s.duration,
    longevity: s.longevity,
    anesthesia: s.anesthesia,
    tagline: s.tagline,
    taglineBn: s.taglineBn ?? null,
    summary: s.excerpt,
    summaryBn: s.excerptBn ?? null,
    quickAnswer: s.faqs[0]
      ? { question: s.faqs[0].question, answer: s.faqs[0].answer }
      : null,
    faqs: s.faqs.map((f) => ({ question: f.question, answer: f.answer })),
    url: `${AI_BASE}/services/${s.slug}`,
    ...(includeFull ? { overview: s.overview } : {}),
  }));

  const doctors = bundle.doctors.map((d) => ({
    slug: d.slug,
    name: d.name,
    role: d.role,
    roleBn: d.roleBn ?? null,
    department: d.department,
    credentials: d.credentials,
    specializations: d.specializations,
    experienceYears: d.experienceYears,
    patientsTreated: d.patientsTreated,
    rating: d.rating,
    languages: d.languages,
    consultationDays: d.consultationDays,
    bio: d.bio,
    photo: absoluteUrl(doctorPhoto(d)),
    url: `${AI_BASE}/doctors/${d.slug}`,
  }));

  const faqs = bundle.faqs.map((f) => ({
    question: f.question,
    answer: f.answer,
    questionBn: f.questionBn ?? null,
    answerBn: f.answerBn ?? null,
    url: `${AI_BASE}/faqs`,
  }));

  const posts = bundle.posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    titleBn: p.titleBn ?? null,
    quickAnswer: p.quickAnswer,
    quickAnswerBn: p.quickAnswerBn ?? null,
    excerpt: p.excerpt,
    excerptBn: p.excerptBn ?? null,
    category: p.category,
    tags: p.tags,
    readTime: p.readTime,
    published: p.date,
    updated: p.updated,
    author: { name: p.author, credentials: p.authorCredentials },
    url: `${AI_BASE}/blog/${p.slug}`,
    ...(includeFull
      ? { sections: p.sections, sectionsBn: p.sectionsBn ?? null }
      : {}),
  }));

  const smileCases = bundle.cases.map((c) => ({
    id: c.id,
    title: c.title,
    treatment: c.treatment,
    serviceSlug: c.serviceSlug,
    serviceUrl: `${AI_BASE}/services/${c.serviceSlug}`,
    patient: c.patient,
    age: c.age,
    duration: c.duration,
    procedures: c.procedures,
    result: c.result,
    beforeImage: absoluteUrl(c.beforeSrc),
    afterImage: absoluteUrl(c.afterSrc),
    url: `${AI_BASE}/gallery`,
  }));

  const serviceFaqCount = bundle.services.reduce(
    (n, s) => n + s.faqs.length,
    0
  );

  const counts = {
    services: services.length,
    doctors: doctors.length,
    faqs: faqs.length + serviceFaqCount,
    generalFaqs: faqs.length,
    serviceFaqs: serviceFaqCount,
    blogPosts: posts.length,
    smileCases: smileCases.length,
  };

  return {
    _meta: {
      name: "Aristocrat Dental Care & Orthodontic Center — public AI data",
      description: `Machine-readable snapshot of ${AI_BASE}, a bilingual (English / বাংলা) dental clinic in Uttara, Dhaka, Bangladesh: clinic identity and hours, ${counts.services} specialty treatments, ${counts.doctors} doctors, ${counts.faqs} answered FAQs, ${counts.blogPosts} blog quick-answers and smile-case results.`,
      generatedAt: new Date().toISOString(),
      docs: AI_DOCS_URL,
      endpoints: {
        content: AI_CONTENT_URL,
        ask: AI_ASK_URL,
      },
      license: `Public data for AI assistants and answer engines — free to fetch, cache and quote with attribution to Aristocrat Dental Care & Orthodontic Center (${AI_BASE}).`,
      siteUrl: AI_BASE,
      languages: ["en", "bn"],
      include: includeFull ? "full" : "summary",
      includeNote:
        "summary keeps blog posts to quickAnswer + excerpt; append ?include=full for full article sections.",
      counts,
    },
    clinic: {
      name: settings.name,
      shortName: settings.shortName,
      tagline: settings.tagline,
      taglineBn: settings.taglineBn ?? null,
      type: "Dental clinic & orthodontic center",
      founded: settings.established,
      address: {
        full: settings.address,
        short: settings.addressShort,
        locality: "Uttara",
        region: "Dhaka",
        country: "Bangladesh",
        countryCode: "BD",
        geo: { latitude: 23.874, longitude: 90.379 },
      },
      phone: settings.phone,
      phoneInternational: settings.phoneRaw,
      emergencyPhone: settings.emergencyPhone,
      email: settings.email,
      hours: {
        regular: settings.hours,
        regularBn: settings.hoursBn ?? null,
        friday: settings.hoursFriday,
        fridayBn: settings.hoursFridayBn ?? null,
        timezone: "Asia/Dhaka",
        openingHoursSpecification: OPENING_HOURS_SPECIFICATION,
      },
      languages: ["English", "বাংলা (Bengali)"],
      social: {
        facebook: settings.facebook,
        instagram: settings.instagram,
        linkedin: settings.linkedin,
      },
      links: {
        home: AI_BASE,
        about: `${AI_BASE}/about`,
        services: `${AI_BASE}/services`,
        doctors: `${AI_BASE}/doctors`,
        blog: `${AI_BASE}/blog`,
        faqs: `${AI_BASE}/faqs`,
        gallery: `${AI_BASE}/gallery`,
        smileAssessment: `${AI_BASE}/assessment`,
        appointment: `${AI_BASE}/appointment`,
        contact: `${AI_BASE}/contact`,
        llms: AI_DOCS_URL,
      },
    },
    stats: {
      patientsServed: settings.patientsServed,
      established: settings.established,
      ...counts,
      display: home.stats.map((s) => ({
        value: s.value,
        suffix: s.suffix,
        label: s.label,
        labelBn: s.labelBn ?? null,
      })),
    },
    rating: {
      average: rating.average,
      count: rating.count,
      best: 5,
      source: rating.source,
    },
    services,
    doctors,
    faqs,
    posts,
    smileCases,
  };
}
