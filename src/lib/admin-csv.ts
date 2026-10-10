import { services } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";

/* ------------------------------------------------------------------ */
/*  Admin helpers — CSV export + date-range utilities                   */
/*  Used by /api/admin/appointments (server-side only)                  */
/* ------------------------------------------------------------------ */

/** Shape needed to serialize an appointment row to CSV. */
export type CsvAppointmentRow = {
  refCode: string;
  name: string;
  phone: string;
  email: string | null;
  date: string;
  time: string;
  doctorSlug: string | null;
  serviceSlug: string | null;
  status: string;
  source: string | null;
  createdAt: Date;
};

export const CSV_COLUMNS = [
  "RefCode",
  "Name",
  "Phone",
  "Email",
  "Date",
  "Time",
  "Doctor",
  "Service",
  "Status",
  "Source",
  "CreatedAt",
] as const;

/**
 * Escape a single CSV cell.
 * - Wraps the value in double quotes and doubles any internal quotes.
 * - CSV-injection guard: prefixes a single quote when the value could be
 *   interpreted as a spreadsheet formula (leading `=`, `+`, `-`, `@`, tab
 *   or carriage return) — important for free-text fields like names/notes.
 */
export function csvCell(value: string | number | null | undefined): string {
  const raw = value === null || value === undefined ? "" : String(value);
  const guarded = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${guarded.replace(/"/g, '""')}"`;
}

/** Current date in the Asia/Dhaka timezone as YYYY-MM-DD. */
export function dhakaToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
  }).format(new Date());
}

/**
 * Format a Date as an Asia/Dhaka ISO-8601 timestamp,
 * e.g. "2026-10-10T12:21:24+06:00" (wall-clock Dhaka time).
 */
export function dhakaIso(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string): string =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}+06:00`;
}

/** Strict YYYY-MM-DD that is also a real calendar date (e.g. rejects 2026-13-45). */
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/* ---------- human-readable range labels (e.g. "Oct 1 – Oct 31, 2026") ---------- */

function monthDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function describeRange(
  from: string | null,
  to: string | null
): string {
  if (from && to) {
    if (from === to) return prettyDate(from);
    const sameYear = from.slice(0, 4) === to.slice(0, 4);
    return sameYear
      ? `${monthDay(from)} – ${monthDay(to)}, ${from.slice(0, 4)}`
      : `${prettyDate(from)} – ${prettyDate(to)}`;
  }
  if (from) return `${prettyDate(from)} onwards`;
  if (to) return `up to ${prettyDate(to)}`;
  return "all time";
}

/** Filename fragment describing the active range, e.g. "2026-01-01_to_2026-12-31" or "all". */
export function rangeFilePart(
  from: string | null,
  to: string | null
): string {
  if (from && to) return `${from}_to_${to}`;
  if (from) return `from_${from}`;
  if (to) return `to_${to}`;
  return "all";
}

/** Serialize appointments as CSV text (CRLF line endings, RFC 4180-style quoting). */
export function appointmentsToCsv(rows: CsvAppointmentRow[]): string {
  const serviceNames = new Map(services.map((s) => [s.slug, s.shortName]));
  const doctorNames = new Map(doctors.map((d) => [d.slug, d.name]));

  const lines: string[] = [CSV_COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvCell(r.refCode),
        csvCell(r.name),
        csvCell(r.phone),
        csvCell(r.email),
        csvCell(r.date),
        csvCell(r.time),
        csvCell(r.doctorSlug ? doctorNames.get(r.doctorSlug) ?? r.doctorSlug : ""),
        csvCell(r.serviceSlug ? serviceNames.get(r.serviceSlug) ?? r.serviceSlug : ""),
        csvCell(r.status),
        csvCell(r.source),
        csvCell(dhakaIso(r.createdAt)),
      ].join(",")
    );
  }
  return `${lines.join("\r\n")}\r\n`;
}

/* ------------------------------------------------------------------ */
/*  Reviews CSV export (patient reviews moderation)                    */
/* ------------------------------------------------------------------ */

/** Shape needed to serialize a review row to CSV. */
export type CsvReviewRow = {
  id: string;
  name: string;
  phone: string | null;
  rating: number;
  serviceSlug: string | null;
  title: string | null;
  message: string;
  approved: boolean;
  createdAt: Date;
};

const REVIEW_CSV_COLUMNS = [
  "ID",
  "Name",
  "Phone",
  "Rating",
  "Service",
  "Title",
  "Message",
  "Status",
  "CreatedAt",
] as const;

/** Serialize patient reviews as CSV text (CRLF line endings, RFC 4180-style quoting). */
export function reviewsToCsv(rows: CsvReviewRow[]): string {
  const serviceNames = new Map(services.map((s) => [s.slug, s.shortName]));

  const lines: string[] = [REVIEW_CSV_COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvCell(r.id),
        csvCell(r.name),
        csvCell(r.phone),
        csvCell(r.rating),
        csvCell(r.serviceSlug ? serviceNames.get(r.serviceSlug) ?? r.serviceSlug : ""),
        csvCell(r.title),
        csvCell(r.message),
        csvCell(r.approved ? "APPROVED" : "PENDING"),
        csvCell(dhakaIso(r.createdAt)),
      ].join(",")
    );
  }
  return `${lines.join("\r\n")}\r\n`;
}
