# Task 6-a — API Rate Limiting + Service-Page Reviews Section + Blog Search

- **Agent**: full-stack-developer
- **Status**: Complete — all curl verification + lint + tsc clean
- **Files created**: `src/lib/rate-limit.ts`, `src/components/site/service-reviews.tsx`
- **Files modified**: `src/app/api/appointments/route.ts`, `src/app/api/contact/route.ts`, `src/app/api/newsletter/route.ts`, `src/app/api/reviews/route.ts`, `src/lib/data/dictionary.ts`, `src/components/site/patient-reviews.tsx` (anchor only), `src/components/site/pages/service-detail-page.tsx`, `src/components/site/pages/blog-page.tsx`
- **Not touched** (per main-agent warning): globals.css, home-page.tsx, gallery-page.tsx, navbar.tsx, footer.tsx, shared.tsx, motion.tsx, all admin routes

## Feature 1 — In-memory per-IP rate limiting

### `src/lib/rate-limit.ts`
- `checkRateLimit(key, limit, windowMs): { allowed, retryAfterSec }` — sliding window: Map<key, number[]>, expired hits pruned on every call (`now - t < windowMs`), blocked requests do NOT record a hit (window can't be extended by spam), `retryAfterSec = ceil((oldest + windowMs - now)/1000)` → exact `Retry-After` header.
- Map self-cleans every 5 min: keys whose newest hit is older than 30 min are deleted (no unbounded growth).
- `getClientIp(req)`: `x-forwarded-for` (first value, trimmed) → `x-real-ip` → `"local"`.

### Applied to 4 POST routes (rate-limit check is the FIRST thing in the handler, before body parse → 429 never leaks validation info; all existing validation logic untouched):
| Route | Key | Limit |
|---|---|---|
| POST /api/appointments | `apt:<ip>` | 5 / 10 min |
| POST /api/contact | `contact:<ip>` | 3 / 1 hour |
| POST /api/newsletter | `news:<ip>` | 3 / 1 hour |
| POST /api/reviews | `review:<ip>` | 3 / 1 hour |
429 body: `{"error":"Too many requests. Please wait a few minutes and try again, or call us at 01715-027522."}` + `Retry-After` header (seconds). Admin routes untouched.

### Curl verification (dev server, distinctive test IPs)
- POST /api/reviews from `x-forwarded-for: 6.6.6.6`: #1–3 → 201, **#4 → 429 + `retry-after: 3600`** + friendly JSON, #5 → 429 (persisted).
- Same endpoint different IP 8.8.8.8 → 201 (per-IP isolation proven).
- GET /api/reviews → 200 still; GET /api/reviews?service=invisalign-clear-aligners → only that service's reviews + site-wide aggregate {4.5, 6}.
- POST /api/appointments from 7.7.7.7: empty body → **400 "A valid JSON request body is required."** (validation reachable, not 429), malformed JSON → 400.
- POST /api/newsletter from 6.6.6.7: 201/200/200/429. POST /api/contact from 6.6.6.8: 201/201/201/429 — both with Retry-After 3600.
- Reset semantics confirmed by code review: pruning `now - t < windowMs` means the oldest hit drops out after the window elapses → counter decrements → allowed again.
- Test data cleaned up (one-off bun/prisma script, deleted after run): 4 pending reviews, 3 contact messages, 1 newsletter subscriber removed; DB tidy for admin QA.

## Feature 2 — Patient reviews section on service detail pages

### `src/components/site/service-reviews.tsx` (new, client)
- Props `{ serviceSlug }`; fetches `/api/reviews?service=<slug>` on mount (`encodeURIComponent`, `cache: no-store`).
- Visual language cloned from home patient-reviews.tsx: gold filled `Stars` row, emerald "Verified patient" badge, initials avatar, blue service chip (BN shortNameBn when bn), `bn-BD`/`en-US` localized dates, `toBnDigits` for average/count, Reveal + SectionHeading, motion whileInView cards, 1/2/3-col responsive grid.
- States: 3 skeleton cards (shadcn Skeleton) while loading; dashed-box error state; friendly empty state ("No reviews for this treatment yet — be the first…") + gold-bordered CTA.
- Aggregate bar (ice-tinted, ring-1): big 1-decimal average + rounded stars + `siteAverage · fromCount` (site-wide, from API `aggregate`) + gold "Write a review" button.
- Max 6 cards, newest first (API sorts desc, take 50 → `slice(0, 6)`).
- "Write a review" (and empty-state CTA): `navigate("/")` via hash router, then 400ms timeout `document.getElementById("reviews")?.scrollIntoView({smooth})`.
- Section: white bg between FAQ (bg-ice) and Related; cards use `ring-1 ring-blue-100/80` (distinct from neighbors' border cards).

### Wiring
- `service-detail-page.tsx`: `<ServiceReviews serviceSlug={service.slug} />` rendered between FAQ and Related sections.
- `patient-reviews.tsx` (home): added `id="reviews"` + `scroll-mt-24` to its `<section>` — the file previously had NO id (task assumed one), so this additive anchor was required for scrollIntoView; scroll-mt keeps the sticky navbar from covering the heading.

### Dictionary (`d.serviceDetail.reviews` EN+BN, ~11 keys × 2)
reviewsEyebrow, reviewsTitle ({service}), reviewsText, noReviews, beFirst, writeReview, verified, siteAverage, fromCount ({count}), loadError. No existing keys modified.

## Feature 3 — Blog search

- `blog-page.tsx` BlogPage: new `search` state + `searching = search.trim().length > 0`.
- `filtered` = category filter AND (title | excerpt | category) `.toLowerCase().includes(q)` — combined, case-insensitive, EN content (per spec); BN labels unchanged.
- While searching: featured hero is hidden (`{!searching && …}`) and every match goes into the grid; result count line (`searchResults` with {count}, toBnDigits in BN, `aria-live="polite"`) shown when matches > 0; empty state (`noResults`) when 0.
- Search input matches services-page pattern exactly (Search icon left, h-11 rounded-full, brand focus ring); clear (X) button appears inside the input when text present (`searchClear` aria-label/title); native webkit ✕ hidden via `[&::-webkit-search-cancel-button]:hidden` (verified present in served CSS).
- AnimatePresence key = `${category}-${search}`; not-searching behavior byte-identical to before (hero + original `rest` exclusion logic).
- Dictionary `d.blogPage` +4 keys × 2 (searchPlaceholder, searchResults, searchClear, noResults).

## Verification summary
- `bun run lint` → clean, zero errors.
- `bunx tsc --noEmit` → only 5 pre-existing errors (examples/, skills/, language-toggle.tsx — none in my files; language-toggle is untouched by me and not in my scope).
- dev.log: all 4 endpoints show 429s; client bundle recompiles ✓; GET / 200 after all changes.
- Rate-limiter reset + pruning verified by code review (time-based filter + 5-min sweep, 30-min idle TTL).

## Notes for main agent (browser QA)
1. Service detail page (e.g. #/services/invisalign-clear-aligners): reviews section between FAQ and Related — 1 approved Invisalign review (Farhana Ahmed) + site-wide aggregate 4.5/6; #/services/traditional-braces-orthodontics (no reviews yet) should show the empty state + CTA.
2. "Write a review" from a service page → navigates home and scrolls to the Patient Reviews block (id="reviews", added this task) after ~400ms.
3. Bangla mode on both new features (titles, aggregate labels, dates, empty/search strings).
4. Blog #/blog: search "implant" → hero hides, count "Showing N articles", grid filters; combine with a category chip; type garbage → noResults empty state; X button clears.
5. Home page unchanged except the section anchor attribute (id/scroll-mt) — check no visual regression after the reviews block heading.
