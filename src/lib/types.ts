/* ------------------------------------------------------------------ */
/*  Type definitions for the Aristocrat Dental Care website            */
/* ------------------------------------------------------------------ */

export type ServiceCategory =
  | "Restorative"
  | "Cosmetic"
  | "Orthodontics"
  | "Surgical"
  | "Preventive";

export type Service = {
  slug: string;
  name: string;
  /* Bangla variants (optional — falls back to English) */
  nameBn?: string;
  shortName: string;
  shortNameBn?: string;
  category: ServiceCategory;
  icon: string; // lucide icon key mapped in components
  /* Relevant hero/cover image for cards + detail hero backdrop */
  image?: string;
  tagline: string;
  taglineBn?: string;
  excerpt: string;
  excerptBn?: string;
  overview: string[];
  benefits: { title: string; description: string }[];
  process: { step: string; title: string; description: string }[];
  ideal: string[];
  duration: string;
  longevity: string;
  anesthesia: string;
  faqs: { question: string; answer: string }[];
  related: string[]; // slugs
  featured?: boolean;
};

/* Education & training timeline entry (doctor dossier). */
export type DoctorEducation = {
  degree: string;
  institution?: string;
  year?: string;
};

/* Award / recognition entry (doctor dossier). */
export type DoctorAward = {
  title: string;
  year?: string;
};

export type Doctor = {
  slug: string;
  id: number;
  name: string;
  credentials: string[];
  role: string;
  roleBn?: string;
  department: string;
  departmentBn?: string;
  bio: string;
  experienceYears: number;
  patientsTreated: number;
  rating: number;
  specializations: string[];
  languages: string[];
  consultationDays: string[];
  verified: true;
  accent: string;
  /* Portrait photo (round avatars / profile hero) — local path
     (/images/..., /uploads/...) or any URL; initials fallback when unset. */
  photo?: string;
  /* Round 17-a — enriched profile dossier (all optional:
     older rows simply skip these sections). */
  education?: DoctorEducation[];
  memberships?: string[];
  awards?: DoctorAward[];
  quote?: string;
  quoteBn?: string;
  /* Service slugs this doctor focuses on — rendered as links to
     /services/<slug>. Must exist in services.ts. */
  focusServices?: string[];
};

export type Testimonial = {
  name: string;
  location?: string;
  rating: number;
  text: string;
  treatment?: string;
  language?: "en" | "bn";
};

export type FAQ = {
  question: string;
  answer: string;
  questionBn?: string;
  answerBn?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  updated: string;
  author: string;
  authorCredentials: string;
  featured?: boolean;
  tags: string[];
  /* Curated related-treatment slugs for cross-linking (must exist in services.ts) */
  serviceRefs?: string[];
  /* Cover image path in /public */
  image?: string;
  imageAlt?: string;
  /* AEO: quick answer box at top of article */
  quickAnswer: string;
  sections: {
    heading: string;
    body: string[];
    list?: string[];
  }[];
  /* Bangla variants (optional — falls back to English).
     sectionsBn must mirror sections 1:1 (same length, order, paragraph counts). */
  titleBn?: string;
  excerptBn?: string;
  quickAnswerBn?: string;
  sectionsBn?: {
    heading: string;
    body: string[];
    list?: string[];
  }[];
};

export type AppointmentPayload = {
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  doctorSlug?: string;
  serviceSlug?: string;
  notes?: string;
};

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};
