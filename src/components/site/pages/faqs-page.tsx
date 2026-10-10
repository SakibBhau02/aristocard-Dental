"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, HelpCircle, ListFilter, MessageCircle, Phone, Search, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { site } from "@/lib/site";
import { generalFaqs } from "@/lib/data/faqs";
import { services } from "@/lib/data/services";
import { PageHeader, CtaBanner } from "@/components/site/shared";
import { Reveal } from "@/components/site/motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  FAQ HUB — every question on the site, searchable (EN / বাংলা)      */
/* ------------------------------------------------------------------ */

type FaqEntry = {
  question: string;
  answer: string;
  questionBn?: string;
  answerBn?: string;
  group: string; // "clinic" | service category
  sourceLabel: string; // service shortName (BN-aware) or "clinic"
  sourceSlug: string | null; // service slug for linking
};

const serviceCategoryOrder = [
  "Cosmetic",
  "Orthodontics",
  "Restorative",
  "Surgical",
  "Preventive",
  "Pediatric",
  "General",
] as const;

export function FaqsPage() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.faqsPage;
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("all");

  /* flatten all FAQs into one searchable list */
  const allFaqs = useMemo<FaqEntry[]>(() => {
    const clinic: FaqEntry[] = generalFaqs.map((f) => ({
      question: f.question,
      answer: f.answer,
      questionBn: f.questionBn,
      answerBn: f.answerBn,
      group: "clinic",
      sourceLabel: t.groupClinic,
      sourceSlug: null,
    }));
    const serviceFaqs: FaqEntry[] = services.flatMap((s) =>
      s.faqs.map((f) => ({
        question: f.question,
        answer: f.answer,
        group: s.category,
        sourceLabel: bn && s.shortNameBn ? s.shortNameBn : s.shortName,
        sourceSlug: s.slug,
      }))
    );
    return [...clinic, ...serviceFaqs];
  }, [bn, t.groupClinic]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allFaqs.filter((f) => {
      if (group !== "all" && f.group !== group) return false;
      if (!q) return true;
      return (
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        (f.questionBn ?? "").includes(query.trim()) ||
        (f.answerBn ?? "").includes(query.trim())
      );
    });
  }, [allFaqs, query, group]);

  /* group labels for chips (category labels are dictionary-localized) */
  const groups = useMemo(() => {
    const counts = new Map<string, number>();
    allFaqs.forEach((f) => counts.set(f.group, (counts.get(f.group) ?? 0) + 1));
    return [
      { key: "all", label: bn ? "সব" : "All", count: allFaqs.length },
      { key: "clinic", label: t.groupClinic, count: counts.get("clinic") ?? 0 },
      ...serviceCategoryOrder
        .filter((c) => counts.has(c))
        .map((c) => ({ key: c, label: d.categories[c], count: counts.get(c) ?? 0 })),
    ];
  }, [allFaqs, bn, t.groupClinic, d.categories]);

  /* ordered groups present in the filtered result */
  const grouped = useMemo(() => {
    const order = ["clinic", ...serviceCategoryOrder];
    const map = new Map<string, FaqEntry[]>();
    filtered.forEach((f) => {
      const list = map.get(f.group) ?? [];
      list.push(f);
      map.set(f.group, list);
    });
    return order
      .filter((g) => map.has(g))
      .map((g) => ({
        key: g,
        label: g === "clinic" ? t.groupClinic : d.categories[g as keyof typeof d.categories],
        items: map.get(g)!,
      }));
  }, [filtered, t.groupClinic, d.categories]);

  usePageMeta({
    title: "Frequently Asked Questions — Dental FAQs | Aristocrat Dental Care",
    description:
      "56+ answered dental questions: implant costs in Dhaka, braces duration, whitening safety, kids' first visit, emergencies, booking & pricing — answered by Aristocrat Dental Care specialists, Uttara.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: allFaqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  });

  const countText = t.searchResults.replace(
    "{count}",
    bn ? toBnDigits(filtered.length) : String(filtered.length)
  );

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[{ label: d.chrome.nav.home, to: "/" }, { label: bn ? "সাধারণ জিজ্ঞাসা" : "FAQs" }]}
      />

      {/* Search + filters */}
      <section className="py-10" aria-label="Search and filter questions">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                className="h-12 w-full rounded-2xl border border-blue-100 bg-white pl-11 pr-11 text-sm text-brand-navy shadow-[0_10px_30px_-16px_rgba(0,32,96,0.25)] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-blue-100 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t.searchClear}
                  className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-blue-50 hover:text-brand-blue"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </Reveal>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {groups.map((g) => {
              const active = group === g.key;
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGroup(g.key)}
                  aria-pressed={active}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-300",
                    active
                      ? "bg-brand-navy text-white shadow-lg shadow-navy-900/25"
                      : "border border-blue-100 bg-white text-slate-600 hover:border-brand-blue/40 hover:text-brand-blue"
                  )}
                >
                  {g.label}
                  <span
                    className={cn(
                      "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                      active ? "bg-white/20 text-white" : "bg-blue-50 text-brand-blue"
                    )}
                  >
                    {bn ? toBnDigits(g.count) : g.count}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs font-medium text-slate-500" aria-live="polite">
            {query || group !== "all" ? countText : `${bn ? toBnDigits(allFaqs.length) : allFaqs.length} ${t.countLabel}`}
          </p>

          {bn && (
            <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-blue-100">
              <Globe className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
              {t.contentNote}
            </p>
          )}
        </div>
      </section>

      {/* Grouped answers */}
      <section className="pb-16 sm:pb-20" aria-label="Frequently asked questions">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {filtered.length === 0 ? (
            <Reveal>
              <div className="rounded-3xl border border-blue-100 bg-ice p-10 text-center">
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm ring-1 ring-blue-100">
                  <HelpCircle className="h-7 w-7" aria-hidden="true" />
                </span>
                <p className="font-heading mt-4 text-lg font-bold text-brand-navy">{t.noResults}</p>
                <p className="mt-1.5 text-sm text-slate-500">{t.noResultsHint}</p>
              </div>
            </Reveal>
          ) : (
            <div className="space-y-10">
              <AnimatePresence mode="popLayout">
                {grouped.map((g, gi) => (
                  <motion.div
                    key={g.key}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, delay: gi * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h2 className="flex items-center gap-2.5 font-heading text-base font-bold uppercase tracking-wider text-brand-navy">
                      <ListFilter className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                      {g.label}
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-blue">
                        {bn ? toBnDigits(g.items.length) : g.items.length}
                      </span>
                    </h2>
                    <Accordion type="single" collapsible className="mt-3 w-full">
                      {g.items.map((f, i) => (
                        <AccordionItem
                          key={`${g.key}-${i}`}
                          value={`${g.key}-${i}`}
                          className="faq-row border-b border-blue-100/80 data-[state=open]:border-brand-blue/30"
                        >
                          <AccordionTrigger className="py-4.5 text-left font-heading text-[15px] font-semibold text-brand-navy hover:text-brand-blue hover:no-underline">
                            {bn && f.questionBn ? f.questionBn : f.question}
                          </AccordionTrigger>
                          <AccordionContent className="pb-5 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                            {bn && f.answerBn ? f.answerBn : f.answer}
                            <span className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-brand-blue ring-1 ring-blue-100">
                                {f.sourceLabel}
                              </span>
                              {f.sourceSlug && (
                                <a
                                  href={`#/services/${f.sourceSlug}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/services/${f.sourceSlug}`);
                                  }}
                                  className="text-[12px] font-semibold text-brand-blue underline decoration-blue-200 underline-offset-4 transition-colors hover:text-brand-navy"
                                >
                                  {d.shared.learnMore} →
                                </a>
                              )}
                            </span>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* ask strip */}
          <Reveal className="mt-12">
            <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-blue-100 bg-white p-6 text-center shadow-[0_12px_40px_-20px_rgba(0,32,96,0.25)] sm:flex-row sm:text-left">
              <div>
                <p className="font-heading text-base font-bold text-brand-navy">{t.askTitle}</p>
                <p className="mt-1 text-sm text-slate-600">{t.askText}</p>
              </div>
              <div className="flex shrink-0 gap-2.5">
                <a
                  href={`tel:${site.phoneRaw}`}
                  className="btn-shine inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {site.phone}
                </a>
                <button
                  type="button"
                  onClick={() => navigate("/contact")}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-brand-navy ring-1 ring-blue-100 transition-all duration-300 hover:bg-blue-50"
                >
                  <MessageCircle className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                  {d.home.faq.sendMsg}
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
