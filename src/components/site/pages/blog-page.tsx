"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Facebook,
  LayoutGrid,
  Lightbulb,
  Link2,
  ListTree,
  Mail,
  MessageCircle,
  Search,
  Share2,
  Stethoscope,
  Tag,
  Twitter,
  Users,
  X,
} from "lucide-react";
import { usePageMeta, useRouter } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useBundle, useRouteHeroSlides } from "@/components/site/content-provider";
import { DynamicIcon } from "@/components/site/icon-map";
import { PageHeader, CtaBanner } from "@/components/site/shared";
import { Reveal, SectionHeading } from "@/components/site/motion";
import { HeroBackdrop } from "@/components/site/hero-backdrop";
import { NotFoundPage } from "@/components/site/pages/not-found-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { BlogPost } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

/* "8 min read" → "৮ মিনিট পাঠ" when Bangla */
function localizeReadTime(readTime: string, bn: boolean, minRead: string) {
  if (!bn) return readTime;
  const n = readTime.match(/\d+/)?.[0] ?? "";
  return n ? `${toBnDigits(n)} ${minRead}` : readTime;
}

/* "Dr. Shazia Khanam" → "SK" */
function initialsOf(name: string) {
  return name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

/* Localized post date (bn-BD renders Bangla digits + month names) */
function formatPostDate(
  date: string,
  bn: boolean,
  opts?: Intl.DateTimeFormatOptions
) {
  return new Date(date).toLocaleDateString(
    bn ? "bn-BD" : "en-GB",
    opts ?? { day: "numeric", month: "short", year: "numeric" }
  );
}

function localizeCount(bn: boolean, v: number) {
  return bn ? toBnDigits(String(v)) : String(v);
}

/* Bangla conjunct-insensitive comparison aid: removes hasanta (U+09CD),
   ZWNJ and ZWJ so spelling variants like ইম্প্ল্যান্ট / ইমপ্ল্যান্ট match. */
function stripBnMarks(s: string) {
  return s.replace(/[\u09cd\u200c\u200d]/g, "");
}

/* ------------------------------------------------------------------ */
/*  Article card — shared by the blog index grid + "Related reading"   */
/* ------------------------------------------------------------------ */

function PostCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.blogPage;
  const title = bn && post.titleBn ? post.titleBn : post.title;
  const excerpt = bn && post.excerptBn ? post.excerptBn : post.excerpt;
  const categoryLabel =
    d.blogCategories[post.category as keyof typeof d.blogCategories] ??
    post.category;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
      className="h-full"
    >
      <a
        href={`/blog/${post.slug}`}
        className="card-shine group flex h-full flex-col overflow-hidden rounded-3xl border border-blue-100/80 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-blue/30 hover:shadow-[0_24px_50px_-16px_rgba(30,125,255,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        aria-label={`${t.readMore}: ${title}`}
      >
        {/* cover */}
        {post.image ? (
          <div className="zoom-img relative h-44 w-full overflow-hidden">
            <Image
              src={post.image}
              alt={post.imageAlt ?? title}
              width={448}
              height={256}
              className="h-full w-full object-cover"
            />
            <span
              className="absolute inset-0 bg-gradient-to-t from-brand-navy/45 via-brand-navy/5 to-transparent"
              aria-hidden="true"
            />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue backdrop-blur">
              {categoryLabel}
            </span>
          </div>
        ) : (
          <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-blue-50 via-ice to-blue-100/70">
            <BookOpen
              className="h-10 w-10 text-brand-blue/40"
              aria-hidden="true"
            />
            <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue ring-1 ring-blue-100">
              {categoryLabel}
            </span>
          </div>
        )}

        <div className="flex flex-1 flex-col p-6 pt-5">
          {/* meta row */}
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            <span>{formatPostDate(post.date, bn)}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" aria-hidden="true" />
              {localizeReadTime(post.readTime, bn, t.minRead)}
            </span>
          </div>

          <h3 className="font-heading mt-2.5 line-clamp-2 text-lg font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue">
            {title}
          </h3>
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
            {excerpt}
          </p>

          {/* tags preview */}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-blue-100 bg-ice text-[11px] font-medium text-brand-navy"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* author chip */}
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-blue-50 pt-4">
            <span className="inline-flex min-w-0 items-center gap-2">
              <Avatar className="h-8 w-8 border border-blue-100">
                <AvatarFallback className="bg-ice font-heading text-[11px] font-bold text-brand-navy">
                  {initialsOf(post.author)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs font-semibold text-brand-navy">
                {post.author}
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-blue">
              {t.readMore}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </a>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar newsletter mini-card (POST /api/newsletter)                */
/* ------------------------------------------------------------------ */

function SidebarNewsletter() {
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.blogPage;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="rounded-3xl border border-blue-100/80 bg-ice p-5">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-blue ring-1 ring-blue-100">
        <Mail className="h-4 w-4" aria-hidden="true" />
      </span>
      <h2 className="font-heading mt-3 text-base font-bold text-brand-navy">
        {t.newsletterTitle}
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
        {t.newsletterText}
      </p>
      {state === "done" ? (
        <div
          className="mt-4 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200"
          role="status"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t.newsletterDone}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-emerald-600">
            {t.newsletterDoneDesc}
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-2">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") setState("idle");
            }}
            placeholder={t.newsletterPlaceholder}
            aria-label={t.newsletterPlaceholder}
            className="h-11 rounded-full border-blue-200/80 bg-white text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-brand-blue"
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white shadow-lg shadow-navy-900/20 transition-all duration-300 hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {state === "sending" ? "…" : t.newsletterCta}
          </button>
          {state === "error" && (
            <p className="text-xs text-red-500" role="alert">
              {t.newsletterFail} — {t.newsletterFailDesc}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BLOG LIST PAGE (EN / বাংলা) — magazine experience                  */
/* ------------------------------------------------------------------ */

const PAGE_SIZE_INITIAL = 9;
const PAGE_SIZE_MORE = 6;

export function BlogPage() {
  const [category, setCategory] = useState("All");
  const { query } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.blogPage;
  const { posts } = useBundle();

  usePageMeta({
    title: "Dental Health Blog — Expert Advice from Uttara's Trusted Dentists",
    description:
      "Evidence-based dental health guides from Aristocrat Dental Care specialists: checkup frequency, root canal facts, Invisalign vs braces, kids' dental care & more.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Aristocrat Dental Care Health Blog",
      url: "https://aristocratdentalcarebd.com/blog",
      publisher: { "@type": "Organization", name: "Aristocrat Dental Care & Orthodontic Center" },
    },
  });

  /* ?q= deep-link prefill (tag chips on article pages link here).
     The typed value is keyed against the URL query so navigating to
     /blog?q=… adopts it instantly, while typing never rewrites the URL. */
  const qParam = query.get("q") ?? "";
  const [searchState, setSearchState] = useState({ q: qParam, value: qParam });
  const search = searchState.q === qParam ? searchState.value : qParam;
  const setSearch = (v: string) => setSearchState({ q: qParam, value: v });

  const searching = search.trim().length > 0;

  /* Category chips — derived from the live posts (same as the static list) */
  const blogCategories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts]
  );

  /* Category filter combined with text search (EN + BN content + tags).
     Bangla conjuncts can be typed several ways (ইম্প্ল্যান্ট vs ইমপ্ল্যান্ট —
     hasanta placement varies), so BN fields are matched with virama
     (U+09CD) and joiners stripped from BOTH sides; English matching stays
     an exact substring. An exact hit always implies a loose hit, so the
     BN checks collapse into the loose comparison. */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qLoose = stripBnMarks(q);
    return posts.filter((p) => {
      const matchCategory = category === "All" || p.category === category;
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (qLoose.length > 0 &&
          ((p.titleBn
            ? stripBnMarks(p.titleBn.toLowerCase()).includes(qLoose)
            : false) ||
            (p.excerptBn
              ? stripBnMarks(p.excerptBn.toLowerCase()).includes(qLoose)
              : false)));
      return matchCategory && matchSearch;
    });
  }, [posts, category, search]);

  /* pagination — derived against the active filter key so "load more"
     resets automatically whenever the category or search changes */
  const filterKey = `${category}|${search}`;
  const [pageState, setPageState] = useState({
    key: filterKey,
    visible: PAGE_SIZE_INITIAL,
  });
  const visible =
    pageState.key === filterKey ? pageState.visible : PAGE_SIZE_INITIAL;
  const showMore = () =>
    setPageState({ key: filterKey, visible: visible + PAGE_SIZE_MORE });

  const featured = posts.find((p) => p.featured) ?? posts[0];
  /* The large featured card appears only on the unfiltered view; while
     searching or inside a category every match lives in the grid (so the
     visible count always matches the "Showing X articles" text). */
  const showFeatured = !searching && category === "All" && Boolean(featured);
  const rest = showFeatured
    ? filtered.filter((p) => p.slug !== featured.slug)
    : filtered;
  const shown = rest.slice(0, visible);
  const hasMore = rest.length > visible;

  /* stats strip — computed from the live bundle */
  const stats = useMemo(
    () => ({
      guides: posts.length,
      topics: new Set(posts.map((p) => p.category)).size,
      authors: new Set(posts.map((p) => p.author)).size,
    }),
    [posts]
  );

  /* sidebar "latest articles" — 5 most recent by publish date */
  const latestPosts = useMemo(
    () => [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [posts]
  );

  const resultCountText = t.searchResults.replace(
    "{count}",
    localizeCount(bn, rest.length)
  );
  const showingOfText = t.showingOf
    .replace("{shown}", localizeCount(bn, shown.length))
    .replace("{total}", localizeCount(bn, rest.length));

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
  };

  const featuredTitle =
    bn && featured?.titleBn ? featured.titleBn : featured?.title ?? "";

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[{ label: d.chrome.nav.home, to: "/" }, { label: d.chrome.nav.blog }]}
      />

      {/* Stats strip — floats over the hero's lower edge */}
      <section className="relative z-10 mx-auto -mt-9 max-w-4xl px-4 sm:-mt-12 sm:px-6">
        <Reveal>
          <dl className="grid grid-cols-3 divide-x divide-blue-100 rounded-3xl border border-blue-100/80 bg-white/95 p-4 shadow-[0_18px_50px_-24px_rgba(0,32,96,0.28)] backdrop-blur sm:p-6">
            <div className="flex flex-col items-center gap-1 px-2 text-center">
              <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <BookOpen className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                {t.statsGuides}
              </dt>
              <dd className="font-heading text-2xl font-bold tabular-nums text-brand-navy sm:text-3xl">
                {localizeCount(bn, stats.guides)}
              </dd>
            </div>
            <div className="flex flex-col items-center gap-1 px-2 text-center">
              <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <LayoutGrid className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                {t.statsTopics}
              </dt>
              <dd className="font-heading text-2xl font-bold tabular-nums text-brand-navy sm:text-3xl">
                {localizeCount(bn, stats.topics)}
              </dd>
            </div>
            <div className="flex flex-col items-center gap-1 px-2 text-center">
              <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <Users className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                {t.statsAuthors}
              </dt>
              <dd className="font-heading text-2xl font-bold tabular-nums text-brand-navy sm:text-3xl">
                {localizeCount(bn, stats.authors)}
              </dd>
            </div>
          </dl>
        </Reveal>
      </section>

      {/* Featured post — large image card with gradient overlay (hidden while searching) */}
      {showFeatured && (
        <section className="py-12 sm:py-16" aria-label="Featured article">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <a
                href={`/blog/${featured.slug}`}
                className="group relative flex min-h-[480px] flex-col overflow-hidden rounded-[2rem] shadow-[0_24px_60px_-24px_rgba(0,32,96,0.45)] ring-1 ring-blue-100/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_32px_70px_-24px_rgba(30,125,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                aria-label={`${t.readGuide}: ${featuredTitle}`}
              >
                {featured.image && (
                  <Image
                    src={featured.image}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                  />
                )}
                <span
                  className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/85 to-brand-navy/45 sm:bg-gradient-to-r sm:from-brand-navy sm:via-brand-navy/90 sm:to-brand-navy/35"
                  aria-hidden="true"
                />
                <div
                  className="dot-grid-light pointer-events-none absolute inset-0 opacity-30"
                  aria-hidden="true"
                />

                <div className="relative z-10 m-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
                  <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300 ring-1 ring-amber-300/25">
                          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                          {t.featured}
                        </span>
                        <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-blue-200 ring-1 ring-white/15">
                          {d.blogCategories[featured.category as keyof typeof d.blogCategories] ?? featured.category}
                        </span>
                      </div>
                      <h2 className="font-heading mt-4 max-w-2xl text-2xl font-bold leading-snug text-white text-balance sm:text-3xl lg:text-4xl">
                        {featuredTitle}
                      </h2>
                      <p className="mt-4 max-w-xl text-sm leading-relaxed text-blue-100/85 sm:text-base">
                        {bn && featured.excerptBn ? featured.excerptBn : featured.excerpt}
                      </p>
                      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-blue-100/80">
                        <span className="inline-flex items-center gap-2">
                          <Avatar className="h-9 w-9 border border-white/25">
                            <AvatarFallback className="bg-white/10 font-heading text-xs font-bold text-white">
                              {initialsOf(featured.author)}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            <span className="block font-semibold text-white">
                              {featured.author}
                            </span>
                            <span className="block text-[11px] text-blue-200/75">
                              {featured.authorCredentials}
                            </span>
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatPostDate(featured.date, bn)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                          {localizeReadTime(featured.readTime, bn, t.minRead)}
                        </span>
                      </div>
                      <span className="btn-shine mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-navy shadow-xl transition-all duration-300 group-hover:gap-3">
                        {t.readGuide}
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>

                    {/* quick-answer glass card */}
                    <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-md sm:p-6">
                      <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {t.quickAnswer}
                      </span>
                      <p className="mt-2.5 text-sm leading-relaxed text-blue-50">
                        {(bn && featured.quickAnswerBn
                          ? featured.quickAnswerBn
                          : featured.quickAnswer
                        ).slice(0, 180)}
                        …
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {featured.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-blue-100 ring-1 ring-white/10"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </Reveal>
          </div>
        </section>
      )}

      {/* Search + category chips + article grid + desktop sidebar */}
      <section className="pb-16 sm:pb-20" aria-label={t.allArticles}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="sr-only">{t.allArticles}</h2>
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-12">
            {/* Main column */}
            <div className="min-w-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search — filters by title, excerpt, category and tags (EN + BN) */}
                <div className="relative w-full sm:w-64">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchPlaceholder}
                    className="h-11 rounded-full border-blue-200/80 bg-white pl-11 pr-11 text-sm shadow-sm ring-1 ring-transparent transition-all placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:shadow-md [&::-webkit-search-cancel-button]:hidden"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label={t.searchClear}
                      title={t.searchClear}
                      className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-blue-50 hover:text-brand-navy"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <div className="scroll-area flex flex-1 items-center gap-2 overflow-x-auto pb-2">
                  <Tag className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  {blogCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      aria-pressed={category === c}
                      className={cn(
                        "min-h-11 shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
                        category === c
                          ? "bg-brand-blue text-white shadow-lg shadow-blue-500/30"
                          : "bg-blue-50 text-brand-navy hover:bg-blue-100"
                      )}
                    >
                      {d.blogCategories[c as keyof typeof d.blogCategories] ?? c}
                      <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
                        {localizeCount(
                          bn,
                          c === "All"
                            ? posts.length
                            : posts.filter((p) => p.category === c).length
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {(searching || category !== "All") && rest.length > 0 && (
                <p className="mt-6 text-sm text-slate-500" aria-live="polite">
                  {resultCountText}
                </p>
              )}

              <AnimatePresence mode="wait">
                {rest.length > 0 ? (
                  <motion.div
                    key={`${category}-${search}`}
                    className="mt-8 grid gap-6 sm:grid-cols-2"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    {shown.map((post, i) => (
                      <PostCard key={post.slug} post={post} index={i} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className="mx-auto mt-8 max-w-md rounded-3xl border border-dashed border-blue-200 bg-ice p-10 text-center sm:p-12"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white ring-1 ring-blue-100">
                      <Search className="h-6 w-6 text-brand-blue/60" aria-hidden="true" />
                    </span>
                    <h3 className="font-heading mt-4 text-base font-bold text-brand-navy">
                      {t.noResultsTitle}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {t.noResults}
                    </p>
                    {(searching || category !== "All") && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-navy px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-navy-900/20 transition-all duration-300 hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                        {t.clearFilters}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Load more */}
              {hasMore && (
                <div className="mt-10 text-center">
                  <p className="text-xs text-slate-400" aria-live="polite">
                    {showingOfText}
                  </p>
                  <button
                    type="button"
                    onClick={showMore}
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-blue-200 bg-white px-8 py-3 text-sm font-bold text-brand-navy shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-blue/40 hover:text-brand-blue hover:shadow-lg hover:shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                  >
                    {t.loadMore}
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            {/* Desktop sidebar */}
            <aside className="mt-12 space-y-6 lg:mt-0">
              {/* Browse by category */}
              <nav
                className="rounded-3xl border border-blue-100/80 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(0,32,96,0.18)]"
                aria-label={t.browseCategories}
              >
                <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                  <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                  {t.browseCategories}
                </h2>
                <ul className="mt-3 space-y-1">
                  {blogCategories.map((c) => {
                    const count =
                      c === "All"
                        ? posts.length
                        : posts.filter((p) => p.category === c).length;
                    const isActive = category === c;
                    return (
                      <li key={c}>
                        <button
                          type="button"
                          onClick={() => setCategory(c)}
                          aria-current={isActive ? "true" : undefined}
                          className={cn(
                            "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
                            isActive
                              ? "bg-blue-50 font-semibold text-brand-blue"
                              : "text-slate-600 hover:bg-ice hover:text-brand-navy"
                          )}
                        >
                          <span className="leading-snug">
                            {d.blogCategories[c as keyof typeof d.blogCategories] ?? c}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
                              isActive
                                ? "bg-brand-blue text-white"
                                : "bg-blue-50 text-brand-blue"
                            )}
                          >
                            {localizeCount(bn, count)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Latest articles — top 5 by date */}
              <div className="rounded-3xl border border-blue-100/80 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(0,32,96,0.18)]">
                <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  {t.latestArticles}
                </h2>
                <ul className="mt-3 space-y-1">
                  {latestPosts.map((p) => {
                    const title = bn && p.titleBn ? p.titleBn : p.title;
                    return (
                      <li key={p.slug}>
                        <a
                          href={`/blog/${p.slug}`}
                          aria-label={`${t.readMore}: ${title}`}
                          className="group flex items-start gap-3 rounded-xl p-2 transition-colors duration-300 hover:bg-ice focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                        >
                          {p.image && (
                            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-blue-100">
                              <Image
                                src={p.image}
                                alt=""
                                width={112}
                                height={112}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="line-clamp-2 text-sm font-semibold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue">
                              {title}
                            </span>
                            <span className="mt-1 block text-[11px] text-slate-400">
                              {formatPostDate(p.date, bn)}
                            </span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Book appointment + newsletter — sticky on desktop */}
              <div className="space-y-6 lg:sticky lg:top-24">
                <div className="hero-mesh-dark relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_18px_45px_-18px_rgba(0,32,96,0.5)]">
                  <div
                    className="dot-grid-light pointer-events-none absolute inset-0 opacity-30"
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <h2 className="font-heading text-lg font-bold text-white">
                      {t.sidebarBookTitle}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-blue-100/85">
                      {t.sidebarBookText}
                    </p>
                    <a
                      href="/appointment"
                      className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-navy shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                      {t.bookConsultation}
                    </a>
                    <a
                      href="tel:+8801715027522"
                      className="mt-3 flex items-center gap-2 text-xs text-blue-100/85 transition-colors hover:text-white"
                    >
                      {t.sidebarCallNote}: 01715-027522
                    </a>
                  </div>
                </div>
                <SidebarNewsletter />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CtaBanner
        title={t.ctaTitle}
        description={t.ctaDescription}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  BLOG DETAIL PAGE — premium reading experience (EN / বাংলা)         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Reading progress bar — top of viewport while reading an article    */
/* ------------------------------------------------------------------ */

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(1, el.scrollTop / total) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="reading-progress"
      style={{
        transform: `scaleX(${progress})`,
        /* Lift ABOVE the site-wide ScrollProgress (z-[70]) so the bar a
           reader sees on an article page is the article reading bar; the
           navy→blue→gold ramp matches the brand gradient family. */
        zIndex: 80,
        backgroundImage:
          "linear-gradient(90deg, #012c5f 0%, #1e7dff 60%, #f59e0b 100%)",
      }}
      aria-hidden="true"
    />
  );
}

/* Active-section tracking for the article table of contents.
   `routeKey` (the post slug) re-runs the observer when navigating
   between articles that happen to have the same section count; the
   active index is DERIVED against the key so it resets on navigation
   without setState-in-effect. */
function useActiveSection(count: number, routeKey: string) {
  const [state, setState] = useState({ key: routeKey, active: 0 });
  const active = state.key === routeKey ? state.active : 0;

  useEffect(() => {
    if (count < 2) return;
    const headings = Array.from({ length: count }, (_, i) =>
      document.getElementById(`section-${i}`)
    );
    const visible = headings.filter(Boolean) as HTMLElement[];
    if (visible.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.id.replace("section-", ""));
            setState({ key: routeKey, active: idx });
          }
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );
    visible.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [count, routeKey]);
  return [active, (i: number) => setState({ key: routeKey, active: i })] as const;
}

/* Numbered TOC entries — shared by the desktop sticky sidebar
   and the mobile collapsible accordion. */
function TocList({
  post,
  activeSection,
  onNavigate,
}: {
  post: BlogPost;
  activeSection: number;
  onNavigate: (i: number) => void;
}) {
  const { lang } = useLang();
  const bn = lang === "bn";
  return (
    <ol className="mt-3 space-y-1">
      {post.sections.map((section, i) => {
        const label = bn
          ? post.sectionsBn?.[i]?.heading ?? section.heading
          : section.heading;
        const isActive = activeSection === i;
        return (
          <li key={section.heading}>
            <button
              type="button"
              onClick={() => onNavigate(i)}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
                isActive
                  ? "bg-blue-50 font-semibold text-brand-blue"
                  : "text-slate-600 hover:bg-ice hover:text-brand-navy"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tabular-nums transition-colors",
                  isActive
                    ? "bg-brand-blue text-white"
                    : "bg-blue-50 text-brand-blue"
                )}
              >
                {bn ? toBnDigits(i + 1) : i + 1}
              </span>
              <span className="leading-snug">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* Prev / next post navigation card */
function PostNavCard({
  post,
  direction,
}: {
  post: BlogPost;
  direction: "prev" | "next";
}) {
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.blogPage;
  const title = bn && post.titleBn ? post.titleBn : post.title;
  const label = direction === "prev" ? t.prevArticle : t.nextArticle;
  return (
    <a
      href={`/blog/${post.slug}`}
      aria-label={`${label}: ${title}`}
      className={cn(
        "group flex items-center gap-4 rounded-3xl border border-blue-100/80 bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_18px_40px_-16px_rgba(30,125,255,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
        direction === "next" && "sm:flex-row-reverse sm:text-right"
      )}
    >
      {direction === "prev" ? (
        <ArrowLeft
          className="h-5 w-5 shrink-0 text-brand-blue transition-transform duration-300 group-hover:-translate-x-1"
          aria-hidden="true"
        />
      ) : (
        <ArrowRight
          className="h-5 w-5 shrink-0 text-brand-blue transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      )}
      {post.image && (
        <span className="relative hidden h-14 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-blue-100 sm:block">
          <Image
            src={post.image}
            alt=""
            width={160}
            height={112}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-brand-blue">
          {label}
        </span>
        <span className="font-heading mt-1 line-clamp-2 block text-sm font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue sm:text-[15px]">
          {title}
        </span>
      </span>
    </a>
  );
}

export function BlogDetailPage({ slug }: { slug: string }) {
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.blogPage;
  const { posts, services, doctors } = useBundle();
  const heroSlides = useRouteHeroSlides("blog");
  const post = posts.find((p) => p.slug === slug);
  const [activeSection, setActiveSection] = useActiveSection(
    post?.sections.length ?? 0,
    slug
  );
  /* mobile "On this page" accordion — derived against the slug so it
     collapses automatically when navigating to another article */
  const [tocState, setTocState] = useState<{ slug: string; open: boolean }>({
    slug,
    open: false,
  });
  const tocOpen = tocState.slug === slug && tocState.open;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  /* pending mobile-TOC scroll timer — cleared on rapid re-taps */
  const tocScrollTimer = useRef<number | null>(null);

  const goToSection = (i: number) => {
    /* NOTE: never use href="#section-x" — a plain hash would collide
       with legacy hash-route handling; smooth-scroll programmatically */
    setActiveSection(i);
    const doScroll = () => {
      const el = document.getElementById(`section-${i}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      el?.focus({ preventScroll: true });
    };
    if (tocScrollTimer.current) window.clearTimeout(tocScrollTimer.current);
    if (tocOpen) {
      /* Collapse the mobile accordion BEFORE scrolling: its 300ms height
         animation shifts the layout above the target mid-flight, which
         aborts Chrome's programmatic smooth scroll partway (measured at
         390px: stopped ~1000px short of the heading). Waiting one frame
         past the collapse keeps the jump smooth. */
      setTocState({ slug, open: false });
      tocScrollTimer.current = window.setTimeout(doScroll, 340);
    } else {
      setTocState({ slug, open: false });
      doScroll();
    }
  };

  /* Deep-linkable article URL (falls back to the canonical production URL) */
  const pageUrl =
    typeof window === "undefined"
      ? `https://aristocratdentalcarebd.com/blog/${slug}`
      : `${window.location.origin}/blog/${slug}`;
  const shareTitle = bn && post?.titleBn ? post.titleBn : post?.title ?? "Dental health article";
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} — ${pageUrl}`)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(pageUrl)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      toast({
        title: t.shareCopied,
        description: t.shareCopiedDesc,
      });
      window.setTimeout(() => setCopied(false), 2600);
    } catch {
      toast({
        title: t.shareFail,
        description: t.shareFailDesc,
        variant: "destructive",
      });
    }
  };

  /* AEO: full BlogPosting (headline, author Person w/ worksFor, dates,
     image, keywords, wordCount, speakable) + BreadcrumbList, on top of the
     baseline MedicalWebPage block — all from the live CMS post content. */
  const postJsonLd = useMemo(() => {
    if (!post) return undefined;
    /* wordCount over the EN article body (quick answer + section bodies + lists) */
    const bodyText = [
      post.quickAnswer,
      ...post.sections.flatMap((s) => [...s.body, ...(s.list ?? [])]),
    ].join(" ");
    const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
    const postUrl = `https://aristocratdentalcarebd.com/blog/${post.slug}`;
    return [
      {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        dateModified: post.updated,
        author: {
          "@type": "Person",
          name: post.author,
          jobTitle: post.authorCredentials,
        },
        publisher: {
          "@type": "Organization",
          name: "Aristocrat Dental Care & Orthodontic Center",
        },
        about: post.tags.map((tg) => ({ "@type": "MedicalCondition", name: tg })),
        lastReviewed: post.updated,
      },
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        author: {
          "@type": "Person",
          name: post.author,
          jobTitle: post.authorCredentials,
          worksFor: { "@id": "https://aristocratdentalcarebd.com/#organization" },
        },
        publisher: { "@id": "https://aristocratdentalcarebd.com/#organization" },
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        image: [
          post.image
            ? `https://aristocratdentalcarebd.com${post.image}`
            : "https://aristocratdentalcarebd.com/og-image.png",
        ],
        mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
        url: postUrl,
        inLanguage: "en",
        keywords: post.tags.join(", "),
        articleSection: post.category,
        wordCount,
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".quick-answer"],
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://aristocratdentalcarebd.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://aristocratdentalcarebd.com/blog",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: postUrl,
          },
        ],
      },
    ];
  }, [post]);

  usePageMeta({
    title: post
      ? bn && post.titleBn
        ? post.titleBn
        : post.title
      : "Article Not Found",
    description: post ? (bn && post.excerptBn ? post.excerptBn : post.excerpt) : undefined,
    jsonLd: postJsonLd,
  });

  if (!post) return <NotFoundPage />;

  /* --- derived navigation & relations ----------------------------- */
  const authorDoctor = doctors.find((doc) => doc.name === post.author);
  const authorInitials = initialsOf(post.author);

  /* chronological prev/next (by publish date) */
  const ordered = [...posts].sort((a, b) => a.date.localeCompare(b.date));
  const idx = ordered.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? ordered[idx - 1] : undefined;
  const next =
    idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : undefined;

  /* related reading — same category and/or shared serviceRefs */
  const currentRefs = post.serviceRefs ?? [];
  const related = posts
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      post: p,
      score:
        (p.category === post.category ? 2 : 0) +
        (p.serviceRefs ?? []).filter((r) => currentRefs.includes(r)).length,
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, 3)
    .map((s) => s.post);
  if (related.length < 3) {
    for (const p of [...posts].sort((a, b) => b.date.localeCompare(a.date))) {
      if (related.length >= 3) break;
      if (p.slug === post.slug || related.some((r) => r.slug === p.slug)) continue;
      related.push(p);
    }
  }

  /* end-of-article booking CTA — prefill the first related treatment */
  const bookingHref = post.serviceRefs?.[0]
    ? `/appointment?service=${post.serviceRefs[0]}`
    : "/appointment";

  const showUpdated = Boolean(post.updated && post.updated !== post.date);

  return (
    <>
      <ReadingProgress />
      {/* Article hero — centered over a sliding backdrop */}
      <section className="relative isolate overflow-hidden bg-brand-navy">
        <HeroBackdrop slides={heroSlides} overlay="deep" interval={8000} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-24 pt-12 text-center sm:px-6 sm:pt-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-blue-200/80">
              <li>
                <a href="/" className="transition-colors hover:text-white">
                  {d.chrome.nav.home}
                </a>
              </li>
              <li className="text-blue-300/50" aria-hidden="true">/</li>
              <li>
                <a href="/blog" className="transition-colors hover:text-white">
                  {d.chrome.nav.blog}
                </a>
              </li>
              <li className="text-blue-300/50" aria-hidden="true">/</li>
              <li className="max-w-[220px] truncate font-medium text-white">
                {bn && post.titleBn ? post.titleBn : post.title}
              </li>
            </ol>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300 ring-1 ring-amber-300/25 backdrop-blur-sm">
              {d.blogCategories[post.category as keyof typeof d.blogCategories] ?? post.category}
            </span>
            <h1 className="font-heading mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
              {bn && post.titleBn ? post.titleBn : post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-blue-200/85">
              <span className="inline-flex items-center gap-2">
                <Avatar className="h-9 w-9 border-2 border-white/20">
                  <AvatarFallback className="bg-white/10 font-heading text-xs font-bold text-white">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <span>
                  <span className="sr-only">{t.writtenBy}: </span>
                  <span className="block font-semibold text-white">{post.author}</span>
                  <span className="block text-xs">{post.authorCredentials}</span>
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {t.published}:{" "}
                {formatPostDate(post.date, bn, { day: "numeric", month: "long", year: "numeric" })}
              </span>
              {showUpdated && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  {t.updated}:{" "}
                  {formatPostDate(post.updated!, bn, { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {localizeReadTime(post.readTime, bn, t.minRead)}
              </span>
            </div>

            {/* share row */}
            <div
              className="mt-7 flex flex-wrap items-center justify-center gap-2.5"
              role="group"
              aria-label={t.share}
            >
              <span className="mr-1 hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-200/70 sm:inline-flex">
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t.share}
              </span>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.shareWa}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:ring-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              <a
                href={fbHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.shareFb}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1877f2] hover:ring-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Facebook className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Facebook</span>
              </a>
              <a
                href={xHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.shareX}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-xs font-bold text-white ring-1 ring-white/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:ring-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Twitter className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">X</span>
              </a>
              <button
                type="button"
                onClick={copyLink}
                aria-label={t.shareCopy}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-full px-4 text-xs font-bold ring-1 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  copied
                    ? "bg-amber-400 text-brand-navy ring-amber-300"
                    : "bg-white/10 text-white ring-white/20 hover:bg-white hover:text-brand-navy"
                )}
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">
                  {copied ? t.shareCopied : t.shareCopy}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article body — prose column + sticky TOC sidebar on desktop */}
      <article className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10 xl:gap-14">
            {/* Prose column */}
            <div className="min-w-0">
              {/* Cover image */}
              {post.image && (
                <Reveal>
                  <figure className="zoom-img relative -mt-24 h-56 overflow-hidden rounded-[2rem] shadow-[0_24px_60px_-20px_rgba(0,32,96,0.45)] ring-1 ring-blue-100 sm:-mt-28 sm:h-80">
                    <Image
                      src={post.image}
                      alt={post.imageAlt ?? post.title}
                      fill
                      priority
                      sizes="(max-width: 1280px) 100vw, 896px"
                      className="object-cover"
                    />
                    <span
                      className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 via-transparent to-transparent"
                      aria-hidden="true"
                    />
                  </figure>
                </Reveal>
              )}

              {/* AEO quick answer */}
              <Reveal className="mt-10">
                <div className="relative max-w-[70ch] overflow-hidden rounded-3xl border border-blue-100 bg-ice p-6 shadow-[0_14px_40px_-20px_rgba(0,32,96,0.25)] sm:p-8">
                  <span
                    className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-blue/10 blur-2xl"
                    aria-hidden="true"
                  />
                  <div className="relative flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm ring-1 ring-blue-100">
                      <Stethoscope className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                      {t.quickAnswer}
                    </span>
                  </div>
                  <p className="quick-answer relative mt-4 text-base font-medium leading-relaxed text-brand-navy sm:text-lg">
                    {bn && post.quickAnswerBn ? post.quickAnswerBn : post.quickAnswer}
                  </p>
                </div>
              </Reveal>

              {/* Mobile "On this page" accordion (desktop uses the sticky sidebar) */}
              {post.sections.length >= 3 && (
                <div className="mt-6 lg:hidden">
                  <div className="overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-[0_10px_30px_-18px_rgba(0,32,96,0.18)]">
                    <button
                      type="button"
                      onClick={() => setTocState({ slug, open: !tocOpen })}
                      aria-expanded={tocOpen}
                      aria-controls="mobile-toc"
                      className="flex min-h-11 w-full items-center justify-between gap-3 px-5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-blue"
                    >
                      <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                        <ListTree className="h-4 w-4" aria-hidden="true" />
                        {t.onThisPage}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-brand-blue transition-transform duration-300",
                          tocOpen && "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {tocOpen && (
                        <motion.div
                          id="mobile-toc"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <nav aria-label={t.onThisPage} className="px-3 pb-3">
                            <TocList
                              post={post}
                              activeSection={activeSection}
                              onNavigate={goToSection}
                            />
                          </nav>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Sections */}
              <div className="mt-10 max-w-[70ch] space-y-12">
                {post.sections.map((section, i) => {
                  const bnSection = bn ? post.sectionsBn?.[i] : undefined;
                  const listItems = bnSection?.list ?? section.list;
                  return (
                    <Reveal key={section.heading} delay={i * 0.03}>
                      <section aria-labelledby={`section-${i}`}>
                        <span
                          className="text-[11px] font-bold tabular-nums tracking-[0.22em] text-brand-blue/70"
                          aria-hidden="true"
                        >
                          {bn
                            ? toBnDigits(String(i + 1).padStart(2, "0"))
                            : String(i + 1).padStart(2, "0")}
                        </span>
                        <h2
                          id={`section-${i}`}
                          tabIndex={-1}
                          className="font-heading scroll-mt-28 text-[1.35rem] font-bold leading-snug text-brand-navy outline-none focus-visible:rounded-lg sm:text-2xl"
                        >
                          {bnSection?.heading ?? section.heading}
                        </h2>
                        <span
                          className="mt-3 block h-0.5 w-12 rounded-full bg-gradient-to-r from-brand-blue to-amber-400"
                          aria-hidden="true"
                        />
                        <div className="mt-5 space-y-4">
                          {(bnSection?.body ?? section.body).map((para, j) => (
                            <p
                              key={j}
                              className={cn(
                                "text-[15px] leading-relaxed text-slate-600 sm:text-base",
                                i === 0 && j === 0 && "article-lead"
                              )}
                            >
                              {para}
                            </p>
                          ))}
                        </div>
                        {listItems && (
                          <ul className="mt-5 space-y-3 rounded-2xl border border-blue-100/80 bg-white p-5 shadow-[0_10px_30px_-22px_rgba(0,32,96,0.2)] sm:p-6">
                            {listItems.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]"
                              >
                                <span
                                  className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand-blue ring-1 ring-blue-100"
                                  aria-hidden="true"
                                >
                                  <Check className="h-3 w-3" />
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>
                    </Reveal>
                  );
                })}
              </div>

              {/* Tags → link back to the blog index with the search prefilled */}
              {post.tags.length > 0 && (
                <div className="mt-10 max-w-[70ch]">
                  <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                    <Tag className="h-4 w-4" aria-hidden="true" />
                    {t.relatedTopics}
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <a
                        key={tag}
                        href={`/blog?q=${encodeURIComponent(tag)}`}
                        aria-label={`${t.relatedTopics}: ${tag}`}
                        className="inline-flex min-h-9 items-center rounded-full border border-blue-100 bg-ice px-3.5 py-2 text-xs font-medium text-brand-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-blue/30 hover:bg-blue-50 hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                      >
                        #{tag}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Author box */}
              <Reveal className="mt-12">
                <div className="max-w-[70ch] rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_12px_40px_-18px_rgba(0,32,96,0.2)] sm:p-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <Avatar className="h-16 w-16 shrink-0 border-4 border-blue-50">
                      <AvatarFallback className="font-heading text-xl font-bold text-brand-navy">
                        {authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                        {t.authorLabel}
                      </span>
                      <h3 className="font-heading mt-1 text-lg font-bold text-brand-navy">
                        {post.author}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {post.authorCredentials} · {t.authorAtClinic}
                      </p>
                      {authorDoctor && (
                        <p className="mt-1.5 text-xs text-slate-400">
                          {bn && authorDoctor.roleBn ? authorDoctor.roleBn : authorDoctor.role}
                          {" · "}
                          {bn
                            ? `${toBnDigits(authorDoctor.experienceYears)}+ ${d.shared.yrs} ${d.shared.patients}`
                            : `${authorDoctor.experienceYears}+ ${d.shared.yrs} · ${authorDoctor.patientsTreated.toLocaleString("en-US")}+ ${d.shared.patients}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-blue-50 pt-5">
                    {authorDoctor ? (
                      <>
                        <a
                          href={`/doctors/${authorDoctor.slug}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-50 px-5 py-2.5 text-sm font-bold text-brand-navy ring-1 ring-blue-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                        >
                          <ArrowUpRight className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                          {t.viewAuthor}
                        </a>
                        <a
                          href={`/appointment?doctor=${authorDoctor.slug}`}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:bg-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                        >
                          <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                          {t.bookWithDoctor.replace(
                            "{name}",
                            authorDoctor.name.split(" ").slice(0, 2).join(" ")
                          )}
                        </a>
                      </>
                    ) : (
                      <a
                        href="/appointment"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:bg-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                      >
                        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                        {t.consult} {post.author.split(" ").slice(0, 2).join(" ")}
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* Related treatments — curated cross-links to service pages */}
              {post.serviceRefs && post.serviceRefs.length > 0 && (
                <Reveal className="mt-8">
                  <nav
                    aria-label={d.shared.relatedTreatments}
                    className="max-w-[70ch] rounded-2xl border border-blue-100/80 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(0,32,96,0.18)] sm:p-6"
                  >
                    <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                      <Stethoscope className="h-4 w-4" aria-hidden="true" />
                      {d.shared.relatedTreatments}
                    </span>
                    <p className="mt-2 text-sm text-slate-500">
                      {d.shared.relatedTreatmentsSub}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {post.serviceRefs.map((serviceSlug) => {
                        const svc = services.find((s) => s.slug === serviceSlug);
                        if (!svc) return null;
                        const svcName = bn && svc.nameBn ? svc.nameBn : svc.name;
                        return (
                          <a
                            key={serviceSlug}
                            href={`/services/${serviceSlug}`}
                            aria-label={`${d.shared.relatedTreatments}: ${svcName}`}
                            className="group inline-flex items-center gap-2.5 rounded-full bg-blue-50 py-2 pl-2 pr-4 text-sm font-semibold text-brand-navy ring-1 ring-blue-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-lg hover:shadow-blue-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                          >
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-brand-blue ring-1 ring-blue-100">
                              <DynamicIcon name={svc.icon} className="h-4 w-4" />
                            </span>
                            <span className="leading-snug">{svcName}</span>
                            <ArrowRight
                              className="h-3.5 w-3.5 shrink-0 text-brand-blue/60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand-blue"
                              aria-hidden="true"
                            />
                          </a>
                        );
                      })}
                    </div>
                  </nav>
                </Reveal>
              )}
            </div>

            {/* Sticky table of contents (desktop) */}
            {post.sections.length >= 3 && (
              <aside className="hidden lg:block" aria-label={t.onThisPage}>
                <div className="sticky top-24 space-y-6">
                  <nav
                    aria-label={t.onThisPage}
                    className="rounded-2xl border border-blue-100/80 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(0,32,96,0.18)]"
                  >
                    <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                      <ListTree className="h-4 w-4" aria-hidden="true" />
                      {t.onThisPage}
                    </span>
                    <TocList
                      post={post}
                      activeSection={activeSection}
                      onNavigate={goToSection}
                    />
                  </nav>

                  {/* mini booking CTA under the TOC */}
                  <a
                    href={bookingHref}
                    className="hero-mesh-dark group block rounded-2xl p-5 text-white shadow-[0_18px_45px_-18px_rgba(0,32,96,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-18px_rgba(30,125,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
                      {t.stillQuestions}
                    </span>
                    <span className="mt-2 flex items-center gap-2 text-sm font-bold">
                      {t.bookConsultation}
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                </div>
              </aside>
            )}
          </div>
        </div>
      </article>

      {/* Related reading — same category and/or shared treatments */}
      {related.length > 0 && (
        <section className="bg-ice py-14 sm:py-16" aria-labelledby="related-posts">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              align="left"
              eyebrow={t.relatedEyebrow}
              title={t.relatedTitle}
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <PostCard key={p.slug} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prev / next article navigation (by publish date) */}
      {(prev || next) && (
        <section className="py-12 sm:py-14" aria-label={t.backToAll}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <a
                href="/blog"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-blue transition-colors hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:rounded-lg"
              >
                <ArrowLeft
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
                {t.backToAll}
              </a>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {prev && <PostNavCard post={prev} direction="prev" />}
                {next && (
                  <PostNavCard post={next} direction="next" />
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* End-of-article CTA — prefill the primary related treatment */}
      <section className="pb-16 sm:pb-20" aria-labelledby="article-cta">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="hero-mesh-dark noise relative overflow-hidden rounded-[2.5rem] px-6 py-12 text-center shadow-2xl shadow-navy-900/30 sm:px-12 sm:py-14">
              <div
                className="dot-grid-light pointer-events-none absolute inset-0 opacity-40"
                aria-hidden="true"
              />
              <span
                className="animate-glow-drift pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-blue/25 blur-3xl"
                aria-hidden="true"
              />
              <span
                className="animate-glow-drift pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl"
                style={{ animationDelay: "-7s" }}
                aria-hidden="true"
              />
              <div className="relative">
                <h2
                  id="article-cta"
                  className="font-heading mx-auto max-w-2xl text-2xl font-bold leading-tight text-white text-balance sm:text-3xl"
                >
                  {t.stillQuestions}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-blue-100/85 sm:text-base">
                  {t.consultNote}
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={bookingHref}
                    className="btn-shine inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-brand-navy shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                    {t.bookConsultation}
                  </a>
                  <a
                    href="tel:+8801715027522"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-white ring-2 ring-white/40 transition-all duration-300 hover:bg-white/10 hover:ring-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {d.shared.ctaCall} 01715-027522
                  </a>
                </div>
                <p className="mt-6 text-xs text-blue-200/70">{d.shared.ctaHours}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
