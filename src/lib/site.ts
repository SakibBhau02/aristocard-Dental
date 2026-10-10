/* ------------------------------------------------------------------ */
/*  Aristocrat Dental Care & Orthodontic Center — Site Configuration   */
/* ------------------------------------------------------------------ */

export const site = {
  name: "Aristocrat Dental Care & Orthodontic Center",
  shortName: "Aristocrat Dental Care",
  tagline: "Excellence in Every Smile!",
  taglineBn: "প্রতিটি হাসিতে শ্রেষ্ঠত্ব!",
  description:
    "Modern & well-equipped dental clinic in Uttara, Dhaka with advanced technology, strict sterilization protocols and specialist dentists.",
  phone: "01715-027522",
  phoneRaw: "+8801715027522",
  emergencyPhone: "+8801601000950",
  email: "aristocratdentalcare01@gmail.com",
  address: "Aristocrat Dental Care & Orthodontic Center, Uttara, Dhaka, Bangladesh",
  addressShort: "Uttara, Dhaka, Bangladesh",
  hours: "Sat – Thu: 10:00 AM – 9:00 PM",
  hoursFriday: "Friday: Closed (Emergency on call)",
  established: 2019,
  patientsServed: 50000,
  social: {
    facebook: "https://www.facebook.com/aristocratdental",
    instagram: "https://www.instagram.com/aristocratdentalcare01",
    linkedin:
      "https://www.linkedin.com/company/aristocrat-dental-care-orthodontic-center",
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "#/" },
  { label: "About Us", href: "#/about" },
  { label: "Services", href: "#/services" },
  { label: "Gallery", href: "#/gallery" },
  { label: "Doctors", href: "#/doctors" },
  { label: "Blog", href: "#/blog" },
  { label: "Contact", href: "#/contact" },
];

/* Stats used across hero / about / footer */
export const clinicStats = [
  { value: 50000, suffix: "+", label: "Happy Patients" },
  { value: 11, suffix: "+", label: "Specialty Services" },
  { value: 4, suffix: "+", label: "Expert Dentists" },
  { value: 4.9, suffix: "/5", label: "Patient Rating", decimals: 1 },
] as const;

/* Why-choose-us highlights */
export const highlights = [
  {
    icon: "ShieldCheck",
    title: "Strict Sterilization",
    description:
      "Hospital-grade autoclave sterilization and single-use disposables for every patient — your safety is non-negotiable.",
  },
  {
    icon: "Microscope",
    title: "Advanced Technology",
    description:
      "Digital X-rays, intraoral cameras and laser dentistry for precise diagnoses and minimally invasive treatments.",
  },
  {
    icon: "HeartHandshake",
    title: "Pain-Free Comfort",
    description:
      "Gentle techniques, modern anesthesia and anxiety-easing care that makes every visit calm and stress-free.",
  },
  {
    icon: "BadgeCheck",
    title: "Specialist Dentists",
    description:
      "BDS & MDS qualified consultants in orthodontics, endodontics and oral surgery under one roof.",
  },
] as const;
