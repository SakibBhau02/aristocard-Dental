import type { BlogPost } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Blog — SEO/AEO optimized dental health articles                    */
/*  Each article leads with a quick-answer box (AEO best practice)     */
/* ------------------------------------------------------------------ */

export const blogPosts: BlogPost[] = [
  {
    slug: "how-often-should-you-visit-dentist",
    title: "How Often Should You Visit the Dentist? A Complete Guide for Bangladeshi Families",
    excerpt:
      "The evidence-backed answer on dental visit frequency — and the signs that mean you should book sooner rather than later.",
    category: "Preventive Care",
    readTime: "6 min read",
    date: "2025-11-18",
    updated: "2026-01-12",
    author: "Dr. Shazia Khanam",
    authorCredentials: "BDS, MDS — Chief Dental Surgeon",
    featured: true,
    tags: ["dental checkup", "preventive dentistry", "oral health Bangladesh"],
    quickAnswer:
      "Most adults and children should visit the dentist every six months for a checkup and professional cleaning. If you have gum disease, braces, diabetes or ongoing treatment, your dentist may recommend visits every 3–4 months instead.",
    sections: [
      {
        heading: "The Six-Month Rule: Where It Comes From",
        body: [
          "Twice-yearly dental visits have been standard advice for decades — and research continues to support them for most people. Plaque hardens into tartar within 24–72 hours, and once calcified, only professional instruments can remove it. Six months is roughly the window in which tartar accumulation starts causing gum inflammation in most patients.",
          "For patients in Dhaka and across Bangladesh, six-monthly visits also catch problems unique to our diet and climate: high-sugar tea culture, betel nut chewing, and the abrasive mineral content in some local water sources.",
        ],
      },
      {
        heading: "Signs You Should Book Sooner",
        body: [
          "Don't wait for your scheduled visit if you notice any of these warning signs:",
        ],
        list: [
          "Bleeding gums when brushing or flossing",
          "A toothache or lingering sensitivity to hot, cold or sweets",
          "A chipped, cracked or knocked-out tooth (emergency: same day!)",
          "Persistent bad breath that doesn't improve with brushing",
          "A visible dark spot or hole in any tooth",
          "Jaw pain, clicking or difficulty opening your mouth",
        ],
      },
      {
        heading: "Different Schedules for Different People",
        body: [
          "Some patients genuinely need more frequent care. Diabetics face higher gum disease risk and slower healing — quarterly visits are often advised. Orthodontic patients with braces need 4–6 weekly adjustments anyway. Patients with a history of gum disease typically maintain 3–4 month recall intervals, because the bacteria that cause it re-establish quickly.",
          "Children, pregnant women and smokers all benefit from closer monitoring too. At Aristocrat Dental Care, we personalize your recall schedule based on your actual oral health status — never a one-size-fits-all rule.",
        ],
      },
      {
        heading: "What Happens at a Checkup?",
        body: [
          "A routine visit takes 30–45 minutes: a full examination of teeth, gums and soft tissue, digital X-rays when needed, professional scaling and polishing, and an oral cancer screening. Finding a small cavity today costs a fraction of the root canal it becomes in a year — prevention is always the cheaper, gentler path.",
        ],
      },
    ],
  },
  {
    slug: "root-canal-myths-facts",
    title: "Root Canal Treatment: 7 Myths That Scare Patients (And the Facts That Shouldn't)",
    excerpt:
      "Modern root canals save teeth comfortably — often in a single visit. We debunk the seven myths that keep patients delaying painless care.",
    category: "Endodontics",
    readTime: "8 min read",
    date: "2025-10-05",
    updated: "2025-12-20",
    author: "Dr. Jumla Binte Jafor",
    authorCredentials: "BDS (DU), PGT — Restorative & Surgical Dentistry",
    featured: true,
    tags: ["root canal", "toothache", "endodontics Dhaka"],
    quickAnswer:
      "Modern root canal treatment is painless — patients compare it to getting a regular filling. It saves your natural tooth, usually takes 1–2 visits, and has a success rate above 95%. Delaying treatment is what actually causes severe pain.",
    sections: [
      {
        heading: "Why Root Canals Have an Unfair Reputation",
        body: [
          "Root canal treatment got its scary reputation decades ago — before modern anesthesia, rotary instruments and imaging. Tales from grandparents' era persist, while the reality has completely transformed. Today's endodontics is precise, comfortable and remarkably fast.",
          "Ironically, patients who arrive in severe pain are usually those who delayed treatment of a simple cavity until the nerve became infected. The root canal itself is what relieves that pain.",
        ],
      },
      {
        heading: "The 7 Myths — Debunked",
        body: ["Here are the myths we hear every week in our Uttara clinic, followed by the facts:"],
        list: [
          "Myth 1: Root canals are extremely painful → Fact: with modern anesthesia the procedure is painless; most patients compare it to a filling.",
          "Myth 2: Extraction is a better option → Fact: nothing matches your natural tooth; extraction leads to bone loss, drifting teeth and costlier replacement.",
          "Myth 3: Root canals take many visits → Fact: most cases complete in one 60–90 minute visit.",
          "Myth 4: Root canals cause illness → Fact: decades of research show properly treated teeth are safe and healthy.",
          "Myth 5: The tooth will darken and look dead → Fact: modern sealing materials and a protective crown keep your smile natural.",
          "Myth 6: If it doesn't hurt, I don't need treatment → Fact: infected nerves sometimes die quietly; X-rays reveal infection that pain doesn't.",
          "Myth 7: Root canals are too expensive → Fact: saving a tooth costs far less than extraction plus implant or bridge.",
        ],
      },
      {
        heading: "How to Know If You Need One",
        body: [
          "Deep decay, a cracked tooth, trauma or a repeated dental procedure on the same tooth can all inflame or infect the pulp — the living tissue inside your tooth. Symptoms include severe pain on hot or cold that lingers, pain when biting, swelling near the tooth, or a darkening tooth. Sometimes there are no symptoms at all, which is why X-rays matter.",
        ],
      },
      {
        heading: "The Modern Procedure, Step by Step",
        body: [
          "After profound numbing, rotary nickel-titanium instruments clean the canal system efficiently. Electronic apex locators measure canal length precisely — no guesswork. After disinfection and sealing, a crown protects the tooth. Our patients at Aristocrat Dental Care routinely say 'That's it?' when we finish.",
        ],
      },
    ],
  },
  {
    slug: "invisalign-vs-braces-guide",
    title: "Invisalign vs Braces: Which Is Right for You? An Orthodontist's Honest Comparison",
    excerpt:
      "Aligners or braces — the honest pros, cons and costs of each, from an Uttara clinic that provides both.",
    category: "Orthodontics",
    readTime: "7 min read",
    date: "2025-09-22",
    updated: "2026-01-05",
    author: "Dr. Shazia Khanam",
    authorCredentials: "BDS, MDS — Chief Dental Surgeon",
    tags: ["Invisalign Bangladesh", "braces Dhaka", "orthodontics", "clear aligners"],
    quickAnswer:
      "Invisalign suits mild-to-moderate alignment issues and patients needing discretion — it's removable and invisible. Braces are more powerful for severe crowding and complex bite corrections. Both take 6–24 months. The right choice depends on your case complexity, lifestyle and budget.",
    sections: [
      {
        heading: "What Invisalign Does Best",
        body: [
          "Invisalign's clear aligners are custom-made from 3D scans of your teeth, moving them in precise planned increments. Their standout advantages: they're virtually invisible, fully removable for meals and brushing, and comfortable — no wires or brackets.",
          "Adult professionals, university students and camera-facing personalities consistently choose Invisalign for discretion. Treatment typically runs 6–18 months, with visible improvement often within the first few months.",
        ],
      },
      {
        heading: "Where Braces Still Win",
        body: [
          "Fixed braces remain orthodontics' heavy machinery. Severe crowding, rotated teeth, significant bite corrections (overbite, underbite, crossbite) and vertical tooth movements are cases where braces achieve results aligners can't — or would take far longer to.",
          "Modern self-ligating braces are also sleeker than their reputation: lower profile, less friction, fewer adjustment visits. Ceramic (tooth-colored) brackets offer a mid-point aesthetic for image-conscious teens.",
        ],
      },
      {
        heading: "The Honest Comparison Table",
        body: ["Here's how the two options compare side by side:"],
        list: [
          "Aesthetics: Invisalign — virtually invisible; Braces — visible (ceramic less so)",
          "Removability: Invisalign — yes; Braces — fixed for treatment duration",
          "Complex cases: Braces — superior control; Invisalign — mild to moderate",
          "Discipline required: Invisalign — 20–22 hrs/day wear; Braces — nothing to forget",
          "Hygiene: Invisalign — brush & floss normally; Braces — special threading required",
          "Diet: Invisalign — eat anything; Braces — avoid hard/sticky foods",
          "Cost: comparable in Bangladesh; final quote depends on case complexity",
        ],
      },
      {
        heading: "Our Recommendation Process",
        body: [
          "At your consultation we take photos, X-rays and a 3D scan, then show you what each option would achieve for YOUR smile — including Invisalign's digital simulation of the end result. Many patients qualify for both; the choice becomes lifestyle and preference, not clinical necessity. Book an assessment to see your simulation.",
        ],
      },
    ],
  },
  {
    slug: "dental-implants-cost-bangladesh",
    title: "Dental Implants in Bangladesh: What They Cost, How Long They Last & Who's a Candidate",
    excerpt:
      "A transparent, no-jargon guide to implant treatment in Dhaka — candidacy, timeline, cost factors and lifetime value.",
    category: "Implantology",
    readTime: "9 min read",
    date: "2025-08-14",
    updated: "2025-12-01",
    author: "Dr. Abdur Rahim",
    authorCredentials: "BDS, MDS — Senior Consultant",
    tags: ["dental implant cost Bangladesh", "tooth replacement Dhaka", "implantology"],
    quickAnswer:
      "A dental implant replaces a missing tooth with a titanium root and porcelain crown that lasts decades — often a lifetime for the implant itself. Costs in Dhaka vary with implant system, crown material and number of teeth replaced. Most healthy adults with missing teeth are candidates; a 3D scan confirms your bone suitability.",
    sections: [
      {
        heading: "Why Implants Are Called the Gold Standard",
        body: [
          "A dental implant is a biocompatible titanium post placed in the jawbone, where it fuses with bone over 3–6 months (osseointegration). A custom crown then attaches, creating a replacement tooth that looks, feels and functions like the natural one it replaces.",
          "Unlike bridges, implants don't require grinding healthy neighboring teeth. Unlike dentures, they never slip. And uniquely, the implant post stimulates the jawbone like a natural root — preventing the bone loss that makes long-term denture wearers look older.",
        ],
      },
      {
        heading: "Who Is a Candidate?",
        body: [
          "Most healthy adults with missing teeth qualify. We assess three things at consultation: bone density and volume (via 3D imaging), gum health, and medical factors like uncontrolled diabetes or smoking that affect healing. Even patients with low bone volume often qualify after grafting.",
        ],
        list: [
          "Missing one, several or all teeth",
          "Healthy gums free of active periodontal disease",
          "Adequate jawbone (or willingness for grafting)",
          "Commitment to oral hygiene and follow-up visits",
        ],
      },
      {
        heading: "Cost Factors: An Honest Breakdown",
        body: [
          "Implant pricing in Bangladesh reflects several variables: the implant system (internationally certified systems cost more than generic ones), the crown material (porcelain-fused-to-metal vs full zirconia), the number of implants, and whether bone grafting or sinus lifting is needed.",
          "At Aristocrat Dental Care, we provide a written treatment plan with transparent pricing before beginning — no hidden costs. Compared to the alternatives, implants are lifetime-value: a bridge lasts 10–15 years and sacrifices two healthy teeth; dentures need replacement and reline cycles. An implant, maintained well, often serves for life.",
        ],
      },
      {
        heading: "The Treatment Timeline",
        body: [
          "After planning and placement (a comfortable procedure under local anesthesia), healing takes 3–6 months while the implant integrates. A temporary tooth keeps your smile complete meanwhile. The final crown is then attached — and you forget it isn't the tooth you were born with. Two to three reviews a year keep everything perfect.",
        ],
      },
    ],
  },
  {
    slug: "child-first-dental-visit",
    title: "Your Child's First Dental Visit: When to Go & How to Make It Fear-Free",
    excerpt:
      "Pediatric dentistry timing, preparation tips and what happens at the appointment — building a lifetime of happy smiles.",
    category: "Pediatric",
    readTime: "5 min read",
    date: "2025-07-30",
    updated: "2025-11-15",
    author: "Dr. Israt Jahan Rimi",
    authorCredentials: "BDS (DU), PGT (OMFS) — Consultant Dental Surgeon",
    tags: ["kids dentist Dhaka", "first dental visit", "pediatric dentistry"],
    quickAnswer:
      "Bring your child to the dentist by their first birthday, or within six months of the first tooth appearing. Keep the visit positive and playful, avoid scary words like 'needle' or 'pain', and choose a clinic with a kid-friendly environment. Early visits prevent fear and catch problems before they start.",
    sections: [
      {
        heading: "The Right Time for the First Visit",
        body: [
          "Both pediatric dental associations and our own clinical experience agree: the first dental visit should happen by age one, or within six months of the first tooth erupting. This may sound early, but baby teeth matter — they guide permanent teeth, support speech development and nutrition, and early cavities can appear as soon as teeth do.",
        ],
      },
      {
        heading: "How to Prepare Your Child (and Yourself)",
        body: ["Preparation shapes the whole experience:"],
        list: [
          "Talk about the dentist positively — 'a friendly doctor who counts your teeth'",
          "Never use words like needle, pain, drill or injection around dental visits",
          "Read picture books or play 'dentist' with a toothbrush at home",
          "Book a morning slot when children are rested and cooperative",
          "Stay calm yourself — children read parental anxiety instantly",
        ],
      },
      {
        heading: "What Happens at the Appointment",
        body: [
          "A first visit is deliberately gentle and short: a 'ride' in the chair, counting teeth together, a quick examination of teeth, gums and development, and lots of praise. If needed, a painless fluoride varnish protects emerging enamel. Parents receive home-care coaching tailored to their child's age.",
          "Our specially designed kids' room at Aristocrat Dental Care helps anxious children adapt gradually — many patients who once cried at the door now run in excited to see us.",
        ],
      },
      {
        heading: "Building Habits That Last a Lifetime",
        body: [
          "Children who start early with positive visits are dramatically less likely to develop dental fear — and dramatically more likely to keep healthy smiles through adulthood. Six-monthly visits through childhood catch alignment issues at the ideal time for simple intervention, often avoiding braces altogether or shortening treatment dramatically.",
        ],
      },
    ],
  },
  {
    slug: "teeth-whitening-safe-guide",
    title: "Is Teeth Whitening Safe? What Dhaka Patients Should Know Before Brightening Their Smile",
    excerpt:
      "Professional vs home whitening, sensitivity management and realistic expectations — an evidence-based guide.",
    category: "Cosmetic",
    readTime: "6 min read",
    date: "2025-06-18",
    updated: "2025-10-28",
    author: "Dr. Shazia Khanam",
    authorCredentials: "BDS, MDS — Chief Dental Surgeon",
    tags: ["teeth whitening Dhaka", "cosmetic dentistry", "smile makeover"],
    quickAnswer:
      "Yes — professional teeth whitening is safe when supervised by a dentist. In-clinic whitening uses controlled peroxide concentrations with gum protection, causing no permanent enamel damage. Temporary mild sensitivity is normal and fades within days. Results typically last 1–3 years with good habits.",
    sections: [
      {
        heading: "How Whitening Actually Works",
        body: [
          "Whitening gels contain peroxide that penetrates enamel and breaks down stain molecules lodged within the tooth structure. This is why whitening toothpastes — which only polish surface stains — can never match professional results. The enamel itself is not removed or damaged in the process.",
        ],
      },
      {
        heading: "Professional vs Home Kits vs Natural Remedies",
        body: ["The safety and results ladder:"],
        list: [
          "In-clinic whitening — fastest (60–90 min), dentist-controlled, gum-protected: safest and most effective",
          "Custom take-home trays — dentist-supervised, gradual, excellent for maintenance",
          "Over-the-counter strips — weaker concentrations, variable results, risk of uneven whitening and gum irritation",
          "Natural remedies (lemon, charcoal, baking soda) — abrasive or acidic; damage enamel; avoid",
        ],
      },
      {
        heading: "Managing Sensitivity",
        body: [
          "Some patients experience temporary sensitivity during and after whitening — a sign the gel is working, not harming. We use desensitizing protocols before and after treatment, and recommend fluoride toothpaste in the following days. Sensitivity resolves completely within 24–72 hours for almost everyone.",
        ],
      },
      {
        heading: "Realistic Expectations",
        body: [
          "Professional whitening typically brightens smiles by several shades — enough to be dramatic but natural. Existing crowns, veneers and fillings don't whiten, so we plan any restoration shade-matching around your whitening result. With coffee, tea and tobacco moderation, your brighter smile lasts 1–3 years; touch-up sessions extend it indefinitely.",
        ],
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export const blogCategories = [
  "All",
  ...Array.from(new Set(blogPosts.map((p) => p.category))),
];
