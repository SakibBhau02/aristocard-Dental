"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  MessageSquareQuote,
  PenLine,
  Quote,
  Star,
} from "lucide-react";
import { useLang, toBnDigits } from "@/lib/i18n";
import { getService, services } from "@/lib/data/services";
import { cn } from "@/lib/utils";
import { useRouter } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal, SectionHeading } from "@/components/site/motion";

/* ------------------------------------------------------------------ */
/*  SERVICE REVIEWS — per-treatment slice of the public reviews API    */
/*  (GET /api/reviews?service=<slug>; aggregate stays site-wide).      */
/*  Rendered on service detail pages between the FAQ and the related   */
/*  services sections.                                                 */
/* ------------------------------------------------------------------ */

type PublicReview = {
  id: string;
  name: string;
  rating: number;
  serviceSlug: string | null;
  title: string | null;
  message: string;
  createdAt: string;
};

type ReviewsResponse = {
  reviews: PublicReview[];
  aggregate: { average: number; count: number };
};

const SERVICE_LABELS = new Map(
  services.map((s) => [s.slug, { en: s.shortName, bn: s.shortNameBn }])
);

/* --- read-only star row (gold filled, same language as home) --- */
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

export function ServiceReviews({ serviceSlug }: { serviceSlug: string }) {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.serviceDetail.reviews;

  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await fetch(
        `/api/reviews?service=${encodeURIComponent(serviceSlug)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("failed");
      setData((await res.json()) as ReviewsResponse);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [serviceSlug]);

  useEffect(() => {
    load();
  }, [load]);

  /* localized treatment name for the heading (parent guarantees it exists) */
  const service = getService(serviceSlug);
  const shortName =
    bn && service?.shortNameBn
      ? service.shortNameBn
      : service?.shortName ?? serviceSlug;

  const reviews = useMemo(
    () => (data?.reviews ?? []).slice(0, 6),
    [data]
  );
  const aggregate = data?.aggregate;

  const averageText = aggregate
    ? bn
      ? toBnDigits(aggregate.average.toFixed(1))
      : aggregate.average.toFixed(1)
    : "";
  const fromCountText = aggregate
    ? t.fromCount.replace(
        "{count}",
        bn ? toBnDigits(aggregate.count) : String(aggregate.count)
      )
    : "";

  /* "Write a review" → home page, scrolled to the Patient Reviews block.
     The hash-router page transition unmounts the old page first, so the
     #reviews element may not exist yet at a fixed delay — poll for it. */
  function goWriteReview() {
    navigate("/");
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById("reviews");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (++attempts < 12) {
        window.setTimeout(tryScroll, 150);
      }
    };
    window.setTimeout(tryScroll, 250);
  }

  return (
    <section
      className="py-16 sm:py-20"
      aria-labelledby="service-reviews-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={t.reviewsEyebrow}
          title={t.reviewsTitle.replace("{service}", shortName)}
          description={t.reviewsText}
        />

        {/* site-wide aggregate + write review */}
        <Reveal className="mt-10">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 rounded-2xl bg-ice/70 px-6 py-5 ring-1 ring-blue-100/70 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <span
                className="font-heading text-3xl font-bold tabular-nums text-brand-navy"
                aria-hidden="true"
              >
                {loading ? "–.–" : averageText || "–.–"}
              </span>
              <div>
                <Stars
                  value={aggregate ? Math.round(aggregate.average) : 0}
                  className="h-4.5 w-4.5"
                />
                <p className="mt-1 text-sm text-slate-500">
                  {loading ? "…" : `${t.siteAverage} · ${fromCountText}`}
                </p>
              </div>
            </div>
            <Button
              onClick={goWriteReview}
              className="rounded-full bg-brand-gold px-6 py-3.5 text-sm font-bold text-brand-navy shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-400"
            >
              <PenLine className="h-4 w-4" aria-hidden="true" />
              {t.writeReview}
            </Button>
          </div>
        </Reveal>

        {/* reviews grid */}
        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-blue-100/70"
              >
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-dashed border-blue-200 bg-white/70 py-12 text-center">
            <MessageSquareQuote
              className="mx-auto h-10 w-10 text-blue-300"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm text-slate-500">{t.loadError}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-dashed border-blue-200 bg-white/70 py-12 text-center">
            <Quote className="mx-auto h-10 w-10 text-blue-300" aria-hidden="true" />
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {t.noReviews}
            </p>
            <Button
              onClick={goWriteReview}
              className="mt-5 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-white shadow-lg shadow-navy-900/25 transition-all duration-300 hover:bg-brand-blue"
            >
              <PenLine className="h-4 w-4" aria-hidden="true" />
              {t.beFirst}
            </Button>
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
                className="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-[0_14px_38px_-24px_rgba(0,32,96,0.25)] ring-1 ring-blue-100/80 transition-all duration-500 hover:-translate-y-1 hover:ring-brand-blue/30 hover:shadow-[0_18px_40px_-16px_rgba(30,125,255,0.28)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <Stars value={r.rating} />
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                    <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                    {t.verified}
                  </span>
                </div>

                {r.title && (
                  <p className="font-heading mt-3 text-sm font-bold leading-snug text-brand-navy">
                    {r.title}
                  </p>
                )}
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
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
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-500">
                      {r.serviceSlug && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-brand-blue ring-1 ring-blue-100">
                          {bn
                            ? SERVICE_LABELS.get(r.serviceSlug)?.bn ??
                              SERVICE_LABELS.get(r.serviceSlug)?.en
                            : SERVICE_LABELS.get(r.serviceSlug)?.en}
                        </span>
                      )}
                      <time
                        dateTime={r.createdAt}
                        className="shrink-0"
                      >
                        {new Date(r.createdAt).toLocaleDateString(bn ? "bn-BD" : "en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </p>
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
