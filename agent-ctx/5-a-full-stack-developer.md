# Task 5-a — Admin Dashboard: Date-Range Filter + CSV Export

- **Agent**: full-stack-developer
- **Status**: Complete — all verification passed
- **Files changed**: `src/lib/admin-csv.ts` (new), `src/app/api/admin/appointments/route.ts`, `src/components/site/pages/admin-page.tsx`
- **Not touched** (per parallel-agent warning): dictionary.ts, deep pages, home-page.tsx, globals.css

## What was built

### 1. Date-range filter (API)
- GET `/api/admin/appointments` now accepts `from` / `to` (`YYYY-MM-DD`, regex `^\d{4}-\d{2}-\d{2}$` **plus** real-calendar-date check — e.g. `2026-13-45` is rejected). Invalid values are silently ignored.
- Range is combined with the existing `status` param in the Prisma `where` for the **list**.
- `stats` are computed from the **date-range-filtered set only** (status-agnostic) → range-scoped stat cards that always give a full status overview of the range; with no range the behavior is identical to before (global stats).
- New `range` field in the JSON response: `{ from, to, label, total }` — `label` is human-readable ("Jan 1 – Dec 31, 2026", "Oct 10, 2026", "up to Oct 10, 2026", "<date> onwards"), `total` = appointments in range (no take-limit).
- "Today" stat is now computed in **Asia/Dhaka** timezone (was UTC) via `Intl` — matches the clinic's wall clock.

### 2. Date-range filter (UI)
- Compact filter row added to the toolbar card (below status tabs + search, separated by a divider):
  - Preset chips: All time / Today / Next 7 days / Next 30 days / Past 30 days. Active chip = brand-blue bg + ring + shadow; `aria-pressed`.
  - Custom From/To native date inputs (44px touch height, `bg-ice`, brand focus ring, sr-only labels). Manual edits switch to "custom" mode (no chip active); clearing both returns to "All time".
  - Inverted range (from > to) shows a rose inline hint (no min/max attrs so users can type freely).
- Amber "Showing X appointments in range <label>" indicator bar with **Clear filter** button (AnimatePresence enter/exit), `role="status"`.
- "Stat cards · <range|all time>" caption under the stat grid (AnimatePresence mode="wait") so the range-scoping of stat cards is clearly labeled.
- Friendly empty state when a range matches 0 rows ("No appointments in this date range" + Clear date filter button), distinct from the no-data and filter-mismatch states.
- Race guard (`loadIdRef`) so rapid preset switching can't apply stale responses.

### 3. CSV export
- `GET /api/admin/appointments?format=csv[&from&to&status]` → `text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="appointments-<range>.csv"` where `<range>` = `all` | `from_YYYY-MM-DD` | `to_YYYY-MM-DD` | `YYYY-MM-DD_to_YYYY-MM-DD`. `Cache-Control: no-store`. Up to 5000 rows.
- Columns: `RefCode,Name,Phone,Email,Date,Time,Doctor,Service,Status,Source,CreatedAt` (Doctor/Service resolved server-side from `doctors.ts`/`services.ts` slug maps; CreatedAt as Asia/Dhaka ISO-8601 `+06:00`).
- RFC-4180-style escaping in `csvCell()`: every field quote-wrapped, internal quotes doubled, and **CSV-injection guard** — leading `=`, `+`, `-`, `@`, tab, CR get a single-quote prefix.
- UI: gold/amber "Export CSV" button (brand gold #f59e0b bg, navy text, `Download` icon, spinner while fetching) at the end of the filter row. Fetches with `x-admin-code` + current `from`/`to`/status params, blob → temp anchor download, filename parsed from Content-Disposition. 401 → session-expired screen; other failures → existing error banner.

## Verification (all passed)
- `bun run lint` — clean.
- curl: range filter (8 rows for 2026-01-01→2026-12-31; 3 for today), one-sided ranges, invalid dates ignored (`banana`, `2026-13-45` → range null), status+range combined (4 PENDING), 401 without code.
- CSV via curl: correct headers/filename/content-type; escaping verified — created booking with name `=SUM(A1)` → exports as `"'=SUM(A1)"`; `+880…` → `"'…"`; quotes doubled (`"He said ""hello"""`); CRLF endings; Dhaka timestamps correct (UTC 06:35 → `12:35:23+06:00`).
- Browser E2E (agent-browser): passcode login → 9 rows + stats; "Today" → 3 rows + indicator "Showing 3 appointments in range Oct 10, 2026" + scoped stats/caption/tab-counts; "Next 7 days" → 4 rows; "All time" → 9 rows, indicator gone; custom From/To → 9 rows + "Jan 1 – Dec 31, 2026" indicator; inverted range → hint + empty state + Clear works; **Export CSV → real file downloaded through the browser** (header + 9 rows + escaped injection row).
- Computed styles: gold button rgb(245,158,11), active chip rgb(30,125,255)+ring, date inputs 44px on ice bg; no horizontal overflow at 390px (chips wrap; scrollWidth=390).
- VLM: desktop 8.5/10, mobile 8/10 (its "chip overflow" claim disproven by direct measurement).
- No console/page errors from my code (a hydration warning appeared once on the HOME page while the parallel agent was mid-edit of home-page.tsx — not from this task's files).

## Notes / risks
- The dev server was **OOM-killed** during this task (dmesg: next-server 1.88GB RSS, sandbox 4.1GB RAM with a headless Chrome also resident). Processes spawned from this agent's shell are reaped at command end, so the server could not be left running from here — **it needs a restart (`bun run dev`) via the usual system mechanism**. I closed my browser session to free ~1.5GB before finishing.
- Demo test row left in DB: `ADC-0SHEQUFL` (name `=SUM(A1)`, notes with quotes, 2026-12-25) — intentionally kept as the CSV-injection demo/QA row.
- Stats semantics: stat cards are range-scoped but intentionally NOT status-tab-scoped (tabs + counts already communicate the status slice; cards stay a full overview of the range).
- CSV export honors date range + status tab, not the transient search box (search is UI-only; adding a server-side search param would be a small future extension).
