"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgePercent,
  CalendarCheck,
  Calculator,
  Info,
  Minus,
  Plus,
  Receipt,
  RotateCcw,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { PageHeader, CtaBanner } from "@/components/site/shared";
import { Reveal, SectionHeading, StaggerContainer, StaggerItem } from "@/components/site/motion";
import { DynamicIcon } from "@/components/site/icon-map";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  PRICE ESTIMATOR PAGE — interactive treatment cost calculator       */
/* ------------------------------------------------------------------ */

type EstimatorItem = {
  slug: string;
  name: string;
  icon: string;
  category: string;
  min: number; // BDT
  max: number; // BDT
  unit: string; // "per tooth", "per session", "full treatment"…
  step: number; // quantity step
  maxQty: number;
  note?: string;
};

const estimatorItems: EstimatorItem[] = [
  { slug: "consultation", name: "Consultation & Checkup", icon: "Stethoscope", category: "General", min: 500, max: 1000, unit: "per visit", step: 1, maxQty: 4 },
  { slug: "scaling", name: "Scaling & Polishing", icon: "Sparkles", category: "General", min: 1500, max: 3000, unit: "per session", step: 1, maxQty: 4 },
  { slug: "whitening", name: "Teeth Whitening", icon: "Smile", category: "Cosmetic", min: 8000, max: 20000, unit: "full treatment", step: 1, maxQty: 2, note: "In-clinic professional gel" },
  { slug: "filling", name: "Tooth-Colored Filling", icon: "Zap", category: "Restorative", min: 1500, max: 3500, unit: "per tooth", step: 1, maxQty: 10 },
  { slug: "root-canal", name: "Root Canal Treatment", icon: "Activity", category: "Restorative", min: 4000, max: 8000, unit: "per tooth", step: 1, maxQty: 8, note: "Molars may cost more" },
  { slug: "crown", name: "Crown (Zirconia/PFM)", icon: "Crown", category: "Restorative", min: 6000, max: 25000, unit: "per tooth", step: 1, maxQty: 10, note: "Zirconia at higher end" },
  { slug: "bridge", name: "Bridge (per unit)", icon: "Anchor", category: "Restorative", min: 6000, max: 15000, unit: "per unit", step: 1, maxQty: 6 },
  { slug: "implant", name: "Dental Implant + Crown", icon: "Anchor", category: "Surgical", min: 35000, max: 70000, unit: "per tooth", step: 1, maxQty: 8, note: "Implant system dependent" },
  { slug: "extraction", name: "Wisdom Tooth Extraction", icon: "Scissors", category: "Surgical", min: 4000, max: 12000, unit: "per tooth", step: 1, maxQty: 4 },
  { slug: "veneer", name: "Porcelain Veneer", icon: "Gem", category: "Cosmetic", min: 8000, max: 20000, unit: "per tooth", step: 1, maxQty: 10 },
  { slug: "braces-metal", name: "Metal Braces (Full Case)", icon: "Grid3x3", category: "Orthodontics", min: 35000, max: 70000, unit: "full treatment", step: 1, maxQty: 2 },
  { slug: "braces-ceramic", name: "Ceramic Braces (Full Case)", icon: "Grid3x3", category: "Orthodontics", min: 60000, max: 100000, unit: "full treatment", step: 1, maxQty: 2 },
  { slug: "invisalign", name: "Invisalign® Clear Aligners", icon: "Smile", category: "Orthodontics", min: 150000, max: 350000, unit: "full treatment", step: 1, maxQty: 1, note: "Complexity dependent" },
  { slug: "gum", name: "Gum Treatment (Deep Cleaning)", icon: "Leaf", category: "Preventive", min: 2500, max: 6000, unit: "per session", step: 1, maxQty: 4 },
  { slug: "kids", name: "Kids' Checkup + Fluoride", icon: "Baby", category: "Preventive", min: 1000, max: 2500, unit: "per visit", step: 1, maxQty: 4 },
];

type Selection = Record<string, number>;

const formatBDT = (n: number) =>
  `৳${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function EstimatorPage() {
  const { navigate } = useRouter();
  const [selection, setSelection] = useState<Selection>({});

  usePageMeta({
    title: "Treatment Cost Estimator — Dental Prices in Dhaka (2026)",
    description:
      "Estimate your dental treatment cost in Bangladesh before your visit. Transparent price ranges for implants, braces, Invisalign, root canals, veneers & more at Aristocrat Dental Care, Uttara Dhaka.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Dental Treatment Cost Estimator",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      url: "https://aristocratdentalcarebd.com/#/estimator",
      offersCurrency: "BDT",
      description:
        "Interactive estimator for dental treatment costs in Dhaka, Bangladesh.",
    },
  });

  const totals = useMemo(() => {
    let min = 0;
    let max = 0;
    let count = 0;
    for (const [slug, qty] of Object.entries(selection)) {
      if (qty <= 0) continue;
      const item = estimatorItems.find((i) => i.slug === slug);
      if (!item) continue;
      min += item.min * qty;
      max += item.max * qty;
      count += qty;
    }
    return { min, max, count, isEmpty: count === 0 };
  }, [selection]);

  const setQty = (slug: string, qty: number) => {
    setSelection((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[slug];
      else next[slug] = qty;
      return next;
    });
  };

  const grouped = useMemo(() => {
    const groups: Record<string, EstimatorItem[]> = {};
    for (const item of estimatorItems) {
      groups[item.category] ??= [];
      groups[item.category].push(item);
    }
    return groups;
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Transparent Pricing"
        title="Know your treatment cost — before you book"
        description="Select the treatments you're considering and see honest estimated ranges instantly. No hidden charges, no surprises — ever."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Cost Estimator" }]}
      />

      <section className="py-14 sm:py-16" aria-label="Treatment cost estimator tool">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            {/* Item picker */}
            <div>
              <SectionHeading
                align="left"
                eyebrow="Step 1 — Select Treatments"
                title="What are you considering?"
                description="Tap + to add treatments and adjust quantities. Estimates update instantly."
              />

              <div className="mt-10 space-y-10">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="font-heading flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-brand-blue">
                      <span className="h-px w-8 bg-brand-blue/40" aria-hidden="true" />
                      {category}
                    </h3>
                    <StaggerContainer className="mt-4 grid gap-3 sm:grid-cols-2">
                      {items.map((item) => {
                        const qty = selection[item.slug] ?? 0;
                        const active = qty > 0;
                        return (
                          <StaggerItem key={item.slug}>
                            <div
                              className={cn(
                                "group flex items-center gap-4 rounded-2xl border p-4 transition-all duration-400",
                                active
                                  ? "border-brand-blue/50 bg-blue-50/60 shadow-[0_10px_30px_-14px_rgba(30,125,255,0.4)]"
                                  : "border-blue-100/70 bg-white hover:border-brand-blue/30 hover:shadow-[0_10px_25px_-14px_rgba(30,125,255,0.3)]"
                              )}
                            >
                              <span
                                className={cn(
                                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-400",
                                  active
                                    ? "bg-brand-blue text-white shadow-lg shadow-blue-500/40"
                                    : "bg-blue-50 text-brand-blue ring-1 ring-blue-100 group-hover:scale-105"
                                )}
                              >
                                <DynamicIcon name={item.icon} className="h-5.5 w-5.5" />
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="font-heading text-sm font-bold leading-snug text-brand-navy">
                                  {item.name}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {formatBDT(item.min)}–{formatBDT(item.max)}{" "}
                                  <span className="text-slate-400">{item.unit}</span>
                                </p>
                              </div>

                              {/* Quantity stepper */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setQty(item.slug, Math.max(0, qty - item.step))}
                                  disabled={!active}
                                  aria-label={`Remove one ${item.name}`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-navy ring-1 ring-blue-100 transition-all duration-300 hover:bg-blue-100 disabled:opacity-30"
                                >
                                  <Minus className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <motion.span
                                  key={qty}
                                  initial={{ scale: 1.4 }}
                                  animate={{ scale: 1 }}
                                  className={cn(
                                    "w-7 text-center font-heading text-sm font-bold",
                                    active ? "text-brand-blue" : "text-slate-300"
                                  )}
                                >
                                  {qty}
                                </motion.span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQty(item.slug, Math.min(item.maxQty, qty + item.step))
                                  }
                                  aria-label={`Add one ${item.name}`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue text-white shadow-md shadow-blue-500/30 transition-all duration-300 hover:bg-brand-navy"
                                >
                                  <Plus className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </StaggerItem>
                        );
                      })}
                    </StaggerContainer>
                  </div>
                ))}
              </div>
            </div>

            {/* Sticky summary */}
            <div>
              <Reveal delay={0.1}>
                <div className="sticky top-28">
                  <div className="hero-mesh-dark relative overflow-hidden rounded-[2rem] p-7 shadow-2xl shadow-navy-900/40 sm:p-8">
                    <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-amber-300 ring-1 ring-white/15">
                          <Calculator className="h-5.5 w-5.5" aria-hidden="true" />
                        </span>
                        <div>
                          <h2 className="font-heading text-lg font-bold text-white">
                            Estimated Total
                          </h2>
                          <p className="text-xs text-blue-200/80">
                            {totals.count > 0
                              ? `${totals.count} item${totals.count > 1 ? "s" : ""} selected`
                              : "Select treatments to begin"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-7" aria-live="polite">
                        <AnimatePresence mode="wait">
                          {totals.isEmpty ? (
                            <motion.div
                              key="empty"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="rounded-2xl border border-dashed border-white/25 p-6 text-center"
                            >
                              <Wallet className="mx-auto h-8 w-8 text-blue-300/60" aria-hidden="true" />
                              <p className="mt-3 text-sm text-blue-200/80">
                                Add treatments from the list and your honest
                                price range will appear here.
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="total"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="rounded-2xl bg-white/8 p-6 ring-1 ring-white/12"
                            >
                              <p className="text-center font-heading text-3xl font-bold text-white sm:text-[2.15rem]">
                                {formatBDT(totals.min)}
                                <span className="mx-1 text-blue-300/70">–</span>
                                {formatBDT(totals.max)}
                              </p>
                              <p className="mt-2 text-center text-xs text-blue-200/80">
                                Estimated range in BDT (৳) • Final price confirmed
                                at consultation
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Selected items list */}
                      {!totals.isEmpty && (
                        <ul className="scroll-area mt-6 max-h-48 space-y-2 overflow-y-auto pr-1">
                          {Object.entries(selection).map(([slug, qty]) => {
                            const item = estimatorItems.find((i) => i.slug === slug);
                            if (!item) return null;
                            return (
                              <li
                                key={slug}
                                className="flex items-center justify-between gap-3 rounded-xl bg-white/8 px-4 py-2.5 text-sm ring-1 ring-white/10"
                              >
                                <span className="min-w-0 flex-1 truncate text-blue-100/90">
                                  {item.name}
                                  {qty > 1 && (
                                    <span className="ml-1.5 rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                      ×{qty}
                                    </span>
                                  )}
                                </span>
                                <span className="shrink-0 font-semibold text-white">
                                  {formatBDT(item.min * qty)}–{formatBDT(item.max * qty)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setQty(slug, 0)}
                                  aria-label={`Remove ${item.name} from estimate`}
                                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-blue-200/60 transition-colors hover:bg-rose-500/20 hover:text-rose-300"
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      <div className="mt-6 space-y-3">
                        <Button
                          asChild
                          className="w-full rounded-2xl bg-white py-4 text-sm font-bold text-brand-navy shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                        >
                          <a
                            href="#/appointment"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate("/appointment");
                            }}
                            className="inline-flex items-center justify-center gap-2"
                          >
                            <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                            Book Consultation
                          </a>
                        </Button>
                        {!totals.isEmpty && (
                          <button
                            type="button"
                            onClick={() => setSelection({})}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold text-blue-200/80 ring-1 ring-white/20 transition-all duration-300 hover:bg-white/10 hover:text-white"
                          >
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                            Reset Estimate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* assurance card */}
                  <div className="mt-4 rounded-3xl border border-blue-100/80 bg-white p-5">
                    <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-navy">
                      <BadgePercent className="h-4.5 w-4.5 text-brand-blue" aria-hidden="true" />
                      Why a range, not one price?
                      <Receipt className="ml-auto h-4 w-4 text-slate-300" aria-hidden="true" />
                    </h3>
                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                      Honest dentistry means honest pricing. The exact cost
                      depends on materials chosen (e.g. zirconia vs PFM crowns),
                      case complexity and clinical findings at your examination —
                      which is why we show realistic ranges, not fake fixed
                      prices. Your personalized written plan comes with an exact
                      quote before any treatment begins.{" "}
                      <span className="font-semibold text-brand-navy">
                        Installments available.
                      </span>
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* How pricing works */}
          <Reveal className="mt-16">
            <div className="grid gap-4 rounded-[2rem] border border-blue-100 bg-ice p-7 sm:grid-cols-3 sm:p-8">
              {[
                {
                  icon: "Sparkles",
                  title: "Transparent Quotes",
                  text: "Written treatment plans with exact pricing — before any procedure begins. No hidden charges, ever.",
                },
                {
                  icon: "BadgeCheck",
                  title: "Verified Specialists",
                  text: "BDS/MDS-qualified dentists. The price reflects expertise, sterile protocols and premium materials — not overheads.",
                },
                {
                  icon: "Wallet",
                  title: "Flexible Payment",
                  text: "Cash, cards, bKash and installment plans for larger treatments like implants and orthodontics.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm ring-1 ring-blue-100">
                    <DynamicIcon name={item.icon} className="h-5.5 w-5.5" />
                  </span>
                  <span>
                    <span className="font-heading block text-sm font-bold text-brand-navy">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-600">
                      {item.text}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* disclaimer */}
          <Reveal className="mt-6">
            <p className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs leading-relaxed text-amber-800">
              <Info className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span>
                <strong>Please note:</strong> These estimates reflect typical
                Dhaka market rates in 2026 and are provided for planning
                purposes only — not a binding quote. Your actual treatment plan
                and pricing are confirmed by our specialists after examination
                and digital diagnostics.
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBanner
        title="Get your exact, personalized quote"
        description="Book a consultation — our specialists examine, diagnose with digital X-rays and hand you a written plan with transparent pricing."
      />
    </>
  );
}
