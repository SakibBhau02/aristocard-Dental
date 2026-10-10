"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  CalendarCheck,
  Camera,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Phone,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { services, getFeaturedServices } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";
import { testimonials } from "@/lib/data/doctors";
import { generalFaqs } from "@/lib/data/faqs";
import { DynamicIcon } from "@/components/site/icon-map";
import {
  AnimatedCounter,
  Reveal,
  SectionHeading,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion";
import { ServiceCard, DoctorCard, CtaBanner, QuizTeaser } from "@/components/site/shared";
import { TestimonialCarousel } from "@/components/site/testimonial-carousel";
import { BeforeAfterSlider } from "@/components/site/before-after-slider";
import { PatientReviews } from "@/components/site/patient-reviews";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  HOME PAGE (EN / বাংলা)                                             */
/* ------------------------------------------------------------------ */

const heroFaqsJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: generalFaqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export function HomePage() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();

  usePageMeta({
    title:
      "Aristocrat Dental Care & Orthodontic Center | Best Dental Clinic in Uttara, Dhaka",
    description:
      "Modern & well-equipped dental clinic in Uttara, Dhaka. 50,000+ happy patients. Implants, Invisalign, braces, root canal, smile design & kids dentistry. Book: 01715-027522.",
    jsonLd: heroFaqsJsonLd,
  });

  const featured = getFeaturedServices();
  const bn = lang === "bn";

  return (
    <>
      {/* ============ HERO ============ */}
      <section
        className="hero-mesh relative overflow-hidden"
        aria-labelledby="hero-heading"
      >
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        {/* ambient depth blobs (slow drift) */}
        <span
          className="animate-glow-drift pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl"
          style={{ animationDelay: "0s" }}
          aria-hidden="true"
        />
        <span
          className="animate-glow-drift pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-brand-teal/10 blur-3xl"
          style={{ animationDelay: "-8s" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:pb-28 lg:pt-20">
          {/* Left copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue ring-1 ring-blue-100"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {d.home.hero.badge}
            </motion.div>

            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-heading mt-6 text-4xl font-bold leading-[1.08] text-brand-navy text-balance sm:text-5xl lg:text-[3.6rem]"
            >
              {d.home.hero.titleA}{" "}
              <span className="relative inline-block">
                <span className="gradient-text text-shimmer">{d.home.hero.titleB}</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full text-amber-400"
                  viewBox="0 0 220 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 9C60 3 160 3 217 8"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg"
            >
              {d.home.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                asChild
                size="lg"
                className="btn-shine group relative overflow-hidden rounded-full bg-brand-blue px-8 py-6 text-base font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-navy hover:shadow-2xl"
              >
                <a
                  href="#/appointment"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/appointment");
                  }}
                  className="inline-flex items-center gap-2"
                >
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  {d.home.hero.ctaBook}
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-brand-blue/30 bg-white/70 px-8 py-6 text-base font-bold text-brand-navy backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue hover:bg-blue-50"
              >
                <a
                  href="#/services"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/services");
                  }}
                  className="inline-flex items-center gap-2"
                >
                  <PlayCircle className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                  {d.home.hero.ctaExplore}
                </a>
              </Button>
            </motion.div>

            {/* hero mini trust row */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600"
            >
              {d.home.hero.trust.map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-lg"
          >
            {/* rotating accent ring */}
            <span
              className="animate-spin-slow pointer-events-none absolute -right-7 -top-7 z-10 h-20 w-20 rounded-full border-2 border-dashed border-brand-blue/30"
              aria-hidden="true"
            />
            {/* main card */}
            <div className="hero-mesh-dark noise relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl shadow-navy-900/40 sm:p-10">
              {/* clinic photo layer */}
              <Image
                src="/images/hero-clinic.png"
                alt="Modern treatment room at Aristocrat Dental Care clinic"
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 512px"
                className="object-cover opacity-35"
              />
              <span
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-brand-navy/80 to-brand-navy"
                aria-hidden="true"
              />
              <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300 ring-1 ring-white/15">
                  <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
                  {d.home.hero.cardBadge}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-white">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  4.9
                </span>
              </div>

              <div className="relative mt-8 space-y-4">
                {d.home.hero.cardItems.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-between rounded-2xl bg-white/8 px-5 py-4 ring-1 ring-white/12 backdrop-blur-sm transition-colors duration-300 hover:bg-white/14"
                  >
                    <span>
                      <span className="block font-heading text-sm font-bold text-white sm:text-base">
                        {item.title}
                      </span>
                      <span className="block text-xs text-blue-200/80">{item.note}</span>
                    </span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg shadow-blue-500/40">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* doctor chip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.5 }}
                className="relative mt-8 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-amber-400/15 to-transparent p-4 ring-1 ring-amber-300/20 backdrop-blur-sm"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/90 font-heading text-lg font-bold text-brand-navy">
                  SK
                </span>
                <span>
                  <span className="block font-heading text-sm font-bold text-white">
                    Dr. Shazia Khanam
                  </span>
                  <span className="block text-xs text-blue-200/85">
                    {d.home.hero.doctorRole}
                  </span>
                </span>
              </motion.div>
            </div>

            {/* floating badges */}
            <motion.div
              className="animate-float-soft absolute -left-4 top-10 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-blue-100 sm:block lg:-left-10"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <span className="flex items-center gap-2.5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-heading text-sm font-bold text-brand-navy">{d.home.hero.badge1Title}</span>
                  <span className="block text-[11px] text-slate-500">{d.home.hero.badge1Note}</span>
                </span>
              </span>
            </motion.div>

            <motion.div
              className="animate-float-soft absolute -bottom-6 -right-2 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-blue-100 sm:block lg:-right-8"
              style={{ animationDelay: "1.4s" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.35, duration: 0.5 }}
            >
              <span className="flex items-center gap-2.5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-heading text-sm font-bold text-brand-navy">{d.home.hero.badge2Title}</span>
                  <span className="block text-[11px] text-slate-500">{d.home.hero.badge2Note}</span>
                </span>
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <motion.a
          href="#stats"
          className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs font-medium text-slate-500 lg:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          aria-label="Scroll to statistics"
        >
          {d.home.hero.scroll}
          <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
        </motion.a>
      </section>

      {/* ============ STATS ============ */}
      <section id="stats" className="relative -mt-2 bg-white" aria-label="Clinic statistics">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <StaggerContainer className="card-accent-top relative grid grid-cols-2 gap-4 rounded-[2rem] border border-blue-100/70 bg-white/80 p-6 shadow-[0_20px_60px_-30px_rgba(0,32,96,0.25)] backdrop-blur sm:p-8 lg:grid-cols-4">
            {[
              { icon: Users, value: 50000, suffix: "+", decimals: 0, tone: "text-brand-blue bg-blue-50 ring-blue-100" },
              { icon: Sparkles, value: 11, suffix: "+", decimals: 0, tone: "text-brand-teal bg-teal-50 ring-teal-100" },
              { icon: Stethoscope, value: 4, suffix: "+", decimals: 0, tone: "text-brand-navy bg-blue-50 ring-blue-100" },
              { icon: Star, value: 4.9, suffix: "/5", decimals: 1, tone: "text-amber-500 bg-amber-50 ring-amber-100" },
            ].map((stat, i) => (
              <StaggerItem key={i} className="text-center">
                <span
                  className={`mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${stat.tone}`}
                  aria-hidden="true"
                >
                  <stat.icon className="h-5 w-5" />
                </span>
                <span className="font-heading block text-3xl font-bold text-brand-navy sm:text-4xl">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={bn ? undefined : stat.suffix}
                    decimals={stat.decimals}
                    formatBn={bn ? { suffix: stat.suffix } : undefined}
                  />
                </span>
                <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-slate-500 sm:text-sm">
                  {d.home.stats[i].label}
                </span>
                {i > 0 && (
                  <span
                    className="absolute top-1/2 hidden h-14 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-blue-100 to-transparent lg:block"
                    style={{ left: `${(i / 4) * 100}%` }}
                    aria-hidden="true"
                  />
                )}
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ SERVICES MARQUEE ============ */}
      <section
        className="marquee-fade mt-10 overflow-hidden border-y border-blue-100/60 bg-ice py-4"
        aria-hidden="true"
      >
        <div className="animate-marquee flex w-max items-center gap-8">
          {[...services, ...services].map((s, i) => (
            <span
              key={`${s.slug}-${i}`}
              className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-brand-navy/70"
            >
              <DynamicIcon name={s.icon} className="h-4 w-4 text-brand-blue" />
              {bn && s.shortNameBn ? s.shortNameBn : s.name}
              <span className="ml-6 h-1 w-1 rounded-full bg-brand-blue/40" />
            </span>
          ))}
        </div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="section-wash relative py-20 sm:py-24" aria-labelledby="why-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            {/* Left visual */}
            <Reveal className="relative order-2 lg:order-1">
              <div className="relative mx-auto max-w-md">
                <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-navy-900/20 ring-1 ring-blue-100">
                  <div className="hero-mesh-dark noise flex aspect-[4/5] flex-col justify-between p-8">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300 ring-1 ring-white/15">
                      <Award className="h-3.5 w-3.5" aria-hidden="true" />
                      {d.home.why.premiumBadge}
                    </span>
                    <div>
                      <p className="font-heading text-2xl font-bold leading-snug text-white">
                        {d.home.why.quote}
                      </p>
                      <p className="mt-3 text-sm text-blue-200/85">
                        {d.home.why.quoteBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {doctors.slice(0, 4).map((doc) => (
                        <span
                          key={doc.slug}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-xs font-bold text-white ring-2 ring-white/25"
                          title={doc.name}
                        >
                          {doc.name
                            .replace("Dr. ", "")
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                      ))}
                      <span className="text-xs text-blue-200/80">
                        {d.home.why.plusSpecialists}
                      </span>
                    </div>
                  </div>
                </div>
                {/* floating rating card */}
                <div className="animate-float-soft absolute -right-4 -top-4 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-blue-100 sm:-right-8">
                  <span className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-brand-navy">
                    {d.home.why.ratingNote}
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Right content */}
            <div className="order-1 lg:order-2">
              <SectionHeading
                align="left"
                eyebrow={d.home.why.eyebrow}
                title={
                  <>
                    {d.home.why.titleA}
                    <span className="gradient-text">{d.home.why.titleB}</span>
                  </>
                }
                description={d.home.why.description}
              />
              <StaggerContainer className="mt-10 grid gap-4 sm:grid-cols-2">
                {d.home.why.highlights.map((h, i) => (
                  <StaggerItem key={h.title}>
                    <div className="card-shine group h-full rounded-2xl border border-blue-100/70 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_18px_40px_-16px_rgba(30,125,255,0.3)]">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                        <DynamicIcon
                          name={["ShieldCheck", "Microscope", "HeartHandshake", "BadgeCheck"][i]}
                          className="h-6 w-6"
                        />
                      </span>
                      <h3 className="font-heading mt-4 text-base font-bold text-brand-navy">
                        {h.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {h.description}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SERVICES PREVIEW ============ */}
      <section className="relative bg-ice py-20 sm:py-24" aria-labelledby="services-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={d.home.services.eyebrow}
            title={
              <>
                {d.home.services.titleA}
                <span className="gradient-text">{d.home.services.titleB}</span>
              </>
            }
            description={d.home.services.description}
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map((service, i) => (
              <ServiceCard key={service.slug} service={service} index={i} />
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Button
              asChild
              size="lg"
              className="rounded-full border border-brand-blue/25 bg-white px-8 py-6 text-base font-bold text-brand-blue shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-brand-blue hover:text-white hover:shadow-xl hover:shadow-blue-500/30"
              variant="outline"
            >
              <a
                href="#/services"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/services");
                }}
                className="inline-flex items-center gap-2"
              >
                {d.home.services.viewAll}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </Button>
          </Reveal>

          {/* Smile Check — for visitors unsure where to start */}
          <Reveal className="mt-8" delay={0.08}>
            <QuizTeaser />
          </Reveal>
        </div>
      </section>

      {/* ============ FACILITY SHOWCASE ============ */}
      <section className="relative bg-brand-navy py-20 sm:py-24" aria-labelledby="facility-heading">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            dark
            eyebrow={d.home.facility.eyebrow}
            title={
              <>
                {d.home.facility.titleA}
                <span className="gold-text">{d.home.facility.titleB}</span>
              </>
            }
            description={d.home.facility.description}
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              {
                src: "/images/facility-tech.png",
                alt: "Treatment room with digital X-ray and intraoral scanner at Aristocrat Dental Care",
              },
              {
                src: "/images/facility-kids.png",
                alt: "Cheerful pediatric dental room designed for children at Aristocrat Dental Care",
              },
              {
                src: "/images/facility-sterile.png",
                alt: "Sterilization room with autoclave and sealed instrument pouches",
              },
            ].map((img, i) => (
              <motion.article
                key={img.src}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="zoom-img group overflow-hidden rounded-[1.75rem] bg-white/5 ring-1 ring-white/12 transition-all duration-500 hover:-translate-y-1.5 hover:ring-amber-300/30"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 1024px) 92vw, 440px"
                    className="object-cover"
                  />
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent"
                    aria-hidden="true"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-bold text-white transition-colors group-hover:text-amber-300">
                    {d.home.facility.cards[i].title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-blue-100/80">
                    {d.home.facility.cards[i].text}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SMILE GALLERY PREVIEW ============ */}
      <section className="section-wash relative py-20 sm:py-24" aria-labelledby="gallery-preview-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow={d.home.galleryPreview.eyebrow}
                title={
                  <>
                    {d.home.galleryPreview.titleA}
                    <span className="gradient-text">{d.home.galleryPreview.titleB}</span>
                  </>
                }
                description={d.home.galleryPreview.description}
              />
              <Reveal delay={0.15} className="mt-8">
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="rounded-full bg-brand-blue px-7 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy"
                  >
                    <a
                      href="#/gallery"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/gallery");
                      }}
                      className="inline-flex items-center gap-2"
                    >
                      <Camera className="h-4.5 w-4.5" aria-hidden="true" />
                      {d.home.galleryPreview.ctaGallery}
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-brand-blue/25 bg-white px-7 py-4 text-sm font-bold text-brand-blue hover:bg-blue-50"
                  >
                    <a
                      href="#/estimator"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/estimator");
                      }}
                      className="inline-flex items-center gap-2"
                    >
                      <Wallet className="h-4.5 w-4.5" aria-hidden="true" />
                      {d.home.galleryPreview.ctaEstimate}
                    </a>
                  </Button>
                </div>
              </Reveal>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative mx-auto w-full max-w-md">
                <BeforeAfterSlider
                  beforeSrc="/images/case-before-whitening.png"
                  afterSrc="/images/case-after-whitening.png"
                  beforeAlt="Smile before professional teeth whitening — stained teeth"
                  afterAlt="Smile after professional teeth whitening — bright radiant teeth"
                />
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-navy px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                  {d.home.galleryPreview.sliderChip}
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="section-wash relative py-20 sm:py-24" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={d.home.testimonials.eyebrow}
            title={
              <>
                {d.home.testimonials.titleA}
                <span className="gradient-text">{d.home.testimonials.titleB}</span>
              </>
            }
            description={d.home.testimonials.description}
          />
          <Reveal className="mt-12">
            <TestimonialCarousel testimonials={testimonials} />
          </Reveal>
        </div>
      </section>

      {/* ============ PATIENT REVIEWS (live, moderated) ============ */}
      <PatientReviews />

      {/* ============ DOCTORS PREVIEW ============ */}
      <section className="relative bg-brand-navy py-20 sm:py-24" aria-labelledby="doctors-heading">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            dark
            eyebrow={d.home.doctors.eyebrow}
            title={
              <>
                {d.home.doctors.titleA}
                <span className="gold-text">{d.home.doctors.titleB}</span>
              </>
            }
            description={d.home.doctors.description}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((doctor, i) => (
              <DoctorCard key={doctor.slug} doctor={doctor} index={i} />
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <a
              href="#/doctors"
              onClick={(e) => {
                e.preventDefault();
                navigate("/doctors");
              }}
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white ring-2 ring-white/30 transition-all duration-300 hover:bg-white/10 hover:ring-white"
            >
              {d.home.doctors.viewBoard}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ (AEO) ============ */}
      <section className="section-wash relative py-20 sm:py-24" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <SectionHeading
                align="left"
                eyebrow={d.home.faq.eyebrow}
                title={
                  <>
                    {d.home.faq.titleA}
                    <span className="gradient-text">{d.home.faq.titleB}</span>
                  </>
                }
                description={d.home.faq.description}
              />
              <Reveal className="mt-8">
                <div className="rounded-2xl border border-blue-100 bg-ice p-6">
                  <p className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" aria-hidden="true" />
                    <span>
                      {d.home.faq.stillTitle}{" "}
                      <a
                        href={`tel:${site.phoneRaw}`}
                        className="font-bold text-brand-blue underline decoration-blue-200 underline-offset-4 hover:text-brand-navy"
                      >
                        {site.phone}
                      </a>{" "}
                      {d.home.faq.or}{" "}
                      <a
                        href="#/contact"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/contact");
                        }}
                        className="font-bold text-brand-blue underline decoration-blue-200 underline-offset-4 hover:text-brand-navy"
                      >
                        {d.home.faq.sendMsg}
                      </a>{" "}
                      {d.home.faq.replyNote}
                    </span>
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <Accordion type="single" collapsible className="w-full">
                {generalFaqs.slice(0, 6).map((faq, i) => (
                  <AccordionItem
                    key={faq.question}
                    value={`faq-${i}`}
                    className="faq-row border-b border-blue-100/80 data-[state=open]:border-brand-blue/30"
                  >
                    <AccordionTrigger className="py-5 text-left font-heading text-base font-semibold text-brand-navy hover:text-brand-blue hover:no-underline">
                      {bn && faq.questionBn ? faq.questionBn : faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                      {bn && faq.answerBn ? faq.answerBn : faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Reveal className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                <a
                  href="#/faqs"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/faqs");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-brand-blue ring-1 ring-blue-100 transition-all duration-300 hover:bg-brand-blue hover:text-white hover:ring-brand-blue"
                >
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  {d.home.faq.viewAll}
                </a>
                <a
                  href="#/blog"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/blog");
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-navy"
                >
                  {d.home.faq.readMore}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Reveal>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <CtaBanner />
    </>
  );
}
