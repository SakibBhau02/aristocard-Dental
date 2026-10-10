/* ------------------------------------------------------------------ */
/*  Smile Gallery case studies — shared by the Gallery page and the    */
/*  service detail pages (cross-linked "See real results" sections)    */
/* ------------------------------------------------------------------ */

export type SmileCase = {
  id: string;
  treatment: string;
  category: "Cosmetic" | "Orthodontics" | "Restorative" | "Preventive";
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

export const smileCases: SmileCase[] = [
  {
    id: "case-whitening",
    treatment: "Teeth Whitening",
    category: "Cosmetic",
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
    category: "Orthodontics",
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
    category: "Cosmetic",
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
  {
    id: "case-gum",
    treatment: "Gum Treatment & Scaling",
    category: "Preventive",
    serviceSlug: "periodontal-gum-treatment",
    beforeSrc: "/images/case-before-gum.png",
    afterSrc: "/images/case-after-gum.png",
    beforeAlt: "Teeth with tartar buildup and red swollen gums before periodontal treatment",
    afterAlt: "Clean white teeth with healthy pink gums after scaling and periodontal therapy",
    title: "From bleeding gums to a healthy foundation",
    patient: "M. Rahman",
    age: 38,
    duration: "2 visits over 2 weeks",
    procedures: ["Ultrasonic scaling & deep cleaning", "Localized gum therapy", "Home-care coaching & follow-up"],
    result:
      "Years of tartar and early gum disease reversed — gums firm and pink again, bleeding gone within days. The foundation for every healthy smile starts here.",
  },
  {
    id: "case-implant",
    treatment: "Dental Implant & Crown",
    category: "Restorative",
    serviceSlug: "dental-implants",
    beforeSrc: "/images/case-before-implant.png",
    afterSrc: "/images/case-after-implant.png",
    beforeAlt: "Smile with a missing lateral incisor and stained teeth before dental implant treatment",
    afterAlt: "Complete bright smile with a natural implant crown after dental implant treatment",
    title: "A missing tooth — replaced like it was never gone",
    patient: "A. Chowdhury",
    age: 45,
    duration: "3 visits over 3 months",
    procedures: [
      "Single titanium implant placement",
      "Porcelain-fused-to-zirconia crown",
      "Professional cleaning & polish",
    ],
    result:
      "A missing lateral incisor restored with a titanium implant and hand-finished crown that matches its neighbours in shape, shade and light reflection. Bone preserved, chewing restored, no damage to adjacent teeth.",
  },
  {
    id: "case-kids",
    treatment: "Pediatric Fillings & Care",
    category: "Restorative",
    serviceSlug: "pediatric-dentistry",
    beforeSrc: "/images/case-before-kids.png",
    afterSrc: "/images/case-after-kids.png",
    beforeAlt: "Child's front baby teeth with brown decay spots before pediatric dental treatment",
    afterAlt: "Child's front baby teeth restored with white fillings after pediatric dental treatment",
    title: "Little smile, big rescue",
    patient: "Z. Ahmed",
    age: 8,
    duration: "2 gentle visits",
    procedures: [
      "Tooth-colored composite fillings",
      "Fluoride varnish & sealants",
      "Brushing coaching for parents & child",
    ],
    result:
      "Early childhood decay arrested and restored with white fillings that blend invisibly. Sealants and fluoride guard the adult teeth waiting underneath — and she now asks for her brushing timer.",
  },
];

export function getCasesForService(slug: string): SmileCase[] {
  return smileCases.filter((c) => c.serviceSlug === slug);
}
