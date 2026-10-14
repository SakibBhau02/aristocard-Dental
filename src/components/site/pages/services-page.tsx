"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { useBundle } from "@/components/site/content-provider";
import { ServiceCard, PageHeader, CtaBanner, QuizTeaser, CostTeaser } from "@/components/site/shared";
import { Reveal } from "@/components/site/motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  SERVICES PAGE — filter + search + full grid (EN / বাংলা)            */
/* ------------------------------------------------------------------ */

export function ServicesPage() {
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.servicesPage;
  const { services, settings } = useBundle();

  /* Category chips with live counts (same shape as the static list) */
  const serviceCategories = useMemo(
    () => [
      { value: "all", label: "All Services", count: services.length },
      { value: "Restorative", label: "Restorative", count: services.filter((s) => s.category === "Restorative").length },
      { value: "Cosmetic", label: "Cosmetic", count: services.filter((s) => s.category === "Cosmetic").length },
      { value: "Orthodontics", label: "Orthodontics", count: services.filter((s) => s.category === "Orthodontics").length },
      { value: "Surgical", label: "Surgical", count: services.filter((s) => s.category === "Surgical").length },
      { value: "Preventive", label: "Preventive", count: services.filter((s) => s.category === "Preventive").length },
    ],
    [services]
  );

  /* Services ItemList JSON-LD over the live CMS services */
  const servicesJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Dental Services at Aristocrat Dental Care & Orthodontic Center",
      itemListElement: services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "MedicalTherapy",
          name: s.name,
          description: s.excerpt,
          url: `https://aristocratdentalcarebd.com/services/${s.slug}`,
        },
      })),
    }),
    [services]
  );

  usePageMeta({
    title: "Dental Services — Implants, Braces, Invisalign, Root Canal & More",
    description:
      "Explore 11 specialty dental services at Aristocrat Dental Care, Uttara Dhaka: implants, Invisalign, porcelain veneers, root canal, laser fillings, kids dentistry & more.",
    jsonLd: servicesJsonLd,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const matchCategory = category === "all" || s.category === category;
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (bn && s.nameBn ? s.nameBn.includes(search.trim()) : false) ||
        s.tagline.toLowerCase().includes(q) ||
        s.excerpt.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [services, category, search, bn]);

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[
          { label: d.chrome.nav.home, to: "/" },
          { label: d.chrome.nav.services },
        ]}
      />

      {/* Filter & search bar */}
      <section className="sticky top-[64px] z-30 border-b border-blue-100/60 bg-white/90 py-4 shadow-[0_10px_30px_-20px_rgba(0,32,96,0.3)] backdrop-blur-lg" aria-label="Service filters">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 sm:px-6">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchLabel}
              className="h-11 rounded-full border-blue-200/80 bg-white pl-11 text-sm shadow-sm ring-1 ring-transparent transition-all placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:shadow-md"
            />
          </div>

          <div className="scroll-area flex flex-1 items-center gap-2 overflow-x-auto pb-1 pt-1">
            <SlidersHorizontal className="hidden h-4.5 w-4.5 shrink-0 text-slate-400 sm:block" aria-hidden="true" />
            {serviceCategories.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={category === c.value}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-300",
                  category === c.value
                    ? "bg-brand-blue text-white shadow-lg shadow-blue-500/30"
                    : "bg-blue-50 text-brand-navy/80 hover:bg-blue-100 hover:text-brand-navy"
                )}
              >
                {c.value === "all" ? t.allLabel : d.categories[c.value as keyof typeof d.categories]}
                <span
                  className={cn(
                    "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold",
                    category === c.value
                      ? "bg-white/25 text-white"
                      : "bg-white text-brand-blue ring-1 ring-blue-100"
                  )}
                >
                  {bn ? toBnDigits(c.count) : c.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="section-wash py-16 sm:py-20" aria-label="Service list">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-baseline justify-between">
            <p className="text-sm text-slate-500" aria-live="polite">
              {bn ? (
                <>
                  {t.showing}{" "}
                  <span className="font-bold text-brand-navy">{toBnDigits(filtered.length)}</span>{" "}
                  {t.of} {toBnDigits(services.length)} {t.servicesWord}
                  {category !== "all" && (
                    <span> — {t.inCategory} <span className="font-semibold text-brand-blue">{d.categories[category as keyof typeof d.categories]}</span></span>
                  )}
                </>
              ) : (
                <>
                  {t.showing}{" "}
                  <span className="font-bold text-brand-navy">{filtered.length}</span>{" "}
                  {t.of} {services.length} {t.servicesWord}
                  {category !== "all" && (
                    <span> {t.inCategory} <span className="font-semibold text-brand-blue">{category}</span></span>
                  )}
                </>
              )}
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div
                key={`${category}-${search}`}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filtered.map((service, i) => (
                  <ServiceCard key={service.slug} service={service} index={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="mx-auto max-w-md rounded-3xl border border-dashed border-blue-200 bg-ice p-12 text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Sparkles className="mx-auto h-10 w-10 text-brand-blue/50" aria-hidden="true" />
                <h3 className="font-heading mt-4 text-lg font-bold text-brand-navy">
                  {t.emptyTitle}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {t.emptyText.replace("{phone}", settings.phone)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Not sure which treatment? */}
          <Reveal className="mt-16">
            <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-ice to-white p-8 sm:p-10">
              <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600 ring-1 ring-amber-100">
                    {t.unsureBadge}
                  </span>
                  <h3 className="font-heading mt-4 text-2xl font-bold text-brand-navy sm:text-3xl">
                    {t.unsureTitle}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    {t.unsureText}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/appointment")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy"
                  >
                    {t.unsureBook}
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <a
                    href="tel:+8801715027522"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold text-brand-navy ring-2 ring-brand-blue/30 transition-all duration-300 hover:bg-blue-50"
                  >
                    {t.unsureCall.replace("{phone}", settings.phone)}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Smile Check + Cost Estimator — guide unsure & price-curious
          visitors before the CTA (side-by-side from lg up) */}
      <Reveal className="pb-2">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-2">
          <QuizTeaser />
          <CostTeaser />
        </div>
      </Reveal>

      <CtaBanner />
    </>
  );
}

