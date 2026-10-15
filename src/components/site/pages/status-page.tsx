"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  BadgeCheck,
  CalendarClock,
  CalendarX2,
  CheckCircle2,
  Clock,
  Hash,
  Info,
  Loader2,
  Phone,
  RefreshCw,
  Search,
  Stethoscope,
  UserRound,
  XCircle,
} from "lucide-react";
import { usePageMeta } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { useBundle } from "@/components/site/content-provider";
import { PageHeader } from "@/components/site/shared";
import { Reveal } from "@/components/site/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/data/dictionary";

/* ------------------------------------------------------------------ */
/*  APPOINTMENT STATUS — lookup by reference code or phone (EN / বাংলা) */
/* ------------------------------------------------------------------ */

type AppointmentRecord = {
  refCode: string;
  name: string;
  date: string;
  time: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  serviceSlug: string | null;
  doctorSlug: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const statusStyles: Record<
  AppointmentRecord["status"],
  { badge: string; dot: string; icon: typeof Clock }
> = {
  PENDING: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  CONFIRMED: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    icon: BadgeCheck,
  },
  COMPLETED: {
    badge: "bg-blue-50 text-brand-blue ring-blue-200",
    dot: "bg-brand-blue",
    icon: CheckCircle2,
  },
  CANCELLED: {
    badge: "bg-rose-50 text-rose-600 ring-rose-200",
    dot: "bg-rose-400",
    icon: XCircle,
  },
};

function formatDateLabel(iso: string, lang: Lang): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString(
    lang === "bn" ? "bn-BD" : "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatShortDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StatusPage() {
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.statusPage;
  const { services, doctors, settings } = useBundle();

  usePageMeta({
    title: "Check Your Appointment Status",
    description:
      "Look up your Aristocrat Dental Care appointment by reference code or phone number — see confirmation status, reschedule or cancel in seconds.",
  });

  const { toast } = useToast();
  const [mode, setMode] = useState<"ref" | "phone">("ref");
  const [refCode, setRefCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<AppointmentRecord[] | null>(null);

  /* Cancel flow state */
  const [cancelTarget, setCancelTarget] = useState<AppointmentRecord | null>(null);
  const [cancelPhone, setCancelPhone] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const lookup = async (e?: FormEvent) => {
    e?.preventDefault();
    setError("");
    setResults(null);
    setLoading(true);
    try {
      const params =
        mode === "ref"
          ? `ref=${encodeURIComponent(refCode.trim())}`
          : `phone=${encodeURIComponent(phone.replace(/[-\s]/g, ""))}`;
      const res = await fetch(`/api/appointments?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.lookupFailed);
      } else {
        setResults(data.appointments as AppointmentRecord[]);
        if ((data.appointments as AppointmentRecord[]).length === 0) {
          setError(mode === "phone" ? t.notFoundPhone : t.notFoundRef);
        }
      }
    } catch {
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  const performCancel = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refCode: cancelTarget.refCode, phone: cancelPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: t.toastCancelFail,
          description: data.error ?? t.toastCancelFailDesc,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: t.toastCancelled,
        description: t.toastCancelledDesc,
      });
      setCancelTarget(null);
      setCancelPhone("");
      /* refresh results */
      setResults((prev) =>
        prev
          ? prev.map((a) => (a.refCode === cancelTarget.refCode ? { ...a, status: "CANCELLED" as const } : a))
          : prev
      );
    } catch {
      toast({
        title: t.toastNetwork,
        description: t.toastNetworkDesc,
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[
          { label: d.chrome.nav.home, to: "/" },
          { label: t.breadcrumb },
        ]}
      />

      <section className="hero-mesh relative overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-18">
          {/* Lookup card */}
          <Reveal>
            <div className="rounded-[2rem] border border-blue-100/80 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(0,32,96,0.25)] sm:p-8">
              {/* Mode toggle */}
              <div
                className="relative mx-auto flex w-full max-w-md rounded-2xl bg-ice p-1.5"
                role="tablist"
                aria-label="Lookup method"
              >
                {(["ref", "phone"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => {
                      setMode(m);
                      setError("");
                      setResults(null);
                    }}
                    className={cn(
                      "relative flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-300",
                      mode === m ? "text-white" : "text-brand-navy/70 hover:text-brand-navy"
                    )}
                  >
                    {mode === m && (
                      <motion.span
                        layoutId="lookup-mode-pill"
                        className="absolute inset-0 rounded-xl bg-brand-navy shadow-lg shadow-navy-900/25"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative inline-flex items-center justify-center gap-2">
                      {m === "ref" ? (
                        <Hash className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Phone className="h-4 w-4" aria-hidden="true" />
                      )}
                      {m === "ref" ? t.modeRef : t.modePhone}
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={lookup} className="mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {mode === "ref" ? (
                      <div className="space-y-2">
                        <Label htmlFor="ref-input" className="text-sm font-semibold text-brand-navy">
                          {t.refLabel} <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <Hash
                            className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                          />
                          <Input
                            id="ref-input"
                            value={refCode}
                            onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                            placeholder="ADC-XXXXXXXX"
                            autoComplete="off"
                            maxLength={14}
                            className="h-13 rounded-2xl border-blue-100 bg-ice/60 pl-11 font-mono text-base font-semibold tracking-wider text-brand-navy placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-brand-blue focus:bg-white"
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          {t.refHintA}
                          <span className="font-mono font-semibold text-brand-blue">ADC-</span>
                          {t.refHintB}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="phone-input" className="text-sm font-semibold text-brand-navy">
                          {t.phoneLabel} <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone
                            className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                          />
                          <Input
                            id="phone-input"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 11))}
                            inputMode="numeric"
                            placeholder="01XXXXXXXXX"
                            autoComplete="tel"
                            className="h-13 rounded-2xl border-blue-100 bg-ice/60 pl-11 text-base font-semibold text-brand-navy placeholder:font-normal placeholder:text-slate-400 focus:border-brand-blue focus:bg-white"
                          />
                        </div>
                        <p className="text-xs text-slate-500">{t.phoneHint}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={
                    loading ||
                    (mode === "ref" ? refCode.trim().length < 6 : phone.length !== 11)
                  }
                  className="mt-6 h-13 w-full rounded-2xl bg-brand-blue text-base font-bold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy hover:shadow-xl disabled:translate-y-0 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      {t.searching}
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" aria-hidden="true" />
                      {t.find}
                    </>
                  )}
                </Button>
              </form>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-sm text-rose-700"
                    role="alert"
                  >
                    <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

          {/* Results */}
          <AnimatePresence>
            {results && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 space-y-5"
                aria-live="polite"
              >
                <h2 className="font-heading text-xl font-bold text-brand-navy">
                  {results.length === 1
                    ? t.yourAppointment
                    : t.yourAppointments.replace("{count}", bn ? toBnDigits(results.length) : String(results.length))}
                </h2>
                {results.map((appt, i) => {
                  const style = statusStyles[appt.status] ?? statusStyles.PENDING;
                  const label = t.status[appt.status]?.label ?? appt.status;
                  const blurb = t.status[appt.status]?.blurb ?? "";
                  const StatusIcon = style.icon;
                  const service = services.find((s) => s.slug === appt.serviceSlug);
                  const doctor = doctors.find((doc) => doc.slug === appt.doctorSlug);
                  const cancellable = appt.status === "PENDING" || appt.status === "CONFIRMED";
                  const isPast = new Date(`${appt.date}T23:59:59`) < new Date();

                  return (
                    <Reveal key={appt.refCode} delay={i * 0.06}>
                      <article className="card-shine relative overflow-hidden rounded-[1.75rem] border border-blue-100/80 bg-white shadow-[0_10px_40px_-16px_rgba(0,32,96,0.18)]">
                        {/* status ribbon */}
                        <div
                          className={cn(
                            "flex flex-wrap items-center justify-between gap-3 border-b border-blue-50/80 px-6 py-4 sm:px-8",
                            appt.status === "CANCELLED" ? "bg-rose-50/50" : "bg-ice/60"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "relative inline-flex h-3 w-3 rounded-full",
                                style.dot,
                                appt.status === "PENDING" && "animate-pulse"
                              )}
                              aria-hidden="true"
                            />
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ring-1",
                                style.badge
                              )}
                            >
                              <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                              {label}
                            </span>
                          </div>
                          <span className="font-mono text-sm font-bold tracking-wider text-brand-navy/70">
                            {appt.refCode}
                          </span>
                        </div>

                        <div className="grid gap-5 p-6 sm:grid-cols-[1.4fr_1fr] sm:p-8">
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/15">
                                <CalendarClock className="h-6 w-6" aria-hidden="true" />
                              </span>
                              <div>
                                <p className="font-heading text-lg font-bold leading-snug text-brand-navy">
                                  {formatDateLabel(appt.date, lang)}
                                </p>
                                <p className="mt-0.5 text-sm font-semibold text-brand-blue">
                                  {isPast ? t.wasScheduledAt : t.scheduledAt} {appt.time}
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{blurb}</p>
                              </div>
                            </div>

                            {appt.notes && (
                              <div className="flex items-start gap-2.5 rounded-2xl bg-ice/70 px-4 py-3 text-xs leading-relaxed text-brand-navy/80 ring-1 ring-blue-100/60">
                                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                                <span>
                                  <span className="font-semibold">{t.yourNote}</span> {appt.notes}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 rounded-2xl bg-ice/50 p-5 ring-1 ring-blue-100/50">
                            <div className="flex items-center gap-2.5 text-sm">
                              <UserRound className="h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
                              <span className="text-slate-500">{t.patient}</span>
                              <span className="ml-auto font-semibold text-brand-navy">{appt.name}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm">
                              <Stethoscope className="h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
                              <span className="text-slate-500">{t.service}</span>
                              <span className="ml-auto text-right font-semibold text-brand-navy">
                                {service
                                  ? bn && service.nameBn
                                    ? service.nameBn
                                    : service.name
                                  : t.general}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm">
                              <BadgeCheck className="h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
                              <span className="text-slate-500">{t.specialist}</span>
                              <span className="ml-auto text-right font-semibold text-brand-navy">
                                {doctor?.name ?? t.assignedLater}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 border-t border-blue-100/70 pt-3 text-xs text-slate-500">
                              <Clock className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                              {t.requested} {formatShortDate(appt.createdAt, lang)}
                            </div>
                          </div>
                        </div>

                        {cancellable && !isPast && (
                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-50/80 bg-slate-50/60 px-6 py-4 sm:px-8">
                            <p className="text-xs leading-relaxed text-slate-500">
                              {t.cantMakeIt.replace("{phone}", settings.phone)}
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setCancelTarget(appt);
                                setCancelPhone("");
                              }}
                              className="rounded-xl border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <CalendarX2 className="h-4 w-4" aria-hidden="true" />
                              {t.cancel}
                            </Button>
                          </div>
                        )}
                      </article>
                    </Reveal>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help strip */}
          <Reveal delay={0.15}>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Hash,
                  title: t.help[0].title,
                  text: t.help[0].text.replace("{phone}", settings.phone),
                },
                {
                  icon: RefreshCw,
                  title: t.help[1].title,
                  text: t.help[1].text,
                },
                {
                  icon: Phone,
                  title: t.help[2].title,
                  text: t.help[2].text
                    .replace("{hours}", bn ? "শনি–বৃহঃ, সকাল ১০টা – রাত ৯টা" : settings.hours)
                    .replace("{phone}", settings.phone),
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-blue-100/70 bg-white/80 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-heading mt-3 text-sm font-bold text-brand-navy">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cancel confirmation dialog */}
      <AnimatePresence>
        {cancelTarget && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-brand-navy/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancelTarget(null)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Cancel appointment"
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-7 shadow-2xl"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-100">
                  <CalendarX2 className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-brand-navy">{t.cancelTitle}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    <span className="font-semibold text-brand-navy">
                      {formatDateLabel(cancelTarget.date, lang)} — {cancelTarget.time}
                    </span>{" "}
                    {t.cancelText.replace("{ref}", cancelTarget.refCode)}
                  </p>
                </div>
              </div>

              <form onSubmit={performCancel} className="mt-5">
                <Label htmlFor="cancel-phone" className="text-sm font-semibold text-brand-navy">
                  {t.cancelPhoneLabel} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="cancel-phone"
                  value={cancelPhone}
                  onChange={(e) => setCancelPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 11))}
                  inputMode="numeric"
                  placeholder="01XXXXXXXXX"
                  autoComplete="off"
                  className="mt-2 h-12 rounded-2xl border-blue-100 bg-ice/60 text-base font-semibold tracking-wide text-brand-navy placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-brand-blue focus:bg-white"
                />
                <div className="mt-5 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCancelTarget(null)}
                    className="h-12 flex-1 rounded-2xl border-blue-100 bg-white text-brand-navy hover:bg-ice"
                  >
                    {t.keepBooking}
                  </Button>
                  <Button
                    type="submit"
                    disabled={cancelPhone.length !== 11 || cancelling}
                    className="h-12 flex-1 rounded-2xl bg-rose-500 font-bold text-white shadow-lg shadow-rose-500/25 hover:bg-rose-600 disabled:opacity-50"
                  >
                    {cancelling ? (
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    ) : (
                      t.yesCancel
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
