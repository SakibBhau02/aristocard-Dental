"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Facebook,
  Lightbulb,
  Link2,
  ListTree,
  MessageCircle,
  Search,
  Share2,
  Stethoscope,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { blogPosts, blogCategories, getPost } from "@/lib/data/blog";
import { services } from "@/lib/data/services";
import { DynamicIcon } from "@/components/site/icon-map";
import { PageHeader, CtaBanner } from "@/components/site/shared";
import { Reveal, SectionHeading } from "@/components/site/motion";
import { NotFoundPage } from "@/components/site/pages/not-found-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  BLOG LIST PAGE (EN / বাংলা)                                        */
/* ------------------------------------------------------------------ */

/* "8 min read" → "৮ মিনিট পাঠ" when Bangla */
function localizeReadTime(readTime: string, bn: boolean, minRead: string) {
  if (!bn) return readTime;
  const n = readTime.match(/\d+/)?.[0] ?? "";
  return n ? `${toBnDigits(n)} ${minRead}` : readTime;
}

export function BlogPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.blogPage;

  usePageMeta({
    title: "Dental Health Blog — Expert Advice from Uttara's Trusted Dentists",
    description:
      "Evidence-based dental health guides from Aristocrat Dental Care specialists: checkup frequency, root canal facts, Invisalign vs braces, implant costs in Bangladesh, kids' dental care & more.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Aristocrat Dental Care Health Blog",
      url: "https://aristocratdentalcarebd.com/#/blog",
      publisher: { "@type": "Organization", name: "Aristocrat Dental Care & Orthodontic Center" },
    },
  });

  const searching = search.trim().length > 0;

  /* Category filter combined with text search (EN + BN content) */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return blogPosts.filter((p) => {
      const matchCategory = category === "All" || p.category === category;
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.titleBn?.toLowerCase().includes(q) ?? false) ||
        (p.excerptBn?.toLowerCase().includes(q) ?? false);
      return matchCategory && matchSearch;
    });
  }, [category, search]);
  const featured = blogPosts.find((p) => p.featured) ?? blogPosts[0];
  /* While searching, the hero is hidden and every match goes into the grid */
  const rest = searching
    ? filtered
    : filtered.filter((p) => p.slug !== featured.slug || category !== "All");

  const resultCountText = t.searchResults.replace(
    "{count}",
    bn ? toBnDigits(rest.length) : String(rest.length)
  );

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[{ label: d.chrome.nav.home, to: "/" }, { label: d.chrome.nav.blog }]}
      />

      {/* Featured post — hidden while searching */}
      {!searching && (
        <section className="py-14 sm:py-16" aria-label="Featured article">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <a
                href={`#/blog/${featured.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/blog/${featured.slug}`);
                }}
                className="group grid overflow-hidden rounded-[2rem] border border-blue-100/80 bg-white shadow-[0_16px_50px_-24px_rgba(0,32,96,0.25)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_-24px_rgba(30,125,255,0.35)] lg:grid-cols-[1.1fr_0.9fr]"
                aria-label={`Read featured article: ${bn && featured.titleBn ? featured.titleBn : featured.title}`}
              >
                <div className="hero-mesh-dark relative flex min-h-[260px] flex-col justify-between p-8 sm:p-10">
                  <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
                  <span className="relative inline-flex w-fit items-center gap-2 rounded-full bg-amber-400/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300 ring-1 ring-amber-300/25">
                    <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.featured}
                  </span>
                  <div className="relative">
                    <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-blue-200 ring-1 ring-white/15">
                      {d.blogCategories[featured.category as keyof typeof d.blogCategories] ?? featured.category}
                    </span>
                    <h2 className="font-heading mt-4 text-2xl font-bold leading-snug text-white sm:text-3xl">
                      {bn && featured.titleBn ? featured.titleBn : featured.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-blue-100/85">
                      {bn && featured.excerptBn ? featured.excerptBn : featured.excerpt}
                    </p>
                  </div>
                  <span className="relative inline-flex w-fit items-center gap-2 text-sm font-bold text-white">
                    {t.readGuide}
                    <ArrowUpRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                </div>

                <div className="flex flex-col justify-between bg-white p-8 sm:p-10">
                  <div>
                    {featured.image && (
                      <div className="zoom-img relative mb-6 overflow-hidden rounded-2xl ring-1 ring-blue-100">
                        <Image
                          src={featured.image}
                          alt={featured.imageAlt ?? featured.title}
                          width={672}
                          height={384}
                          className="h-44 w-full object-cover sm:h-48"
                        />
                        <span
                          className="absolute inset-0 bg-gradient-to-t from-brand-navy/35 via-transparent to-transparent"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-relaxed text-brand-navy ring-1 ring-blue-100">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-blue" aria-hidden="true" />
                      <span>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                          {t.quickAnswer}
                        </span>
                        {bn && featured.quickAnswerBn
                          ? featured.quickAnswerBn.slice(0, 140)
                          : featured.quickAnswer.slice(0, 140)}
                        …
                      </span>
                    </span>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {featured.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-blue-100 bg-ice text-[11px] font-medium text-brand-navy"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-8 flex items-center gap-4 border-t border-blue-50 pt-6">
                    <Avatar className="h-11 w-11 border-2 border-amber-200">
                      <AvatarFallback className="font-heading text-sm font-bold text-brand-navy">
                        {featured.author
                          .replace("Dr. ", "")
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-bold text-brand-navy">
                        {featured.author}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {featured.authorCredentials}
                      </span>
                    </div>
                    <span className="ml-auto hidden shrink-0 items-center gap-1.5 text-xs text-slate-500 sm:flex">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      {localizeReadTime(featured.readTime, bn, t.minRead)}
                    </span>
                  </div>
                </div>
              </a>
            </Reveal>
          </div>
        </section>
      )}

      {/* Category filter + search + grid */}
      <section className="pb-16 sm:pb-20" aria-label="All articles">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search — filters by title, excerpt and category (EN content) */}
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
                  className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-blue-50 hover:text-brand-navy"
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
                    "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300",
                    category === c
                      ? "bg-brand-blue text-white shadow-lg shadow-blue-500/30"
                      : "bg-blue-50 text-brand-navy hover:bg-blue-100"
                  )}
                >
                  {d.blogCategories[c as keyof typeof d.blogCategories] ?? c}
                  <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
                    {bn
                      ? toBnDigits(
                          c === "All"
                            ? blogPosts.length
                            : blogPosts.filter((p) => p.category === c).length
                        )
                      : c === "All"
                        ? blogPosts.length
                        : blogPosts.filter((p) => p.category === c).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {searching && rest.length > 0 && (
            <p className="mt-6 text-sm text-slate-500" aria-live="polite">
              {resultCountText}
            </p>
          )}

          <AnimatePresence mode="wait">
            {rest.length > 0 ? (
              <motion.div
                key={`${category}-${search}`}
                className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
              {rest.map((post, i) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
                >
                  <a
                    href={`#/blog/${post.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/blog/${post.slug}`);
                    }}
                    className="card-shine group flex h-full flex-col overflow-hidden rounded-3xl border border-blue-100/80 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-blue/30 hover:shadow-[0_24px_50px_-16px_rgba(30,125,255,0.28)]"
                    aria-label={`Read article: ${bn && post.titleBn ? post.titleBn : post.title}`}
                  >
                    {post.image ? (
                      <div className="zoom-img relative h-44 w-full overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.imageAlt ?? post.title}
                          width={448}
                          height={256}
                          className="h-full w-full object-cover"
                        />
                        <span
                          className="absolute inset-0 bg-gradient-to-t from-brand-navy/45 via-brand-navy/5 to-transparent"
                          aria-hidden="true"
                        />
                        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue backdrop-blur">
                          {d.blogCategories[post.category as keyof typeof d.blogCategories] ?? post.category}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue ring-1 ring-blue-100">
                        {d.blogCategories[post.category as keyof typeof d.blogCategories] ?? post.category}
                      </span>
                    )}
                    <div className="flex flex-1 flex-col p-6 pt-5">
                    <h3 className={cn(
                      "font-heading text-lg font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue",
                      !post.image && "mt-4"
                    )}>
                      {bn && post.titleBn ? post.titleBn : post.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                      {bn && post.excerptBn ? post.excerptBn : post.excerpt}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-blue-50 pt-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                        {post.author}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {localizeReadTime(post.readTime, bn, t.minRead)}
                      </span>
                    </div>
                    </div>
                  </a>
                </motion.article>
              ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="mx-auto mt-8 max-w-md rounded-3xl border border-dashed border-blue-200 bg-ice p-12 text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Search className="mx-auto h-10 w-10 text-brand-blue/50" aria-hidden="true" />
                <p className="mt-4 text-sm leading-relaxed text-slate-500">
                  {t.noResults}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
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
/*  BLOG DETAIL PAGE — AEO format with quick answer (EN / বাংলা)        */
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
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden="true"
    />
  );
}

/* Active-section tracking for the article table of contents */
function useActiveSection(count: number) {
  const [active, setActive] = useState(0);

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
            setActive(idx);
          }
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );
    visible.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [count]);
  return [active, setActive] as const;
}

export function BlogDetailPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.blogPage;
  const post = getPost(slug);
  const [activeSection, setActiveSection] = useActiveSection(post?.sections.length ?? 0);

  const goToSection = (i: number) => {
    /* NOTE: never use href="#section-x" — it would hijack the hash router */
    setActiveSection(i);
    const el = document.getElementById(`section-${i}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    el?.focus({ preventScroll: true });
  };

  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  /* Deep-linkable article URL (matches the canonical production URL) */
  const articleUrl = () => `${window.location.origin}/#/blog/${slug}`;
  const shareTitle = () => (bn && post?.titleBn ? post.titleBn : post?.title ?? "Dental health article");

  const shareWhatsApp = () => {
    const text = `${shareTitle()} — ${articleUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl())}`,
      "_blank",
      "noopener,noreferrer,width=640,height=580"
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl());
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

  usePageMeta({
    title: post
      ? bn && post.titleBn
        ? post.titleBn
        : post.title
      : "Article Not Found",
    description: post ? (bn && post.excerptBn ? post.excerptBn : post.excerpt) : undefined,
    jsonLd: post
      ? {
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
        }
      : undefined,
  });

  if (!post) return <NotFoundPage />;

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const authorInitials = post.author
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <>
      <ReadingProgress />
      {/* Article hero */}
      <section className="hero-mesh-dark relative overflow-hidden">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-blue-200/80">
              <li>
                <a
                  href="#/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/");
                  }}
                  className="transition-colors hover:text-white"
                >
                  {d.chrome.nav.home}
                </a>
              </li>
              <li className="text-blue-300/50" aria-hidden="true">/</li>
              <li>
                <a
                  href="#/blog"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/blog");
                  }}
                  className="transition-colors hover:text-white"
                >
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
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300 ring-1 ring-amber-300/25">
              {d.blogCategories[post.category as keyof typeof d.blogCategories] ?? post.category}
            </span>
            <h1 className="font-heading mt-5 text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
              {bn && post.titleBn ? post.titleBn : post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-blue-200/85">
              <span className="inline-flex items-center gap-2">
                <Avatar className="h-9 w-9 border-2 border-white/20">
                  <AvatarFallback className="bg-white/10 font-heading text-xs font-bold text-white">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <span>
                  <span className="block font-semibold text-white">{post.author}</span>
                  <span className="block text-xs">{post.authorCredentials}</span>
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {t.updated}: {new Date(post.updated).toLocaleDateString(bn ? "bn-BD" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {localizeReadTime(post.readTime, bn, t.minRead)}
              </span>
            </div>
          </motion.div>
        </div>
        <svg
          className="absolute bottom-0 left-0 right-0 h-10 w-full text-white sm:h-14"
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,32 C240,64 480,0 720,16 C960,32 1200,64 1440,24 L1440,56 L0,56 Z"
            fill="currentColor"
          />
        </svg>
      </section>

      {/* Article body */}
      <article className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Cover image */}
          {post.image && (
            <Reveal>
              <figure className="zoom-img relative -mt-24 overflow-hidden rounded-[2rem] shadow-[0_24px_60px_-20px_rgba(0,32,96,0.45)] ring-1 ring-blue-100 sm:-mt-28">
                <Image
                  src={post.image}
                  alt={post.imageAlt ?? post.title}
                  width={896}
                  height={504}
                  priority
                  className="h-56 w-full object-cover sm:h-80"
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
            <div className="rounded-3xl border-l-4 border-brand-blue bg-ice p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                {t.quickAnswer}
              </span>
              <p className="mt-3 text-base font-medium leading-relaxed text-brand-navy sm:text-lg">
                {bn && post.quickAnswerBn ? post.quickAnswerBn : post.quickAnswer}
              </p>
            </div>
          </Reveal>

          {/* Table of contents */}
          {post.sections.length >= 3 && (
            <Reveal className="mt-6">
              <nav
                aria-label={t.onThisPage}
                className="rounded-2xl border border-blue-100/80 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(0,32,96,0.18)] sm:p-6"
              >
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                  <ListTree className="h-4 w-4" aria-hidden="true" />
                  {t.onThisPage}
                </span>
                <ol className="mt-3 space-y-1">
                  {post.sections.map((section, i) => {
                    const label = bn ? post.sectionsBn?.[i]?.heading ?? section.heading : section.heading;
                    const isActive = activeSection === i;
                    return (
                      <li key={section.heading}>
                        <button
                          type="button"
                          onClick={() => goToSection(i)}
                          aria-current={isActive ? "location" : undefined}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all duration-300",
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
              </nav>
            </Reveal>
          )}

          {/* Sections */}
          <div className="mt-10 space-y-10">
            {post.sections.map((section, i) => {
              const bnSection = bn ? post.sectionsBn?.[i] : undefined;
              const listItems = bnSection?.list ?? section.list;
              return (
                <Reveal key={section.heading} delay={i * 0.03}>
                  <section aria-labelledby={`section-${i}`}>
                    <h2
                      id={`section-${i}`}
                      tabIndex={-1}
                      className="font-heading text-xl font-bold text-brand-navy outline-none focus-visible:rounded-lg sm:text-2xl"
                    >
                      {bnSection?.heading ?? section.heading}
                    </h2>
                    <div className="mt-4 space-y-4">
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
                      <ul className="mt-4 space-y-2.5 rounded-2xl border border-blue-100/80 bg-white p-5 sm:p-6">
                        {listItems.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]"
                          >
                            <span
                              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-blue"
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </Reveal>
              );
            })}
          </div>

          {/* Author box */}
          <Reveal className="mt-12">
            <div className="flex flex-col items-start gap-5 rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_12px_40px_-18px_rgba(0,32,96,0.2)] sm:flex-row sm:items-center sm:p-8">
              <Avatar className="h-16 w-16 border-4 border-blue-50">
                <AvatarFallback className="font-heading text-xl font-bold text-brand-navy">
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-blue">
                  {t.authorLabel}
                </span>
                <h3 className="font-heading mt-1 text-lg font-bold text-brand-navy">
                  {post.author}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {post.authorCredentials} @ Aristocrat Dental Care &amp;
                  Orthodontic Center, Uttara — Dhaka.
                </p>
              </div>
              <a
                href="#/appointment"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/appointment");
                }}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-blue px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:bg-brand-navy"
              >
                {t.consult} {post.author.split(" ").slice(0, 2).join(" ")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          {/* Related treatments — curated cross-links to service pages */}
          {post.serviceRefs && post.serviceRefs.length > 0 && (
            <Reveal className="mt-8">
              <nav
                aria-label={d.shared.relatedTreatments}
                className="rounded-2xl border border-blue-100/80 bg-white p-5 shadow-[0_10px_30px_-18px_rgba(0,32,96,0.18)] sm:p-6"
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
                        href={`#/services/${serviceSlug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/services/${serviceSlug}`);
                        }}
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

          {/* tags + share */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-slate-400" aria-hidden="true" />
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-blue-100 bg-ice text-xs font-medium text-brand-navy"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label={t.share}
            >
              <span className="mr-1 hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:inline-flex">
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t.share}
              </span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${bn && post.titleBn ? post.titleBn : post.title} — ${typeof window !== "undefined" ? `${window.location.origin}/#/blog/${slug}` : `https://aristocratdentalcarebd.com/#/blog/${slug}`}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  /* let real users open the link naturally; keep href as the fallback */
                  e.preventDefault();
                  shareWhatsApp();
                }}
                aria-label={t.shareWa}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:text-white hover:ring-emerald-500"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/#/blog/${slug}` : "https://aristocratdentalcarebd.com/#/blog/" + slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  shareFacebook();
                }}
                aria-label={t.shareFb}
                className="inline-flex items-center gap-2 rounded-full bg-brand-blue-soft px-4 py-2.5 text-xs font-bold text-brand-blue ring-1 ring-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-blue hover:text-white hover:ring-brand-blue"
              >
                <Facebook className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Facebook</span>
              </a>
              <button
                type="button"
                onClick={copyLink}
                aria-label={t.shareCopy}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold ring-1 transition-all duration-300 hover:-translate-y-0.5",
                  copied
                    ? "bg-brand-navy text-white ring-brand-navy"
                    : "bg-white text-brand-navy ring-blue-100 hover:bg-blue-50 hover:ring-brand-blue/30"
                )}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                ) : (
                  <Link2 className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">{copied ? t.shareCopied : t.shareCopy}</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related */}
      <section className="bg-ice py-14 sm:py-16" aria-labelledby="related-posts">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            align="left"
            eyebrow={t.relatedEyebrow}
            title={t.relatedTitle}
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <motion.a
                key={p.slug}
                href={`#/blog/${p.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/blog/${p.slug}`);
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="card-shine group flex h-full flex-col overflow-hidden rounded-3xl border border-blue-100/80 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-16px_rgba(30,125,255,0.28)]"
              >
                {p.image ? (
                  <div className="zoom-img relative h-36 w-full overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.imageAlt ?? p.title}
                      width={448}
                      height={256}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 via-transparent to-transparent"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-6">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue ring-1 ring-blue-100">
                  {d.blogCategories[p.category as keyof typeof d.blogCategories] ?? p.category}
                </span>
                <h3 className="font-heading mt-4 text-lg font-bold leading-snug text-brand-navy group-hover:text-brand-blue">
                  {bn && p.titleBn ? p.titleBn : p.title}
                </h3>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                  {bn && p.excerptBn ? p.excerptBn : p.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue">
                  {t.readMore}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title={bn ? "এই আর্টিকেল নিয়ে প্রশ্ন আছে?" : "Have questions about this article?"}
        description={
          bn
            ? "আপনার নির্দিষ্ট পরিস্থিতি নিয়ে আলোচনায় আমাদের বিশেষজ্ঞরা আনন্দিত হবেন — আজই কনসালটেশন বুক করুন বা হটলাইনে কল করুন।"
            : "Our specialists are happy to discuss your specific situation — book a consultation or call our hotline today."
        }
      />
    </>
  );
}
