"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Mail,
  Phone,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import type { Lang } from "@/lib/data/dictionary";
import { services } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";
import { site } from "@/lib/site";
import { Reveal } from "@/components/site/motion";
import { HeroBackdrop } from "@/components/site/hero-backdrop";
import { slidesForRoute } from "@/lib/data/hero-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  APPOINTMENT PAGE — 3-step booking with validation (EN / বাংলা)      */
/* ------------------------------------------------------------------ */

const timeSlots = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
  "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
];

function todayISO(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

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

export function AppointmentPage() {
  const { navigate, query } = useRouter();
  const { toast } = useToast();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.appointmentPage;

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string>("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: todayISO(),
    time: "",
    doctorSlug: "",
    serviceSlug: "",
    notes: "",
  });

  /* Pre-select from query params (?service=slug or ?doctor=slug) */
  useEffect(() => {
    const service = query.get("service");
    const doctor = query.get("doctor");
    if (service && services.some((s) => s.slug === service)) {
      setForm((f) => ({ ...f, serviceSlug: service }));
    }
    if (doctor && doctors.some((doc) => doc.slug === doctor)) {
      setForm((f) => ({ ...f, doctorSlug: doctor }));
    }
    /* Deep-link note (e.g. from smile assessment) — only fill empty notes */
    const note = query.get("note");
    if (note) {
      setForm((f) => (f.notes ? f : { ...f, notes: note.slice(0, 900) }));
    }
  }, [query]);

  usePageMeta({
    title: "Book a Dental Appointment — Online Booking in Uttara, Dhaka",
    description:
      "Schedule your dental visit at Aristocrat Dental Care & Orthodontic Center in minutes. Choose your doctor, service, date & time — confirmation sent instantly. Hotline 01715-027522.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ReserveAction",
      name: "Book a Dental Appointment",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://aristocratdentalcarebd.com/#/appointment",
        actionPlatform: "http://schema.org/DesktopWebPlatform",
      },
      result: { "@type": "Reservation", name: "Dental Consultation" },
    },
  });

  const selectedService = useMemo(
    () => services.find((s) => s.slug === form.serviceSlug),
    [form.serviceSlug]
  );
  const selectedDoctor = useMemo(
    () => doctors.find((doc) => doc.slug === form.doctorSlug),
    [form.doctorSlug]
  );

  const serviceName = selectedService
    ? bn && selectedService.nameBn
      ? selectedService.nameBn
      : selectedService.name
    : null;
  const serviceTagline = selectedService
    ? bn && selectedService.taglineBn
      ? selectedService.taglineBn
      : selectedService.tagline
    : "";

  const step1Valid =
    form.name.trim().length >= 2 &&
    /^01[3-9]\d{8}$/.test(form.phone.replace(/[-\s]/g, ""));
  const step2Valid = form.date !== "" && form.time !== "";
  const step3Valid = true;

  const steps = [
    { label: t.steps[0], valid: step1Valid },
    { label: t.steps[1], valid: step2Valid },
    { label: t.steps[2], valid: step3Valid },
  ];

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (submitting) return;
    if (!step1Valid || !step2Valid) {
      toast({
        title: t.toastIncomplete,
        description: t.toastIncompleteDesc,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          date: form.date,
          time: form.time,
          doctorSlug: form.doctorSlug || undefined,
          serviceSlug: form.serviceSlug || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      setConfirmationId(data.id ?? "");
      setConfirmed(true);
      toast({
        title: t.toastBooked,
        description: t.toastBookedDesc,
      });
    } catch (err) {
      toast({
        title: t.toastFailed,
        description:
          err instanceof Error
            ? err.message
            : t.toastFailedDesc,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    const copyRef = async () => {
      try {
        await navigator.clipboard.writeText(confirmationId);
        toast({
          title: t.toastCopied,
          description: t.toastCopiedDesc.replace("{ref}", confirmationId),
        });
      } catch {
        toast({
          title: t.toastCopyFail,
          description: t.toastCopyFailDesc,
          variant: "destructive",
        });
      }
    };

    return (
      <section className="hero-mesh flex items-center justify-center px-4 py-24 sm:py-32" aria-label="Booking confirmation">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xl rounded-[2.5rem] border border-blue-100 bg-white p-8 text-center shadow-2xl shadow-navy-900/15 sm:p-12"
        >
          <span className="relative mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" aria-hidden="true" />
            <span className="absolute inset-0 rounded-full bg-emerald-200/50 animate-pulse-ring" aria-hidden="true" />
          </span>
          <h1 className="font-heading mt-8 text-3xl font-bold text-brand-navy sm:text-4xl">
            {t.successTitle}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {t.successText.replace("{name}", form.name)}
            {confirmationId && (
              <span className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-ice/70 py-2 pl-4 pr-2 text-sm text-slate-500">
                <span className="font-mono font-bold tracking-wider text-brand-blue">
                  {confirmationId}
                </span>
                <button
                  type="button"
                  onClick={copyRef}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-brand-navy/60 transition-colors hover:bg-white hover:text-brand-blue"
                  aria-label={t.copyLabel}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </button>
              </span>
            )}
          </p>

          <div className="mt-8 rounded-3xl bg-ice p-6 text-left">
            <h2 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-brand-blue">
              {t.summaryTitle}
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-blue-100/60 pb-2.5">
                <dt className="text-slate-500">{t.reviewPatient}</dt>
                <dd className="font-semibold text-brand-navy">{form.name}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-blue-100/60 pb-2.5">
                <dt className="text-slate-500">{t.reviewPhone}</dt>
                <dd className="font-semibold text-brand-navy">{form.phone}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-blue-100/60 pb-2.5">
                <dt className="text-slate-500">{t.reviewService}</dt>
                <dd className="font-semibold text-brand-navy">
                  {serviceName ?? t.general}
                </dd>
              </div>
              {selectedDoctor && (
                <div className="flex justify-between gap-4 border-b border-blue-100/60 pb-2.5">
                  <dt className="text-slate-500">{t.reviewSpecialist}</dt>
                  <dd className="font-semibold text-brand-navy">
                    {selectedDoctor.name}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">{t.reviewDate}</dt>
                <dd className="text-right font-semibold text-brand-navy">
                  {formatDateLabel(form.date, lang)}
                  <span className="block text-xs text-brand-blue">
                    {t.summaryScheduleAt} {form.time}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            {t.successCallNote
              .replace("{phone}", form.phone)
              .replace("{phone2}", site.phone)}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => navigate("/")}
              className="rounded-full bg-brand-blue px-8 py-5 font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-brand-navy"
            >
              {t.backHome}
            </Button>
            <Button
              onClick={() => navigate("/status")}
              className="rounded-full border border-blue-100 bg-ice px-8 py-5 font-bold text-brand-navy transition-all duration-300 hover:border-brand-blue/30 hover:bg-blue-50"
            >
              <Search className="h-4.5 w-4.5" aria-hidden="true" />
              {t.checkStatusAnytime}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmed(false);
                setStep(0);
                setForm({
                  name: "",
                  phone: "",
                  email: "",
                  date: todayISO(),
                  time: "",
                  doctorSlug: "",
                  serviceSlug: "",
                  notes: "",
                });
              }}
              className="rounded-full border-brand-blue/30 px-8 py-5 font-bold text-brand-navy hover:bg-blue-50"
            >
              {t.bookAnother}
            </Button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      {/* Hero — centered over a sliding clinic backdrop */}
      <section className="relative isolate overflow-hidden bg-brand-navy">
        <HeroBackdrop slides={slidesForRoute("appointment")} overlay="deep" interval={8000} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-20 sm:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t.heroBadge}
            </span>
            <h1 className="font-heading mt-5 text-3xl font-bold leading-tight text-white text-balance sm:text-4xl lg:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-100/85 sm:text-lg">
              {t.heroText}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-blue-200/80">
              {t.trust.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-6 text-xs text-blue-200/70">
              {t.alreadyBooked}{" "}
              <a
                href="#/status"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/status");
                }}
                className="inline-flex items-center gap-1 font-semibold text-white underline decoration-amber-400/70 decoration-2 underline-offset-4 transition-colors hover:text-amber-300"
              >
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                {t.checkStatus}
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stepper */}
      <section className="relative -mt-2 pb-4" aria-label="Booking progress">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <ol className="flex items-center gap-2 rounded-3xl border border-blue-100/80 bg-white p-4 shadow-[0_12px_40px_-18px_rgba(0,32,96,0.2)] sm:gap-4 sm:p-5">
              {steps.map((s, i) => {
                const state =
                  i < step ? "done" : i === step ? "active" : "todo";
                return (
                  <li key={s.label} className="flex flex-1 items-center gap-2 sm:gap-3">
                    <span
                      className={cn(
                        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold transition-all duration-500 sm:h-10 sm:w-10",
                        state === "done" &&
                          "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
                        state === "active" &&
                          "bg-brand-blue text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-100",
                        state === "todo" && "bg-slate-100 text-slate-400"
                      )}
                      aria-current={state === "active" ? "step" : undefined}
                    >
                      {state === "done" ? (
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        bn ? toBnDigits(i + 1) : i + 1
                      )}
                    </span>
                    <span
                      className={cn(
                        "hidden text-xs font-semibold sm:block",
                        state === "active"
                          ? "text-brand-navy"
                          : state === "done"
                            ? "text-emerald-600"
                            : "text-slate-400"
                      )}
                    >
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <span
                        className={cn(
                          "h-0.5 flex-1 rounded-full transition-colors duration-500",
                          i < step ? "bg-emerald-400" : "bg-slate-100"
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* Form */}
      <section className="py-10 sm:py-12" aria-label="Appointment booking form">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="rounded-[2rem] border border-blue-100/80 bg-white p-6 shadow-[0_16px_50px_-24px_rgba(0,32,96,0.25)] sm:p-10">
            <form onSubmit={handleSubmit} noValidate>
              <AnimatePresence mode="wait">
                {/* -------- STEP 1: patient & treatment -------- */}
                {step === 0 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-6"
                  >
                    <h2 className="flex items-center gap-3 font-heading text-xl font-bold text-brand-navy">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                        <UserRound className="h-5 w-5" aria-hidden="true" />
                      </span>
                      {t.step1Heading}
                    </h2>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="appt-name" className="text-sm font-semibold text-brand-navy">
                          {t.nameLabel} <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="appt-name"
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder={t.namePlaceholder}
                          required
                          className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appt-phone" className="text-sm font-semibold text-brand-navy">
                          {t.phoneLabel} <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="appt-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="01XXXXXXXXX"
                          required
                          className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                        />
                        {form.phone && !step1Valid && (
                          <p className="text-xs text-amber-600">
                            {t.phoneHint}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appt-email" className="text-sm font-semibold text-brand-navy">
                        {t.emailLabel}{" "}
                        <span className="text-xs font-normal text-slate-400">{t.optional}</span>
                      </Label>
                      <Input
                        id="appt-email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder={bn ? "apnar@email.com" : "you@example.com"}
                        className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-brand-navy">
                        {t.serviceLabel}
                      </Label>
                      <div className="grid max-h-64 gap-2 overflow-y-auto rounded-2xl border border-blue-100/70 bg-ice/40 p-3 scroll-area">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, serviceSlug: "" })}
                          className={cn(
                            "rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-300",
                            !form.serviceSlug
                              ? "bg-brand-blue text-white shadow-lg shadow-blue-500/30"
                              : "bg-white text-slate-700 ring-1 ring-blue-100/70 hover:ring-brand-blue/40"
                          )}
                        >
                          {t.generalService}
                        </button>
                        {services.map((s) => (
                          <button
                            key={s.slug}
                            type="button"
                            onClick={() => setForm({ ...form, serviceSlug: s.slug })}
                            className={cn(
                              "rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-300",
                              form.serviceSlug === s.slug
                                ? "bg-brand-blue text-white shadow-lg shadow-blue-500/30"
                                : "bg-white text-slate-700 ring-1 ring-blue-100/70 hover:ring-brand-blue/40"
                            )}
                          >
                            {bn && s.nameBn ? s.nameBn : s.name}
                          </button>
                        ))}
                      </div>
                      {selectedService && (
                        <p className="mt-1 text-xs text-slate-500">
                          {serviceTagline} • {bn ? toBnDigits(selectedService.duration) : selectedService.duration}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-brand-navy">
                        {t.doctorLabel}{" "}
                        <span className="text-xs font-normal text-slate-400">{t.optional}</span>
                      </Label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, doctorSlug: "" })}
                          className={cn(
                            "rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-all duration-300",
                            !form.doctorSlug
                              ? "bg-brand-navy text-white shadow-lg"
                              : "bg-white text-slate-700 ring-1 ring-blue-100/70 hover:ring-brand-blue/40"
                          )}
                        >
                          {t.noPreference}
                        </button>
                        {doctors.map((doc) => (
                          <button
                            key={doc.slug}
                            type="button"
                            onClick={() => setForm({ ...form, doctorSlug: doc.slug })}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300",
                              form.doctorSlug === doc.slug
                                ? "bg-brand-blue text-white shadow-lg shadow-blue-500/30"
                                : "bg-white text-slate-700 ring-1 ring-blue-100/70 hover:ring-brand-blue/40"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-heading text-xs font-bold",
                                form.doctorSlug === doc.slug
                                  ? "bg-white/20 text-white"
                                  : "text-white"
                              )}
                              style={
                                form.doctorSlug === doc.slug
                                  ? undefined
                                  : { background: doc.accent }
                              }
                            >
                              {doc.name
                                .replace("Dr. ", "")
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">
                                {doc.name}
                              </span>
                              <span
                                className={cn(
                                  "block truncate text-[11px]",
                                  form.doctorSlug === doc.slug
                                    ? "text-blue-100"
                                    : "text-slate-500"
                                )}
                              >
                                {bn && doc.roleBn ? doc.roleBn : doc.role}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* -------- STEP 2: date & time -------- */}
                {step === 1 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-6"
                  >
                    <h2 className="flex items-center gap-3 font-heading text-xl font-bold text-brand-navy">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                        <CalendarDays className="h-5 w-5" aria-hidden="true" />
                      </span>
                      {t.step2Heading}
                    </h2>

                    <div className="space-y-2">
                      <Label htmlFor="appt-date" className="text-sm font-semibold text-brand-navy">
                        {t.dateLabel} <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="appt-date"
                        type="date"
                        min={todayISO()}
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                        className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                      />
                      {form.date && (
                        <p className="text-xs font-medium text-brand-blue">
                          {formatDateLabel(form.date, lang)}
                          {new Date(`${form.date}T00:00:00`).getDay() === 5 && (
                            <span className="ml-2 text-amber-600">
                              {t.fridayNote}
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                        <Clock className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                        {t.timeLabel} <span className="text-rose-500">*</span>
                      </Label>
                      <div
                        className="grid grid-cols-3 gap-2 rounded-2xl border border-blue-100/70 bg-ice/40 p-3 sm:grid-cols-5"
                        role="radiogroup"
                        aria-label="Time slot selection"
                      >
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            role="radio"
                            aria-checked={form.time === slot}
                            onClick={() => setForm({ ...form, time: slot })}
                            className={cn(
                              "rounded-xl px-2 py-2.5 text-xs font-semibold transition-all duration-300 sm:text-sm",
                              form.time === slot
                                ? "bg-brand-blue text-white shadow-lg shadow-blue-500/30"
                                : "bg-white text-slate-700 ring-1 ring-blue-100/70 hover:ring-brand-blue/40"
                            )}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        {t.timeHint}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appt-notes" className="text-sm font-semibold text-brand-navy">
                        {t.notesLabel}{" "}
                        <span className="text-xs font-normal text-slate-400">{t.optional}</span>
                      </Label>
                      <Textarea
                        id="appt-notes"
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder={t.notesPlaceholder}
                        className="resize-none rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                      />
                    </div>
                  </motion.div>
                )}

                {/* -------- STEP 3: review & confirm -------- */}
                {step === 2 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-6"
                  >
                    <h2 className="flex items-center gap-3 font-heading text-xl font-bold text-brand-navy">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                        <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                      </span>
                      {t.step3Heading}
                    </h2>

                    <div className="rounded-3xl bg-ice p-6 sm:p-7">
                      <dl className="space-y-3.5 text-sm">
                        {[
                          { label: t.reviewPatient, value: form.name },
                          { label: t.reviewPhone, value: form.phone },
                          {
                            label: t.reviewEmail,
                            value: form.email || t.notProvided,
                          },
                          {
                            label: t.reviewService,
                            value: serviceName ?? t.general,
                          },
                          {
                            label: t.reviewSpecialist,
                            value: selectedDoctor?.name ?? t.bestMatch,
                          },
                          {
                            label: t.reviewDate,
                            value: formatDateLabel(form.date, lang),
                          },
                          { label: t.reviewTime, value: form.time },
                          { label: t.reviewNotes, value: form.notes || "—" },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className="flex flex-col justify-between gap-1 border-b border-blue-100/60 pb-3 sm:flex-row sm:items-center"
                          >
                            <dt className="font-medium text-slate-500">{row.label}</dt>
                            <dd className="font-semibold text-brand-navy sm:text-right">
                              {row.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="mt-4 text-xs font-semibold text-brand-blue underline decoration-blue-200 underline-offset-4 hover:text-brand-navy"
                      >
                        {t.editStep1}
                      </button>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-white p-5">
                      <p className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
                        <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-blue" aria-hidden="true" />
                        {t.callNote.replace("{phone}", form.phone)}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nav buttons */}
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-blue-50 pt-6">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-full border-blue-200 px-7 py-4 font-semibold text-brand-navy hover:bg-blue-50"
                  >
                    ← {t.back}
                  </Button>
                ) : (
                  <span className="hidden sm:block" aria-hidden="true" />
                )}

                {step < 2 ? (
                  <Button
                    type="button"
                    disabled={(step === 0 && !step1Valid) || (step === 1 && !step2Valid)}
                    onClick={() => setStep((s) => s + 1)}
                    className="rounded-full bg-brand-blue px-9 py-4 font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t.continue} →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="btn-press rounded-full bg-emerald-600 px-9 py-4 font-bold text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                        {t.confirming}
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="mr-2 h-5 w-5" aria-hidden="true" />
                        {t.confirm}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Help strip */}
          <Reveal className="mt-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Phone, text: t.helpCall.replace("{phone}", site.phone) },
                { icon: Clock, text: t.helpHours },
                { icon: Mail, text: site.email },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-2xl border border-blue-100/70 bg-white px-4 py-3.5 text-sm text-slate-600"
                >
                  <Icon className="h-5 w-5 shrink-0 text-brand-blue" aria-hidden="true" />
                  <span className="break-all">{text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
