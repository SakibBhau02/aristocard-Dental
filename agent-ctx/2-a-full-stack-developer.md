# Task 2-a — full-stack-developer — Complete removal of all pricing-related content

## Context
Client order: "আর pricing-related কোনো কথাবার্তা একদমই থাকবে না; সম্পূর্ণরূপে বাদ দিয়া দাও" — every pricing/cost/payment mention had to be removed site-wide (EN + বাংলা), including the price-estimator feature itself. Conventions followed from worklog rounds 8–10: dictionary EN/BN key parity, Turbopack CSS cache-bust trick, only the 5 pre-existing tsc errors tolerated, dev server already running via double-fork (never restarted), no browser QA (left to main agent).

## Files changed (18 = 17 modified + 1 deleted)
1. **DELETED** `src/components/site/pages/estimator-page.tsx` (683 lines — the whole interactive estimator: BDT ranges, EMI chips, print sheet, sticky mobile bar, `has-mobile-bar` body class).
2. `src/components/site/site-shell.tsx` — removed EstimatorPage import + `estimator` route branch.
3. `src/lib/site.ts` — navItems 8→7 (`Pricing` → `#/estimator` removed).
4. `src/components/site/navbar.tsx` — removed `d.chrome.nav.pricing` (navLabels stays aligned 7=7).
5. `src/app/sitemap.ts` — removed `/#/estimator` entry.
6. `src/components/site/footer.tsx` — quickLinks array re-indexed after removing the estimator link (6=contact, 7=appointment, 8=status, 9=faqs).
7. `src/components/site/site-search.tsx` — removed the qa-estimate quick action + Calculator icon/import; **also** reworded POPULAR_QUERIES seeds "Braces cost"→"Braces treatment" and "ব্রেসের খরচ"→"ব্রেসেস" (both chips still match real index entries).
8. `src/lib/data/search-index.ts` — removed "/estimator" page row + Calculator icon-map entry; removed the `dental-implants-cost-bangladesh` BLOG_KEYWORDS entry; trimmed pricing words from invisalign/root-canal keyword strings; header comment counts updated (11→10 pages, 6→5 posts).
9. `src/lib/data/dictionary.ts` — the big one (both EN and BN blocks, parity kept):
   - Removed entire `estimatorPage` sections (EN 728–813 / BN 1756–1833 incl. breadcrumb keys).
   - Removed `chrome.nav.pricing` (EN "Pricing"/BN "খরচ"), `search.actionEstimate`, `home.galleryPreview.ctaEstimate`, `assessmentPage.ctaSecondary` (EN+BN).
   - Removed "Cost Estimator"/"খরচ হিসাব" from footer.quickLinks (11→10 both langs).
   - Reworded: shared.ctaDescription, home.hero.trust[3], home.faq.description, about.values Integrity, serviceDetail.safetyList[3] ("Transparent pricing discussed before treatment"→"Personalized treatment plan in writing" — the task's "~430 appointmentPage" line actually lives in serviceDetail.safetyList), faqsPage.description + groupClinic ("Clinic, Booking & Costs"→"Clinic & Booking"), assessmentPage nextSteps[2] + urgencyText + ctaDescription, appointmentPage trust[0..1] + callNote, statusPage cantMakeIt + help[1] (free-of-charge phrasing → neutral), blogPage.description — all mirrored EN+BN.
10. `src/components/site/pages/assessment-page.tsx` — removed the ghost "Estimate Your Cost" button + Calculator import; primary Book CTA kept.
11. `src/components/site/pages/home-page.tsx` — removed the outline Wallet/`ctaEstimate` button in SMILE GALLERY PREVIEW + Wallet import. Hero untouched.
12. `src/components/site/pages/faqs-page.tsx` — meta description reworded (no "implant costs"/"pricing").
13. `src/lib/data/faqs.ts` — REPLACED (not deleted) the 2 pricing FAQs to keep the AEO count at 12: checkup-cost → "Is root canal treatment painful?", implants-cost → "Do you use laser dentistry in treatments?" (bilingual Q+Bn+A+An as specified).
14. `src/lib/data/blog.ts` — DELETED the whole "dental-implants-cost-bangladesh" post object (92 lines); reworded pricing in how-often (EN+BN), root-canal-myths myth 2 + myth 7 (EN+BN — myth 7 is now about post-treatment fracture, not expense), invisalign excerpt/quickAnswer/comparison-row (Cost row → Cleaning row, EN+BN; "budget"→"priorities"/"বাজেট"→"প্রয়োজন").
15. `src/lib/data/services.ts` — dental-implants FAQ "How much do dental implants cost…" → "How long do dental implants last?"; root-canal benefit "Cost-Effective" → **"Better Than Any Replacement"** (see deviations); root-canal FAQ "costly replacement" → "a gap that is harder to restore"; root-canal overview "your bite, your bone and your wallet" → "your bite and your bone".
16. `src/app/layout.tsx` — Dentist JSON-LD: removed `priceRange`, `currenciesAccepted`, `paymentAccepted`.
17. `src/app/globals.css` — removed the whole "Mobile estimate-bar coordination" block (has-mobile-bar media query + the FAB bottom/transition rule that existed only to smooth the estimator's sticky-bar lift; Tailwind `transition-all` on the buttons resumes) and the `.chip-month`/`.chip-month:hover` EMI chip block; appended `/* cache-bust r11-a */` (Turbopack stale-CSS trick — kept, per convention). Reduced-motion `.fab-stack/.scroll-top-btn{transition:none}` rule kept (generic, harmless).
18. `src/components/site/pages/appointment-page.tsx` — deep-link comment now says "(e.g. from smile assessment)".
19. `src/components/site/pages/blog-page.tsx` — **outside the listed scope but required by pricing content**: blog meta description contained "implant costs in Bangladesh" → removed.

## Deliberate micro-deviations (flagged for main agent)
- **hero trust chip**: task offered "Sterilized, modern facility" with fallback "Advanced dental technology" if duplicating — the array already had "Strict sterilization", so the fallback was used: EN "Advanced dental technology" / BN "অত্যাধুনিক ডেন্টাল প্রযুক্তি".
- **root-canal benefit**: task's "Keeps Your Natural Tooth" would have near-duplicated the existing benefit "Keep Your Natural Tooth" (2 items up in the same list) — used title "Better Than Any Replacement" with the task's exact description text.
- **Kept as-is (metaphorical, non-price)**: services.ts veneers overview "a long-term investment in your confidence" — mentions no money/price; left untouched. `budget` variable name in site-search.tsx is internal code (result-count cap), not user-visible.
- Near-duplicate content the task text itself creates (left exactly as specified, main agent may want to glance): assessment nextSteps now has "Personalized written plan" (step 2) + "Clear treatment plan in writing" (step 3); invisalign comparison now has "Hygiene" + "Cleaning" rows (EN) / "পরিষ্কার-পরিচ্ছন্নতা" twice (BN) — both lists keep EN↔BN row parity.

## Verification (all green)
- `bun run lint` → exit 0, zero output.
- `bunx tsc --noEmit` → ONLY the 5 pre-existing excluded errors (examples/websocket ×2, skills ×2, language-toggle.tsx) — nothing new.
- One-off bun parity script (deleted after): EN 685 keys = BN 685 keys, zero only-in-EN/BN, quickLinks 10/10 in both languages, PARITY_OK true.
- One-off index-count script (deleted after): EN+BN search index = 10 pages + 11 services + 4 doctors + 5 blog + 45 FAQs = 75, all ids unique, no /estimator entry; blogPosts = 5; generalFaqs = 12 (AEO count kept); service FAQs = 33.
- rg sweeps under src/: `৳ | estimator | Estimate | pricing | Pricing | EMI | installment | bKash | currenciesAccepted | priceRange | estimat(case-insensitive)` → ZERO matches. BN `খরচ|মূল্য|দাম|কিস্তি|সাশ্রয়|টাকা|বিনামূল্যে|সস্তা|ব্যয়বহুল|পেমেন্ট|অগ্রিম|বাজেট|দামি` → only মূল্যবোধ (doctorsPage values) + মূল্যায়ন (reviews rating) — both allowed. Remaining "free" = pain-free/stress-free/fear-free/metal-free only; "quote" hits = testimonial Quote icons + why.quote quotation; "premium/prEMIum" = false-positive substring.
- Served HTML: GET / 200; homepage HTML contains zero pricing tokens and no `#/estimator` link; /sitemap.xml contains no "estimator".
- dev.log tail: clean ✓ recompiles after every edit (incl. 624ms recompile after the globals.css cache-bust), GET / 200, zero new ⨯.
- git footprint: exactly the files above (blog-page.tsx the only out-of-list file, justified); tool-results/ artifacts are session scratch, not source.
