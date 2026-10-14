"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock3,
  Phone,
  RotateCcw,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { useBundle } from "@/components/site/content-provider";
import type { Dictionary } from "@/lib/data/dictionary";
import { PageHeader } from "@/components/site/shared";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/site/motion";
import { DynamicIcon, categoryColors } from "@/components/site/icon-map";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  SMILE ASSESSMENT QUIZ — 5 questions → a personal treatment plan    */
/*  (fully client-side: no API, no database — answers stay on device)  */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 5;

/** Semantic option values per question (labels live in the dictionary). */
const OPTION_VALUES: string[][] = [
  ["whiter", "straighter", "missing", "pain", "checkup"], // Q1 goal
  ["love", "okay", "hide"], // Q2 smile satisfaction
  ["sensitivity", "ache", "gums", "breath", "none"], // Q3 current issues
  ["recent", "some", "years", "unsure"], // Q4 last dental visit
  ["asap", "month", "browsing"], // Q5 timeline
];

type ReasonKey = keyof Dictionary["assessmentPage"]["reasons"];

type Rec = {
  /** real service slug, or a special (non-service) card id */
  slug: string;
  reason: ReasonKey;
};

/* Q1 (goal) → base recommendations */
const GOAL_RECS: Record<string, Rec[]> = {
  whiter: [
    { slug: "teeth-whitening", reason: "brightening" },
    { slug: "porcelain-veneers", reason: "brightening" },
  ],
  straighter: [
    { slug: "invisalign-clear-aligners", reason: "straightening" },
    { slug: "traditional-braces-orthodontics", reason: "straightening" },
  ],
  missing: [
    { slug: "dental-implants", reason: "replacing" },
    { slug: "crowns-bridges", reason: "replacing" },
  ],
  pain: [
    { slug: "root-canal-treatment", reason: "painRelief" },
    { slug: "laser-assisted-fillings", reason: "restoring" },
  ],
  checkup: [
    { slug: "laser-assisted-fillings", reason: "restoring" },
    { slug: "checkup", reason: "checkup" },
  ],
};

/** Deterministic mapping: answers → deduped top-3 recommendations.
 *  Symptom-driven picks (Q3) are prepended first (clinical priority),
 *  then the confidence pick (Q2), then the Q1 goal baseline. */
function buildRecs(answers: readonly (string | null)[]): Rec[] {
  const base = GOAL_RECS[answers[0] ?? "checkup"] ?? GOAL_RECS.checkup;

  const pre: Rec[] = [];
  if (answers[1] === "hide") pre.push({ slug: "porcelain-veneers", reason: "confidence" });
  switch (answers[2]) {
    case "sensitivity":
      pre.unshift({ slug: "laser-assisted-fillings", reason: "restoring" });
      break;
    case "ache":
      pre.unshift({ slug: "root-canal-treatment", reason: "painRelief" });
      break;
    case "gums":
    case "breath":
      pre.unshift({ slug: "periodontal-gum-treatment", reason: "gumCare" });
      break;
  }

  const seen = new Set<string>();
  return [...pre, ...base]
    .filter((r) => (seen.has(r.slug) ? false : (seen.add(r.slug), true)))
    .slice(0, 3);
}

/* Special (non-service) result cards — link to booking with a note */
type SpecialDef = {
  icon: LucideIcon;
  note: string;
  titleKey: "whiteningCardTitle" | "checkupCardTitle";
  textKey: "whiteningCardText" | "checkupCardText";
};

const SPECIALS: Record<string, SpecialDef> = {
  "teeth-whitening": {
    icon: Sparkles,
    note: "Teeth whitening consultation",
    titleKey: "whiteningCardTitle",
    textKey: "whiteningCardText",
  },
  checkup: {
    icon: Stethoscope,
    note: "General checkup and cleaning",
    titleKey: "checkupCardTitle",
    textKey: "checkupCardText",
  },
};

const ASSESSMENT_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Smile Assessment — Find the Right Treatment in 60 Seconds",
  description:
    "60-second smile assessment quiz: answer five quick questions and get a personalized treatment direction from the specialists at Aristocrat Dental Care, Uttara Dhaka.",
  url: "https://aristocratdentalcarebd.com/assessment",
};

/* Direction-aware slide variants for the one-at-a-time question card */
const questionVariants = {
  enter: (d: number) => ({ x: 44 * d, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: -44 * d, opacity: 0 }),
};

export function AssessmentPage() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const { settings } = useBundle();
  const bn = lang === "bn";
  const t = d.assessmentPage;
  const num = (v: string | number) => (bn ? toBnDigits(v) : String(v));

  const [phase, setPhase] = useState<"quiz" | "results">("quiz");
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<(string | null)[]>(() =>
    Array(TOTAL_STEPS).fill(null)
  );
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  /* release the auto-advance timer when leaving the page */
  useEffect(() => clearTimer, []);

  /* results replace the quiz — bring the user back to the top */
  useEffect(() => {
    if (phase === "results") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [phase]);

  usePageMeta({
    title: t.metaTitle,
    description: t.metaDescription,
    jsonLd: ASSESSMENT_JSONLD,
  });

  const restart = () => {
    clearTimer();
    setDir(-1);
    setStep(0);
    setAnswers(Array(TOTAL_STEPS).fill(null));
    setPhase("quiz");
  };

  const go = (delta: 1 | -1) => {
    clearTimer();
    setDir(delta);
    setStep((s) => Math.min(TOTAL_STEPS - 1, Math.max(0, s + delta)));
  };

  const jumpTo = (i: number) => {
    if (i === step) return;
    clearTimer();
    setDir(i < step ? -1 : 1);
    setStep(i);
  };

  /* select an option → show the selected state briefly, then advance */
  const pick = (value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = value;
      return next;
    });
    clearTimer();
    timerRef.current = window.setTimeout(
      () => {
        if (step < TOTAL_STEPS - 1) go(1);
        else {
          clearTimer();
          setPhase("results");
        }
      },
      260
    );
  };

  const recs = useMemo(
    () => (phase === "results" ? buildRecs(answers) : []),
    [phase, answers]
  );

  const urgent =
    answers[2] === "ache" || answers[3] === "years" || answers[3] === "unsure";

  const progress = phase === "results" ? 100 : Math.round(((step + 1) / TOTAL_STEPS) * 100);
  const stepOfText = t.stepOf
    .replace("{n}", num(step + 1))
    .replace("{total}", num(TOTAL_STEPS));
  const showRestart = step > 0 || answers.some((a) => a !== null);

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[{ label: d.chrome.nav.home, to: "/" }, { label: t.breadcrumb }]}
      />

      <AnimatePresence mode="wait">
        {phase === "quiz" ? (
          <motion.section
            key="quiz"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="py-12 sm:py-16"
            aria-label="Smile assessment quiz"
          >
            <div className="mx-auto max-w-2xl px-4 sm:px-6">
              <div className="card-shine rounded-[2rem] border border-blue-100/80 bg-white p-6 shadow-[0_18px_50px_-26px_rgba(0,32,96,0.3)] sm:p-8">
                {/* progress row */}
                <div className="flex items-center justify-between gap-3">
                  <p
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue"
                    aria-live="polite"
                  >
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {stepOfText}
                  </p>
                  {showRestart && (
                    <button
                      type="button"
                      onClick={restart}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-brand-blue"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      {t.restart}
                    </button>
                  )}
                </div>

                {/* progress bar */}
                <div
                  className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-blue-50"
                  aria-hidden="true"
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-gold"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>

                {/* numbered step indicator */}
                <ol className="mt-5 flex items-center justify-center gap-2">
                  {Array.from({ length: TOTAL_STEPS }, (_, i) => {
                    const current = i === step;
                    const answered = answers[i] !== null;
                    const reachable = current || answered || i <= step;
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => (reachable ? jumpTo(i) : undefined)}
                          disabled={!reachable}
                          aria-current={current ? "step" : undefined}
                          aria-label={t.stepOf
                            .replace("{n}", num(i + 1))
                            .replace("{total}", num(TOTAL_STEPS))}
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-all duration-300",
                            current
                              ? "scale-110 bg-brand-navy text-white shadow-lg shadow-navy-900/25"
                              : answered
                                ? "bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/25 hover:bg-brand-blue/20"
                                : "bg-blue-50/60 text-slate-400 ring-1 ring-blue-100/60"
                          )}
                        >
                          {answered && !current ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            num(i + 1)
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>

                {/* one question at a time */}
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={questionVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h2 className="font-heading mt-7 text-center text-xl font-bold leading-snug text-brand-navy text-balance sm:text-2xl">
                      {t.questions[step].question}
                    </h2>

                    <div
                      role="radiogroup"
                      aria-label={t.questions[step].question}
                      className="mt-6 space-y-3"
                    >
                      {t.questions[step].options.map((label, oi) => {
                        const value = OPTION_VALUES[step][oi];
                        const selected = answers[step] === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => pick(value)}
                            className={cn(
                              "flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] font-semibold transition-all duration-300 sm:px-5",
                              selected
                                ? "border-brand-blue bg-brand-blue text-white shadow-lg shadow-blue-500/30"
                                : "border-blue-100/80 bg-white text-brand-navy hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-[0_12px_28px_-14px_rgba(30,125,255,0.45)]"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-300",
                                selected
                                  ? "bg-white/20 text-white"
                                  : "bg-blue-50 text-brand-blue ring-1 ring-blue-100"
                              )}
                              aria-hidden="true"
                            >
                              {selected ? <Check className="h-3.5 w-3.5" /> : num(oi + 1)}
                            </span>
                            <span className="flex-1">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* back */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    disabled={step === 0}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-brand-navy ring-1 ring-blue-100 transition-all duration-300 hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-0"
                  >
                    <ArrowLeft className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                    {t.backLabel}
                  </button>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-slate-400">{t.privacyNote}</p>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="py-12 sm:py-16"
            aria-label="Your smile plan results"
          >
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              {/* results header */}
              <Reveal>
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-blue ring-1 ring-blue-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" aria-hidden="true" />
                      {t.resultsEyebrow}
                    </span>
                    <h2 className="font-heading mt-4 text-3xl font-bold leading-tight text-brand-navy text-balance sm:text-4xl">
                      {t.resultsTitle}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                      {t.resultsIntro}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={restart}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-brand-navy ring-1 ring-blue-100 transition-all duration-300 hover:bg-blue-50"
                  >
                    <RotateCcw className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                    {t.retake}
                  </button>
                </div>
              </Reveal>

              {/* recommended treatments */}
              <p className="mt-9 text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">
                {t.recommendedLabel}
              </p>
              <StaggerContainer className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recs.map((rec, i) => (
                  <StaggerItem key={rec.slug} className="h-full">
                    <RecommendationCard rec={rec} index={i} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <Reveal className="mt-5">
                <p className="text-center text-xs leading-relaxed text-slate-400">
                  {t.planNote}
                </p>
              </Reveal>

              {/* urgency notice (pain now, or a long gap since the last visit) */}
              {urgent && (
                <Reveal className="mt-8">
                  <div className="flex flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50/80 p-6 sm:flex-row sm:items-center">
                    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 ring-1 ring-amber-200">
                      <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-base font-bold text-amber-900">
                        {t.urgencyTitle}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-amber-800">
                        {t.urgencyText}
                      </p>
                    </div>
                    <a
                      href={`tel:${settings.phoneRaw}`}
                      className="btn-shine inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-navy shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      {t.urgencyAction.replace(
                        "{phone}",
                        bn ? toBnDigits(settings.phone) : settings.phone
                      )}
                    </a>
                  </div>
                </Reveal>
              )}

              {/* what happens at your visit */}
              <Reveal className="mt-10">
                <div className="rounded-[2rem] border border-blue-100 bg-ice p-6 sm:p-8">
                  <h3 className="font-heading flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-brand-navy">
                    <span className="h-px w-8 bg-brand-blue/40" aria-hidden="true" />
                    {t.nextStepsTitle}
                  </h3>
                  <div className="mt-5 grid gap-6 sm:grid-cols-3">
                    {t.nextSteps.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm ring-1 ring-blue-100">
                          <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
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
                </div>
              </Reveal>

              {/* CTA */}
              <Reveal className="mt-10">
                <div className="hero-mesh-dark noise relative overflow-hidden rounded-[2.5rem] px-6 py-12 text-center shadow-2xl shadow-navy-900/30 sm:px-12">
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
                    <h3 className="font-heading mx-auto max-w-2xl text-3xl font-bold leading-tight text-white text-balance sm:text-4xl">
                      {t.ctaTitle}
                    </h3>
                    <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-100/85">
                      {t.ctaDescription}
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <Button
                        type="button"
                        onClick={() => navigate("/appointment")}
                        className="btn-shine rounded-full bg-brand-gold px-8 py-4 text-base font-bold text-brand-navy shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                      >
                        <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                        {t.ctaButton}
                      </Button>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  One recommendation card — real service or a special booking card   */
/* ------------------------------------------------------------------ */

function RecommendationCard({ rec, index }: { rec: Rec; index: number }) {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.assessmentPage;
  const { services, settings } = useBundle();

  const service = services.find((s) => s.slug === rec.slug);
  const special = SPECIALS[rec.slug];
  if (!service && !special) return null;

  const badge = bn ? toBnDigits(`0${index + 1}`) : `0${index + 1}`;

  /* --- special card (not a service detail page — books a visit) --- */
  if (!service) {
    const Icon = special!.icon;
    return (
      <article className="card-shine group relative flex h-full flex-col rounded-3xl border border-amber-200/80 bg-white p-6 shadow-[0_10px_30px_-14px_rgba(0,32,96,0.16)] transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-gold/60 hover:shadow-[0_24px_50px_-16px_rgba(245,158,11,0.35)]">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
            <Icon className="h-7 w-7" aria-hidden="true" />
          </span>
          <span className="font-heading text-xs font-bold text-amber-300" aria-hidden="true">
            {badge}
          </span>
        </div>

        <h4 className="font-heading mt-5 text-lg font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue">
          {t[special!.titleKey]}
        </h4>
        <p className="mt-1 text-[13px] font-semibold text-brand-blue">
          {t.reasons[rec.reason]}
        </p>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
          {t[special!.textKey]}
        </p>

        <div className="mt-5 border-t border-amber-50 pt-4">
          <button
            type="button"
            onClick={() =>
              navigate(`/appointment?note=${encodeURIComponent(special!.note)}`)
            }
            className="btn-shine inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 text-sm font-bold text-brand-navy shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            {t.specialCta}
          </button>
        </div>
      </article>
    );
  }

  /* --- service card --- */
  const colors = categoryColors[service.category] ?? categoryColors.Restorative;
  const name = bn && service.nameBn ? service.nameBn : service.name;

  return (
    <article className="card-shine card-accent-top group relative flex h-full flex-col rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_10px_30px_-14px_rgba(0,32,96,0.16)] transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-blue/30 hover:shadow-[0_24px_50px_-16px_rgba(30,125,255,0.3)]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bg} ${colors.text} ring-1 ${colors.ring} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
        >
          <DynamicIcon name={service.icon} className="h-7 w-7" />
        </span>
        <span className="font-heading text-xs font-bold text-slate-200" aria-hidden="true">
          {badge}
        </span>
      </div>

      <h4 className="font-heading mt-5 text-lg font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue">
        {name}
      </h4>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
        {t.reasons[rec.reason]}
      </p>

      <div className="mt-5 border-t border-blue-50 pt-4">
        <a
          href={`/services/${service.slug}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/services/${service.slug}`);
          }}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue transition-all duration-300 hover:gap-2.5"
          aria-label={`${t.viewService}: ${name}`}
        >
          {t.viewService}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
