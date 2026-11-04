"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Quote, Sparkles, Star } from "lucide-react";
import { useLang, toBnDigits } from "@/lib/i18n";
import { useBundle } from "@/components/site/content-provider";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading } from "@/components/site/motion";

/* ------------------------------------------------------------------ */
/*  PATIENT REVIEWS — the single review block for the whole site        */
/*                                                                     */
/*  Reviews and patient "stories" are the same thing now: one approved  */
/*  review per patient, carrying the treatment they received. They are  */
/*  written and published from Admin → Reviews — visitors cannot submit */
/*  anything from the website.                                         */
/*                                                                     */
/*  Data comes from the content bundle (server-rendered), so the cards  */
/*  are in the HTML for search engines and there is no loading state.   */
/* ------------------------------------------------------------------ */

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label={`${value} / 5`}
      className={cn("flex items-center gap-0.5", className)}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            "h-4 w-4",
            i < value ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
          )}
        />
      ))}
    </span>
  );
}

export function PatientReviews({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  description?: string;
  className?: string;
}) {
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.reviews;
  const { reviews } = useBundle();

  const aggregate = useMemo(() => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
  }, [reviews]);

  const averageText = aggregate
    ? bn
      ? toBnDigits(aggregate.average.toFixed(1))
      : aggregate.average.toFixed(1)
    : "—";

  const summaryText = aggregate
    ? t.summary.replace(
        "{count}",
        bn ? toBnDigits(aggregate.count) : String(aggregate.count)
      )
    : "";

  return (
    <section
      id="reviews"
      className={cn("section-wash relative scroll-mt-24 py-20 sm:py-24", className)}
      aria-labelledby="patient-reviews-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={eyebrow ?? t.eyebrow}
          title={title ?? (
            <>
              {t.titleA}
              <span className="gradient-text">{t.titleB}</span>
            </>
          )}
          description={description ?? t.description}
        />

        {/* aggregate summary */}
        {aggregate ? (
          <Reveal className="mt-10">
            <div className="mx-auto flex max-w-md items-center justify-center gap-5 rounded-3xl border border-blue-100/70 bg-white px-7 py-5 shadow-[0_18px_44px_-24px_rgba(0,32,96,0.22)]">
              <span className="font-heading text-4xl font-bold tabular-nums text-brand-navy">
                {averageText}
              </span>
              <div>
                <Stars value={Math.round(aggregate.average)} className="h-5 w-5" />
                <p className="mt-1 text-sm text-slate-500">{summaryText}</p>
              </div>
            </div>
          </Reveal>
        ) : null}

        {/* review cards */}
        {reviews.length === 0 ? (
          <div className="mx-auto mt-10 max-w-md rounded-3xl border border-dashed border-blue-200 bg-white/60 py-14 text-center">
            <Quote className="mx-auto h-10 w-10 text-blue-300" aria-hidden="true" />
            <p className="font-heading mt-4 text-lg font-bold text-brand-navy">
              {t.emptyTitle}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{t.emptyText}</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <motion.article
                key={r.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="card-shine group flex h-full flex-col rounded-2xl border border-blue-100/70 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_18px_40px_-16px_rgba(30,125,255,0.3)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <Stars value={r.rating} />
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                    <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                    {t.verified}
                  </span>
                </div>

                {/* the treatment they received — the "story" line */}
                {r.treatment ? (
                  <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-brand-blue ring-1 ring-blue-100">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {r.treatment}
                  </span>
                ) : null}

                {r.title ? (
                  <p className="font-heading mt-3 text-sm font-bold leading-snug text-brand-navy">
                    {r.title}
                  </p>
                ) : null}
                <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-slate-600">
                  {r.message}
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-blue-50 pt-4">
                  <span
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-brand-blue ring-1 ring-blue-100"
                    aria-hidden="true"
                  >
                    {r.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-brand-navy">
                      {r.name}
                    </p>
                    <time
                      dateTime={r.createdAt}
                      className="mt-0.5 block text-[11px] text-slate-500"
                    >
                      {new Date(r.createdAt).toLocaleDateString(bn ? "bn-BD" : "en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
