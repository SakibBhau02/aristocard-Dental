import type { NewBlogPost } from "./type";

/* ------------------------------------------------------------------ */
/*  Seed batch 5/6 — Preventive (1) + Laser (1) + Restorative (1) +    */
/*  Cosmetic tech (1). Queries: "fluoride sealants children",         */
/*  "laser dentistry", "sensitive teeth causes", "see smile before    */
/*  treatment / digital smile design".                                */
/* ------------------------------------------------------------------ */

export const posts05: NewBlogPost[] = [
  /* ---------------------------------------------------------------- */
  {
    slug: "fluoride-and-dental-sealants-children",
    title:
      "Fluoride and Dental Sealants: The Two Shields That Cut Childhood Cavities",
    titleBn:
      "ফ্লোরাইড ও ডেন্টাল সিল্যান্ট: শিশুর পোকা কমানোর দুই ঢাল",
    excerpt:
      "One strengthens every tooth from within; the other seals the deep grooves where most cavities begin. Together they are the most evidence-backed prevention in pediatric dentistry.",
    excerptBn:
      "একটি ভেতর থেকে প্রতিটি দাঁত শক্ত করে; অন্যটি গভীর খাঁজ বন্ধ করে, যেখানে বেশিরভাগ পোকা শুরু হয়। একসাথে এরাই শিশু ডেন্টিস্ট্রির সবচেয়ে প্রমাণসমৃদ্ধ প্রতিরোধ।",
    category: "Preventive Care",
    readTime: "6 min read",
    date: "2026-03-05",
    author: "Dr. Shazia Khanam",
    authorCredentials: "BDS, MDS — Chief Dental Surgeon",
    tags: ["fluoride children", "dental sealants", "cavity prevention kids"],
    serviceRefs: ["pediatric-dentistry", "laser-assisted-fillings"],
    image: "/images/blog-child.png",
    imageAlt:
      "Child receiving fluoride varnish and sealant application at dental clinic",
    quickAnswer:
      "Fluoride strengthens enamel from within and can reverse the earliest stage of decay; sealants are thin protective coatings that flow into the deep grooves of back teeth — where the large majority of childhood cavities start — and block plaque from ever settling there. Sealants cut molar cavity risk by around 80% and take two painless minutes per tooth, no injection, no drilling.",
    quickAnswerBn:
      "ফ্লোরাইড ভেতর থেকে এনামেল শক্ত করে আর পোকার আদি ধাপ উল্টেও দিতে পারে; সিল্যান্ট হলো পাতলা সুরক্ষা-আস্তরণ, যা পেছনের দাঁতের গভীর খাঁজে প্রবেশ করে — যেখানে শিশুদের অধিকাংশ পোকা শুরু হয় — আর প্লাককে ওখানে বসতেই দেয় না। সিল্যান্ট মোলারের পোকার ঝুঁকি প্রায় ৮০ শতাংশ কমায়, প্রতি দাঁতে লাগে যন্ত্রণাহীন দুই মিনিট — কোনো ইনজেকশন নয়, ড্রিল নয়।",
    sections: [
      {
        heading: "How Fluoride Works — In Plain Language",
        body: [
          "Enamel is a mineral crystal, and it lives in a constant exchange with your saliva: acids pull minerals out (demineralization), saliva lays them back (remineralization). Fluoride tips this balance decisively — it integrates into the crystal structure as fluorapatite, which resists acid far better than the original mineral, and it slows the acid production of plaque bacteria.",
          "The effect is strongest exactly where it contacts: fluoride toothpaste twice daily, and professional fluoride varnish at checkups — a two-minute painted layer that soaks the teeth in concentrated fluoride for hours. Small, regular doses beat rare large ones; that is why the rice-grain and pea-size amounts matter more than the tube's brand.",
        ],
      },
      {
        heading: "Why Brushing Alone Cannot Guard the Back Teeth",
        body: [
          "Look at a six-year molar's chewing surface: deep pits and fissures, narrower than a single toothbrush bristle. Plaque bacteria and sugar settle into these grooves where no bristle physically reaches — which is why the large majority of childhood cavities start exactly there, in teeth that were 'brushed every day'.",
          "A sealant solves the geometry: a flowable resin painted into the groove, hardened with a curing light, converting the deepest canyon into a smooth, wipeable surface. Now the brush — and even chewing itself — keeps the surface clean.",
        ],
      },
      {
        heading: "The Sealant Procedure — Two Minutes, No Needle",
        body: [
          "The appointment is beautifully boring: the tooth is cleaned, isolated and dried; a mild gel prepares the surface for a few seconds; the sealant flows into the grooves; a blue light sets it. No anesthesia, no drilling, no numbness — children typically ask if we have already started. First permanent molars are sealed around age 6–7, second molars around 12.",
          "Sealants last 5–10 years and are checked at every visit — a worn or chipped sealant is simply refreshed. They cost a fraction of a single filling, which is the treatment they prevent.",
        ],
      },
      {
        heading: "The Bangladesh Context",
        body: [
          "Fluoridated toothpaste is widely available and standard here, and that is the everyday fluoride channel for Bangladeshi families — the rice-grain rule for under-threes matters because swallowed fluoride in excess affects enamel formation. Sweetened milk, biscuit culture and sherbet-heavy celebrations make the sealant-and-fluoride combination even more valuable locally than the global averages suggest.",
          "Both shields are applied at the same checkup visit — a prevention appointment measured in minutes that saves fillings measured in years.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "ফ্লোরাইড কাজ করে যেভাবে — সহজ ভাষায়",
        body: [
          "এনামেল একটি খনিজ স্ফটিক, আর সে লালার সাথে নিরন্তর বিনিময়ে বাঁচে: অ্যাসিড খনিজ টেনে নেয় (ডিমিনারালাইজেশন), লালা ফিরিয়ে দেয় (রিমিনারালাইজেশন)। ফ্লোরাইড ভারসাম্যটাই স্থিরভাবে ঘুরিয়ে দেয় — সে স্ফটিক কাঠামোতে ফ্লুরোঅ্যাপাটাইট হিসেবে ঢুকে যায়, যা আদি খনিজের চেয়ে অনেক বেশি অ্যাসিড-প্রতিরোধী, আর প্লাক ব্যাকটেরিয়ার অ্যাসিড তৈরিও ধীর করে।",
          "প্রভাব সবচেয়ে শক্ত যেখানে ছোঁয়: দিনে দুবার ফ্লোরাইড টুথপেস্ট, আর চেকআপে প্রফেশনাল ফ্লোরাইড ভার্নিশ — দুই মিনিটে আঁকা পাতলা স্তর, যা ঘণ্টার পর ঘণ্টা দাঁত ভিজিয়ে রাখে। ছোট, নিয়মিত ডোজ বিরল বড় ডোজকে হারায়; এজন্যই টিউবের ব্র্যান্ডের চেয়ে চাল-দানা ও ছোলার-দানা পরিমাণ বেশি গুরুত্বপূর্ণ।",
        ],
      },
      {
        heading: "শুধু ব্রাশে পেছনের দাঁত রক্ষা হয় না কেন",
        body: [
          "ছয় বছরের মোলারের চিবানো পৃষ্ঠে তাকান: গভীর কুলকি আর ফাটল, একটা ব্রাশের ব্রিসেলের চেয়েও সরু। প্লাক ব্যাকটেরিয়া আর চিনি এসব খাঁজে বসে, যেখানে কোনো ব্রিসেল শারীরিকভাবে পৌঁছায়ই না — এজন্যই শিশুদের অধিকাংশ পোকা ঠিক ওখানেই শুরু হয়, যেসব দাঁত 'প্রতিদিন ব্রাশ হতো'।",
          "সিল্যান্ট জ্যামিতিটাই সমাধান করে: প্রবাহী রেজিন খাঁজে আঁকা হয়, কিউরিং লাইটে শক্ত হয়, আর গভীরতম ক্যানিয়ন হয়ে ওঠে মসৃণ, মোছা-যোগ্য পৃষ্ঠ। এবার ব্রাশ — এমনকি চিবানো নিজেই — পৃষ্ঠটি পরিষ্কার রাখে।",
        ],
      },
      {
        heading: "সিল্যান্ট প্রক্রিয়া — দুই মিনিট, সুই নেই",
        body: [
          "অ্যাপয়েন্টমেন্টটি সুন্দরভাবে ক্ষুদ্রধাঁচের: দাঁত পরিষ্কার, আলাদা করে শুকানো; মৃদু জেল কয়েক সেকেন্ড পৃষ্ঠ প্রস্তুত করে; সিল্যান্ট খাঁজে বইয়ে দেওয়া; নীল আলোয় বসে যায়। অ্যানেস্থেসিয়া নেই, ড্রিল নেই, অবশ ভাব নেই — শিশুরা সাধারণত জিজ্ঞেস করে, শুরুই করেছি কি না। প্রথম স্থায়ী মোলার সিল হয় ৬–৭ বছরে, দ্বিতীয়গুলো ১২-র কাছাকাছি।",
          "সিল্যান্ট ৫–১০ বছর চলে আর প্রতি ভিজিটে দেখা হয় — ক্ষয়ে বা চিপে যাওয়া সিল্যান্ট শুধু নবায়ন হয়। যে ফিলিং সে আটকায় তার এক ভগ্নাংশই তার খরচ।",
        ],
      },
      {
        heading: "বাংলাদেশের প্রেক্ষাপট",
        body: [
          "ফ্লোরাইড-যুক্ত টুথপেস্ট এখানে ব্যাপকভাবে পাওয়া যায় আর সেটিই বাংলাদেশি পরিবারের দৈনন্দিন ফ্লোরাইড চ্যানেল — তিন বছরের নিচে চাল-দানা নিয়ম জরুরি, কারণ বাড়তি গিলে ফেলা ফ্লোরাইড এনামেল গঠনে প্রভাব ফেলে। মিষ্টি দুধ, বিস্কুট-সংস্কৃতি আর শরবতঘন উৎসব সিল্যান্ট-ফ্লোরাইড জুটিকে স্থানীয়ভাবে বৈশ্বিক গড়ের চেয়েও দামি করে তোলে।",
          "দুই ঢালই বসে একই চেকআপ ভিজিটে — মিনিটে মাপা প্রতিরোধ, যা বছরে মাপা ফিলিং বাঁচায়।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "laser-dentistry-painless-fillings",
    title: "Laser Dentistry in Bangladesh: Real Benefits vs Marketing Hype",
    titleBn:
      "বাংলাদেশে লেজার ডেন্টিস্ট্রি: বাস্তব উপকার বনাম বিজ্ঞাপনের জোর",
    excerpt:
      "Lasers genuinely remove small cavities with less anesthesia, noise and fear — a real advance for anxious patients and children. But they are tools, not magic. What lasers actually do well, and where honest clinics draw the line.",
    excerptBn:
      "লেজার সত্যিই ছোট পোকা কম অ্যানেস্থেসিয়া, কম শব্দ আর কম ভয়ে তোলে — দুশ্চিন্তাগ্রস্ত রোগী ও শিশুদের জন্য সত্যিকারের অগ্রগতি। তবে এটি যন্ত্র, জাদু নয়। লেজার কোথায় ভালো, আর সৎ ক্লিনিক কোথায় সীমা টানে।",
    category: "Laser Dentistry",
    readTime: "7 min read",
    date: "2026-02-19",
    author: "Dr. Jumla Binte Jafor",
    authorCredentials:
      "BDS (DU), PGT — Restorative & Surgical Dentistry",
    tags: ["laser dentistry", "painless fillings", "drill-free dentist Dhaka"],
    serviceRefs: ["laser-assisted-fillings", "pediatric-dentistry", "periodontal-gum-treatment"],
    image: "/images/service-laser.png",
    imageAlt:
      "Dental laser device being used for precise cavity treatment",
    quickAnswer:
      "Dental lasers genuinely reduce vibration, noise and often the need for anesthesia in small-to-medium fillings — a real advantage for anxious patients and children. Lasers also excel in certain gum procedures with less bleeding. But they are tools, not magic: deep cavities may still need conventional instruments, and results still depend on the dentist's skill. Ask any clinic what its laser is specifically used for.",
    quickAnswerBn:
      "ডেন্টাল লেজার ছোট-মাঝারি ফিলিংয়ে কম্পন, শব্দ আর প্রায়ই অ্যানেস্থেসিয়ার প্রয়োজন সত্যিই কমায় — দুশ্চিন্তাগ্রস্ত রোগী ও শিশুদের জন্য সত্যিকারের সুবিধা। কিছু মাড়ির প্রক্রিয়ায়ও লেজার কম রক্তপাতে চমৎকার। তবে এটি যন্ত্র, জাদু নয়: গভীর পোকায় প্রচলিত যন্ত্রই লাগতে পারে, আর ফল এখনো নির্ভর করে ডেন্টিস্টের দক্ষতায়। যেকোনো ক্লিনিকে জিজ্ঞেস করুন — তাদের লেজার নির্দিষ্টভাবে কী কাজে লাগে।",
    sections: [
      {
        heading: "What Dental Lasers Actually Do",
        body: [
          "A dental laser is a focused beam of light energy absorbed selectively by target tissue. In cavity treatment, the wavelength is tuned to water and pigment-rich decayed tissue — so the laser evaporates softened, bacteria-laden dentine while barely interacting with healthy enamel and dentine. That selectivity is the clinical heart of the advantage: diseased tissue comes off, healthy tissue stays.",
          "In gum work, lasers cut and coagulate simultaneously, sealing small blood vessels as they go — sutureless, visibly less bleeding, and faster soft-tissue healing. Different wavelengths, different jobs: one machine does not do everything, which is exactly what a serious clinic will tell you.",
        ],
      },
      {
        heading: "Where the Benefits Are Real",
        body: [
          "The honest list of what lasers change for patients:",
        ],
        list: [
          "Small-to-medium fillings with no injection in many cases — the single biggest fear removed.",
          "No drill vibration and a fraction of the noise — the second fear removed.",
          "Children who cooperate beautifully because nothing about the experience resembles the story an older cousin told them.",
          "Gum contouring and gum disease therapy with minimal bleeding and often no sutures.",
          "Precise soft-tissue work: freeing tongue or lip ties, removing small growths.",
          "Reduced need for anesthesia in some periodontal procedures and faster initial healing.",
        ],
      },
      {
        heading: "Where Lasers Are Oversold",
        body: [
          "Lasers do not replace the drill for every filling: deep cavities, crown preparation and heavily filled teeth still belong to rotary instruments. 'Completely painless everything' is a marketing sentence, not a clinical one — some procedures, some patients and some teeth still need conventional anesthesia, and pretending otherwise erodes trust that laser dentistry has honestly earned elsewhere.",
          "Cost also deserves honesty: laser procedures can carry premium pricing in some markets, while delivering their real value in specific situations — anxiety, children, gum aesthetics — rather than universal superiority. The right question is never 'laser or not?' but 'for this tooth, in this mouth, today?'",
        ],
      },
      {
        heading: "The Right Question to Ask Your Clinic",
        body: [
          "When a clinic advertises laser dentistry, ask: which wavelength machine is it, and for which procedures do you use it clinically? A clinic using its laser daily for defined indications — and telling you when the conventional path serves you better — is one where the technology serves the patient. A clinic where the laser is a brochure word deserves a second opinion.",
          "At Aristocrat Dental Care, our laser work concentrates where it objectively helps most: anxiety-free small fillings, children's restorative visits, and gum procedures that heal beautifully without sutures. The machine is impressive; the discipline of when to use it is what you are actually choosing.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "ডেন্টাল লেজার আসলে কী করে",
        body: [
          "ডেন্টাল লেজার হলো কেন্দ্রীভূত আলো-শক্তির রশ্মি, যা লক্ষ্য-টিস্যু বেছে বেছে শোষণ করে। পোকার চিকিৎসায় তরঙ্গদৈর্ঘ্য ঠিক করা থাকে পানি ও রঙ-সমৃদ্ধ নরম টিস্যুর জন্য — তাই লেজার পচা, ব্যাকটেরিয়াভরা ডেন্টিন বাষ্পীভূত করে, অথচ সুস্থ এনামেল-ডেন্টিনে ক্ষতি করে না। এই বাছাইই সুবিধার ক্লিনিক্যাল হৃদয়: অসুস্থ টিস্যু যায়, সুস্থ টিস্যু থাকে।",
          "মাড়ির কাজে লেজার কাটে আর জমাটও বাঁধে একসাথে — যাওয়ার পথে ছোট রক্তনালি সিল করে: সেলাইহীন, চোখে দেখার মতো কম রক্তপাত, দ্রুত নরম-টিস্যু নিরাময়। ভিন্ন তরঙ্গদৈর্ঘ্য, ভিন্ন কাজ: একটি যন্ত্র সব করে না — সিরিয়াস ক্লিনিক ঠিক এটাই বলবে।",
        ],
      },
      {
        heading: "যেখানে উপকার সত্যি",
        body: [
          "লেজার রোগীর জীবনে যা বদলায়, সৎ তালিকা:",
        ],
        list: [
          "ছোট-মাঝারি ফিলিংয়ে বহু ক্ষেত্রে ইনজেকশনই নেই — সবচেয়ে বড় ভয়টি রদ।",
          "ড্রিলের কম্পন নেই, শব্দ কয়েকগুণ কম — দ্বিতীয় ভয়টিও রদ।",
          "শিশুরা দারুণ সহযোগিতা করে, কারণ অভিজ্ঞতাটি বড় ভাইবোনের শোনানো গল্পের সাথে মেলে না।",
          "মাড়ি গড়ন ও মাড়ির রোগের চিকিৎসা ন্যূনতম রক্তপাতে, প্রায়ই সেলাই ছাড়া।",
          "নির্ভুল নরম-টিস্যু কাজ: জিভ বা ঠোঁটের ফাঁস ছাড়ানো, ছোট গুটি তোলা।",
          "কিছু পেরিওডন্টাল প্রক্রিয়ায় অ্যানেস্থেসিয়ার চাহিদা কম আর শুরুর নিরাময় দ্রুত।",
        ],
      },
      {
        heading: "যেখানে লেজার বাড়িয়ে বলা হয়",
        body: [
          "লেজার প্রতিটি ফিলিংয়ে ড্রিলের বদলি নয়: গভীর পোকা, ক্রাউন প্রস্তুতি আর ভারী ফিলিং-ভরা দাঁত এখনো ঘূর্ণায়মান যন্ত্রের। 'সবকিছু সম্পূর্ণ ব্যথামুক্ত' বিপণনের বাক্য, ক্লিনিক্যাল নয় — কিছু প্রক্রিয়া, কিছু রোগী আর কিছু দাঁতে এখনো প্রচলিত অ্যানেস্থেসিয়া লাগে, আর তা না মানলে লেজার ডেন্টিস্ট্রি অন্য জায়গায় সৎভাবে যে আস্থা পেয়েছে তা ক্ষয় হয়।",
          "খরচেও সততা দরকার: কিছু বাজারে লেজার প্রক্রিয়ার দাম প্রিমিয়াম হতে পারে, অথচ তার আসল মূল্য নির্দিষ্ট পরিস্থিতিতে — দুশ্চিন্তা, শিশু, মাড়ির নান্দনিকতা — সর্বজনীন শ্রেষ্ঠত্বে নয়। সঠিক প্রশ্ন কখনোই 'লেজার, নাকি না?' নয় — 'এই দাঁতে, এই মুখে, আজ?'",
        ],
      },
      {
        heading: "ক্লিনিককে যে প্রশ্নটি করবেন",
        body: [
          "কোনো ক্লিনিক লেজার ডেন্টিস্ট্রির বিজ্ঞাপন দিলে জিজ্ঞেস করুন: কোন তরঙ্গদৈর্ঘ্যের যন্ত্র, আর কোন কোন প্রক্রিয়ায় ক্লিনিক্যালি ব্যবহার করেন? যে ক্লিনিক নির্দিষ্ট ইনডিকেশনে প্রতিদিন লেজার চালায় — আর প্রচলিত পথ আপনার জন্য ভালো হলে তা বলে — সেখানে প্রযুক্তি রোগীর কাজে লাগে। যেখানে লেজার শুধু ব্রোশিওরের শব্দ, সেখানে দ্বিতীয় মত নেওয়াই বুদ্ধিমানের কাজ।",
          "অ্যারিস্টোক্র্যাট ডেন্টাল কেয়ারে আমাদের লেজার কাজ কেন্দ্রীভূত যেখানে তা বস্তুগতভাবে সবচেয়ে সাহায্য করে: দুশ্চিন্তামুক্ত ছোট ফিলিং, শিশুদের রেস্টোরেটিভ ভিজিট, আর সেলাই ছাড়াই সুন্দর সারা মাড়ির প্রক্রিয়া। যন্ত্রটি দুর্দান্ত; কখন ব্যবহার করবেন তার শৃঙ্খলাটাই আপনি আসলে বেছে নিচ্ছেন।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "tooth-sensitivity-causes-and-fixes",
    title: "Why Are My Teeth Suddenly Sensitive? 9 Causes and the Fix for Each",
    titleBn:
      "হঠাৎ দাঁতে ঝাঁঝ ধরে কেন? ৯টি কারণ আর প্রতিটির সমাধান",
    excerpt:
      "That sharp zing from cold water or sweet tea has a specific cause — nine of them, actually. A symptom-matching guide that tells you what to try at home and what needs a chair.",
    excerptBn:
      "ঠান্ডা পানি বা মিষ্টি চায়ে সেই ঝাঁঝের শিক শিক করার একটা নির্দিষ্ট কারণ আছে — আসলে নয়টি। উপসর্গ মিলিয়ে বোঝার গাইড: কোনটা ঘরে সারাবেন, কোনটা চেয়ার লাগবে।",
    category: "Restorative",
    readTime: "8 min read",
    date: "2026-02-06",
    author: "Dr. Israt Jahan Rimi",
    authorCredentials: "BDS (DU), PGT (OMFS) — Consultant Dental Surgeon",
    tags: ["sensitive teeth", "tooth sensitivity causes", "dentin hypersensitivity"],
    serviceRefs: ["laser-assisted-fillings", "periodontal-gum-treatment", "root-canal-treatment"],
    image: "/images/blog-sensitivity.png",
    imageAlt:
      "Person experiencing tooth sensitivity while drinking cold water",
    quickAnswer:
      "Sudden sensitivity usually traces back to one of nine causes: gum recession, grinding, a new cavity, a cracked tooth, whitening products, acid erosion, recent dental work, a worn filling, or gum disease. Desensitizing toothpaste soothes symptoms, but lasting relief means diagnosing the cause — a ten-minute examination and an X-ray usually find it.",
    quickAnswerBn:
      "হঠাৎ সংবেদনশীলতার পেছনে সাধারণত নয়টির একটি কারণ: মাড়ি সরা, দাঁত ঘষা, নতুন পোকা, ফাটা দাঁত, হোয়াইটেনিং, অ্যাসিড ক্ষয়, সাম্প্রতিক দাঁতের কাজ, ক্ষয়ে যাওয়া ফিলিং, বা মাড়ির রোগ। ডিসেনসিটাইজিং পেস্ট উপসর্গ শান্ত করে, কিন্তু স্থায়ী স্বস্তি মানে কারণ নির্ণয় — দশ মিনিটের পরীক্ষা আর একটি এক্স-রেতেই সাধারণত ধরা পড়ে।",
    sections: [
      {
        heading: "The Nine Common Causes",
        body: [
          "Each cause leaves a signature — and has a fix:",
        ],
        list: [
          "Gum recession: exposed root surfaces zing to cold → treat the gum cause; varnish and desensitizing paste soothe meanwhile.",
          "Night grinding: broad soreness + worn cusps → night guard made after grinding is confirmed.",
          "New cavity: localized sensitivity to sweet and pressure → filling, small today.",
          "Cracked tooth: sharp pain on releasing a bite → crown, urgently, before the crack propagates.",
          "Whitening products: temporary generalized zing → pause or reduce frequency; it fades within days.",
          "Acid erosion: thinning enamel from citrus, cola, reflux → diet timing, rinse habits, remineralizing support.",
          "Recent dental work: soreness near a new filling for 2–4 weeks → normal settling; persistent past a month gets checked.",
          "Worn or leaking filling: sensitivity at one old restoration → replace before decay re-enters.",
          "Gum disease: several teeth loosening their guard at once → periodontal treatment, then sensitivity fades.",
        ],
      },
      {
        heading: "Which Cause Sounds Like Yours?",
        body: [
          "Pattern-recognition narrows it fast: cold-water zing across whole sides of the mouth points recession or erosion; a single tooth answering sweets points a cavity; pain when you RELEASE a bite points a crack; morning jaw tightness with generalized wear points grinding; everything tingling after a whitening week points the whitening. Sensitivity that arrives suddenly across many teeth at once is different from one tooth slowly becoming tender — the first is usually surface-level, the second usually nerve-level.",
        ],
      },
      {
        heading: "Home Care That Actually Helps",
        body: [
          "Desensitizing toothpaste (potassium nitrate or stannous fluoride formulas) genuinely works for surface-level sensitivity — used twice daily for two weeks with a soft brush, angling at the gumline. From today also: nothing acidic within 30 minutes of brushing (acid-softened enamel gets brushed away); rinse with water after citrus or cola; and switch to brushing before breakfast, not right after it.",
          "What home care cannot do: heal a cavity, glue a crack, or restore lost bone under gum disease. If two honest weeks change nothing, the cause is chair-side.",
        ],
      },
      {
        heading: "When Sensitivity Is an Emergency Signal",
        body: [
          "Three patterns skip the two-week rule entirely: pain that lingers minutes after the cold is gone (the nerve is inflamed), pain that arrives spontaneously without any trigger (often irreversible pulpitis), and sensitivity paired with pressure pain and swelling (infection at the root). Each of these moves the conversation from toothpaste to root canal assessment — and early assessment is precisely what keeps options open.",
          "A tooth that reacts briefly to cold then settles is almost always a fixable surface story. A tooth that holds the pain like a grudge is asking for a professional opinion this week.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "নয়টি সাধারণ কারণ",
        body: [
          "প্রতিটি কারণের নিজস্ব স্বাক্ষর আছে — আর নিজস্ব সমাধান:",
        ],
        list: [
          "মাড়ি সরা: খোলা শিকড় ঠান্ডায় ঝাঁঝ দেয় → মাড়ির কারণ চিকিৎসা; মাঝে মাঝে ভার্নিশ ও ডিসেনসিটাইজিং পেস্ট শান্ত করে।",
          "রাতের ঘষা: চওড়া ব্যথা + ঘষে ক্ষয় → নিশ্চিত হয়ে নাইট গার্ড।",
          "নতুন পোকা: মিষ্টি ও চাপে একটি দাঁত → ফিলিং, আজ ছোট।",
          "ফাটা দাঁত: কামড় ছাড়ার মুহূর্তে ধারালো ব্যথা → ক্রাউন, দ্রুত — ফাটল ছড়ানোর আগে।",
          "হোয়াইটেনিং: সাময়িক সার্বিক ঝাঁঝ → বিরতি বা কম ঘন ঘন; কয়েক দিনেই মিলিয়ে যায়।",
          "অ্যাসিড ক্ষয়: টক ফল, কোলা, রিফ্লাক্সে পাতলা এনামেল → খাবারের সময়-নিয়ম, কুলকি অভ্যাস, রিমিনারালাইজিং সহায়তা।",
          "সাম্প্রতিক দাঁতের কাজ: নতুন ফিলিংয়ের কাছে ২–৪ সপ্তাহ ব্যথা → স্বাভাবিক বসে যাওয়া; এক মাস পার করলে পরীক্ষা।",
          "ক্ষয়ে যাওয়া বা ছিদ্র হওয়া ফিলিং: একটি পুরনো রেস্টোরেশনে অস্বস্তি → পোকা ফেরার আগেই বদলানো।",
          "মাড়ির রোগ: একসাথে কয়েকটি দাঁতের পাহারা ঢিলা → পেরিওডন্টাল চিকিৎসা, তারপর ঝাঁঝ কমে।",
        ],
      },
      {
        heading: "আপনারটা কোনটির মতো শোনাচ্ছে?",
        body: [
          "প্যাটার্ন চেনা দ্রুত সীমা টানে: মুখের গোটা পাশ জুড়ে ঠান্ডা-পানির ঝাঁঝ মানে মাড়ি সরা বা ক্ষয়; মিষ্টিতে একটি দাঁতের উত্তর মানে পোকা; কামড় ছাড়লে ধারালো ব্যথা মানে ফাটল; সকালে চোয়াল টান আর সার্বিক ঘষা মানে ব্রাক্সিজম; হোয়াইটেনিং-সপ্তাহের পরে সব দাঁতে ঝাঁঝ মানে হোয়াইটেনিং। বহু দাঁতে হঠাৎ একসাথে আসা সংবেদনশীলতা আর একটি দাঁতের ধীরে কোমল হওয়া আলাদা — প্রথমটি সাধারণত পৃষ্ঠ-স্তরের, দ্বিতীয়টি সাধারণত স্নায়ু-স্তরের।",
        ],
      },
      {
        heading: "ঘরোয়া যত্ন যা সত্যিই কাজ করে",
        body: [
          "ডিসেনসিটাইজিং টুথপেস্ট (পটাশিয়াম নাইট্রেট বা স্ট্যানাস ফ্লোরাইড ফর্মুলা) পৃষ্ঠ-স্তরের ঝাঁঝে সত্যিই কাজ করে — নরম ব্রাশে, মাড়ির দিকে কোণ করে, দিনে দুবার দুই সপ্তাহ। আজ থেকে আরও: ব্রাশের ৩০ মিনিটের মধ্যে টক কিছু নয় (অ্যাসিডে নরম এনামেল ব্রাশে তুলে নেওয়া হয়); টক ফল বা কোলার পর পানিতে কুলকি; আর নাস্তার পরে নয়, নাস্তার আগে ব্রাশ।",
          "ঘরোয়া যত্ন যা পারে না: পোকা ভরাট, ফাটল জোড়া, বা মাড়ির রোগে হারানো হাড় ফেরানো। সৎ দুই সপ্তাহে কিছুই না বদলালে কারণটি চেয়ার-পার্শ্বে।",
        ],
      },
      {
        heading: "যখন সংবেদনশীলতা ইমার্জেন্সি সংকেত",
        body: [
          "তিনটি প্যাটার্ন দুই-সপ্তাহ নিয়ম একেবারেই এড়িয়ে যায়: ঠান্ডা সরে যাওয়ার মিনিট পরও লেগে থাকা ব্যথা (স্নায়ু প্রদাহিত), কোনো উদ্দীপক ছাড়াই নিজে থেকে আসা ব্যথা (প্রায়ই অপরিবর্তনীয় পালপাইটিস), আর চাপ-ব্যথা ও ফোলাসহ ঝাঁঝ (শিকড়ে সংক্রমণ)। প্রতিটিই আলাপটা টুথপেস্ট থেকে রুট ক্যানেল মূল্যায়নে নিয়ে যায় — আর আগের মূল্যায়নই বিকল্প খোলা রাখে।",
          "ঠান্ডায় অল্প সাড়া দিয়ে শান্ত হয়ে যাওয়া দাঁত প্রায় সবসময়ই পৃষ্ঠের-সমাধানযোগ্য গল্প। যে দাঁত রাগের মতো ব্যথা ধরে রাখে, সে এই সপ্তাহেই পেশাদার মতামত চাইছে।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "digital-smile-design-preview",
    title:
      "Digital Smile Design: Seeing Your New Smile Before Any Treatment Begins",
    titleBn:
      "ডিজিটাল স্মাইল ডিজাইন: চিকিৎসা শুরুর আগেই নিজের নতুন হাসি দেখে নিন",
    excerpt:
      "The technology that ends the scariest question in cosmetic dentistry — 'what will I look like?' How your photos become a simulation, a simulation becomes a trial smile, and a trial becomes the blueprint.",
    excerptBn:
      "কসমেটিক ডেন্টিস্ট্রির সবচেয়ে ভয়ের প্রশ্নটি শেষ করা প্রযুক্তি — 'আমার চেহারা কেমন হবে?' আপনার ছবি কীভাবে সিমুলেশন হয়, সিমুলেশন ট্রায়াল-হাসি হয়, আর ট্রায়াল নীলনকশা হয়।",
    category: "Cosmetic",
    readTime: "7 min read",
    date: "2026-01-22",
    author: "Dr. Shazia Khanam",
    authorCredentials: "BDS, MDS — Chief Dental Surgeon",
    tags: ["digital smile design", "smile preview", "cosmetic dentistry technology"],
    serviceRefs: ["digital-smile-design", "porcelain-veneers", "crowns-bridges"],
    image: "/images/service-smile-design.png",
    imageAlt:
      "Digital smile design software showing a simulated smile makeover preview",
    quickAnswer:
      "Digital Smile Design (DSD) uses your photos, video and facial measurements to design your smile on screen — then shows you the simulated result before any tooth is touched. You approve and adjust tooth shape, proportion and shade in the design, try a physical mock-up of it in your mouth, and only then does treatment (veneers, crowns, whitening) follow your approved blueprint.",
    quickAnswerBn:
      "ডিজিটাল স্মাইল ডিজাইন (DSD) আপনার ছবি, ভিডিও ও মুখের পরিমাপ দিয়ে পর্দায় হাসি ডিজাইন করে — তারপর কোনো দাঁতে হাত লাগার আগেই সিমুলেটেড ফল দেখায়। আপনি দাঁতের আকৃতি, অনুপাত ও রঙ ডিজাইনে অনুমোদন করেন ও ঠিক করেন, মুখে বসিয়ে ট্রায়াল-হাসি দেখেন, তারপরেই চিকিৎসা (ভিনিয়ার, ক্রাউন, হোয়াইটেনিং) আপনার অনুমোদিত নীলনকশা অনুসরণ করে।",
    sections: [
      {
        heading: "How the DSD Process Works",
        body: [
          "The workflow is captured in one visit: a standardized set of photographs and a short video of you talking and smiling — because a smile that works while speaking is the one worth designing — plus a scan or impression of your teeth. The software then relates your teeth to your face: lip line, midline, facial thirds, the amount of gum display when you smile.",
          "On that foundation your dentist designs proportions — length, width, inclination of each tooth — calibrated to your facial geometry rather than a generic template. You sit with the simulation and adjust it: 'slightly longer here', 'less gum showing', 'a warmer shade'. The design converges on your approval, not our assumption.",
        ],
      },
      {
        heading: "From Screen to Trial Smile",
        body: [
          "Before anything irreversible happens, the approved design becomes a physical mock-up — a temporary, reversible replica transferred onto your teeth for a few minutes. You see it in the mirror, in your own face, in your own smile dynamics; family can see it; photographs can be taken of it. This is the moment most patients describe as decisive — the design stops being an image and becomes an experience.",
          "Only after the mock-up earns your approval does it guide the actual treatment: the dentist prepares teeth to the mock-up's blueprint, the laboratory fabricates veneers or crowders to the same design file, and the result you approved is the result you receive.",
        ],
      },
      {
        heading: "What DSD Can and Cannot Simulate",
        body: [
          "Honesty about limits protects trust. DSD simulates tooth shape, proportion, length, shade and their relationship to lips and gums with impressive accuracy. It cannot fully simulate final gum healing after contouring, the exact translucency of layered porcelain against your specific enamel, or how your perception of the result matures over weeks of living with it — which is precisely why the mock-up stage exists between design and permanence.",
          "It also does not design health: cavities, gum disease and bite problems are diagnosed and treated first. A beautiful design on an unhealthy foundation is a renovation drawn on a cracked wall.",
        ],
      },
      {
        heading: "Why Previewing Changes Everything",
        body: [
          "The traditional fear of cosmetic dentistry was committing to permanence blind — patients approved shade cards and descriptions, then discovered their new smile in the mirror after it was irreversible. DSD reverses the information flow: you see more before deciding, the dentist hears more before designing, and the laboratory receives an unambiguous blueprint instead of an interpretation.",
          "The result is fewer remakes, faster decisions, and — in our patients' own words — the strange calm of walking into a smile makeover you have already met.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "DSD প্রক্রিয়া চলে যেভাবে",
        body: [
          "এক ভিজিটেই সব তোলা হয়: নির্দিষ্ট নিয়মে কিছু ছবি আর কথা বলা ও হাসতে থাকা অবস্থার ছোট ভিডিও — কারণ কথা বলার সময় যে হাসি কাজ করে, ডিজাইন করার যোগ্য সেটিই — সাথে দাঁতের স্ক্যান বা ছাপ। সফটওয়্যার তারপর আপনার দাঁতকে মুখের সাথে সম্পর্কিত করে: ঠোঁটের রেখা, মধ্যরেখা, মুখের তৃতীয়াংশ, হাসলে দেখা যায় এমন মাড়ির পরিমাণ।",
          "সেই ভিতের ওপর ডেন্টিস্ট অনুপাত ডিজাইন করেন — প্রতিটি দাঁতের দৈর্ঘ্য, প্রস্থ, ঝোঁক — সাধারণ টেমপ্লেট নয়, আপনার মুখের জ্যামিতি মেপে। আপনি সিমুলেশনের সাথে বসে ঠিক করেন: 'এখানে একটু লম্বা', 'মাড়ি একটু কম দেখাক', 'রং একটু উষ্ণ'। ডিজাইন মিটে যায় আপনার অনুমোদনে — আমাদের অনুমানে নয়।",
        ],
      },
      {
        heading: "পর্দা থেকে ট্রায়াল-হাসি",
        body: [
          "কিছু অপরিবর্তনীয় হওয়ার আগেই অনুমোদিত ডিজাইন হয় ভৌত মক-আপ — কিছু মিনিটের জন্য দাঁতে বসানো সাময়িক, ফেরানো-যোগ্য প্রতিরূপ। আপনি তা আয়নায় দেখেন, নিজের মুখে, নিজের হাসির নড়াচড়ায়; পরিবার দেখতে পায়; ছবি তোলা যায়। বেশিরভাগ রোগী ঠিক এই মুহূর্তটিকেই নির্ণায়ক বলেন — ডিজাইন ছবি থেকে অভিজ্ঞতা হয়ে ওঠে।",
          "মক-আপ অনুমোদন পাওয়ার পরেই সেটি আসল চিকিৎসা পরিচালনা করে: ডেন্টিস্ট মক-আপের নীলনকশায় দাঁত প্রস্তুত করেন, ল্যাব একই ডিজাইন ফাইলে ভিনিয়ার বা ক্রাউন বানায়, আর আপনি যা অনুমোদন করেছিলেন তা-ই পান।",
        ],
      },
      {
        heading: "DSD যা পারে, যা পারে না",
        body: [
          "সীমার সততা আস্থা রক্ষা করে। DSD দাঁতের আকৃতি, অনুপাত, দৈর্ঘ্য, রং আর ঠোঁট-মাড়ির সাথে সম্পর্ক চাঞ্চল্যকর নির্ভুলতায় সিমুলেট করে। পুরোপুরি সিমুলেট করতে পারে না: গড়ন-সংশোধনের পর মাড়ির চূড়ান্ত নিরাময়, আপনার নির্দিষ্ট এনামেলের গায়ে স্তরে-স্তরে রাখা পোর্সেলিনের ঠিক স্বচ্ছতা, বা নতুন হাসির সাথে সপ্তাহ কাটানোর পর আপনার উপলব্ধির পরিণতি — এজন্যই ডিজাইন আর স্থায়িত্বের মাঝে মক-আপ ধাপটি আছে।",
          "এটি স্বাস্থ্যও ডিজাইন করে না: পোকা, মাড়ির রোগ আর কামড়ের সমস্যা আগে নির্ণয় ও চিকিৎসা হয়। ফাটা দেয়ালে আঁকা রেনোভেশন যেমন — অসুস্থ ভিতের ওপর সুন্দর ডিজাইন তেমন।",
        ],
      },
      {
        heading: "আগে দেখা কেন সব বদলে দেয়",
        body: [
          "কসমেটিক ডেন্টিস্ট্রির প্রচলিত ভয় ছিল অন্ধ অবস্থায় স্থায়িত্বে সম্মত হওয়া — রোগী রঙের কার্ড আর বর্ণনা অনুমোদন করতেন, তারপর আয়নায় নতুন হাসি আবিষ্কার করতেন যখন তা ফেরানোর পথ নেই। DSD তথ্যের প্রবাহ উল্টে দেয়: সিদ্ধান্তের আগে আপনি বেশি দেখেন, ডিজাইনের আগে ডেন্টিস্ট বেশি শোনেন, আর ল্যাব পায় ব্যাখ্যা নয় — একটি দ্ব্যর্থহীন নীলনকশা।",
          "ফল: কম নতুন করে বানানো, দ্রুত সিদ্ধান্ত, আর — আমাদের রোগীদের ভাষায় — এমন এক অদ্ভুত শান্তি, যে হাসি-মেকওভারে পা রাখছেন এমন এক হাসিকে নিয়ে, যার সাথে আপনার আগেই পরিচয় হয়ে গেছে।",
        ],
      },
    ],
  },
];
