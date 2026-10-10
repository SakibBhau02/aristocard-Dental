# Task 10-b — full-stack-developer — Blog ↔ Services cross-linking

## Task
Bidirectional blog ↔ services cross-linking: `serviceRefs` data field + `relatedPostsForService` helper, "Related treatments" chips on every blog article view, "Recommended reading" cards on every service detail page, 4 bilingual dictionary keys.

## Files changed (only allowed scope touched)
- `src/lib/types.ts` — `serviceRefs?: string[]` on `BlogPost` (+ comment).
- `src/lib/data/blog.ts` — `serviceRefs` on all 6 posts (3 real slugs each, spec mapping); `relatedPostsForService(serviceSlug)` helper (blog.ts order preserved). "teeth-whitening" never referenced.
- `src/lib/data/dictionary.ts` — `shared` += relatedTreatments / relatedTreatmentsSub / relatedReading / relatedReadingSub in BOTH EN and BN blocks (unique quizTeaserCta anchors; runtime parity verified).
- `src/components/site/pages/blog-page.tsx` — BlogDetailPage "Related treatments" block: after author box, before tags+share row; white rounded-2xl card (ToC family), Stethoscope small-uppercase heading + sub, rounded-full chips (blue-50/100 tints, white DynamicIcon tile per service, nameBn in BN, ArrowRight slide, focus-visible ring), navigate(`/services/{slug}`). Skips when serviceRefs empty.
- `src/components/site/pages/service-detail-page.tsx` — "Recommended reading" section: after related-services, before CtaBanner (bg-ice); BookOpen small-uppercase h2 + sub; compact cards grid (sm:2/lg:3) with 64×64 zoom-img thumbnail or DynamicIcon tile, localized category, titleBn, localized readTime, subtle arrow; navigate(`/blog/{slug}`). Skips when list empty.

## Verification
- `bun run lint` → exit 0, zero output.
- `bunx tsc --noEmit` → ONLY the 5 pre-existing excluded errors (examples/×2, skills/×2, language-toggle.tsx).
- rg: serviceRefs (types 1, blog 8 lines, blog-page 2 lines); relatedPostsForService exported + used ×2; each dictionary key exactly 2×.
- One-off bun script (deleted): all serviceRefs ∈ 11 real slugs; teeth-whitening → []; root-canal-treatment → includes root-canal-myths-facts; all 11 services have ≥1 post (18 refs total); dictionary EN/BN shared parity.
- dev.log: clean ✓ recompiles, zero ⨯.

## Notes for main agent
- Coverage per service: crowns-bridges 2, dental-implants 1, digital-smile-design 2, invisalign 1, laser-fillings 3, OMFS 1, pediatric 2, periodontal 2, porcelain-veneers 1, root-canal 1, traditional-braces 2.
- Browser QA: chips navigate without reload; BN labels; 390px no overflow (chips flex-wrap).
- Full worklog entry appended to `/home/z/my-project/worklog.md` (Task ID: 10-b).
