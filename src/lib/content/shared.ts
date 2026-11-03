/* ------------------------------------------------------------------ */
/*  CMS shared layer — types, defaults, row↔domain mappers.             */
/*  Client-safe (NO Prisma imports). Used by:                          */
/*   • src/lib/content/server.ts  (DB → ContentBundle)                 */
/*   • /api/admin/* routes         (payload → DB rows)                 */
/*   • content-provider.tsx        (public site context)               */
/*   • admin editor panels         (form defaults)                     */
/* ------------------------------------------------------------------ */

import type { BlogPost, Doctor, DoctorAward, DoctorEducation, FAQ, Service } from "@/lib/types";
import type { SmileCase } from "@/lib/data/smile-cases";
import type { HeroSlide } from "@/lib/data/hero-media";
import { parseYouTubeId, buildHeroSlides } from "@/lib/data/hero-media";
import { services as staticServices } from "@/lib/data/services";
import { doctors as staticDoctors, testimonials as staticTestimonials } from "@/lib/data/doctors";
import { blogPosts as staticPosts } from "@/lib/data/blog";
import { generalFaqs as staticFaqs } from "@/lib/data/faqs";
import { smileCases as staticCases } from "@/lib/data/smile-cases";
import { homeHeroImages, heroVideoUrls } from "@/lib/data/hero-media";
import { dictionary } from "@/lib/data/dictionary";
const en = dictionary.en;
const bn = dictionary.bn;
import { site, clinicStats, highlights as staticHighlights } from "@/lib/site";

/* ------------------------------------------------------------------ */
/*  Page-level editable content shapes                                 */
/* ------------------------------------------------------------------ */

export type HomeHeroContent = {
  badge: string; badgeBn?: string;
  titleA: string; titleABn?: string;
  titleB: string; titleBBn?: string;
  description: string; descriptionBn?: string;
  ctaBook: string; ctaBookBn?: string;
  ctaExplore: string; ctaExploreBn?: string;
  trust: string[]; trustBn?: string[];
};

export type StatItem = {
  value: number;
  suffix: string;
  label: string;
  labelBn?: string;
  decimals?: number;
};

export type WhyContent = {
  eyebrow: string; eyebrowBn?: string;
  titleA: string; titleABn?: string;
  titleB: string; titleBBn?: string;
  description: string; descriptionBn?: string;
  quote: string; quoteBn?: string;
  quoteBy: string; quoteByBn?: string;
  ratingNote: string; ratingNoteBn?: string;
  highlights: { icon: string; title: string; titleBn?: string; description: string; descriptionBn?: string }[];
};

export type SectionHead = {
  eyebrow: string; eyebrowBn?: string;
  titleA: string; titleABn?: string;
  titleB: string; titleBBn?: string;
  description: string; descriptionBn?: string;
  cta?: string; ctaBn?: string;
};

export type FacilityContent = SectionHead & {
  cards: { title: string; titleBn?: string; text: string; textBn?: string }[];
};

/* ---- Founder spotlight (Why-Choose-Us visual + slide info pop-ups) ---- */

/** One floating info card pinned around the founder photo. */
export type FounderInfoCard = {
  label: string; labelBn?: string;
  value: string; valueBn?: string;
};

/** One photo in the founder slide deck — its own caption + info cards. */
export type FounderSlide = {
  id: string;
  image?: string;
  imageAlt?: string;
  /* "contain" suits cut-out portraits on white; "cover" suits scene shots. */
  fit?: "cover" | "contain";
  caption: string; captionBn?: string;
  cards: FounderInfoCard[];
};

export type FounderSpotlightContent = {
  eyebrow: string; eyebrowBn?: string;
  titleA: string; titleABn?: string;
  titleB: string; titleBBn?: string;
  description: string; descriptionBn?: string;
  name: string; nameBn?: string;
  role: string; roleBn?: string;
  years: string;
  yearsLabel: string; yearsLabelBn?: string;
  bio: string; bioBn?: string;
  ctaProfile: string; ctaProfileBn?: string;
  ctaBook: string; ctaBookBn?: string;
  slides: FounderSlide[];
};

export type HomeContent = {
  hero: HomeHeroContent;
  stats: StatItem[];
  why: WhyContent;
  founderSpotlight: FounderSpotlightContent;
  services: SectionHead;
  facility: FacilityContent;
  galleryPreview: SectionHead;
  testimonials: SectionHead;
  doctors: SectionHead;
  faq: SectionHead & { stillTitle?: string; stillTitleBn?: string };
};

export type TimelineItem = {
  year: string;
  icon: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
};

export type StoryStatItem = {
  value: string;
  label: string;
  labelBn?: string;
};

/* ---- Founder dossier (About → Founder spotlight) ------------------- */

/** One entry in the founder's education / training timeline. */
export type FounderEducationItem = {
  degree: string; degreeBn?: string;
  institution?: string; institutionBn?: string;
  year?: string;
  detail?: string; detailBn?: string;
};

/** Certificate / fellowship / appointment shown as a credential card. */
export type FounderCredentialItem = {
  title: string; titleBn?: string;
  issuer?: string; issuerBn?: string;
  year?: string;
};

/** Career milestone in the founder's professional timeline. */
export type FounderMilestoneItem = {
  year?: string;
  title: string; titleBn?: string;
  description?: string; descriptionBn?: string;
};

/* ---- Clinic tour (About → Inside the clinic) ----------------------- */

/** One room / area of the clinic with its equipment list. */
export type ClinicRoom = {
  id: string;
  /* Short category label used by the filter chips ("Treatment Rooms"). */
  category: string; categoryBn?: string;
  title: string; titleBn?: string;
  description: string; descriptionBn?: string;
  image?: string;
  imageAlt?: string;
  equipment: string[];
  equipmentBn?: string[];
  /* Featured rooms also appear in the home-page preview. */
  featured?: boolean;
};

export type AboutContent = {
  eyebrow: string; eyebrowBn?: string;
  title: string; titleBn?: string;
  description: string; descriptionBn?: string;
  storyBadge: string; storyBadgeBn?: string;
  storyQuote: string; storyQuoteBn?: string;
  storyP2: string; storyP2Bn?: string;
  storyStats: StoryStatItem[];
  missionEyebrow: string; missionEyebrowBn?: string;
  missionTitle: string; missionTitleBn?: string;
  missionHeading: string; missionHeadingBn?: string;
  missionText: string; missionTextBn?: string;
  visionHeading: string; visionHeadingBn?: string;
  visionText: string; visionTextBn?: string;
  journeyEyebrow: string; journeyEyebrowBn?: string;
  journeyTitle: string; journeyTitleBn?: string;
  timeline: TimelineItem[];
  founderName: string; founderNameBn?: string;
  founderRole: string; founderRoleBn?: string;
  /* Founder portrait — uploaded from the admin panel (ImageUploadField
     → /api/admin/upload). Empty string = elegant initials fallback.   */
  founderImage?: string;
  founderImageAlt?: string;
  founderChipTitle: string; founderChipTitleBn?: string;
  founderChipNote: string; founderChipNoteBn?: string;
  founderItems: { title: string; titleBn?: string; text: string; textBn?: string }[];
  /* ---- Founder dossier (optional: blobs saved before it existed heal
     to the researched defaults via normalizeAboutContent). ---- */
  founderTagline?: string; founderTaglineBn?: string;
  /* Experience chip — "18+" is rendered as-is (digits become Bangla in
     বাংলা mode). Keep the clinic's founding year out of this. */
  founderYears?: string; founderYearsLabel?: string; founderYearsLabelBn?: string;
  founderBio?: string[]; founderBioBn?: string[];
  founderEducation?: FounderEducationItem[];
  founderCredentials?: FounderCredentialItem[];
  founderMilestones?: FounderMilestoneItem[];
  /* ---- Clinic tour gallery (rooms + equipment) ---- */
  clinicGalleryEyebrow?: string; clinicGalleryEyebrowBn?: string;
  clinicGalleryTitle?: string; clinicGalleryTitleBn?: string;
  clinicGalleryDescription?: string; clinicGalleryDescriptionBn?: string;
  clinicRooms?: ClinicRoom[];
  valuesEyebrow: string; valuesEyebrowBn?: string;
  valuesTitle: string; valuesTitleBn?: string;
  values: { icon: string; title: string; titleBn?: string; description: string; descriptionBn?: string }[];
  specialistsTitle: string; specialistsTitleBn?: string;
  specialistsDescription: string; specialistsDescriptionBn?: string;
  ctaTitle: string; ctaTitleBn?: string;
  ctaDescription: string; ctaDescriptionBn?: string;
};

export type SiteSettings = {
  name: string;
  shortName: string;
  tagline: string; taglineBn?: string;
  phone: string;
  phoneRaw: string;
  emergencyPhone: string;
  email: string;
  address: string;
  addressShort: string;
  hours: string; hoursBn?: string;
  hoursFriday: string; hoursFridayBn?: string;
  established: number;
  patientsServed: number;
  facebook: string;
  instagram: string;
  linkedin: string;
  heroVideoUrls: string[];
};

/* ------------------------------------------------------------------ */
/*  Defaults (mirrors today's static content — seed + fallback)         */
/* ------------------------------------------------------------------ */

export function defaultHomeContent(): HomeContent {
  const h = en.home;
  const hb = bn.home;
  return {
    hero: {
      badge: h.hero.badge, badgeBn: hb.hero.badge,
      titleA: h.hero.titleA, titleABn: hb.hero.titleA,
      titleB: h.hero.titleB, titleBBn: hb.hero.titleB,
      description: h.hero.description, descriptionBn: hb.hero.description,
      ctaBook: h.hero.ctaBook, ctaBookBn: hb.hero.ctaBook,
      ctaExplore: h.hero.ctaExplore, ctaExploreBn: hb.hero.ctaExplore,
      trust: h.hero.trust, trustBn: hb.hero.trust,
    },
    stats: clinicStats.map((s, i) => ({
      value: s.value,
      suffix: s.suffix,
      label: s.label,
      labelBn: hb.stats[i]?.label,
      decimals: (s as { decimals?: number }).decimals,
    })),
    why: {
      eyebrow: h.why.eyebrow, eyebrowBn: hb.why.eyebrow,
      titleA: h.why.titleA, titleABn: hb.why.titleA,
      titleB: h.why.titleB, titleBBn: hb.why.titleB,
      description: h.why.description, descriptionBn: hb.why.description,
      quote: h.why.quote, quoteBn: hb.why.quote,
      quoteBy: h.why.quoteBy, quoteByBn: hb.why.quoteBy,
      ratingNote: h.why.ratingNote, ratingNoteBn: hb.why.ratingNote,
      highlights: h.why.highlights.map((hi, i) => ({
        icon: staticHighlights[i]?.icon ?? "ShieldCheck",
        title: hi.title, titleBn: hb.why.highlights[i]?.title,
        description: hi.description, descriptionBn: hb.why.highlights[i]?.description,
      })),
    },
    /* ---- Founder spotlight (Why-Choose-Us visual) ---- */
    founderSpotlight: {
      eyebrow: "Meet the founder",
      eyebrowBn: "প্রতিষ্ঠাতার পরিচয়",
      titleA: "Eighteen years of ",
      titleABn: "আঠারো বছরের ",
      titleB: "precision and care",
      titleBBn: "নিখুঁততা ও যত্ন",
      description:
        "Dr. Shazia Khanam personally leads the diagnosis and the treatment plan — the same specialist from your first consultation to the final result.",
      descriptionBn:
        "ডা. শাজিয়া খানম নিজেই ডায়াগনোসিস ও চিকিৎসা পরিকল্পনার নেতৃত্ব দেন — প্রথম পরামর্শ থেকে চূড়ান্ত ফলাফল, একই বিশেষজ্ঞ আপনার পাশে।",
      name: "Dr. Shazia Khanam",
      nameBn: "ডা. শাজিয়া খানম",
      role: "Founder & Chief Consultant",
      roleBn: "প্রতিষ্ঠাতা ও চিফ কনসালট্যান্ট",
      years: "18+",
      yearsLabel: "Years of clinical experience",
      yearsLabelBn: "বছরের ক্লিনিক্যাল অভিজ্ঞতা",
      bio: "An orthodontist with FCPS (Orthodontics) and a fellowship from the World Federation of Orthodontists, USA. She has treated thousands of smiles — from a child's first check-up to guided implants and complete smile makeovers.",
      bioBn:
        "এফসিপিএস (অর্থোডন্টিকস) এবং যুক্তরাষ্ট্রের ওয়ার্ল্ড ফেডারেশন অব অর্থোডন্টিস্টসের ফেলোশিপপ্রাপ্ত অর্থোডন্টিস্ট। শিশুর প্রথম চেক-আপ থেকে গাইডেড ইমপ্ল্যান্ট ও সম্পূর্ণ স্মাইল মেকওভার — হাজারো হাসির চিকিৎসা তাঁর হাতে।",
      ctaProfile: "Full profile",
      ctaProfileBn: "সম্পূর্ণ প্রোফাইল",
      ctaBook: "Book an appointment",
      ctaBookBn: "অ্যাপয়েন্টমেন্ট নিন",
      /* Slide deck — the info cards change with every photo. Photos are
         uploaded in Admin → Homepage → Founder spotlight; a slide without
         an image renders the designed placeholder. */
      slides: [
        {
          id: "founder",
          image: "/images/founder-portrait.jpg",
          imageAlt: "Dr. Shazia Khanam, founder and Chief Consultant of Aristocrat Dental Care",
          fit: "contain",
          caption: "Founder & Chief Consultant",
          captionBn: "প্রতিষ্ঠাতা ও চিফ কনসালট্যান্ট",
          cards: [
            {
              label: "Experience", labelBn: "অভিজ্ঞতা",
              value: "18+ years of practice", valueBn: "১৮+ বছরের অভিজ্ঞতা",
            },
            {
              label: "Qualification", labelBn: "যোগ্যতা",
              value: "FCPS (Orthodontics)", valueBn: "এফসিপিএস (অর্থোডন্টিকস)",
            },
            {
              label: "Fellowship", labelBn: "ফেলোশিপ",
              value: "World Federation of Orthodontists, USA",
              valueBn: "ওয়ার্ল্ড ফেডারেশন অব অর্থোডন্টিস্টস, যুক্তরাষ্ট্র",
            },
          ],
        },
        {
          id: "education",
          image: "/images/founder-shazia-khanam.jpg",
          imageAlt: "Portrait of Dr. Shazia Khanam at Aristocrat Dental Care",
          fit: "cover",
          caption: "The training behind the practice",
          captionBn: "চিকিৎসার পেছনের প্রশিক্ষণ",
          cards: [
            {
              label: "BDS", labelBn: "বিডিএস",
              value: "Rajshahi Medical College (2002–2007)",
              valueBn: "রাজশাহী মেডিকেল কলেজ (২০০২–২০০৭)",
            },
            {
              label: "Postgraduate", labelBn: "পোস্টগ্র্যাজুয়েট",
              value: "PGT — Oral & Maxillofacial Surgery, Dhaka Dental College",
              valueBn: "পিজিটি — ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জারি, ঢাকা ডেন্টাল কলেজ",
            },
            {
              label: "Teaching", labelBn: "শিক্ষকতা",
              value: "Lecturer, Update Dental College",
              valueBn: "লেকচারার, আপডেট ডেন্টাল কলেজ",
            },
          ],
        },
        {
          id: "clinical",
          imageAlt: "Dr. Shazia Khanam treating a patient in the operatory",
          caption: "Precision in the operatory",
          captionBn: "চিকিৎসা কক্ষে নিখুঁততা",
          cards: [
            {
              label: "Clinical focus", labelBn: "ক্লিনিক্যাল ফোকাস",
              value: "Guided implants, aligners & laser dentistry",
              valueBn: "গাইডেড ইমপ্ল্যান্ট, অ্যালাইনার ও লেজার ডেন্টিস্ট্রি",
            },
            {
              label: "Diagnosis", labelBn: "ডায়াগনোসিস",
              value: "Digital X-ray · 3D scanning · Smile Design",
              valueBn: "ডিজিটাল এক্স-রে · থ্রিডি স্ক্যানিং · স্মাইল ডিজাইন",
            },
            {
              label: "Hygiene", labelBn: "হাইজিন",
              value: "Autoclave sterilization + single-use kits",
              valueBn: "অটোক্লেভ স্টেরিলাইজেশন + সিঙ্গেল-ইউজ কিট",
            },
          ],
        },
        {
          id: "team",
          imageAlt: "The Aristocrat Dental Care team in the clinic",
          caption: "A team behind every smile",
          captionBn: "প্রতিটি হাসির পেছনে একটি দল",
          cards: [
            {
              label: "Recognition", labelBn: "স্বীকৃতি",
              value: "FDI World Dental Congress 2025, Shanghai",
              valueBn: "এফডিআই ওয়ার্ল্ড ডেন্টাল কংগ্রেস ২০২৫, সাংহাই",
            },
            {
              label: "Specialists", labelBn: "বিশেষজ্ঞ",
              value: "Orthodontics · Oral surgery · Endodontics",
              valueBn: "অর্থোডন্টিকস · ওরাল সার্জারি · এন্ডোডন্টিকস",
            },
            {
              label: "Continuity", labelBn: "ধারাবাহিকতা",
              value: "The same specialist follows every visit",
              valueBn: "প্রতিটি ভিজিটে একই বিশেষজ্ঞ",
            },
          ],
        },
      ],
    },
    services: {
      eyebrow: h.services.eyebrow, eyebrowBn: hb.services.eyebrow,
      titleA: h.services.titleA, titleABn: hb.services.titleA,
      titleB: h.services.titleB, titleBBn: hb.services.titleB,
      description: h.services.description, descriptionBn: hb.services.description,
      cta: h.services.viewAll, ctaBn: hb.services.viewAll,
    },
    facility: {
      eyebrow: h.facility.eyebrow, eyebrowBn: hb.facility.eyebrow,
      titleA: h.facility.titleA, titleABn: hb.facility.titleA,
      titleB: h.facility.titleB, titleBBn: hb.facility.titleB,
      description: h.facility.description, descriptionBn: hb.facility.description,
      cards: h.facility.cards.map((c, i) => ({
        title: c.title, titleBn: hb.facility.cards[i]?.title,
        text: c.text, textBn: hb.facility.cards[i]?.text,
      })),
    },
    galleryPreview: {
      eyebrow: h.galleryPreview.eyebrow, eyebrowBn: hb.galleryPreview.eyebrow,
      titleA: h.galleryPreview.titleA, titleABn: hb.galleryPreview.titleA,
      titleB: h.galleryPreview.titleB, titleBBn: hb.galleryPreview.titleB,
      description: h.galleryPreview.description, descriptionBn: hb.galleryPreview.description,
      cta: h.galleryPreview.ctaGallery, ctaBn: hb.galleryPreview.ctaGallery,
    },
    testimonials: {
      eyebrow: h.testimonials.eyebrow, eyebrowBn: hb.testimonials.eyebrow,
      titleA: h.testimonials.titleA, titleABn: hb.testimonials.titleA,
      titleB: h.testimonials.titleB, titleBBn: hb.testimonials.titleB,
      description: h.testimonials.description, descriptionBn: hb.testimonials.description,
    },
    doctors: {
      eyebrow: h.doctors.eyebrow, eyebrowBn: hb.doctors.eyebrow,
      titleA: h.doctors.titleA, titleABn: hb.doctors.titleA,
      titleB: h.doctors.titleB, titleBBn: hb.doctors.titleB,
      description: h.doctors.description, descriptionBn: hb.doctors.description,
      cta: h.doctors.viewBoard, ctaBn: hb.doctors.viewBoard,
    },
    faq: {
      eyebrow: h.faq.eyebrow, eyebrowBn: hb.faq.eyebrow,
      titleA: h.faq.titleA, titleABn: hb.faq.titleA,
      titleB: h.faq.titleB, titleBBn: hb.faq.titleB,
      description: h.faq.description, descriptionBn: hb.faq.description,
      cta: h.faq.viewAll, ctaBn: hb.faq.viewAll,
      stillTitle: h.faq.stillTitle, stillTitleBn: hb.faq.stillTitle,
    },
  };
}

/* Journey timeline presentation defaults — year + icon per milestone.
   Kept beside the defaults so blobs saved BEFORE these fields existed
   heal per-index (arrays are replaced wholesale by the deep merge). */
const TIMELINE_META = [
  { year: "2019", icon: "Heart" },
  { year: "2021", icon: "Microscope" },
  { year: "2023", icon: "Sparkles" },
  { year: "2025", icon: "Users" },
] as const;

export function defaultAboutContent(): AboutContent {
  const a = en.about;
  const ab = bn.about;
  return {
    eyebrow: a.eyebrow, eyebrowBn: ab.eyebrow,
    title: a.title, titleBn: ab.title,
    description: a.description, descriptionBn: ab.description,
    storyBadge: a.storyBadge, storyBadgeBn: ab.storyBadge,
    storyQuote: a.storyQuote, storyQuoteBn: ab.storyQuote,
    storyP2: a.storyP2, storyP2Bn: ab.storyP2,
    storyStats: [
      { value: "6+", label: a.storyStats[0].label, labelBn: ab.storyStats[0].label },
      { value: "11", label: a.storyStats[1].label, labelBn: ab.storyStats[1].label },
      { value: "4.9★", label: a.storyStats[2].label, labelBn: ab.storyStats[2].label },
    ],
    missionEyebrow: a.missionEyebrow, missionEyebrowBn: ab.missionEyebrow,
    missionTitle: a.missionTitle, missionTitleBn: ab.missionTitle,
    missionHeading: a.missionHeading, missionHeadingBn: ab.missionHeading,
    missionText: a.missionText, missionTextBn: ab.missionText,
    visionHeading: a.visionHeading, visionHeadingBn: ab.visionHeading,
    visionText: a.visionText, visionTextBn: ab.visionText,
    journeyEyebrow: a.journeyEyebrow, journeyEyebrowBn: ab.journeyEyebrow,
    journeyTitle: a.journeyTitle, journeyTitleBn: ab.journeyTitle,
    timeline: a.timeline.map((t, i) => ({
      year: TIMELINE_META[i]?.year ?? "2024",
      icon: TIMELINE_META[i]?.icon ?? "Sparkles",
      title: t.title, titleBn: ab.timeline[i]?.title,
      description: t.description, descriptionBn: ab.timeline[i]?.description,
    })),
    founderName: "Dr. Shazia Khanam",
    founderNameBn: "ডা. শাজিয়া খানম",
    founderRole: a.founderRole, founderRoleBn: ab.founderRole,
    founderImage: "/images/founder-shazia-khanam.jpg",
    founderImageAlt: "Dr. Shazia Khanam — Founder and Chief Dental Surgeon, Aristocrat Dental Care",
    founderChipTitle: a.founderChipTitle, founderChipTitleBn: ab.founderChipTitle,
    founderChipNote: a.founderChipNote, founderChipNoteBn: ab.founderChipNote,
    founderItems: a.founderItems.map((f, i) => ({
      title: f.title, titleBn: ab.founderItems[i]?.title,
      text: f.text, textBn: ab.founderItems[i]?.text,
    })),

    /* ---- Founder dossier -------------------------------------------
       FACTUAL SOURCE (public): Dr. Shazia Khanam's own LinkedIn profile,
       the clinic's LinkedIn/YouTube profiles and the clinic's own posts.
       No institution, year or award is invented here — entries without a
       verified year simply omit it. Everything is editable in Admin →
       About → Founder, so the owner can correct or extend any line.   */
    founderTagline:
      "Orthodontist, educator and founder — where clinical precision meets genuine kindness.",
    founderTaglineBn:
      "অর্থোডন্টিস্ট, শিক্ষক ও প্রতিষ্ঠাতা — যেখানে ক্লিনিক্যাল নিখুঁততা মেলে আন্তরিক যত্নের সঙ্গে।",
    founderYears: "18+",
    founderYearsLabel: "Years of clinical experience",
    founderYearsLabelBn: "বছরের ক্লিনিক্যাল অভিজ্ঞতা",
    founderBio: [
      "Dr. Shazia Khanam is the founder and Chief Consultant of Aristocrat Dental Care & Orthodontic Center in Uttara, Dhaka. Across more than eighteen years of clinical practice she has treated thousands of patients — from a child's first check-up to full-mouth orthodontic and implant rehabilitation.",
      "Her work centres on orthodontics and digital dentistry: clear aligners, self-ligating braces, digital smile design, guided implants and laser-assisted treatment. Every plan begins with a careful diagnosis, and the same specialist follows the patient through the whole journey.",
      "Beyond the chair she teaches as a Lecturer at Update Dental College and keeps her practice aligned with global standards — most recently representing the clinic at the FDI World Dental Congress 2025 in Shanghai.",
    ],
    founderBioBn: [
      "ডা. শাজিয়া খানম উত্তরা, ঢাকার অ্যারিস্টোক্র্যাট ডেন্টাল কেয়ার অ্যান্ড অর্থোডন্টিক সেন্টারের প্রতিষ্ঠাতা ও চিফ কনসালট্যান্ট। আঠারো বছরের বেশি ক্লিনিক্যাল অভিজ্ঞতায় তিনি হাজারো রোগীর চিকিৎসা করেছেন — শিশুর প্রথম চেক-আপ থেকে শুরু করে সম্পূর্ণ মুখের অর্থোডন্টিক ও ইমপ্ল্যান্ট পুনর্গঠন।",
      "তাঁর কাজের কেন্দ্রে আছে অর্থোডন্টিকস ও ডিজিটাল ডেন্টিস্ট্রি — ক্লিয়ার অ্যালাইনার, সেলফ-লিগেটিং ব্রেসেস, ডিজিটাল স্মাইল ডিজাইন, গাইডেড ইমপ্ল্যান্ট এবং লেজার-সহায়ক চিকিৎসা। প্রতিটি পরিকল্পনা শুরু হয় সতর্ক ডায়াগনোসিস দিয়ে, আর পুরো চিকিৎসাকালে একই বিশেষজ্ঞ রোগীর পাশে থাকেন।",
      "চেম্বারের বাইরে তিনি আপডেট ডেন্টাল কলেজে লেকচারার হিসেবে পড়ান এবং নিজের চর্চাকে আন্তর্জাতিক মানে ধরে রাখেন — সম্প্রতি চীনের সাংহাইতে অনুষ্ঠিত FDI World Dental Congress 2025-এ ক্লিনিকের প্রতিনিধিত্ব করেছেন।",
    ],
    founderEducation: [
      {
        degree: "BDS", degreeBn: "বিডিএস (ডেন্টাল সার্জারি)",
        institution: "Rajshahi Medical College", institutionBn: "রাজশাহী মেডিকেল কলেজ",
        year: "2002–2007",
        detail: "Bachelor of Dental Surgery", detailBn: "ব্যাচেলর অব ডেন্টাল সার্জারি",
      },
      {
        degree: "PGT — Oral & Maxillofacial Surgery",
        degreeBn: "পিজিটি — ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জারি",
        institution: "Dhaka Dental College", institutionBn: "ঢাকা ডেন্টাল কলেজ",
        detail: "Postgraduate training", detailBn: "পোস্টগ্র্যাজুয়েট প্রশিক্ষণ",
      },
      {
        degree: "FCPS (Orthodontics)", degreeBn: "এফসিপিএস (অর্থোডন্টিকস)",
        institution: "Bangladesh College of Physicians & Surgeons (BCPS)",
        institutionBn: "বাংলাদেশ কলেজ অব ফিজিশিয়ানস অ্যান্ড সার্জনস (বিসিপিএস)",
        detail: "Fellow of the College of Physicians & Surgeons",
        detailBn: "ফেলো অব দ্য কলেজ অব ফিজিশিয়ানস অ্যান্ড সার্জনস",
      },
      {
        degree: "Fellow, World Federation of Orthodontists",
        degreeBn: "ফেলো, ওয়ার্ল্ড ফেডারেশন অব অর্থোডন্টিস্টস",
        institution: "World Federation of Orthodontists (WFO), USA",
        institutionBn: "ওয়ার্ল্ড ফেডারেশন অব অর্থোডন্টিস্টস (ডব্লিউএফও), যুক্তরাষ্ট্র",
        detail: "International orthodontic fellowship",
        detailBn: "আন্তর্জাতিক অর্থোডন্টিক ফেলোশিপ",
      },
      {
        degree: "Lecturer", degreeBn: "লেকচারার",
        institution: "Update Dental College", institutionBn: "আপডেট ডেন্টাল কলেজ",
        detail: "Undergraduate teaching appointment",
        detailBn: "আন্ডারগ্র্যাজুয়েট শিক্ষকতা",
      },
    ],
    founderCredentials: [
      {
        title: "FCPS (Orthodontics)", titleBn: "এফসিপিএস (অর্থোডন্টিকস)",
        issuer: "Bangladesh College of Physicians & Surgeons",
        issuerBn: "বাংলাদেশ কলেজ অব ফিজিশিয়ানস অ্যান্ড সার্জনস",
      },
      {
        title: "Fellow — World Federation of Orthodontists",
        titleBn: "ফেলো — ওয়ার্ল্ড ফেডারেশন অব অর্থোডন্টিস্টস",
        issuer: "WFO, United States", issuerBn: "ডব্লিউএফও, যুক্তরাষ্ট্র",
      },
      {
        title: "BDS", titleBn: "বিডিএস",
        issuer: "Rajshahi Medical College", issuerBn: "রাজশাহী মেডিকেল কলেজ",
        year: "2007",
      },
      {
        title: "PGT — Oral & Maxillofacial Surgery",
        titleBn: "পিজিটি — ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জারি",
        issuer: "Dhaka Dental College", issuerBn: "ঢাকা ডেন্টাল কলেজ",
      },
      {
        title: "FDI World Dental Congress 2025",
        titleBn: "এফডিআই ওয়ার্ল্ড ডেন্টাল কংগ্রেস ২০২৫",
        issuer: "Delegate — Shanghai, China", issuerBn: "ডেলিগেট — সাংহাই, চীন",
        year: "2025",
      },
      {
        title: "Lecturer, Update Dental College",
        titleBn: "লেকচারার, আপডেট ডেন্টাল কলেজ",
        issuer: "Teaching appointment", issuerBn: "শিক্ষকতা",
      },
    ],
    founderMilestones: [
      {
        year: "2007", title: "BDS — Rajshahi Medical College",
        titleBn: "বিডিএস — রাজশাহী মেডিকেল কলেজ",
        description: "Graduated in dental surgery and began clinical practice.",
        descriptionBn: "ডেন্টাল সার্জারিতে স্নাতক সম্পন্ন করে ক্লিনিক্যাল চর্চা শুরু করেন।",
      },
      {
        title: "Postgraduate training in Oral & Maxillofacial Surgery",
        titleBn: "ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জারিতে পোস্টগ্র্যাজুয়েট প্রশিক্ষণ",
        description: "Dhaka Dental College — surgical diagnosis and operating-room training.",
        descriptionBn: "ঢাকা ডেন্টাল কলেজ — সার্জিক্যাল ডায়াগনোসিস ও অপারেশন থিয়েটার প্রশিক্ষণ।",
      },
      {
        title: "FCPS in Orthodontics",
        titleBn: "অর্থোডন্টিকসে এফসিপিএস",
        description: "Bangladesh College of Physicians & Surgeons — specialist orthodontic qualification.",
        descriptionBn: "বাংলাদেশ কলেজ অব ফিজিশিয়ানস অ্যান্ড সার্জনস — বিশেষজ্ঞ অর্থোডন্টিক যোগ্যতা।",
      },
      {
        title: "Fellow, World Federation of Orthodontists",
        titleBn: "ফেলো, ওয়ার্ল্ড ফেডারেশন অব অর্থোডন্টিস্টস",
        description: "International fellowship recognising her orthodontic standards.",
        descriptionBn: "অর্থোডন্টিক মানের স্বীকৃতি হিসেবে আন্তর্জাতিক ফেলোশিপ।",
      },
      {
        year: "2025", title: "FDI World Dental Congress — Shanghai",
        titleBn: "এফডিআই ওয়ার্ল্ড ডেন্টাল কংগ্রেস — সাংহাই",
        description: "Represented the clinic at the world's largest dental congress.",
        descriptionBn: "বিশ্বের সবচেয়ে বড় ডেন্টাল কংগ্রেসে ক্লিনিকের প্রতিনিধিত্ব করেন।",
      },
    ],

    /* ---- Clinic tour ------------------------------------------------
       Rooms + equipment reflect what the clinic publicly describes
       (guided implants, 3D scanning, digital smile design, laser,
       Polus whitening, nitrous oxide sedation, autoclaves, disposable
       kits, CCTV, kids' room). Photos are uploaded in Admin → About →
       Clinic tour; rooms without a photo render a designed placeholder. */
    clinicGalleryEyebrow: "Inside the clinic",
    clinicGalleryEyebrowBn: "ক্লিনিকের ভেতরে",
    clinicGalleryTitle: "Every room, every instrument",
    clinicGalleryTitleBn: "প্রতিটি রুম, প্রতিটি যন্ত্র",
    clinicGalleryDescription:
      "Walk through Aristocrat Dental Care room by room — the equipment we use, the spaces we treat in, and the hygiene protocols that run behind every appointment.",
    clinicGalleryDescriptionBn:
      "অ্যারিস্টোক্র্যাট ডেন্টাল কেয়ারের প্রতিটি রুম ঘুরে দেখুন — কোন যন্ত্রপাতি ব্যবহার করি, কোথায় চিকিৎসা হয়, আর প্রতিটি অ্যাপয়েন্টমেন্টের পেছনে যেসব হাইজিন প্রোটোকল কাজ করে।",
    clinicRooms: [
      {
        id: "reception",
        category: "Reception", categoryBn: "রিসেপশন",
        title: "Reception & Waiting Lounge",
        titleBn: "রিসেপশন ও ওয়েটিং লাউঞ্জ",
        description:
          "A calm, air-conditioned lounge where appointments are confirmed, records are opened and families wait comfortably before treatment.",
        descriptionBn:
          "শান্ত, শীতাতপ নিয়ন্ত্রিত লাউঞ্জ — এখানেই অ্যাপয়েন্টমেন্ট নিশ্চিত হয়, রোগীর রেকর্ড খোলা হয় এবং পরিবারগুলো আরামে অপেক্ষা করে।",
        imageAlt: "Reception and waiting lounge at Aristocrat Dental Care",
        equipment: [
          "Air-conditioned lounge",
          "CCTV-monitored premises",
          "Bottled drinking water",
          "Patient records & appointment desk",
        ],
        equipmentBn: [
          "শীতাতপ নিয়ন্ত্রিত লাউঞ্জ",
          "সিসিটিভি নিয়ন্ত্রিত চত্বর",
          "বোতলজাত বিশুদ্ধ পানি",
          "রোগীর রেকর্ড ও অ্যাপয়েন্টমেন্ট ডেস্ক",
        ],
        featured: true,
      },
      {
        id: "diagnosis",
        category: "Diagnostics", categoryBn: "ডায়াগনসিস",
        title: "Consultation & Digital Diagnosis",
        titleBn: "কনসালটেশন ও ডিজিটাল ডায়াগনসিস",
        description:
          "Where every treatment starts: digital imaging, 3D scanning and a face-to-face plan you can see and understand before anything begins.",
        descriptionBn:
          "প্রতিটি চিকিৎসা এখানেই শুরু — ডিজিটাল ইমেজিং, থ্রিডি স্ক্যানিং এবং মুখোমুখি আলোচনায় পরিকল্পনা, যা শুরু করার আগেই আপনি দেখে বুঝে নিতে পারেন।",
        image: "/images/facility-tech.png",
        imageAlt: "Digital diagnosis room with X-ray unit and intraoral scanner",
        equipment: [
          "Digital X-ray",
          "Intraoral 3D scanner",
          "Digital Smile Design workstation",
          "Treatment-planning display",
        ],
        equipmentBn: [
          "ডিজিটাল এক্স-রে",
          "ইন্ট্রাওরাল থ্রিডি স্ক্যানার",
          "ডিজিটাল স্মাইল ডিজাইন ওয়ার্কস্টেশন",
          "ট্রিটমেন্ট প্ল্যানিং ডিসপ্লে",
        ],
        featured: true,
      },
      {
        id: "treatment",
        category: "Treatment Rooms", categoryBn: "ট্রিটমেন্ট রুম",
        title: "General Treatment Room",
        titleBn: "জেনারেল ট্রিটমেন্ট রুম",
        description:
          "The everyday operatory — fillings, scaling, root canal treatment and extractions, with a fresh single-use kit opened for every patient.",
        descriptionBn:
          "প্রতিদিনের চিকিৎসা কক্ষ — ফিলিং, স্কেলিং, রুট ক্যানেল ও টুথ এক্সট্র্যাকশন; প্রতিটি রোগীর জন্য নতুন সিঙ্গেল-ইউজ কিট খোলা হয়।",
        imageAlt: "General dental treatment room with modern dental chair",
        equipment: [
          "Dental chair with LED operatory light",
          "Ultrasonic scaler",
          "Endodontic (root canal) rotary system",
          "Single-use disposable patient kit",
        ],
        equipmentBn: [
          "এলইডি অপারেটরি লাইটসহ ডেন্টাল চেয়ার",
          "আল্ট্রাসনিক স্কেলার",
          "এন্ডোডন্টিক (রুট ক্যানেল) রোটারি সিস্টেম",
          "সিঙ্গেল-ইউজ ডিসপোজেবল কিট",
        ],
        featured: true,
      },
      {
        id: "ortho",
        category: "Treatment Rooms", categoryBn: "ট্রিটমেন্ট রুম",
        title: "Orthodontic & Aligner Bay",
        titleBn: "অর্থোডন্টিক ও অ্যালাইনার বে",
        description:
          "Dr. Shazia Khanam's core specialty: braces, self-ligating systems and clear aligners, planned digitally and reviewed with progress photography at every visit.",
        descriptionBn:
          "ডা. শাজিয়া খানমের মূল বিশেষত্ব — ব্রেসেস, সেলফ-লিগেটিং সিস্টেম ও ক্লিয়ার অ্যালাইনার; ডিজিটালি পরিকল্পিত এবং প্রতিটি ভিজিটে প্রোগ্রেস ফটোগ্রাফিতে পর্যালোচনা।",
        imageAlt: "Orthodontic bay for braces and clear aligner fitting",
        equipment: [
          "Self-ligating braces system",
          "Clear aligner fitting sets",
          "Orthodontic pliers & instruments",
          "Progress photography setup",
        ],
        equipmentBn: [
          "সেলফ-লিগেটিং ব্রেসেস সিস্টেম",
          "ক্লিয়ার অ্যালাইনার ফিটিং সেট",
          "অর্থোডন্টিক প্লায়ার ও ইন্সট্রুমেন্ট",
          "প্রোগ্রেস ফটোগ্রাফি সেটআপ",
        ],
        featured: true,
      },
      {
        id: "kids",
        category: "Kids", categoryBn: "শিশু কক্ষ",
        title: "Children's Dental Room",
        titleBn: "শিশুদের ডেন্টাল রুম",
        description:
          "A room designed to remove fear: child-scaled furniture, a friendly layout and nitrous oxide sedation support for anxious young patients.",
        descriptionBn:
          "ভয় দূর করার জন্য তৈরি কক্ষ — শিশুদের মাপে আসবাব, বন্ধুত্বপূর্ণ পরিবেশ এবং উদ্বিগ্ন শিশুদের জন্য নাইট্রাস অক্সাইড সিডেশনের ব্যবস্থা।",
        image: "/images/facility-kids.png",
        imageAlt: "Child-friendly pediatric dental room at Aristocrat Dental Care",
        equipment: [
          "Child-friendly interior & seating",
          "Nitrous oxide sedation support",
          "Pediatric instrument set",
          "Preventive care (fluoride & sealants)",
        ],
        equipmentBn: [
          "শিশু-বান্ধব ইন্টেরিয়র ও আসন",
          "নাইট্রাস অক্সাইড সিডেশন ব্যবস্থা",
          "পেডিয়াট্রিক ইন্সট্রুমেন্ট সেট",
          "প্রতিরোধমূলক চিকিৎসা (ফ্লোরাইড ও সিল্যান্ট)",
        ],
        featured: true,
      },
      {
        id: "sterile",
        category: "Sterilization", categoryBn: "স্টেরিলাইজেশন",
        title: "Sterilization & Utility Room",
        titleBn: "স্টেরিলাইজেশন ও ইউটিলিটি রুম",
        description:
          "The backbone of the clinic: instruments are cleaned, pouched, autoclaved and stored under a documented international hygiene protocol.",
        descriptionBn:
          "ক্লিনিকের মূল ভিত্তি — যন্ত্রপাতি পরিষ্কার, পাউচে সিল করে অটোক্লেভে স্টেরিলাইজ এবং লিখিত আন্তর্জাতিক হাইজিন প্রোটোকল অনুযায়ী সংরক্ষণ করা হয়।",
        image: "/images/facility-sterile.png",
        imageAlt: "Sterilization room with autoclave and sealed instrument pouches",
        equipment: [
          "Class B autoclave",
          "Ultrasonic cleaner",
          "Sealed instrument pouches",
          "Single-use disposables",
        ],
        equipmentBn: [
          "ক্লাস বি অটোক্লেভ",
          "আল্ট্রাসনিক ক্লিনার",
          "সিলড ইন্সট্রুমেন্ট পাউচ",
          "সিঙ্গেল-ইউজ ডিসপোজেবল",
        ],
        featured: true,
      },
      {
        id: "whitening",
        category: "Treatment Rooms", categoryBn: "ট্রিটমেন্ট রুম",
        title: "Whitening & Cosmetic Suite",
        titleBn: "হোয়াইটেনিং ও কসমেটিক স্যুট",
        description:
          "Veneers, smile design and whitening — including the Polus Advanced Whitening Accelerator, a LED + halogen system imported from the USA.",
        descriptionBn:
          "ভিনিয়ার, স্মাইল ডিজাইন ও হোয়াইটেনিং — যুক্তরাষ্ট্র থেকে আনা পোলাস অ্যাডভান্সড হোয়াইটেনিং অ্যাক্সিলারেটর (এলইডি + হ্যালোজেন সিস্টেম) সহ।",
        imageAlt: "Cosmetic dentistry suite for veneers and teeth whitening",
        equipment: [
          "Polus Advanced Whitening Accelerator (USA)",
          "LED + halogen whitening light",
          "Veneer & smile-design kit",
          "Shade-matching kit",
        ],
        equipmentBn: [
          "পোলাস অ্যাডভান্সড হোয়াইটেনিং অ্যাক্সিলারেটর (যুক্তরাষ্ট্র)",
          "এলইডি + হ্যালোজেন হোয়াইটেনিং লাইট",
          "ভিনিয়ার ও স্মাইল-ডিজাইন কিট",
          "শেড ম্যাচিং কিট",
        ],
        featured: false,
      },
      {
        id: "surgery",
        category: "Treatment Rooms", categoryBn: "ট্রিটমেন্ট রুম",
        title: "Implant & Surgical Suite",
        titleBn: "ইমপ্ল্যান্ট ও সার্জিক্যাল স্যুট",
        description:
          "Guided implant placement and minor oral surgery, performed with digitally planned guides and laser-assisted precision.",
        descriptionBn:
          "গাইডেড ইমপ্ল্যান্ট ও ছোট ওরাল সার্জারি — ডিজিটালি পরিকল্পিত গাইড এবং লেজার-সহায়ক নিখুঁততায় সম্পন্ন।",
        imageAlt: "Implant and oral surgery suite with guided implant kit",
        equipment: [
          "Guided implant surgery kit",
          "Surgical handpiece & physiodispenser",
          "Laser dentistry unit",
          "Sterile surgical drape set",
        ],
        equipmentBn: [
          "গাইডেড ইমপ্ল্যান্ট সার্জারি কিট",
          "সার্জিক্যাল হ্যান্ডপিস ও ফিজিওডিসপেনসার",
          "লেজার ডেন্টিস্ট্রি ইউনিট",
          "স্টেরাইল সার্জিক্যাল ড্রেপ সেট",
        ],
        featured: false,
      },
    ],
    valuesEyebrow: a.valuesEyebrow, valuesEyebrowBn: ab.valuesEyebrow,
    valuesTitle: a.valuesTitle, valuesTitleBn: ab.valuesTitle,
    values: a.values.map((v, i) => ({
      icon: ["BadgeCheck", "ShieldCheck", "HeartHandshake", "Award"][i] ?? "BadgeCheck",
      title: v.title, titleBn: ab.values[i]?.title,
      description: v.description, descriptionBn: ab.values[i]?.description,
    })),
    specialistsTitle: a.specialistsTitle, specialistsTitleBn: ab.specialistsTitle,
    specialistsDescription: a.specialistsDescription, specialistsDescriptionBn: ab.specialistsDescription,
    ctaTitle: a.ctaTitle, ctaTitleBn: ab.ctaTitle,
    ctaDescription: a.ctaDescription, ctaDescriptionBn: ab.ctaDescription,
  };
}

/* Defensive healer for About blobs saved before a field existed.
   deepMerge replaces ARRAYS wholesale, so an old blob's timeline items
   keep lacking year/icon even after merging — refill per-index from
   the defaults so the public bundle is always complete. */
export function normalizeAboutContent(about: AboutContent): AboutContent {
  const defaults = defaultAboutContent();
  const obj = (v: unknown): Record<string, unknown> =>
    v !== null && typeof v === "object" ? (v as Record<string, unknown>) : {};
  const timeline = (Array.isArray(about.timeline) ? about.timeline : defaults.timeline).map(
    (t, i) => {
      const raw = obj(t);
      return {
        year: str(raw.year) || defaults.timeline[i]?.year || "2024",
        icon: str(raw.icon) || defaults.timeline[i]?.icon || "Sparkles",
        title: str(raw.title),
        titleBn: ostr(raw.titleBn),
        description: str(raw.description),
        descriptionBn: ostr(raw.descriptionBn),
      };
    }
  );
  const storyStats = Array.isArray(about.storyStats)
    ? about.storyStats.map((s) => {
        const raw = obj(s);
        return {
          value: str(raw.value),
          label: str(raw.label),
          labelBn: ostr(raw.labelBn),
        };
      })
    : defaults.storyStats;

  /* ---- Founder dossier ------------------------------------------------
     A blob saved before these fields existed has NO key at all (undefined)
     — heal it from the researched defaults. A key that exists but is an
     empty array is a deliberate owner choice and is preserved. */
  const founderBio = (v: unknown, fallback: string[]): string[] =>
    v === undefined ? fallback : Array.isArray(v) ? v.map((p) => str(p)) : fallback;
  const founderBioBn = (v: unknown, fallback: string[] | undefined): string[] | undefined =>
    v === undefined ? fallback : Array.isArray(v) ? v.map((p) => str(p)) : fallback;

  const founderEducation: FounderEducationItem[] =
    about.founderEducation === undefined
      ? defaults.founderEducation ?? []
      : (Array.isArray(about.founderEducation) ? about.founderEducation : []).map((e) => {
          const raw = obj(e);
          return {
            degree: str(raw.degree),
            degreeBn: ostr(raw.degreeBn),
            institution: ostr(raw.institution),
            institutionBn: ostr(raw.institutionBn),
            year: ostr(raw.year),
            detail: ostr(raw.detail),
            detailBn: ostr(raw.detailBn),
          };
        });

  const founderCredentials: FounderCredentialItem[] =
    about.founderCredentials === undefined
      ? defaults.founderCredentials ?? []
      : (Array.isArray(about.founderCredentials) ? about.founderCredentials : []).map((c) => {
          const raw = obj(c);
          return {
            title: str(raw.title),
            titleBn: ostr(raw.titleBn),
            issuer: ostr(raw.issuer),
            issuerBn: ostr(raw.issuerBn),
            year: ostr(raw.year),
          };
        });

  const founderMilestones: FounderMilestoneItem[] =
    about.founderMilestones === undefined
      ? defaults.founderMilestones ?? []
      : (Array.isArray(about.founderMilestones) ? about.founderMilestones : []).map((m) => {
          const raw = obj(m);
          return {
            year: ostr(raw.year),
            title: str(raw.title),
            titleBn: ostr(raw.titleBn),
            description: ostr(raw.description),
            descriptionBn: ostr(raw.descriptionBn),
          };
        });

  /* ---- Clinic rooms ---------------------------------------------------
     Rooms need a stable id (React keys + lightbox), a category for the
     filter chips and an equipment array; anything missing is filled in
     without dropping the owner's own text. */
  const clinicRooms: ClinicRoom[] =
    about.clinicRooms === undefined
      ? defaults.clinicRooms ?? []
      : (Array.isArray(about.clinicRooms) ? about.clinicRooms : []).map((r, i) => {
          const raw = obj(r);
          const equipment = Array.isArray(raw.equipment)
            ? raw.equipment.map((x) => str(x)).filter(Boolean)
            : [];
          const equipmentBn = Array.isArray(raw.equipmentBn)
            ? raw.equipmentBn.map((x) => str(x)).filter(Boolean)
            : undefined;
          return {
            id: str(raw.id).trim() || `room-${i + 1}`,
            category: str(raw.category).trim() || "Clinic",
            categoryBn: ostr(raw.categoryBn),
            title: str(raw.title),
            titleBn: ostr(raw.titleBn),
            description: str(raw.description),
            descriptionBn: ostr(raw.descriptionBn),
            image: ostr(raw.image),
            imageAlt: ostr(raw.imageAlt),
            equipment,
            equipmentBn,
            featured: raw.featured === true,
          };
        });

  return {
    ...about,
    timeline,
    storyStats,
    founderName: str(about.founderName).trim() || defaults.founderName,
    founderImage:
      about.founderImage === undefined ? defaults.founderImage : str(about.founderImage),
    founderImageAlt:
      about.founderImageAlt === undefined ? defaults.founderImageAlt : str(about.founderImageAlt),
    founderYears: str(about.founderYears).trim() || defaults.founderYears,
    founderYearsLabel: str(about.founderYearsLabel) || defaults.founderYearsLabel,
    founderBio: founderBio(about.founderBio, defaults.founderBio ?? []),
    founderBioBn: founderBioBn(about.founderBioBn, defaults.founderBioBn),
    founderEducation,
    founderCredentials,
    founderMilestones,
    clinicRooms,
  };
}

export function defaultSettings(): SiteSettings {
  return {
    name: site.name,
    shortName: site.shortName,
    tagline: site.tagline,
    taglineBn: site.taglineBn,
    phone: site.phone,
    phoneRaw: site.phoneRaw,
    emergencyPhone: site.emergencyPhone,
    email: site.email,
    address: site.address,
    addressShort: site.addressShort,
    hours: site.hours,
    hoursBn: bn.footer.hours,
    hoursFriday: site.hoursFriday,
    hoursFridayBn: undefined,
    established: site.established,
    patientsServed: site.patientsServed,
    facebook: site.social.facebook,
    instagram: site.social.instagram,
    linkedin: site.social.linkedin,
    heroVideoUrls: [...heroVideoUrls],
  };
}

/* ------------------------------------------------------------------ */
/*  The full bundle served to the public site                          */
/* ------------------------------------------------------------------ */

export type ContentBundle = {
  doctors: Doctor[];
  posts: BlogPost[];
  faqs: FAQ[];
  cases: SmileCase[];
  services: Service[];
  heroSlides: HeroSlide[];
  /* Admin-managed per-page hero backdrops, keyed by route segment
     (about / services / doctors / blog / contact / gallery / faqs /
     appointment). Empty record → pages use their curated static sets. */
  pageHeroSlides: Record<string, HeroSlide[]>;
  home: HomeContent;
  about: AboutContent;
  settings: SiteSettings;
};

export function staticBundle(): ContentBundle {
  const settings = defaultSettings();
  const videos = settings.heroVideoUrls
    .map(parseYouTubeId)
    .filter((id): id is string => Boolean(id))
    .map((id) => ({ type: "youtube", id }) as HeroSlide);
  return {
    doctors: staticDoctors,
    posts: staticPosts,
    faqs: staticFaqs,
    cases: staticCases,
    services: staticServices,
    heroSlides: buildHeroSlides(homeHeroImages, videos),
    pageHeroSlides: {},
    home: defaultHomeContent(),
    about: defaultAboutContent(),
    settings,
  };
}


/* ------------------------------------------------------------------ */
/*  Deep merge — DB sparse overrides over defaults                     */
/* ------------------------------------------------------------------ */

export function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (Array.isArray(base) || Array.isArray(override)) {
    /* Arrays are replaced wholesale (never merged item-by-item). */
    return (Array.isArray(override) ? override : base) as T;
  }
  if (typeof base === "object" && typeof override === "object" && base !== null) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
      const b = (base as Record<string, unknown>)[k];
      out[k] = b !== undefined && b !== null && typeof b === "object" && !Array.isArray(b) && v !== null && typeof v === "object" && !Array.isArray(v)
        ? deepMerge(b, v)
        : v;
    }
    return out as T;
  }
  return (override as T) ?? base;
}

export function featuredServices(list: Service[], count = 4): Service[] {
  const f = list.filter((s) => s.featured);
  return (f.length >= count ? f : [...f, ...list.filter((s) => !s.featured)]).slice(0, count);
}

/* ------------------------------------------------------------------ */
/*  Safe JSON helpers                                                  */
/* ------------------------------------------------------------------ */

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const v = JSON.parse(raw);
    return (v === null || v === undefined) ? fallback : (v as T);
  } catch {
    return fallback;
  }
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function ostr(v: unknown): string | undefined {
  const s = str(v).trim();
  return s.length ? s : undefined;
}

function num(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function bool(v: unknown): boolean | undefined {
  return typeof v === "boolean" ? v : undefined;
}

/* ------------------------------------------------------------------ */
/*  Row → domain mappers (shapes returned by admin GET endpoints)      */
/* ------------------------------------------------------------------ */

export type DoctorRow = {
  id: string; slug: string; legacyId: number; sort: number; name: string;
  credentials: string[]; role: string; roleBn?: string; department: string; departmentBn?: string;
  bio: string; experienceYears: number; patientsTreated: number; rating: number;
  specializations: string[]; languages: string[]; consultationDays: string[];
  accent: string; photo?: string; active: boolean;
  /* Round 17-a dossier fields (all optional for older rows). */
  education?: DoctorEducation[];
  memberships?: string[];
  awards?: DoctorAward[];
  quote?: string;
  quoteBn?: string;
  focusServices?: string[];
};

type RawDoctor = Record<string, unknown> & {
  credentialsJson?: string; specializationsJson?: string; languagesJson?: string;
  consultationDaysJson?: string; educationJson?: string; membershipsJson?: string;
  awardsJson?: string; focusServicesJson?: string;
};

/* Defensive parsers for the dossier JSON columns — malformed or
   shape-mismatched entries are dropped rather than crashing the page. */
function parseEducation(raw: string | null | undefined): DoctorEducation[] | undefined {
  const list = parseJson<unknown[]>(raw, []);
  if (!Array.isArray(list)) return undefined;
  const entries = list.flatMap((e) => {
    if (typeof e !== "object" || e === null) return [];
    const rec = e as Record<string, unknown>;
    const degree = typeof rec.degree === "string" ? rec.degree.trim() : "";
    if (!degree) return [];
    return [{ degree, institution: ostr(rec.institution), year: ostr(rec.year) }];
  });
  return entries.length ? entries : undefined;
}

function parseAwards(raw: string | null | undefined): DoctorAward[] | undefined {
  const list = parseJson<unknown[]>(raw, []);
  if (!Array.isArray(list)) return undefined;
  const entries = list.flatMap((e) => {
    if (typeof e !== "object" || e === null) return [];
    const rec = e as Record<string, unknown>;
    const title = typeof rec.title === "string" ? rec.title.trim() : "";
    if (!title) return [];
    return [{ title, year: ostr(rec.year) }];
  });
  return entries.length ? entries : undefined;
}

export function mapDoctor(row: RawDoctor): DoctorRow {
  return {
    id: str(row.id),
    slug: str(row.slug),
    legacyId: num(row.legacyId, 0),
    sort: num(row.sort, 0),
    name: str(row.name),
    credentials: parseJson<string[]>(row.credentialsJson, []),
    role: str(row.role),
    roleBn: ostr(row.roleBn),
    department: str(row.department),
    departmentBn: ostr(row.departmentBn),
    bio: str(row.bio),
    experienceYears: num(row.experienceYears, 1),
    patientsTreated: num(row.patientsTreated, 0),
    rating: num(row.rating, 4.8),
    specializations: parseJson<string[]>(row.specializationsJson, []),
    languages: parseJson<string[]>(row.languagesJson, ["Bangla", "English"]),
    consultationDays: parseJson<string[]>(row.consultationDaysJson, []),
    accent: str(row.accent, "#012c5f"),
    photo: ostr(row.photo),
    active: row.active === undefined ? true : Boolean(row.active),
    education: parseEducation(row.educationJson),
    memberships: (() => {
      const list = parseJson<string[]>(row.membershipsJson, []);
      return list.length ? list : undefined;
    })(),
    awards: parseAwards(row.awardsJson),
    quote: ostr(row.quote),
    quoteBn: ostr(row.quoteBn),
    focusServices: (() => {
      const list = parseJson<string[]>(row.focusServicesJson, []);
      return list.length ? list : undefined;
    })(),
  };
}

/** DB DoctorRow → public Doctor type (as consumed by the site). */
export function doctorRowToDoctor(row: DoctorRow): Doctor {
  const numericId = row.legacyId || Math.abs(
    Array.from(row.id).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7)
  ) % 100000;
  return {
    slug: row.slug,
    id: numericId,
    name: row.name,
    credentials: row.credentials,
    role: row.role,
    roleBn: row.roleBn,
    department: row.department,
    departmentBn: row.departmentBn,
    bio: row.bio,
    experienceYears: row.experienceYears,
    patientsTreated: row.patientsTreated,
    rating: row.rating,
    specializations: row.specializations,
    languages: row.languages,
    consultationDays: row.consultationDays,
    verified: true,
    accent: row.accent,
    photo: row.photo,
    education: row.education,
    memberships: row.memberships,
    awards: row.awards,
    quote: row.quote,
    quoteBn: row.quoteBn,
    focusServices: row.focusServices,
  };
}

export type BlogRow = {
  id: string; slug: string; title: string; titleBn?: string; excerpt: string; excerptBn?: string;
  category: string; readTime: string; date: string; updated?: string; author: string;
  authorCredentials: string; featured: boolean; tags: string[]; serviceRefs?: string[];
  image?: string; imageAlt?: string; quickAnswer: string; quickAnswerBn?: string;
  sections: BlogPost["sections"]; sectionsBn?: BlogPost["sections"];
  status: "PUBLISHED" | "DRAFT";
};

type RawPost = Record<string, unknown> & { tagsJson?: string; serviceRefsJson?: string; sectionsJson?: string; sectionsBnJson?: string };

const emptySections: BlogPost["sections"] = [];

export function mapBlogPost(row: RawPost): BlogRow {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
    titleBn: ostr(row.titleBn),
    excerpt: str(row.excerpt),
    excerptBn: ostr(row.excerptBn),
    category: str(row.category, "General"),
    readTime: str(row.readTime, "5 min read"),
    date: str(row.date),
    updated: ostr(row.updated),
    author: str(row.author, "Dr. Shazia Khanam"),
    authorCredentials: str(row.authorCredentials, "BDS, MDS"),
    featured: Boolean(row.featured),
    tags: parseJson<string[]>(row.tagsJson, []),
    serviceRefs: parseJson<string[] | null>(row.serviceRefsJson, null) ?? undefined,
    image: ostr(row.image),
    imageAlt: ostr(row.imageAlt),
    quickAnswer: str(row.quickAnswer),
    quickAnswerBn: ostr(row.quickAnswerBn),
    sections: parseJson<BlogPost["sections"]>(row.sectionsJson, emptySections),
    sectionsBn: parseJson<BlogPost["sections"] | null>(row.sectionsBnJson, null) ?? undefined,
    status: row.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
  };
}

export function blogRowToPost(row: BlogRow): BlogPost {
  const { id: _id, status: _status, ...rest } = row;
  return { ...rest, updated: rest.updated ?? rest.date };
}

export type FaqRow = {
  id: string; sort: number; question: string; questionBn?: string;
  answer: string; answerBn?: string; active: boolean;
};

export function mapFaq(row: Record<string, unknown>): FaqRow {
  return {
    id: str(row.id),
    sort: num(row.sort, 0),
    question: str(row.question),
    questionBn: ostr(row.questionBn),
    answer: str(row.answer),
    answerBn: ostr(row.answerBn),
    active: row.active === undefined ? true : Boolean(row.active),
  };
}

export type CaseRow = {
  id: string; slug: string; sort: number; treatment: string; category: SmileCase["category"];
  serviceSlug?: string; beforeSrc: string; afterSrc: string; beforeAlt?: string; afterAlt?: string;
  title: string; patient: string; age: number; duration: string; procedures: string[];
  result: string; featured: boolean;
};

export function mapCase(row: Record<string, unknown>): CaseRow {
  const cat = str(row.category, "Cosmetic");
  const validCats = ["Cosmetic", "Orthodontics", "Restorative", "Preventive"] as const;
  return {
    id: str(row.id),
    slug: str(row.slug),
    sort: num(row.sort, 0),
    treatment: str(row.treatment),
    category: (validCats as readonly string[]).includes(cat) ? (cat as SmileCase["category"]) : "Cosmetic",
    serviceSlug: ostr(row.serviceSlug),
    beforeSrc: str(row.beforeSrc),
    afterSrc: str(row.afterSrc),
    beforeAlt: ostr(row.beforeAlt),
    afterAlt: ostr(row.afterAlt),
    title: str(row.title),
    patient: str(row.patient),
    age: num(row.age, 30),
    duration: str(row.duration),
    procedures: parseJson<string[]>(row.proceduresJson as string, []),
    result: str(row.result),
    featured: Boolean(row.featured),
  };
}

export function caseRowToSmileCase(row: CaseRow): SmileCase {
  return {
    id: row.slug,
    treatment: row.treatment,
    category: row.category,
    serviceSlug: row.serviceSlug ?? "",
    beforeSrc: row.beforeSrc,
    afterSrc: row.afterSrc,
    beforeAlt: row.beforeAlt ?? row.title,
    afterAlt: row.afterAlt ?? row.title,
    title: row.title,
    patient: row.patient,
    age: row.age,
    duration: row.duration,
    procedures: row.procedures,
    result: row.result,
    featured: row.featured,
  };
}

/* Service overlay: DB overlay (sparse) applied over the static base. */
type RawServiceContent = Record<string, unknown> & {
  overviewJson?: string; benefitsJson?: string; processJson?: string; idealJson?: string; faqsJson?: string;
};

export function applyServiceOverlay(base: Service, o: RawServiceContent): Service {
  const benefits = parseJson<Service["benefits"] | null>(o.benefitsJson, null);
  const process = parseJson<Service["process"] | null>(o.processJson, null);
  const faqs = parseJson<Service["faqs"] | null>(o.faqsJson, null);
  return {
    ...base,
    name: str(o.name, base.name),
    nameBn: ostr(o.nameBn) ?? base.nameBn,
    shortName: str(o.shortName, base.shortName),
    shortNameBn: ostr(o.shortNameBn) ?? base.shortNameBn,
    icon: str(o.icon, base.icon) || base.icon,
    image: ostr(o.image) ?? base.image,
    tagline: str(o.tagline, base.tagline),
    taglineBn: ostr(o.taglineBn) ?? base.taglineBn,
    excerpt: str(o.excerpt, base.excerpt),
    excerptBn: ostr(o.excerptBn) ?? base.excerptBn,
    overview: parseJson<string[] | null>(o.overviewJson, null) ?? base.overview,
    benefits: Array.isArray(benefits) && benefits.length ? benefits : base.benefits,
    process: Array.isArray(process) && process.length ? process : base.process,
    ideal: parseJson<string[] | null>(o.idealJson, null) ?? base.ideal,
    faqs: Array.isArray(faqs) && faqs.length ? faqs : base.faqs,
    duration: str(o.duration, base.duration),
    longevity: str(o.longevity, base.longevity),
    anesthesia: str(o.anesthesia, base.anesthesia),
    featured: bool(o.featured) ?? base.featured,
  };
}

export type HeroSlideRow = {
  id: string; scope: string; sort: number; kind: "image" | "youtube";
  src: string; alt?: string; active: boolean;
};

export function mapHeroSlide(row: Record<string, unknown>): HeroSlideRow {
  const src = str(row.src);
  let kind: "image" | "youtube" = str(row.kind, "image") === "youtube" ? "youtube" : "image";
  if (kind === "image" && parseYouTubeId(src)) kind = "youtube";
  return {
    id: str(row.id),
    scope: str(row.scope, "home"),
    sort: num(row.sort, 0),
    kind,
    src,
    alt: ostr(row.alt),
    active: row.active === undefined ? true : Boolean(row.active),
  };
}

export function heroSlideRowToSlide(row: HeroSlideRow): HeroSlide {
  if (row.kind === "youtube") {
    const id = parseYouTubeId(row.src);
    if (id) return { type: "youtube", id };
    return { type: "image", src: row.src, alt: row.alt ?? "" };
  }
  return { type: "image", src: row.src, alt: row.alt ?? "" };
}

export function buildHomeHeroSlides(rows: HeroSlideRow[], videoUrls: string[]): HeroSlide[] {
  const images = rows
    .filter((r) => r.active && r.kind === "image")
    .sort((a, b) => a.sort - b.sort)
    .map(heroSlideRowToSlide);
  const dbVideos = rows
    .filter((r) => r.active && r.kind === "youtube")
    .sort((a, b) => a.sort - b.sort)
    .map(heroSlideRowToSlide)
    .filter((s) => s.type === "youtube");
  const settingsVideos = videoUrls
    .map(parseYouTubeId)
    .filter((id): id is string => Boolean(id))
    .map((id) => ({ type: "youtube", id }) as HeroSlide);
  const slides = buildHeroSlides(images, [...dbVideos, ...settingsVideos]);
  return slides.length ? slides : buildHeroSlides(homeHeroImages, settingsVideos);
}

/* Page-scope slides: active rows in sort order (images + YouTube both OK).
   Used for the per-page hero backdrops managed from the admin panel. */
export function buildPageHeroSlides(rows: HeroSlideRow[]): HeroSlide[] {
  return rows
    .filter((r) => r.active)
    .sort((a, b) => a.sort - b.sort)
    .map(heroSlideRowToSlide)
    .filter((s) => (s.type === "youtube" ? Boolean(s.id) : Boolean(s.src)));
}

/* ------------------------------------------------------------------ */
/*  Testimonials remain static (patient-submitted reviews live in the  */
/*  Review table and are moderated from the admin panel).              */
/* ------------------------------------------------------------------ */
export { staticTestimonials as testimonials };

/* ------------------------------------------------------------------ */
/*  Bilingual field resolution: prefer the Bangla twin when the site  */
/*  is in Bangla mode AND a non-empty twin exists.                     */
/* ------------------------------------------------------------------ */
export function pickBn<T>(en: T, bn: T | undefined | null, isBn: boolean): T {
  return isBn && bn !== undefined && bn !== null ? bn : en;
}
