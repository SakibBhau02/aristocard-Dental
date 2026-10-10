"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Loader2,
  MessageSquareQuote,
  PenLine,
  Quote,
  Star,
} from "lucide-react";
import { useLang, toBnDigits } from "@/lib/i18n";
import { services } from "@/lib/data/services";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Reveal, SectionHeading } from "@/components/site/motion";

/* ------------------------------------------------------------------ */
/*  PATIENT REVIEWS — live block of approved DB reviews + submission    */
/*  dialog (moderated) — shown on the home page below testimonials      */
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

/* --- read-only star row (gold filled) --- */
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

export function PatientReviews() {
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.reviews;
  const { toast } = useToast();

  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      setData((await res.json()) as ReviewsResponse);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* --- dialog state --- */
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    rating: 0,
    service: "none",
    title: "",
    message: "",
  });

  function resetForm() {
    setSubmitted(false);
    setForm({ name: "", phone: "", rating: 0, service: "none", title: "", message: "" });
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      /* give the close animation a beat before resetting */
      window.setTimeout(resetForm, 250);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    /* client-side validation (server re-validates everything) */
    const name = form.name.trim();
    const message = form.message.trim();
    const phone = form.phone.replace(/[-\s]/g, "");
    if (form.rating < 1 || form.rating > 5) {
      toast({ title: t.errRating, variant: "destructive" });
      return;
    }
    if (name.length < 2 || name.length > 60) {
      toast({ title: t.errName, variant: "destructive" });
      return;
    }
    if (message.length < 10 || message.length > 600) {
      toast({ title: t.errMessage, variant: "destructive" });
      return;
    }
    if (phone && !/^01[3-9]\d{8}$/.test(phone)) {
      toast({ title: t.errPhone, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          rating: form.rating,
          serviceSlug: form.service !== "none" ? form.service : undefined,
          title: form.title.trim() || undefined,
          message,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "failed");
      setSubmitted(true);
      toast({ title: t.toastTitle, description: t.toastDesc });
    } catch (err) {
      toast({
        title: t.errSubmit,
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const reviews = data?.reviews ?? [];
  const aggregate = data?.aggregate;
  const averageText = useMemo(() => {
    if (!aggregate) return "";
    return bn ? toBnDigits(aggregate.average.toFixed(1)) : aggregate.average.toFixed(1);
  }, [aggregate, bn]);
  const summaryText = useMemo(() => {
    if (!aggregate) return "";
    return t.summary.replace(
      "{count}",
      bn ? toBnDigits(aggregate.count) : String(aggregate.count)
    );
  }, [aggregate, bn, t.summary]);

  const charCount = t.charCount.replace(
    "{count}",
    bn ? toBnDigits(form.message.length) : String(form.message.length)
  );

  return (
    <section
      id="reviews"
      className="section-wash relative scroll-mt-24 py-20 sm:py-24"
      aria-labelledby="patient-reviews-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={
            <>
              {t.titleA}
              <span className="gradient-text">{t.titleB}</span>
            </>
          }
          description={t.description}
        />

        {/* aggregate summary + write review */}
        <Reveal className="mt-10">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-3xl border border-blue-100/70 bg-white p-6 shadow-[0_18px_44px_-24px_rgba(0,32,96,0.22)] sm:flex-row sm:justify-between sm:p-7">
            <div className="flex items-center gap-4">
              <span
                className="font-heading text-4xl font-bold tabular-nums text-brand-navy"
                aria-hidden="true"
              >
                {loading ? "–.–" : averageText}
              </span>
              <div>
                <Stars value={aggregate ? Math.round(aggregate.average) : 0} className="h-5 w-5" />
                <p className="mt-1 text-sm text-slate-500">
                  {loading ? "…" : summaryText}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setOpen(true)}
              className="rounded-full bg-brand-gold px-7 py-4 text-sm font-bold text-brand-navy shadow-lg shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-400"
            >
              <PenLine className="h-4.5 w-4.5" aria-hidden="true" />
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
                className="space-y-4 rounded-2xl border border-blue-100/70 bg-white p-6"
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
          <div className="mx-auto mt-10 max-w-md rounded-3xl border border-dashed border-blue-200 bg-white/60 py-14 text-center">
            <MessageSquareQuote
              className="mx-auto h-10 w-10 text-blue-300"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm text-slate-500">{t.loadError}</p>
          </div>
        ) : reviews.length === 0 ? (
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

        <Reveal className="mt-8">
          <p className="mx-auto max-w-xl text-center text-xs leading-relaxed text-slate-400">
            <BadgeCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            {t.pendingNote}
          </p>
        </Reveal>
      </div>

      {/* ============ WRITE A REVIEW DIALOG ============ */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[88vh] overflow-y-auto rounded-3xl border-blue-100 bg-white p-6 sm:max-w-lg sm:p-8">
          {submitted ? (
            <div className="py-6 text-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100"
              >
                <BadgeCheck className="h-8 w-8" aria-hidden="true" />
              </motion.span>
              <h2 className="font-heading mt-5 text-2xl font-bold text-brand-navy">
                {t.successTitle}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                {t.successText}
              </p>
              <Button
                onClick={() => onOpenChange(false)}
                className="mt-6 rounded-full bg-brand-navy px-8 text-sm font-bold text-white shadow-lg shadow-navy-900/25 hover:bg-brand-blue"
              >
                {t.successDone}
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                  <MessageSquareQuote className="h-6 w-6" aria-hidden="true" />
                </span>
                <DialogTitle className="font-heading text-xl font-bold text-brand-navy">
                  {t.dialogTitle}
                </DialogTitle>
                <DialogDescription className="leading-relaxed">
                  {t.dialogDescription}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="mt-2 space-y-5" noValidate>
                {/* rating */}
                <div className="space-y-2">
                  <span id="review-rating-label" className="block text-sm font-semibold text-brand-navy">
                    {t.ratingLabel} <span className="text-rose-500">*</span>
                  </span>
                  <div
                    role="radiogroup"
                    aria-labelledby="review-rating-label"
                    onKeyDown={(e) => {
                      const k = e.key;
                      let next: number | null = null;
                      if (k === "ArrowRight" || k === "ArrowUp")
                        next = Math.min(5, form.rating + 1);
                      else if (k === "ArrowLeft" || k === "ArrowDown")
                        next = Math.max(1, form.rating - 1);
                      else if (/^[1-5]$/.test(k)) next = Number(k);
                      if (next !== null) {
                        e.preventDefault();
                        setForm((f) => ({ ...f, rating: next as number }));
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      const active = value <= form.rating;
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={form.rating === value}
                          aria-label={t.ratingStarsAria.replace("{count}", String(value))}
                          onClick={() => setForm((f) => ({ ...f, rating: value }))}
                          className="rounded-xl p-1.5 transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
                        >
                          <Star
                            aria-hidden="true"
                            className={cn(
                              "h-7 w-7 transition-colors duration-200",
                              active
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-100 text-slate-300"
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="review-name" className="text-sm font-semibold text-brand-navy">
                      {t.nameLabel} <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="review-name"
                      name="name"
                      autoComplete="name"
                      maxLength={60}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t.namePlaceholder}
                      className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-phone" className="text-sm font-semibold text-brand-navy">
                      {t.phoneLabel}
                    </Label>
                    <Input
                      id="review-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder={t.phonePlaceholder}
                      className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                    />
                    <p className="text-[11px] leading-relaxed text-slate-400">{t.phoneHint}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-service" className="text-sm font-semibold text-brand-navy">
                    {t.serviceLabel}
                  </Label>
                  <Select
                    value={form.service}
                    onValueChange={(v) => setForm((f) => ({ ...f, service: v }))}
                  >
                    <SelectTrigger
                      id="review-service"
                      aria-label={t.serviceLabel}
                      className="h-11 w-full rounded-xl border-blue-100 bg-ice/50 text-sm text-brand-navy shadow-none focus-visible:ring-brand-blue"
                    >
                      <SelectValue placeholder={t.servicePlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-blue-100">
                      <SelectItem value="none">{t.serviceNone}</SelectItem>
                      {services.map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                          {bn && s.shortNameBn ? s.shortNameBn : s.shortName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-title" className="text-sm font-semibold text-brand-navy">
                    {t.titleLabel}
                  </Label>
                  <Input
                    id="review-title"
                    name="title"
                    maxLength={80}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder={t.titlePlaceholder}
                    className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-message" className="text-sm font-semibold text-brand-navy">
                    {t.messageLabel} <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="review-message"
                    name="message"
                    rows={4}
                    maxLength={600}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t.messagePlaceholder}
                    className="resize-none rounded-xl border-blue-100 bg-ice/50 text-sm leading-relaxed focus-visible:ring-brand-blue"
                  />
                  <p className="text-right text-[11px] font-medium tabular-nums text-slate-400">
                    {charCount}
                  </p>
                </div>

                <DialogFooter className="mt-2 gap-2 sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="rounded-full border-blue-200 px-6 font-semibold text-slate-600 hover:bg-blue-50 hover:text-brand-navy"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-brand-blue px-7 font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:bg-brand-navy disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        {t.submitting}
                      </>
                    ) : (
                      <>
                        <PenLine className="h-4 w-4" aria-hidden="true" />
                        {t.submit}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
