"use client";

import { useState, useMemo, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Globe,
  GraduationCap,
  Languages,
  Medal,
  Quote,
  Sparkles,
  Star,
  Stethoscope,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits, localizedNumber } from "@/lib/i18n";
import { useBundle, useRouteHeroSlides } from "@/components/site/content-provider";
import { testimonials } from "@/lib/content/shared";
import type { Doctor, Service } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageHeader, CtaBanner } from "@/components/site/shared";
import { Reveal } from "@/components/site/motion";
import { DynamicIcon } from "@/components/site/icon-map";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotFoundPage } from "@/components/site/pages/not-found-page";
import { HeroBackdrop } from "@/components/site/hero-backdrop";

/* ------------------------------------------------------------------ */
/*  DOCTORS LIST PAGE (EN / বাংলা)                                     */
/* ------------------------------------------------------------------ */

const assuranceIcons = ["BadgeCheck", "GraduationCap", "UserRound"];

const WEEK_DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

type WeekDay = (typeof WEEK_DAYS)[number];

/* Degree transliteration for Bangla mode (same chain the detail hero uses). */
function credentialBn(text: string): string {
  return text.replace("BDS", "বিডিএস").replace("MDS", "এমডিএস").replace("PGT", "পিজিটি");
}

/* ------------------------------------------------------------------ */
/*  Doctor card with expandable full profile (/doctors list page)     */
/* ------------------------------------------------------------------ */

/* Micro section heading shared across the dossier blocks. */
function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <h5 className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-blue ring-1 ring-blue-100">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      {children}
    </h5>
  );
}

function DoctorProfileCard({
  doctor,
  index,
}: {
  doctor: Doctor;
  index: number;
}) {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const { services } = useBundle();
  const bn = lang === "bn";
  const t = d.doctorsPage;
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  const initials = doctor.name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const role = bn && doctor.roleBn ? doctor.roleBn : doctor.role;

  const panelId = `doctor-profile-${doctor.slug}`;
  const aboutHeading = t.aboutTitle.replace("{name}", doctor.name);
  const bookLabel = t.bookWith.replace("{name}", doctor.name);

  /* "{count}+ years experience" → bold value ("8+") + micro label */
  const yearsDigits = bn
    ? toBnDigits(doctor.experienceYears)
    : String(doctor.experienceYears);
  const yearsParts = t.yearsExp.replace("{count}", yearsDigits).split("+");
  const yearsValue = `${yearsParts[0] ?? ""}+`;
  const yearsLabel = yearsParts.slice(1).join("+").trim();

  const ratingValue = bn
    ? `${toBnDigits(doctor.rating)}/৫`
    : `${doctor.rating}/5`;

  /* Consultation days — human-friendly localized list (dictionary
     weekday map, same source the detail-page day-strip uses) */
  const dayNames = doctor.consultationDays.map((day) =>
    bn ? d.days[day as WeekDay] : day
  );
  const lastDay = dayNames[dayNames.length - 1] ?? "";
  const daysText =
    dayNames.length > 1
      ? `${dayNames.slice(0, -1).join(", ")}${bn ? " ও " : " & "}${lastDay}`
      : dayNames[0] ?? "";

  /* Round 17-a dossier data (all optional — sections render only when set) */
  const quoteText = bn && doctor.quoteBn ? doctor.quoteBn : doctor.quote;
  const education = doctor.education ?? [];
  const focusEntries: Service[] = (doctor.focusServices ?? [])
    .map((slug) => services.find((s) => s.slug === slug))
    .filter((s): s is Service => Boolean(s));

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col items-center overflow-hidden rounded-3xl border border-blue-100/80 bg-white p-6 text-center shadow-[0_10px_30px_-14px_rgba(0,32,96,0.16)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-16px_rgba(0,32,96,0.28)] sm:p-7 lg:items-stretch lg:text-left"
    >
      {/* top accent */}
      <span
        className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${doctor.accent}, #002060)` }}
        aria-hidden="true"
      />

      {/* identity header — centered stack (mobile) → horizontal sheet (lg) */}
      <div className="flex w-full flex-col items-center gap-5 lg:flex-row lg:items-start lg:gap-6">
        <div className="relative shrink-0">
          {/* soft accent halo on hover */}
          <span
            className="absolute -inset-1.5 rounded-full opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-20"
            style={{ background: doctor.accent }}
            aria-hidden="true"
          />
          <Avatar className="relative h-24 w-24 border-4 border-blue-50 shadow-inner transition-transform duration-500 group-hover:scale-105">
            {doctor.photo ? (
              <AvatarImage
                src={doctor.photo}
                alt={`${doctor.name} — ${role}`}
                className="aspect-square size-full object-cover"
              />
            ) : undefined}
            <AvatarFallback
              className="font-heading text-2xl font-bold"
              style={{ background: `${doctor.accent}18`, color: doctor.accent }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white"
            title="BMDC Verified"
            aria-label="BMDC verified doctor"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-bold text-brand-navy lg:text-xl">
            {doctor.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-brand-blue">{role}</p>
          <p className="mt-2 flex flex-wrap justify-center gap-1.5 lg:justify-start">
            {doctor.credentials.slice(0, 3).map((c) => (
              <Badge key={c} variant="secondary" className="bg-blue-50 text-[10px] font-medium text-brand-navy">
                {c}
              </Badge>
            ))}
          </p>
          <div
            className="mt-4 flex flex-wrap items-center justify-center gap-1 lg:justify-start"
            aria-label={`Rating ${doctor.rating} out of 5`}
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-brand-navy">{doctor.rating}</span>
            <span className="text-xs text-slate-400">
              • {bn ? toBnDigits(doctor.experienceYears) : doctor.experienceYears}+ {d.shared.yrs} • {localizedNumber(doctor.patientsTreated, lang)}+ {d.shared.patients}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto w-full pt-5">
        {/* expand/collapse toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-brand-blue ring-1 ring-blue-100 transition-all duration-300 hover:bg-brand-blue hover:text-white hover:ring-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          {expanded ? t.hideProfile : t.viewProfile}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${
              expanded ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {/* hover-reveal quick book (replaced by the panel CTA while open) */}
        {!expanded && (
          <button
            type="button"
            onClick={() => navigate(`/appointment?doctor=${doctor.slug}`)}
            className="pointer-events-none mt-2 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold text-white opacity-0 shadow-lg shadow-navy-900/25 transition-all duration-300 hover:bg-brand-blue focus-visible:pointer-events-auto focus-visible:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
            style={{ backgroundColor: "#002060" }}
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            {d.shared.ctaBook}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}

        {/* expandable full-profile dossier */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="doctor-profile"
              id={panelId}
              role="region"
              aria-label={aboutHeading}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
              }
              className="overflow-hidden"
            >
              <div className="profile-seam mt-4 rounded-2xl border border-blue-100 bg-ice p-5 text-left sm:p-6">
                {/* ── About ── */}
                <h4 className="font-heading flex items-center gap-2.5 text-sm font-bold text-brand-navy">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-blue ring-1 ring-blue-100">
                    <Stethoscope className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  {aboutHeading}
                </h4>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-600 sm:text-sm">
                  {doctor.bio}
                </p>
                {bn && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-blue-100">
                    <Globe className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                    {d.doctorDetail.contentNote}
                  </p>
                )}

                {/* ── Philosophy pull-quote ── */}
                {quoteText ? (
                  <figure className="relative mt-5 overflow-hidden rounded-xl bg-white p-4 pl-5 ring-1 ring-blue-100 sm:p-5 sm:pl-6">
                    <span
                      className="absolute inset-y-0 left-0 w-1.5"
                      style={{
                        background: `linear-gradient(180deg, ${doctor.accent}, #002060)`,
                      }}
                      aria-hidden="true"
                    />
                    <Quote
                      className="h-5 w-5 rotate-180"
                      style={{ color: doctor.accent }}
                      aria-hidden="true"
                    />
                    <blockquote
                      className={cn(
                        "mt-2 font-heading text-sm font-medium leading-relaxed text-brand-navy sm:text-[15px]",
                        !bn && "italic"
                      )}
                    >
                      {bn ? `“${quoteText}”` : `“${quoteText}”`}
                    </blockquote>
                    <figcaption className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t.philosophyTitle} — {doctor.name}
                    </figcaption>
                  </figure>
                ) : null}

                {/* ── Clinical stats ribbon ── */}
                <dl className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl text-white shadow-md shadow-navy-900/20"
                  style={{ background: "linear-gradient(135deg, #00123a 0%, #012c5f 55%, #1e7dff 140%)" }}
                >
                  <div className="flex flex-col items-center gap-1 px-2 py-4 text-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                      <Award className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                    </span>
                    <dd className="font-heading text-lg font-bold leading-none">
                      {yearsValue}
                    </dd>
                    <dt className="text-[9px] font-semibold uppercase tracking-wider text-blue-100/90">
                      {yearsLabel}
                    </dt>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-x border-white/15 px-2 py-4 text-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                      <Users className="h-3.5 w-3.5 text-blue-200" aria-hidden="true" />
                    </span>
                    <dd className="font-heading text-lg font-bold leading-none">
                      {localizedNumber(doctor.patientsTreated, lang)}+
                    </dd>
                    <dt className="text-[9px] font-semibold uppercase tracking-wider text-blue-100/90">
                      {t.patientsTreatedLabel}
                    </dt>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-2 py-4 text-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" aria-hidden="true" />
                    </span>
                    <dd className="font-heading text-lg font-bold leading-none">
                      {ratingValue}
                    </dd>
                    <dt className="text-[9px] font-semibold uppercase tracking-wider text-blue-100/90">
                      {t.ratingLabel}
                    </dt>
                  </div>
                </dl>

                {/* ── Education & training timeline ── */}
                {education.length ? (
                  <section className="mt-5 border-t border-blue-100 pt-5">
                    <SectionLabel icon={GraduationCap}>
                      {t.educationTitle}
                    </SectionLabel>
                    <ol className="mt-3.5">
                      {education.map((ed, i) => (
                        <li
                          key={`${ed.degree}-${i}`}
                          className="relative flex gap-3.5 pb-4 last:pb-0 sm:gap-4"
                        >
                          {/* timeline rail */}
                          <span className="relative flex flex-col items-center" aria-hidden="true">
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
                                i === 0 && "ring-4 ring-ice"
                              )}
                              style={{ background: doctor.accent }}
                            >
                              <GraduationCap className="h-3.5 w-3.5" />
                            </span>
                            {i < education.length - 1 ? (
                              <span className="mt-1 w-0.5 flex-1 rounded-full bg-blue-100" />
                            ) : null}
                          </span>
                          {/* entry */}
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-heading text-sm font-bold text-brand-navy">
                                {bn ? credentialBn(ed.degree) : ed.degree}
                              </span>
                              {ed.year ? (
                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-brand-blue ring-1 ring-blue-100">
                                  {bn ? toBnDigits(ed.year) : ed.year}
                                </span>
                              ) : null}
                            </div>
                            {ed.institution ? (
                              <p className="mt-0.5 text-xs leading-snug text-slate-500">
                                {ed.institution}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                ) : null}

                {/* ── Focus treatments → /services/<slug> ── */}
                {focusEntries.length ? (
                  <section className="mt-5 border-t border-blue-100 pt-5">
                    <SectionLabel icon={Crosshair}>
                      {t.focusTreatmentsTitle}
                    </SectionLabel>
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {focusEntries.map((svc) => (
                        <a
                          key={svc.slug}
                          href={`/services/${svc.slug}`}
                          className="group/chip inline-flex min-h-11 items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-xs font-bold text-brand-navy ring-1 ring-blue-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-navy-900/15 hover:ring-brand-blue/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                        >
                          <span
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white"
                            style={{ background: doctor.accent }}
                            aria-hidden="true"
                          >
                            <DynamicIcon name={svc.icon} className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            {bn && svc.nameBn ? svc.nameBn : svc.name}
                          </span>
                          <ArrowRight
                            className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-all duration-300 group-hover/chip:translate-x-0.5 group-hover/chip:text-brand-blue"
                            aria-hidden="true"
                          />
                        </a>
                      ))}
                    </div>
                  </section>
                ) : null}

                {/* ── Weekly consultation schedule (Sat–Fri week) ── */}
                <section className="mt-5 border-t border-blue-100 pt-5">
                  <SectionLabel icon={CalendarDays}>
                    {t.scheduleTitle}
                  </SectionLabel>
                  <div
                    className="mt-3.5 grid grid-cols-7 gap-1"
                    role="list"
                    aria-label={t.scheduleTitle}
                  >
                    {WEEK_DAYS.map((day) => {
                      const active = doctor.consultationDays.includes(day);
                      return (
                        <div
                          key={day}
                          role="listitem"
                          title={`${bn ? d.days[day] : day} — ${active ? t.availableDay : t.offDay}`}
                          className={cn(
                            "rounded-lg px-0.5 py-2 text-center text-[10px] font-bold leading-tight sm:px-1 sm:text-[11px]",
                            active
                              ? "text-white shadow-md shadow-navy-900/20"
                              : "bg-white/70 font-medium text-slate-400 ring-1 ring-blue-100/60"
                          )}
                          style={
                            active
                              ? {
                                  background: `linear-gradient(160deg, ${doctor.accent}, #002060)`,
                                }
                              : undefined
                          }
                        >
                          <span aria-hidden="true">{bn ? d.daysShort[day] : day.slice(0, 3)}</span>
                          <span className="sr-only">
                            {bn ? d.days[day] : day} — {active ? t.availableDay : t.offDay}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
                    {daysText}
                  </p>
                </section>

                {/* ── Specializations ── */}
                <section className="mt-5 border-t border-blue-100 pt-5">
                  <SectionLabel icon={Sparkles}>
                    {t.specializationsTitle}
                  </SectionLabel>
                  <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                    {doctor.specializations.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-[13px] leading-snug text-slate-700">
                        <span
                          className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: doctor.accent }}
                          aria-hidden="true"
                        />
                        {s}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* ── Credentials + languages ── */}
                <dl className="mt-5 grid gap-x-6 gap-y-5 border-t border-blue-100 pt-5 sm:grid-cols-2">
                  <div>
                    <dt className="flex items-center gap-2.5">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-blue ring-1 ring-blue-100">
                        <GraduationCap className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {t.credentialsTitle}
                      </span>
                    </dt>
                    <dd className="mt-2.5 flex flex-wrap gap-1.5">
                      {doctor.credentials.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy ring-1 ring-blue-100"
                        >
                          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                          {bn ? credentialBn(c) : c}
                        </span>
                      ))}
                    </dd>
                  </div>

                  <div>
                    <dt className="flex items-center gap-2.5">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-blue ring-1 ring-blue-100">
                        <Languages className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {t.languagesTitle}
                      </span>
                    </dt>
                    <dd className="mt-2.5 flex flex-wrap gap-1.5">
                      {doctor.languages.map((l) => (
                        <span
                          key={l}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-blue-100"
                        >
                          <Globe className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                          {bn ? (l === "Bangla" ? "বাংলা" : l === "English" ? "ইংরেজি" : l) : l}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>

                {/* ── Memberships (only when data exists) ── */}
                {doctor.memberships?.length ? (
                  <section className="mt-5 border-t border-blue-100 pt-5">
                    <SectionLabel icon={BadgeCheck}>
                      {t.membershipsTitle}
                    </SectionLabel>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {doctor.memberships.map((m) => (
                        <li
                          key={m}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy ring-1 ring-blue-100"
                        >
                          <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {/* ── Awards & recognition (only when data exists) ── */}
                {doctor.awards?.length ? (
                  <section className="mt-5 border-t border-blue-100 pt-5">
                    <SectionLabel icon={Medal}>
                      {t.awardsTitle}
                    </SectionLabel>
                    <ul className="mt-3 space-y-2">
                      {doctor.awards.map((a, i) => (
                        <li
                          key={`${a.title}-${i}`}
                          className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-blue-100"
                        >
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                            <Medal className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1 text-[13px] font-semibold text-brand-navy">
                            {a.title}
                          </span>
                          {a.year ? (
                            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100">
                              {bn ? toBnDigits(a.year) : a.year}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {/* ── Booking CTA ── */}
                <div className="mt-5 border-t border-blue-100 pt-5">
                  <button
                    type="button"
                    onClick={() => navigate(`/appointment?doctor=${doctor.slug}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-blue-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                  >
                    <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                    {bookLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

export function DoctorsPage() {
  const { lang, d } = useLang();
  const t = d.doctorsPage;
  const { doctors, services, settings } = useBundle();

  /* Physician JSON-LD — enriched with the dossier fields (education
     alumniOf, spoken languages, focus treatments as availableService).
     Memoized so usePageMeta's effect doesn't re-run every render.     */
  const doctorsJsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Doctors at Aristocrat Dental Care & Orthodontic Center",
    itemListElement: doctors.map((doc, i) => {
      const institutions = Array.from(
        new Set((doc.education ?? []).map((e) => e.institution).filter(Boolean))
      );
      const focusNames = (doc.focusServices ?? [])
        .map((slug) => services.find((s) => s.slug === slug)?.name)
        .filter(Boolean);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Physician",
          name: doc.name,
          jobTitle: doc.role,
          medicalSpecialty: doc.department,
          url: `https://aristocratdentalcarebd.com/doctors/${doc.slug}`,
          worksFor: { "@type": "Dentist", name: settings.name },
          knowsLanguage: doc.languages,
          ...(institutions.length
            ? {
                alumniOf: institutions.map((name) => ({
                  "@type": "CollegeOrUniversity",
                  name,
                })),
              }
            : {}),
          ...(focusNames.length
            ? {
                availableService: focusNames.map((name) => ({
                  "@type": "MedicalProcedure",
                  name,
                })),
              }
            : {}),
        },
      };
    }),
  }), [doctors, services, settings.name]);

  usePageMeta({
    title: "Our Doctors — Specialist Dentists in Uttara, Dhaka",
    description:
      "Meet the verified medical board of Aristocrat Dental Care: Dr. Shazia Khanam, Dr. Abdur Rahim, Dr. Jumla Binte Jafor & Dr. Israt Jahan Rimi — BDS/MDS qualified dental specialists.",
    jsonLd: doctorsJsonLd,
  });

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        breadcrumb={[{ label: d.chrome.nav.home, to: "/" }, { label: d.chrome.nav.doctors }]}
      />
      <section className="py-16 sm:py-20" aria-label="Doctor profiles">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {doctors.map((doctor, i) => (
              <DoctorProfileCard key={doctor.slug} doctor={doctor} index={i} />
            ))}
          </div>

          {/* assurance strip */}
          <Reveal className="mt-12">
            <div className="grid gap-4 rounded-[2rem] border border-blue-100 bg-ice p-7 sm:grid-cols-3 sm:p-8">
              {t.assurance.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm ring-1 ring-blue-100">
                    <DynamicIcon name={assuranceIcons[i]} className="h-5.5 w-5.5" />
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
        </div>
      </section>
      <CtaBanner
        title={t.ctaTitle}
        description={t.ctaDescription}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  DOCTOR DETAIL PAGE (EN / বাংলা)                                     */
/* ------------------------------------------------------------------ */

export function DoctorDetailPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.doctorDetail;
  const tp = d.doctorsPage;
  const { doctors, services, settings } = useBundle();
  const heroSlides = useRouteHeroSlides("doctors");
  const doctor = doctors.find((doc) => doc.slug === slug);

  usePageMeta({
    title: doctor
      ? `${doctor.name} — ${doctor.role} | Uttara, Dhaka`
      : "Doctor Not Found",
    description: doctor
      ? `${doctor.name}, ${doctor.credentials.join(", ")} — ${doctor.role} at Aristocrat Dental Care & Orthodontic Center, Uttara Dhaka. Book a consultation: ${settings.phone}.`
      : undefined,
    jsonLd: doctor
      ? {
          "@context": "https://schema.org",
          "@type": "Physician",
          name: doctor.name,
          jobTitle: doctor.role,
          medicalSpecialty: doctor.department,
          url: `https://aristocratdentalcarebd.com/doctors/${doctor.slug}`,
          worksFor: {
            "@type": "Dentist",
            name: settings.name,
            telephone: settings.phoneRaw,
          },
          knowsLanguage: doctor.languages,
          ...((doctor.education ?? []).some((e) => e.institution)
            ? {
                alumniOf: Array.from(
                  new Set(
                    (doctor.education ?? [])
                      .map((e) => e.institution)
                      .filter(Boolean)
                  )
                ).map((name) => ({
                  "@type": "CollegeOrUniversity",
                  name,
                })),
              }
            : {}),
          ...((doctor.focusServices ?? []).length
            ? {
                availableService: (doctor.focusServices ?? [])
                  .map((slug) => services.find((s) => s.slug === slug)?.name)
                  .filter(Boolean)
                  .map((name) => ({ "@type": "MedicalProcedure", name })),
              }
            : {}),
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: doctor.rating,
            bestRating: 5,
            ratingCount: Math.max(20, doctor.patientsTreated / 20),
          },
        }
      : undefined,
  });

  if (!doctor) return <NotFoundPage />;

  const initials = doctor.name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const others = doctors.filter((doc) => doc.slug !== doctor.slug);
  const docTestimonials = testimonials.filter((tm) =>
    doctor.name.toLowerCase().includes("shazia")
      ? tm.name !== "সাদিয়া আক্তার"
      : true
  ).slice(0, 3);

  const role = bn && doctor.roleBn ? doctor.roleBn : doctor.role;
  const department = bn && doctor.departmentBn ? doctor.departmentBn : doctor.department;
  const languages = bn
    ? doctor.languages.map((l) => (l === "Bangla" ? "বাংলা" : l === "English" ? "ইংরেজি" : l)).join(", ")
    : doctor.languages.join(", ");

  /* Round 17-a dossier data */
  const quoteText = bn && doctor.quoteBn ? doctor.quoteBn : doctor.quote;
  const education = doctor.education ?? [];
  const focusEntries: Service[] = (doctor.focusServices ?? [])
    .map((svcSlug) => services.find((s) => s.slug === svcSlug))
    .filter((s): s is Service => Boolean(s));

  return (
    <>
      {/* HERO — centered over a sliding team backdrop */}
      <section className="relative isolate overflow-hidden bg-brand-navy">
        <HeroBackdrop slides={heroSlides} overlay="deep" interval={8000} />
        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-20 sm:pt-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-blue-200/80">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/");
                  }}
                  className="transition-colors hover:text-white"
                >
                  {d.chrome.nav.home}
                </a>
              </li>
              <li className="text-blue-300/50" aria-hidden="true">/</li>
              <li>
                <a
                  href="/doctors"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/doctors");
                  }}
                  className="transition-colors hover:text-white"
                >
                  {d.chrome.nav.doctors}
                </a>
              </li>
              <li className="text-blue-300/50" aria-hidden="true">/</li>
              <li className="font-medium text-white">{doctor.name}</li>
            </ol>
          </nav>

          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-[200px]"
            >
              <div
                className="flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] ring-8 ring-white/10 backdrop-blur-sm"
                style={{
                  background: `linear-gradient(140deg, ${doctor.accent}55, rgba(255,255,255,0.08))`,
                }}
              >
                {doctor.photo ? (
                  /* CMS photo: local /images or /uploads path, or any remote URL */
                  <img
                    src={doctor.photo}
                    alt={`${doctor.name} — ${role}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span
                    className="font-heading text-6xl font-bold"
                    style={{ color: "rgba(255,255,255,0.92)" }}
                  >
                    {initials}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t.bmdcVerified}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                {t.available}
              </span>
              <h1 className="font-heading mx-auto mt-4 max-w-2xl text-3xl font-bold leading-tight text-white text-balance sm:text-4xl lg:text-[2.9rem]">
                {doctor.name}
              </h1>
              <p className="mt-2 text-lg font-medium text-amber-300">{role}</p>
              <p className="mt-1 text-sm text-blue-200/85">{department}</p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {doctor.credentials.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm"
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                    {bn ? c.replace("BDS", "বিডিএস").replace("MDS", "এমডিএস").replace("PGT", "পিজিটি") : c}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/appointment?doctor=${doctor.slug}`)}
                  className="btn-press btn-shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-7 py-3.5 text-sm font-bold text-brand-navy shadow-xl shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-amber-500/40"
                >
                  <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                  {t.book}
                </button>
                <a
                  href={`tel:${settings.phoneRaw}`}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white ring-2 ring-white/40 transition-all duration-300 hover:bg-white/10 hover:ring-white"
                >
                  {t.callWith.replace("{phone}", settings.phone)}
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              {/* clinical impact */}
              <Reveal>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: `${bn ? toBnDigits(doctor.experienceYears) : doctor.experienceYears}+`, label: t.years },
                    { value: `${localizedNumber(doctor.patientsTreated, lang)}+`, label: t.patients },
                    { value: `${bn ? toBnDigits(doctor.rating) : doctor.rating}/5`, label: t.rating },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-blue-100/80 bg-white p-5 text-center shadow-[0_8px_25px_-14px_rgba(0,32,96,0.2)]"
                    >
                      <span className="font-heading block text-2xl font-bold text-brand-navy sm:text-3xl">
                        {stat.value}
                      </span>
                      <span className="mt-1 block text-[11px] font-medium uppercase tracking-wider text-slate-500">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* biography */}
              <Reveal className="mt-10">
                <h2 className="font-heading flex items-center gap-3 text-xl font-bold text-brand-navy">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                    <Stethoscope className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {t.bioHeading}
                </h2>
                {bn && (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-blue-100">
                    <Globe className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                    {t.contentNote}
                  </p>
                )}
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">
                  {doctor.bio}
                </p>

                {/* philosophy pull-quote (only when set) */}
                {quoteText ? (
                  <figure className="relative mt-6 overflow-hidden rounded-2xl bg-ice p-5 pl-6 ring-1 ring-blue-100 sm:p-6 sm:pl-7">
                    <span
                      className="absolute inset-y-0 left-0 w-1.5"
                      style={{
                        background: `linear-gradient(180deg, ${doctor.accent}, #002060)`,
                      }}
                      aria-hidden="true"
                    />
                    <Quote
                      className="h-5 w-5 rotate-180"
                      style={{ color: doctor.accent }}
                      aria-hidden="true"
                    />
                    <blockquote
                      className={cn(
                        "mt-2 font-heading text-[15px] font-medium leading-relaxed text-brand-navy sm:text-base",
                        !bn && "italic"
                      )}
                    >
                      {`“${quoteText}”`}
                    </blockquote>
                    <figcaption className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {tp.philosophyTitle} — {doctor.name}
                    </figcaption>
                  </figure>
                ) : null}
              </Reveal>

              {/* education & training timeline (only when set) */}
              {education.length ? (
                <Reveal className="mt-10">
                  <h3 className="font-heading flex items-center gap-3 text-lg font-bold text-brand-navy">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                      <GraduationCap className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {tp.educationTitle}
                  </h3>
                  <ol className="mt-5">
                    {education.map((ed, i) => (
                      <li
                        key={`${ed.degree}-${i}`}
                        className="relative flex gap-4 pb-5 last:pb-0"
                      >
                        <span className="relative flex flex-col items-center" aria-hidden="true">
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white",
                              i === 0 && "ring-4 ring-ice"
                            )}
                            style={{ background: doctor.accent }}
                          >
                            <GraduationCap className="h-4 w-4" />
                          </span>
                          {i < education.length - 1 ? (
                            <span className="mt-1 w-0.5 flex-1 rounded-full bg-blue-100" />
                          ) : null}
                        </span>
                        <div className="min-w-0 flex-1 pt-1">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span className="font-heading text-[15px] font-bold text-brand-navy">
                              {bn ? credentialBn(ed.degree) : ed.degree}
                            </span>
                            {ed.year ? (
                              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-blue ring-1 ring-blue-100">
                                {bn ? toBnDigits(ed.year) : ed.year}
                              </span>
                            ) : null}
                          </div>
                          {ed.institution ? (
                            <p className="mt-0.5 text-[13px] leading-snug text-slate-500">
                              {ed.institution}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                </Reveal>
              ) : null}

              {/* focus treatments → /services/<slug> (only when set) */}
              {focusEntries.length ? (
                <Reveal className="mt-10">
                  <h3 className="font-heading flex items-center gap-3 text-lg font-bold text-brand-navy">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                      <Crosshair className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {tp.focusTreatmentsTitle}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {focusEntries.map((svc) => (
                      <a
                        key={svc.slug}
                        href={`/services/${svc.slug}`}
                        className="group/chip inline-flex min-h-11 items-center gap-2 rounded-full border border-blue-100/80 bg-white py-1.5 pl-1.5 pr-4 text-xs font-bold text-brand-navy transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-navy-900/15 hover:ring-brand-blue/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                      >
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white"
                          style={{ background: doctor.accent }}
                          aria-hidden="true"
                        >
                          <DynamicIcon name={svc.icon} className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          {bn && svc.nameBn ? svc.nameBn : svc.name}
                        </span>
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-all duration-300 group-hover/chip:translate-x-0.5 group-hover/chip:text-brand-blue"
                          aria-hidden="true"
                        />
                      </a>
                    ))}
                  </div>
                </Reveal>
              ) : null}

              {/* specializations */}
              <Reveal className="mt-10">
                <h3 className="font-heading text-lg font-bold text-brand-navy">
                  {t.specializations}
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {doctor.specializations.map((s) => (
                    <li
                      key={s}
                      className="flex items-center gap-3 rounded-2xl border border-blue-100/80 bg-ice px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-brand-blue/30"
                    >
                      <span
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                        style={{ background: doctor.accent }}
                      >
                        <Star className="h-4 w-4" aria-hidden="true" />
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* testimonials */}
              {docTestimonials.length > 0 && (
                <Reveal className="mt-10">
                  <h3 className="font-heading text-lg font-bold text-brand-navy">
                    {t.testimonials}
                  </h3>
                  <div className="mt-4 space-y-4">
                    {docTestimonials.map((tm) => (
                      <figure
                        key={tm.name}
                        className="rounded-2xl border border-blue-100/80 bg-white p-5"
                      >
                        <Quote className="h-5 w-5 rotate-180 text-brand-blue/60" aria-hidden="true" />
                        <blockquote
                          className={`mt-2 text-sm leading-relaxed text-slate-600 ${
                            tm.language === "bn" ? "font-heading" : ""
                          }`}
                        >
                          {tm.text.length > 220 ? `${tm.text.slice(0, 220)}…` : tm.text}
                        </blockquote>
                        <figcaption className="mt-3 flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-amber-200">
                            <AvatarFallback className="text-xs font-bold text-brand-navy">
                              {tm.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            <span className="block text-xs font-bold text-brand-navy">
                              {tm.name}
                            </span>
                            <span className="flex items-center gap-0.5" aria-label="5 star review">
                              {Array.from({ length: tm.rating }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-3 w-3 fill-amber-400 text-amber-400"
                                  aria-hidden="true"
                                />
                              ))}
                            </span>
                          </span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <Reveal delay={0.1}>
                <div className="sticky top-28 space-y-4">
                  <div className="card-lift rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_12px_40px_-18px_rgba(0,32,96,0.2)]">
                    <h3 className="font-heading text-base font-bold text-brand-navy">
                      {t.consultation}
                    </h3>
                    <dl className="mt-4 space-y-4 text-sm">
                      <div className="flex items-start justify-between gap-4 border-t border-blue-50 pt-3.5">
                        <dt className="text-slate-500">{t.department}</dt>
                        <dd className="text-right font-semibold text-brand-navy">
                          {department}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4 border-t border-blue-50 pt-3.5">
                        <dt className="flex items-center gap-1.5 text-slate-500">
                          <Languages className="h-4 w-4" aria-hidden="true" />
                          {t.languages}
                        </dt>
                        <dd className="text-right font-semibold text-brand-navy">
                          {languages}
                        </dd>
                      </div>
                      <div className="border-t border-blue-50 pt-3.5">
                        <dt className="text-slate-500">{t.days}</dt>
                        <dd className="mt-2 flex flex-wrap gap-1.5">
                          {WEEK_DAYS.map((day) => {
                            const active = doctor.consultationDays.includes(day);
                            return (
                              <span
                                key={day}
                                className={
                                  active
                                    ? "rounded-lg bg-brand-blue px-2.5 py-1 text-[11px] font-bold text-white"
                                    : "rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-400"
                                }
                              >
                                {bn ? d.daysShort[day] : day.slice(0, 3)}
                              </span>
                            );
                          })}
                        </dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => navigate(`/appointment?doctor=${doctor.slug}`)}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-blue py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/40 transition-all duration-300 hover:bg-brand-blue-light"
                    >
                      <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                      {t.bookSlot}
                    </button>
                  </div>

                  {/* other doctors */}
                  <div className="card-lift rounded-3xl border border-blue-100/80 bg-ice p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-base font-bold text-brand-navy">
                        {t.otherSpecialists}
                      </h3>
                      <a
                        href="/doctors"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/doctors");
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-brand-navy"
                      >
                        {t.viewAll}
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {others.map((doc) => (
                        <li key={doc.slug}>
                          <a
                            href={`/doctors/${doc.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/doctors/${doc.slug}`);
                            }}
                            className="group flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-blue-100/60 transition-all duration-300 hover:ring-brand-blue/40"
                          >
                            <span
                              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-heading text-sm font-bold text-white"
                              style={{ background: doc.accent }}
                            >
                              {doc.name
                                .replace("Dr. ", "")
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-brand-navy group-hover:text-brand-blue">
                                {doc.name}
                              </span>
                              <span className="block truncate text-xs text-slate-500">
                                {bn && doc.roleBn ? doc.roleBn : doc.role}
                              </span>
                            </span>
                            <ChevronLeft className="ml-auto hidden h-4 w-4 rotate-180 text-brand-blue/50 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        title={t.ctaTitle.replace("{doctor}", doctor.name)}
        description={t.ctaDescription
          .replace("{doctor}", doctor.name)
          .replace("{hours}", bn ? "শনি–বৃহঃ, সকাল ১০টা – রাত ৯টা" : settings.hours)}
      />
    </>
  );
}
