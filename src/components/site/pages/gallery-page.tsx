"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Info,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { BeforeAfterSlider } from "@/components/site/before-after-slider";
import { PageHeader, CtaBanner } from "@/components/site/shared";
import { Reveal, SectionHeading, StaggerContainer, StaggerItem } from "@/components/site/motion";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  GALLERY PAGE — Smile transformations with before/after sliders     */
/* ------------------------------------------------------------------ */

type SmileCase = {
  id: string;
  treatment: string;
  serviceSlug: string;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  title: string;
  patient: string;
  age: number;
  duration: string;
  procedures: string[];
  result: string;
  featured?: boolean;
};

const cases: SmileCase[] = [
  {
    id: "case-whitening",
    treatment: "Teeth Whitening",
    serviceSlug: "digital-smile-design",
    beforeSrc: "/images/case-before-whitening.png",
    afterSrc: "/images/case-after-whitening.png",
    beforeAlt: "Teeth before professional whitening — stained and yellowed",
    afterAlt: "Teeth after professional whitening — bright and radiant",
    title: "From stained to radiant in one visit",
    patient: "R. Ahmed",
    age: 28,
    duration: "Single 90-minute session",
    procedures: ["In-clinic professional whitening", "Enamel-safe desensitizing protocol"],
    result:
      "Eight shades brighter — a natural brilliance that matches her face, not a fluorescent white. Zero sensitivity after 48 hours.",
    featured: true,
  },
  {
    id: "case-braces",
    treatment: "Orthodontics",
    serviceSlug: "traditional-braces-orthodontics",
    beforeSrc: "/images/case-before-braces.png",
    afterSrc: "/images/case-after-braces.png",
    beforeAlt: "Crowded misaligned teeth before orthodontic treatment",
    afterAlt: "Perfectly aligned teeth after orthodontic treatment",
    title: "Crowded smile, beautifully aligned",
    patient: "T. Hassan",
    age: 19,
    duration: "14 months of self-ligating braces",
    procedures: ["Self-ligating metal braces", "Whitening after debonding", "Retainer therapy"],
    result:
      "Severe crowding corrected with a stable, healthy bite. What took traditional braces 24 months took ours just 14 — with fewer adjustment visits.",
  },
  {
    id: "case-veneers",
    treatment: "Porcelain Veneers",
    serviceSlug: "porcelain-veneers",
    beforeSrc: "/images/case-before-veneers.png",
    afterSrc: "/images/case-after-veneers.png",
    beforeAlt: "Chipped and uneven discolored teeth before veneers",
    afterAlt: "Flawless porcelain veneer smile after treatment",
    title: "Chipped & uneven — now flawless",
    patient: "S. Islam",
    age: 32,
    duration: "3 visits over 3 weeks",
    procedures: ["8 porcelain veneers", "Digital Smile Design preview", "Minimal enamel preparation"],
    result:
      "Chips, discoloration and uneven shapes corrected with hand-layered porcelain. She approved the exact design in her DSD simulation before we began.",
  },
];

export function GalleryPage() {
  const { navigate } = useRouter();

  usePageMeta({
    title: "Smile Gallery — Before & After Dental Transformations",
    description:
      "See real smile transformations from Aristocrat Dental Care, Uttara Dhaka: whitening, braces & veneers before/after results. Drag the slider to compare. Book your smile makeover today.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      name: "Smile Transformation Gallery — Aristocrat Dental Care",
      url: "https://aristocratdentalcarebd.com/#/gallery",
      about: cases.map((c) => ({
        "@type": "CreativeWork",
        name: `${c.treatment} — ${c.title}`,
        text: c.result,
      })),
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Smile Gallery"
        title="Real transformations — slide to believe"
        description="Drag the handle on each case to compare before and after. Every smile below was designed, treated and cared for right here in Uttara."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Gallery" }]}
      />

      {/* Hint banner */}
      <section className="py-8" aria-label="How to use the comparison slider">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-blue-100/80 bg-ice px-6 py-5 text-center sm:flex-row sm:text-left">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm ring-1 ring-blue-100">
                <Camera className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="flex-1 text-sm leading-relaxed text-slate-600">
                <strong className="text-brand-navy">How to compare:</strong> drag
                the circular handle across each photo (or use arrow keys when
                focused) to reveal the transformation. Photos are representative
                clinical examples — individual results vary and are confirmed at
                consultation.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cases */}
      <section className="pb-16 sm:pb-20" aria-label="Smile transformation cases">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="space-y-16">
            {cases.map((c, i) => (
              <article
                key={c.id}
                className="grid items-center gap-10 lg:grid-cols-2"
                aria-labelledby={`${c.id}-title`}
              >
                {/* Slider */}
                <Reveal className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="relative mx-auto w-full max-w-md">
                    <BeforeAfterSlider
                      beforeSrc={c.beforeSrc}
                      afterSrc={c.afterSrc}
                      beforeAlt={c.beforeAlt}
                      afterAlt={c.afterAlt}
                    />
                    {/* floating treatment chip */}
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-navy px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                      {c.treatment}
                    </span>
                    {c.featured && (
                      <span className="absolute -bottom-3 right-4 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3.5 py-1.5 text-[11px] font-bold text-brand-navy shadow-lg">
                        <Star className="h-3.5 w-3.5 fill-brand-navy" aria-hidden="true" />
                        Featured Case
                      </span>
                    )}
                  </div>
                </Reveal>

                {/* Details */}
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue ring-1 ring-blue-100">
                      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                      Case Study {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2
                      id={`${c.id}-title`}
                      className="font-heading mt-4 text-2xl font-bold leading-snug text-brand-navy text-balance sm:text-3xl"
                    >
                      {c.title}
                    </h2>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                        {c.patient} • {c.age} yrs
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                        {c.duration}
                      </span>
                    </div>

                    <p className="mt-5 text-[15px] leading-relaxed text-slate-600 sm:text-base">
                      {c.result}
                    </p>

                    <StaggerContainer className="mt-6 space-y-2.5">
                      {c.procedures.map((p) => (
                        <StaggerItem key={p}>
                          <div className="flex items-start gap-3 rounded-xl bg-ice px-4 py-3 text-sm font-medium text-slate-700">
                            <CheckCircle2
                              className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500"
                              aria-hidden="true"
                            />
                            {p}
                          </div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Button
                        asChild
                        className="rounded-full bg-brand-blue px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-navy"
                      >
                        <a
                          href={`#/appointment?service=${c.serviceSlug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/appointment?service=${c.serviceSlug}`);
                          }}
                          className="inline-flex items-center gap-2"
                        >
                          <CalendarCheck className="h-4.5 w-4.5" aria-hidden="true" />
                          Get This Treatment
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full border-brand-blue/25 bg-white px-6 py-3.5 text-sm font-bold text-brand-blue hover:bg-blue-50"
                      >
                        <a
                          href={`#/services/${c.serviceSlug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/services/${c.serviceSlug}`);
                          }}
                          className="inline-flex items-center gap-2"
                        >
                          About {c.treatment}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="pb-6" aria-label="Medical disclaimer">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <p className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs leading-relaxed text-amber-800">
              <Info className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              <span>
                <strong>Important:</strong> Images shown are representative
                examples of treatment outcomes. Every smile is unique — your
                result depends on your oral health, anatomy and treatment plan,
                which our specialists confirm during consultation before any
                procedure begins.
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBanner
        title="Your smile transformation starts here"
        description="Book a Digital Smile Design consultation and preview YOUR new smile before any treatment — just like the patients above."
      />
    </>
  );
}
