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
  Printer,
  Receipt,
  RotateCcw,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { PageHeader, CtaBanner } from "@/components/site/shared";
import { Reveal, SectionHeading, StaggerContainer, StaggerItem } from "@/components/site/motion";
import { DynamicIcon } from "@/components/site/icon-map";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  PRICE ESTIMATOR — interactive treatment cost calculator (EN / বাংলা) */
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

/* Map estimator items → real service slugs (for booking deep-link) */
const serviceByEstimatorSlug: Record<string, string> = {
  scaling: "periodontal-gum-treatment",
  filling: "laser-assisted-fillings",
  "root-canal": "root-canal-treatment",
  crown: "crowns-bridges",
  bridge: "crowns-bridges",
  implant: "dental-implants",
  extraction: "oral-maxillofacial-surgery",
  veneer: "porcelain-veneers",
  "braces-metal": "traditional-braces-orthodontics",
  "braces-ceramic": "traditional-braces-orthodontics",
  invisalign: "invisalign-clear-aligners",
  gum: "periodontal-gum-treatment",
  kids: "pediatric-dentistry",
};

export function EstimatorPage() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.estimatorPage;
  const [selection, setSelection] = useState<Selection>({});

  const formatBDT = (n: number) => {
    const s = `৳${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    return bn ? toBnDigits(s) : s;
  };

  /* localized item name */
  const itemName = (item: EstimatorItem) =>
    bn ? (t.items as Record<string, string>)[item.slug] ?? item.name : item.name;
  const itemUnit = (item: EstimatorItem) =>
    bn ? (t.units as Record<string, string>)[item.unit] ?? item.unit : item.unit;

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

  /* Deep-link to booking with the estimate pre-filled */
  const bookWithEstimate = () => {
    const entries = Object.entries(selection).filter(([, qty]) => qty > 0);
    const params = new URLSearchParams();
    const primaryService = entries
      .map(([slug]) => serviceByEstimatorSlug[slug])
      .find(Boolean);
    if (primaryService) params.set("service", primaryService);
    const summary = entries
      .map(([slug, qty]) => {
        const item = estimatorItems.find((i) => i.slug === slug);
        return item ? `${item.name}${qty > 1 ? ` ×${qty}` : ""}` : null;
      })
      .filter(Boolean)
      .join(", ");
    params.set(
      "note",
      `Online estimate: ${summary} — est. ৳${totals.min.toLocaleString("en-IN")}–৳${totals.max.toLocaleString("en-IN")}. Please confirm exact pricing at consultation.`
    );
    navigate(`/appointment?${params.toString()}`);
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
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[{ label: d.chrome.nav.home, to: "/" }, { label: t.breadcrumb }]}
      />

      <section className="py-14 sm:py-16" aria-label="Treatment cost estimator tool">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            {/* Item picker */}
            <div>
              <SectionHeading
                align="left"
                eyebrow={t.stepEyebrow}
                title={t.stepTitle}
                description={t.stepText}
              />

              <div className="mt-10 space-y-10">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="font-heading flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-brand-blue">
                      <span className="h-px w-8 bg-brand-blue/40" aria-hidden="true" />
                      {d.categories[category as keyof typeof d.categories] ?? category}
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
                                  {itemName(item)}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {formatBDT(item.min)}–{formatBDT(item.max)}{" "}
                                  <span className="text-slate-400">{itemUnit(item)}</span>
                                </p>
                              </div>

                              {/* Quantity stepper */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setQty(item.slug, Math.max(0, qty - item.step))}
                                  disabled={!active}
                                  aria-label={t.removeOne.replace("{item}", itemName(item))}
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
                                  {bn ? toBnDigits(qty) : qty}
                                </motion.span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQty(item.slug, Math.min(item.maxQty, qty + item.step))
                                  }
                                  aria-label={t.addOne.replace("{item}", itemName(item))}
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
                            {t.totalTitle}
                          </h2>
                          <p className="text-xs text-blue-200/80">
                            {totals.count > 0
                              ? (totals.count > 1 ? t.itemsSelected : t.itemSelected).replace(
                                  "{count}",
                                  bn ? toBnDigits(totals.count) : String(totals.count)
                                )
                              : t.selectToBegin}
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
                                {t.emptyText}
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
                                {t.rangeNote}
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
                                  {itemName(item)}
                                  {qty > 1 && (
                                    <span className="ml-1.5 rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                      ×{bn ? toBnDigits(qty) : qty}
                                    </span>
                                  )}
                                </span>
                                <span className="shrink-0 font-semibold text-white">
                                  {formatBDT(item.min * qty)}–{formatBDT(item.max * qty)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setQty(slug, 0)}
                                  aria-label={t.removeItem.replace("{item}", itemName(item))}
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
                          asChild={!totals.isEmpty ? false : true}
                          onClick={totals.isEmpty ? undefined : bookWithEstimate}
                          className="w-full rounded-2xl bg-white py-4 text-sm font-bold text-brand-navy shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                        >
                          {totals.isEmpty ? (
                            <a
                              href="#/appointment"
                              onClick={(e) => {
                                e.preventDefault();
                                navigate("/appointment");
                              }}
                              className="inline-flex items-center justify-center gap-2"
                            >
                              <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                              {t.book}
                            </a>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-2">
                              <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                              {t.bookWithEstimate}
                            </span>
                          )}
                        </Button>
                        {!totals.isEmpty && (
                          <>
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 text-xs font-semibold text-white ring-1 ring-white/20 transition-all duration-300 hover:bg-white/15"
                            >
                              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                              {t.print}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelection({})}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold text-blue-200/80 ring-1 ring-white/20 transition-all duration-300 hover:bg-white/10 hover:text-white"
                            >
                              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                              {t.reset}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* assurance card */}
                  <div className="mt-4 rounded-3xl border border-blue-100/80 bg-white p-5">
                    <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-navy">
                      <BadgePercent className="h-4.5 w-4.5 text-brand-blue" aria-hidden="true" />
                      {t.whyRange}
                      <Receipt className="ml-auto h-4 w-4 text-slate-300" aria-hidden="true" />
                    </h3>
                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                      {t.whyRangeText}{" "}
                      <span className="font-semibold text-brand-navy">
                        {t.installments}
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
              {t.assurance.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm ring-1 ring-blue-100">
                    <DynamicIcon name={["Sparkles", "BadgeCheck", "Wallet"][i]} className="h-5.5 w-5.5" />
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
                <strong>{t.disclaimerTitle}</strong> {t.disclaimerText}
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Print-only estimate sheet (visible only when printing) */}
      <div className="print-sheet hidden print:block" aria-hidden="true">
        <div style={{ fontFamily: "Georgia, serif", color: "#002060", padding: "8px 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "3px solid #002060", paddingBottom: 12 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Aristocrat Dental Care &amp; Orthodontic Center</div>
              <div style={{ fontSize: 12, color: "#475569" }}>Uttara, Dhaka, Bangladesh • Hotline 01715-027522</div>
            </div>
            <div style={{ fontSize: 12, color: "#475569", textAlign: "right" }}>
              Treatment Cost Estimate<br />
              {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #cbd5e1", textAlign: "left" }}>
                <th style={{ padding: "8px 6px" }}>Treatment</th>
                <th style={{ padding: "8px 6px", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "8px 6px", textAlign: "right" }}>Unit Range (BDT)</th>
                <th style={{ padding: "8px 6px", textAlign: "right" }}>Line Total (BDT)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(selection)
                .filter(([, qty]) => qty > 0)
                .map(([slug, qty]) => {
                  const item = estimatorItems.find((i) => i.slug === slug);
                  if (!item) return null;
                  return (
                    <tr key={slug} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px 6px" }}>
                        {item.name}
                        <span style={{ color: "#64748b", fontSize: 11 }}> ({item.unit})</span>
                      </td>
                      <td style={{ padding: "8px 6px", textAlign: "center" }}>{qty}</td>
                      <td style={{ padding: "8px 6px", textAlign: "right" }}>{item.min.toLocaleString()} – {item.max.toLocaleString()}</td>
                      <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600 }}>
                        {(item.min * qty).toLocaleString()} – {(item.max * qty).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: "#f0f7ff", borderRadius: 10, padding: "10px 18px", fontSize: 15, fontWeight: 700 }}>
              Estimated Total: BDT {totals.min.toLocaleString()} – {totals.max.toLocaleString()}
            </div>
          </div>
          <p style={{ marginTop: 16, fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
            This estimate reflects typical Dhaka market rates and is provided for planning purposes only — not a binding quote.
            Your personalized written plan with exact pricing is confirmed by our specialists after examination and digital
            diagnostics. Installments available. Book online at aristocratdentalcarebd.com or call 01715-027522
            (Sat–Thu, 10:00 AM – 9:00 PM).
          </p>
        </div>
      </div>

      <CtaBanner
        title={t.ctaTitle}
        description={t.ctaDescription}
      />
    </>
  );
}
