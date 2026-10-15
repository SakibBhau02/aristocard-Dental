# Task 17-a — Doctor profile deep enhancement ("doctor profile aro enhance kore dao")

Agent: full-stack-developer subagent (doctor profile enhancement)
Date: round 17 (follows worklog round 16)

## Scope delivered

### 1. Prisma model (`prisma/schema.prisma`) — `bun run db:push` OK
Added 6 nullable columns to `model Doctor` (JSON-string pattern, no lists):
- `educationJson String?` — `[{degree, institution?, year?}]`
- `membershipsJson String?` — `string[]`
- `awardsJson String?` — `[{title, year?}]`
- `quote String?` / `quoteBn String?` — bilingual philosophy pull-quote
- `focusServicesJson String?` — service slugs linking profile → /services/<slug>

### 2. Data layer
- `src/lib/types.ts`: new `DoctorEducation` / `DoctorAward` types; `Doctor` += optional
  `education?`, `memberships?`, `awards?`, `quote?`, `quoteBn?`, `focusServices?`.
- `src/lib/content/shared.ts`: `DoctorRow` + `RawDoctor` extended; `mapDoctor` parses the new
  JSON columns via defensive `parseEducation` / `parseAwards` helpers (shape-mismatched
  entries dropped, empty → undefined); `doctorRowToDoctor` passes them through.
- `src/lib/data/doctors.ts` (static fallback): FACTUAL SAFETY rules applied —
  - Education derived ONLY from stated credentials: "BDS (DU)" + bio-stated "from the
    University of Dhaka" → entries carry the institution for Dr. Jumla (3 entries incl.
    both PGTs) and Dr. Israt (BDS only — her PGT institution is NOT stated → bare entry);
    Dr. Shazia & Dr. Abdur Rahim get institution-free BDS/MDS entries. No years invented.
  - `awards`/`memberships` left EMPTY for all 4 (admin fills real ones).
  - Quotes: original editorial one-liners (bilingual quote+quoteBn); Dr. Shazia's reuses
    the philosophy already printed in her bio.
  - focusServices mapped to real slugs: Shazia → invisalign/braces/dsd/veneers; Rahim →
    root-canal/oral-surgery/crowns; Jumla → root-canal/laser/crowns/oral-surgery;
    Rimi → pediatric/gum/oral-surgery.
- DB seeded with the same dossier values for the 4 live rows (one-off script, deleted) —
  the DB takes precedence over static, so seeding was REQUIRED for the public site.

### 3. Admin API (`src/app/api/admin/doctors/route.ts`)
POST accepts + validates: `education` (degree required, clampLen 120/160/16, degree-less
rows dropped), `memberships` (strList), `awards` (title required), `quote`/`quoteBn`
(≤500, empty→null), `focusServices` (filtered against the 11 static service slugs).
Empty arrays → `null` columns (old rows untouched when payload omits fields).

### 4. Dictionary (`src/lib/data/dictionary.ts`)
+7 keys ×2 languages in `doctorsPage`: educationTitle, focusTreatmentsTitle,
scheduleTitle, membershipsTitle, awardsTitle, philosophyTitle, availableDay/offDay.
Runtime parity check: EN 25 = BN 25 keys, zero missing.

### 5. Public /doctors page (`src/components/site/pages/doctors-page.tsx`)
- Collapsed card: unchanged centered stack on mobile; **lg horizontal "sheet" layout**
  (avatar column + left-aligned identity, accent hover halo).
- Expanded dossier now a magazine-quality panel: About/bio → philosophy pull-quote
  (accent gradient bar, italic EN / upright BN) → navy-gradient stats ribbon (3 inline
  icon stats) → Education vertical timeline (accent cap markers + rail, year chips,
  BN degree transliteration, BN digit years) → Focus treatments as clickable 44px pills
  (service icon in accent disc + localized name + arrow; plain `<a href>` intercepted
  SPA-style by the round-16 router) → Weekly schedule strip (7 cells Sat–Fri, accent
  gradient active days, muted off days, BN day names, sr-only status) → Specializations
  (accent dot list) → Credentials + Languages dl → Memberships / Awards sections only
  when data exists → Book CTA. All sections conditional; a11y: role=region,
  aria-expanded/controls kept, h4/h5 semantics, role=list/listitem on the day strip.
- DoctorDetailPage: same JSON-LD enrichment + philosophy quote after bio, education
  timeline section, focus treatments chips (all conditional).
- JSON-LD: the previously DEAD `doctorsJsonLd` (built but never injected) is now wired
  into usePageMeta (useMemo) as an ItemList of Physicians enriched with `knowsLanguage`,
  `alumniOf` (CollegeOrUniversity from education institutions) and `availableService`
  (MedicalProcedure from focus services); detail-page Physician gets the same enrichment
  on top of its existing aggregateRating.

### 6. Admin panel (`src/components/site/admin/panels/doctors-panel.tsx`)
New "Profile dossier" EditorCard (between Expertise and Consultation days):
EducationEditor (add/remove degree/institution/year rows), memberships via the existing
ChipsEditor, AwardsEditor (title/year rows), bilingual philosophy quote (BilingualField
textarea), FocusServicesPicker (11 service toggle chips with DynamicIcon, aria-pressed,
44px). Draft/rowToDraft/save() extended; existing doctors keep working (all optional).

## Verification (all performed)
- `bun run db:push` OK; `bun run lint` exit 0 zero output; dev.log: 12× GET /doctors* 200,
  zero compile errors, zero console/page errors (agent-browser `console`/`errors` sweeps).
- Browser (agent-browser session t17a):
  - /doctors renders all 4 cards; expansion works; second card expands independently
    while first stays open; collapse works (aria toggle verified).
  - Shazia dossier: quote, stats ribbon (3), education timeline, 4 focus chips with
    correct hrefs, 7-cell schedule strip (6 active per DB data + Friday off, titles
    "Saturday — Consulting" / "Friday — Off day"), specializations, credentials+languages.
  - Focus chip click → SPA navigates to /services/invisalign-clear-aligners (h1 verified).
  - BN mode: about heading, Bangla quote, section labels (শিক্ষা ও প্রশিক্ষণ / ফোকাস
    ট্রিটমেন্ট / সাপ্তাহিক কনসালটেশন সময়সূচি / বিশেষত্বের ক্ষেত্রসমূহ), বিডিএস/পিজিটি
    transliteration, Bangla day names (শনি…শুক্র), Bangla service names on chips, no
    italic on BN quote.
  - JSON-LD verified live: ItemList 4 Physicians with knowsLanguage/alumniOf
    (University of Dhaka for Jumla & Rimi)/availableService; detail Physician enriched.
  - 390px: scrollWidth - clientWidth === 0 (before + after full scroll), dossier open.
  - lg 1440px: horizontal card (avatar x=133 < name x=253), toggle full width.
  - Detail page /doctors/dr-jumla-binte-jafor: quote, Education & training + Focus
    treatments headings, 3 edu entries with institutions, 4 service links.
  - Admin (login admin/Aristocrat#2026): Doctors panel → Jumla editor shows all new
    fields pre-filled; round-trip test (year 2015 + membership + Pediatric focus chip →
    Save → "Doctor updated" toast → reopen → values persisted) then FULLY RESTORED
    (verified in DB: educationJson original, membershipsJson null, focusServices
    original 4, quote unchanged).
  - Temporary memberships/awards DB test on Rahim → sections render on public page
    (chips + award row with year) → cleaned up → graceful absence re-verified.
- VLM visual QA: desktop expanded dossier 8.5/10 (hierarchy, stat ribbon, pull-quote,
  schedule strip praised); BN mobile PASS. VLM nitpicks (education/credentials
  redundancy, mixed list styles) judged acceptable — institution-free entries are the
  task-sanctioned option and real medical profiles repeat degrees in both blocks.

## Files changed
- prisma/schema.prisma (+6 columns, comment block)
- src/lib/types.ts (DoctorEducation, DoctorAward, Doctor extensions)
- src/lib/content/shared.ts (DoctorRow/mapDoctor/doctorRowToDoctor + parsers)
- src/lib/data/doctors.ts (static dossier fields for 4 doctors)
- src/lib/data/dictionary.ts (+7 keys ×2)
- src/app/api/admin/doctors/route.ts (educationList/awardList validators, new data keys)
- src/components/site/pages/doctors-page.tsx (dossier redesign + JSON-LD wiring)
- src/components/site/admin/panels/doctors-panel.tsx (dossier editors + save payload)

## Notes for main agent
- Dev server DIED once early in the session (auto-recovered by the system supervisor);
  double-fork restart convention remains relevant.
- agent-browser `fill` with a space leaves " " (React controlled input quirk) — used
  Ctrl+A+Backspace to clear; server-side `.trim() || undefined` made it moot anyway.
- Stale @refs after save → re-snapshot before clicking remove buttons (one membership
  restore initially landed on a stale ref; fixed by DOM-queried click).
- memberships/awards remain empty site-wide by design (factual safety) — admin can fill.
