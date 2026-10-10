/* ------------------------------------------------------------------ */
/*  EN ⇄ BN dictionary — chrome + home + shared components             */
/*  (Deep page content translates progressively in later rounds.)      */
/* ------------------------------------------------------------------ */

export type Lang = "en" | "bn";

const en = {
  /* ---------------- Chrome (navbar / top bar) ---------------- */
  chrome: {
    hours: "Sat – Thu: 10:00 AM – 9:00 PM",
    hotline: "Hotline:",
    tagline: "Excellence in Every Smile!",
    nav: {
      home: "Home",
      about: "About Us",
      services: "Services",
      gallery: "Gallery",
      doctors: "Doctors",
      blog: "Blog",
      pricing: "Pricing",
      contact: "Contact",
    },
    book: "Book Appointment",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    langLabel: "Language",
    switchToBn: "বাংলায় দেখুন",
    switchToEn: "View in English",
  },

  /* ---------------- Floating contact ---------------- */
  fab: {
    whatsapp: "WhatsApp us",
    book: "Book appointment",
    top: "Scroll back to top",
  },

  /* ---------------- Shared cards / CTA ---------------- */
  shared: {
    learnMore: "Learn more",
    viewProfile: "View Profile",
    yrs: "yrs",
    patients: "patients",
    ctaTitle: "Ready for a healthier, brighter smile?",
    ctaDescription:
      "Book your consultation with our specialist dentists today — modern technology, pain-free care and transparent pricing, all under one roof in Uttara.",
    ctaBook: "Book Appointment Now",
    ctaCall: "Call",
    ctaHours:
      "Open Saturday–Thursday, 10:00 AM – 9:00 PM • Same-week appointments available",
    breadcrumbHome: "Home",
  },

  /* ---------------- Home page ---------------- */
  home: {
    hero: {
      badge: "Advanced Dental Care in Uttara, Dhaka",
      titleA: "Excellence in",
      titleB: "Every Smile",
      description:
        "A modern & well-equipped dental clinic combining advanced technology, strict sterilization and truly gentle care — from routine checkups to complete smile makeovers, all under one roof.",
      ctaBook: "Book Appointment Now",
      ctaExplore: "Explore Services",
      trust: [
        "Pain-free treatment",
        "Strict sterilization",
        "Kids-friendly rooms",
        "Transparent pricing",
      ],
      cardBadge: "Specialist Team",
      cardItems: [
        { title: "Digital Smile Design", note: "Preview your new smile" },
        { title: "Invisalign® Clear Aligners", note: "Invisible orthodontics" },
        { title: "Laser Pain-Free Fillings", note: "Often no injection needed" },
        { title: "Dental Implants", note: "Lifetime tooth replacement" },
      ],
      doctorRole: "BDS, MDS — Chief Dental Surgeon",
      badge1Title: "100% Sterile",
      badge1Note: "Hospital-grade protocol",
      badge2Title: "50,000+",
      badge2Note: "Happy patients served",
      scroll: "Scroll",
    },
    stats: [
      { label: "Happy Patients" },
      { label: "Specialty Services" },
      { label: "Expert Dentists" },
      { label: "Patient Rating" },
    ],
    why: {
      eyebrow: "Why Choose Us",
      titleA: "Why patients trust us with",
      titleB: " their smiles",
      description:
        "Choosing a dentist is a big decision. Here's what makes Aristocrat Dental Care the preferred dental destination in Uttara.",
      quote:
        "\u201CA healthy smile is a gateway to overall well-being.\u201D",
      quoteBy: "— Dr. Shazia Khanam, Chief Dental Surgeon",
      plusSpecialists: "+ 4 specialists",
      ratingNote: "4.9/5 • 3,200+ reviews",
      premiumBadge: "Premium Facility",
      highlights: [
        {
          title: "Strict Sterilization",
          description:
            "Hospital-grade autoclave sterilization and single-use disposables for every patient — your safety is non-negotiable.",
        },
        {
          title: "Advanced Technology",
          description:
            "Digital X-rays, intraoral cameras and laser dentistry for precise diagnoses and minimally invasive treatments.",
        },
        {
          title: "Pain-Free Comfort",
          description:
            "Gentle techniques, modern anesthesia and anxiety-easing care that makes every visit calm and stress-free.",
        },
        {
          title: "Specialist Dentists",
          description:
            "BDS & MDS qualified consultants in orthodontics, endodontics and oral surgery under one roof.",
        },
      ],
    },
    services: {
      eyebrow: "Our Services",
      titleA: "Personalized dental care,",
      titleB: " designed around you",
      description:
        "From preventive checkups to complete smile makeovers — 11 specialty services under one roof, delivered with modern technology and gentle hands.",
      viewAll: "View All 11 Services",
    },
    facility: {
      eyebrow: "Inside Our Clinic",
      titleA: "A facility designed around",
      titleB: " your comfort",
      description:
        "Step inside — modern operatories, hospital-grade sterilization and a kids' room that turns fear into friendship.",
      cards: [
        {
          title: "Digital Diagnostics",
          text: "Intraoral scanners, low-radiation digital X-rays and chairside screens — see exactly what we see.",
        },
        {
          title: "Kids' Happy Room",
          text: "A specially designed children's room where fear melts into curiosity — visit by visit.",
        },
        {
          title: "Sterilization Suite",
          text: "Autoclave-sterilized, pouch-sealed instruments opened in front of you — every single patient.",
        },
      ],
    },
    galleryPreview: {
      eyebrow: "Smile Gallery",
      titleA: "See real transformations,",
      titleB: " slide to compare",
      description:
        "Whitening, orthodontics and veneer cases from our clinic — drag the slider handle to reveal each before & after.",
      ctaGallery: "Explore Smile Gallery",
      ctaEstimate: "Estimate Treatment Cost",
      sliderChip: "Teeth Whitening — drag me",
    },
    testimonials: {
      eyebrow: "Patient Stories",
      titleA: "Our happy patients",
      titleB: " say it best",
      description:
        "Real reviews from real patients across Uttara and greater Dhaka — in both Bangla and English.",
    },
    doctors: {
      eyebrow: "Meet Our Experts",
      titleA: "Specialists in",
      titleB: " personalized dental care",
      description:
        "BDS & MDS qualified consultants in orthodontics, endodontics, oral surgery and cosmetic dentistry.",
      viewBoard: "View Medical Board",
    },
    faq: {
      eyebrow: "Frequently Asked Questions",
      titleA: "Answers to the questions",
      titleB: " patients ask most",
      description:
        "Straightforward, expert answers about dental care — from checkup frequency to implant costs.",
      stillTitle: "Still have questions? Call us at",
      or: "or",
      sendMsg: "send a message",
      replyNote: "— our team replies within hours.",
      readMore: "Read more expert answers in our blog",
    },
  },

  /* ---------------- Footer ---------------- */
  footer: {
    quickLinksTitle: "Quick Links",
    servicesTitle: "Our Services",
    contactTitle: "Get In Touch",
    quickLinks: [
      "Home",
      "About Us",
      "Our Services",
      "Smile Gallery",
      "Our Doctors",
      "Health Blog",
      "Cost Estimator",
      "Contact",
      "Book Appointment",
      "Check Appointment Status",
    ],
    viewAllServices: "View all 11 services →",
    reviews: "(3,200+ patient reviews)",
    hotlineLabel: "Hotline (Call or WhatsApp)",
    emailLabel: "Email",
    locationLabel: "Location",
    hoursLabel: "Opening Hours",
    hours: "Sat – Thu: 10:00 AM – 9:00 PM",
    trust: [
      "Strict Sterilization Protocols",
      "Same-Week Appointments",
      "Bilingual Care: বাংলা & English",
    ],
    rights: "All rights reserved.",
    credit: "Excellence in Every Smile — Uttara, Dhaka, Bangladesh",
    backToTop: "Back to top",
    newsletter: {
      title: "Dental health tips, worth reading",
      description:
        "One short, genuinely useful email a month — seasonal care reminders, clinic offers and new expert guides from our blog. No spam, ever.",
      placeholder: "your@email.com",
      subscribe: "Subscribe",
      subscribed: "You're on the list — welcome aboard!",
      invalid: "Invalid email",
      invalidDesc: "Please enter a valid email address.",
      success: "Subscribed!",
      successDesc: "Dental health tips are on their way.",
      failed: "Subscription failed",
    },
  },

  /* ---------------- Service category labels ---------------- */
  categories: {
    Restorative: "Restorative",
    Cosmetic: "Cosmetic",
    Orthodontics: "Orthodontics",
    Surgical: "Surgical",
    Preventive: "Preventive",
    Pediatric: "Pediatric",
  },
};

export type Dictionary = typeof en;

const bn: Dictionary = {
  /* ---------------- Chrome (navbar / top bar) ---------------- */
  chrome: {
    hours: "শনি – বৃহঃ: সকাল ১০টা – রাত ৯টা",
    hotline: "হটলাইন:",
    tagline: "প্রতিটি হাসিতে শ্রেষ্ঠত্ব!",
    nav: {
      home: "হোম",
      about: "আমাদের সম্পর্কে",
      services: "সেবাসমূহ",
      gallery: "গ্যালারি",
      doctors: "ডাক্তার",
      blog: "ব্লগ",
      pricing: "খরচ",
      contact: "যোগাযোগ",
    },
    book: "অ্যাপয়েন্টমেন্ট বুক করুন",
    openMenu: "মেনু খুলুন",
    closeMenu: "মেনু বন্ধ করুন",
    langLabel: "ভাষা",
    switchToBn: "বাংলায় দেখুন",
    switchToEn: "View in English",
  },

  /* ---------------- Floating contact ---------------- */
  fab: {
    whatsapp: "WhatsApp করুন",
    book: "অ্যাপয়েন্টমেন্ট বুক করুন",
    top: "উপরে ফিরে যান",
  },

  /* ---------------- Shared cards / CTA ---------------- */
  shared: {
    learnMore: "বিস্তারিত জানুন",
    viewProfile: "প্রোফাইল দেখুন",
    yrs: "বছর",
    patients: "রোগী",
    ctaTitle: "সুস্থ, উজ্জ্বল হাসির জন্য প্রস্তুত?",
    ctaDescription:
      "আজই আমাদের বিশেষজ্ঞ ডেন্টিস্টদের সাথে কনসালটেশন বুক করুন — আধুনিক প্রযুক্তি, ব্যথামুক্ত চিকিৎসা ও স্বচ্ছ মূল্য, সবই এক ছাদের নিচে উত্তরায়।",
    ctaBook: "এখনই অ্যাপয়েন্টমেন্ট বুক করুন",
    ctaCall: "কল করুন",
    ctaHours:
      "শনিবার–বৃহস্পতিবার খোলা, সকাল ১০টা – রাত ৯টা • একই সপ্তাহে অ্যাপয়েন্টমেন্ট পাওয়া যায়",
    breadcrumbHome: "হোম",
  },

  /* ---------------- Home page ---------------- */
  home: {
    hero: {
      badge: "উত্তরা, ঢাকায় অত্যাধুনিক ডেন্টাল কেয়ার",
      titleA: "প্রতিটি হাসিতে",
      titleB: "শ্রেষ্ঠত্ব",
      description:
        "একটি আধুনিক ও সুসজ্জিত ডেন্টাল ক্লিনিক — অত্যাধুনিক প্রযুক্তি, কঠোর জীবাণুমুক্তকরণ এবং সত্যিকারের যত্নশীল চিকিৎসার সমন্বয়ে। নিয়মিত চেকআপ থেকে সম্পূর্ণ স্মাইল মেকওভার — সবকিছুই এক ছাদের নিচে।",
      ctaBook: "এখনই অ্যাপয়েন্টমেন্ট বুক করুন",
      ctaExplore: "সেবাসমূহ দেখুন",
      trust: [
        "ব্যথামুক্ত চিকিৎসা",
        "কঠোর জীবাণুমুক্তকরণ",
        "শিশুবান্ধব রুম",
        "স্বচ্ছ মূল্য",
      ],
      cardBadge: "বিশেষজ্ঞ দল",
      cardItems: [
        { title: "ডিজিটাল স্মাইল ডিজাইন", note: "আগেই দেখুন আপনার নতুন হাসি" },
        { title: "ইনভিজিলাইন® ক্লিয়ার অ্যালাইনার", note: "অদৃশ্য অর্থোডন্টিক্স" },
        { title: "লেজার ব্যথামুক্ত ফিলিং", note: "প্রায়ই ইনজেকশনের প্রয়োজন হয় না" },
        { title: "ডেন্টাল ইমপ্ল্যান্ট", note: "আজীবনের জন্য দাঁত পুনরুদ্ধার" },
      ],
      doctorRole: "বিডিএস, এমডিএস — প্রধান ডেন্টাল সার্জন",
      badge1Title: "১০০% জীবাণুমুক্ত",
      badge1Note: "হাসপাতাল-মানের প্রোটোকল",
      badge2Title: "৫০,০০০+",
      badge2Note: "সন্তুষ্ট রোগী সেবা নিয়েছেন",
      scroll: "স্ক্রল করুন",
    },
    stats: [
      { label: "সন্তুষ্ট রোগী" },
      { label: "বিশেষ সেবা" },
      { label: "দক্ষ ডেন্টিস্ট" },
      { label: "রোগীদের রেটিং" },
    ],
    why: {
      eyebrow: "কেন আমাদের বেছে নেবেন",
      titleA: "রোগীরা কেন তাদের হাসির দায়িত্ব",
      titleB: " আমাদের উপর ছেড়ে দেন",
      description:
        "ডেন্টিস্ট বাছাই একটি বড় সিদ্ধান্ত। উত্তরায় অ্যারিস্টোক্র্যাট ডেন্টাল কেয়ারকে রোগীদের প্রথম পছন্দ বানিয়েছে যা কিছু —",
      quote: "\u201Cসুস্থ হাসি মানেই সুস্থ শরীরের প্রবেশদ্বার।\u201D",
      quoteBy: "— ডা. শাজিয়া খানম, প্রধান ডেন্টাল সার্জন",
      plusSpecialists: "+ ৪ জন বিশেষজ্ঞ",
      ratingNote: "৪.৯/৫ • ৩,২০০+ রিভিউ",
      premiumBadge: "প্রিমিয়াম সুবিধা",
      highlights: [
        {
          title: "কঠোর জীবাণুমুক্তকরণ",
          description:
            "প্রতিটি রোগীর জন্য হাসপাতাল-মানের অটোক্লেভ জীবাণুমুক্তকরণ ও এককালীন ব্যবহার্য সামগ্রী — আপনার নিরাপত্তা আমাদের কাছে অলঙ্ঘনীয়।",
        },
        {
          title: "অত্যাধুনিক প্রযুক্তি",
          description:
            "ডিজিটাল এক্স-রে, ইন্ট্রাওরাল ক্যামেরা ও লেজার ডেন্টিস্ট্রি — নির্ভুল রোগনির্ণয় এবং কম আক্রমণাত্মক চিকিৎসার জন্য।",
        },
        {
          title: "ব্যথামুক্ত আরাম",
          description:
            "কোমল কৌশল, আধুনিক অ্যানেস্থেসিয়া ও দুশ্চিন্তা দূর করা যত্ন — প্রতিটি ভিজিট হয় শান্ত ও নিশ্চিন্ত।",
        },
        {
          title: "বিশেষজ্ঞ ডেন্টিস্ট",
          description:
            "অর্থোডন্টিক্স, এন্ডোডন্টিক্স ও ওরাল সার্জারিতে বিডিএস ও এমডিএস-কৃত কনসালট্যান্ট — সবাই এক ছাদের নিচে।",
        },
      ],
    },
    services: {
      eyebrow: "আমাদের সেবা",
      titleA: "আপনার জন্য বাছাই করা",
      titleB: " ব্যক্তিগত ডেন্টাল কেয়ার",
      description:
        "প্রতিরোধমূলক চেকআপ থেকে সম্পূর্ণ স্মাইল মেকওভার — ১১টি বিশেষ সেবা এক ছাদের নিচে, আধুনিক প্রযুক্তি ও কোমল হাতে।",
      viewAll: "সব ১১টি সেবা দেখুন",
    },
    facility: {
      eyebrow: "আমাদের ক্লিনিকের ভেতরে",
      titleA: "আপনার আরামকে কেন্দ্র করে",
      titleB: " সাজানো সুবিধা",
      description:
        "ভেতরে এসে দেখুন — আধুনিক ট্রিটমেন্ট রুম, হাসপাতাল-মানের জীবাণুমুক্তকরণ আর শিশুদের এমন রুম যেখানে ভয় বদলে যায় বন্ধুত্বে।",
      cards: [
        {
          title: "ডিজিটাল ডায়াগনস্টিক্স",
          text: "ইন্ট্রাওরাল স্ক্যানার, কম-রেডিয়েশন ডিজিটাল এক্স-রে ও চেয়ারসাইড স্ক্রিন — যা আমরা দেখি, আপনিও তা-ই দেখুন।",
        },
        {
          title: "শিশুদের হ্যাপি রুম",
          text: "বিশেষভাবে সাজানো শিশুদের রুম — যেখানে ভয় গলে যায় কৌতূহলে, ভিজিটের পর ভিজিটে।",
        },
        {
          title: "স্টেরিলাইজেশন স্যুট",
          text: "অটোক্লেভে জীবাণুমুক্ত, পাউচে-সিল করা যন্ত্রপাতি — আপনার সামনেই খোলা হয়, প্রতিটি রোগীর জন্য।",
        },
      ],
    },
    galleryPreview: {
      eyebrow: "স্মাইল গ্যালারি",
      titleA: "সত্যিকারের পরিবর্তন দেখুন,",
      titleB: " স্লাইড করে মিলিয়ে নিন",
      description:
        "আমাদের ক্লিনিকের হোয়াইটেনিং, অর্থোডন্টিক্স ও ভিনিয়ার কেস — প্রতিটি আগে-পরে দেখতে স্লাইডারের হ্যান্ডেল টেনে ধরুন।",
      ctaGallery: "স্মাইল গ্যালারি দেখুন",
      ctaEstimate: "চিকিৎসা খরচ হিসাব করুন",
      sliderChip: "দাঁত সাদা করা — টেনে দেখুন",
    },
    testimonials: {
      eyebrow: "রোগীদের গল্প",
      titleA: "আমাদের সন্তুষ্ট রোগীরাই",
      titleB: " ভালোবাসা দেন সবচেয়ে বেশি",
      description:
        "উত্তরা ও বৃহত্তর ঢাকার সত্যিকারের রোগীদের সত্যিকারের রিভিউ — বাংলা ও ইংরেজি দুই ভাষাতেই।",
    },
    doctors: {
      eyebrow: "আমাদের বিশেষজ্ঞ",
      titleA: "ব্যক্তিগত ডেন্টাল কেয়ারের",
      titleB: " বিশেষজ্ঞ চিকিৎসক",
      description:
        "অর্থোডন্টিক্স, এন্ডোডন্টিক্স, ওরাল সার্জারি ও কসমেটিক ডেন্টিস্ট্রিতে বিডিএস ও এমডিএস-কৃত কনসালট্যান্ট।",
      viewBoard: "মেডিকেল বোর্ড দেখুন",
    },
    faq: {
      eyebrow: "সাধারণ জিজ্ঞাসা",
      titleA: "রোগীরা যে প্রশ্নগুলো",
      titleB: " সবচেয়ে বেশি করেন",
      description:
        "ডেন্টাল কেয়ার নিয়ে সরাসরি, বিশেষজ্ঞ উত্তর — চেকআপের সময়কাল থেকে ইমপ্ল্যান্টের খরচ পর্যন্ত।",
      stillTitle: "এখনও প্রশ্ন আছে? কল করুন",
      or: "অথবা",
      sendMsg: "মেসেজ পাঠান",
      replyNote: "— আমাদের টিম ঘণ্টার মধ্যে উত্তর দেয়।",
      readMore: "আরও বিশেষজ্ঞ উত্তর পড়ুন আমাদের ব্লগে",
    },
  },

  /* ---------------- Footer ---------------- */
  footer: {
    quickLinksTitle: "দ্রুত লিংক",
    servicesTitle: "আমাদের সেবা",
    contactTitle: "যোগাযোগ",
    quickLinks: [
      "হোম",
      "আমাদের সম্পর্কে",
      "আমাদের সেবা",
      "স্মাইল গ্যালারি",
      "আমাদের ডাক্তার",
      "হেলথ ব্লগ",
      "খরচ হিসাব",
      "যোগাযোগ",
      "অ্যাপয়েন্টমেন্ট বুক",
      "অ্যাপয়েন্টমেন্ট স্ট্যাটাস",
    ],
    viewAllServices: "সব ১১টি সেবা দেখুন →",
    reviews: "(৩,২০০+ রোগীর রিভিউ)",
    hotlineLabel: "হটলাইন (কল বা WhatsApp)",
    emailLabel: "ইমেইল",
    locationLabel: "ঠিকানা",
    hoursLabel: "খোলার সময়",
    hours: "শনি – বৃহঃ: সকাল ১০টা – রাত ৯টা",
    trust: [
      "কঠোর জীবাণুমুক্তকরণ প্রোটোকল",
      "একই সপ্তাহে অ্যাপয়েন্টমেন্ট",
      "দ্বিভাষিক সেবা: বাংলা ও English",
    ],
    rights: "সর্বস্বত্ব সংরক্ষিত।",
    credit: "প্রতিটি হাসিতে শ্রেষ্ঠত্ব — উত্তরা, ঢাকা, বাংলাদেশ",
    backToTop: "উপরে ফিরে যান",
    newsletter: {
      title: "পড়ার মতো ডেন্টাল হেলথ টিপস",
      description:
        "মাসে একটি ছোট, কাজে লাগার মতো ইমেইল — মৌসুমি যত্নের রিমাইন্ডার, ক্লিনিক অফার ও ব্লগের নতুন বিশেষজ্ঞ গাইড। কখনও স্প্যাম নয়।",
      placeholder: "apnar@email.com",
      subscribe: "সাবস্ক্রাইব",
      subscribed: "আপনি তালিকায় আছেন — স্বাগতম!",
      invalid: "ভুল ইমেইল",
      invalidDesc: "একটি সঠিক ইমেইল ঠিকানা দিন।",
      success: "সাবস্ক্রাইব হয়েছে!",
      successDesc: "ডেন্টাল হেলথ টিপস পৌঁছে যাবে।",
      failed: "সাবস্ক্রাইব ব্যর্থ",
    },
  },

  /* ---------------- Service category labels ---------------- */
  categories: {
    Restorative: "রেস্টোরেটিভ",
    Cosmetic: "কসমেটিক",
    Orthodontics: "অর্থোডন্টিক্স",
    Surgical: "সার্জিক্যাল",
    Preventive: "প্রতিরোধমূলক",
    Pediatric: "শিশু চিকিৎসা",
  },
};

export const dictionary: Record<Lang, Dictionary> = { en, bn };
