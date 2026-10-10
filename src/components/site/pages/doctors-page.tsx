"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Languages,
  Quote,
  Star,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { doctors, getDoctor } from "@/lib/data/doctors";
import { testimonials } from "@/lib/data/doctors";
import { PageHeader, DoctorCard, CtaBanner } from "@/components/site/shared";
import { SectionHeading, Reveal } from "@/components/site/motion";
import { DynamicIcon } from "@/components/site/icon-map";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotFoundPage } from "@/components/site/pages/not-found-page";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  DOCTORS LIST PAGE                                                  */
/* ------------------------------------------------------------------ */

export function DoctorsPage() {
  usePageMeta({
    title: "Our Doctors — Specialist Dentists in Uttara, Dhaka",
    description:
      "Meet the verified medical board of Aristocrat Dental Care: Dr. Shazia Khanam, Dr. Abdur Rahim, Dr. Jumla Binte Jafor & Dr. Israt Jahan Rimi — BDS/MDS qualified dental specialists.",
  });

  const doctorsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Doctors at Aristocrat Dental Care & Orthodontic Center",
    itemListElement: doctors.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Physician",
        name: d.name,
        jobTitle: d.role,
        medicalSpecialty: d.department,
        url: `https://aristocratdentalcarebd.com/#/doctors/${d.slug}`,
        worksFor: { "@type": "Dentist", name: site.name },
      },
    })),
  };

  return (
    <>
      <PageHeader
        eyebrow="Verified Medical Board"
        title="World-class specialists, neighborhood warmth"
        description="Specialists in orthodontics, endodontics, oral surgery and cosmetic dentistry — all BMDC-verified, all devoted to gentle care."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Doctors" }]}
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
              {[
                {
                  icon: "BadgeCheck",
                  title: "BMDC Verified",
                  text: "Every doctor is registered with the Bangladesh Medical & Dental Council.",
                },
                {
                  icon: "GraduationCap",
                  title: "BDS / MDS / PGT",
                  text: "University-qualified consultants with postgraduate specialist training.",
                },
                {
                  icon: "UserRound",
                  title: "Patient-First",
                  text: "Doctors who explain everything clearly and pace treatment to your comfort.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm ring-1 ring-blue-100">
                    <DynamicIcon name={item.icon} className="h-5.5 w-5.5" />
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
        title="Consult our specialists this week"
        description="Same-week appointments available — book online in two minutes or call our hotline."
      />
      {doctorsJsonLd ? null : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  DOCTOR DETAIL PAGE                                                 */
/* ------------------------------------------------------------------ */

export function DoctorDetailPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
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
  const others = doctors.filter((d) => d.slug !== doctor.slug);
  const docTestimonials = testimonials.filter((t) =>
    doctor.name.toLowerCase().includes("shazia")
      ? t.name !== "সাদিয়া আক্তার"
      : true
  ).slice(0, 3);

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
                  Home
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
                  Doctors
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
                BMDC Verified
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                Available for Consultation
              </span>
              <h1 className="font-heading mt-4 text-3xl font-bold leading-tight text-white text-balance sm:text-4xl lg:text-[2.9rem]">
                {doctor.name}
              </h1>
              <p className="mt-2 text-lg font-medium text-amber-300">{doctor.role}</p>
              <p className="mt-1 text-sm text-blue-200/85">{doctor.department}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {doctor.credentials.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15"
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                    {c}
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
                  Book Consultation
                </button>
                <a
                  href={`tel:${site.phoneRaw}`}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white ring-2 ring-white/40 transition-all duration-300 hover:bg-white/10"
                >
                  Call {site.phone}
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
                    { value: `${doctor.experienceYears}+`, label: "Years Experience" },
                    { value: `${doctor.patientsTreated.toLocaleString()}+`, label: "Patients Treated" },
                    { value: `${doctor.rating}/5`, label: "Expert Rating" },
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
                  Professional Biography
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">
                  {doctor.bio}
                </p>
              </Reveal>

              {/* specializations */}
              <Reveal className="mt-10">
                <h3 className="font-heading text-lg font-bold text-brand-navy">
                  Areas of Specialization
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
                    What patients say
                  </h3>
                  <div className="mt-4 space-y-4">
                    {docTestimonials.map((t) => (
                      <figure
                        key={t.name}
                        className="rounded-2xl border border-blue-100/80 bg-white p-5"
                      >
                        <Quote className="h-5 w-5 rotate-180 text-brand-blue/60" aria-hidden="true" />
                        <blockquote
                          className={`mt-2 text-sm leading-relaxed text-slate-600 ${
                            t.language === "bn" ? "font-heading" : ""
                          }`}
                        >
                          {t.text.length > 220 ? `${t.text.slice(0, 220)}…` : t.text}
                        </blockquote>
                        <figcaption className="mt-3 flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-amber-200">
                            <AvatarFallback className="text-xs font-bold text-brand-navy">
                              {t.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            <span className="block text-xs font-bold text-brand-navy">
                              {t.name}
                            </span>
                            <span className="flex items-center gap-0.5" aria-label="5 star review">
                              {Array.from({ length: t.rating }).map((_, i) => (
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
                      Consultation Details
                    </h3>
                    <dl className="mt-4 space-y-4 text-sm">
                      <div className="flex items-start justify-between gap-4 border-t border-blue-50 pt-3.5">
                        <dt className="text-slate-500">Department</dt>
                        <dd className="text-right font-semibold text-brand-navy">
                          {doctor.department}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-4 border-t border-blue-50 pt-3.5">
                        <dt className="flex items-center gap-1.5 text-slate-500">
                          <Languages className="h-4 w-4" aria-hidden="true" />
                          Languages
                        </dt>
                        <dd className="text-right font-semibold text-brand-navy">
                          {doctor.languages.join(", ")}
                        </dd>
                      </div>
                      <div className="border-t border-blue-50 pt-3.5">
                        <dt className="text-slate-500">Consultation Days</dt>
                        <dd className="mt-2 flex flex-wrap gap-1.5">
                          {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                            (day) => {
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
                                  {day.slice(0, 3)}
                                </span>
                              );
                            }
                          )}
                        </dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => navigate(`/appointment?doctor=${doctor.slug}`)}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-blue py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/40 transition-all duration-300 hover:bg-brand-blue-light"
                    >
                      <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                      Book Your Slot Now
                    </button>
                  </div>

                  {/* other doctors */}
                  <div className="rounded-3xl border border-blue-100/80 bg-ice p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-base font-bold text-brand-navy">
                        Other Specialists
                      </h3>
                      <a
                        href="#/doctors"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/doctors");
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-brand-navy"
                      >
                        View all
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {others.map((d) => (
                        <li key={d.slug}>
                          <a
                            href={`#/doctors/${d.slug}`}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/doctors/${d.slug}`);
                            }}
                            className="group flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-blue-100/60 transition-all duration-300 hover:ring-brand-blue/40"
                          >
                            <span
                              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-heading text-sm font-bold text-white"
                              style={{ background: d.accent }}
                            >
                              {d.name
                                .replace("Dr. ", "")
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-brand-navy group-hover:text-brand-blue">
                                {d.name}
                              </span>
                              <span className="block truncate text-xs text-slate-500">
                                {d.role}
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
        title={`Consult ${doctor.name} this week`}
        description={`Book a consultation with ${doctor.name} — ${site.hours}. Same-week slots available.`}
      />
    </>
  );
}
