"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Camera,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Globe,
  Info,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { BeforeAfterSlider } from "@/components/site/before-after-slider";
import { PageHeader, CtaBanner } from "@/components/site/shared";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/site/motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { smileCases as cases } from "@/lib/data/smile-cases";

/* ------------------------------------------------------------------ */
/*  GALLERY PAGE — Smile transformations (EN / বাংলা)                   */
/* ------------------------------------------------------------------ */

const filterCategories = ["All", "Cosmetic", "Orthodontics", "Restorative", "Preventive"] as const;
type FilterKey = (typeof filterCategories)[number];

export function GalleryPage() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.galleryPage;
  const [filter, setFilter] = useState<FilterKey>("All");

  const visibleCases = useMemo(
    () => (filter === "All" ? cases : cases.filter((c) => c.category === filter)),
    [filter]
  );

  usePageMeta({
    title: "Smile Gallery — Before & After Dental Transformations",
    description:
      "See real smile transformations from Aristocrat Dental Care, Uttara Dhaka: whitening, braces & veneers before/after results. Drag the slider to compare. Book your smile makeover today.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      name: "Smile Transformation Gallery — Aristocrat Dental Care",
      url: "https://aristocratdentalcarebd.com/#/gallery",
      about: cases.map((c) => ({
        "@type": "CreativeWork",
        name: `${c.treatment} — ${c.title}`,
        text: c.result,
      })),
    },
  });

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[{ label: d.chrome.nav.home, to: "/" }, { label: d.chrome.nav.gallery }]}
      />

      {/* Hint banner */}
      <section className="py-8" aria-label="How to use the comparison slider">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-blue-100/80 bg-ice px-6 py-5 text-center sm:flex-row sm:text-left">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm ring-1 ring-blue-100">
                <Camera className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="flex-1 text-sm leading-relaxed text-slate-600">
                <strong className="text-brand-navy">{t.howTo}</strong> {t.howToText}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Category filter */}
      <section className="pb-4" aria-label="Filter cases by treatment type">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {filterCategories.map((key) => {
              const count =
                key === "All"
                  ? cases.length
                  : cases.filter((c) => c.category === key).length;
              const active = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={active}
                  className={cn(
                    "relative rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                    active
                      ? "bg-brand-navy text-white shadow-lg shadow-navy-900/25"
                      : "border border-blue-100 bg-white text-slate-600 hover:border-brand-blue/40 hover:text-brand-blue"
                  )}
                >
                  {t.filters[key]}
                  <span
                    className={cn(
                      "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                      active ? "bg-white/20 text-white" : "bg-blue-50 text-brand-blue"
                    )}
                  >
                    {bn ? toBnDigits(count) : count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cases */}
      <section className="pb-16 sm:pb-20" aria-label="Smile transformation cases">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="space-y-16">
            <AnimatePresence mode="popLayout">
              {visibleCases.map((c, i) => (
              <motion.article
                key={c.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="grid items-center gap-10 lg:grid-cols-2"
                aria-labelledby={`${c.id}-title`}
              >
                {/* Slider */}
                <Reveal className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="relative mx-auto w-full max-w-md">
                    <BeforeAfterSlider
                      beforeSrc={c.beforeSrc}
                      afterSrc={c.afterSrc}
                      beforeAlt={c.beforeAlt}
                      afterAlt={c.afterAlt}
                    />
                    {/* floating treatment chip */}
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-navy px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                      {c.treatment}
                    </span>
                    {c.featured && (
                      <span className="absolute -bottom-3 right-4 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3.5 py-1.5 text-[11px] font-bold text-brand-navy shadow-lg">
                        <Star className="h-3.5 w-3.5 fill-brand-navy" aria-hidden="true" />
                        {t.featured}
                      </span>
                    )}
                  </div>
                </Reveal>

                {/* Details */}
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue ring-1 ring-blue-100">
                      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                      {t.caseStudy} {bn ? toBnDigits(String(i + 1).padStart(2, "0")) : String(i + 1).padStart(2, "0")}
                    </span>
                    <h2
                      id={`${c.id}-title`}
                      className="font-heading mt-4 text-2xl font-bold leading-snug text-brand-navy text-balance sm:text-3xl"
                    >
                      {c.title}
                    </h2>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                        {c.patient} • {bn ? toBnDigits(c.age) : c.age} {d.shared.yrs}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                        {c.duration}
                      </span>
                    </div>

                    <p className="mt-5 text-[15px] leading-relaxed text-slate-600 sm:text-base">
                      {c.result}
                    </p>

                    <StaggerContainer className="mt-6 space-y-2.5">
                      {c.procedures.map((p) => (
                        <StaggerItem key={p}>
                          <div className="flex items-start gap-3 rounded-xl bg-ice px-4 py-3 text-sm font-medium text-slate-700">
                            <CheckCircle2
                              className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500"
                              aria-hidden="true"
                            />
                            {p}
                          </div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>

                    {bn && (
                      <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-blue-100">
                        <Globe className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                        {t.contentNote}
                      </p>
                    )}

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Button
                        asChild
                        className="rounded-full bg-brand-blue px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy"
                      >
                        <a
                          href={`#/appointment?service=${c.serviceSlug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/appointment?service=${c.serviceSlug}`);
                          }}
                          className="inline-flex items-center gap-2"
                        >
                          <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                          {t.getTreatment}
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full border-brand-blue/25 bg-white px-6 py-3.5 text-sm font-bold text-brand-blue hover:bg-blue-50"
                      >
                        <a
                          href={`#/services/${c.serviceSlug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/services/${c.serviceSlug}`);
                          }}
                          className="inline-flex items-center gap-2"
                        >
                          {t.aboutTreatment.replace("{treatment}", c.treatment)}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="pb-6" aria-label="Medical disclaimer">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <p className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs leading-relaxed text-amber-800">
              <Info className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span>
                <strong>{t.disclaimerTitle}</strong> {t.disclaimerText}
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBanner
        title={t.ctaTitle}
        description={t.ctaDescription}
      />
    </>
  );
}
