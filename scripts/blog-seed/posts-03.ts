import type { NewBlogPost } from "./type";

/* ------------------------------------------------------------------ */
/*  Seed batch 3/6 — Restorative (2) + Periodontics (2).              */
/*  Queries: "missing tooth bridge vs implant", "root canal vs        */
/*  extraction", "bleeding gums when brushing", "diabetes gum         */
/*  disease" — all perennial top-asked dental questions.              */
/* ------------------------------------------------------------------ */

export const posts03: NewBlogPost[] = [
  /* ---------------------------------------------------------------- */
  {
    slug: "missing-tooth-bridge-vs-implant",
    title: "Missing a Tooth? Bridge vs Implant vs Doing Nothing",
    titleBn:
      "দাঁত পড়ে গেছে? ব্রিজ, ইমপ্ল্যান্ট নাকি কিছু না করা — কোন পথ নেবেন",
    excerpt:
      "Every missing tooth starts a quiet chain reaction: drifting neighbours, bone loss, bite collapse. Here is how the two replacement options truly compare — and what 'waiting' really costs.",
    excerptBn:
      "পড়ে যাওয়া প্রতিটি দাঁত একটা নীরব চেইন-রিঅ্যাকশন শুরু করে: পাশের দাঁত সরা, হাড় ক্ষয়, কামড় ভাঙা। দুই বিকল্পের সত্যিকারের তুলনা — আর 'অপেক্ষা'র আসল দাম।",
    category: "Restorative",
    readTime: "8 min read",
    date: "2026-06-17",
    author: "Dr. Jumla Binte Jafor",
    authorCredentials:
      "BDS (DU), PGT — Restorative & Surgical Dentistry",
    tags: ["missing tooth replacement", "dental bridge vs implant", "tooth gap"],
    serviceRefs: ["crowns-bridges", "dental-implants", "oral-maxillofacial-surgery"],
    image: "/images/case-after-implant.png",
    imageAlt:
      "Completed smile after implant treatment replacing a missing front tooth",
    quickAnswer:
      "A missing tooth should usually be replaced within weeks to months. An implant replaces root and crown independently and preserves jawbone; a bridge is faster and cheaper upfront but requires trimming the two neighbouring teeth. Doing nothing is the most expensive option of all — it invites drifting teeth, bone loss, bite collapse and a much bigger problem later.",
    quickAnswerBn:
      "পড়ে যাওয়া দাঁত সাধারণত কয়েক সপ্তাহ থেকে কয়েক মাসের মধ্যে পুনস্থাপন করা উচিত। ইমপ্ল্যান্ট শিকড় ও ক্রাউন স্বাধীনভাবে বসায় আর হাড় রক্ষা করে; ব্রিজ দ্রুত ও শুরুতে সস্তা, কিন্তু পাশের দুই দাঁত ঘষে ছোট করতে হয়। কিছু না করাই সবচেয়ে দামি — দাঁত সরা, হাড় ক্ষয়, কামড় ভাঙা, আর পরে অনেক বড় সমস্যা।",
    sections: [
      {
        heading: "What Happens When a Gap Is Left Alone",
        body: [
          "Teeth are team players held in formation by mutual contact. Remove one and the neighbours begin tilting into the space within months; the tooth opposite starts dropping down (or growing up) hunting for a partner that no longer exists. Bite forces redistribute, some teeth begin carrying loads they were never shaped for, and jaw joints quietly protest.",
          "Meanwhile the bone that once held the root starts resorbing — the body removes what it stops using. Within a year the ridge visibly narrows, and replacing the tooth later becomes more complex and more expensive than replacing it now.",
        ],
      },
      {
        heading: "Implant: The Independent Solution",
        body: [
          "A dental implant replaces the root itself, so the bone keeps a reason to exist — this is the only option that stops bone loss at the gap. Neighbouring teeth stay untouched. The result feels and functions like your own tooth, and with ordinary care the system serves for decades. Implants also anchor bridges and dentures when multiple teeth are missing.",
          "The trade: implants take time (osseointegration over 8–12 weeks, longer with grafting), cost more upfront, and require adequate bone and general health as discussed with your dentist.",
        ],
      },
      {
        heading: "Bridge: The Faster Fix",
        body: [
          "A bridge suspends a false tooth between two crowned neighbours — a proven design that completes your smile in two to three weeks, at a lower upfront cost than an implant. It suits patients who want speed, or whose health, bone, or budget rules implants out for now.",
          "The trade is structural: the two healthy neighbouring teeth are trimmed for crowns they would not otherwise need, and the bone under the false tooth continues to slowly resorb. When those support teeth already have large fillings or crowns, the trade nearly vanishes — a bridge then becomes excellent dentistry.",
        ],
      },
      {
        heading: "Choosing With Your Dentist — the Real Factors",
        body: [
          "The right answer is clinical and personal, not universal. These are the factors that actually steer the decision:",
        ],
        list: [
          "Bone height and width at the gap (measured on a 3D scan).",
          "Condition of the neighbouring teeth — pristine favours implant, already-restored favours bridge.",
          "Your timeline — an event in three weeks points to a bridge.",
          "Budget structure — implants cost more now and less over decades; bridges the reverse.",
          "General health: uncontrolled diabetes and smoking complicate implant healing.",
          "Maintenance commitment — implants reward meticulous hygiene like nothing else.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "ফাঁক ফেলে রাখলে কী হয়",
        body: [
          "দাঁত পরস্পরের ছোঁয়ায় সারিবদ্ধ থাকে। একটি সরালে মাসের মধ্যেই পাশেরগুলো ঝুঁকে ফাঁকে ঢোকে; উল্টো দিকের দাঁত নিচে নামতে (বা ওপরে উঠতে) শুরু করে — সঙ্গী খুঁজতে, যে আর নেই। কামড়ের চাপ পুনর্বণ্টিত হয়, কিছু দাঁত এমন ভার বইতে শুরু করে যার জন্য তারা বানানোই নয়, আর চোয়ালের জয়েন্ট নীরবে আপত্তি জানায়।",
          "একই সময়ে শিকড় ধরে রাখা হাড় ক্ষয় হতে শুরু করে — শরীর যা ব্যবহার হয় না তা সরিয়ে ফেলে। এক বছরে রিজ স্পষ্ট সরু হয়, আর পরে দাঁত বসানো এখনকার চেয়ে জটিল ও দামি হয়ে যায়।",
        ],
      },
      {
        heading: "ইমপ্ল্যান্ট: স্বাধীন সমাধান",
        body: [
          "ডেন্টাল ইমপ্ল্যান্ট শিকড়টাই পুনর্স্থাপন করে, তাই হাড়ের থাকার কারণটাও থেকে যায় — একমাত্র এই বিকল্পই ফাঁকে হাড় ক্ষয় থামায়। পাশের দাঁতে হাত পড়ে না। ফল আপনার নিজের দাঁতের মতোই অনুভূত ও কার্যকর, আর সাধারণ যত্নে দশকের পর দশক চলে। একাধিক দাঁত পড়লে ইমপ্ল্যান্ট ব্রিজ ও ডেঞ্চারও ধরে রাখে।",
          "বিনিময়: ইমপ্ল্যান্ট সময় নেয় (৮–১২ সপ্তাহ অসিওইন্টিগ্রেশন, গ্রাফটিং হলে বেশি), শুরুতে বেশি খরচ, আর যথেষ্ট হাড় ও স্বাস্থ্য দরকার — যেটা ডেন্টিস্টের সাথে আলোচনার বিষয়।",
        ],
      },
      {
        heading: "ব্রিজ: দ্রুত সমাধান",
        body: [
          "ব্রিজ দুই ক্রাউন-করা পাশের দাঁতের মাঝে নকল দাঁত ঝুলিয়ে রাখে — প্রমাণিত ডিজাইন, যা দু-তিন সপ্তাহে হাসি ফেরায়, ইমপ্ল্যান্টের চেয়ে কম খরচে। যারা দ্রুত ফল চান, বা যাদের স্বাস্থ্য-হাড়-বাজেট এখন ইমপ্ল্যান্ট দেয় না, তাদের জন্য ভালো।",
          "বিনিময়টা গঠনগত: দুটি সুস্থ পাশের দাঁত এমন ক্রাউনের জন্য ঘষে ছোট করতে হয় যা তাদের দরকার ছিল না, আর নকল দাঁতের নিচের হাড় ধীরে ক্ষয় হতে থাকে। তবে পাশের দাঁতে যদি আগে থেকেই বড় ফিলিং বা ক্রাউন থাকে, বিনিময়টা প্রায় মিলে যায় — তখন ব্রিজই চমৎকার ডেন্টিস্ট্রি।",
        ],
      },
      {
        heading: "ডেন্টিস্টের সাথে বাছাই — আসল নির্ণায়ক",
        body: [
          "সঠিক উত্তর ক্লিনিক্যাল ও ব্যক্তিগত, সর্বজনীন নয়। সিদ্ধান্ত আসলে এসব বিষয়ে ঘোরে:",
        ],
        list: [
          "ফাঁকে হাড়ের উচ্চতা-প্রস্থ (থ্রিডি স্ক্যানে মাপা)।",
          "পাশের দাঁতের অবস্থা — খাঁটি হলে ইমপ্ল্যান্ট, আগেই ফিলিং-ক্রাউন থাকলে ব্রিজ।",
          "আপনার সময়সীমা — তিন সপ্তাহে অনুষ্ঠান হলে ব্রিজ।",
          "বাজেট কাঠামো — ইমপ্ল্যান্ট এখন বেশি, দশক ধরে কম; ব্রিজ উল্টো।",
          "সাধারণ স্বাস্থ্য: নিয়ন্ত্রণহীন ডায়াবেটিস ও ধূমপানে ইমপ্ল্যান্ট নিরাময় জটিল হয়।",
          "যত্নের প্রতিশ্রুতি — নিখুঁত পরিচ্ছন্নতায় ইমপ্ল্যান্টের বিনিময় সবচেয়ে বেশি।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "root-canal-vs-extraction-decision",
    title:
      "Root Canal vs Extraction: Which Costs You Less in Pain and Money?",
    titleBn:
      "রুট ক্যানেল নাকি দাঁত তোলা — ব্যথা আর টাকায় কোনটি সস্তা? সৎ হিসাব",
    excerpt:
      "'Just pull it' feels like the quick, cheap answer. The five-year math says otherwise — here is the full comparison, including the three cases where extraction is genuinely right.",
    excerptBn:
      "'তুলেই ফেলো' মনে হয় দ্রুত, সস্তা উত্তর। পাঁচ বছরের হিসাব অন্য কথা বলে — পূর্ণ তুলনা, সেই তিনটি ক্ষেত্রসহ যেখানে তোলাই সত্যিই সঠিক।",
    category: "Endodontics",
    readTime: "8 min read",
    date: "2026-06-04",
    author: "Dr. Jumla Binte Jafor",
    authorCredentials:
      "BDS (DU), PGT — Restorative & Surgical Dentistry",
    tags: ["root canal vs extraction", "save natural tooth", "toothache"],
    serviceRefs: ["root-canal-treatment", "dental-implants", "crowns-bridges"],
    image: "/images/service-rootcanal.png",
    imageAlt:
      "Dentist explaining X-ray of an infected tooth during root canal consultation",
    quickAnswer:
      "Saving the tooth with root canal treatment is almost always the better long-term choice. Extraction looks cheaper today, but the gap then demands an implant or bridge, neighbouring teeth drift, and bone disappears — total cost and chair time end up far higher. A root-canal-treated tooth protected by a crown chews for decades like a natural tooth.",
    quickAnswerBn:
      "রুট ক্যানেলে দাঁত বাঁচানোই প্রায় সবসময় দীর্ঘমেয়াদে ভালো। তোলা আজ সস্তা দেখায়, কিন্তু ফাঁকে তখন ইমপ্ল্যান্ট বা ব্রিজ লাগে, পাশের দাঁত সরে, হাড় কমে — মোট খরচ ও সময় অনেক বেশি হয়। ক্রাউনে সুরক্ষিত রুট-ক্যানেল-করা দাঁত দশক ধরে স্বাভাবিক দাঁতের মতোই চিবায়।",
    sections: [
      {
        heading: "The Real Cost of 'Just Pulling It'",
        body: [
          "Extraction is a single appointment with a single fee — and that is exactly where the honest accounting must continue. Once the socket heals, the gap begins its quiet damage: neighbours tilt, the opposing tooth drops, bite forces shift, and the jawbone under the gap resorbs because it has lost its root. Within a year or two, most patients want the gap fixed — and now the conversation is implants, bridges, or a slowly collapsing bite.",
          "The cheapest five-year path for a savable tooth is therefore: root canal plus crown, once. Not extraction, then replacement, then maintenance of that replacement.",
        ],
      },
      {
        heading: "What a Root Canal Actually Involves in 2026",
        body: [
          "Modern endodontics bears little resemblance to the stories that built its reputation. With profound anaesthesia and rotary nickel-titanium instruments, most treatments complete in one 60–90 minute visit; electronic apex locators measure root length precisely, and disinfection protocols are systematic. Patients routinely describe the experience as comparable to a long filling appointment.",
          "After treatment the tooth is sealed and protected — back teeth with a crown, front teeth depending on remaining structure. Success rates in contemporary practice sit above 95%, and a treated tooth that receives its crown on schedule can serve for decades.",
        ],
      },
      {
        heading: "When Extraction Is Genuinely the Right Call",
        body: [
          "Dentists fight to save teeth — but not at any cost. Extraction becomes the honest recommendation when:",
        ],
        list: [
          "The root is vertically fractured — no restoration can survive a crack through the root.",
          "Caries has destroyed the tooth to below the gumline, leaving nothing to restore onto.",
          "Severe periodontal disease has melted most of the supporting bone.",
          "An untreatable infection persists despite therapy, or the root canal anatomy cannot be negotiated.",
          "A hopeless tooth is compromising the health of its neighbours.",
        ],
      },
      {
        heading: "The Money Comparison, Honestly",
        body: [
          "Path A — root canal plus crown: the higher first bill; then routine hygiene; a treated tooth often serving 10–20+ years. Path B — extraction: the small first bill; then either acceptance of drifting teeth and bone loss, or an implant/bridge whose total cost exceeds Path A, spread over a longer, more surgical timeline.",
          "There is also a cost neither path prices the same: your own tooth. Nothing manufactured chews, senses pressure, or integrates with bone the way a natural tooth does — which is why, given a savable tooth, dentists still vote to save it.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "'তুলেই ফেলো' — আসল দাম",
        body: [
          "তোলা মানে এক অ্যাপয়েন্টমেন্ট, এক ফি — আর সৎ হিসাব ঠিক এখান থেকেই চলতে হবে। সকেট সারার পর ফাঁকটি নীরব ক্ষতি শুরু করে: পাশের দাঁত ঝুঁকে, উল্টো দাঁত নামে, কামড়ের চাপ সরে, আর শিকড় হারানোয় ফাঁকের নিচের হাড় ক্ষয় হয়। এক-দুই বছরের মধ্যেই বেশিরভাগ রোগী ফাঁক ভরাতে চান — আর তখন আলোচনা ইমপ্ল্যান্ট, ব্রিজ, বা ধীরে ভাঙা কামড় নিয়ে।",
          "বাঁচানো যায় এমন দাঁতের সস্তা পাঁচ-বছরের পথ তাই: একবার রুট ক্যানেল আর ক্রাউন — তোলা, তারপর পুনস্থাপন, তারপর তার যত্ন নয়।",
        ],
      },
      {
        heading: "২০২৬-এ রুট ক্যানেল আসলে কী",
        body: [
          "আধুনিক এন্ডোডন্টিক্স তার পুরনো খ্যাতির গল্পের সাথে মেলে না। পূর্ণ অ্যানেস্থেসিয়া আর রোটারি নিকেল-টাইটেনিয়াম যন্ত্রে বেশিরভাগ চিকিৎসা ৬০–৯০ মিনিটের এক ভিজিটেই শেষ; ইলেকট্রনিক অ্যাপেক্স লোকেটর শিকড়ের দৈর্ঘ্য নির্ভুল মাপে, জীবাণুমুক্তকরণ পদ্ধতিবদ্ধ। রোগীরা অভিজ্ঞতাটি বর্ণনা করেন লম্বা ফিলিং অ্যাপয়েন্টমেন্টের মতোই।",
          "চিকিৎসার পর দাঁত সিল ও সুরক্ষিত হয় — পেছনের দাঁতে ক্রাউন, সামনেরটিতে অবশিষ্ট গঠন অনুযায়ী। আধুনিক চর্চায় সফলতা ৯৫ শতাংশের ওপরে, আর সময়মতো ক্রাউন পাওয়া দাঁত দশক ধরে চলে।",
        ],
      },
      {
        heading: "কখন তোলাই সত্যিই সঠিক",
        body: [
          "ডেন্টিস্টরা দাঁত বাঁচান — কিন্তু যেকোনো দামে নয়। তোলাই সৎ পরামর্শ হয় যখন:",
        ],
        list: [
          "শিকড় লম্বালম্বি ফেটেছে — শিকড়ের ভেতর দিয়ে ফাটলে কোনো রেস্টোরেশনই বাঁচে না।",
          "পোকা মাড়ির নিচ পর্যন্ত দাঁত নষ্ট করেছে, ফেরানোর মতো কিছু নেই।",
          "ভয়াবহ মাড়ির রোগে ধারণকারী হাড়ের বেশিরভাগ গলে গেছে।",
          "চিকিৎসা সত্ত্বেও অসহ্য সংক্রমণ, বা ক্যানেল-গঠন এমন যা পরিষ্কার করা যায় না।",
          "আশাহীন দাঁত পাশের দাঁতের ক্ষতি করছে।",
        ],
      },
      {
        heading: "সৎ টাকার তুলনা",
        body: [
          "পথ ক — রুট ক্যানেল আর ক্রাউন: প্রথম বিল বেশি; তারপর রুটিন যত্ন; চিকিৎসাকৃত দাঁত প্রায়ই ১০–২০+ বছর চলে। পথ খ — তোলা: প্রথম বিল ছোট; তারপর হয় দাঁত সরা আর হাড় ক্ষয় মেনে নেওয়া, নয়তো ইমপ্ল্যান্ট/ব্রিজ — যার মোট খরচ পথ ক-কে ছাড়িয়ে যায়, লম্বা ও সার্জিক্যাল সময়রেখায়।",
          "একটা দাম দুই পথ একই ভাবে মাপে না: আপনার নিজের দাঁত। বানানো কোনো কিছুই স্বাভাবিক দাঁতের মতো চিবায় না, চাপ টের পায় না, হাড়ের সাথে জুড়ায় না — এজন্যই বাঁচানো সম্ভব হলে ডেন্টিস্ট এখনো বাঁচাতে ভোট দেন।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "bleeding-gums-causes-treatment",
    title:
      "Bleeding Gums When Brushing: Causes and When It Is Gingivitis",
    titleBn:
      "ব্রাশ করলে মাড়ি থেকে রক্ত পড়ে কেন? কারণ আর কখন এটি জিনজিভাইটিস",
    excerpt:
      "Bleeding is not 'normal brushing friction' — it is the first measurable sign of gum inflammation. The two-week home-care test, and the four non-plaque causes nobody tells you about.",
    excerptBn:
      "রক্ত পড়া 'ব্রাশের স্বাভাবিক ঘর্ষণ' নয় — এটি মাড়ির প্রদাহের প্রথম মাপযোগ্য সংকেত। দুই সপ্তাহের হোম-কেয়ার টেস্ট, আর প্লাক-বহির্ভূত চারটি কারণ যেগুলো কেউ বলে না।",
    category: "Periodontics",
    readTime: "7 min read",
    date: "2026-05-21",
    author: "Dr. Abdur Rahim",
    authorCredentials: "BDS, MDS — Senior Consultant",
    tags: ["bleeding gums", "gingivitis treatment", "gum disease Dhaka"],
    serviceRefs: ["periodontal-gum-treatment"],
    image: "/images/blog-gum.png",
    imageAlt:
      "Close-up of gums showing early inflammation signs that cause bleeding when brushing",
    quickAnswer:
      "Bleeding while brushing is almost never normal — it is the classic first sign of gingivitis, gum inflammation caused by plaque at the gumline. It is fully reversible: correct brushing, daily interdental cleaning and a professional clean usually clear it within two weeks. If bleeding persists past two weeks, recurs after treatment, or comes with loose teeth or bad breath, see a dentist promptly.",
    quickAnswerBn:
      "ব্রাশে রক্ত পড়া প্রায় কখনোই স্বাভাবিক নয় — এটি জিনজিভাইটিসের ক্লাসিক প্রথম লক্ষণ, মাড়ির কিনারায় জমা প্লাকের প্রদাহ। পুরোপুরি ফেরানো যায়: সঠিক ব্রাশ, প্রতিদিন ফাঁক-পরিষ্কার আর প্রফেশনাল ক্লিনিংয়ে সাধারণত দুই সপ্তাহেই পরিষ্কার হয়। দুই সপ্তাহ পরও রক্ত থাকলে, চিকিৎসার পর ফিরলে, বা দাঁত ঢিলা ও দুর্গন্ধ সহ আসলে দ্রুত ডেন্টিস্ট দেখান।",
    sections: [
      {
        heading: "Why Gums Bleed",
        body: [
          "Healthy gums are pink, firm and indifferent to brushing. When plaque — the soft bacterial film — sits at the gumline for more than a day or two, the immune system responds with inflammation: blood vessels dilate, tissue swells, and the gum becomes tender enough that even gentle brushing breaks surface capillaries. The blood you see is the immune response, not brushing injury.",
          "This stage, gingivitis, is fully reversible because the attachment between gum and tooth is still intact. Left alone for months, it can progress into periodontitis — where the attachment itself dissolves, bone recedes, and teeth begin to mobilize. Bleeding is the free warning before the expensive stage.",
        ],
      },
      {
        heading: "The Two-Week Home-Care Test",
        body: [
          "Give your gums a structured chance to heal before assuming the worst:",
        ],
        list: [
          "Brush twice daily with a soft brush, angling bristles 45° toward the gumline — two full minutes.",
          "Clean between teeth daily: floss or interdental brushes reach where gingivitis actually lives.",
          "Rinse with warm salt water for a few days to soothe inflamed tissue.",
          "Book a professional scaling — hardened tartar cannot be brushed off at home, and it shelters the bacteria causing the inflammation.",
          "Re-assess at two weeks: healthy gums at this point no longer bleed on brushing.",
        ],
      },
      {
        heading: "When Bleeding Persists — and What It Means",
        body: [
          "Bleeding that survives two weeks of honest home care means one of two things: tartar remains below the gumline (needs professional cleaning, possibly deeper gum treatment), or the cause is not plaque at all. Persistent bleeding with visible gum recession, elongating teeth, drifting gaps or persistent bad breath points to periodontitis, which needs structured periodontal therapy — the earlier, the more tooth-saving.",
          "Untreated periodontitis, not cavities, is the leading cause of tooth loss in adults worldwide. It is also where 'my gums have always bled' becomes the most expensive sentence in dentistry.",
        ],
      },
      {
        heading: "Four Causes Beyond Plaque",
        body: [
          "Not every bleeding gum story starts with hygiene:",
        ],
        list: [
          "Pregnancy: hormonal gingivitis affects a majority of pregnant women and needs gentler — not less — care.",
          "Medication: blood thinners and some anticonvulsants exaggerate bleeding; never stop them yourself — inform your dentist instead.",
          "Vitamin gaps: severe vitamin C deficiency causes gum bleeding (rare, but real with restricted diets).",
          "Wrong technique: hard brushes, sawing floss and aggressive pressure injure gums mechanically — bleeding that follows trauma tends to be localized to the abused spots.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "মাড়ি রক্ত পড়ে কেন",
        body: [
          "সুস্থ মাড়ি গোলাপি, শক্ত আর ব্রাশে বিচলিত হয় না। প্লাক — নরম ব্যাকটেরিয়ার আস্তরণ — মাড়ির কিনারায় এক-দুই দিনের বেশি বসে থাকলে রোগ-প্রতিরোধ ব্যবস্থা প্রদাহে সাড়া দেয়: রক্তনালি প্রসারিত হয়, টিস্যু ফোলে, আর মাড়ি এত নরম হয় যে হালকা ব্রাশেই কৈশিক নালি ছিঁড়ে যায়। যে রক্ত দেখছেন সেটি রোগ-প্রতিরোধের সাড়া, ব্রাশের আঘাত নয়।",
          "এই ধাপ, জিনজিভাইটিস, পুরোপুরি ফেরানো যায় — কারণ মাড়ি-দাঁতের সংযুক্তি তখনো অক্ষত। মাসের পর মাস ফেলে রাখলে তা পেরিওডন্টাইটিসে যায় — সংযুক্তি গলে, হাড় সরে, দাঁত নড়তে শুরু করে। রক্ত হলো দামি ধাপের আগের ফ্রি সতর্কতা।",
        ],
      },
      {
        heading: "দুই সপ্তাহের হোম-কেয়ার টেস্ট",
        body: [
          "সবচেয়ে খারাপ ধরে নেওয়ার আগে মাড়িকে সুসংগঠিত সুযোগ দিন:",
        ],
        list: [
          "নরম ব্রাশে দিনে দুবার, ব্রিসেল মাড়ির দিকে ৪৫ ডিগ্রি করে — পুরো দুই মিনিট।",
          "দাঁতের ফাঁক প্রতিদিন পরিষ্কার: ফ্লস বা ইন্টারডেন্টাল ব্রাশ — জিনজিভাইটিস আসলে ওখানেই থাকে।",
          "কয়েক দিন হালকা গরম লবণ-পানিতে কুলকি — প্রদাহি টিস্যু শান্ত হয়।",
          "প্রফেশনাল স্কেলিং নিন — শক্ত টারটার ঘরে ব্রাশে ওঠে না, আর সেটিই ব্যাকটেরিয়াকে আশ্রয় দেয়।",
          "দুই সপ্তাহে মূল্যায়ন: এ পর্যায়ে সুস্থ মাড়ি আর ব্রাশে রক্ত দেয় না।",
        ],
      },
      {
        heading: "রক্ত থেমে না রাখলে — তার মানে",
        body: [
          "দুই সপ্তাহের সৎ হোম-কেয়ার টিকে থাকা রক্ত মানে দুইয়ের একটি: মাড়ির নিচে টারটার রয়ে গেছে (প্রফেশনাল ক্লিনিং, বেশি গেলে গভীর মাড়ির চিকিৎসা লাগবে), নয়তো কারণটাই প্লাক নয়। মাড়ি সরা, দাঁত লম্বা দেখানো, ফাঁক বাড়া বা দীর্ঘ দুর্গন্ধ-সহ রক্ত পেরিওডন্টাইটিসের ইঙ্গিত — যার চিকিৎসা কাঠামোবদ্ধ, আর যত আগে তত বেশি দাঁত-বাঁচানো।",
          "প্রাপ্তবয়স্কদের দাঁত পড়ে যাওয়ার শীর্ষ কারণ পোকা নয়, চিকিৎসাহীন পেরিওডন্টাইটিস — বিশ্বজুড়েই। আর ঠিক এখানেই 'আমার মাড়ি তো সবসময়ই রক্ত দেয়' বাক্যটি ডেন্টিস্ট্রির সবচেয়ে দামি বাক্য হয়ে ওঠে।",
        ],
      },
      {
        heading: "প্লাকের বাইরের চার কারণ",
        body: [
          "সব রক্ত-মাড়ির গল্প পরিচ্ছন্নতা দিয়ে শুরু হয় না:",
        ],
        list: [
          "গর্ভাবস্থা: হরমোনঘটিত জিনজিভাইটিস গর্ভবতীদের সংখ্যাগরিষ্ঠ অংশকে ছোঁয় — দরকার আরও নরম যত্ন, কম নয়।",
          "ওষুধ: রক্ত পাতলা করার ওষুধ ও কিছু অ্যান্টিকনভালসেন্ট রক্ত বাড়ায়; নিজে বন্ধ করবেন না — ডেন্টিস্টকে জানান।",
          "ভিটামিনের ঘাটতি: মারাত্মক ভিটামিন সি-র অভাবে মাড়ি রক্ত দেয় (বিরল, কিন্তু সীমিত খাদ্যে বাস্তব)।",
          "ভুল কৌশল: শক্ত ব্রাশ, করাতের মতো ফ্লস আর জোরে চাপ — যান্ত্রিক আঘাতে মাড়ি রক্ত দেয়; ওই রক্ত সাধারণত আহত জায়গায় সীমাবদ্ধ থাকে।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "diabetes-gum-disease-connection",
    title:
      "Diabetes and Gum Disease: The Two-Way Street Every Bangladeshi Patient Must Know",
    titleBn:
      "ডায়াবেটিস ও মাড়ির রোগ: দুমুখো রাস্তা, যেটা প্রতিটি বাংলাদেশি রোগীর জানা দরকার",
    excerpt:
      "High sugar weakens gums; inflamed gums push sugar up. With more than one in ten Bangladeshi adults diabetic, this is the dental article that is really about your whole body.",
    excerptBn:
      "শর্করা বেশি হলে মাড়ি দুর্বল হয়; প্রদাহি মাড়ি শর্করা বাড়ায়। বাংলাদেশের প্রতি দশজন প্রাপ্তবয়স্কের একজনেরও বেশি ডায়াবেটিস — এই ডেন্টাল লেখাটি আসলে আপনার গোটা শরীর নিয়ে।",
    category: "Periodontics",
    readTime: "7 min read",
    date: "2026-05-08",
    author: "Dr. Abdur Rahim",
    authorCredentials: "BDS, MDS — Senior Consultant",
    tags: ["diabetes gum disease", "periodontitis", "oral health Bangladesh"],
    serviceRefs: ["periodontal-gum-treatment", "dental-implants"],
    image: "/images/service-gum.png",
    imageAlt:
      "Dentist measuring gum pocket depths during a periodontal examination",
    quickAnswer:
      "Diabetes and gum disease feed each other. High blood sugar weakens gum defences, slows healing and makes infections more aggressive; meanwhile untreated periodontitis makes blood sugar harder to control — research consistently associates treating gum disease with improved HbA1c. Diabetic patients should see a dentist every 3–4 months, not every 6, and treat gum disease as part of diabetes management.",
    quickAnswerBn:
      "ডায়াবেটিস আর মাড়ির রোগ একে অন্যকে বাড়ায়। রক্তে শর্করা বেশি হলে মাড়ির প্রতিরোধ দুর্বল হয়, ক্ষত শুকায় ধীরে, সংক্রমণ হয় আক্রমণাত্মক; অন্যদিকে চিকিৎসাহীন পেরিওডন্টাইটিস শর্করা নিয়ন্ত্রণ কঠিন করে — গবেষণা বারবার দেখায়, মাড়ির চিকিৎসায় HbA1c উন্নত হয়। ডায়াবেটিস রোগীর ডেন্টিস্টের কাছে যাওয়া উচিত ৬ নয়, প্রতি ৩–৪ মাস পর — মাড়ির চিকিৎসাকে ডায়াবেটিস ব্যবস্থাপনারই অংশ ভাবুন।",
    sections: [
      {
        heading: "Why Diabetes Attacks the Gums First",
        body: [
          "Gums are where diabetes shows earliest for a simple reason: they are a barrier tissue wrapped around 28–32 teeth, constantly challenged by bacteria, with tiny blood vessels that high glucose damages first. Elevated sugar also thickens gum-fluid and impairs the white cells that arrive to fight infection — so the same plaque that a non-diabetic immune system handles quietly becomes a sustained battlefield in a poorly controlled diabetic.",
          "The statistics reflect this: periodontitis progresses faster, bleeds more, and destroys bone more aggressively in uncontrolled diabetes. Dentists are often the first clinicians to suspect it — recalcitrant gum disease is a famous early flag.",
        ],
      },
      {
        heading: "The Reverse Direction: How Gums Move Your Sugar",
        body: [
          "The traffic runs both ways. Periodontal inflammation pours inflammatory chemicals (cytokines) into the bloodstream, and these directly worsen insulin resistance — the core defect of type 2 diabetes. Controlled trials have repeatedly found that treating periodontitis improves HbA1c by a clinically meaningful margin, comparable to adding a second medication for some patients.",
          "In practical terms: a diabetic patient with untreated gum disease is fighting their diabetes with one hand tied. Treating the mouth is not cosmetic side-business; it is part of the therapy.",
        ],
      },
      {
        heading: "The 3–4 Month Rule for Diabetic Patients",
        body: [
          "Standard six-month recall schedules are built for standard-risk patients — and diabetes is not standard risk. We place diabetic patients, particularly those with any history of gum disease, on 3–4 month recall: professional cleaning at tighter intervals keeps bacterial load below the threshold where the impaired immune response loses control, and each visit catches changes early.",
          "The timing also matters around treatment: elective gum surgery and implant placement heal beautifully in well-controlled diabetes (HbA1c in target), and are deferred for stabilization in poorly controlled diabetes — one more reason to bring your latest lab values to dental consultations.",
        ],
      },
      {
        heading: "A Practical Protection Plan",
        body: [
          "Five habits, one list — diabetic patients who follow it keep their teeth and help their sugar together:",
        ],
        list: [
          "Brush twice daily with a soft brush, cleaning the gumline deliberately.",
          "Clean between teeth daily — interdental brushes are ideal for diabetic gums.",
          "Attend 3–4 monthly dental recalls; bring your recent HbA1c to each visit.",
          "Treat gum disease promptly and completely — half-treated periodontitis flares back.",
          "Tell your dentist every medication you take, including insulin regime changes.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "ডায়াবেটিস মাড়িতেই আগে আঘাত করে কেন",
        body: [
          "ডায়াবেটিস সবার আগে মাড়িতে দেখা দেয় একটা সহজ কারণে: মাড়ি হলো ২৮–৩২টি দাঁত ঘিরে থাকা প্রতিবেশী টিস্যু, সবসময় ব্যাকটেরিয়ার চ্যালেঞ্জে, আর তার ক্ষুদ্র রক্তনালিগুলো উচ্চ গ্লুকোজ আগেই নষ্ট করে। শর্করা বেশি হলে মাড়ির তরলও ঘন হয়, সংক্রমণ-বিরুদ্ধে আসা শ্বেত রক্তকণিকার কাজ কমে — ফলে যেই প্লাক নন-ডায়াবেটিকের রোগ-প্রতিরোধ নীরবেই সামলায়, নিয়ন্ত্রণহীন ডায়াবেটিকে তা টানা যুদ্ধক্ষেত্র হয়ে ওঠে।",
          "পরিসংখ্যানও তা-ই: নিয়ন্ত্রণহীন ডায়াবেটিসে পেরিওডন্টাইটিস দ্রুত বাড়ে, বেশি রক্ত দেয়, হাড় আক্রমণাত্মকভাবে গলায়। অনেক সময় ডেন্টিস্টরাই প্রথম সন্দেহ করেন — সারছে না এমন মাড়ির রোগ ডায়াবেটিসের বিখ্যাত প্রাথমিক পতাকা।",
        ],
      },
      {
        heading: "উল্টো দিক: মাড়ি শর্করা বাড়ায় যেভাবে",
        body: [
          "চলাচল দুমুখো। পেরিওডন্টাল প্রদাহ রক্তে প্রদাহ-সৃষ্টিকারী রাসায়নিক (সাইটোকাইন) ঢালে, আর সেগুলো সরাসরি ইনসুলিন রোধ বাড়ায় — টাইপ-২ ডায়াবেটিসের মূল ত্রুটি। নিয়ন্ত্রিত ট্রায়াল বারবার দেখেছে, পেরিওডন্টাইটিস চিকিৎসায় HbA1c ক্লিনিক্যালভাবে অর্থবহ মাত্রায় কমে — কারও কারও জন্য আরেকটি ওষুধ যোগের মতো।",
          "বাস্তব কথায়: চিকিৎসাহীন মাড়ির রোগ-সহ ডায়াবেটিক রোগী এক হাত বেঁধে নিজের ডায়াবেটিসের যুদ্ধ করছেন। মুখের চিকিৎসা সাজসজ্জার পার্শ্ব-কাজ নয়; এটি মূল চিকিৎসারই অংশ।",
        ],
      },
      {
        heading: "ডায়াবেটিক রোগীর ৩–৪ মাসের নিয়ম",
        body: [
          "ছয় মাসের সাধারণ রিকল তৈরি হয় সাধারণ-ঝুঁকির রোগীর জন্য — আর ডায়াবেটিস সাধারণ ঝুঁকি নয়। ডায়াবেটিক রোগীদের, বিশেষত মাড়ির রোগের ইতিহাস থাকলে, আমরা ৩–৪ মাসের রিকলে রাখি: কাছাকাছি ব্যবধানে প্রফেশনাল ক্লিনিং ব্যাকটেরিয়ার ভার সেই সীমার নিচে রাখে যেখানে দুর্বল রোগ-প্রতিরোধ নিয়ন্ত্রণ হারায়, আর প্রতিটি ভিজিটে বদল আগেই ধরা পড়ে।",
          "চিকিৎসার সময়ও দরকার: ভালোভাবে নিয়ন্ত্রিত ডায়াবেটিসে (লক্ষ্যে HbA1c) মাড়ির সার্জারি ও ইমপ্ল্যান্ট দারুণ সারে, আর নিয়ন্ত্রণহীন অবস্থায় স্থিতিশীল হওয়া পর্যন্ত স্থগিত হয় — ডেন্টাল কনসালটেশনে সাম্প্রতিক ল্যাব রিপোর্ট আনার আরেকটি কারণ।",
        ],
      },
      {
        heading: "বাস্তব সুরক্ষা পরিকল্পনা",
        body: [
          "পাঁচ অভ্যাস, এক তালিকা — যারা মানেন, তারা দাঁতও রাখেন, শর্করাকেও সাহায্য করেন:",
        ],
        list: [
          "নরম ব্রাশে দিনে দুবার, মাড়ির কিনারা জেনে বুঝে পরিষ্কার।",
          "দাঁতের ফাঁক প্রতিদিন — ডায়াবেটিক মাড়ির জন্য ইন্টারডেন্টাল ব্রাশ আদর্শ।",
          "৩–৪ মাস পর পর ডেন্টাল রিকল; প্রতিটি ভিজিটে সাম্প্রতিক HbA1c সঙ্গে আনুন।",
          "মাড়ির রোগ দ্রুত ও পুরোপুরি চিকিৎসা করান — আধা-চিকিৎসা পেরিওডন্টাইটিস ফিরে জ্বলে।",
          "নেওয়া প্রতিটি ওষুধ ডেন্টিস্টকে জানান — ইনসুলিন নিয়মের বদলও।",
        ],
      },
    ],
  },
];
