import type { Lang } from "@/lib/data/dictionary";
import { dictionary } from "@/lib/data/dictionary";
import { services } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";
import { blogPosts } from "@/lib/data/blog";
import { generalFaqs } from "@/lib/data/faqs";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Global search index — powers the ⌘K / Ctrl+K command palette       */
/*  Flat, pre-localized list of everything searchable on the site:     */
/*  11 pages + 11 services + 4 doctors + 5 blog posts + 45 FAQs        */
/* ------------------------------------------------------------------ */

export type SearchGroup = "pages" | "services" | "doctors" | "blog" | "faqs";

export type SearchEntry = {
  id: string;
  group: SearchGroup;
  title: string; // localized (nameBn etc. when lang === "bn", EN fallback)
  /** Same title in the OTHER language — lets an English query rank the
   *  Bangla entry (and vice versa) in filterEntries' relevance score. */
  titleAlt?: string;
  description: string; // short localized subtitle (tagline / excerpt / question)
  href: string; // hash route WITHOUT leading "#", e.g. "/services/dental-implants"
  icon?: string; // lucide icon name (resolved by the palette component)
  /* Matching-only extra terms — tags, related slugs, the *other* language's
     title/description and curated cross-terms. Never rendered. This keeps
     queries working in both directions (Bangla text in EN mode and vice
     versa — same convention as the FAQ hub search). */
  keywords?: string;
};

/* Curated cross-terms for articles whose useful search vocabulary lives in
   the body, not the title/excerpt (e.g. "ব্যথা" should surface the root
   canal myths guide — patients looking for pain answers). */
const BLOG_KEYWORDS: Record<string, string> = {
  "invisalign-vs-braces-guide":
    "aligner braces comparison ইনভিজিলাইন ব্রেসেস",
  "root-canal-myths-facts":
    "pain ব্যথা",
};

/* Lucide icon names for the 11 static pages (resolved in site-search.tsx;
   service icons come from services.ts and resolve via icon-map.tsx). */
const PAGE_ICONS: Record<string, string> = {
  "/": "Home",
  "/about": "Info",
  "/services": "LayoutGrid",
  "/gallery": "Images",
  "/doctors": "Users",
  "/blog": "Newspaper",
  "/faqs": "CircleHelp",
  "/assessment": "ClipboardList",
  "/status": "CalendarClock",
  "/contact": "Phone",
  "/portal": "UserRound",
};

/** Word-boundary-safe truncation for FAQ answer previews. */
function truncate(text: string, max = 110): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function pageEntries(lang: Lang): SearchEntry[] {
  const d = dictionary[lang];
  const other = dictionary[lang === "en" ? "bn" : "en"];

  /* [href, localized title, localized description, other-language title,
     extra matching keywords?] — titles/descriptions come from the per-page
     dictionary sections. The optional 5th column adds page-specific search
     vocabulary (the portal page's title never says "portal", so its nav
     label + account/login terms are appended for both languages). */
  const rows: [string, string, string, string, string?][] = [
    ["/", `${d.home.hero.titleA} ${d.home.hero.titleB}`, d.home.hero.description, `${other.home.hero.titleA} ${other.home.hero.titleB}`],
    ["/about", d.about.title, d.about.description.replace("{site}", site.shortName), other.about.title],
    ["/services", d.servicesPage.title, d.servicesPage.description, other.servicesPage.title],
    ["/gallery", d.galleryPage.title, d.galleryPage.description, other.galleryPage.title],
    ["/doctors", d.doctorsPage.title, d.doctorsPage.description, other.doctorsPage.title],
    ["/blog", d.blogPage.title, d.blogPage.description, other.blogPage.title],
    ["/faqs", d.faqsPage.title, d.faqsPage.description, other.faqsPage.title],
    ["/assessment", d.assessmentPage.title, d.assessmentPage.description, other.assessmentPage.title],
    ["/status", d.statusPage.title, d.statusPage.description, other.statusPage.title],
    ["/contact", d.contactPage.title, d.contactPage.description, other.contactPage.title],
    [
      "/portal",
      d.portalPage.title,
      d.portalPage.description,
      other.portalPage.title,
      `${d.chrome.nav.portal} ${other.chrome.nav.portal} patient account login register dashboard bookings পেশেন্ট পোর্টাল অ্যাকাউন্ট`,
    ],
  ];

  return rows.map(([href, title, description, otherTitle, extraKeywords]) => ({
    id: `page:${href}`,
    group: "pages" as const,
    title,
    titleAlt: otherTitle,
    description,
    href,
    icon: PAGE_ICONS[href],
    keywords: `${otherTitle} ${d.chrome.nav.home} ${d.chrome.nav.services} ${d.chrome.nav.contact} ${extraKeywords ?? ""}`,
  }));
}

function serviceEntries(lang: Lang): SearchEntry[] {
  const bn = lang === "bn";
  return services.map((s) => ({
    id: `service:${s.slug}`,
    group: "services" as const,
    title: bn && s.nameBn ? s.nameBn : s.name,
    titleAlt: bn ? s.name : (s.nameBn ?? ""),
    description: bn && s.taglineBn ? s.taglineBn : s.tagline,
    href: `/services/${s.slug}`,
    icon: s.icon,
    /* both languages + category + related slugs (hyphenated slugs match
       per-word queries like "root canal") + the fuller excerpt */
    keywords: [
      s.name,
      s.shortName,
      s.tagline,
      s.excerpt,
      s.nameBn ?? "",
      s.shortNameBn ?? "",
      s.taglineBn ?? "",
      s.excerptBn ?? "",
      s.category,
      ...s.related,
    ]
      .filter(Boolean)
      .join(" "),
  }));
}

/* Patient vocabulary for doctors — people search for the specialist, not
   the department ("braces doctor", "root canal specialist", "kids dentist").
   Bangla variants included for BN-mode queries. */
const DOCTOR_KEYWORDS: Record<string, string> = {
  "dr-shazia-khanam":
    "orthodontist braces doctor aligner specialist অর্থোডন্টিস্ট ব্রেসেস ডাক্তার",
  "dr-abdur-rahim":
    "root canal specialist endodontist রুট ক্যানাল বিশেষজ্ঞ",
  "dr-jumla-binte-jafor":
    "implant surgeon oral surgery specialist ইমপ্ল্যান্ট সার্জন",
  "dr-israt-jahan-rimi":
    "kids dentist pediatric children dentist শিশু ডেন্টিস্ট",
};

function doctorEntries(lang: Lang): SearchEntry[] {
  const bn = lang === "bn";
  /* Doctor names render identically in both languages (site convention —
     no nameBn field on the Doctor type). */
  return doctors.map((doc) => ({
    id: `doctor:${doc.slug}`,
    group: "doctors" as const,
    title: doc.name,
    description: bn && doc.roleBn ? doc.roleBn : doc.role,
    href: `/appointment?doctor=${doc.slug}`,
    icon: "Stethoscope",
    keywords: [
      doc.role,
      doc.roleBn ?? "",
      doc.department,
      doc.departmentBn ?? "",
      ...doc.specializations,
      ...doc.credentials,
      DOCTOR_KEYWORDS[doc.slug] ?? "",
    ]
      .filter(Boolean)
      .join(" "),
  }));
}

function blogEntries(lang: Lang): SearchEntry[] {
  const bn = lang === "bn";
  return blogPosts.map((post) => ({
    id: `blog:${post.slug}`,
    group: "blog" as const,
    title: bn && post.titleBn ? post.titleBn : post.title,
    titleAlt: bn ? post.title : (post.titleBn ?? ""),
    description: bn && post.excerptBn ? post.excerptBn : post.excerpt,
    href: `/blog/${post.slug}`,
    icon: "BookOpen",
    /* both languages + tags + category + curated cross-terms */
    keywords: [
      post.title,
      post.excerpt,
      post.titleBn ?? "",
      post.excerptBn ?? "",
      post.category,
      ...post.tags,
      BLOG_KEYWORDS[post.slug] ?? "",
    ]
      .filter(Boolean)
      .join(" "),
  }));
}

function faqEntries(lang: Lang): SearchEntry[] {
  const bn = lang === "bn";
  const entries: SearchEntry[] = [];

  /* General FAQs — fully bilingual, land on the FAQ hub */
  for (const faq of generalFaqs) {
    entries.push({
      id: `faq:general:${faq.question.slice(0, 40)}`,
      group: "faqs",
      title: bn && faq.questionBn ? faq.questionBn : faq.question,
      titleAlt: bn ? faq.question : (faq.questionBn ?? ""),
      description: truncate(bn && faq.answerBn ? faq.answerBn : faq.answer),
      href: "/faqs",
      icon: "CircleHelp",
      keywords: [faq.question, faq.answer, faq.questionBn ?? "", faq.answerBn ?? ""]
        .filter(Boolean)
        .join(" "),
    });
  }

  /* Service FAQs — EN-only answers on the site (same convention as the FAQ
     hub); deep-link to the owning service page */
  for (const service of services) {
    for (const [i, faq] of service.faqs.entries()) {
      entries.push({
        id: `faq:${service.slug}:${i}`,
        group: "faqs",
        title: faq.question,
        description: truncate(faq.answer),
        href: `/services/${service.slug}`,
        icon: "CircleHelp",
        keywords: [service.name, service.nameBn ?? "", faq.question, faq.answer]
          .filter(Boolean)
          .join(" "),
      });
    }
  }

  return entries;
}

/** Build the full searchable index for a language (pure — safe to memoize). */
export function buildSearchIndex(lang: Lang): SearchEntry[] {
  return [
    ...pageEntries(lang),
    ...serviceEntries(lang),
    ...doctorEntries(lang),
    ...blogEntries(lang),
    ...faqEntries(lang),
  ];
}

/** Group render order for the palette. */
export const SEARCH_GROUP_ORDER: SearchGroup[] = [
  "pages",
  "services",
  "doctors",
  "blog",
  "faqs",
];

/** Scored result (relevance-ranked search hit). */
export type ScoredEntry = { entry: SearchEntry; score: number };

/**
 * Multi-word, order-independent, case-insensitive matching.
 * EVERY whitespace-separated word must appear somewhere in the entry's
 * title, description or keywords (substring match — Bangla toLowerCase is
 * a no-op, so both languages work). Empty queries match everything.
 *
 * Relevance ranking: entries whose TITLE contains the query words rank
 * above mere keyword/answer mentions (e.g. "root canal" puts the root
 * canal treatment page first, not a crown that merely references it).
 * Ties keep index order (sort is stable).
 */
export function filterEntriesScored(
  entries: SearchEntry[],
  query: string
): ScoredEntry[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return entries.map((entry) => ({ entry, score: 0 }));
  const scored: ScoredEntry[] = [];
  for (const entry of entries) {
    const title = entry.title.toLowerCase();
    const titleAlt = (entry.titleAlt ?? "").toLowerCase();
    const description = entry.description.toLowerCase();
    const haystack = `${title} ${titleAlt} ${description} ${entry.keywords ?? ""}`.toLowerCase();
    if (!words.every((word) => haystack.includes(word))) continue;
    let score = 0;
    for (const word of words) {
      if (title.includes(word) || titleAlt.includes(word)) score += 3;
      else if (description.includes(word)) score += 1;
    }
    scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

/** Un-scored convenience wrapper (kept for any future callers). */
export function filterEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  return filterEntriesScored(entries, query).map((s) => s.entry);
}
