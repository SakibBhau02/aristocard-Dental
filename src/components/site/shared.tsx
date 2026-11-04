"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, ChevronRight, Clock3, Phone, Sparkles, Wallet } from "lucide-react";
import { useRouter } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { DynamicIcon, categoryColors } from "@/components/site/icon-map";
import { Reveal } from "@/components/site/motion";
import { SiteHeroBackdrop } from "@/components/site/hero-backdrop";
import { useRouteHeroSlides } from "@/components/site/content-provider";
import { Button } from "@/components/ui/button";
import type { Service, Doctor } from "@/lib/types";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

/* ------------------------------------------------------------------ */
/*  Page header (breadcrumb + eyebrow + title + subtitle)              */
/* ------------------------------------------------------------------ */

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumb: { label: string; to?: string }[];
}) {
  const { navigate, segments } = useRouter();
  const { lang } = useLang();
  const bn = lang === "bn";
  /* themed backdrop per route - DB-managed when the admin has uploaded
     custom slides for this page, otherwise the curated static set */
  const slides = useRouteHeroSlides(segments[0] ?? "");
  return (
    /* Same hero shell as the home page: full-height, centered copy over
       the sliding media, and a lighter overlay so the photos/videos stay
       clearly visible behind the text. */
    <section
      className="relative isolate flex min-h-[88vh] items-center justify-center overflow-hidden bg-brand-navy"
      aria-labelledby="page-hero-heading"
    >
      <SiteHeroBackdrop slides={slides} overlay="light" indicators priority />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <nav aria-label="Breadcrumb" className="mb-7">
            <ol className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-blue-100/85">
              {breadcrumb.map((item, i) => (
                <li key={item.label} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <ChevronRight className="h-3 w-3 text-blue-200/50" aria-hidden="true" />
                  )}
                  {item.to ? (
                    <a
                      href={item.to}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(item.to!);
                      }}
                      className="link-underline-gold transition-colors hover:text-white"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-white">{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300 ring-1 ring-white/20 backdrop-blur-sm">
            <span className="eyebrow-dot h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
            {eyebrow}
          </span>

          <h1
            id="page-hero-heading"
            className="font-heading mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.08] text-white text-balance [text-shadow:0_2px_24px_rgba(0,16,48,0.55)] sm:text-5xl sm:leading-[1.06] lg:text-[3.75rem]"
          >
            {title}
          </h1>

          {description && (
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-blue-50/95 [text-shadow:0_1px_16px_rgba(0,16,48,0.6)] sm:text-lg">
              {description}
            </p>
          )}

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="btn-press btn-shine group relative overflow-hidden rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-9 py-6 text-base font-bold text-brand-navy shadow-xl shadow-amber-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/40"
            >
              <a
                href="/appointment"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/appointment");
                }}
                className="inline-flex items-center gap-2"
              >
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                {bn ? "অ্যাপয়েন্টমেন্ট নিন" : "Book an appointment"}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-white/30 bg-white/10 px-9 py-6 text-base font-bold text-white backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/60 hover:bg-white/20"
            >
              <a href="tel:+8801715027522" className="inline-flex items-center gap-2">
                <Phone className="h-5 w-5" aria-hidden="true" />
                {bn ? "কল করুন — ০১৭১৫ ০২৭৫২২" : "Call — 01715 027522"}
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Service card                                                        */
/* ------------------------------------------------------------------ */

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const colors = categoryColors[service.category] ?? categoryColors.Restorative;
  const name = lang === "bn" && service.nameBn ? service.nameBn : service.name;
  const tagline = lang === "bn" && service.taglineBn ? service.taglineBn : service.tagline;
  const excerpt = lang === "bn" && service.excerptBn ? service.excerptBn : service.excerpt;

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="card-shine card-accent-top group relative flex h-full flex-col overflow-hidden rounded-3xl border border-blue-100/80 bg-white shadow-[0_10px_30px_-14px_rgba(0,32,96,0.16)] transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-blue/30 hover:shadow-[0_24px_50px_-16px_rgba(30,125,255,0.3)]"
    >
      {/* cover image */}
      <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-blue-50">
        {service.image ? (
          <Image
            src={service.image}
            alt={name}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className={`flex h-full items-center justify-center ${colors.bg}`}>
            <DynamicIcon name={service.icon} className={`h-12 w-12 ${colors.text}`} />
          </div>
        )}
        {/* readability gradient */}
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/40 via-transparent to-transparent"
          aria-hidden="true"
        />
        <Badge
          variant="outline"
          className="absolute right-3 top-3 border-0 bg-white/85 text-[10px] font-semibold uppercase tracking-wider text-brand-navy backdrop-blur-sm"
        >
          {d.categories[service.category]}
        </Badge>
      </div>

      {/* body */}
      <div className="relative flex flex-1 flex-col p-6">
        {/* icon tile overlapping the cover image */}
        <span
          className={`-mt-12 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bg} ${colors.text} ring-4 ring-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
        >
          <DynamicIcon name={service.icon} className="h-7 w-7" />
        </span>

        <h3 className="font-heading text-lg font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue">
          {name}
        </h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {tagline}
        </p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
          {excerpt}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-blue-50 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Clock3 className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
            {lang === "bn" ? toBnDigits(service.duration) : service.duration}
          </span>
          <a
            href={`/services/${service.slug}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/services/${service.slug}`);
            }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue transition-all duration-300 hover:gap-2.5"
            aria-label={`${d.shared.learnMore}: ${name}`}
          >
            {d.shared.learnMore}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  Doctor card                                                         */
/* ------------------------------------------------------------------ */

export function DoctorCard({ doctor, index = 0 }: { doctor: Doctor; index?: number }) {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const initials = doctor.name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const role = lang === "bn" && doctor.roleBn ? doctor.roleBn : doctor.role;

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-blue-100/80 bg-white text-center shadow-[0_10px_30px_-14px_rgba(0,32,96,0.16)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-16px_rgba(0,32,96,0.28)]"
    >
      {/* top accent */}
      <span
        className="absolute inset-x-0 top-0 z-10 h-1.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${doctor.accent}, #002060)` }}
        aria-hidden="true"
      />

      {/* big portrait */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-blue-50">
        {doctor.photo ? (
          <Image
            src={doctor.photo}
            alt={`${doctor.name} — ${role}`}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 300px"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: `${doctor.accent}14` }}
          >
            <span
              className="font-heading text-5xl font-bold"
              style={{ color: doctor.accent }}
              aria-hidden="true"
            >
              {initials}
            </span>
          </div>
        )}

        <span
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-4 ring-white/90"
          title="BMDC Verified"
          aria-label="BMDC verified doctor"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center px-5 pb-6 pt-5">
        <h3 className="font-heading text-lg font-bold leading-snug text-brand-navy">
          {doctor.name}
        </h3>
        <p className="mt-1 text-[13px] font-semibold leading-snug text-brand-blue">{role}</p>

        <p className="mt-3 flex flex-wrap justify-center gap-1.5">
          {doctor.credentials.slice(0, 3).map((c) => (
            <Badge key={c} variant="secondary" className="bg-blue-50 text-[10px] font-medium text-brand-navy">
              {c}
            </Badge>
          ))}
        </p>

        <div className="mt-3 flex items-center gap-1" aria-label={`Rating ${doctor.rating} out of 5`}>
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span className="text-sm font-semibold text-brand-navy">{doctor.rating}</span>
          <span className="text-xs text-slate-400">
            • {toBnDigitsIfBn(lang, doctor.experienceYears)}+ {d.shared.yrs}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/doctors/${doctor.slug}`)}
          className="mt-auto inline-flex w-full items-center justify-center gap-1.5 self-stretch rounded-full px-5 py-2.5 text-sm font-semibold text-brand-blue ring-1 ring-blue-100 transition-all duration-300 hover:bg-brand-blue hover:text-white hover:ring-brand-blue"
        >
          {d.shared.viewProfile}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz teaser band — routes unsure visitors to the Smile Check       */
/* ------------------------------------------------------------------ */

export function QuizTeaser({ className = "" }: { className?: string }) {
  const { navigate } = useRouter();
  const { d } = useLang();
  const t = d.shared;
  return (
    <div
      className={`card-lift flex flex-col items-center gap-5 rounded-[2rem] border border-blue-100/80 bg-ice px-6 py-6 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left ${className}`}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-gold shadow-sm ring-1 ring-amber-100">
          <Sparkles className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="font-heading text-base font-bold text-brand-navy">
            {t.quizTeaserTitle}
          </p>
          <p className="mt-0.5 max-w-md text-sm leading-relaxed text-slate-500">
            {t.quizTeaserText}
          </p>
        </div>
      </div>
      <a
        href="/assessment"
        onClick={(e) => {
          e.preventDefault();
          navigate("/assessment");
        }}
        className="btn-shine group inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-white shadow-lg shadow-navy-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-blue hover:shadow-xl"
      >
        {t.quizTeaserCta}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Cost teaser band — routes price-curious visitors to the           */
/*  treatment cost estimator (/estimator)                              */
/* ------------------------------------------------------------------ */

export function CostTeaser({ className = "" }: { className?: string }) {
  const { navigate } = useRouter();
  const { d } = useLang();
  const t = d.shared;
  return (
    <div
      className={`card-lift flex flex-col items-center gap-5 rounded-[2rem] border border-teal-100/80 bg-teal-50/50 px-6 py-6 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left ${className}`}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm ring-1 ring-teal-100">
          <Wallet className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="font-heading text-base font-bold text-brand-navy">
            {t.costTeaserTitle}
          </p>
          <p className="mt-0.5 max-w-md text-sm leading-relaxed text-slate-500">
            {t.costTeaserText}
          </p>
        </div>
      </div>
      <a
        href="/estimator"
        onClick={(e) => {
          e.preventDefault();
          navigate("/estimator");
        }}
        className="btn-shine group inline-flex shrink-0 items-center gap-2 rounded-full bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-xl"
      >
        {t.costTeaserCta}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
        />
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA banner                                                          */
/* ------------------------------------------------------------------ */

export function CtaBanner({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const { navigate } = useRouter();
  const { d } = useLang();
  return (
    <section className="relative overflow-hidden" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="hero-mesh-dark noise relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-center shadow-2xl shadow-navy-900/30 sm:px-12">
            <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
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
                id="cta-heading"
                className="font-heading mx-auto max-w-2xl text-3xl font-bold leading-tight text-white text-balance sm:text-4xl"
              >
                {title ?? d.shared.ctaTitle}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-100/85">
                {description ?? d.shared.ctaDescription}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/appointment")}
                  className="btn-shine inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-brand-navy shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  {d.shared.ctaBook}
                </button>
                <a
                  href="tel:+8801715027522"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white ring-2 ring-white/40 transition-all duration-300 hover:bg-white/10 hover:ring-white"
                >
                  {d.shared.ctaCall} 01715-027522
                </a>
              </div>
              <p className="mt-6 text-xs text-blue-200/70">
                {d.shared.ctaHours}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* helpers for localized numerals */
function toBnDigitsIfBn(lang: "en" | "bn", v: string | number) {
  return lang === "bn" ? toBnDigits(v) : String(v);
}
