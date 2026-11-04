"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Images,
  Languages,
  Quote,
  Sparkles,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits, localizedNumber } from "@/lib/i18n";
import { useBundle, useRouteHeroSlides } from "@/components/site/content-provider";
import { pickBn, testimonials } from "@/lib/content/shared";
import { goToSection } from "@/lib/anchor";
import { CtaBanner } from "@/components/site/shared";
import { SiteHeroBackdrop } from "@/components/site/hero-backdrop";
import {
  Reveal,
  SectionHeading,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion";
import { TestimonialMarquee } from "@/components/site/testimonial-marquee";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  FOUNDER PROFILE — a dedicated, richer page for Dr. Shazia Khanam   */
/*                                                                     */
/*  Every other doctor uses the standard dossier in doctors-page.tsx.  */
/*  The founder gets her own page built from the About-page dossier    */
/*  (education, certificates, milestones, clinic) plus her live        */
/*  Doctor row (services, rating, languages, visiting days).           */
/* ------------------------------------------------------------------ */

const FOUNDER_FALLBACK_SLUG = "dr-shazia-khanam";

export function FounderProfilePage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { lang } = useLang();
  const bn = lang === "bn";
  const { about, doctors, services, settings } = useBundle();
  const heroSlides = useRouteHeroSlides("doctors");

  const doctor = doctors.find((d) => d.slug === slug);
  const founderYears = about.founderYears || "18+";
  const founderName = pickBn(about.founderName, about.founderNameBn, bn);
  const founderRole = pickBn(about.founderRole, about.founderRoleBn, bn);

  const education = about.founderEducation ?? [];
  const credentials = about.founderCredentials ?? [];
  const milestones = about.founderMilestones ?? [];
  const rooms = (about.clinicRooms ?? []).filter((r) => r.featured).slice(0, 3);

  const focusServices = useMemo(
    () =>
      (doctor?.focusServices ?? [])
        .map((s) => services.find((svc) => svc.slug === s))
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [doctor?.focusServices, services]
  );

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Physician",
      name: about.founderName,
      jobTitle: about.founderRole,
      description: about.founderBio?.[0],
      image: about.founderImage?.startsWith("http")
        ? about.founderImage
        : `https://aristocratdentalcarebd.com${about.founderImage ?? ""}`,
      url: `https://aristocratdentalcarebd.com/doctors/${slug}`,
      medicalSpecialty: "Orthodontics",
      worksFor: {
        "@type": "Dentist",
        name: settings.name,
        telephone: settings.phoneRaw,
        address: settings.address,
      },
      ...((doctor?.languages ?? []).length ? { knowsLanguage: doctor?.languages } : {}),
      ...(education.length
        ? {
            alumniOf: Array.from(
              new Set(education.map((e) => e.institution).filter(Boolean))
            ).map((name) => ({ "@type": "CollegeOrUniversity", name })),
          }
        : {}),
      ...(credentials.length
        ? {
            hasCredential: credentials.map((c) => ({
              "@type": "EducationalOccupationalCredential",
              name: c.title,
              ...(c.issuer
                ? { recognizedBy: { "@type": "Organization", name: c.issuer } }
                : {}),
            })),
          }
        : {}),
      ...(focusServices.length
        ? {
            availableService: focusServices.map((s) => ({
              "@type": "MedicalProcedure",
              name: bn && s.nameBn ? s.nameBn : s.name,
            })),
          }
        : {}),
    }),
    [about.founderName, about.founderRole, about.founderBio, about.founderImage,
     doctor?.languages, education, credentials, focusServices, settings, slug, bn]
  );

  usePageMeta({
    title: `${about.founderName} — ${about.founderRole}`,
    description: `Meet ${about.founderName}, founder and Chief Consultant of ${settings.name}, Uttara Dhaka — ${founderYears} years of experience, FCPS (Orthodontics), WFO Fellow (USA). Education, certificates and career milestones.`,
    jsonLd,
  });

  if (!doctor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-heading text-3xl font-bold text-brand-navy">
          {bn ? "প্রোফাইল পাওয়া যায়নি" : "Profile not found"}
        </h1>
        <p className="mt-3 text-slate-600">
          {bn
            ? "এই ডাক্তারের প্রোফাইলটি এখন পাওয়া যাচ্ছে না।"
            : "This doctor's profile is not available right now."}
        </p>
        <Button asChild className="mt-6 rounded-full bg-brand-blue">
          <a href="/doctors" onClick={(e) => { e.preventDefault(); navigate("/doctors"); }}>
            {bn ? "সব ডাক্তার দেখুন" : "See all doctors"}
          </a>
        </Button>
      </div>
    );
  }

  const accent = doctor.accent || "#1e7dff";
  const rating = localizedNumber(doctor.rating, bn ? "bn" : "en", { decimals: 1 });
  const patients = localizedNumber(doctor.patientsTreated, bn ? "bn" : "en");
  const years = bn ? toBnDigits(founderYears) : founderYears;

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-brand-navy text-white">
        <SiteHeroBackdrop slides={heroSlides} overlay="light" indicators priority />
        <span
          className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full opacity-40 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
          aria-hidden="true"
        />
        <span className="dot-grid-light pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-28">
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-blue-200/80">
              <li>
                <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="hover:text-white">
                  {bn ? "হোম" : "Home"}
                </a>
              </li>
              <li className="text-blue-300/50" aria-hidden="true">/</li>
              <li>
                <a href="/doctors" onClick={(e) => { e.preventDefault(); navigate("/doctors"); }} className="hover:text-white">
                  {bn ? "ডাক্তার" : "Doctors"}
                </a>
              </li>
              <li className="text-blue-300/50" aria-hidden="true">/</li>
              <li className="text-blue-100">{about.founderName}</li>
            </ol>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            {/* portrait */}
            <Reveal>
              <div className="relative mx-auto max-w-sm">
                <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/20 to-transparent p-1.5">
                  <div className="relative aspect-[4/4.7] overflow-hidden rounded-[1.7rem] bg-white">
                    {about.founderImage ? (
                      <Image
                        src={about.founderImage}
                        alt={about.founderImageAlt || about.founderName}
                        fill
                        priority
                        sizes="(max-width: 1024px) 80vw, 384px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="font-heading text-5xl font-bold" style={{ color: accent }}>
                          {about.founderName.replace("Dr. ", "").charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-white px-5 py-3 shadow-2xl">
                  <span className="font-heading text-2xl font-bold text-brand-navy">{years}</span>
                  <span className="max-w-[8rem] text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500">
                    {pickBn(about.founderYearsLabel, about.founderYearsLabelBn, bn)}
                  </span>
                </div>
              </div>
            </Reveal>

            {/* intro */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-amber-300/30">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {bn ? "প্রতিষ্ঠাতা" : "Founder"}
              </span>
              <h1 className="font-heading mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                {about.founderName}
              </h1>
              <p className="mt-2 text-sm font-semibold text-blue-200 sm:text-base">
                {about.founderRole}
              </p>
              {about.founderTagline ? (
                <p className="mt-5 border-l-2 border-amber-400/70 pl-4 text-base font-medium italic leading-relaxed text-amber-100/90 sm:text-lg">
                  {pickBn(about.founderTagline, about.founderTaglineBn, bn)}
                </p>
              ) : null}

              {credentials.length > 0 ? (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {credentials.slice(0, 4).map((c, i) => (
                    <li
                      key={`${c.title}-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[11.5px] font-semibold text-blue-100 ring-1 ring-white/15"
                    >
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
                      {pickBn(c.title, c.titleBn, bn)}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-full bg-white px-6 py-3.5 text-sm font-bold text-brand-navy shadow-xl transition-transform hover:-translate-y-0.5"
                >
                  <a
                    href="/appointment"
                    onClick={(e) => { e.preventDefault(); navigate("/appointment"); }}
                    className="inline-flex items-center gap-2"
                  >
                    <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                    {bn ? "অ্যাপয়েন্টমেন্ট নিন" : "Book an appointment"}
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/25 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/12 hover:text-white"
                >
                  <a
                    href="/about#clinic-tour"
                    onClick={(e) => {
                      e.preventDefault();
                      goToSection(navigate, "/about", "clinic-tour");
                    }}
                    className="inline-flex items-center gap-2"
                  >
                    <Images className="h-4.5 w-4.5" aria-hidden="true" />
                    {bn ? "ক্লিনিক ঘুরে দেখুন" : "Tour the clinic"}
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* quick facts */}
          <div className="mt-14 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 lg:grid-cols-4">
            {[
              {
                icon: Award,
                value: years,
                label: bn ? "বছরের অভিজ্ঞতা" : "Years of experience",
              },
              {
                icon: Users,
                value: patients,
                label: bn ? "রোগীর চিকিৎসা" : "Patients treated",
              },
              {
                icon: Star,
                value: `${rating}★`,
                label: bn ? "রোগীর রেটিং" : "Patient rating",
              },
              {
                icon: Languages,
                value: bn ? "বাংলা, ইংরেজি" : "Bangla, English",
                label: bn ? "ভাষা" : "Languages",
              },
            ].map((fact) => (
              <div key={fact.label} className="text-center">
                <fact.icon className="mx-auto h-5 w-5 text-amber-300" aria-hidden="true" />
                <p className="font-heading mt-2 text-xl font-bold text-white sm:text-2xl">{fact.value}</p>
                <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-wider text-blue-200/70">
                  {fact.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="py-16 sm:py-20" aria-labelledby="founder-about">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <SectionHeading
                align="left"
                eyebrow={bn ? "পরিচিতি" : "About the founder"}
                title={bn ? "যে বিশ্বাসে ক্লিনিক দাঁড়িয়ে" : "The conviction behind the clinic"}
              />
              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">
                {(about.founderBio ?? []).map((paragraph, i) => {
                  const text = bn ? about.founderBioBn?.[i]?.trim() || paragraph : paragraph;
                  if (!text?.trim()) return null;
                  return (
                    <Reveal key={i} delay={i * 0.05}>
                      <p>{text}</p>
                    </Reveal>
                  );
                })}
              </div>

              {doctor.specializations.length > 0 ? (
                <Reveal className="mt-6">
                  <ul className="flex flex-wrap gap-2">
                    {doctor.specializations.map((s) => (
                      <li
                        key={s}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-[11.5px] font-semibold text-brand-blue ring-1 ring-blue-100"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}
            </div>

            {/* quote + visit info */}
            <div className="space-y-5">
              <Reveal>
                <figure className="relative overflow-hidden rounded-3xl bg-brand-navy p-7 text-white shadow-xl">
                  <Quote className="h-8 w-8 text-amber-300/70" aria-hidden="true" />
                  <blockquote className="font-heading mt-3 text-lg font-medium leading-snug">
                    {bn && doctor.quoteBn ? doctor.quoteBn : doctor.quote}
                  </blockquote>
                  <figcaption className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-blue-200/80">
                    {about.founderName}
                  </figcaption>
                </figure>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="rounded-3xl border border-blue-100/80 bg-white p-6">
                  <h3 className="font-heading flex items-center gap-2 text-sm font-bold text-brand-navy">
                    <CalendarDays className="h-4.5 w-4.5 text-brand-blue" aria-hidden="true" />
                    {bn ? "ভিজিটের দিন" : "Consultation days"}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                    {doctor.consultationDays.join(", ")}
                  </p>
                  <h3 className="font-heading mt-5 flex items-center gap-2 text-sm font-bold text-brand-navy">
                    <Stethoscope className="h-4.5 w-4.5 text-brand-blue" aria-hidden="true" />
                    {bn ? "বিভাগ" : "Department"}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                    {bn && doctor.departmentBn ? doctor.departmentBn : doctor.department}
                  </p>
                  <a
                    href={`tel:${settings.phoneRaw}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-brand-navy"
                  >
                    {settings.phone}
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EDUCATION & CREDENTIALS ================= */}
      <section className="bg-ice py-16 sm:py-20" aria-labelledby="founder-education">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={bn ? "শিক্ষা ও সার্টিফিকেট" : "Education & credentials"}
            title={
              bn ? (
                <>হাসির পেছনের <span className="gradient-text">প্রশিক্ষণ</span></>
              ) : (
                <>The training behind <span className="gradient-text">every smile</span></>
              )
            }
            description={
              bn
                ? "একাডেমিক যাত্রা, বিশেষজ্ঞ যোগ্যতা এবং আন্তর্জাতিক স্বীকৃতি।"
                : "Academic path, specialist qualifications and international recognition."
            }
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <div className="h-full rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_16px_45px_-30px_rgba(0,32,96,0.5)] sm:p-8">
                <h3 className="font-heading flex items-center gap-2.5 text-lg font-bold text-brand-navy">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue ring-1 ring-blue-100">
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {bn ? "শিক্ষা ও প্রশিক্ষণ" : "Education & training"}
                </h3>
                <ol className="relative mt-6 space-y-6 border-l border-blue-100 pl-6">
                  {education.map((item, i) => (
                    <li key={`${item.degree}-${i}`} className="relative">
                      <span className="absolute -left-[1.9rem] top-1.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white ring-2 ring-brand-blue" aria-hidden="true">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                      </span>
                      {item.year ? (
                        <span className="font-heading inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-brand-blue">
                          {bn ? toBnDigits(item.year) : item.year}
                        </span>
                      ) : null}
                      <p className="font-heading mt-1.5 text-[15px] font-bold leading-snug text-brand-navy">
                        {pickBn(item.degree, item.degreeBn, bn)}
                      </p>
                      {item.institution ? (
                        <p className="mt-0.5 text-[13px] font-medium text-slate-600">
                          {pickBn(item.institution, item.institutionBn, bn)}
                        </p>
                      ) : null}
                      {item.detail ? (
                        <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
                          {pickBn(item.detail, item.detailBn, bn)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <div className="space-y-6">
              <Reveal delay={0.08}>
                <div className="rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_16px_45px_-30px_rgba(0,32,96,0.5)] sm:p-8">
                  <h3 className="font-heading flex items-center gap-2.5 text-lg font-bold text-brand-navy">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600 ring-1 ring-amber-200">
                      <BadgeCheck className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {bn ? "সার্টিফিকেট ও সদস্যপদ" : "Certificates & memberships"}
                  </h3>
                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {credentials.map((c, i) => (
                      <li key={`${c.title}-${i}`} className="rounded-2xl bg-ice px-4 py-3 ring-1 ring-blue-100/70">
                        <p className="text-[13px] font-bold leading-snug text-brand-navy">
                          {pickBn(c.title, c.titleBn, bn)}
                        </p>
                        {c.issuer ? (
                          <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">
                            {pickBn(c.issuer, c.issuerBn, bn)}
                          </p>
                        ) : null}
                        {c.year ? (
                          <p className="mt-1 text-[10.5px] font-bold uppercase tracking-wider text-brand-blue">
                            {bn ? toBnDigits(c.year) : c.year}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_16px_45px_-30px_rgba(0,32,96,0.5)] sm:p-8">
                  <h3 className="font-heading flex items-center gap-2.5 text-lg font-bold text-brand-navy">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-100">
                      <Award className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {bn ? "কর্মজীবনের মাইলফলক" : "Career milestones"}
                  </h3>
                  <ol className="mt-5 space-y-3">
                    {milestones.map((m, i) => (
                      <li key={`${m.title}-${i}`} className="flex gap-3">
                        <span className="font-heading mt-0.5 inline-flex h-7 min-w-12 shrink-0 items-center justify-center rounded-lg bg-brand-navy px-1.5 text-[10.5px] font-bold text-white">
                          {m.year ? (bn ? toBnDigits(m.year) : m.year) : String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-bold leading-snug text-brand-navy">
                            {pickBn(m.title, m.titleBn, bn)}
                          </span>
                          {m.description ? (
                            <span className="mt-0.5 block text-[11.5px] leading-relaxed text-slate-500">
                              {pickBn(m.description, m.descriptionBn, bn)}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EXPERTISE / SERVICES ================= */}
      {focusServices.length > 0 ? (
        <section className="py-16 sm:py-20" aria-labelledby="founder-expertise">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              eyebrow={bn ? "বিশেষত্ব" : "Areas of expertise"}
              title={bn ? "যে চিকিৎসায় তিনি এগিয়ে" : "Treatments she leads"}
            />
            <StaggerContainer className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {focusServices.map((svc) => (
                <StaggerItem key={svc.slug}>
                  <a
                    href={`/services/${svc.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/services/${svc.slug}`);
                    }}
                    className="group flex h-full flex-col rounded-3xl border border-blue-100/80 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_20px_45px_-24px_rgba(30,125,255,0.45)]"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100 transition-transform duration-500 group-hover:scale-110">
                      <Sparkles className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-heading mt-4 text-[15px] font-bold text-brand-navy">
                      {bn && svc.nameBn ? svc.nameBn : svc.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-slate-500">
                      {bn && svc.excerptBn ? svc.excerptBn : svc.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-blue">
                      {bn ? "বিস্তারিত" : "Learn more"}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </a>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      ) : null}

      {/* ================= CLINIC ================= */}
      {rooms.length > 0 ? (
        <section className="bg-brand-navy py-16 sm:py-20" aria-labelledby="founder-clinic">
          <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              dark
              eyebrow={bn ? "তার ক্লিনিক" : "Her clinic"}
              title={
                <>
                  {bn ? "যেখানে প্রতিদিন " : "Where every day "}
                  <span className="gold-text">{bn ? "চিকিৎসা হয়" : "treatment happens"}</span>
                </>
              }
              description={
                bn
                  ? "ডা. শাজিয়া খানমের নেতৃত্বে পরিচালিত ক্লিনিকের রুম ও ইকুইপমেন্ট।"
                  : "The rooms and equipment of the clinic she leads — hygiene, diagnostics and treatment."
              }
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {rooms.map((room, i) => (
                <Reveal key={room.id} delay={i * 0.06}>
                  <a
                    href="/about#clinic-tour"
                    onClick={(e) => {
                      e.preventDefault();
                      goToSection(navigate, "/about", "clinic-tour");
                    }}
                    className="group block overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/12 transition-all duration-500 hover:-translate-y-1 hover:ring-amber-300/30"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {room.image ? (
                        <Image
                          src={room.image}
                          alt={room.imageAlt || room.title}
                          fill
                          sizes="(max-width: 640px) 92vw, 380px"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#002060,#1e7dff)]" aria-hidden="true">
                          <Images className="h-7 w-7 text-white/60" />
                        </div>
                      )}
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/85 to-transparent" aria-hidden="true" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-[14px] font-bold text-white">
                        {pickBn(room.title, room.titleBn, bn)}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-blue-100/70">
                        {pickBn(room.description, room.descriptionBn, bn)}
                      </p>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-16 sm:py-20" aria-labelledby="founder-testimonials">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={bn ? "রোগীদের কথা" : "In their words"}
            title={bn ? "যে হাসিগুলো তিনি ফিরিয়ে দিয়েছেন" : "Smiles she has given back"}
          />
          <Reveal className="mt-12">
            <TestimonialMarquee testimonials={testimonials.slice(0, 10)} />
          </Reveal>
        </div>
      </section>

      <CtaBanner
        title={bn ? "ডা. শাজিয়া খানমের সাথে পরামর্শ করুন" : "Consult Dr. Shazia Khanam"}
        description={
          bn
            ? "সরাসরি বিশেষজ্ঞের সাথে কথা বলুন — প্রথম পরামর্শ থেকে চিকিৎসার প্রতিটি ধাপ তাঁর তত্ত্বাবধানে।"
            : "Speak to the specialist herself — from the first consultation through every step of your treatment."
        }
      />
    </>
  );
}
