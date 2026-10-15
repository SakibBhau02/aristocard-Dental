import type { NewBlogPost } from "./type";

/* ------------------------------------------------------------------ */
/*  Seed batch 4/6 — Periodontics (1) + Oral Surgery (2) +             */
/*  Pediatric (1). Queries: "does scaling damage teeth" (massive in    */
/*  Bangladesh), "wisdom tooth removal necessary", "knocked out        */
/*  tooth what to do", "baby teeth cavities matter".                  */
/* ------------------------------------------------------------------ */

export const posts04: NewBlogPost[] = [
  /* ---------------------------------------------------------------- */
  {
    slug: "teeth-scaling-damage-myth-bangladesh",
    title:
      "Does Teeth Scaling Damage Teeth? Bangladesh's Biggest Dental Myth, Explained",
    titleBn:
      "স্কেলিংয়ে কি দাঁত নষ্ট হয়? বাংলাদেশের সবচেয়ে বড় ডেন্টাল মিথের ব্যাখ্যা",
    excerpt:
      "'Scaling made my father's teeth loose' — the sentence that keeps thousands away from the one cleaning that saves teeth. What the machine actually does, and why teeth feel strange after.",
    excerptBn:
      "'স্কেলিংয়ের পর বাবার দাঁত ঢিলা হয়ে গিয়েছিল' — এই এক বাক্যই হাজারো মানুষকে সেই একটি ক্লিনিং থেকে দূরে রাখে যা দাঁত বাঁচায়। যন্ত্রটি আসলে কী করে, আর পরে দাঁত অদ্ভুত লাগে কেন।",
    category: "Periodontics",
    readTime: "6 min read",
    date: "2026-04-24",
    author: "Dr. Abdur Rahim",
    authorCredentials: "BDS, MDS — Senior Consultant",
    tags: ["teeth scaling", "scaling myth", "dental cleaning Dhaka"],
    serviceRefs: ["periodontal-gum-treatment", "laser-assisted-fillings"],
    image: "/images/blog-gum.png",
    imageAlt:
      "Ultrasonic dental scaler removing calculus deposits from teeth",
    quickAnswer:
      "No — professional scaling does not damage enamel or loosen teeth. Ultrasonic scalers vibrate calculus off with water irrigation; enamel is far harder than anything the instrument touches. Teeth can feel 'strange or loose' afterwards only when gum disease had already loosened them — the calculus was acting as a splint hiding the damage. Skipping scaling is what actually destroys teeth, through the gum disease nobody feels until it is advanced.",
    quickAnswerBn:
      "না — প্রফেশনাল স্কেলিংয়ে এনামেল নষ্ট হয় না, দাঁত ঢিলাও হয় না। আল্ট্রাসনিক স্কেলার পানির সাথে কম্পনে ক্যালকুলাস ঝরিয়ে দেয়; এনামেল যন্ত্রের ছোঁয়ার চেয়ে অনেক শক্ত। পরে দাঁত 'অদ্ভুত বা ঢিলা' লাগে শুধু তখন, যখন মাড়ির রোগে দাঁত আগেই ঢিলা হয়ে গেছে — ক্যালকুলাস স্প্লিন্টের মতো সেই ক্ষতি ঢেকে রেখেছিল। দাঁত আসলে ধ্বংস করে স্কেলিং না করানোই — সেই মাড়ির রোগ, যা শেষ ধাপ ছাড়া টেরও পাওয়া যায় না।",
    sections: [
      {
        heading: "Where the Fear Comes From",
        body: [
          "The myth has a real story behind it — that is why it survives. A patient with years of ignored gum disease finally visits when teeth already move slightly. Heavy calculus has fused across the tooth roots like cement scaffolding. After scaling removes it, the teeth feel newly mobile and gaps appear between them — and the cleaning, the only thing that stopped the disease, gets blamed for the disease.",
          "What actually loosened those teeth was months of silent bone loss under the calculus. The scaling simply removed the cast that was concealing the fracture.",
        ],
      },
      {
        heading: "What the Machine Actually Does",
        body: [
          "Modern scaling is ultrasonic: a metal tip vibrating at 25–40 kHz fractures calculus off tooth surfaces while a water jet cools and flushes the debris. It works precisely because calculus is brittle and enamel is not — the vibration breaks the calcified deposit while gliding over the far harder enamel. Fine hand instruments then polish the root surfaces smooth so plaque re-attaches with difficulty.",
          "Enamel is the hardest tissue in the human body. A scaler cannot cut it in normal use — the physics of the interaction simply does not allow it. Sensitivity for a day or two afterwards is real, and it comes from freshly exposed root surfaces that calculus was covering, not from thinned enamel.",
        ],
      },
      {
        heading: "Why Teeth Can Feel Different After Scaling",
        body: [
          "Three legitimate sensations get misread as damage: exposed root surfaces now feel cold water and air (sensitivity that fades as the tooth adapts, and that signals where gum recession already existed); gaps between teeth appear where calculus walls were removed (the space the disease created, now visible); and genuinely mobile teeth lose their calculus splint (the truth about their support, revealed).",
          "In a healthy mouth — regular cleanings, minimal calculus — none of these sensations occur, because there was nothing dramatic to remove in the first place. Scaling is dramatic only when it is overdue.",
        ],
      },
      {
        heading: "How Often Should You Actually Scale?",
        body: [
          "For healthy gums with good home care: once every 6–12 months, paired with your checkup. With gum disease history, smoking or diabetes: every 3–4 months. The interval is a maintenance decision your dentist sets based on how fast calculus forms on your teeth — it is genuinely different between people.",
          "The economics deserve one line: a year of six-monthly scaling costs less than a single crown, and immeasurably less than the gum surgery or implant that neglected periodontitis eventually invoices.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "ভয়টা এল কোথা থেকে",
        body: [
          "মিথের পেছনে সত্যি গল্প আছে — তাই সেটি বাঁচে। বছরের পর বছর অবহেলায় রাখা মাড়ির রোগের রোগী তখন আসেন, যখন দাঁত এমনিতেই একটু নড়ে। ভারী ক্যালকুলাস দাঁতের শিকড় জুড়ে সিমেন্টের বাঁধাইয়ের মতো জমে থাকে। স্কেলিংয়ে তা সরলে দাঁত নতুন করে নড়মড় লাগে, ফাঁক দেখা দেয় — আর রোগ থামানো একমাত্র কাজটিই রোগের দায় পায়।",
          "দাঁত আসলে ঢিলা করেছিল ক্যালকুলাসের নিচে মাসে মাসে নীরব হাড়-ক্ষয়। স্কেলিং শুধু সেই পাটা খুলে দিল, যা ভাঙার ঢাকনাটা ছিল।",
        ],
      },
      {
        heading: "যন্ত্রটি আসলে কী করে",
        body: [
          "আধুনিক স্কেলিং আল্ট্রাসনিক: ২৫–৪০ কিলোহার্জে কাঁপা ধাতব টিপ দাঁতের গা থেকে ক্যালকুলাস ভেঙে দেয়, সাথে পানির ধারা ঠান্ডা করে ধুয়ে নেয়। এটি কাজ করে ঠিক এজন্যই যে ক্যালকুলাস ভঙ্গুর আর এনামেল নয় — কম্পন জমাট জিনিস ভাঙে, অনেক শক্ত এনামেলের গা বেয়ে যায়। এরপর হাতের সরু যন্ত্র শিকড়ের পৃষ্ঠ মসৃণ করে, যাতে প্লাক আবার জোড়া দিতে কষ্ট হয়।",
          "এনামেল মানুষের শরীরের সবচেয়ে শক্ত টিস্যু। স্বাভাবিক ব্যবহারে স্কেলার সেটি কাটতেই পারে না — পদার্থবিজ্ঞানই দেয় না। পরে এক-দুই দিন অস্বস্তি বাস্তব, তবে তা আসে সদ্য-খোলা শিকড়ের পৃষ্ঠ থেকে যা ক্যালকুলাস ঢেকে রেখেছিল — পাতলা এনামেল থেকে নয়।",
        ],
      },
      {
        heading: "স্কেলিংয়ের পর দাঁত ভিন্ন লাগে কেন",
        body: [
          "তিনটি বৈধ অনুভূতিকেই ভুল পড়া হয় ক্ষতি হিসেবে: নতুন খোলা শিকড়ে ঠান্ডা পানি ও বাতাস লাগা (অস্বস্তি, দাঁত অভ্যস্ত হলে কমে — আর এটি জানায় মাড়ি সরা আগেই ছিল); ক্যালকুলাসের দেয়াল সরানোর পর দাঁতের ফাঁক দেখা দেওয়া (রোগের বানানো ফাঁক, এখন দৃশ্যমান); আর সত্যিই ঢিলা দাঁত তার ক্যালকুলাস-পাটা হারানো (ভিতের সত্য, প্রকাশিত)।",
          "সুস্থ মুখে — নিয়মিত ক্লিনিং, কম ক্যালকুলাস — এসবের কিছুই হয় না, কারণ সরানোর মতো নাটকীয় কিছুই ছিল না। স্কেলিং নাটকীয় হয় তখনই, যখন তা সময় পার করে ফেলা হয়।",
        ],
      },
      {
        heading: "আসলে কতদিন পর পর স্কেলিং?",
        body: [
          "ভালো যত্নে সুস্থ মাড়িতে: ৬–১২ মাসে একবার, চেকআপের সাথে। মাড়ির রোগের ইতিহাস, ধূমপান বা ডায়াবেটিস থাকলে: প্রতি ৩–৪ মাসে। ব্যবধানটা রক্ষণাবেক্ষণের সিদ্ধান্ত, আপনার দাঁতে ক্যালকুলাস কত দ্রুত জমে তার ওপর ভিত্তি করে ডেন্টিস্ট ঠিক করেন — মানুষভেদে সত্যিই ভিন্ন হয়।",
          "অর্থনীতিটাও এক লাইনের দাবির: ছয় মাসের স্কেলিংয়ের এক বছরের খরচ একটি ক্রাউনের চেয়ে কম, আর অবহেলার পেরিওডন্টাইটিস যে ইমপ্ল্যান্ট-সার্জারির বিল শেষে দেয়, তার তুলনাই হয় না।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "wisdom-teeth-removal-guide",
    title:
      "Wisdom Teeth Removal: When It Is Necessary and What Recovery Looks Like",
    titleBn:
      "জ্ঞানদাঁত তোলা: কখন দরকার আর রিকভারি আসলে কেমন হয়",
    excerpt:
      "Not every wisdom tooth must go — but the ones that do rarely announce themselves politely. Removal reasons, the stay-put criteria, and an honest day-by-day recovery timeline.",
    excerptBn:
      "প্রতিটি জ্ঞানদাঁত তুলতে হয় না — কিন্তু যেগুলোকে তুলতে হয়, সেগুলো ভদ্রভাবে জানানো দেয় না। তোলার কারণ, রয়ে যাওয়ার শর্ত, আর দিন ধরে ধরে সৎ রিকভারি টাইমলাইন।",
    category: "Oral Surgery",
    readTime: "8 min read",
    date: "2026-04-10",
    author: "Dr. Israt Jahan Rimi",
    authorCredentials: "BDS (DU), PGT (OMFS) — Consultant Dental Surgeon",
    tags: ["wisdom tooth", "tooth extraction", "impacted tooth Dhaka"],
    serviceRefs: ["oral-maxillofacial-surgery", "pediatric-dentistry"],
    image: "/images/blog-wisdom.png",
    imageAlt:
      "Panoramic dental X-ray showing impacted wisdom teeth in the lower jaw",
    quickAnswer:
      "A wisdom tooth needs removal when it is impacted, repeatedly infected, damaging the neighbouring tooth's roots, impossible to clean, or causing pain and crowding. Fully erupted, symmetrical, cleanable wisdom teeth can stay. Removal is easiest at 17–25 when roots are incomplete — recovery is typically 3–7 days, with the first 48 hours mattering most.",
    quickAnswerBn:
      "জ্ঞানদাঁত তুলতে হয় যখন তা ইমপ্যাক্টেড (আটকে থাকা), বারবার সংক্রমিত হয়, পাশের দাঁতের শিকড়ে ক্ষতি করে, পরিষ্কার করা অসম্ভব, বা ব্যথা-জোড়া সৃষ্টি করে। পুরো ওঠা, সুষম, পরিষ্কারযোগ্য জ্ঞানদাঁত থাকতে পারে। তোলা সবচেয়ে সহজ ১৭–২৫ বছরে, শিকড় অসম্পূর্ণ থাকতে — রিকভারি সাধারণত ৩–৭ দিন, আর প্রথম ৪৮ ঘণ্টাই সবচেয়ে গুরুত্বপূর্ণ।",
    sections: [
      {
        heading: "When Removal Is Clearly Necessary",
        body: [
          "The modern human jaw often runs out of room for third molars, and the tooth either stalls partway or grows crooked. The trouble that follows is predictable:",
        ],
        list: [
          "Recurring pericoronitis — the gum flap over a half-erupted tooth keeps swelling, aching and trapping food.",
          "Decay in the wisdom tooth or the back of the second molar, both impossible to restore in position.",
          "Cysts or resorption around an impacted tooth seen on X-ray.",
          "Unexplained pain radiating to the ear, jaw or head from a deeply impacted tooth.",
          "Orthodontic plans that require the space or the removal of eruption pressure.",
        ],
      },
      {
        heading: "When a Wisdom Tooth Can Stay",
        body: [
          "Straight, fully erupted, opposing another tooth, and reachable by your brush — such a wisdom tooth is simply a fourth molar doing its job. We monitor it at checkups like every other tooth and remove it only if the situation changes. Removal on principle alone is not modern practice; removal on evidence is.",
          "The decision comes from an examination plus a panoramic X-ray — five minutes of imaging that shows root shape, nerve proximity and the true angle of the tooth under the gum.",
        ],
      },
      {
        heading: "The Procedure and the First 72 Hours",
        body: [
          "Routine removal is done under local anesthesia; surgical removal of an impacted tooth adds a small gum flap and sometimes dividing the tooth into sections for gentle extraction — sounds dramatic, feels like pressure. Most appointments run 30–60 minutes, and you leave with sutures that dissolve.",
        ],
        list: [
          "First 24 hours: moist gauze pressure, no rinsing or straws (protect the clot — it is the healing), soft cool food, prescribed medication.",
          "Day 2–3: peak swelling, managed with ice and medication; gentle warm salt rinses begin.",
          "Day 4–7: swelling resolves, diet normalizes, stitches dissolve.",
          "Week 2: gum surface healed; deeper bone remodeling continues silently for weeks.",
        ],
      },
      {
        heading: "Why Timing Matters",
        body: [
          "Between 17 and 25 the roots are two-thirds formed at most, the bone is more forgiving, and recovery is measurably faster. After 30, the same surgery costs a stiffer week — and after 40, deeply impacted teeth that finally flare up bring longer recoveries with them.",
          "That is why we assess wisdom teeth in the late teens even when nothing hurts yet: the cheapest surgery is the one scheduled before the emergency chooses its own date.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "কখন তোলা স্পষ্টই দরকার",
        body: [
          "আধুনিক মানুষের চোয়ালে তৃতীয় পেষণদন্তের জায়গা প্রায়ই আটকে যায়, ফলে দাঁত হয় মাঝপথে থেমে যায়, নয়তো বাঁকা হয়ে বাড়ে। তার পরের বিপদটা অনুমানযোগ্য:",
        ],
        list: [
          "বারবার পেরিকোরোনাইটিস — আধা-ওঠা দাঁতের ওপরের মাড়ির পাটা ফোলে, ব্যথা করে, খাবার আটকে দেয়।",
          "জ্ঞানদাঁতে বা দ্বিতীয় মোলারের পেছনে পোকা — জায়গায় বসিয়ে চিকিৎসাই অসম্ভব।",
          "এক্স-রেতে ইমপ্যাক্টেড দাঁতের চারপাশে সিস্ট বা শিকড় গলন।",
          "গভীরে আটকে থাকা দাঁত থেকে কান, চোয়াল বা মাথায় ছড়ানো অকারণ ব্যথা।",
          "অর্থোডন্টিক পরিকল্পনা যেখানে জায়গা বা চাপ-অপসারণ দরকার।",
        ],
      },
      {
        heading: "কখন জ্ঞানদাঁত থাকতে পারে",
        body: [
          "সোজা, পুরো ওঠা, উল্টো দাঁতের সাথে জোড়া এবং ব্রাশের নাগালে — এমন জ্ঞানদাঁত তার কাজ করা চতুর্থ মোলার মাত্র। চেকআপে আমরা সব দাঁতের মতোই তাকে দেখি, পরিস্থিতি বদলালে তখনই তুলি। শুধু নিয়ম বলে তোলা আধুনিক চর্চা নয়; প্রমাণ দেখে তোলা।",
          "সিদ্ধান্তটি আসে পরীক্ষা আর একটি প্যানোরামিক এক্স-রে থেকে — পাঁচ মিনিটের ইমেজিং, যা শিকড়ের আকার, স্নায়ুর কাছাকাছি অবস্থান আর মাড়ির নিচে দাঁতের আসল কোণ দেখায়।",
        ],
      },
      {
        heading: "প্রক্রিয়া ও প্রথম ৭২ ঘণ্টা",
        body: [
          "সাধারণ তোলা লোকাল অ্যানেস্থেসিয়ায় হয়; ইমপ্যাক্টেড দাঁতের সার্জিক্যাল তোলায় যোগ হয় ছোট মাড়ির পাটা আর মাঝে মাঝে দাঁতকে টুকরো করে নরমভাবে তোলা — শুনতে ভারী, অনুভব হয় চাপ। বেশিরভাগ অ্যাপয়েন্টমেন্ট ৩০–৬০ মিনিট, আর ফেরেন গলে-যাওয়া সেলাই নিয়ে।",
        ],
        list: [
          "প্রথম ২৪ ঘণ্টা: ভেজা গজে চাপ, কুলকি বা স্ট্র নয় (জমাট রক্ত রক্ষা করুন — সেটিই আরোগ্য), নরম ঠান্ডা খাবার, নির্ধারিত ওষুধ।",
          "দিন ২–৩: ফোলার শিখর — বরফ আর ওষুধে; হালকা গরম লবণ-পানিতে কুলকি শুরু।",
          "দিন ৪–৭: ফোলা নামে, খাবার স্বাভাবিক হয়, সেলাই গলে।",
          "সপ্তাহ ২: মাড়ির পৃষ্ঠ সারে; ভেতরের হাড় সপ্তাহোপরি নীরবে গড়ে।",
        ],
      },
      {
        heading: "সময় কেন গুরুত্বপূর্ণ",
        body: [
          "১৭ থেকে ২৫-এর মধ্যে শিকড় বড়জোর দুই-তৃতীয়াংশ গড়ে, হাড় অনেক নমনীয়, আর রিকভারি স্পষ্টভাবে দ্রুত। ৩০-এর পরে একই সার্জারি মানে আরেকটি কঠিন সপ্তাহ — আর ৪০-এর পরে যেসব গভীর ইমপ্যাক্টেড দাঁত শেষে জ্বলে ওঠে, সেগুলো লম্বা রিকভারি নিয়ে আসে।",
          "এজন্যই কিছুই ব্যথা না করলেও আমরা কিশোর বয়সের শেষে জ্ঞানদাঁত মূল্যায়ন করি: সবচেয়ে সস্তা সার্জারি সেটাই, যা ইমার্জেন্সি নিজের তারিখ বেছে নেওয়ার আগেই পরিকল্পিত হয়।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "knocked-out-tooth-emergency-guide",
    title: "Knocked-Out Tooth? The First 30 Minutes Decide If It Can Be Saved",
    titleBn:
      "দাঁত পড়ে গেছে? প্রথম ৩০ মিনিটই ঠিক করে — বাঁচানো যাবে কি না",
    excerpt:
      "A completely knocked-out adult tooth is a genuine emergency — and also one of dentistry's most savable. The handling rules, storage options, and the baby-tooth exception every parent must know.",
    excerptBn:
      "সম্পূর্ণ পড়ে যাওয়া বড় দাঁত সত্যিকারের ইমার্জেন্সি — আর ডেন্টিস্ট্রির সবচেয়ে বাঁচানো-যোগ্য কেসগুলোর একটি। ধরার নিয়ম, রাখার বিকল্প, আর শিশুদের দুধদাঁতের ব্যতিক্রম — প্রতিটি বাবা-মায়ের জানা দরকার।",
    category: "Oral Surgery",
    readTime: "6 min read",
    date: "2026-03-31",
    author: "Dr. Israt Jahan Rimi",
    authorCredentials: "BDS (DU), PGT (OMFS) — Consultant Dental Surgeon",
    tags: ["knocked out tooth", "dental emergency", "tooth avulsion"],
    serviceRefs: ["oral-maxillofacial-surgery", "root-canal-treatment", "pediatric-dentistry"],
    image: "/images/blog-emergency.png",
    imageAlt:
      "Emergency dental care concept with a knocked-out tooth preserved in milk",
    quickAnswer:
      "A fully knocked-out adult tooth can often be reimplanted if you act within 30 minutes. Hold it by the crown — never scrub or touch the root — rinse gently, and keep it in milk, inside your cheek, or best of all back in its socket, then reach a dentist immediately. A child's baby tooth must NOT be reimplanted; control bleeding and see a dentist the same day.",
    quickAnswerBn:
      "সম্পূর্ণ পড়ে যাওয়া বড় দাঁত প্রায়ই পুনরায় বসানো যায় — ৩০ মিনিটের মধ্যে কাজ করলে। ধরুন মুকুট অংশ ধরে — শিকড় কখনোই ঘষবেন না বা ছুঁবেন না — আলতো ধুয়ে, দুধে, গালের ভেতরে, বা সবচেয়ে ভালো নিজের গর্তে রেখে সাথে সাথে ডেন্টিস্টের কাছে যান। শিশুর দুধদাঁত আবার বসানো যাবে না; রক্ত থামিয়ে সেদিনই ডেন্টিস্ট দেখান।",
    sections: [
      {
        heading: "The 30-Minute Rule",
        body: [
          "Once a tooth leaves its socket, the thin living cells on its root begin dying on contact with air, water and handling. Reimplantation within 30 minutes preserves them best; within two hours is still worth attempting. Every parent, coach and teacher should know the sequence below — in Dhaka traffic, knowing it in advance is what makes the timeline possible.",
        ],
        list: [
          "Find the tooth; hold it ONLY by the crown (the white chewing part).",
          "If dirty, rinse briefly under gently running water or milk — no scrubbing, no antiseptic, no cloth.",
          "Best: push it back into its socket immediately, facing the right way, and bite gently on gauze or a handkerchief to hold it.",
          "If you cannot re-place it: store it in cold milk, or tucked inside the injured person's cheek (saliva is a good short-term medium).",
          "Never store it in plain water, and never let it dry out on a table.",
          "Reach a dentist immediately — the clinic can splint the tooth and begin the follow-up care it needs.",
        ],
      },
      {
        heading: "What Happens at the Clinic",
        body: [
          "The dentist cleans the site gently, repositions the tooth if you could not, and bonds a flexible splint to neighbouring teeth to hold it stable for 1–2 weeks. Because the nerve almost never survives avulsion in a mature tooth, root canal treatment is typically started within 7–10 days — deliberate, planned, painless — while the ligament reattaches.",
          "Follow-up reviews over the following months monitor healing. Reimplanted teeth saved by quick action can serve for years to decades; the outcome is decided overwhelmingly by those first 30 minutes.",
        ],
      },
      {
        heading: "The Baby-Tooth Exception",
        body: [
          "A knocked-out baby tooth is never reimplanted — re-placing it can damage the developing adult tooth growing above it. Control bleeding with firm gauze pressure, offer a cold compress for comfort, skip the glass of milk routine, and see a dentist the same day to inspect neighbouring teeth and the socket.",
          "What DOES apply to children: adult (permanent) front teeth knocked out in mixed-age kids — typically upper incisors around 7–10 years — follow the full emergency protocol above. Knowing which tooth it is changes the response, so when unsure, bring the tooth in milk and let the dentist decide.",
        ],
      },
      {
        heading: "Preventing the Emergency",
        body: [
          "Most avulsions we treat come from two sources: road accidents and sports. A custom or stock mouthguard transforms contact-sport risk; helmets and sensible speed do the rest. For families with young athletes, a mouthguard costs less than a single X-ray — the cheapest insurance in dentistry.",
          "Save your clinic's emergency number in your phone now, under a name you will find in panic. When the moment comes, you should be spending your attention on the tooth, not the search.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "৩০ মিনিটের নিয়ম",
        body: [
          "দাঁত গর্ত ছাড়া মাত্রই শিকড়ের সরু জীবন্ত কোষগুলো বাতাস, পানি ও ছোঁয়ায় মরতে শুরু করে। ৩০ মিনিটের মধ্যে পুনরায় বসালে সেগুলো সবচেয়ে ভালো থাকে; দুই ঘণ্টার মধ্যেও চেষ্টার মতো। প্রতিটি বাবা-মা, কোচ ও শিক্ষকের নিচের ধারাটি জানা উচিত — ঢাকার জ্যামে আগে থেকে জানাই টাইমলাইন সম্ভব করে।",
        ],
        list: [
          "দাঁত খুঁজুন; ধরুন শুধু মুকুট অংশে (সাদা চিবানো অংশ)।",
          "ময়লা হলে ধীর বয়ে যাওয়া পানি বা দুধে অল্প ধুবেন — ঘষা নয়, অ্যান্টিসেপটিক নয়, কাপড় নয়।",
          "সবচেয়ে ভালো: সাথে সাথে সঠিক দিকে নিজের গর্তে বসিয়ে গজ বা রুমালে আলতো কামড়ে ধরে রাখুন।",
          "বসাতে না পারলে: ঠান্ডা দুধে, বা আহত ব্যক্তির গালের ভেতরে রাখুন (লালা ভালো স্বল্পমেয়াদি মাধ্যম)।",
          "সাধারণ পানিতে কখনোই নয়, আর টেবিলে শুকাতে দেবেন না।",
          "সাথে সাথে ডেন্টিস্টের কাছে যান — ক্লিনিক দাঁত স্প্লিন্ট করে এবং পরের যত্ন শুরু করে।",
        ],
      },
      {
        heading: "ক্লিনিকে কী হয়",
        body: [
          "ডেন্টিস্ট জায়গাটি নরমভাবে পরিষ্কার করে, আপনি বসাতে না পারলে দাঁত জায়গামতো করে, আর পাশের দাঁতের সাথে নমনীয় স্প্লিন্ট বেঁধে ১–২ সপ্তাহ স্থির রাখে। পূর্ণবয়স্ক দাঁতের স্নায়ু প্রায় কখনোই এই ধাক্কা বাঁচায় না, তাই ৭–১০ দিনের মধ্যে পরিকল্পিত, নিশ্চিন্ত রুট ক্যানেল শুরু হয় — যখন লিগামেন্ট আবার জুড়ে।",
          "পরের মাসগুলোতে ফলো-আপ রিভিউ নিরাময় দেখে। দ্রুত কাজে বাঁচানো পুনর্বসানো দাঁত বছর থেকে দশক ধরে চলে; ফলাফলটি সেই প্রথম ৩০ মিনিটেই প্রায় পুরোপুরি ঠিক হয়ে যায়।",
        ],
      },
      {
        heading: "দুধদাঁতের ব্যতিক্রম",
        body: [
          "পড়ে যাওয়া দুধদাঁত কখনোই আবার বসানো হয় না — বসালে ওপরে গড়ন্ত বড় দাঁতের ক্ষতি হতে পারে। গজে দৃঢ় চাপে রক্ত থামান, আরামে ঠান্ডা সেক দিন, দুধের গ্লাস-নাটক বাদ দিন, আর সেদিনই ডেন্টিস্ট দেখান — পাশের দাঁত ও গর্ত পরীক্ষার জন্য।",
          "শিশুদের জন্য যা প্রযোজ্য: মিশ্র বয়সের বাচ্চাদের (সাধারণত ৭–১০ বছরের ওপরের কাটা দাঁত) পড়ে যাওয়া বড় দাঁতে ওপরের পূর্ণ ইমার্জেন্সি নিয়মই খাটে। কোন দাঁত তা জানা সাড়া বদলায় — তাই নিশ্চিত না হলে দাঁত দুধে নিয়ে আসুন, ডেন্টিস্ট ঠিক করুন।",
        ],
      },
      {
        heading: "ইমার্জেন্সি আগেই ঠেকানো",
        body: [
          "আমাদের কাছে আসা বেশিরভাগ অ্যাভালশানের দুই উৎস: সড়ক দুর্ঘটনা আর খেলাধুলা। কাস্টম বা স্টক মাউথগার্ড কন্টাক্ট-স্পোর্টের ঝুঁকি পাল্টে দেয়; বাকিটা হেলমেট আর সমীচীন গতি। তরুণ ক্রীড়াবিদের পরিবারের জন্য মাউথগার্ডের দাম একটি এক্স-রের চেয়েও কম — ডেন্টিস্ট্রির সবচেয়ে সস্তা বিমা।",
          "ক্লিনিকের ইমার্জেন্সি নম্বর এখনই ফোনে সেভ করুন, এমন নামে যেটা আতঙ্কের মুহূর্তেও খুঁজে পাবেন। মুহূর্তটি এলে আপনার মনোযোগ থাকা উচিত দাঁতে — খোঁজাখুঁজিতে নয়।",
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    slug: "baby-teeth-cavities-matter",
    title: "Do Baby Teeth Cavities Really Matter? Why Primary Teeth Deserve Treatment",
    titleBn:
      "দুধদাঁতের পোকা কি আদৌ গুরুত্বপূর্ণ? কেন শিশুদের দাঁতও পূর্ণাঙ্গ চিকিৎসার দাবিদার",
    excerpt:
      "'They fall out anyway' is the most expensive sentence in pediatric dentistry. What baby teeth actually do for your child, how decay there reshapes the adult smile, and why treatment today is gentler than parents fear.",
    excerptBn:
      "'যেহেতু পড়েই যাবে' — শিশু ডেন্টিস্ট্রির সবচেয়ে দামি বাক্য। দুধদাঁত আসলে কী করে, ওখানকার পোকা কীভাবে বড়দের হাসির নকশা বদলায়, আর কেন আজকের চিকিৎসা বাবা-মায়ের ভয়ের চেয়ে কোমল।",
    category: "Pediatric",
    readTime: "7 min read",
    date: "2026-03-18",
    author: "Dr. Shazia Khanam",
    authorCredentials: "BDS, MDS — Chief Dental Surgeon",
    tags: ["baby teeth cavities", "early childhood caries", "kids dentist Dhaka"],
    serviceRefs: ["pediatric-dentistry", "laser-assisted-fillings"],
    image: "/images/service-pediatric.png",
    imageAlt:
      "Happy child at a pediatric dental visit receiving gentle preventive care",
    quickAnswer:
      "Yes — baby tooth cavities matter. They hurt, disrupt sleep and eating, and infections there can affect the developing adult tooth above. Baby teeth also hold precise space and guide the adult smile: early loss to decay means crowding and orthodontics later. Treatment today is simple, and with laser dentistry often needs no needle at all.",
    quickAnswerBn:
      "হ্যাঁ — দুধদাঁতের পোকা গুরুত্বপূর্ণ। এটি ব্যথা দেয়, ঘুম-খাওয়া নষ্ট করে, আর ওখানকার সংক্রমণ ওপরে গড়ন্ত বড় দাঁতেও ছোঁ দিতে পারে। দুধদাঁত নির্ভুল জায়গাও ধরে রাখে আর বড়দের হাসির পথ দেখায়: পোকায় আগে পড়লে মানে পরে জোড়া দাঁত আর অর্থোডন্টিক্স। আজকের চিকিৎসা সহজ, আর লেজার ডেন্টিস্ট্রিতে অনেক সময় সুই-ই লাগে না।",
    sections: [
      {
        heading: "What Baby Teeth Actually Do",
        body: [
          "Twenty primary teeth arrive before age three and serve until 6–12, and their job description is bigger than chewing. They hold the exact space each adult tooth will inherit; they guide the eruption path of permanent teeth; they shape jaw development through years of chewing forces; and they build the speech patterns a child keeps for life. A back baby molar may hold its post for a full decade.",
          "Losing one early to decay is like removing a brick from the middle of a wall under construction — the structure above and beside shifts to fill the gap, and the incoming adult tooth inherits the confusion.",
        ],
      },
      {
        heading: "How a Baby-Tooth Cavity Becomes an Adult Problem",
        body: [
          "Decay in primary teeth runs faster than in adult teeth — the enamel is thinner and the nerve is closer. A dark spot ignored in a two-year-old can become an abscess in months. Deep infection does not politely stop at the baby tooth: it can disturb the mineralizing adult tooth directly beneath, leaving permanent marks or defects.",
          "Then comes the space story: a molar lost at five surrenders its space to neighbouring drift, so the adult tooth arrives to find the parking spot taken — arriving rotated, crowded, or blocked entirely. Much of the braces demand we see in teenagers traces back to baby molars lost years earlier.",
        ],
      },
      {
        heading: "Treatment Is Kinder Than Parents Fear",
        body: [
          "Modern pediatric dentistry has changed shape. Small cavities are restored with tooth-coloured fillings in a single short visit; deeper ones are saved with baby crowns that sit like caps over the tooth; and nerves threatened by deep decay are treated with quick, gentle pulp therapies that keep the tooth alive and in place. At our clinic, laser-assisted caries removal means many small fillings happen with no injection at all — the sound of the drill, the fear of the needle, both gone.",
          "The golden rule is early: a cavity spotted at a routine visit is a fifteen-minute fix; the same cavity discovered at 2 a.m. through pain is an emergency with a frightened child.",
        ],
      },
      {
        heading: "Prevention Beats Everything",
        body: [
          "The home routine that protects baby teeth is short and strict:",
        ],
        list: [
          "No bottle of sweetened milk or juice in bed — night-time sugar bathing is the engine of early childhood caries.",
          "Brush twice daily from the first tooth, with a rice-grain smear of fluoride toothpaste under three, a pea-size amount after.",
          "Lift the lip monthly and look: white lines or brown spots near the gums are early decay — book a visit then.",
          "First dental visit by the first birthday, then every six months.",
          "Ask about fluoride varnish and sealants — minutes of protection against years of cavities.",
        ],
      },
    ],
    sectionsBn: [
      {
        heading: "দুধদাঁত আসলে কী করে",
        body: [
          "বিশটি প্রাইমারি দাঁত তিন বছরের আগেই আসে আর ৬–১২ বছর পর্যন্ত দায়িত্ব পালন করে — আর তার কাজের বর্ণনা চিবানোর চেয়ে বড়। তারা প্রতিটি বড় দাঁতের উত্তরাধিকারের নির্ভুল জায়গা ধরে রাখে; স্থায়ী দাঁতের ওঠার পথ দেখায়; বছরের পর বছর চিবানোর চাপে চোয়ালের বিকাশ গড়ে; আর শিশুর সারাজীবনের উচ্চারণ-রীতি তৈরি করে। একটি পেছনের দুধমোলার পুরো এক দশক পোস্ট পাহারা দিতে পারে।",
          "পোকায় তার আগে হারানো মানে নির্মাণাধীন দেয়ালের মাঝ থেকে ইট তোলা — ওপরে-পাশের গঠন ফাঁক ভরতে সরে, আর নতুন বড় দাঁত বিভ্রান্তির উত্তরাধিকার পায়।",
        ],
      },
      {
        heading: "দুধদাঁতের পোকা বড় সমস্যা হয় যেভাবে",
        body: [
          "প্রাইমারি দাঁতে পোকা দ্রুত চলে — এনামেল পাতলা, স্নায়ু কাছে। দুই বছরের শিশুর উপেক্ষিত কালো দাগ কয়েক মাসে ফোঁড়া হতে পারে। গভীর সংক্রমণ দুধদাঁতে ভদ্র হয়ে থামে না: ঠিক নিচে খনিজ-হচ্ছে বড় দাঁতকেও বিঘ্নিত করে, স্থায়ী দাগ বা ত্রুটি রেখে যেতে পারে।",
          "তারপর জায়গার গল্প: পাঁচ বছরে হারানো মোলার তার জায়গা পাশের দাঁতের সরে যাওয়ার হাতে ছেড়ে দেয়, ফলে বড় দাঁত এসে দেখে পার্কিং নেওয়া — ঘুরে, জোড়া হয়ে, বা একেবারে আটকে। কিশোরদের ব্রেসেসের চাহিদার অনেকটাই ফিরে যায় বছর আগের হারানো দুধমোলারে।",
        ],
      },
      {
        heading: "চিকিৎসা বাবা-মায়ের ভয়ের চেয়ে কোমল",
        body: [
          "আধুনিক শিশু ডেন্টিস্ট্রির চেহারা বদলেছে। ছোট পোকা এক ছোট ভিজিটে দাঁতের রঙের ফিলিংয়ে ভরাট হয়; গভীরগুলো বাঁচে শিশু-ক্রাউনে, যা টুপির মতো দাঁতে বসে; আর গভীর পোকায় হুমকির স্নায়ু বাঁচে দ্রুত, কোমল পাল্প চিকিৎসায় — দাঁত বাঁচিয়ে, জায়গায় রেখে। আমাদের ক্লিনিকে লেজার-সহায়ক পোকা-অপসারণ মানে অনেক ছোট ফিলিংয়ে ইনজেকশনই লাগে না — ড্রিলের শব্দ, সুইয়ের ভয়, দুটোই শেষ।",
          "সোনার নিয়ম আগে ধরা: রুটিন ভিজিটে ধরা পোকা পনেরো মিনিটের কাজ; রাত দুটোয় ব্যথা হয়ে ধরা পোকা এক আতঙ্কিত শিশু-সহ ইমার্জেন্সি।",
        ],
      },
      {
        heading: "প্রতিরোধই সবকিছুর ওপরে",
        body: [
          "দুধদাঁত রক্ষার ঘরোয়া রুটিন ছোট কিন্তু কঠোর:",
        ],
        list: [
          "bed-এ মিষ্টি দুধ বা জুসের বোতল নয় — রাতের চিনি-স্নানই আদ্যশৈশব ক্যারিজের ইঞ্জিন।",
          "প্রথম দাঁত থেকেই দিনে দুবার ব্রাশ — তিন বছরের নিচে চাল-দানা পরিমাণ ফ্লোরাইড পেস্ট, পরে ছোলার দানা পরিমাণ।",
          "মাসে একবার ঠোঁট তুলে দেখুন: মাড়ির কাছে সাদা দাগ বা বাদামি দাগ আদি পোকা — তখনই ভিজিট বুক করুন।",
          "প্রথম জন্মদিনের মধ্যে প্রথম ডেন্টাল ভিজিট, তারপর প্রতি ছয় মাসে।",
          "ফ্লোরাইড ভার্নিশ আর সিল্যান্ট নিয়ে জিজ্ঞেস করুন — মিনিটের সুরক্ষা, বছরের পোকা-রোধ।",
        ],
      },
    ],
  },
];
