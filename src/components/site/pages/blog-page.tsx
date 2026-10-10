"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe,
  Lightbulb,
  Share2,
  Tag,
  UserRound,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { blogPosts, blogCategories, getPost } from "@/lib/data/blog";
import { PageHeader, CtaBanner } from "@/components/site/shared";
import { Reveal, SectionHeading } from "@/components/site/motion";
import { NotFoundPage } from "@/components/site/pages/not-found-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

  const filtered = useMemo(
    () =>
      category === "All"
        ? blogPosts
        : blogPosts.filter((p) => p.category === category),
    [category]
  );
  const featured = blogPosts.find((p) => p.featured) ?? blogPosts[0];
  const rest = filtered.filter((p) => p.slug !== featured.slug || category !== "All");

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[{ label: d.chrome.nav.home, to: "/" }, { label: d.chrome.nav.blog }]}
      />

      {/* Featured post */}
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
              aria-label={`Read featured article: ${featured.title}`}
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
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-blue-100/85">
                    {featured.excerpt}
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
                      {featured.quickAnswer.slice(0, 140)}…
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

      {/* Category filter + grid */}
      <section className="pb-16 sm:pb-20" aria-label="All articles">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="scroll-area flex items-center gap-2 overflow-x-auto pb-2">
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

          <AnimatePresence mode="wait">
            <motion.div
              key={category}
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
                    aria-label={`Read article: ${post.title}`}
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
                      {post.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                      {post.excerpt}
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

export function BlogDetailPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.blogPage;
  const post = getPost(slug);

  const shareArticle = async () => {
    const url = `${window.location.origin}/#/blog/${slug}`;
    const shareData = {
      title: post?.title ?? "Dental health article",
      text: post?.excerpt ?? "Expert dental advice from Aristocrat Dental Care",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* user dismissed share sheet — no-op */
    }
  };

  usePageMeta({
    title: post ? post.title : "Article Not Found",
    description: post?.excerpt,
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
                {post.title}
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
              {post.title}
            </h1>
            <div className="mt-4">
              {bn && (
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-blue-100/90 ring-1 ring-white/15">
                  <Globe className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                  {t.articleInEnglish}
                </p>
              )}
            </div>
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
                {post.quickAnswer}
              </p>
            </div>
          </Reveal>

          {/* Sections */}
          <div className="mt-10 space-y-10">
            {post.sections.map((section, i) => (
              <Reveal key={section.heading} delay={i * 0.03}>
                <section aria-labelledby={`section-${i}`}>
                  <h2
                    id={`section-${i}`}
                    className="font-heading text-xl font-bold text-brand-navy sm:text-2xl"
                  >
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.body.map((para, j) => (
                      <p
                        key={j}
                        className="text-[15px] leading-relaxed text-slate-600 sm:text-base"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                  {section.list && (
                    <ul className="mt-4 space-y-2.5 rounded-2xl border border-blue-100/80 bg-white p-5 sm:p-6">
                      {section.list.map((item) => (
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
            ))}
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
            <button
              type="button"
              onClick={shareArticle}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-brand-navy ring-1 ring-blue-100 transition-all duration-300 hover:bg-blue-50 hover:ring-brand-blue/30"
            >
              <Share2 className="h-4 w-4 text-brand-blue" aria-hidden="true" />
              {t.share}
            </button>
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
                  {p.title}
                </h3>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                  {p.excerpt}
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
