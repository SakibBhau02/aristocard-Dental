import type { NewBlogPost } from "./type";

/* ------------------------------------------------------------------ */
/*  Seed batch 2/6 — Cosmetic compare (1) + Orthodontics (2) +         */
/*  Restorative (1). Queries targeted: "veneers vs crowns",            */
/*  "invisalign rules / can I drink coffee with aligners",            */
/*  "can adults get braces", "how long do dental crowns last".        */
/* ------------------------------------------------------------------ */

export const posts02: NewBlogPost[] = [
  /* ---------------------------------------------------------------- */
  {
    slug: "veneers-vs-crowns-difference",
    title: "Veneers vs Crowns: Which One Does Your Tooth Actually Need?",
    titleBn:
      "ভিনিয়ার নাকি ক্রাউন — আপনার দাঁতের জন্য কোনটি দরকার? স্পষ্ট তুলনা",
    excerpt:
      "One covers the front of a healthy tooth for aesthetics; the other rebuilds a damaged tooth's full strength. A dentist's guide to choosing correctly — and the root-canal case everyone gets wrong.",
    excerptBn:
      "একটি সুস্থ দাঁতের সামনের পৃষ্ঠ সাজায়, অন্যটি ক্ষতিগ্রস্ত দাঁতের পুরো শক্তি ফিরিয়ে আনে। সঠিক বাছাইয়ের ডেন্টিস্টের গাইড — আর সেই রুট ক্যানেলের কেস, যেটায় সবাই ভুল করে।",
    category: "Cosmetic",
    readTime: "7 min read",
    date: "2026-08-11",
    author: "Dr. Shazia Khanam",
    authorCredentials: "BDS, MDS — Chief Dental Surgeon",
    tags: ["veneers vs crowns", "dental crown", "tooth restoration"],
    serviceRefs: ["porcelain-veneers", "crowns-bridges", "root-canal-treatment"],
    image: "/images/service-veneers.png",
    imageAlt:
      "Side-by-side comparison of a porcelain veneer shell and a full dental crown",
    quickAnswer:
      "Veneers cover the front surface of healthy, intact teeth for cosmetic improvement. Crowns cap the entire tooth to rebuild strength after fracture, root canal treatment or large fillings. Simple rule: if the tooth is strong and the goal is aesthetics, it is a veneer; if the tooth is weak, heavily filled or root-canal-treated, it needs a crown.",
    quickAnswerBn:
      "ভিনিয়ার সুস্থ, অক্ষত দাঁতের সামনের পৃষ্ঠ সাজায়। ক্রাউন ভাঙা, রুট ক্যানেল হওয়া বা বড় ফিলিংয়ের দাঁতের চারপাশ পুরো ঢেকে শক্তি ফিরিয়ে আনে। সহজ নিয়ম: দাঁত শক্ত আর লক্ষ্য সৌন্দর্য হলে ভিনিয়ার; দাঁত দুর্বল, ভারী ফিলিং বা রুট ক্যানেল হলে ক্রাউন।",
    sections: [
      {
        heading: "The Structural Difference",
        body: [
          "Think of a veneer as a thin porcelain shell bonded to the face of the tooth — like a premium tile on a sound wall. A crown is a full helmet: it encircles the tooth 360 degrees and absorbs chewing forces on its behalf. That structural difference decides everything about which situation each one belongs to.",
          "Preparation reflects it too. Veneers remove 0.3–0.7 mm from the front surface only. Crowns reshape the whole tooth — necessary when substantial tooth structure is already gone, and over-engineering when it is not.",
        ],
      },
      {
        heading: "Choose Veneers When… Choose Crowns When…",
        body: [
          "The decision is clinical first, cosmetic second:",
        ],
        list: [
          "Veneers: healthy teeth with staining, small chips, gaps, mild shape issues or slight misalignment.",
          "Veneers: front teeth (canines to canine) where chewing forces are lighter.",
          "Crowns: cracked or fractured teeth that hurt on biting.",
          "Crowns: teeth with large or broken old fillings, or little solid structure left.",
          "Crowns: root-canal-treated molars and premolars — they become brittle and need full protection.",
          "Crowns or bridges: rebuilding a missing tooth by linking crowned neighbours.",
        ],
      },
      {
        heading: "The Root-Canal Case Everyone Asks About",
        body: [
          "Front teeth after root canal treatment are a genuine middle zone. If the tooth is otherwise intact and colour-stable, a veneer may suffice. If it has lost significant structure, has a large access filling, or has greyed from within, a crown is the safer long-term choice. Back teeth after root canals are not a debate — the forces of grinding food demand a crown.",
          "This is exactly the kind of call that should be made by a dentist who can see your X-ray, not by an article — but now you know what the article would ask.",
        ],
      },
      {
        heading: "Cost, Longevity and Maintenance Compared",
        body: [
          "Per tooth, crowns and quality veneers sit in a similar price band in Bangladesh; what differs is what each one is buying — aesthetics with veneers, structure with crowns. Both last 10–15 years typically, both are maintained with ordinary brushing, flossing and six-month checkups, and both fail the same way when neglected: decay or gum disease at the margin where they meet your tooth.",
          "Whichever you receive, the margin is the battleground. Brush it, floss it, and it serves you for a decade and a half of meals and smiles.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "গঠনগত পার্থক্য",
        body: [
          "ভিনিয়ারকে ভাবুন দাঁতের মুখে জোড়া পাতলা পোর্সেলিন শেল — মজবুত দেয়ালে লাগানো প্রিমিয়াম টাইলের মতো। ক্রাউন সম্পূর্ণ হেলমেট: দাঁতকে ৩৬০ ডিগ্রি ঘিরে ধরে আর চিবানোর চাপ তার হয়ে সামলায়। এই গঠনগত পার্থক্যই ঠিক করে দেয় — কোন পরিস্থিতিতে কোনটি।",
          "প্রস্তুতিতেও তা স্পষ্ট। ভিনিয়ারে শুধু সামনের পৃষ্ঠ থেকে ০.৩–০.৭ মিমি যায়। ক্রাউনে পুরো দাঁত নতুন রূপ পায় — দাঁতের বড় অংশ এমনিতেই নষ্ট হলে দরকার, না হলে অতিরিক্ত ক্ষতি।",
        ],
      },
      {
        heading: "কখন ভিনিয়ার… কখন ক্রাউন…",
        body: [
          "সিদ্ধান্ত আগে ক্লিনিক্যাল, পরে কসমেটিক:",
        ],
        list: [
          "ভিনিয়ার: দাগ, ছোট চিপ, ফাঁক, হালকা আকৃতি-সমস্যা বা হালকা বেঁকে থাকা সুস্থ দাঁত।",
          "ভিনিয়ার: সামনের দাঁত (ক্যানাইন থেকে ক্যানাইন), যেখানে চিবানোর চাপ কম।",
          "ক্রাউন: ফাটা বা ভাঙা দাঁত, যাতে কামড়ালে ব্যথা হয়।",
          "ক্রাউন: বড় বা ভাঙা পুরনো ফিলিং, বা যথেষ্ট সুস্থ গঠন আর না থাকা দাঁত।",
          "ক্রাউন: রুট ক্যানেল হওয়া পেছনের দাঁত — সেগুলো ভঙ্গুর হয়ে যায়, পুরো সুরক্ষা দরকার।",
          "ক্রাউন বা ব্রিজ: পাশের ক্রাউন-করা দাঁত জুড়ে পড়ে যাওয়া দাঁত পুনর্গঠন।",
        ],
      },
      {
        heading: "রুট ক্যানেলের যে কেসটি সবাই জিজ্ঞেস করে",
        body: [
          "রুট ক্যানেলের পর সামনের দাঁত সত্যিকারের মাঝামাঝি জায়গা। দাঁত অন্যথায় অক্ষত আর রঙ স্থিত থাকলে ভিনিয়ার চলতে পারে। বড় অংশ গেছে, বড় অ্যাক্সেস ফিলিং আছে, বা ভেতর থেকে ছাই হয়ে গেলে ক্রাউনই নিরাপদ। রুট ক্যানেলের পর পেছনের দাঁত নিয়ে বিতর্কই নেই — খাবার ঘষার চাপ ক্রাউন দাবি করে।",
          "এই সিদ্ধান্ত এমন ডেন্টিস্টের হাতে হওয়া উচিত যে আপনার এক্স-রে দেখতে পারে — তবে এখন আপনি জানেন, লেখাটি কী কী প্রশ্ন করত।",
        ],
      },
      {
        heading: "খরচ, স্থায়িত্ব ও রক্ষণাবেক্ষণের তুলনা",
        body: [
          "প্রতি দাঁতে ক্রাউন আর মানসম্মত ভিনিয়ারের দাম বাংলাদেশে কাছাকাছি ব্যান্ডে; পার্থক্য কী কিনছেন তাতে — ভিনিয়ারে সৌন্দর্য, ক্রাউনে গঠন। দুটোই সাধারণত ১০–১৫ বছর চলে, দুটোরই রক্ষণাবেক্ষণ সাধারণ ব্রাশ, ফ্লস আর ছয় মাসের চেকআপ, আর উপেক্ষা করলে দুটোই একইভাবে ব্যর্থ হয় — দাঁতের সাথে মেলার কিনারায় পোকা বা মাড়ির রোগে।",
          "যেটাই বসুক, কিনারাটিই আসল যুদ্ধক্ষেত্র। ব্রাশ, ফ্লস — আর এটি আপনাকে দেড় দশকের খাবার আর হাসি দেবে।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "invisalign-rules-eating-cleaning",
    title:
      "Invisalign Rules: What You Can (and Cannot) Eat, Drink and Do",
    titleBn:
      "ইনভিজালাইনের নিয়ম: কী খেতে পারবেন, কী পারবেন না — পূর্ণ তালিকা",
    excerpt:
      "Coffee with aligners in? Chewing gum? The practical rules of clear-aligner life, from the 20–22 hour rule to cleaning trays without scratching them cloudy.",
    excerptBn:
      "অ্যালাইনার পরে কফি? চুইংগাম? ক্লিয়ার-অ্যালাইনার জীবনের বাস্তব নিয়ম — ২০–২২ ঘণ্টার নিয়ম থেকে ট্রে ঘষা ছাড়া পরিষ্কার করা পর্যন্ত।",
    category: "Orthodontics",
    readTime: "8 min read",
    date: "2026-07-29",
    author: "Dr. Abdur Rahim",
    authorCredentials: "BDS, MDS — Senior Consultant",
    tags: ["Invisalign rules", "clear aligners", "aligner care"],
    serviceRefs: ["invisalign-clear-aligners", "traditional-braces-orthodontics"],
    image: "/images/blog-aligners.png",
    imageAlt:
      "Clear Invisalign aligner trays with case shown beside a cup of coffee",
    quickAnswer:
      "Remove your aligners for everything except plain water — food, tea, coffee and sweet drinks stain the trays and trap decay-causing sugar against your teeth. Wear them 20–22 hours a day, brush before re-inserting, rinse trays in cool (never hot) water, and never chew gum with aligners in. Follow these rules and most treatments finish on schedule.",
    quickAnswerBn:
      "সাধারণ পানি ছাড়া সবকিছুর জন্য অ্যালাইনার খুলে রাখুন — খাবার, চা, কফি ও মিষ্টি পানীয় ট্রেতে দাগ বসায় আর দাঁতের গায়ে চিনি আটকে পোকার ঝুঁকি বাড়ায়। দিনে ২০–২২ ঘণ্টা পরুন, আবার লাগানোর আগে ব্রাশ করুন, ঠান্ডা (কখনোই গরম নয়) পানিতে ধুবেন, আর অ্যালাইনার পরে কখনোই চুইংগাম নয়। নিয়ম মানলে বেশিরভাগ চিকিৎসাই নির্ধারিত সময়ে শেষ হয়।",
    sections: [
      {
        heading: "The Golden Rule: 20–22 Hours a Day",
        body: [
          "Clear aligners move teeth by applying gentle, constant force — and 'constant' is the operative word. Every hour out of your mouth is an hour of zero progress, partially offset by the next hours of wear. Patients who discipline themselves to remove aligners only for meals and cleaning finish on schedule; patients who leave them out for long afternoon stretches add months to treatment.",
          "Practical structure: three meals and two cleaning sessions account for roughly 2–3 hours out. That is your full daily budget — spend it carefully.",
        ],
      },
      {
        heading: "Foods and Drinks: The Do and Don't List",
        body: [
          "With aligners out you can eat anything pain allows — though the first days of a new tray bring pressure sensitivity, when softer food is kinder. The real rules are about what happens with aligners in:",
        ],
        list: [
          "Water (room temperature or cool): the only drink allowed with aligners in.",
          "Tea, coffee, cola: never with aligners in — heat warps the plastic, pigment turns trays yellow, and sugar seals them against your enamel.",
          "Hot food: fine to eat with trays out; just rinse or brush before re-inserting so heat and sauce don't deform or stain.",
          "Chewing gum: never — it bonds into the trays and tears attachments off.",
          "Hard nuts and betel nut: avoid entirely during treatment — they crack trays and put dangerous force on moving teeth.",
          "Smoking: heavy staining plus slower tooth movement — aligner patients see the fastest results when they pause.",
        ],
      },
      {
        heading: "Cleaning Aligners Without Scratching Them",
        body: [
          "Cloudy, scratched trays defeat the entire 'invisible' promise. Clean them morning and night with a soft brush and a drop of clear soap under cool running water — that is all they need. Toothpaste is the classic mistake: most whitening pastes contain abrasives that micro-scratch plastic until it frosts over. Soaking weekly in a dedicated aligner-cleaning solution keeps them fresh for weeks.",
          "Hot water is the other destroyer — even warm tap water can warp a tray's precision fit. If your aligner suddenly feels loose or painful after washing, warping is the usual suspect.",
        ],
      },
      {
        heading: "Habits That Quietly Lengthen Treatment",
        body: [
          "Three habits account for most delayed timelines we see: losing trays (always carry the case — never a napkin, which is how trays land in Dhaka's dustbins via restaurant tables), delaying the switch to the next set by 'a few comfortable days', and skipping the brush before re-inserting, which baths teeth in sugar for hours.",
          "And one non-habit matters most: keep every scheduled review. Your orthodontist monitors tracking — whether each tooth follows its plan — and a small mid-course correction is quick, while a large derailment costs months.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "মূল নিয়ম: দিনে ২০–২২ ঘণ্টা",
        body: [
          "ক্লিয়ার অ্যালাইনার দাঁত সরায় মৃদু, অবিরাম চাপে — আর 'অবিরাম'-ই মূল শব্দ। মুখের বাইরের প্রতি ঘণ্টা মানে শূন্য অগ্রগতি, যা পরের ঘণ্টগুলো আংশিক পুষিয়ে দেয়। যারা শুধু খাওয়া আর পরিষ্কারের সময় খোলেন, তারা নির্ধারিত সময়েই শেষ করেন; যারা দুপুরজুড়ে খুলে রাখেন, তাদের চিকিৎসায় মাস যোগ হয়।",
          "বাস্তব হিসাব: তিন বেলা খাবার আর দুবার পরিষ্কার মানে বাইরে প্রায় ২–৩ ঘণ্টা। এটিই আপনার পুরো দৈনিক বাজেট — খরচ করুন সাবধানে।",
        ],
      },
      {
        heading: "খাবার-পানীয়: কী হবে, কী হবে না",
        body: [
          "অ্যালাইনার খুলে ব্যথা যা সহ্য করে সবই খাওয়া যায় — যদিও নতুন ট্রের প্রথম দিনগুলোতে চাপে অস্বস্তি থাকে, তখন নরম খাবারই ভালো। আসল নিয়ম অ্যালাইনার পরা অবস্থায় কী হচ্ছে তার:",
        ],
        list: [
          "পানি (সাধারণ তাপমাত্রা বা ঠান্ডা): অ্যালাইনার পরে একমাত্র অনুমোদিত পানীয়।",
          "চা, কফি, কোলা: পরে কখনোই নয় — তাপ প্লাস্টিক বাঁকা করে, রং ট্রে হলুদ করে, আর চিনি দাঁতের এনামেলের গায়ে সিল হয়ে বসে।",
          "গরম খাবার: ট্রে খুলে খেতেই পারেন; আবার লাগানোর আগে কুলকি বা ব্রাশ করুন, নইলে তাপ ও সস ট্রে নষ্ট করে।",
          "চুইংগাম: কখনোই নয় — ট্রের সাথে আঠালো হয়ে যায়, অ্যাটাচমেন্ট ছিঁড়ে ফেলে।",
          "কঠিন বাদাম ও সুপারি: চিকিৎসাকালে এড়িয়ে চলুন — ট্রে ফাটায় আর চলমান দাঁতে বিপজ্জনক চাপ দেয়।",
          "ধূমপান: গাঢ় দাগ আর ধীর দাঁত-চলন — বিরত থাকলে অ্যালাইনার রোগীরা দ্রুততম ফল পান।",
        ],
      },
      {
        heading: "ট্রে ঘষা ছাড়া পরিষ্কার করা",
        body: [
          "মেঘলা, ছারছার ট্রে পুরো 'ইনভিজিবল' প্রতিশ্রুতিটাই শেষ করে দেয়। সকাল-রাত নরম ব্রাশ আর এক ফোঁটা স্বচ্ছ সাবানে ঠান্ডা পানির নিচে ঘষুন — এটুকুই যথেষ্ট। টুথপেস্ট হলো চিরকালের ভুল: বেশিরভাগ হোয়াইটেনিং পেস্টের ঘষানি প্লাস্টিকে মাইক্রো-দাগ কাটে, ট্রে মেঘলা করে দেয়। সপ্তাহে একবার অ্যালাইনার-ক্লিনিং সলিউশনে ডুবিয়ে রাখলে সপ্তাহোপরি সপ্তাহ ঝকঝকে থাকে।",
          "গরম পানি আরেক ধ্বংসকারী — কুসুম গরম কলের পানিও ট্রের নিখুঁত ফিট বাঁকা করতে পারে। ধোয়ার পর অ্যালাইনার হঠাৎ ঢিলা বা ব্যথায় অনুভব হলে সাধারণত এটিই কারণ।",
        ],
      },
      {
        heading: "যেসব অভ্যাসে চিকিৎসা নিঃশব্দে দীর্ঘ হয়",
        body: [
          "বিলম্বিত টাইমলাইনের বেশিরভাগ দায় তিন অভ্যাসের: ট্রে হারানো (সবসময় কেস সঙ্গে রাখুন — ন্যাপকিনে কখনোই নয়, ওই পথেই ঢাকার রেস্টুরেন্টের টেবিল থেকে ট্রে ডাস্টবিনে যায়), 'আরামের কয়েক দিন' বাড়িয়ে পরের সেটে যেতে দেরি করা, আর লাগানোর আগে ব্রাশ বাদ দেওয়া — যাতে ঘণ্টার পর ঘণ্টা দাঁত চিনিতে ভেজে।",
          "আর একটি অভ্যাস সবচেয়ে গুরুত্বপূর্ণ: প্রতিটি নির্ধারিত রিভিউতে আসা। আপনার অর্থোডন্টিস্ট ট্র্যাকিং দেখেন — প্রতিটি দাঁত পরিকল্পনা মানছে কি না; মাঝপথের ছোট সংশোধন দ্রুত হয়, বড় ভুল পথ মাস খরচ করে।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "adult-braces-guide-bangladesh",
    title:
      "Adult Braces in Bangladesh: It Is Never Too Late to Straighten Teeth",
    titleBn:
      "বাংলাদেশে প্রাপ্তবয়স্কদের ব্রেসেস: দাঁত সোজা করতে কখনোই দেরি হয় না",
    excerpt:
      "One in five orthodontic patients today is an adult. Your options (metal, ceramic, clear aligners), realistic timelines, and what daily life with braces at 30, 40 or 55 actually looks like.",
    excerptBn:
      "আজ প্রতি পাঁচজন অর্থোডন্টিক রোগীর একজন প্রাপ্তবয়স্ক। আপনার বিকল্প (মেটাল, সিরামিক, ক্লিয়ার অ্যালাইনার), বাস্তব সময়সীমা, আর ৩০, ৪০ বা ৫৫ বছর বয়সে ব্রেসেস-জীবন আসলে কেমন।",
    category: "Orthodontics",
    readTime: "8 min read",
    date: "2026-07-16",
    author: "Dr. Abdur Rahim",
    authorCredentials: "BDS, MDS — Senior Consultant",
    tags: ["adult braces", "orthodontics Dhaka", "teeth straightening"],
    serviceRefs: ["traditional-braces-orthodontics", "invisalign-clear-aligners"],
    image: "/images/service-braces.png",
    imageAlt:
      "Adult patient smiling with modern ceramic braces during orthodontic consultation",
    quickAnswer:
      "Adults can absolutely wear braces — there is no upper age limit, because bone remodeling continues throughout life. Options are metal braces, tooth-colored ceramic braces and clear aligners like Invisalign. Typical adult treatment runs 12–24 months. Straight teeth are not cosmetic vanity: they are easier to clean, which lowers gum-disease and cavity risk for decades.",
    quickAnswerBn:
      "প্রাপ্তবয়স্করাও নিশ্চিতভাবে ব্রেসেস পরতে পারেন — বয়সের ঊর্ধ্বসীমা নেই, কারণ হাড় গঠন-ভাঙার প্রক্রিয়া সারাজীবন চলে। বিকল্প: মেটাল ব্রেসেস, দাঁতের রঙের সিরামিক ব্রেসেস আর ইনভিজালাইনের মতো ক্লিয়ার অ্যালাইনার। প্রাপ্তবয়স্কদের চিকিৎসা সাধারণত ১২–২৪ মাস। সোজা দাঁত শুধু সৌন্দর্য নয়: পরিষ্কার করা সহজ, মাড়ির রোগ ও পোকার ঝুঁকি দশকের পর দশক কম থাকে।",
    sections: [
      {
        heading: "Why More Bangladeshi Adults Are Choosing Braces",
        body: [
          "A quiet shift is visible in Dhaka waiting rooms: professionals in their thirties and forties starting orthodontic treatment that parents once reserved for teenagers. Three forces drive it — clear aligners made treatment socially invisible, adult disposable income arrived, and a generation realized that croded, overlapped teeth are not just an appearance issue but a cleaning issue: overlapped surfaces are exactly where plaque, tartar and gum inflammation settle first.",
          "There is also a prosthetic reason many adults discover late: before an implant, crown or veneer can look right, the foundation sometimes needs to be straightened first.",
        ],
      },
      {
        heading: "Your Three Options as an Adult",
        body: [
          "Each option moves teeth with the same biology — the difference is visibility, comfort and discipline required:",
        ],
        list: [
          "Metal braces: fastest for complex corrections, most economical, visible. Modern brackets are far smaller and smoother than the 'train tracks' parents remember.",
          "Ceramic braces: identical mechanics with tooth-colored brackets — low visibility at mid-range cost.",
          "Clear aligners (Invisalign): nearly invisible, removable for meetings and photos; demands 20–22 hours of daily discipline and suits mild-to-moderate corrections best.",
        ],
      },
      {
        heading: "How Long Adult Treatment Takes",
        body: [
          "Adult bone remodels slightly slower than a teenager's, but the difference is measured in months, not years. Mild spacing or crowding: 6–12 months. Typical comprehensive cases: 12–24 months. Complex bites: up to 30 months. Clear-aligner express cases can finish even faster.",
          "What genuinely stretches adult timelines is not age — it is missed appointments, broken brackets from hard food habits, and (with aligners) insufficient daily wear. Compliance is the clock.",
        ],
      },
      {
        heading: "Daily Life With Braces at 30, 40 or 55",
        body: [
          "The adaptations are smaller than feared. Speech returns to normal within a week of any new appliance. Food adjustments — cutting apples, avoiding betel nut and bone-hard snacks — protect brackets. Pain is managed with ordinary painkillers for the 2–3 days after each adjustment. Adults typically adapt faster than teenagers because they follow instructions.",
          "After braces, retainers are non-negotiable: teeth remember their old positions for life, and nighttime retainer wear is what keeps your investment permanent. Treat the retainer like spectacles — a small nightly habit protecting a two-year project.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "কেন ক্রমে বাড়ছে প্রাপ্তবয়স্কদের সংখ্যা",
        body: [
          "ঢাকার ওয়েটিং রুমে একটা নীরব বদল চোখে পড়ছে: ত্রিশ-চল্লিশের পেশাদাররা এমন অর্থোডন্টিক চিকিৎসা শুরু করছেন, যেটা একসময় বাবা-মা শুধু কিশোর-কিশোরীদের জন্য ভাবতেন। তিনটি কারণ — ক্লিয়ার অ্যালাইনার চিকিৎসাকে সামাজিকভাবে অদৃশ্য করেছে, প্রাপ্তবয়স্কদের সামর্থ্য এসেছে, আর একটি প্রজন্ম বুঝেছে বাঁকা জোড়া দাঁত শুধু চেহারার নয়, পরিষ্কারের সমস্যাও: জোড়া পড়া পৃষ্ঠগুলোতেই প্লাক, টারটার আর মাড়ির প্রদাহ আগে বসে।",
          "আরও একটি কারণ অনেকে দেরিতে জানেন: ইমপ্ল্যান্ট, ক্রাউন বা ভিনিয়ার সুন্দর হতে হলে ভিত্তিটা আগে সোজা করা লাগতে পারে।",
        ],
      },
      {
        heading: "প্রাপ্তবয়স্ক হিসেবে আপনার তিন বিকল্প",
        body: [
          "প্রতিটি বিকল্প একই জীববিজ্ঞানে দাঁত সরায় — পার্থক্য দৃশ্যমানতা, আরাম ও শৃঙ্খলায়:",
        ],
        list: [
          "মেটাল ব্রেসেস: জটিল সংশোধনে দ্রুততম ও সবচেয়ে সাশ্রয়ী, দৃশ্যমান। আজকের ব্র্যাকেট বাবা-মায়ের মনে রাখা 'রেললাইনের' চেয়ে অনেক ছোট ও মসৃণ।",
          "সিরামিক ব্রেসেস: একই কৌশল, দাঁতের রঙের ব্র্যাকেট — মাঝারি খরচে কম দৃশ্যমান।",
          "ক্লিয়ার অ্যালাইনার (ইনভিজালাইন): প্রায় অদৃশ্য, মিটিং-ছবির জন্য খোলা যায়; দৈনিক ২০–২২ ঘণ্টার শৃঙ্খলা চায়, হালকা-মাঝারি সংশোধনে সবচেয়ে মানানসই।",
        ],
      },
      {
        heading: "প্রাপ্তবয়স্কদের চিকিৎসায় কত সময় লাগে",
        body: [
          "প্রাপ্তবয়স্কের হাড় কিশোরের চেয়ে একটু ধীরে গঠিত হয়, তবে পার্থক্যটা বছরে নয়, মাসে। হালকা ফাঁক বা জোড়া: ৬–১২ মাস। সাধারণ পূর্ণাঙ্গ কেস: ১২–২৪ মাস। জটিল কামড়: ৩০ মাস পর্যন্ত। ক্লিয়ার-অ্যালাইনারের এক্সপ্রেস কেস আরও দ্রুত শেষ হয়।",
          "প্রাপ্তবয়স্কদের সময় আসলে বয়স নয় — বাড়ায় মিস হওয়া অ্যাপয়েন্টমেন্ট, শক্ত খাবারে ভাঙা ব্র্যাকেট, আর (অ্যালাইনারে) অপর্যাপ্ত পরা। শৃঙ্খলাই ঘড়ি।",
        ],
      },
      {
        heading: "৩০, ৪০ বা ৫৫ বছর বয়সে ব্রেসেস-জীবন",
        body: [
          "অভ্যস্ত হওয়া ভয়ের চেয়ে সহজ। নতুন যন্ত্রপাতির এক সপ্তাহের মধ্যেই বলা স্বাভাবিক হয়ে আসে। খাবারে সমন্বয় — আপেল কেটে, সুপারি ও হাড়-শক্ত নাস্তা এড়িয়ে — ব্র্যাকেট বাঁচায়। প্রতি অ্যাডজাস্টমেন্টের ২–৩ দিনের ব্যথা সাধারণ ব্যথানাশকেই চলে। নির্দেশ মানে বলে প্রাপ্তবয়স্করা কিশোরদের চেয়ে দ্রুত অভ্যস্ত হন।",
          "ব্রেসেসের পরে রিটেইনার বাধ্যতামূলক: দাঁত পুরনো জায়গা সারাজীবন মনে রাখে, আর রাতের রিটেইনারই আপনার দুই বছরের প্রজেক্ট স্থায়ী করে। রিটেইনারকে চশমার মতো ভাবুন — ছোট রাতের অভ্যাস, বড় সুরক্ষা।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "dental-crown-lifespan-warning-signs",
    title: "How Long Do Dental Crowns Last? 6 Signs Yours Needs Attention",
    titleBn:
      "ডেন্টাল ক্রাউন কত দিন টেকে? বিপদ জানানো ৬টি লক্ষণ",
    excerpt:
      "Ten to fifteen years is the average — but the range is enormous, and it is mostly under your control. What determines crown lifespan, and the signs that say 'book a checkup now'.",
    excerptBn:
      "গড়ে দশ থেকে পনেরো বছর — কিন্তু পরিসরটা বিশাল, আর অনেকটাই আপনার নিয়ন্ত্রণে। ক্রাউনের আয়ু কী ঠিক করে, আর যে লক্ষণগুলো বলে 'এখনই চেকআপ নিন'।",
    category: "Restorative",
    readTime: "6 min read",
    date: "2026-07-02",
    author: "Dr. Jumla Binte Jafor",
    authorCredentials:
      "BDS (DU), PGT — Restorative & Surgical Dentistry",
    tags: ["dental crown lifespan", "crown replacement", "root canal crown"],
    serviceRefs: ["crowns-bridges", "root-canal-treatment", "dental-implants"],
    image: "/images/service-crowns.png",
    imageAlt:
      "Dental crown on a model tooth showing fit margins at the gumline",
    quickAnswer:
      "A well-made crown lasts 10–15 years on average, and many serve 20+ with good care. Fit quality, bite alignment and your hygiene matter more than the material itself. Six signs a crown needs attention: visible chips, a changed bite, a dark line at the gum, new sensitivity, looseness, or pain on chewing. Any one of them warrants a checkup.",
    quickAnswerBn:
      "ভালোভাবে বানানো ক্রাউন গড়ে ১০–১৫ বছর চলে, ভালো যত্নে অনেকগুলো ২০+ বছরও। ফিটের মান, কামড়ের সমতা আর আপনার পরিচ্ছন্নতা উপাদানের চেয়ে বেশি গুরুত্বপূর্ণ। ক্রাউনের ছয় সতর্ক লক্ষণ: দৃশ্যমান চিপ, বদলে যাওয়া কামড়, মাড়ির কাছে কালো দাগ, নতুন অস্বস্তি, ঢিলাভাব, বা চিবালে ব্যথা — যেকোনো একটি দেখলেই চেকআপ।",
    sections: [
      {
        heading: "What Determines a Crown's Lifespan",
        body: [
          "A crown is a precision object living in a hostile environment — a mouth that chews, grinds, hosts bacteria and changes over decades. Four factors decide its lifespan: the quality of fit (a crown sealed to the tooth at a microscopic margin keeps bacteria out), the accuracy of your bite adjustment (uneven force chips porcelain and loosens cement), the underlying tooth's health, and your daily hygiene.",
          "Material matters less than patients assume. Porcelain-fused-to-metal and full zirconia both deliver excellent longevity in trained hands; the margin — not the brand — is where crowns fail.",
        ],
      },
      {
        heading: "Six Warning Signs to Watch For",
        body: [
          "Crowns rarely fail silently; they send signals first:",
        ],
        list: [
          "A chip or visible crack line in the porcelain.",
          "A bite that suddenly feels 'high' or different — the crown may have loosened or fractured beneath.",
          "A dark or grey line appearing at the gum edge — the metal margin showing, or gum recession exposing the join.",
          "New sensitivity to hot or cold around the crowned tooth — possible decay at the margin.",
          "A clicking or loose sensation when chewing.",
          "Pain or throbbing without an obvious trigger — the nerve or the bone under the crown may be involved.",
        ],
      },
      {
        heading: "Caring for a Crown So It Outlives the Average",
        body: [
          "The routine is unglamorous and effective: brush twice daily, clean between the teeth daily (floss or interdental brushes — the crown's margin hides where bristles cannot reach), and attend six-monthly checkups where we probe those margins and inspect the bite. If you grind at night, a night guard is the single best crown-saving investment you can make.",
          "Habits end more crowns than time does: cracking betel nut, opening bottle caps, chewing ice, or biting thread and wire. Every one of them transmits forces porcelain was never designed to take.",
        ],
      },
      {
        heading: "When Replacement Is Straightforward",
        body: [
          "Replacing a worn crown is usually simpler than the original work — the tooth is already prepared, and the process is largely measurement, fabrication and bonding. The expensive scenario is waiting too long: decay advancing under a failing crown can reach the nerve, converting a routine re-crown into root canal treatment, or worse, extraction and implant planning.",
          "If your crown is more than a decade old, a ten-minute examination tells you whether it has years left or is quietly approaching retirement.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "ক্রাউনের আয়ু কী ঠিক করে",
        body: [
          "ক্রাউন হলো শত্রুভূমির এক নিখুঁত জিনিস — এমন মুখে, যা চিবায়, ঘষে, ব্যাকটেরিয়া ধারণ করে আর দশক ধরে বদলায়। আয়ু ঠিক করে চারটি বিষয়: ফিটের মান (অণুবীক্ষণিক মার্জিনে দাঁতের সাথে সিল হওয়া ক্রাউন ব্যাকটেরিয়া আটকায়), কামড় সমন্বয়ের নির্ভুলতা (অসম চাপে পোর্সেলিন চিপ যায়, সিমেন্ট ঢিলা হয়), নিচের দাঁতের স্বাস্থ্য, আর আপনার দৈনিক পরিচ্ছন্নতা।",
          "উপাদান রোগীদের ধারণার চেয়ে কম গুরুত্বপূর্ণ। পোর্সেলিন-ফিউজড-টু-মেটাল আর ফুল জিরকোনিয়া দুটোই দক্ষ হাতে দারুণ স্থায়িত্ব দেয়; ক্রাউন ব্যর্থ হয় ব্র্যান্ডে নয় — মার্জিনে।",
        ],
      },
      {
        heading: "ছয়টি সতর্ক লক্ষণ",
        body: [
          "ক্রাউন নীরবে ব্যর্থ হয় কদাচিৎ; আগে সংকেত পাঠায়:",
        ],
        list: [
          "পোর্সেলিনে চিপ বা দৃশ্যমান ফাটলরেখা।",
          "কামড় হঠাৎ 'উঁচু' বা ভিন্ন লাগা — নিচে ফ্র্যাকচার বা সিমেন্ট ঢিলা হতে পারে।",
          "মাড়ির কিনারায় কালো বা ধূসর দাগ — মেটাল মার্জিন দেখা যাচ্ছে, বা মাড়ি সরে জোড়া বেরিয়ে আসছে।",
          "ক্রাউন-দাঁতে নতুন গরম-ঠান্ডা অস্বস্তি — মার্জিনে পোকা লেগেছে সম্ভব।",
          "চিবানোর সময় ক্লিক বা ঢিলা অনুভূতি।",
          "স্পষ্ট কারণ ছাড়াই ব্যথা বা ধড়ফড়ানি — ক্রাউনের নিচের স্নায়ু বা হাড় জড়িত হতে পারে।",
        ],
      },
      {
        heading: "গড়ের চেয়ে বেশি চালানোর যত্ন",
        body: [
          "রুটিনটি সাদামাটা কিন্তু কার্যকর: দিনে দুবার ব্রাশ, দাঁতের ফাঁক প্রতিদিন পরিষ্কার (ফ্লস বা ইন্টারডেন্টাল ব্রাশ — ক্রাউনের মার্জিন লুকিয়ে থাকে যেখানে ব্রিসেল পৌঁছায় না), আর ছয় মাস পর পর চেকআপে আমরা মার্জিন পরীক্ষা করি। রাতে দাঁত ঘষলে নাইট গার্ডই ক্রাউন বাঁচানোর সেরা বিনিয়োগ।",
          "সময়ের চেয়ে অভ্যাসে বেশি ক্রাউন শেষ হয়: সুপারি ফাটানো, বোতলের ছিপি খোলা, বরফ চিবানো, সুতা-তার কামড়ানো — প্রতিটিই এমন চাপ দেয়, যেটার জন্য পোর্সেলিন বানানোই হয়নি।",
        ],
      },
      {
        heading: "বদলানো যখন সহজ",
        body: [
          "পুরনো ক্রাউন বদলানো সাধারণত শুরুর কাজের চেয়ে সহজ — দাঁত আগেই প্রস্তুত, প্রক্রিয়াটা মূলত মাপ, তৈরি আর বন্ডিং। ব্যয়বহুল পরিস্থিতি হলো বেশি অপেক্ষা: ব্যর্থ ক্রাউনের নিচে এগোনো পোকা স্নায়ুতে পৌঁছালে রুট ক্যানেল লাগে, নইলে তোলাই লাগতে পারে — তখন ইমপ্ল্যান্টের পরিকল্পনা।",
          "আপনার ক্রাউন এক দশকের বেশি পুরনো হলে দশ মিনিটের পরীক্ষাই বলে দেবে — বছর বাকি আছে, নাকি নীরবে অবসরের পথে।",
        ],
      },
    ],
  },
];
