"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Globe,
  HeartPulse,
  Info,
  Phone,
  Repeat,
  ShieldCheck,
  Sparkles,
  Syringe,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter, usePageMeta } from "@/lib/router";
import { useLang, toBnDigits } from "@/lib/i18n";
import { getService, services } from "@/lib/data/services";
import { DynamicIcon, categoryColors } from "@/components/site/icon-map";
import { Reveal, SectionHeading, StaggerContainer, StaggerItem } from "@/components/site/motion";
import { ServiceCard, CtaBanner } from "@/components/site/shared";
import { NotFoundPage } from "@/components/site/pages/not-found-page";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  SERVICE DETAIL PAGE — deep, rich, conversion-focused (EN / বাংলা)   */
/* ------------------------------------------------------------------ */

export function ServiceDetailPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.serviceDetail;
  const service = getService(slug);

  usePageMeta({
    title: service
      ? `${service.name} in Uttara, Dhaka — Aristocrat Dental Care`
      : "Service Not Found",
    description: service?.excerpt,
    jsonLd: service
      ? [
          {
            "@context": "https://schema.org",
            "@type": "MedicalTherapy",
            name: service.name,
            description: service.excerpt,
            url: `https://aristocratdentalcarebd.com/#/services/${service.slug}`,
            provider: {
              "@type": "Dentist",
              name: site.name,
              telephone: site.phoneRaw,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Uttara",
                addressRegion: "Dhaka",
                addressCountry: "BD",
              },
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: service.faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
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
                name: "Services",
                item: "https://aristocratdentalcarebd.com/#/services",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: service.name,
                item: `https://aristocratdentalcarebd.com/#/services/${service.slug}`,
              },
            ],
          },
        ]
      : undefined,
  });

  if (!service) return <NotFoundPage />;

  const colors = categoryColors[service.category] ?? categoryColors.Restorative;
  const related = services.filter((s) => service.related.includes(s.slug));

  /* localized service naming */
  const name = bn && service.nameBn ? service.nameBn : service.name;
  const shortName = bn && service.shortNameBn ? service.shortNameBn : service.shortName;
  const tagline = bn && service.taglineBn ? service.taglineBn : service.tagline;
  const excerpt = bn && service.excerptBn ? service.excerptBn : service.excerpt;
  const categoryLabel = d.categories[service.category];

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero-mesh-dark relative overflow-hidden">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
          {/* breadcrumb */}
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
                  href="#/services"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/services");
                  }}
                  className="transition-colors hover:text-white"
                >
                  {d.chrome.nav.services}
                </a>
              </li>
              <li className="text-blue-300/50" aria-hidden="true">/</li>
              <li className="font-medium text-white">{name}</li>
            </ol>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                {t.accepting}
              </span>
              <h1 className="font-heading mt-5 text-3xl font-bold leading-tight text-white text-balance sm:text-4xl lg:text-[2.9rem]">
                {name}
              </h1>
              <p className="font-heading mt-3 text-lg font-medium text-amber-300">
                {tagline}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-100/85 sm:text-lg">
                {excerpt}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/appointment?service=${service.slug}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-brand-navy shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                >
                  <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                  {t.bookFor.replace("{service}", shortName)}
                </button>
                <a
                  href={`tel:${site.phoneRaw}`}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white ring-2 ring-white/40 transition-all duration-300 hover:bg-white/10"
                >
                  <Phone className="h-4.5 w-4.5" aria-hidden="true" />
                  {t.callWith.replace("{phone}", site.phone)}
                </a>
              </div>
            </motion.div>

            {/* quick facts card */}
            <motion.aside
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[1.75rem] bg-white/8 p-6 ring-1 ring-white/15 backdrop-blur"
              aria-label="Service quick facts"
            >
              <div className="flex items-center gap-4">
                <span className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20`}>
                  <DynamicIcon name={service.icon} className="h-8 w-8" />
                </span>
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
                    {t.categoryCare.replace("{category}", categoryLabel)}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-300">
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    {t.verified}
                  </span>
                </div>
              </div>
              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-4">
                  <dt className="flex items-center gap-2 text-blue-200/80">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                    {t.duration}
                  </dt>
                  <dd className="text-right font-semibold text-white">{bn ? toBnDigits(service.duration) : service.duration}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-4">
                  <dt className="flex items-center gap-2 text-blue-200/80">
                    <Repeat className="h-4 w-4" aria-hidden="true" />
                    {t.longevity}
                  </dt>
                  <dd className="text-right font-semibold text-white">{bn ? toBnDigits(service.longevity) : service.longevity}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-4">
                  <dt className="flex items-center gap-2 text-blue-200/80">
                    <Syringe className="h-4 w-4" aria-hidden="true" />
                    {t.comfort}
                  </dt>
                  <dd className="text-right font-semibold text-white">{service.anesthesia}</dd>
                </div>
              </dl>
              <a
                href="#/appointment"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/appointment?service=${service.slug}`);
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-blue py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/40 transition-all duration-300 hover:bg-brand-blue-light"
              >
                {t.proceed}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </motion.aside>
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

      {/* ============ OVERVIEW + IDEAL FOR ============ */}
      <section className="py-16 sm:py-20" aria-labelledby="overview-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <SectionHeading
                align="left"
                eyebrow={t.overviewEyebrow}
                title={t.overviewTitle.replace("{service}", name)}
              />
              {bn && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-blue-100">
                  <Globe className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                  {t.contentNote}
                </p>
              )}
              <div className="mt-8 space-y-5">
                {service.overview.map((para, i) => (
                  <Reveal key={i} delay={i * 0.06}>
                    <p className="text-[15px] leading-relaxed text-slate-600 sm:text-base">
                      {para}
                    </p>
                  </Reveal>
                ))}
              </div>

              {/* ideal for */}
              <Reveal className="mt-10">
                <div className="rounded-3xl border border-blue-100/80 bg-ice p-7 sm:p-8">
                  <h3 className="flex items-center gap-2.5 font-heading text-lg font-bold text-brand-navy">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-brand-blue">
                      <Info className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    {t.idealTitle}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600">
                    {t.idealText.replace("{service}", name)}
                  </p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {service.ideal.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            {/* safety sidebar */}
            <div>
              <Reveal delay={0.1}>
                <div className="sticky top-28 space-y-4">
                  <div className="rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_12px_40px_-18px_rgba(0,32,96,0.2)]">
                    <h3 className="font-heading flex items-center gap-2 text-base font-bold text-brand-navy">
                      <ShieldCheck className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                      {t.safetyTitle}
                    </h3>
                    <ul className="mt-4 space-y-3.5 text-sm text-slate-600">
                      {t.safetyList.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 ring-1 ring-amber-200/60">
                    <h3 className="flex items-center gap-2 font-heading text-base font-bold text-amber-800">
                      <HeartPulse className="h-5 w-5" aria-hidden="true" />
                      {t.anxiousTitle}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-amber-900/80">
                      {t.anxiousText}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BENEFITS ============ */}
      <section className="relative bg-ice py-16 sm:py-20" aria-labelledby="benefits-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={t.benefitsEyebrow}
            title={
              <>
                {t.benefitsPre} <span className="gradient-text">{shortName}</span>
                {t.benefitsPost}
              </>
            }
            description={t.benefitsText.replace("{service}", name)}
          />
          <StaggerContainer className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.benefits.map((benefit, i) => (
              <StaggerItem key={benefit.title}>
                <div className="card-shine group h-full rounded-2xl border border-blue-100/70 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_18px_40px_-16px_rgba(30,125,255,0.3)]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
                    <span className="font-heading text-sm font-bold">
                      {bn ? toBnDigits(String(i + 1).padStart(2, "0")) : String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <h3 className="font-heading mt-4 text-base font-bold text-brand-navy group-hover:text-brand-blue">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {benefit.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section className="relative py-16 sm:py-20" aria-labelledby="process-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={t.processEyebrow}
            title={t.processTitle}
            description={t.processText}
          />
          <div className="relative mt-14">
            {/* connecting line */}
            <span
              className="absolute left-[27px] top-4 hidden h-[calc(100%-32px)] w-0.5 bg-gradient-to-b from-brand-blue via-brand-blue/40 to-transparent sm:block lg:left-1/2 lg:-translate-x-1/2"
              aria-hidden="true"
            />
            <ol className="space-y-10">
              {service.process.map((step, i) => (
                <li key={step.step}>
                  <Reveal delay={i * 0.05}>
                    <div
                      className={`relative flex flex-col gap-5 sm:flex-row sm:items-start ${
                        i % 2 === 1 ? "lg:flex-row-reverse" : ""
                      } lg:justify-between`}
                    >
                      {/* node */}
                      <span className="absolute left-0 top-1 hidden h-14 w-14 sm:flex lg:left-1/2 lg:-translate-x-1/2" aria-hidden="true">
                        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy font-heading text-base font-bold text-white shadow-lg shadow-navy-900/30 ring-4 ring-white">
                          {bn ? toBnDigits(step.step) : step.step}
                        </span>
                      </span>
                      <div className={`sm:pl-[76px] lg:w-[46%] lg:pl-0 ${i % 2 === 1 ? "lg:pl-0" : ""}`}>
                        <div className="rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_10px_35px_-18px_rgba(0,32,96,0.18)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_-18px_rgba(30,125,255,0.35)] sm:p-7">
                          <span className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-brand-blue sm:hidden">
                            {t.step} {bn ? toBnDigits(step.step) : step.step}
                          </span>
                          <h3 className="font-heading mt-1 text-lg font-bold text-brand-navy sm:mt-0">
                            {step.title}
                          </h3>
                          <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      <div className="hidden lg:block lg:w-[46%]" aria-hidden="true" />
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="relative bg-ice py-16 sm:py-20" aria-labelledby="service-faq-heading">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={t.faqEyebrow}
            title={t.faqTitle.replace("{service}", shortName)}
          />
          <Reveal className="mt-10">
            <Accordion type="single" collapsible className="w-full">
              {service.faqs.map((faq, i) => (
                <AccordionItem
                  key={faq.question}
                  value={`s-faq-${i}`}
                  className="border-b border-blue-100"
                >
                  <AccordionTrigger className="py-5 text-left font-heading text-base font-semibold text-brand-navy hover:text-brand-blue hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>

          <Reveal className="mt-8">
            <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-blue-100 bg-white p-6 text-center sm:flex-row sm:text-left">
              <p className="flex items-center gap-3 text-sm font-medium text-brand-navy">
                <Sparkles className="h-5 w-5 shrink-0 text-brand-blue" aria-hidden="true" />
                {t.faqCta}
              </p>
              <a
                href={`tel:${site.phoneRaw}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-brand-blue"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {site.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ RELATED SERVICES ============ */}
      {related.length > 0 && (
        <section className="relative py-16 sm:py-20" aria-labelledby="related-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                align="left"
                eyebrow={t.relatedEyebrow}
                title={t.relatedTitle}
              />
              <Reveal>
                <a
                  href="#/services"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/services");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-5 py-2.5 text-sm font-semibold text-brand-blue transition-all duration-300 hover:bg-brand-blue hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {t.allServices}
                </a>
              </Reveal>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s, i) => (
                <ServiceCard key={s.slug} service={s} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner
        title={t.ctaTitle.replace("{service}", shortName)}
        description={t.ctaDescription.replace("{serviceFull}", name).replace("{hours}", bn ? "শনি–বৃহঃ, সকাল ১০টা – রাত ৯টা" : site.hours)}
      />
    </>
  );
}
