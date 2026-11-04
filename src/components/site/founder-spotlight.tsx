"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Pause,
  Play,
  Sparkles,
  Star,
} from "lucide-react";
import { useLang, toBnDigits } from "@/lib/i18n";
import { pickBn, type FounderSpotlightContent } from "@/lib/content/shared";
import { useRouter } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/site/icon-map";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Founder spotlight — photo slider + synced info pop-ups             */
/*                                                                     */
/*  Each slide carries its own caption and three info cards, so the    */
/*  floating pop-ups change together with the photograph. Everything   */
/*  comes from the CMS (Admin → Homepage → Founder spotlight).         */
/* ------------------------------------------------------------------ */

type Highlight = {
  icon: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
};

const AUTOPLAY_MS = 6500;

export function FounderSpotlight({
  content,
  highlights,
  ratingNote,
}: {
  content: FounderSpotlightContent;
  highlights: Highlight[];
  ratingNote?: string;
}) {
  const { navigate } = useRouter();
  const { lang } = useLang();
  const bn = lang === "bn";

  const allSlides = content.slides ?? [];
  /* Only slides with a real photograph are part of the rotation — an
     empty slot in the CMS should never surface a "photo coming soon"
     frame in the middle of her gallery. */
  const photoSlides = allSlides.filter((s) => Boolean(s.image?.trim()));
  const slides = photoSlides.length > 0 ? photoSlides : allSlides;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const total = slides.length;
  const slide = slides[Math.min(index, Math.max(total - 1, 0))];

  const go = useCallback(
    (dir: -1 | 1) => {
      if (total === 0) return;
      setIndex((current) => (current + dir + total) % total);
    },
    [total]
  );

  /* Gentle autoplay — paused on hover/focus, when the tab is hidden, or
     when the visitor prefers reduced motion. */
  useEffect(() => {
    if (paused || total < 2) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setIndex((current) => (current + 1) % total);
      }
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, total]);

  if (!slide) return null;

  const caption = pickBn(slide.caption, slide.captionBn, bn);
  const cards = slide.cards ?? [];

  const infoCard = (card: (typeof cards)[number], i: number, floating: boolean) => (
    <motion.div
      key={`${slide.id}-${i}`}
      initial={{ opacity: 0, y: floating ? 16 : 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: floating ? -12 : -6, scale: 0.97 }}
      transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-2xl border border-white/70 bg-white/85 shadow-[0_18px_40px_-24px_rgba(0,32,96,0.5)] backdrop-blur-xl",
        floating ? "w-[13.5rem] px-4 py-3" : "px-4 py-3"
      )}
    >
      <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-brand-blue">
        {pickBn(card.label, card.labelBn, bn)}
      </p>
      <p className="mt-1 text-[12.5px] font-semibold leading-snug text-brand-navy">
        {pickBn(card.value, card.valueBn, bn)}
      </p>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
      {/* ---------------- photo slider + floating pop-ups ---------------- */}
      <div
        className="relative order-2 lg:order-1"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="relative mx-auto max-w-[24rem] sm:max-w-[26rem]">
          {/* decorative halo */}
          <span
            className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-brand-blue/12 via-transparent to-amber-200/20 blur-2xl"
            aria-hidden="true"
          />

          <div
            className="relative aspect-square overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-ice shadow-[0_30px_70px_-40px_rgba(0,32,96,0.6)]"
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label={bn ? "ডা. শাজিয়া খানমের ছবি" : "Dr. Shazia Khanam photo gallery"}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                go(1);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                go(-1);
              }
            }}
            onTouchStart={(e) => {
              touchX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              const start = touchX.current;
              touchX.current = null;
              if (start === null) return;
              const delta = (e.changedTouches[0]?.clientX ?? start) - start;
              if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id || index}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {slide.image ? (
                  <Image
                    src={slide.image}
                    alt={slide.imageAlt || pickBn(content.name, content.nameBn, bn)}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1024px) 90vw, 416px"
                    className={cn(
                      slide.fit === "contain"
                        ? "object-contain object-bottom p-3"
                        : "object-cover object-top"
                    )}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#002060_0%,#0b3a8a_55%,#1e7dff_100%)] px-8 text-center">
                    <span className="dot-grid-light absolute inset-0 opacity-30" aria-hidden="true" />
                    <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12 text-amber-300 ring-1 ring-white/20">
                      <ImageOff className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100/80">
                      {bn ? "ছবি শীঘ্রই আসছে" : "Photo coming soon"}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* caption — a light glass panel instead of a heavy scrim, so
                the photograph stays visible behind the text */}
            <div
              className="pointer-events-none absolute inset-x-3 bottom-3 rounded-2xl border border-white/25 bg-brand-navy/45 px-4 py-3 shadow-[0_16px_36px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl backdrop-saturate-150"
              aria-live="polite"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${slide.id}-caption`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="font-heading text-[14px] font-bold leading-snug text-white drop-shadow-sm"
                >
                  {caption}
                </motion.p>
              </AnimatePresence>
              <p className="mt-0.5 text-[10.5px] font-medium text-blue-50/80">
                {bn
                  ? `${toBnDigits(index + 1)} / ${toBnDigits(total)}`
                  : `${index + 1} / ${total}`}
              </p>
            </div>

            {/* arrows */}
            {total > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={bn ? "আগের ছবি" : "Previous photo"}
                  className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-lg transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                >
                  <ChevronLeft className="h-4.5 w-4.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={bn ? "পরের ছবি" : "Next photo"}
                  className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-lg transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                >
                  <ChevronRight className="h-4.5 w-4.5" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>

          {/* square thumbnails — act as both the indicator and the picker */}
          {total > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-2">
              {slides.map((item, i) => (
                <button
                  key={item.id || i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={
                    bn ? `ছবি ${toBnDigits(i + 1)} দেখুন` : `Show photo ${i + 1}`
                  }
                  aria-current={i === index}
                  className={cn(
                    "relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-2 transition-all duration-300",
                    i === index
                      ? "ring-brand-blue shadow-md shadow-blue-500/25"
                      : "ring-transparent opacity-65 hover:opacity-100"
                  )}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <span className="block h-full w-full bg-blue-100" />
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? (bn ? "স্লাইড চালু করুন" : "Play slideshow") : bn ? "স্লাইড থামান" : "Pause slideshow"}
                className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-brand-navy/50 transition hover:bg-blue-50 hover:text-brand-blue"
              >
                {paused ? (
                  <Play className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Pause className="h-3 w-3" aria-hidden="true" />
                )}
              </button>
            </div>
          ) : null}

          {/* floating pop-ups (desktop) — one per info card, re-keyed on
              every slide so they animate in/out together with the photo */}
          <div className="pointer-events-none absolute inset-0 hidden xl:block" aria-hidden="true">
            <div className="absolute -left-12 top-10">
              <AnimatePresence mode="popLayout">
                {cards[0] ? infoCard(cards[0], 0, true) : null}
              </AnimatePresence>
            </div>
            <div className="absolute -right-10 top-1/3">
              <AnimatePresence mode="popLayout">
                {cards[1] ? infoCard(cards[1], 1, true) : null}
              </AnimatePresence>
            </div>
            {/* anchored off the container bottom, which includes the
                thumbnail rail — kept high enough to clear the caption */}
            <div className="absolute -left-12 bottom-40">
              <AnimatePresence mode="popLayout">
                {cards[2] ? infoCard(cards[2], 2, true) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* pop-ups below the photo on smaller screens */}
        <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:hidden">
          <AnimatePresence mode="popLayout">
            {cards.map((card, i) => infoCard(card, i, false))}
          </AnimatePresence>
        </div>
      </div>

      {/* ---------------- founder summary ---------------- */}
      <div className="order-1 lg:order-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700 ring-1 ring-amber-300/50">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {bn ? "প্রতিষ্ঠাতা" : "Founder"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-[11px] font-bold text-brand-blue ring-1 ring-blue-100">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {bn ? "এফসিপিএস · ডব্লিউএফও ফেলো" : "FCPS · WFO Fellow"}
          </span>
        </div>

        {/* years — the headline number */}
        <div className="mt-6 flex items-end gap-4">
          <span className="font-heading text-6xl font-bold leading-none text-brand-navy sm:text-7xl">
            {bn ? toBnDigits(content.years) : content.years}
          </span>
          <span className="mb-1.5 max-w-[9rem] text-[11px] font-semibold uppercase leading-snug tracking-wider text-slate-500">
            {pickBn(content.yearsLabel, content.yearsLabelBn, bn)}
          </span>
        </div>

        <h3 className="font-heading mt-4 text-2xl font-bold text-brand-navy sm:text-[1.7rem]">
          {pickBn(content.name, content.nameBn, bn)}
        </h3>
        <p className="mt-1 text-sm font-semibold text-brand-blue">
          {pickBn(content.role, content.roleBn, bn)}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
          {pickBn(content.bio, content.bioBn, bn)}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            asChild
            className="rounded-full bg-brand-blue px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy"
          >
            <a
              href="/about#founder-credentials"
              onClick={(e) => {
                e.preventDefault();
                navigate("/about");
                window.requestAnimationFrame(() =>
                  window.requestAnimationFrame(() => {
                    const el = document.getElementById("founder-credentials");
                    if (el) {
                      const top =
                        el.getBoundingClientRect().top + window.scrollY - 92;
                      window.scrollTo({ top, behavior: "smooth" });
                    }
                  })
                );
              }}
              className="inline-flex items-center gap-2"
            >
              {pickBn(content.ctaProfile, content.ctaProfileBn, bn)}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-brand-blue/25 bg-white px-6 py-3.5 text-sm font-bold text-brand-blue hover:bg-blue-50"
          >
            <a
              href="/appointment"
              onClick={(e) => {
                e.preventDefault();
                navigate("/appointment");
              }}
              className="inline-flex items-center gap-2"
            >
              <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
              {pickBn(content.ctaBook, content.ctaBookBn, bn)}
            </a>
          </Button>
        </div>

        {/* clinic highlights stay right below her story */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="flex items-start gap-3 rounded-2xl border border-blue-100/70 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-[0_14px_30px_-20px_rgba(30,125,255,0.5)]"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                <DynamicIcon name={h.icon} className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0">
                <span className="font-heading block text-[13px] font-bold text-brand-navy">
                  {pickBn(h.title, h.titleBn, bn)}
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-slate-500">
                  {pickBn(h.description, h.descriptionBn, bn)}
                </span>
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          {ratingNote?.trim()
            ? ratingNote
            : bn
              ? "৪.৯ রেটিং · যাচাইকৃত রোগীদের রিভিউ"
              : "4.9 rating · verified patient reviews"}
        </p>
      </div>
    </div>
  );
}
