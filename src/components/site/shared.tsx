"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, ChevronRight, Clock3 } from "lucide-react";
import { useRouter } from "@/lib/router";
import { DynamicIcon, categoryColors } from "@/components/site/icon-map";
import { Reveal } from "@/components/site/motion";
import type { Service, Doctor } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Page header (breadcrumb + eyebrow + title + subtitle)              */
/* ------------------------------------------------------------------ */

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumb: { label: string; to?: string }[];
}) {
  const { navigate } = useRouter();
  return (
    <section className="hero-mesh-dark relative overflow-hidden">
      <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-blue-200/80">
            {breadcrumb.map((item, i) => (
              <li key={item.label} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight className="h-3 w-3 text-blue-300/50" aria-hidden="true" />
                )}
                {item.to ? (
                  <a
                    href={`#${item.to}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.to!);
                    }}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-white">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
            {eyebrow}
          </span>
          <h1 className="font-heading mt-4 max-w-3xl text-3xl font-bold leading-tight text-white text-balance sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-blue-100/85 sm:text-lg">
              {description}
            </p>
          )}
        </motion.div>
      </div>
      {/* bottom wave */}
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
  );
}

/* ------------------------------------------------------------------ */
/*  Service card                                                        */
/* ------------------------------------------------------------------ */

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  const { navigate } = useRouter();
  const colors = categoryColors[service.category] ?? categoryColors.Restorative;

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="card-shine group relative flex h-full flex-col rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_2px_16px_-8px_rgba(0,32,96,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-blue/30 hover:shadow-[0_24px_50px_-16px_rgba(30,125,255,0.28)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bg} ${colors.text} ring-1 ${colors.ring} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
        >
          <DynamicIcon name={service.icon} className="h-7 w-7" />
        </span>
        <Badge variant="outline" className={`${colors.bg} ${colors.text} border-0 text-[10px] font-semibold uppercase tracking-wider`}>
          {service.category}
        </Badge>
      </div>

      <h3 className="font-heading mt-5 text-lg font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-blue">
        {service.name}
      </h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {service.tagline}
      </p>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
        {service.excerpt}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-blue-50 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Clock3 className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
          {service.duration}
        </span>
        <a
          href={`#/services/${service.slug}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/services/${service.slug}`);
          }}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue transition-all duration-300 hover:gap-2.5"
          aria-label={`Learn more about ${service.name}`}
        >
          Learn more
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  Doctor card                                                         */
/* ------------------------------------------------------------------ */

export function DoctorCard({ doctor, index = 0 }: { doctor: Doctor; index?: number }) {
  const { navigate } = useRouter();
  const initials = doctor.name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col items-center overflow-hidden rounded-3xl border border-blue-100/80 bg-white p-7 text-center shadow-[0_2px_16px_-8px_rgba(0,32,96,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-16px_rgba(0,32,96,0.25)]"
    >
      {/* top accent */}
      <span
        className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${doctor.accent}, #002060)` }}
        aria-hidden="true"
      />
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-blue-50 shadow-inner transition-transform duration-500 group-hover:scale-105">
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

      <h3 className="font-heading mt-5 text-lg font-bold text-brand-navy">
        {doctor.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-brand-blue">{doctor.role}</p>
      <p className="mt-2 flex flex-wrap justify-center gap-1.5">
        {doctor.credentials.slice(0, 3).map((c) => (
          <Badge key={c} variant="secondary" className="bg-blue-50 text-[10px] font-medium text-brand-navy">
            {c}
          </Badge>
        ))}
      </p>

      <div className="mt-4 flex items-center gap-1" aria-label={`Rating ${doctor.rating} out of 5`}>
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
        <span className="text-sm font-semibold text-brand-navy">{doctor.rating}</span>
        <span className="text-xs text-slate-400">
          • {doctor.experienceYears}+ yrs • {doctor.patientsTreated.toLocaleString()}+ patients
        </span>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/doctors/${doctor.slug}`)}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-brand-blue ring-1 ring-blue-100 transition-all duration-300 hover:bg-brand-blue hover:text-white hover:ring-brand-blue"
      >
        View Profile
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA banner                                                          */
/* ------------------------------------------------------------------ */

export function CtaBanner({
  title = "Ready for a healthier, brighter smile?",
  description = "Book your consultation with our specialist dentists today — modern technology, pain-free care and transparent pricing, all under one roof in Uttara.",
}: {
  title?: string;
  description?: string;
}) {
  const { navigate } = useRouter();
  return (
    <section className="relative overflow-hidden" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="hero-mesh-dark relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-center shadow-2xl shadow-navy-900/30 sm:px-12">
            <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
            <span
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-blue/25 blur-3xl"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative">
              <h2
                id="cta-heading"
                className="font-heading mx-auto max-w-2xl text-3xl font-bold leading-tight text-white text-balance sm:text-4xl"
              >
                {title}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-100/85">
                {description}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/appointment")}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-brand-navy shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  Book Appointment Now
                </button>
                <a
                  href="tel:+8801715027522"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white ring-2 ring-white/40 transition-all duration-300 hover:bg-white/10 hover:ring-white"
                >
                  Call 01715-027522
                </a>
              </div>
              <p className="mt-6 text-xs text-blue-200/70">
                Open Saturday–Thursday, 10:00 AM – 9:00 PM • Same-week appointments available
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
