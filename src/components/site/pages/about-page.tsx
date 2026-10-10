"use client";

import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  Heart,
  HeartHandshake,
  Microscope,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  Telescope,
  Users,
} from "lucide-react";
import { useRouter, usePageMeta } from "@/lib/router";
import { clinicStats, site } from "@/lib/site";
import { doctors } from "@/lib/data/doctors";
import { testimonials } from "@/lib/data/doctors";
import { PageHeader, CtaBanner, DoctorCard } from "@/components/site/shared";
import {
  AnimatedCounter,
  Reveal,
  SectionHeading,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion";
import { TestimonialCarousel } from "@/components/site/testimonial-carousel";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  ABOUT PAGE                                                         */
/* ------------------------------------------------------------------ */

const timeline = [
  {
    year: "2019",
    title: "The Beginning",
    description:
      "Aristocrat Dental Care opens in Uttara with a simple promise: world-class dentistry with genuine warmth — where patients are family, never numbers.",
    icon: "Heart",
  },
  {
    year: "2021",
    title: "Technology Leap",
    description:
      "Digital X-rays, intraoral cameras and laser dentistry arrive — making diagnosis more precise and treatment more comfortable than ever.",
    icon: "Microscope",
  },
  {
    year: "2023",
    title: "Orthodontic Center",
    description:
      "Expanded orthodontic services including Invisalign® clear aligners and modern self-ligating braces, led by MDS-qualified specialists.",
    icon: "Sparkles",
  },
  {
    year: "2025",
    title: "50,000+ Smiles",
    description:
      "Our family of happy patients crosses fifty thousand — with 4.9-star average reviews and referrals that remain our biggest growth engine.",
    icon: "Users",
  },
];

const values = [
  {
    icon: "BadgeCheck",
    title: "Integrity",
    description:
      "We provide honest diagnoses and transparent pricing — treatment recommended only when it's genuinely needed.",
  },
  {
    icon: "ShieldCheck",
    title: "Safety",
    description:
      "We never compromise on hygiene or sterilization standards — hospital-grade protocols on every instrument, every patient, every day.",
  },
  {
    icon: "HeartHandshake",
    title: "Comfort",
    description:
      "We create a welcoming, anxiety-free environment for patients of all ages — from toddlers to grandparents.",
  },
  {
    icon: "Award",
    title: "Excellence",
    description:
      "We deliver the highest quality of dental care available — through continued education, modern technology and meticulous standards.",
  },
];

export function AboutPage() {
  const { navigate } = useRouter();

  usePageMeta({
    title: "About Us — Our Story, Mission & Values",
    description:
      "Welcome to Aristocrat Dental Care & Orthodontic Center, Uttara Dhaka — combining art, medical science and compassion under the leadership of Dr. Shazia Khanam. 50,000+ happy patients.",
  });

  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title="Where art, science & compassion create smiles"
        description={`Welcome to ${site.name} — a premier destination for comprehensive dental care in Uttara, Dhaka.`}
        breadcrumb={[{ label: "Home", to: "/" }, { label: "About Us" }]}
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
                    Excellence in Every Smile
                  </span>
                  <blockquote className="font-heading relative mt-8 text-2xl font-bold leading-snug text-white sm:text-[1.75rem]">
                    &ldquo;Under the expert leadership of Dr. Shazia Khanam, our
                    clinic is recognized as a premier destination for
                    comprehensive dental care.&rdquo;
                  </blockquote>
                  <div className="relative mt-10 grid grid-cols-3 gap-4">
                    {[
                      { value: "6+", label: "Years of trust" },
                      { value: "11", label: "Specialties" },
                      { value: "4.9★", label: "Avg. rating" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
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
                </div>
                <div className="animate-float-soft absolute -right-3 -top-5 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-blue-100 sm:-right-6">
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    <span>
                      <span className="block font-heading text-sm font-bold text-brand-navy">
                        4.9/5 rating
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        3,200+ verified reviews
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </Reveal>

            <div>
              <SectionHeading
                align="left"
                eyebrow="Our Story"
                title="Built on trust, grown by smiles"
              />
              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">
                <Reveal delay={0.05}>
                  <p>
                    Welcome to {site.name}, where we combine art, medical
                    science, and compassion to create smiles that change lives.
                    Under the expert leadership of{" "}
                    <strong className="text-brand-navy">Dr. Shazia Khanam</strong>,
                    our clinic is recognized as a premier destination for
                    comprehensive dental care in Uttara.
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <p>
                    We are dedicated to providing the best quality treatment
                    with safety &amp; comfort, utilizing the latest advancements
                    in dental technology to ensure precise diagnoses and
                    effective treatments. From routine checkups to complex
                    orthodontics, we are committed to excellence in every smile
                    we craft.
                  </p>
                </Reveal>
                <Reveal delay={0.15}>
                  <ul className="grid gap-3 pt-2 sm:grid-cols-2">
                    {[
                      "Modern & well-equipped facility",
                      "Strict sterilization protocols",
                      "Digital X-rays & intraoral cameras",
                      "Pain-free & comfortable care",
                      "Comprehensive services under one roof",
                      "Specially designed kids' room",
                    ].map((item) => (
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
            eyebrow="Our Mission & Vision"
            title="What drives us every single day"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <article className="card-shine group h-full rounded-3xl border border-blue-100/80 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-18px_rgba(30,125,255,0.3)] sm:p-10">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-lg shadow-blue-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Target className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="font-heading mt-6 text-2xl font-bold text-brand-navy">
                  Our Mission
                </h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  To provide accessible, high-quality dental care that
                  prioritizes patient safety, comfort, and long-term oral
                  health. We strive to make every visit a stress-free experience
                  through modern dentistry and personalized care.
                </p>
              </article>
            </Reveal>
            <Reveal delay={0.1}>
              <article className="card-shine group h-full rounded-3xl border border-blue-100/80 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-18px_rgba(0,32,96,0.3)] sm:p-10">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-lg shadow-navy-900/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  <Telescope className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="font-heading mt-6 text-2xl font-bold text-brand-navy">
                  Our Vision
                </h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  To be the leading dental clinic in the region — known for
                  clinical excellence, strict sterilization protocols, and a
                  patient-first approach that turns anxious visitors into
                  lifelong advocates of great oral health.
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ TIMELINE ============ */}
      <section className="relative py-16 sm:py-20" aria-labelledby="timeline-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Our Journey"
            title="Milestones that shaped us"
          />
          <div className="relative mt-14">
            <span
              className="absolute left-[27px] top-4 hidden h-[calc(100%-32px)] w-0.5 bg-gradient-to-b from-brand-blue via-brand-blue/40 to-transparent sm:block"
              aria-hidden="true"
            />
            <ol className="space-y-10">
              {timeline.map((item, i) => (
                <li key={item.year}>
                  <Reveal delay={i * 0.06}>
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-navy font-heading text-sm font-bold text-white shadow-lg shadow-navy-900/30 ring-4 ring-white sm:flex">
                        {item.year}
                      </span>
                      <div className="rounded-3xl border border-blue-100/80 bg-white p-6 shadow-[0_10px_35px_-18px_rgba(0,32,96,0.18)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_-18px_rgba(30,125,255,0.35)] sm:ml-4 sm:flex-1 sm:p-7">
                        <span className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-brand-blue sm:hidden">
                          {item.year}
                        </span>
                        <h3 className="font-heading mt-1 text-lg font-bold text-brand-navy sm:mt-0">
                          {item.title}
                        </h3>
                        <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                          {item.description}
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

      {/* ============ FOUNDER SPOTLIGHT ============ */}
      <section className="relative bg-brand-navy py-16 sm:py-20" aria-labelledby="founder-heading">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="relative mx-auto max-w-sm">
                <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-blue/30 to-transparent p-1.5">
                  <div className="flex aspect-[4/4.6] flex-col items-center justify-center rounded-[1.8rem] bg-white/5 p-8 text-center ring-1 ring-white/10">
                    <span className="inline-flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 font-heading text-4xl font-bold text-brand-navy shadow-2xl shadow-amber-500/30">
                      SK
                    </span>
                    <h3 className="font-heading mt-6 text-2xl font-bold text-white">
                      Dr. Shazia Khanam
                    </h3>
                    <p className="mt-1 text-sm font-medium text-blue-200">
                      BDS, MDS — Chief Dental Surgeon &amp; Founder
                    </p>
                    <div className="mt-5 flex items-center gap-2" aria-label="Rating 4.9">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />
                      ))}
                      <span className="text-sm font-semibold text-white">4.9</span>
                    </div>
                  </div>
                </div>
                <div className="animate-float-soft absolute -bottom-5 -right-3 rounded-2xl bg-white p-4 shadow-xl sm:-right-8">
                  <span className="flex items-center gap-3">
                    <Stethoscope className="h-6 w-6 text-brand-blue" aria-hidden="true" />
                    <span>
                      <span className="block font-heading text-sm font-bold text-brand-navy">
                        5,000+ patients treated
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        Orthodontics &amp; Cosmetic Dentistry
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
                eyebrow="Meet Our Founder"
                title={
                  <>
                    A gentle hand behind
                    <span className="gold-text"> every confident smile</span>
                  </>
                }
              />
              <Reveal className="mt-6">
                <p className="text-base leading-relaxed text-blue-100/85">
                  At the heart of Aristocrat Dental Care is Dr. Shazia Khanam —
                  a highly skilled and experienced dentist dedicated to her
                  craft. With a passion for continued learning and a famously
                  gentle touch, Dr. Khanam specializes in creating personalized
                  treatment plans that address the unique needs of every
                  patient.
                </p>
              </Reveal>
              <StaggerContainer className="mt-8 space-y-4">
                {[
                  {
                    title: "Expertise",
                    text: "Specialized focus on Orthodontics and Cosmetic Dentistry.",
                  },
                  {
                    title: "Philosophy",
                    text: "\u201CA healthy smile is a gateway to overall well-being.\u201D",
                  },
                  {
                    title: "Patient Care",
                    text: "Known for a compassionate approach that eases dental anxiety.",
                  },
                ].map((item) => (
                  <StaggerItem key={item.title}>
                    <div className="flex items-start gap-4 rounded-2xl bg-white/8 p-5 ring-1 ring-white/12 transition-colors duration-300 hover:bg-white/12">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/90 text-brand-navy">
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="font-heading block text-sm font-bold text-white">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-sm text-blue-100/80">
                          {item.text}
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
                    href="#/doctors/dr-shazia-khanam"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/doctors/dr-shazia-khanam");
                    }}
                    className="inline-flex items-center gap-2"
                  >
                    View Full Profile
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
            eyebrow="Our Core Values"
            title="The principles we practice daily"
          />
          <StaggerContainer className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <div className="card-shine group h-full rounded-2xl border border-blue-100/70 bg-white p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_18px_40px_-16px_rgba(30,125,255,0.3)]">
                  <span className="inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <DynamicIconImport name={v.icon} />
                  </span>
                  <h3 className="font-heading mt-4 text-base font-bold text-brand-navy">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {v.description}
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
            {clinicStats.map((stat) => (
              <StaggerItem key={stat.label}>
                <span className="font-heading block text-3xl font-bold text-brand-navy sm:text-4xl">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={"decimals" in stat ? stat.decimals : 0}
                  />
                </span>
                <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  {stat.label}
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
            eyebrow="Our Specialists"
            title="The team behind your smile"
            description="Meet our verified medical board — specialists who combine hospital-grade training with famously gentle care."
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
            eyebrow="Patient Trust"
            title="Words that keep us going"
          />
          <Reveal className="mt-12">
            <TestimonialCarousel testimonials={testimonials} />
          </Reveal>
        </div>
      </section>

      <CtaBanner
        title="Come experience the Aristocrat difference"
        description="Visit our modern clinic in Uttara — meet our specialists, tour our facility and start your journey to a healthier smile."
      />
    </>
  );
}

/* local icon helper to avoid circular imports */
import { DynamicIcon } from "@/components/site/icon-map";
function DynamicIconImport({ name }: { name: string }) {
  return <DynamicIcon name={name} className="h-6 w-6" />;
}
