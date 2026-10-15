"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Star,
  Stethoscope,
  Target,
  Telescope,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { useBundle } from "@/components/site/content-provider";
import { pickBn, testimonials } from "@/lib/content/shared";
import { PageHeader, CtaBanner, DoctorCard } from "@/components/site/shared";
import {
  AnimatedCounter,
  Reveal,
  SectionHeading,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion";
import { TestimonialMarquee } from "@/components/site/testimonial-marquee";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  ABOUT PAGE (EN / বাংলা) — content served live from the CMS bundle  */
/* ------------------------------------------------------------------ */

/* Founder medallion initials, derived from the CMS English name.
   Honorifics ("Dr.", "ডা.") are skipped so "Dr. Shazia Khanam" → "SK",
   matching the legacy hardcoded badge. */
function founderInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const real = words.filter((w) => !w.endsWith("."));
  const base = real.length > 0 ? real : words;
  const first = base[0]?.charAt(0) ?? "";
  const second = base[1]?.charAt(0) ?? base[0]?.charAt(1) ?? "";
  return (first + second).toUpperCase();
}

export function AboutPage() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const { home, about, settings, doctors } = useBundle();
  const bn = lang === "bn";
  const t = d.about;

  /* Founder's live doctor profile slug (Person url), when one matches. */
  const founderDoctorSlug = doctors.find(
    (doc) => doc.name === about.founderName
  )?.slug;

  /* SEO/AEO: AboutPage + founder Person + BreadcrumbList, built from the
     LIVE CMS bundle (founder name/role, page description, doctor slug). */
  const aboutJsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": "https://aristocratdentalcarebd.com/about#webpage",
        url: "https://aristocratdentalcarebd.com/about",
        name: `About ${settings.name}`,
        description: about.description.replace("{site}", settings.name),
        inLanguage: "en",
        isPartOf: { "@id": "https://aristocratdentalcarebd.com/#website" },
        mainEntity: { "@id": "https://aristocratdentalcarebd.com/#organization" },
      },
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": "https://aristocratdentalcarebd.com/#founder",
        name: about.founderName,
        jobTitle: about.founderRole,
        worksFor: { "@id": "https://aristocratdentalcarebd.com/#organization" },
        ...(founderDoctorSlug
          ? { url: `https://aristocratdentalcarebd.com/doctors/${founderDoctorSlug}` }
          : {}),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://aristocratdentalcarebd.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About Us",
            item: "https://aristocratdentalcarebd.com/about",
          },
        ],
      },
    ],
    [about.description, about.founderName, about.founderRole, settings.name, founderDoctorSlug]
  );

  usePageMeta({
    title: "About Us — Our Story, Mission & Values",
    description:
      "Welcome to Aristocrat Dental Care & Orthodontic Center, Uttara Dhaka — combining art, medical science and compassion under the leadership of Dr. Shazia Khanam. 50,000+ happy patients.",
    jsonLd: aboutJsonLd,
  });

  /* Story stats live in the CMS (value + bilingual label); digits are
     converted to Bangla numerals in বাংলা mode, matching the rest of
     the page (e.g. the founder rating). */
  const storyStats = about.storyStats.map((stat) => ({
    value: bn ? toBnDigits(stat.value) : stat.value,
    label: pickBn(stat.label, stat.labelBn, bn),
  }));

  return (
    <>
      <PageHeader
        eyebrow={pickBn(about.eyebrow, about.eyebrowBn, bn)}
        title={pickBn(about.title, about.titleBn, bn)}
        description={pickBn(about.description, about.descriptionBn, bn).replace("{site}", settings.name)}
        breadcrumb={[
          { label: d.chrome.nav.home, to: "/" },
          { label: pickBn(about.eyebrow, about.eyebrowBn, bn) },
        ]}
      />

      {/* ============ STORY ============ */}
      <section className="py-16 sm:py-20" aria-labelledby="story-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="relative">
                <div className="hero-mesh-dark overflow-hidden rounded-[2rem] p-10 shadow-2xl shadow-navy-900/25">
                  <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300 ring-1 ring-white/15">
                    <Award className="h-3.5 w-3.5" aria-hidden="true" />
                    {pickBn(about.storyBadge, about.storyBadgeBn, bn)}
                  </span>
                  <blockquote className="font-heading relative mt-8 text-2xl font-bold leading-snug text-white sm:text-[1.75rem]">
                    {pickBn(about.storyQuote, about.storyQuoteBn, bn)}
                  </blockquote>
                  {storyStats.length > 0 ? (
                  <div
                    className="relative mt-10 grid gap-4"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(
                        Math.max(storyStats.length, 1),
                        4
                      )}, minmax(0, 1fr))`,
                    }}
                  >
                    {storyStats.map((stat, i) => (
                      <div
                        key={`${stat.label}-${i}`}
                        className="rounded-2xl bg-white/8 p-4 text-center ring-1 ring-white/12"
                      >
                        <span className="font-heading block text-2xl font-bold text-white">
                          {stat.value}
                        </span>
                        <span className="mt-1 block text-[11px] text-blue-200/80">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  ) : null}
                </div>
                <div className="animate-float-soft absolute -right-3 -top-5 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-blue-100 sm:-right-6">
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    <span>
                      <span className="block font-heading text-sm font-bold text-brand-navy">
                        {t.ratingChipTitle}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {t.ratingChipNote}
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </Reveal>

            <div>
              <SectionHeading
                align="left"
                eyebrow={t.storyEyebrow}
                title={t.storyTitle}
              />
              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">
                <Reveal delay={0.05}>
                  <p>
                    {t.storyP1a.replace("{site}", settings.name)}
                    <strong className="text-brand-navy">
                      {pickBn(about.founderName, about.founderNameBn, bn)}
                    </strong>
                    {t.storyP1b}
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <p>{pickBn(about.storyP2, about.storyP2Bn, bn)}</p>
                </Reveal>
                <Reveal delay={0.15}>
                  <ul className="grid gap-3 pt-2 sm:grid-cols-2">
                    {t.storyChecklist.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm font-medium text-slate-700"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MISSION & VISION ============ */}
      <section className="relative bg-ice py-16 sm:py-20" aria-labelledby="mission-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={pickBn(about.missionEyebrow, about.missionEyebrowBn, bn)}
            title={pickBn(about.missionTitle, about.missionTitleBn, bn)}
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <article className="card-shine group h-full rounded-3xl border border-blue-100/80 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-18px_rgba(30,125,255,0.3)] sm:p-10">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-lg shadow-blue-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Target className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="font-heading mt-6 text-2xl font-bold text-brand-navy">
                  {pickBn(about.missionHeading, about.missionHeadingBn, bn)}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  {pickBn(about.missionText, about.missionTextBn, bn)}
                </p>
              </article>
            </Reveal>
            <Reveal delay={0.1}>
              <article className="card-shine group h-full rounded-3xl border border-blue-100/80 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-18px_rgba(0,32,96,0.3)] sm:p-10">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-lg shadow-navy-900/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  <Telescope className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="font-heading mt-6 text-2xl font-bold text-brand-navy">
                  {pickBn(about.visionHeading, about.visionHeadingBn, bn)}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  {pickBn(about.visionText, about.visionTextBn, bn)}
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ TIMELINE ============ */}
      {about.timeline.length > 0 ? (
      <section className="relative py-16 sm:py-20" aria-labelledby="timeline-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={pickBn(about.journeyEyebrow, about.journeyEyebrowBn, bn)}
            title={pickBn(about.journeyTitle, about.journeyTitleBn, bn)}
          />
          <div className="relative mt-14">
            <span
              className="absolute left-[27px] top-4 hidden h-[calc(100%-32px)] w-0.5 bg-gradient-to-b from-brand-blue via-brand-blue/40 to-transparent sm:block"
              aria-hidden="true"
            />
            <ol className="space-y-10">
              {about.timeline.map((item, i) => (
                <li key={`${item.year}-${i}`}>
                  <Reveal delay={i * 0.06}>
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-navy font-heading text-sm font-bold text-white shadow-lg shadow-navy-900/30 ring-4 ring-white sm:flex">
                        {bn ? toBnDigits(item.year) : item.year}
                      </span>
                      <div className="rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_10px_35px_-18px_rgba(0,32,96,0.18)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_-18px_rgba(30,125,255,0.35)] sm:ml-4 sm:flex-1 sm:p-7">
                        <span className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-brand-blue sm:hidden">
                          {bn ? toBnDigits(item.year) : item.year}
                        </span>
                        <h3 className="font-heading mt-1 flex items-center gap-2 text-lg font-bold text-brand-navy sm:mt-0">
                          <DynamicIcon
                            name={item.icon}
                            className="h-4.5 w-4.5 shrink-0 text-brand-blue"
                          />
                          {pickBn(item.title, item.titleBn, bn)}
                        </h3>
                        <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                          {pickBn(item.description, item.descriptionBn, bn)}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      ) : null}

      {/* ============ FOUNDER SPOTLIGHT ============ */}
      <section className="relative bg-brand-navy py-16 sm:py-20" aria-labelledby="founder-heading">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="relative mx-auto max-w-sm">
                <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-blue/30 to-transparent p-1.5">
                  {about.founderImage ? (
                    /* Founder portrait — uploaded from the admin panel
                       (Content → About → Founder photo). Falls back to the
                       elegant initials medallion when no photo is set.     */
                    <figure className="relative aspect-[4/4.6] overflow-hidden rounded-[1.8rem]">
                      <Image
                        src={about.founderImage}
                        alt={
                          about.founderImageAlt ||
                          pickBn(about.founderName, about.founderNameBn, bn)
                        }
                        fill
                        sizes="(min-width: 1024px) 384px, (min-width: 640px) 60vw, 90vw"
                        className="object-cover object-top"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/95 via-brand-navy/35 to-transparent"
                        aria-hidden="true"
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 p-6 pt-14 text-center">
                        <h3 className="font-heading text-2xl font-bold text-white drop-shadow-sm">
                          {pickBn(about.founderName, about.founderNameBn, bn)}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-blue-200">
                          {pickBn(about.founderRole, about.founderRoleBn, bn)}
                        </p>
                        <div
                          className="mt-4 flex items-center justify-center gap-2"
                          aria-label="Rating 4.9"
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-amber-400 text-amber-400"
                              aria-hidden="true"
                            />
                          ))}
                          <span className="text-sm font-semibold text-white">
                            {bn ? "৪.৯" : "4.9"}
                          </span>
                        </div>
                      </figcaption>
                    </figure>
                  ) : (
                  <div className="flex aspect-[4/4.6] flex-col items-center justify-center rounded-[1.8rem] bg-white/5 p-8 text-center ring-1 ring-white/10">
                    <span className="inline-flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 font-heading text-4xl font-bold text-brand-navy shadow-2xl shadow-amber-500/30">
                      {founderInitials(about.founderName)}
                    </span>
                    <h3 className="font-heading mt-6 text-2xl font-bold text-white">
                      {pickBn(about.founderName, about.founderNameBn, bn)}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-blue-200">
                      {pickBn(about.founderRole, about.founderRoleBn, bn)}
                    </p>
                    <div className="mt-5 flex items-center gap-2" aria-label="Rating 4.9">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />
                      ))}
                      <span className="text-sm font-semibold text-white">{bn ? "৪.৯" : "4.9"}</span>
                    </div>
                  </div>
                  )}
                </div>
                <div className="animate-float-soft absolute -bottom-5 -right-3 rounded-2xl bg-white p-4 shadow-xl sm:-right-8">
                  <span className="flex items-center gap-3">
                    <Stethoscope className="h-6 w-6 text-brand-blue" aria-hidden="true" />
                    <span>
                      <span className="block font-heading text-sm font-bold text-brand-navy">
                        {pickBn(about.founderChipTitle, about.founderChipTitleBn, bn)}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {pickBn(about.founderChipNote, about.founderChipNoteBn, bn)}
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </Reveal>

            <div>
              <SectionHeading
                dark
                align="left"
                eyebrow={t.founderEyebrow}
                title={
                  <>
                    {t.founderTitleA}
                    <span className="gold-text">{t.founderTitleB}</span>
                  </>
                }
              />
              <Reveal className="mt-6">
                <p className="text-base leading-relaxed text-blue-100/85">
                  {bn
                    ? "অ্যারিস্টোক্র্যাট ডেন্টাল কেয়ারের কেন্দ্রে আছেন ডা. শাজিয়া খানম — নিজের কাজের প্রতি নিবেদিতপ্রাণ, অত্যন্ত দক্ষ ও অভিজ্ঞ একজন ডেন্টিস্ট। ক্রমাগত শেখার আগ্রহ আর বিখ্যাত কোমল স্পর্শ নিয়ে ডা. খানম তৈরি করেন ব্যক্তিগত চিকিৎসা পরিকল্পনা — যা প্রতিটি রোগীর স্বতন্ত্র প্রয়োজন মেটায়।"
                    : "At the heart of Aristocrat Dental Care is Dr. Shazia Khanam — a highly skilled and experienced dentist dedicated to her craft. With a passion for continued learning and a famously gentle touch, Dr. Khanam specializes in creating personalized treatment plans that address the unique needs of every patient."}
                </p>
              </Reveal>
              <StaggerContainer className="mt-8 space-y-4">
                {about.founderItems.map((item, i) => (
                  <StaggerItem key={i}>
                    <div className="flex items-start gap-4 rounded-2xl bg-white/8 p-5 ring-1 ring-white/12 transition-colors duration-300 hover:bg-white/12">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/90 text-brand-navy">
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="font-heading block text-sm font-bold text-white">
                          {pickBn(item.title, item.titleBn, bn)}
                        </span>
                        <span className="mt-1 block text-sm text-blue-100/80">
                          {pickBn(item.text, item.textBn, bn)}
                        </span>
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
              <Reveal className="mt-8">
                <Button
                  asChild
                  className="rounded-full bg-white px-7 py-4 text-sm font-bold text-brand-navy shadow-xl hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  <a
                    href="/doctors/dr-shazia-khanam"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/doctors/dr-shazia-khanam");
                    }}
                    className="inline-flex items-center gap-2"
                  >
                    {t.viewFullProfile}
                  </a>
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VALUES ============ */}
      <section className="py-16 sm:py-20" aria-labelledby="values-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={pickBn(about.valuesEyebrow, about.valuesEyebrowBn, bn)}
            title={pickBn(about.valuesTitle, about.valuesTitleBn, bn)}
          />
          <StaggerContainer className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {about.values.map((v, i) => (
              <StaggerItem key={i}>
                <div className="card-shine group h-full rounded-2xl border border-blue-100/70 bg-white p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_18px_40px_-16px_rgba(30,125,255,0.3)]">
                  <span className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <DynamicIconImport name={v.icon} />
                  </span>
                  <h3 className="font-heading mt-4 text-base font-bold text-brand-navy">
                    {pickBn(v.title, v.titleBn, bn)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {pickBn(v.description, v.descriptionBn, bn)}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="relative bg-ice py-14" aria-label="Clinic statistics">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <StaggerContainer className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
            {home.stats.map((stat, i) => (
              <StaggerItem key={i}>
                <span className="font-heading block text-3xl font-bold text-brand-navy sm:text-4xl">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals ?? 0}
                  />
                </span>
                <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  {pickBn(stat.label, stat.labelBn, bn)}
                </span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ DOCTORS ============ */}
      <section className="py-16 sm:py-20" aria-labelledby="team-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={t.specialistsEyebrow}
            title={pickBn(about.specialistsTitle, about.specialistsTitleBn, bn)}
            description={pickBn(about.specialistsDescription, about.specialistsDescriptionBn, bn)}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((doctor, i) => (
              <DoctorCard key={doctor.slug} doctor={doctor} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="relative bg-ice py-16 sm:py-20" aria-labelledby="about-testimonials">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={t.trustEyebrow}
            title={t.trustTitle}
          />
          <Reveal className="mt-12">
            <TestimonialMarquee testimonials={testimonials} />
          </Reveal>
        </div>
      </section>

      <CtaBanner
        title={pickBn(about.ctaTitle, about.ctaTitleBn, bn)}
        description={pickBn(about.ctaDescription, about.ctaDescriptionBn, bn)}
      />
    </>
  );
}

/* local icon helper to avoid circular imports */
import { DynamicIcon } from "@/components/site/icon-map";
function DynamicIconImport({ name }: { name: string }) {
  return <DynamicIcon name={name} className="h-6 w-6" />;
}
