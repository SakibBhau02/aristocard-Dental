"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { services } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";
import { site } from "@/lib/site";
import { Reveal } from "@/components/site/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  APPOINTMENT PAGE — 3-step booking with validation                  */
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

function formatDateLabel(iso: string): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AppointmentPage() {
  const { navigate, query } = useRouter();
  const { toast } = useToast();

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
    if (doctor && doctors.some((d) => d.slug === doctor)) {
      setForm((f) => ({ ...f, doctorSlug: doctor }));
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
    () => doctors.find((d) => d.slug === form.doctorSlug),
    [form.doctorSlug]
  );

  const step1Valid =
    form.name.trim().length >= 2 &&
    /^01[3-9]\d{8}$/.test(form.phone.replace(/[-\s]/g, ""));
  const step2Valid = form.date !== "" && form.time !== "";
  const step3Valid = true;

  const steps = [
    { label: "Patient & Treatment", valid: step1Valid },
    { label: "Date & Time", valid: step2Valid },
    { label: "Confirm", valid: step3Valid },
  ];

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (submitting) return;
    if (!step1Valid || !step2Valid) {
      toast({
        title: "Incomplete booking details",
        description: "Please complete patient info, date and time before confirming.",
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
        title: "Appointment booked!",
        description: "We'll call to confirm your slot shortly.",
      });
    } catch (err) {
      toast({
        title: "Booking failed",
        description:
          err instanceof Error
            ? err.message
            : "Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
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
            Appointment Confirmed!
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Thank you, <strong className="text-brand-navy">{form.name}</strong>.
            Your appointment request has been received.
            {confirmationId && (
              <span className="mt-2 block text-sm text-slate-500">
                Reference:{" "}
                <span className="font-mono font-bold text-brand-blue">
                  {confirmationId}
                </span>
              </span>
            )}
          </p>

          <div className="mt-8 rounded-3xl bg-ice p-6 text-left">
            <h2 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-brand-blue">
              Booking Summary
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-blue-100/60 pb-2.5">
                <dt className="text-slate-500">Patient</dt>
                <dd className="font-semibold text-brand-navy">{form.name}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-blue-100/60 pb-2.5">
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-semibold text-brand-navy">{form.phone}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-blue-100/60 pb-2.5">
                <dt className="text-slate-500">Service</dt>
                <dd className="font-semibold text-brand-navy">
                  {selectedService?.name ?? "General Consultation"}
                </dd>
              </div>
              {selectedDoctor && (
                <div className="flex justify-between gap-4 border-b border-blue-100/60 pb-2.5">
                  <dt className="text-slate-500">Doctor</dt>
                  <dd className="font-semibold text-brand-navy">
                    {selectedDoctor.name}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Schedule</dt>
                <dd className="text-right font-semibold text-brand-navy">
                  {formatDateLabel(form.date)}
                  <span className="block text-xs text-brand-blue">
                    at {form.time}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Our team will call you on{" "}
            <span className="font-semibold text-brand-navy">{form.phone}</span>{" "}
            to confirm your slot. For urgent changes, call{" "}
            <a
              href={`tel:${site.phoneRaw}`}
              className="font-bold text-brand-blue underline decoration-blue-200 underline-offset-4"
            >
              {site.phone}
            </a>
            .
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => navigate("/")}
              className="rounded-full bg-brand-blue px-8 py-5 font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-brand-navy"
            >
              Back to Home
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
              Book Another
            </Button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="hero-mesh-dark relative overflow-hidden">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-12 text-center sm:px-6 sm:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Book a Visit
            </span>
            <h1 className="font-heading mt-5 text-3xl font-bold leading-tight text-white text-balance sm:text-4xl lg:text-5xl">
              Schedule your appointment in minutes
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-100/85 sm:text-lg">
              Three quick steps — patient details, preferred time and confirm.
              Our team will call to verify your slot.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-blue-200/80">
              {[
                "No advance payment",
                "Free rescheduling",
                "Same-week availability",
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
        <svg
          className="absolute bottom-0 left-0 right-0 h-10 w-full text-white sm:h-14"
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,32 C240,64 480,0 720,16 C960,32 1200,64 1440,24 L1440,56 L0,56 Z"
            fill="currentColor"
          />
        </svg>
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
                        i + 1
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
                      Patient & Treatment Details
                    </h2>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="appt-name" className="text-sm font-semibold text-brand-navy">
                          Patient Name <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="appt-name"
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Full name"
                          required
                          className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appt-phone" className="text-sm font-semibold text-brand-navy">
                          Phone Number <span className="text-rose-500">*</span>
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
                            Enter a valid BD mobile number (e.g. 01712-345678)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appt-email" className="text-sm font-semibold text-brand-navy">
                        Email Address{" "}
                        <span className="text-xs font-normal text-slate-400">(optional)</span>
                      </Label>
                      <Input
                        id="appt-email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="rounded-xl border-blue-100 bg-ice/50 focus-visible:ring-brand-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-brand-navy">
                        Healthcare Service
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
                          General Consultation (not sure yet)
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
                            {s.name}
                          </button>
                        ))}
                      </div>
                      {selectedService && (
                        <p className="mt-1 text-xs text-slate-500">
                          {selectedService.tagline} • {selectedService.duration}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-brand-navy">
                        Preferred Specialist{" "}
                        <span className="text-xs font-normal text-slate-400">
                          (optional)
                        </span>
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
                          No preference — assign best match
                        </button>
                        {doctors.map((d) => (
                          <button
                            key={d.slug}
                            type="button"
                            onClick={() => setForm({ ...form, doctorSlug: d.slug })}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300",
                              form.doctorSlug === d.slug
                                ? "bg-brand-blue text-white shadow-lg shadow-blue-500/30"
                                : "bg-white text-slate-700 ring-1 ring-blue-100/70 hover:ring-brand-blue/40"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-heading text-xs font-bold",
                                form.doctorSlug === d.slug
                                  ? "bg-white/20 text-white"
                                  : "text-white"
                              )}
                              style={
                                form.doctorSlug === d.slug
                                  ? undefined
                                  : { background: d.accent }
                              }
                            >
                              {d.name
                                .replace("Dr. ", "")
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">
                                {d.name}
                              </span>
                              <span
                                className={cn(
                                  "block truncate text-[11px]",
                                  form.doctorSlug === d.slug
                                    ? "text-blue-100"
                                    : "text-slate-500"
                                )}
                              >
                                {d.role}
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
                      Preferred Date & Time
                    </h2>

                    <div className="space-y-2">
                      <Label htmlFor="appt-date" className="text-sm font-semibold text-brand-navy">
                        Appointment Date <span className="text-rose-500">*</span>
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
                          {formatDateLabel(form.date)}
                          {new Date(`${form.date}T00:00:00`).getDay() === 5 && (
                            <span className="ml-2 text-amber-600">
                              (Friday — emergency on call only)
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                        <Clock className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                        Preferred Time Slot <span className="text-rose-500">*</span>
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
                        Slots shown in clinic hours (10 AM – 9 PM, Sat–Thu).
                        Final time confirmed on call.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appt-notes" className="text-sm font-semibold text-brand-navy">
                        Additional Notes{" "}
                        <span className="text-xs font-normal text-slate-400">
                          (optional)
                        </span>
                      </Label>
                      <Textarea
                        id="appt-notes"
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Tell us about your concern, dental anxiety, or anything we should know…"
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
                      Review & Confirm
                    </h2>

                    <div className="rounded-3xl bg-ice p-6 sm:p-7">
                      <dl className="space-y-3.5 text-sm">
                        {[
                          { label: "Patient", value: form.name },
                          { label: "Phone", value: form.phone },
                          {
                            label: "Email",
                            value: form.email || "Not provided",
                          },
                          {
                            label: "Service",
                            value: selectedService?.name ?? "General Consultation",
                          },
                          {
                            label: "Specialist",
                            value: selectedDoctor?.name ?? "Best available match",
                          },
                          {
                            label: "Date",
                            value: formatDateLabel(form.date),
                          },
                          { label: "Time", value: form.time },
                          { label: "Notes", value: form.notes || "—" },
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
                        Edit patient & treatment details
                      </button>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-white p-5">
                      <p className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
                        <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-blue" aria-hidden="true" />
                        After confirming, our reception team will call{" "}
                        <strong className="text-brand-navy">{form.phone}</strong>{" "}
                        to verify your slot. No payment is needed now.
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
                    ← Back
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
                    Continue →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-emerald-600 px-9 py-4 font-bold text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-70"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                        Confirming…
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="mr-2 h-5 w-5" aria-hidden="true" />
                        Confirm Appointment
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
                { icon: Phone, text: `Prefer calling? ${site.phone}` },
                { icon: Clock, text: "Open Sat–Thu, 10 AM – 9 PM" },
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
