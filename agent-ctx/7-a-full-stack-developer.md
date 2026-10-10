# Task 7-a — Bangla Blog Translations (full-stack-developer)

## What was done
All 6 blog articles translated into natural, clinically-accurate Bangla and wired into the UI.
**107 translated strings**: 6 titleBn + 6 excerptBn + 6 quickAnswerBn + 24 section headings + 32 body paragraphs + 33 list items (myths/facts, warning signs, comparison table, candidacy, prep tips, whitening ladder).

## Files modified (3)
1. **src/lib/types.ts** (+10) — BlogPost type lives HERE, not in blog.ts (task's file list assumed blog.ts — impossible to satisfy "update the BlogPost type correctly" + TS strict without this edit). Added optional `titleBn?`, `excerptBn?`, `quickAnswerBn?`, `sectionsBn?: { heading; body; list? }[]` — mirrors existing codebase precedent (`Service.nameBn?`, `FAQ.questionBn?`).
2. **src/lib/data/blog.ts** (+245) — per-post `/* ---- বাংলা ---- */` block after `sections`: titleBn/excerptBn/quickAnswerBn/sectionsBn. EN fields byte-identical. Terminology matched to dictionary.ts + services.ts nameBn (রুট ক্যানেল, ইনভিজিলাইন, ব্রেসেস, ডেন্টাল ইমপ্ল্যান্ট, শিশু ডেন্টিস্ট্রি, স্কেলিং, ক্যাভিটি, এনামেল, জিরকোনিয়া, অ্যারিস্টোক্র্যাট ডেন্টাল কেয়ার). Bangla numerals (৬ মাস, ২৪–৭২ ঘণ্টা, ৯৫ শতাংশ, ২০–২২ ঘণ্টা). Author names/credentials stay EN (credentials by design).
3. **src/components/site/pages/blog-page.tsx** (net ~±65) — see below.

## UI wiring (blog-page.tsx)
- Search filter (6-a feature, preserved): now also matches `titleBn`/`excerptBn` (`(p.titleBn?.toLowerCase().includes(q) ?? false)`).
- Featured card: aria-label + h2 + excerpt + quick-answer preview (`.slice(0,140)`) swap when bn, EN fallback.
- Grid cards: aria-label + h3 + excerpt swap.
- Detail page: usePageMeta title+description swap (suffix "| Aristocrat Dental Care & Orthodontic Center" auto-appended by usePageMeta; JSON-LD stays canonical EN), breadcrumb, h1, quick-answer box, sections loop rewritten to block-body with `bnSection = bn ? post.sectionsBn?.[i] : undefined` → `bnSection?.heading ?? section.heading`, `(bnSection?.body ?? section.body)`, `listItems = bnSection?.list ?? section.list`; related cards swap.
- Removed: "আর্টিকেলটি ইংরেজিতে" notice block on blog detail + now-unused `Globe` lucide import. Dictionary keys `articleInEnglish` (EN+BN) intentionally KEPT (unused but harmless — minimal-diff policy, dictionary is edit-only).
- **dictionary.ts: NOT touched** — `blogPage.quickAnswer` = "দ্রুত উত্তর" already existed; no new keys needed.

## Verification
- Structure: one-off bun script → all 6 posts 1:1 parallel (section counts 4/4/4/4/4/4, paragraph counts match EN, lists exactly where EN has lists) — "ALL PARALLEL ✓".
- `bun run lint` → exit 0, zero errors.
- `bunx tsc --noEmit` → only 5 pre-existing errors (examples/, skills/, language-toggle.tsx — all documented in round 6-a, none mine).
- dev.log → clean ✓ Compiled entries, zero errors.
- `git status` → only the 3 intended files modified.

## For main-agent browser QA (BN mode)
Routes + checks:
1. `#/blog` BN: PageHeader BN, featured card Bangla (title/excerpt/দ্রুত উত্তর preview), all 6 grid cards Bangla, category chips BN.
2. `#/blog` BN search: type "রুট ক্যানেল" → 1 result (root-canal post); "ইমপ্ল্যান্ট" → 1 result; "ডেন্টিস্ট" → broader match; EN queries ("implant") still work; result count shows Bangla digits.
3. `#/blog/<each of 6 slugs>` BN: hero h1 Bangla, NO "আর্টিকেলটি ইংরেজিতে" pill, breadcrumb last item Bangla, দ্রুত উত্তর box Bangla, all 4 section headings + paragraphs Bangla, bullet lists Bangla (myths list has মিথ ১–৭ / সত্য pairs), author box still EN (by design), related cards Bangla, tab title ends with "| Aristocrat Dental Care & Orthodontic Center".
4. EN mode: everything identical to before (spot-check one grid card + one detail page).
5. 390px spot-check on a BN detail page (Bangla text wraps differently).
