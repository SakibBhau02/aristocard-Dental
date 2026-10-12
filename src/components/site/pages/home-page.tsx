"use client";

import { useMemo } from "react";
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
  Sparkles,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang } from "@/lib/i18n";
import { useBundle } from "@/components/site/content-provider";
import { featuredServices, pickBn, testimonials } from "@/lib/content/shared";
import { DynamicIcon } from "@/components/site/icon-map";
import {
  AnimatedCounter,
  Reveal,
  SectionHeading,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion";
import { ServiceCard, DoctorCard, CtaBanner, QuizTeaser } from "@/components/site/shared";
import { TestimonialMarquee } from "@/components/site/testimonial-marquee";
import { BeforeAfterSlider } from "@/components/site/before-after-slider";
import { PatientReviews } from "@/components/site/patient-reviews";
import { HeroBackdrop } from "@/components/site/hero-backdrop";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  HOME PAGE (EN / বাংলা) — content served live from the CMS bundle   */
/* ------------------------------------------------------------------ */

const HOME_META_DESCRIPTION =
  "Modern & well-equipped dental clinic in Uttara, Dhaka. 50,000+ happy patients. Implants, Invisalign, braces, root canal, smile design & kids dentistry. Book: 01715-027522.";

export function HomePage() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const { home, settings, heroSlides, faqs, services, doctors } = useBundle();
  const bn = lang === "bn";

  /* SEO/AEO/GEO: WebPage (linked to the Organization + speakable hero) +
     compact FAQPage over exactly the FAQs the homepage renders (first 6). */
  const homeJsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": "https://aristocratdentalcarebd.com/#webpage",
        url: "https://aristocratdentalcarebd.com/",
        name: settings.name,
        description: HOME_META_DESCRIPTION,
        inLanguage: "en",
        isPartOf: { "@id": "https://aristocratdentalcarebd.com/#website" },
        about: { "@id": "https://aristocratdentalcarebd.com/#organization" },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["#hero-heading", "#hero-subtitle"],
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.slice(0, 6).map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
    [settings.name, faqs]
  );

  usePageMeta({
    title:
      "Aristocrat Dental Care & Orthodontic Center | Best Dental Clinic in Uttara, Dhaka",
    description: HOME_META_DESCRIPTION,
    jsonLd: homeJsonLd,
  });

  const featured = featuredServices(services, 6);

  return (
    <>
      {/* ============ HERO — centered over sliding media backdrop ============ */}
      <section
        className="relative isolate flex min-h-[88vh] items-center justify-center overflow-hidden bg-brand-navy"
        aria-labelledby="hero-heading"
      >
        {/* sliding background images (+ optional YouTube video) + navy overlay */}
        <HeroBackdrop slides={heroSlides} indicators priority overlay="deep" />

        {/* centered copy */}
        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300 ring-1 ring-white/20 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {pickBn(home.hero.badge, home.hero.badgeBn, bn)}
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.08] text-white text-balance sm:text-5xl sm:leading-[1.06] lg:text-[3.75rem]"
          >
            {pickBn(home.hero.titleA, home.hero.titleABn, bn)}{" "}
            <span className="gold-text text-shimmer">{pickBn(home.hero.titleB, home.hero.titleBBn, bn)}</span>
          </motion.h1>

          <motion.p
            id="hero-subtitle"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-blue-100/90 sm:text-lg"
          >
            {pickBn(home.hero.description, home.hero.descriptionBn, bn)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="btn-press btn-shine group relative overflow-hidden rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-9 py-6 text-base font-bold text-brand-navy shadow-xl shadow-amber-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/40"
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
                {pickBn(home.hero.ctaBook, home.hero.ctaBookBn, bn)}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-white/30 bg-white/10 px-9 py-6 text-base font-bold text-white backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/60 hover:bg-white/20"
            >
              <a
                href="#/services"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/services");
                }}
                className="inline-flex items-center gap-2"
              >
                <PlayCircle className="h-5 w-5 text-amber-300" aria-hidden="true" />
                {pickBn(home.hero.ctaExplore, home.hero.ctaExploreBn, bn)}
              </a>
            </Button>
          </motion.div>

          {/* trust chips (centered) */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5"
          >
            {pickBn(home.hero.trust, home.hero.trustBn, bn).map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-4 py-1.5 text-sm text-blue-100/90 ring-1 ring-white/12 backdrop-blur-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* scroll cue (sits above the slide indicator bars) */}
        <motion.a
          href="#stats"
          className="absolute bottom-14 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs font-medium text-blue-100/70 transition-colors hover:text-white lg:flex"
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
              { icon: Users, tone: "text-brand-blue bg-blue-50 ring-blue-100" },
              { icon: Sparkles, tone: "text-brand-teal bg-teal-50 ring-teal-100" },
              { icon: Stethoscope, tone: "text-brand-navy bg-blue-50 ring-blue-100" },
              { icon: Star, tone: "text-amber-500 bg-amber-50 ring-amber-100" },
            ].map(({ icon: Icon, tone }, i) => {
              const stat = home.stats[i];
              if (!stat) return null;
              return (
                <StaggerItem key={i} className="text-center">
                  <span
                    className={`mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tone}`}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-heading block text-3xl font-bold text-brand-navy sm:text-4xl">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={bn ? undefined : stat.suffix}
                      decimals={stat.decimals ?? 0}
                      formatBn={bn ? { suffix: stat.suffix } : undefined}
                    />
                  </span>
                  <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-slate-500 sm:text-sm">
                    {pickBn(stat.label, stat.labelBn, bn)}
                  </span>
                  {i > 0 && (
                    <span
                      className="absolute top-1/2 hidden h-14 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-blue-100 to-transparent lg:block"
                      style={{ left: `${(i / 4) * 100}%` }}
                      aria-hidden="true"
                    />
                  )}
                </StaggerItem>
              );
            })}
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
          {/* minmax(0,1fr) on mobile so the track can shrink below content
              min-width — prevents 3px horizontal overflow at 320-360px */}
          <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
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
                        {pickBn(home.why.quote, home.why.quoteBn, bn)}
                      </p>
                      <p className="mt-3 text-sm text-blue-200/85">
                        {pickBn(home.why.quoteBy, home.why.quoteByBn, bn)}
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
                {/* floating rating card — right-4 on mobile (no viewport
                    overflow at 320-360px), pokes out from sm up */}
                <div className="animate-float-soft absolute right-4 -top-4 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-blue-100 sm:-right-8">
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
                    {pickBn(home.why.ratingNote, home.why.ratingNoteBn, bn)}
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Right content */}
            <div className="order-1 lg:order-2">
              <SectionHeading
                align="left"
                eyebrow={pickBn(home.why.eyebrow, home.why.eyebrowBn, bn)}
                title={
                  <>
                    {pickBn(home.why.titleA, home.why.titleABn, bn)}
                    <span className="gradient-text">{pickBn(home.why.titleB, home.why.titleBBn, bn)}</span>
                  </>
                }
                description={pickBn(home.why.description, home.why.descriptionBn, bn)}
              />
              <StaggerContainer className="mt-10 grid gap-4 sm:grid-cols-2">
                {home.why.highlights.map((h) => (
                  <StaggerItem key={h.title}>
                    <div className="card-shine group h-full rounded-2xl border border-blue-100/70 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_18px_40px_-16px_rgba(30,125,255,0.3)]">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                        <DynamicIcon
                          name={h.icon}
                          className="h-6 w-6"
                        />
                      </span>
                      <h3 className="font-heading mt-4 text-base font-bold text-brand-navy">
                        {pickBn(h.title, h.titleBn, bn)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {pickBn(h.description, h.descriptionBn, bn)}
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
            eyebrow={pickBn(home.services.eyebrow, home.services.eyebrowBn, bn)}
            title={
              <>
                {pickBn(home.services.titleA, home.services.titleABn, bn)}
                <span className="gradient-text">{pickBn(home.services.titleB, home.services.titleBBn, bn)}</span>
              </>
            }
            description={pickBn(home.services.description, home.services.descriptionBn, bn)}
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
                {pickBn(home.services.cta, home.services.ctaBn, bn)}
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
            eyebrow={pickBn(home.facility.eyebrow, home.facility.eyebrowBn, bn)}
            title={
              <>
                {pickBn(home.facility.titleA, home.facility.titleABn, bn)}
                <span className="gold-text">{pickBn(home.facility.titleB, home.facility.titleBBn, bn)}</span>
              </>
            }
            description={pickBn(home.facility.description, home.facility.descriptionBn, bn)}
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
                    {pickBn(home.facility.cards[i]?.title, home.facility.cards[i]?.titleBn, bn)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-blue-100/80">
                    {pickBn(home.facility.cards[i]?.text, home.facility.cards[i]?.textBn, bn)}
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
                eyebrow={pickBn(home.galleryPreview.eyebrow, home.galleryPreview.eyebrowBn, bn)}
                title={
                  <>
                    {pickBn(home.galleryPreview.titleA, home.galleryPreview.titleABn, bn)}
                    <span className="gradient-text">{pickBn(home.galleryPreview.titleB, home.galleryPreview.titleBBn, bn)}</span>
                  </>
                }
                description={pickBn(home.galleryPreview.description, home.galleryPreview.descriptionBn, bn)}
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
                      {pickBn(home.galleryPreview.cta, home.galleryPreview.ctaBn, bn)}
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
            eyebrow={pickBn(home.testimonials.eyebrow, home.testimonials.eyebrowBn, bn)}
            title={
              <>
                {pickBn(home.testimonials.titleA, home.testimonials.titleABn, bn)}
                <span className="gradient-text">{pickBn(home.testimonials.titleB, home.testimonials.titleBBn, bn)}</span>
              </>
            }
            description={pickBn(home.testimonials.description, home.testimonials.descriptionBn, bn)}
          />
          <Reveal className="mt-12">
            <TestimonialMarquee testimonials={testimonials} />
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
            eyebrow={pickBn(home.doctors.eyebrow, home.doctors.eyebrowBn, bn)}
            title={
              <>
                {pickBn(home.doctors.titleA, home.doctors.titleABn, bn)}
                <span className="gold-text">{pickBn(home.doctors.titleB, home.doctors.titleBBn, bn)}</span>
              </>
            }
            description={pickBn(home.doctors.description, home.doctors.descriptionBn, bn)}
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
              {pickBn(home.doctors.cta, home.doctors.ctaBn, bn)}
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
                eyebrow={pickBn(home.faq.eyebrow, home.faq.eyebrowBn, bn)}
                title={
                  <>
                    {pickBn(home.faq.titleA, home.faq.titleABn, bn)}
                    <span className="gradient-text">{pickBn(home.faq.titleB, home.faq.titleBBn, bn)}</span>
                  </>
                }
                description={pickBn(home.faq.description, home.faq.descriptionBn, bn)}
              />
              <Reveal className="mt-8">
                <div className="rounded-2xl border border-blue-100 bg-ice p-6">
                  <p className="flex items-start gap-3 text-sm leading-relaxed text-slate-700">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" aria-hidden="true" />
                    <span>
                      {pickBn(home.faq.stillTitle, home.faq.stillTitleBn, bn)}{" "}
                      <a
                        href={`tel:${settings.phoneRaw}`}
                        className="font-bold text-brand-blue underline decoration-blue-200 underline-offset-4 hover:text-brand-navy"
                      >
                        {settings.phone}
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
                {faqs.slice(0, 6).map((faq, i) => (
                  <AccordionItem
                    key={faq.question}
                    value={`faq-${i}`}
                    className="faq-row border-b border-blue-100/80 data-[state=open]:border-brand-blue/30"
                  >
                    <AccordionTrigger className="py-5 text-left font-heading text-base font-semibold text-brand-navy hover:text-brand-blue hover:no-underline">
                      {pickBn(faq.question, faq.questionBn, bn)}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                      {pickBn(faq.answer, faq.answerBn, bn)}
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
                  {pickBn(home.faq.cta, home.faq.ctaBn, bn)}
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
