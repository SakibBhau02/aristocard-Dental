import type { Service } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Aristocrat Dental Care — Complete Service Catalogue (11 services)  */
/* ------------------------------------------------------------------ */

export const services: Service[] = [
  {
    slug: "crowns-bridges",
    nameBn: "ক্রাউন ও ব্রিজ",
    shortNameBn: "ক্রাউন ও ব্রিজ",
    image: "/images/service-crowns.png",
    taglineBn: "শক্তি ফিরিয়ে আনুন। ফাঁক পূরণ করুন।",
    excerptBn: "দাঁত ভেঙে গেছে, ক্ষয় হয়ে গেছে বা বড় ফিলিং দুর্বল হয়ে পড়েছে? কাস্টম-ক্রাফটেড পোর্সেলেন ক্রাউন ও ব্রিজ আপনার দাঁতের স্বাভাবিক শক্তি, আকৃতি ও সৌন্দর্য ফিরিয়ে দেয় — যেন নিজের দাঁতই ছিল।",
    name: "Crowns & Bridges",
    shortName: "Crowns & Bridges",
    category: "Restorative",
    icon: "Crown",
    tagline: "Restore strength. Bridge the gaps.",
    excerpt:
      "High-quality crowns protect and strengthen damaged teeth, while custom bridges replace missing teeth — restoring function, bite alignment and your natural facial contours.",
    overview: [
      "Crowns & Bridges offer a reliable, long-lasting solution for restoring damaged teeth and replacing missing ones, combining strength, function, and natural aesthetics in one treatment. A dental crown, often called a \u201Ccap\u201D, is a custom-made restoration that fits securely over a weakened, cracked, or heavily decayed tooth, protecting it from further damage while restoring its original size, shape, and strength.",
      "Crafted from high-quality, tooth-colored materials, our crowns blend seamlessly with your natural smile while providing the durability needed for everyday biting and chewing. For patients missing one or more teeth, dental bridges provide an effective, fixed alternative to close the gap without the need for surgery. A bridge consists of a custom-made replacement tooth (or teeth) anchored securely by crowns on either side of the gap.",
      "Beyond simply filling a space, bridges play an important structural role — preventing surrounding teeth from shifting out of position, maintaining proper bite alignment, and preserving the natural contours of your face. Whether you need a single crown to save a vulnerable tooth or a bridge to restore a complete, confident smile, these restorations are built to last for many years with proper care.",
    ],
    benefits: [
      {
        title: "Protection & Strength",
        description:
          "A crown shields a weakened or cracked tooth from fracture, letting you bite and chew with full confidence again.",
      },
      {
        title: "Natural Aesthetics",
        description:
          "Tooth-colored porcelain and zirconia matched to your exact shade — restorations that are virtually indistinguishable.",
      },
      {
        title: "Preserves Alignment",
        description:
          "Bridges stop neighboring teeth from drifting into the gap, protecting your bite and facial structure.",
      },
      {
        title: "Fixed & Permanent",
        description:
          "Unlike removable dentures, bridges stay firmly in place — no slipping, no nightly removal.",
      },
      {
        title: "Fast Results",
        description:
          "Most crowns and bridges are completed in just two comfortable visits.",
      },
      {
        title: "Long-Term Value",
        description:
          "With good oral hygiene, quality restorations serve you for 10–15 years or more.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Consultation & Digital Scan",
        description:
          "We examine your tooth, take digital X-rays and scan the area to design your restoration.",
      },
      {
        step: "02",
        title: "Tooth Preparation",
        description:
          "The tooth is gently reshaped under local anesthesia and a temporary crown protects it.",
      },
      {
        step: "03",
        title: "Custom Fabrication",
        description:
          "Our dental lab crafts your crown or bridge from premium porcelain or zirconia, shade-matched to your smile.",
      },
      {
        step: "04",
        title: "Fitting & Bonding",
        description:
          "We check fit, bite and aesthetics, then permanently cement the restoration in place.",
      },
    ],
    ideal: [
      "A cracked, chipped or severely decayed tooth",
      "A tooth that has undergone root canal treatment",
      "One or more missing teeth with healthy adjacent teeth",
      "Worn-down or misshapen teeth needing full coverage",
    ],
    duration: "2 visits • ~60 min each",
    longevity: "10–15+ years with good care",
    anesthesia: "Local anesthesia, painless procedure",
    faqs: [
      {
        question: "Does getting a crown hurt?",
        answer:
          "No. The procedure is performed under effective local anesthesia, so you feel no pain during treatment. Mild sensitivity for a few days afterward is normal and settles quickly.",
      },
      {
        question: "How do I care for my crown or bridge?",
        answer:
          "Brush twice daily, floss (including under the bridge with a floss threader), and visit us every six months. Avoid chewing very hard objects like ice to extend its life.",
      },
      {
        question: "Will my crown look natural?",
        answer:
          "Yes. We match the porcelain shade, translucency and shape to your surrounding teeth so precisely that most people cannot tell which tooth is restored.",
      },
    ],
    related: ["dental-implants", "root-canal-treatment", "porcelain-veneers"],
    featured: true,
  },
  {
    slug: "dental-implants",
    nameBn: "ডেন্টাল ইমপ্ল্যান্ট",
    shortNameBn: "ইমপ্ল্যান্ট",
    image: "/images/service-implants.png",
    taglineBn: "দাঁত পুনরুদ্ধারের সবচেয়ে নির্ভরযোগ্য পদ্ধতি।",
    excerptBn: "হারানো দাঁতের স্থায়ী সমাধান — টাইটানিয়াম ইমপ্ল্যান্ট যা আপনার চোয়ালের হাড়ের সাথে মিশে যায় এবং দেখতে-অনুভবে স্বাভাবিক দাঁতের মতোই কাজ করে। কথা বলুন, হাসুন আর খান — কোনো দ্বিধা ছাড়াই।",
    name: "Dental Implants",
    shortName: "Implants",
    category: "Surgical",
    icon: "Anchor",
    tagline: "The gold standard in tooth replacement.",
    excerpt:
      "Permanent, stable titanium implants that look, feel and function like natural teeth — preventing bone loss and restoring your freedom to eat, speak and smile.",
    overview: [
      "Dental Implants are widely regarded as the gold standard for tooth replacement, offering a permanent, stable, and remarkably natural-looking solution for missing teeth. Each implant consists of a biocompatible titanium post that is surgically placed into the jawbone, acting as an artificial tooth root that fuses with the bone over time to create a strong, durable foundation.",
      "A custom-crafted crown is then attached, designed to match the shape, size, and shade of your natural teeth for a seamless, lifelike result. Unlike bridges or dentures, dental implants stand on their own without relying on adjacent teeth for support, preserving the health and structure of your surrounding natural teeth.",
      "Because the implant integrates directly with the jawbone, it also stimulates and preserves bone density, preventing the bone loss and facial changes that commonly occur after tooth loss — a benefit no other replacement option can fully provide. With proper care, dental implants can last a lifetime, giving you the freedom to eat, speak, and smile with total confidence.",
    ],
    benefits: [
      {
        title: "Lifetime Solution",
        description:
          "With good hygiene, the titanium post can last a lifetime — only the crown may need replacement after 10–15 years.",
      },
      {
        title: "Preserves Jawbone",
        description:
          "Implants stimulate bone like natural roots, preventing the bone loss that causes facial sagging after tooth loss.",
      },
      {
        title: "Fully Independent",
        description:
          "No grinding down of healthy neighboring teeth, unlike traditional bridges.",
      },
      {
        title: "Natural Function",
        description:
          "Eat, speak and laugh with complete stability — no slipping like removable dentures.",
      },
      {
        title: "Natural Appearance",
        description:
          "Custom crowns matched to your natural shade and shape blend invisibly into your smile.",
      },
      {
        title: "Improves Quality of Life",
        description:
          "Patients report renewed confidence in social and professional settings.",
      },
    ],
    process: [
      {
        step: "01",
        title: "3D Assessment & Planning",
        description:
          "Digital X-rays and a cone-beam CT scan let us evaluate bone density and plan precise placement.",
      },
      {
        step: "02",
        title: "Implant Placement",
        description:
          "Under sterile conditions and comfortable anesthesia, the titanium post is placed in the jawbone.",
      },
      {
        step: "03",
        title: "Healing & Integration",
        description:
          "Over 3–6 months the implant fuses with your bone (osseointegration). A temporary tooth keeps your smile intact.",
      },
      {
        step: "04",
        title: "Crown Attachment",
        description:
          "A custom porcelain crown is fixed onto the implant — your new tooth is complete.",
      },
    ],
    ideal: [
      "One or more missing teeth with adequate jawbone",
      "Patients who want a fixed alternative to dentures",
      "Those unwilling to alter healthy adjacent teeth for a bridge",
      "Anyone seeking the most natural, long-lasting replacement",
    ],
    duration: "3–6 months total (implant + healing + crown)",
    longevity: "Post: lifetime • Crown: 10–15 years",
    anesthesia: "Local anesthesia; sedation available",
    faqs: [
      {
        question: "Are dental implants painful?",
        answer:
          "Most patients report the procedure is more comfortable than a tooth extraction. With local anesthesia you feel nothing during surgery, and mild soreness for a few days is managed with standard painkillers.",
      },
      {
        question: "Am I a candidate for implants?",
        answer:
          "Most healthy adults with missing teeth qualify. We assess bone density, gum health and medical history at your consultation. Even patients with low bone volume often qualify with grafting.",
      },
      {
        question: "How long do dental implants last?",
        answer:
          "With good oral hygiene and regular checkups, the titanium implant itself often lasts a lifetime, while the crown on top typically serves 10–15 years before a simple replacement. Longevity depends largely on gum health and maintenance.",
      },
    ],
    related: ["crowns-bridges", "oral-maxillofacial-surgery", "porcelain-veneers"],
    featured: true,
  },
  {
    slug: "digital-smile-design",
    nameBn: "ডিজিটাল স্মাইল ডিজাইন (DSD)",
    shortNameBn: "স্মাইল ডিজাইন",
    image: "/images/service-smile-design.png",
    taglineBn: "চিকিৎসা শুরুর আগেই দেখে নিন নতুন হাসি।",
    excerptBn: "আপনার মুখের ছবি ও ভিডিও বিশ্লেষণ করে আমরা ডিজিটালি ডিজাইন করি নিখুঁত হাসি — চিকিৎসা শুরুর আগেই আপনি দেখে নিতে পারবেন ফলাফল কেমন হবে।",
    name: "Digital Smile Design (DSD)",
    shortName: "Smile Design",
    category: "Cosmetic",
    icon: "Sparkles",
    tagline: "See your new smile before treatment begins.",
    excerpt:
      "Advanced imaging software analyzes your facial structure and creates a digital simulation of your new smile — visualize and approve your transformation before any treatment starts.",
    overview: [
      "Digital Smile Design (DSD) is an advanced, technology-driven approach to smile transformation that lets you see and approve your new smile before any treatment ever begins. Using state-of-the-art facial and dental imaging software, our team carefully analyzes your unique facial structure, lip line, tooth proportions, and smile symmetry to build a personalized digital simulation of your ideal smile.",
      "Instead of relying on guesswork or verbal descriptions, DSD combines high-resolution photographs and video with precision design software to map exactly how your teeth, gums, lips, and facial features work together in harmony. This gives you a realistic, accurate preview of your transformation — customized entirely around your own face, not a generic template.",
      "During your DSD consultation, you review this digital simulation side-by-side with your current smile, with the freedom to request adjustments to tooth shape, size, color, or alignment, and fully understand your treatment plan before committing to any procedure. Once you approve the design, it becomes the exact blueprint your dentist follows — whether your treatment involves veneers, crowns, whitening, orthodontics, or a complete smile makeover — ensuring your final results closely match what you envisioned from the start.",
    ],
    benefits: [
      {
        title: "Preview Your Result",
        description:
          "See a photo-accurate simulation of your new smile before any work is done — no surprises.",
      },
      {
        title: "Truly Personalized",
        description:
          "Design is mapped to YOUR face, lip line and personality — never a one-size-fits-all template.",
      },
      {
        title: "Co-Design With Your Dentist",
        description:
          "Adjust tooth shape, shade and proportion until the smile feels unmistakably you.",
      },
      {
        title: "Predictable Outcomes",
        description:
          "Your approved design becomes the clinical blueprint, aligning every treatment step.",
      },
      {
        title: "Confidence in Decisions",
        description:
          "Understand exactly what treatment you are committing to — time, steps and result.",
      },
      {
        title: "Combines Any Treatments",
        description:
          "DSD plans veneers, whitening, orthodontics and implants together in one blueprint.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Facial & Dental Photography",
        description:
          "High-resolution photos and video capture your smile dynamics from every angle.",
      },
      {
        step: "02",
        title: "Digital Analysis",
        description:
          "We analyze facial proportion, lip line, gum display and tooth symmetry in the DSD software.",
      },
      {
        step: "03",
        title: "Your Smile Simulation",
        description:
          "A personalized simulation of your new smile is prepared for your review — side-by-side with your current smile.",
      },
      {
        step: "04",
        title: "Approval & Treatment",
        description:
          "You fine-tune and approve the design; it becomes the precise blueprint for your smile makeover.",
      },
    ],
    ideal: [
      "Anyone considering veneers, crowns or a complete smile makeover",
      "Patients wanting to preview results before committing",
      "Those unhappy with tooth shape, size or shade",
      "Wedding, graduation or professional smile makeovers",
    ],
    duration: "Consultation: 60–90 min",
    longevity: "Design blueprint guides all treatment",
    anesthesia: "Non-invasive — photography & software only",
    faqs: [
      {
        question: "Is Digital Smile Design painful?",
        answer:
          "Not at all. DSD itself is completely non-invasive — it uses photography, video and software. Any discomfort would only come from the treatments you later choose.",
      },
      {
        question: "How accurate is the simulation?",
        answer:
          "Very accurate. The final result closely matches the approved simulation because it serves as the exact blueprint for your veneers, crowns or other restorations.",
      },
      {
        question: "Can I change the design after seeing it?",
        answer:
          "Absolutely — that is the whole point of DSD. You can request changes to shape, shade and proportion until you are completely happy before treatment begins.",
      },
    ],
    related: ["porcelain-veneers", "teeth-whitening", "invisalign-clear-aligners"],
    featured: true,
  },
  {
    slug: "invisalign-clear-aligners",
    nameBn: "ইনভিজিলাইন® (ক্লিয়ার অ্যালাইনার)",
    shortNameBn: "ইনভিজিলাইন®",
    image: "/images/service-aligners.png",
    taglineBn: "হাসি সোজা করুন — প্রায় অদৃশ্যভাবে।",
    excerptBn: "কার্যত অদৃশ্য, খোলা-যাওয়া সুবিধাযুক্ত স্বচ্ছ অ্যালাইনারে দাঁত সোজা করুন। কেউ বুঝতেই পারবে না আপনি অর্থোডন্টিক চিকিৎসা নিচ্ছেন — আর খাওয়া-দাঁত ব্রাশ সব স্বাভাবিক থাকবে।",
    name: "Invisalign® (Clear Aligners)",
    shortName: "Invisalign®",
    category: "Orthodontics",
    icon: "Smile",
    tagline: "Straighten your smile. Almost invisibly.",
    excerpt:
      "Custom-made, virtually invisible clear aligners that gradually straighten your teeth — removable for eating and brushing, with no wires or metal braces.",
    overview: [
      "Invisalign® offers a modern, discreet alternative to traditional metal braces, using a series of custom-made, clear aligners to gradually and comfortably straighten your teeth. Each set of aligners is precisely designed using 3D digital imaging to shift your teeth into their ideal position step by step, giving you a straighter, healthier smile without the wires, brackets, or metal typically associated with orthodontic treatment.",
      "Because Invisalign® aligners are virtually invisible, most people won't even notice you're wearing them, making it an ideal choice for adults and teens who want to straighten their teeth discreetly — whether at work, school, or in social settings. The aligners are also fully removable, giving you the freedom to eat all your favorite foods without restriction and to brush and floss normally, supporting better oral hygiene throughout your treatment compared to fixed braces.",
      "Every Invisalign® treatment plan is fully customized to your unique smile goals, and many patients begin to see visible results within just a few months. From minor spacing issues to more complex alignment concerns, Invisalign® combines comfort, convenience, and near-invisible design to help you achieve a confidently straight smile — without disrupting your everyday life.",
    ],
    benefits: [
      {
        title: "Virtually Invisible",
        description:
          "Crystal-clear aligners are barely noticeable — straighten teeth without anyone knowing.",
      },
      {
        title: "Fully Removable",
        description:
          "Eat whatever you love and brush normally — simply take aligners out when needed.",
      },
      {
        title: "Superior Comfort",
        description:
          "Smooth medical-grade plastic with no poking wires or bracket irritation.",
      },
      {
        title: "Predictable Digital Planning",
        description:
          "3D software shows your tooth movement timeline and final result before you start.",
      },
      {
        title: "Fewer Clinic Visits",
        description:
          "Aligner sets are changed at home every 1–2 weeks with periodic check-ups only.",
      },
      {
        title: "Visible Results in Months",
        description:
          "Many patients notice meaningful improvement within the first few months.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Smile Scan & Simulation",
        description:
          "A 3D digital scan (no messy impressions) maps your teeth and simulates your final result.",
      },
      {
        step: "02",
        title: "Custom Aligner Fabrication",
        description:
          "Your full series of aligners is precision-manufactured for your treatment plan.",
      },
      {
        step: "03",
        title: "Wear & Progress",
        description:
          "Wear each aligner 20–22 hours daily, switching to the next set every 1–2 weeks.",
      },
      {
        step: "04",
        title: "Retention",
        description:
          "After treatment, retainers lock in your beautiful new smile long-term.",
      },
    ],
    ideal: [
      "Adults and teens wanting discreet orthodontics",
      "Crowded, spaced or mildly misaligned teeth",
      "Relapse after previous braces treatment",
      "Professionals who can't wear visible braces at work",
    ],
    duration: "6–18 months (case-dependent)",
    longevity: "Permanent with proper retainer wear",
    anesthesia: "None — non-invasive",
    faqs: [
      {
        question: "How long does Invisalign treatment take?",
        answer:
          "Most cases complete in 6–18 months depending on complexity. Minor spacing can finish in as little as 6 months; your simulation shows the exact projected timeline.",
      },
      {
        question: "Can I eat with Invisalign aligners on?",
        answer:
          "Remove them for all food and drinks (except plain water). This freedom to eat anything is one of Invisalign's biggest advantages over fixed braces.",
      },
      {
        question: "Does Invisalign hurt?",
        answer:
          "You may feel gentle pressure for a day or two after switching to a new aligner set — a sign teeth are moving. Most patients find it far more comfortable than metal braces.",
      },
    ],
    related: ["traditional-braces-orthodontics", "digital-smile-design", "teeth-whitening"],
    featured: true,
  },
  {
    slug: "laser-assisted-fillings",
    nameBn: "লেজার-সহায়ক ফিলিং",
    shortNameBn: "লেজার ফিলিং",
    image: "/images/service-laser.png",
    taglineBn: "আধুনিক নির্ভুলতায় রেস্টোরেটিভ চিকিৎসা।",
    excerptBn: "ডেন্টাল লেজারে ক্যাভিটি পরিষ্কার করা হয় নির্ভুলভাবে — প্রায়ই ড্রিল বা ইনজেকশন ছাড়াই। শব্দ কম, ভাইব্রেশন নেই, অস্বস্তি অনেক কম।",
    name: "Laser-Assisted Fillings",
    shortName: "Laser Fillings",
    category: "Restorative",
    icon: "Zap",
    tagline: "Restorative care meets modern precision.",
    excerpt:
      "Advanced laser technology removes decay with exceptional precision — often without anesthesia or the drill — restored with durable, tooth-colored composite materials.",
    overview: [
      "Laser-Assisted Fillings bring together restorative care and modern aesthetics for a comfortable, precise, and virtually seamless way to treat tooth decay. Using advanced laser technology, our dental team removes decayed tooth structure with exceptional precision, targeting only the affected area while preserving as much healthy enamel as possible.",
      "This gentle approach often eliminates the need for anesthesia, needles, or the drill, making the entire experience faster and far more comfortable — especially for patients who feel anxious about traditional dental treatment. Once the decay is removed, the tooth is restored using durable, tooth-colored composite materials that are carefully matched to the shade and texture of your natural enamel.",
      "The result is a filling that not only restores the strength and function of your tooth but also blends in so naturally that it's virtually invisible. Laser-assisted treatment also reduces bleeding, swelling, and post-treatment sensitivity compared to conventional methods, allowing for quicker healing and a smoother recovery — a precise, minimally invasive, aesthetically flawless solution.",
    ],
    benefits: [
      {
        title: "Often No Anesthesia",
        description:
          "Laser energy often eliminates the need for injections — ideal for needle-anxious patients.",
      },
      {
        title: "No Drill Noise",
        description:
          "The high-pitched drill sound that triggers anxiety is replaced by a quiet, gentle process.",
      },
      {
        title: "Maximum Tooth Preservation",
        description:
          "Laser removes only diseased tissue, keeping more healthy enamel intact than drilling.",
      },
      {
        title: "Invisible Restoration",
        description:
          "Tooth-colored composite matched to your enamel — fillings you can't see.",
      },
      {
        title: "Faster Healing",
        description:
          "Reduced bleeding, swelling and sensitivity means smoother recovery.",
      },
      {
        title: "Kid-Friendly",
        description:
          "The gentle experience makes laser fillings excellent for anxious children.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Diagnosis",
        description:
          "Digital X-rays and intraoral camera imaging locate decay with precision.",
      },
      {
        step: "02",
        title: "Laser Decay Removal",
        description:
          "The dental laser gently vaporizes only the decayed portion of the tooth.",
      },
      {
        step: "03",
        title: "Composite Restoration",
        description:
          "Shade-matched composite resin is layered, sculpted and cured for an invisible fill.",
      },
      {
        step: "04",
        title: "Polish & Check",
        description:
          "We refine your bite and polish the surface — done in a single comfortable visit.",
      },
    ],
    ideal: [
      "Patients with dental anxiety or needle phobia",
      "Early-to-moderate cavities",
      "Children who fear the drill",
      "Anyone wanting metal-free, invisible fillings",
    ],
    duration: "Single visit • 30–60 min",
    longevity: "7–10+ years",
    anesthesia: "Often none needed; available if preferred",
    faqs: [
      {
        question: "Are laser fillings safe?",
        answer:
          "Yes. Dental lasers are FDA-cleared and have been used for decades. They are precise, sterile and gentle on surrounding tissues.",
      },
      {
        question: "Will I really not need an injection?",
        answer:
          "In most small-to-moderate cavities, yes — the laser is comfortable enough without anesthesia. For deeper decay we still offer gentle numbing.",
      },
      {
        question: "How long do laser fillings last?",
        answer:
          "With good brushing, flossing and six-month check-ups, tooth-colored composite fillings typically last 7–10 years or longer.",
      },
    ],
    related: ["root-canal-treatment", "pediatric-dentistry", "periodontal-gum-treatment"],
  },
  {
    slug: "oral-maxillofacial-surgery",
    nameBn: "ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জারি",
    shortNameBn: "ওরাল সার্জারি",
    image: "/images/service-surgery.png",
    taglineBn: "দক্ষ সার্জিক্যাল চিকিৎসা, কোমল পুনরুদ্ধার।",
    excerptBn: "জটিল দাঁত তোলা, জ্ঞানদন্ত সার্জারি থেকে শুরু করে মুখ-চোয়ালের অস্বাভাবিকতা — অভিজ্ঞ সার্জনের হাতে নিরাপদ, পরিকল্পিত ও যত্নশীল অস্ত্রোপচার।",
    name: "Oral & Maxillofacial Surgery",
    shortName: "Oral Surgery",
    category: "Surgical",
    icon: "Scissors",
    tagline: "Expert surgical care, gentle recovery.",
    excerpt:
      "From wisdom tooth extractions to corrective jaw surgery — specialists handle complex dental, facial and jaw conditions with focus on safety and rapid recovery.",
    overview: [
      "Oral & Maxillofacial Surgery covers a broad range of advanced surgical procedures for treating complex dental, facial, and jaw-related conditions, performed by specialists trained specifically in this demanding area of care. From routine wisdom tooth extractions to more involved procedures like corrective jaw surgery, our surgical team is equipped to handle a wide spectrum of cases with precision, expertise, and a strong focus on patient comfort.",
      "Wisdom tooth extractions are among the most common procedures we perform, addressing impacted, misaligned, or problematic third molars before they cause pain, infection, or crowding of the surrounding teeth. For more complex cases, our specialists also manage corrective jaw surgery to address bite misalignment, jaw asymmetry, or structural issues that affect both function and facial appearance.",
      "At every step, patient safety and comfort remain our top priorities. Our team uses modern anesthesia and sedation options tailored to each procedure and patient, along with careful surgical techniques designed to minimize trauma and support faster healing. With a strong emphasis on effective pain management and post-operative care, we help ensure a smoother, more comfortable recovery.",
    ],
    benefits: [
      {
        title: "Specialist Expertise",
        description:
          "Surgeons with hospital-grade training in oral & maxillofacial procedures.",
      },
      {
        title: "Modern Sedation Options",
        description:
          "From local anesthesia to conscious sedation — matched to your procedure and comfort level.",
      },
      {
        title: "Minimally Invasive Techniques",
        description:
          "Smaller incisions, less trauma and visibly faster healing.",
      },
      {
        title: "Complete Pain Management",
        description:
          "A structured before-and-after pain control plan keeps recovery comfortable.",
      },
      {
        title: "Impacted Wisdom Teeth",
        description:
          "Safe removal of deeply impacted or sideways-growing third molars.",
      },
      {
        title: "Full Aftercare Support",
        description:
          "Detailed recovery guidance and follow-ups until you are fully healed.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Surgical Consultation",
        description:
          "3D imaging and examination determine the safest surgical approach for your case.",
      },
      {
        step: "02",
        title: "Pre-Surgical Planning",
        description:
          "We plan anesthesia, schedule and prepare your personalized aftercare kit.",
      },
      {
        step: "03",
        title: "The Procedure",
        description:
          "Performed in our sterile surgical suite with the sedation level chosen for you.",
      },
      {
        step: "04",
        title: "Recovery & Follow-Up",
        description:
          "Guided healing with scheduled reviews, pain management and dietary instructions.",
      },
    ],
    ideal: [
      "Painful or impacted wisdom teeth",
      "Severe dental infection or abscess",
      "Jaw pain, asymmetry or bite dysfunction",
      "Teeth requiring surgical extraction",
    ],
    duration: "45–120 min depending on procedure",
    longevity: "Permanent solution",
    anesthesia: "Local / IV sedation options",
    faqs: [
      {
        question: "Is wisdom tooth removal painful?",
        answer:
          "The surgery itself is painless under anesthesia. Mild swelling and soreness for 2–4 days afterwards is normal and well-managed with prescribed medication.",
      },
      {
        question: "When can I return to work after surgery?",
        answer:
          "Most patients resume normal activities within 2–3 days. Complex cases may need up to a week — we give you a precise timeline for your specific procedure.",
      },
      {
        question: "Do all wisdom teeth need removal?",
        answer:
          "No. Healthy, fully erupted, cleansable wisdom teeth can stay. We only recommend removal when teeth are impacted, decayed, or damaging neighbors.",
      },
    ],
    related: ["dental-implants", "root-canal-treatment", "crowns-bridges"],
    featured: true,
  },
  {
    slug: "pediatric-dentistry",
    nameBn: "পেডিয়াট্রিক ডেন্টিস্ট্রি",
    shortNameBn: "শিশু ডেন্টিস্ট্রি",
    image: "/images/service-pediatric.png",
    taglineBn: "ছোট্ট হাসির জন্য কোমল যত্ন।",
    excerptBn: "শিশুদের জন্য বিশেষভাবে সাজানো পরিবেশ — ভয় নয়, বন্ধুত্ব তৈরি হয় এখানে। ফ্লুরাইড, সিল্যান্ট ও প্রথম-দাঁতের যত্নে শুরু হোক সুস্থ অভ্যাস।",
    name: "Pediatric Dentistry",
    shortName: "Kids' Dentistry",
    category: "Preventive",
    icon: "Baby",
    tagline: "Gentle care for little smiles.",
    excerpt:
      "A friendly, fear-free environment designed for children — preventative care, habit counseling and development monitoring for a lifetime of healthy smiles.",
    overview: [
      "Gentle care for little smiles. Our pediatric dentistry creates a friendly, fear-free environment for children, focusing on preventative care, habit counseling, and monitoring development to ensure your child grows up with a healthy, happy smile. Our clinic features a specially designed kids' room that helps reduce dental fear gradually with every visit.",
      "Early dental experiences shape lifelong attitudes toward oral health. Our team takes time — never rushing — to introduce children to dental care at their own pace, using tell-show-do techniques that turn unfamiliar instruments into friendly, understandable tools. Positive early visits mean children who happily visit the dentist for life.",
      "We cover the complete spectrum of children's dental needs: fluoride varnish and sealants that protect growing teeth, gentle fillings for baby-tooth cavities, guidance for thumb-sucking and pacifier habits, and orthodontic monitoring as permanent teeth erupt — catching alignment issues at the ideal time for simple correction.",
    ],
    benefits: [
      {
        title: "Fear-Free Environment",
        description:
          "Specially designed kids' room and gradual exposure that turns fear into friendship.",
      },
      {
        title: "Prevention First",
        description:
          "Fluoride varnish and protective sealants stop cavities before they start.",
      },
      {
        title: "Growth Monitoring",
        description:
          "We track jaw development and tooth eruption, catching issues at the ideal treatment time.",
      },
      {
        title: "Habit Counseling",
        description:
          "Expert guidance on thumb-sucking, pacifiers and bottle habits that shape dental development.",
      },
      {
        title: "Gentle Techniques",
        description:
          "Tell-show-do methods and laser options make treatments comfortable for children.",
      },
      {
        title: "Parent Partnership",
        description:
          "You receive clear home-care coaching so healthy habits continue between visits.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Happy First Visit",
        description:
          "A fun, pressure-free introduction — a ride in the chair, counting teeth and lots of praise.",
      },
      {
        step: "02",
        title: "Gentle Examination",
        description:
          "We check teeth, gums and development while your child stays relaxed and engaged.",
      },
      {
        step: "03",
        title: "Preventive Care",
        description:
          "Cleaning, fluoride and sealants protect teeth — quick, easy and totally comfortable.",
      },
      {
        step: "04",
        title: "Ongoing Growth Care",
        description:
          "Six-month visits track development and keep your child's smile on track.",
      },
    ],
    ideal: [
      "Children from their first tooth (age 1) onward",
      "Kids with dental fear or anxiety",
      "Cavity-prone children needing preventive care",
      "Thumb-sucking or pacifier habit support",
    ],
    duration: "30–45 min per visit",
    longevity: "Ongoing care through adolescence",
    anesthesia: "Rarely needed; laser & gentle techniques",
    faqs: [
      {
        question: "When should my child first see a dentist?",
        answer:
          "By their first birthday, or within six months of the first tooth appearing. Early visits are quick, fun and establish a dental home for your child.",
      },
      {
        question: "How can I prepare my anxious child for the visit?",
        answer:
          "Stay positive about the dentist at home, avoid scary words like 'needle', and arrive a little early so your child can relax in our kids' room. Our team handles the rest with gentle pacing.",
      },
      {
        question: "Are baby teeth cavities really important to treat?",
        answer:
          "Yes. Baby teeth guide permanent teeth into place, support speech and nutrition. Untreated cavities cause pain, infection and orthodontic problems later.",
      },
    ],
    related: ["laser-assisted-fillings", "traditional-braces-orthodontics", "periodontal-gum-treatment"],
  },
  {
    slug: "periodontal-gum-treatment",
    nameBn: "পেরিওডন্টাল (মাড়ি) চিকিৎসা",
    shortNameBn: "মাড়ির চিকিৎসা",
    image: "/images/service-gum.png",
    taglineBn: "সুস্থ মাড়ি, সুন্দর হাসি।",
    excerptBn: "মাড়ি থেকে রক্তপাত, ফোলা বা দুর্গন্ধ — উপেক্ষা করবেন না। স্কেলিং, ডিপ ক্লিনিং ও আধুনিক লেজার থেরাপিতে মাড়ির রোগ থামান আজই।",
    name: "Periodontal (Gum) Treatment",
    shortName: "Gum Treatment",
    category: "Preventive",
    icon: "Leaf",
    tagline: "Healthy gums, healthy smile.",
    excerpt:
      "Comprehensive treatment for gum disease (gingivitis & periodontitis) — stop recession, reduce inflammation and protect your teeth from loss.",
    overview: [
      "Healthy gums are the foundation of a healthy smile. We offer comprehensive treatments for gum disease (gingivitis and periodontitis) to stop recession, reduce inflammation, and protect your teeth from loss. Gum disease is painless in its early stages — which is why professional assessment matters so much.",
      "Gingivitis, the earliest stage, shows as redness, swelling or bleeding when brushing. At this stage the damage is completely reversible with professional cleaning and improved home care. Left untreated, it can progress to periodontitis — where the infection destroys the bone and fibers holding your teeth, creating pockets, looseness and eventually tooth loss.",
      "Our periodontal care spans deep cleaning (scaling & root planing), laser-assisted disinfection of periodontal pockets, targeted antimicrobial therapy and, where needed, surgical correction of advanced defects. Every treatment plan includes personalized home-care coaching, because gum health is a partnership between clinic visits and your daily routine.",
    ],
    benefits: [
      {
        title: "Stop Disease Progression",
        description:
          "Early treatment reverses gingivitis completely and halts periodontitis damage.",
      },
      {
        title: "Save Loose Teeth",
        description:
          "Deep therapy and bone-supporting treatment can stabilize teeth you feared losing.",
      },
      {
        title: "Fresh Breath",
        description:
          "Eliminating gum infection resolves persistent bad breath at its source.",
      },
      {
        title: "Laser Precision",
        description:
          "Laser-assisted therapy disinfects pockets with less bleeding and faster healing.",
      },
      {
        title: "Protect Overall Health",
        description:
          "Treating gum disease reduces risks linked to diabetes and heart disease.",
      },
      {
        title: "Custom Maintenance Plan",
        description:
          "A recall schedule that keeps your gums healthy for life.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Periodontal Assessment",
        description:
          "Pocket depth measurements and X-rays map the exact stage of gum disease.",
      },
      {
        step: "02",
        title: "Deep Cleaning Therapy",
        description:
          "Scaling & root planing removes plaque and tartar deep below the gumline.",
      },
      {
        step: "03",
        title: "Laser Disinfection",
        description:
          "Laser therapy eliminates bacteria in pockets and accelerates gum reattachment.",
      },
      {
        step: "04",
        title: "Maintenance & Coaching",
        description:
          "Personalized home-care routine and scheduled recalls keep gums healthy for life.",
      },
    ],
    ideal: [
      "Bleeding or swollen gums",
      "Persistent bad breath",
      "Receding gums or longer-looking teeth",
      "Loose teeth or diagnosed periodontitis",
    ],
    duration: "1–4 visits depending on stage",
    longevity: "Ongoing maintenance keeps gums healthy",
    anesthesia: "Topical gel; local if needed for deep therapy",
    faqs: [
      {
        question: "My gums bleed when brushing — should I be worried?",
        answer:
          "Bleeding is a sign of gingivitis, the earliest and fully reversible stage of gum disease. Book a professional cleaning — treated now, it resolves completely within weeks.",
      },
      {
        question: "Can gum disease be cured?",
        answer:
          "Gingivitis is fully reversible. Advanced periodontitis can't regrow lost bone, but treatment stops progression, eliminates infection and stabilizes teeth long-term.",
      },
      {
        question: "How often should I get my gums checked?",
        answer:
          "Every six months with routine check-ups, or every 3–4 months if you've had periodontal disease, as maintenance matters most after treatment.",
      },
    ],
    related: ["laser-assisted-fillings", "pediatric-dentistry", "root-canal-treatment"],
  },
  {
    slug: "porcelain-veneers",
    nameBn: "পোর্সেলেন ভিনিয়ার",
    shortNameBn: "ভিনিয়ার",
    image: "/images/service-veneers.png",
    taglineBn: "আপনার জন্য তৈরি করা পারফেক্ট হাসি।",
    excerptBn: "হালকা-পাতলা পোর্সেলেন শেল দিয়ে দাঁতের রং, আকৃতি ও সারিবিন্যাস বদলে যায় এক ঝলকে। চিপ, ফাঁক বা দাগ — সব ঢাকা পড়ে প্রাকৃতিক নিখুঁত হাসিতে।",
    name: "Porcelain Veneers",
    shortName: "Veneers",
    category: "Cosmetic",
    icon: "Gem",
    tagline: "The Hollywood smile, crafted for you.",
    excerpt:
      "Ultra-thin porcelain shells bonded to your teeth — instantly correct chips, gaps and discoloration for a flawless, natural-looking smile with minimal invasiveness.",
    overview: [
      "Correct chips, gaps, and discoloration instantly with our custom-crafted porcelain veneers — ultra-thin shells bonded to your teeth for a flawless, natural-looking Hollywood smile with minimal invasiveness. Each veneer is individually designed to complement your facial features and personality.",
      "Porcelain veneers are remarkable in their ability to transform a smile conservatively. Just 0.3–0.5mm thin — about the thickness of a contact lens — they require only minimal enamel preparation while completely reshaping the appearance of your teeth. Modern porcelain mimics natural enamel's light-reflecting properties, giving results that never look artificial.",
      "Whether you're preparing for a milestone event or simply want the smile you've always imagined, veneers deliver dramatic transformation in just two to three visits. Resistant to staining from coffee, tea and tobacco, porcelain veneers keep their brilliance for a decade or more with basic care — a long-term investment in your confidence.",
    ],
    benefits: [
      {
        title: "Instant Transformation",
        description:
          "Chips, gaps, stains and uneven shape corrected in two to three visits.",
      },
      {
        title: "Natural Brilliance",
        description:
          "Porcelain reflects light exactly like natural enamel — never fake-looking.",
      },
      {
        title: "Conservative Preparation",
        description:
          "Only 0.3–0.5mm of enamel adjusted — preserving your tooth structure.",
      },
      {
        title: "Stain Resistant",
        description:
          "Coffee, tea and turmeric won't dull your smile — porcelain holds its brilliance.",
      },
      {
        title: "Custom Crafted",
        description:
          "Every veneer designed for your face, skin tone and personality.",
      },
      {
        title: "Long-Lasting Beauty",
        description:
          "10–15 years of confident smiling with routine care.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Smile Design Consultation",
        description:
          "We discuss your goals, examine your teeth and design your new smile (often with DSD simulation).",
      },
      {
        step: "02",
        title: "Minimal Preparation",
        description:
          "A thin layer of enamel is gently refined and precise impressions taken.",
      },
      {
        step: "03",
        title: "Master Ceramist Crafting",
        description:
          "Your custom veneers are hand-layered and fired to match your shade and character.",
      },
      {
        step: "04",
        title: "Bonding & Reveal",
        description:
          "Veneers are permanently bonded — you walk out with your new smile the same day.",
      },
    ],
    ideal: [
      "Chipped or worn front teeth",
      "Gaps between teeth you'd like closed",
      "Stubborn discoloration unresponsive to whitening",
      "Uneven or undersized teeth seeking harmony",
    ],
    duration: "2–3 visits over 2–3 weeks",
    longevity: "10–15 years",
    anesthesia: "Minimal; often none needed",
    faqs: [
      {
        question: "Do veneers damage your teeth?",
        answer:
          "Modern veneers are highly conservative — removing only 0.3–0.5mm, less than a brace would. Your underlying teeth stay healthy and protected by the veneer.",
      },
      {
        question: "How many veneers do I need?",
        answer:
          "It depends on your goals — some patients need just 1–2 for a chipped tooth; full smile makeovers typically use 6–10 veneers. We advise the minimum that achieves your dream result.",
      },
      {
        question: "Can veneers stain like natural teeth?",
        answer:
          "Porcelain is far more stain-resistant than enamel — coffee and tea won't discolor them. Your natural teeth may shift shade over years, which whitening can rebalance.",
      },
    ],
    related: ["digital-smile-design", "teeth-whitening", "crowns-bridges"],
    featured: true,
  },
  {
    slug: "root-canal-treatment",
    nameBn: "রুট ক্যানেল চিকিৎসা (এন্ডোডন্টিক্স)",
    shortNameBn: "রুট ক্যানেল",
    image: "/images/service-rootcanal.png",
    taglineBn: "আপনার নিজের দাঁতটাই বাঁচান।",
    excerptBn: "সংক্রমিত বা মরে যাওয়া দাঁত তুলে ফেলাই একমাত্র পথ নয়। আধুনিক রুট ক্যানেল চিকিৎসায় ব্যথা প্রায় শূন্যে নেমে আসে আর দাঁত বাঁচে বছরের পর বছর।",
    name: "Root Canal Treatment (Endodontics)",
    shortName: "Root Canal",
    category: "Restorative",
    icon: "Activity",
    tagline: "Save your natural tooth.",
    excerpt:
      "Advanced endodontic therapy removes infection from the tooth's inner pulp and seals it — with modern techniques, often as comfortable as getting a filling.",
    overview: [
      "Save your natural tooth. When the inner pulp of a tooth becomes infected through deep decay, cracks or trauma, our advanced root canal therapy removes the infection and seals the tooth — with modern techniques, often as comfortable as getting a filling. Nothing functions or feels quite like your own natural tooth.",
      "Modern root canal treatment bears little resemblance to its fearsome reputation. Using rotary nickel-titanium instruments, electronic length measurement and magnification, we clean the intricate canal system efficiently in one or two visits. Most patients are surprised at how straightforward the experience actually is.",
      "After disinfection and sealing, the tooth is restored with a protective crown that returns full strength. With success rates above 95%, root canal treatment lets you keep your natural smile intact — far better for your bite and your bone than extraction and replacement.",
    ],
    benefits: [
      {
        title: "Relieve Pain Fast",
        description:
          "The severe pain of pulp infection often fades the same day as treatment.",
      },
      {
        title: "Keep Your Natural Tooth",
        description:
          "Nothing matches the feel, function and longevity of your own tooth.",
      },
      {
        title: "95%+ Success Rate",
        description:
          "Modern endodontics delivers highly predictable, long-lasting outcomes.",
      },
      {
        title: "Comfortable Experience",
        description:
          "Rotary instruments and effective anesthesia make treatment like a long filling.",
      },
      {
        title: "Single-Visit Options",
        description:
          "Many cases complete in one appointment of 60–90 minutes.",
      },
      {
        title: "Better Than Any Replacement",
        description:
          "No artificial replacement matches your own tooth's strength, sensation and fit — root canal treatment keeps it working for you.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Diagnosis & Anesthesia",
        description:
          "Digital X-rays pinpoint the infection; profound anesthesia ensures zero discomfort.",
      },
      {
        step: "02",
        title: "Canal Cleaning",
        description:
          "Rotary instruments gently remove infected pulp and shape the canals.",
      },
      {
        step: "03",
        title: "Disinfection & Sealing",
        description:
          "Antimicrobial irrigation sterilizes the system before biocompatible sealing.",
      },
      {
        step: "04",
        title: "Crown Protection",
        description:
          "A crown restores strength — your saved tooth functions like new.",
      },
    ],
    ideal: [
      "Deep tooth decay reaching the nerve",
      "Severe, lingering toothache or sensitivity",
      "Tooth abscess or infection",
      "Cracked or traumatized tooth",
    ],
    duration: "1–2 visits • 60–90 min",
    longevity: "Lifetime with crown protection",
    anesthesia: "Fully numbed — painless procedure",
    faqs: [
      {
        question: "Is root canal treatment painful?",
        answer:
          "With modern anesthesia, treatment itself is painless — and it relieves the pain of infection, rather than causing it. Most patients compare it to getting a regular filling.",
      },
      {
        question: "How many visits does a root canal take?",
        answer:
          "Many cases finish in a single visit. Teeth with complex anatomy or active infection may need a second short visit — your dentist gives you a precise plan upfront.",
      },
      {
        question: "Can't I just extract the tooth instead?",
        answer:
          "Extraction leads to bone loss, neighboring teeth drifting and a gap that is harder to restore. Saving your natural tooth with root canal preserves function, bone and your bite — almost always the better choice.",
      },
    ],
    related: ["crowns-bridges", "laser-assisted-fillings", "dental-implants"],
  },
  {
    slug: "traditional-braces-orthodontics",
    nameBn: "ট্র্যাডিশনাল ব্রেসেস ও অর্থোডন্টিক্স",
    shortNameBn: "ব্রেসেস",
    image: "/images/service-braces.png",
    taglineBn: "জটিল কেসে যুগ যুগ ধরে প্রমাণিত ফল।",
    excerptBn: "বড় বড় সমস্যার নির্ভরযোগ্য সমাধান — আধুনিক সেলফ-লিগেটিং ব্রেসেস দ্রুত ফল দেয়, ভিজিট কম লাগে আর আরাম বেশি।",
    name: "Traditional Braces & Orthodontics",
    shortName: "Braces",
    category: "Orthodontics",
    icon: "Grid3x3",
    tagline: "Time-tested results for complex cases.",
    excerpt:
      "Modern orthodontic braces — more comfortable and efficient than ever — correcting alignment and bite issues for children, teens and adults with long-term oral health.",
    overview: [
      "Time-tested results for complex cases. Our modern orthodontic braces are designed to be more comfortable and efficient than ever, effectively correcting alignment and bite issues for children, teens, and adults — supporting long-term oral health. For significant crowding, rotations and bite corrections, braces remain the most powerful and predictable tool in orthodontics.",
      "Today's braces are far sleeker than their reputation suggests. Self-ligating brackets reduce friction and appointment frequency, tooth-colored ceramic options blend with your smile, and heat-activated archwires move teeth with gentle continuous force — shorter treatment times and greater comfort throughout.",
      "Properly aligned teeth are about much more than appearance: they're easier to clean, distribute chewing forces evenly, reduce jaw strain and prevent abnormal wear. Our orthodontists design each treatment plan around your facial growth, bite relationship and long-term stability — results that stay beautiful for decades.",
    ],
    benefits: [
      {
        title: "Corrects Complex Cases",
        description:
          "Handles severe crowding, rotations and bite problems aligners can't fix.",
      },
      {
        title: "Modern Comfort",
        description:
          "Self-ligating brackets and gentle wires mean less friction and fewer adjustments.",
      },
      {
        title: "Ceramic Aesthetic Option",
        description:
          "Tooth-colored brackets blend with your smile during treatment.",
      },
      {
        title: "Healthier Teeth For Life",
        description:
          "Aligned teeth are easier to clean and function without destructive wear.",
      },
      {
        title: "Age Is No Barrier",
        description:
          "Effective for children, teens and adults alike.",
      },
      {
        title: "Stable Long-Term Results",
        description:
          "Comprehensive planning means your new smile stays put with retainers.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Orthodontic Assessment",
        description:
          "Photos, X-rays and study models map your bite and alignment precisely.",
      },
      {
        step: "02",
        title: "Treatment Plan & Options",
        description:
          "We present metal or ceramic brace options with timeline and predicted outcome.",
      },
      {
        step: "03",
        title: "Braces Fitted",
        description:
          "Brackets are bonded comfortably in a single appointment — gentle from day one.",
      },
      {
        step: "04",
        title: "Adjustments & Retention",
        description:
          "Quick adjustment visits every 4–6 weeks, then retainers lock in your new smile.",
      },
    ],
    ideal: [
      "Significant crowding or spacing",
      "Bite problems: overbite, underbite, crossbite",
      "Children around age 11–13 (ideal growth window)",
      "Adults preferring predictable, fixed treatment",
    ],
    duration: "12–24 months (case-dependent)",
    longevity: "Permanent with retainer wear",
    anesthesia: "None — painless bonding",
    faqs: [
      {
        question: "What age is best for braces?",
        answer:
          "Around 11–13, when most permanent teeth have erupted and jaw growth can be guided. But braces work at any age — a growing number of our patients are adults.",
      },
      {
        question: "Braces or Invisalign — which is better?",
        answer:
          "For complex crowding and bite correction, braces achieve results aligners can't. For mild-to-moderate alignment and lifestyle discretion, Invisalign excels. We recommend after assessing your case — many patients qualify for both.",
      },
      {
        question: "Do braces hurt?",
        answer:
          "Bonding day is painless. Each adjustment brings 2–3 days of mild pressure sensation — a sign teeth are moving — managed easily with normal meals and soft foods initially.",
      },
    ],
    related: ["invisalign-clear-aligners", "pediatric-dentistry", "digital-smile-design"],
  },
];

export const serviceCategories = [
  { value: "all", label: "All Services", count: services.length },
  { value: "Restorative", label: "Restorative", count: services.filter((s) => s.category === "Restorative").length },
  { value: "Cosmetic", label: "Cosmetic", count: services.filter((s) => s.category === "Cosmetic").length },
  { value: "Orthodontics", label: "Orthodontics", count: services.filter((s) => s.category === "Orthodontics").length },
  { value: "Surgical", label: "Surgical", count: services.filter((s) => s.category === "Surgical").length },
  { value: "Preventive", label: "Preventive", count: services.filter((s) => s.category === "Preventive").length },
] as const;

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getFeaturedServices(): Service[] {
  return services.filter((s) => s.featured);
}
