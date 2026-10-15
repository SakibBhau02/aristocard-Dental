/* ------------------------------------------------------------------ */
/*  Hero media configuration — sliding images + YouTube video backdrop */
/* ------------------------------------------------------------------ */

export type HeroSlide =
  | { type: "image"; src: string; alt: string }
  | { type: "youtube"; id: string };

/* ------------------------------------------------------------------ */
/*  YOUTUBE VIDEO BACKGROUND (client-configurable)                     */
/* ------------------------------------------------------------------ */
/*
 *  হিরো সেকশনের পেছনে YouTube ভিডিও চালাতে নিচের অ্যারেতে লিংক বা ভিডিও ID
 *  বসিয়ে দিন — যেকোনো ফরম্যাট কাজ করবে:
 *
 *    "https://www.youtube.com/watch?v=VIDEO_ID"
 *    "https://youtu.be/VIDEO_ID"
 *    "https://www.youtube.com/embed/VIDEO_ID"
 *    "https://www.youtube.com/shorts/VIDEO_ID"
 *    "VIDEO_ID"                    (১১-অক্ষরের ID)
 *
 *  একাধিক লিংক দিলে ভিডিওগুলো ছবির স্লাইডের সাথে মিলে ঘুরতে থাকবে —
 *  ভিডিও চলবে পেছনে, আর ছবিগুলো slide করতে থাকবে।
 *  অ্যারে খালি থাকলে শুধুই ছবির স্লাইডশো চলবে (বর্তমান ডিফল্ট)।
 *
 *  Example:
 *    export const heroVideoUrls = [
 *      "https://www.youtube.com/watch?v=abcd1234xyz",
 *    ];
 */
export const heroVideoUrls: string[] = [
  // ← এখানে YouTube লিংক বসান
];

/* ------------------------------------------------------------------ */
/*  YouTube URL → 11-char video ID parser                              */
/* ------------------------------------------------------------------ */

export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  // bare 11-char id
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  // youtu.be/ID, /shorts/ID, /embed/ID, /live/ID, watch?v=ID
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = value.match(re);
    if (m) return m[1];
  }
  return null;
}

/* Parsed video slides from the config above (invalid links skipped) */
export const heroVideoSlides: HeroSlide[] = heroVideoUrls
  .map(parseYouTubeId)
  .filter((id): id is string => Boolean(id))
  .map((id) => ({ type: "youtube", id }) as HeroSlide);

/* ------------------------------------------------------------------ */
/*  Slide sets — home hero + per-page themed backdrops                 */
/* ------------------------------------------------------------------ */

const clinicImg = "/images/hero-clinic.png";
const techImg = "/images/facility-tech.png";
const sterileImg = "/images/facility-sterile.png";
const kidsImg = "/images/facility-kids.png";
const smileImg = "/images/hero-slide-smile.png";
const teamImg = "/images/hero-slide-team.png";
const careImg = "/images/hero-slide-care.png";

export const homeHeroImages: HeroSlide[] = [
  { type: "image", src: careImg, alt: "Dentist consulting a smiling patient at Aristocrat Dental Care" },
  { type: "image", src: smileImg, alt: "Patient with a bright, confident smile" },
  { type: "image", src: clinicImg, alt: "Modern treatment room at Aristocrat Dental Care" },
  { type: "image", src: teamImg, alt: "The dentist team of Aristocrat Dental Care" },
  { type: "image", src: techImg, alt: "Advanced dental technology and equipment" },
];

/* Interleave configured YouTube videos between image slides.
   No videos → images only. */
export function buildHeroSlides(
  images: HeroSlide[],
  videos: HeroSlide[]
): HeroSlide[] {
  if (videos.length === 0) return images;
  const slides: HeroSlide[] = [];
  const perVideo = Math.max(1, Math.floor(images.length / (videos.length + 1)));
  let idx = 0;
  for (const video of videos) {
    slides.push(video);
    for (let j = 0; j < perVideo && idx < images.length; j++) {
      slides.push(images[idx++]);
    }
  }
  while (idx < images.length) slides.push(images[idx++]);
  return slides;
}

export const homeHeroSlides: HeroSlide[] = buildHeroSlides(
  homeHeroImages,
  heroVideoSlides
);

/* Default trio for pages without a specific set */
const defaultSlides: HeroSlide[] = [careImg, teamImg, clinicImg].map((src) => ({
  type: "image",
  src,
  alt: "Aristocrat Dental Care clinic",
}));

const img = (src: string, alt: string): HeroSlide => ({
  type: "image",
  src,
  alt,
});

/* Themed backdrop sets keyed by route segment */
export const pageHeroSlides: Record<string, HeroSlide[]> = {
  about: [
    img(teamImg, "The dentist team of Aristocrat Dental Care"),
    img(sterileImg, "Sterilization room with autoclave"),
    img(clinicImg, "Modern treatment room"),
  ],
  services: [
    img("/images/service-smile-design.png", "Digital smile design consultation"),
    img("/images/service-implants.png", "Dental implant model"),
    img("/images/service-aligners.png", "Clear aligners"),
  ],
  doctors: [
    img(teamImg, "The dentist team of Aristocrat Dental Care"),
    img(careImg, "Dentist consulting a patient"),
    img(techImg, "Advanced dental technology"),
  ],
  blog: [
    img(careImg, "Dentist consulting a patient"),
    img(smileImg, "Patient with a bright smile"),
    img(clinicImg, "Modern treatment room"),
  ],
  contact: [
    img(clinicImg, "Modern treatment room"),
    img(teamImg, "The dentist team of Aristocrat Dental Care"),
    img(sterileImg, "Sterilization room"),
  ],
  gallery: [
    img(smileImg, "Patient with a bright smile"),
    img("/images/case-after-veneers.png", "Smile after porcelain veneers"),
    img("/images/case-after-whitening.png", "Smile after professional whitening"),
  ],
  faqs: [
    img(careImg, "Dentist consulting a patient"),
    img(techImg, "Advanced dental technology"),
    img(smileImg, "Patient with a bright smile"),
  ],
  assessment: [
    img(smileImg, "Patient with a bright smile"),
    img(careImg, "Dentist consulting a patient"),
    img(kidsImg, "Cheerful pediatric dental room"),
  ],
  appointment: [
    img(clinicImg, "Modern treatment room"),
    img(careImg, "Dentist consulting a patient"),
    img(techImg, "Advanced dental technology"),
  ],
  status: [
    img(clinicImg, "Modern treatment room"),
    img(careImg, "Dentist consulting a patient"),
  ],
  admin: [img(clinicImg, "Modern treatment room")],
};

export function slidesForRoute(segment: string): HeroSlide[] {
  return pageHeroSlides[segment] ?? defaultSlides;
}
