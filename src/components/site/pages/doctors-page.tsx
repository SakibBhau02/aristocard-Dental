"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Globe,
  GraduationCap,
  Languages,
  Quote,
  Star,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits, localizedNumber } from "@/lib/i18n";
import { doctors, getDoctor } from "@/lib/data/doctors";
import { testimonials } from "@/lib/data/doctors";
import { PageHeader, DoctorCard, CtaBanner } from "@/components/site/shared";
import { Reveal } from "@/components/site/motion";
import { DynamicIcon } from "@/components/site/icon-map";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotFoundPage } from "@/components/site/pages/not-found-page";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  DOCTORS LIST PAGE (EN / বাংলা)                                     */
/* ------------------------------------------------------------------ */

const assuranceIcons = ["BadgeCheck", "GraduationCap", "UserRound"];

export function DoctorsPage() {
  const { lang, d } = useLang();
  const t = d.doctorsPage;

  usePageMeta({
    title: "Our Doctors — Specialist Dentists in Uttara, Dhaka",
    description:
      "Meet the verified medical board of Aristocrat Dental Care: Dr. Shazia Khanam, Dr. Abdur Rahim, Dr. Jumla Binte Jafor & Dr. Israt Jahan Rimi — BDS/MDS qualified dental specialists.",
  });

  const doctorsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Doctors at Aristocrat Dental Care & Orthodontic Center",
    itemListElement: doctors.map((doc, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Physician",
        name: doc.name,
        jobTitle: doc.role,
        medicalSpecialty: doc.department,
        url: `https://aristocratdentalcarebd.com/#/doctors/${doc.slug}`,
        worksFor: { "@type": "Dentist", name: site.name },
      },
    })),
  };

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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((doctor, i) => (
              <DoctorCard key={doctor.slug} doctor={doctor} index={i} />
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
      {doctorsJsonLd ? null : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  DOCTOR DETAIL PAGE (EN / বাংলা)                                     */
/* ------------------------------------------------------------------ */

const WEEK_DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export function DoctorDetailPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.doctorDetail;
  const doctor = getDoctor(slug);

  usePageMeta({
    title: doctor
      ? `${doctor.name} — ${doctor.role} | Uttara, Dhaka`
      : "Doctor Not Found",
    description: doctor
      ? `${doctor.name}, ${doctor.credentials.join(", ")} — ${doctor.role} at Aristocrat Dental Care & Orthodontic Center, Uttara Dhaka. Book a consultation: ${site.phone}.`
      : undefined,
    jsonLd: doctor
      ? {
          "@context": "https://schema.org",
          "@type": "Physician",
          name: doctor.name,
          jobTitle: doctor.role,
          medicalSpecialty: doctor.department,
          url: `https://aristocratdentalcarebd.com/#/doctors/${doctor.slug}`,
          worksFor: {
            "@type": "Dentist",
            name: site.name,
            telephone: site.phoneRaw,
          },
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

  return (
    <>
      {/* HERO */}
      <section className="hero-mesh-dark relative overflow-hidden">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-blue-200/80">
              <li>
                <a
                  href="#/"
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
                  href="#/doctors"
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

          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-xs"
            >
              <div
                className="flex aspect-square items-center justify-center rounded-[2rem] ring-8 ring-white/10"
                style={{
                  background: `linear-gradient(140deg, ${doctor.accent}33, rgba(255,255,255,0.06))`,
                }}
              >
                <span
                  className="font-heading text-7xl font-bold"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {initials}
                </span>
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
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                {t.available}
              </span>
              <h1 className="font-heading mt-4 text-3xl font-bold leading-tight text-white text-balance sm:text-4xl lg:text-[2.9rem]">
                {doctor.name}
              </h1>
              <p className="mt-2 text-lg font-medium text-amber-300">{role}</p>
              <p className="mt-1 text-sm text-blue-200/85">{department}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {doctor.credentials.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15"
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                    {bn ? c.replace("BDS", "বিডিএস").replace("MDS", "এমডিএস").replace("PGT", "পিজিটি") : c}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/appointment?doctor=${doctor.slug}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-brand-navy shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                  {t.book}
                </button>
                <a
                  href={`tel:${site.phoneRaw}`}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white ring-2 ring-white/40 transition-all duration-300 hover:bg-white/10"
                >
                  {t.callWith.replace("{phone}", site.phone)}
                </a>
              </div>
            </motion.div>
          </div>
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
              </Reveal>

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
                  <div className="rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_12px_40px_-18px_rgba(0,32,96,0.2)]">
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
                  <div className="rounded-3xl border border-blue-100/80 bg-ice p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-base font-bold text-brand-navy">
                        {t.otherSpecialists}
                      </h3>
                      <a
                        href="#/doctors"
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
                            href={`#/doctors/${doc.slug}`}
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
          .replace("{hours}", bn ? "শনি–বৃহঃ, সকাল ১০টা – রাত ৯টা" : site.hours)}
      />
    </>
  );
}
