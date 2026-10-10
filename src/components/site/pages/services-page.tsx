"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { services, serviceCategories } from "@/lib/data/services";
import { ServiceCard, PageHeader, CtaBanner } from "@/components/site/shared";
import { Reveal, SectionHeading } from "@/components/site/motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  SERVICES PAGE — filter + search + full grid                        */
/* ------------------------------------------------------------------ */

const servicesJsonLd = {
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
      url: `https://aristocratdentalcarebd.com/#/services/${s.slug}`,
    },
  })),
};

export function ServicesPage() {
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { navigate } = useRouter();

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
        s.tagline.toLowerCase().includes(q) ||
        s.excerpt.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [category, search]);

  return (
    <>
      <PageHeader
        eyebrow="Excellence In Care"
        title="Specialty dental services for every smile"
        description="Eleven specialty services under one roof — combining advanced technology, specialist expertise and genuinely gentle care, right here in Uttara, Dhaka."
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Services" },
        ]}
      />

      {/* Filter & search bar */}
      <section className="sticky top-[64px] z-30 border-b border-blue-100/60 bg-white/85 py-4 backdrop-blur-lg" aria-label="Service filters">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 sm:px-6">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              aria-label="Search services"
              className="rounded-full border-blue-100 bg-white pl-10 focus-visible:ring-brand-blue"
            />
          </div>

          <div className="scroll-area flex flex-1 items-center gap-2 overflow-x-auto pb-1 pt-1">
            <SlidersHorizontal className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" aria-hidden="true" />
            {serviceCategories.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={category === c.value}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300",
                  category === c.value
                    ? "bg-brand-blue text-white shadow-lg shadow-blue-500/30"
                    : "bg-blue-50 text-brand-navy hover:bg-blue-100"
                )}
              >
                {c.label}
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    category === c.value
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-500"
                  )}
                >
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 sm:py-20" aria-label="Service list">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-baseline justify-between">
            <p className="text-sm text-slate-500" aria-live="polite">
              Showing{" "}
              <span className="font-bold text-brand-navy">{filtered.length}</span>{" "}
              of {services.length} services
              {category !== "all" && (
                <span> in <span className="font-semibold text-brand-blue">{category}</span></span>
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
                  No matching services
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try a different search term or category — or call us at 01715-027522
                  and we'll guide you to the right treatment.
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
                    Not sure what you need?
                  </span>
                  <h3 className="font-heading mt-4 text-2xl font-bold text-brand-navy sm:text-3xl">
                    Book a consultation — we'll guide you honestly
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                    Sometimes the right treatment isn't obvious: a toothache could
                    need a filling, a root canal or just a cleaning. Our specialists
                    examine, diagnose with digital X-rays and explain every option —
                    you decide with full transparency.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/appointment")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy"
                  >
                    Book a Consultation
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <a
                    href="tel:+8801715027522"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold text-brand-navy ring-2 ring-brand-blue/30 transition-all duration-300 hover:bg-blue-50"
                  >
                    Call 01715-027522
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
