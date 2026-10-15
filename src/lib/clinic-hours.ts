/* ------------------------------------------------------------------ */
/*  Clinic hours — live open/closed status (Asia/Dhaka, UTC+6 fixed)   */
/*  Sat–Thu 10:00 AM – 9:00 PM • Friday closed (emergency on call)    */
/* ------------------------------------------------------------------ */

export const CLINIC_OPEN_MINUTES = 10 * 60; // 10:00 AM
export const CLINIC_CLOSE_MINUTES = 21 * 60; //  9:00 PM

/** JS weekdays: 0 = Sunday … 6 = Saturday. Friday (5) closed. */
const OPEN_DAYS = new Set([0, 1, 2, 3, 4, 6]);

export const WEEKDAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const WEEKDAYS_BN = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
] as const;

/** Week ordered the Bangladeshi way: Saturday → Friday. */
export const BD_WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5] as const;

export type ClinicStatus = {
  /** True when the clinic is currently receiving patients. */
  open: boolean;
  /** Minutes of day (Dhaka) — informational. */
  nowMinutes: number;
  /** JS weekday (Dhaka, 0 = Sunday). */
  nowDay: number;
  /** Close time in minutes-of-day — only when open. */
  closesMinutes: number | null;
  /** Next opening time in minutes-of-day (always 10:00 AM). */
  opensMinutes: number;
  /** JS weekday of the next opening. */
  opensDay: number;
  /** True when the next opening is later today. */
  opensIsToday: boolean;
};

const DHAKA_WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function dhakaNow(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  let day = 0;
  let hour = 0;
  let minute = 0;
  for (const p of parts) {
    if (p.type === "weekday") day = DHAKA_WEEKDAY_INDEX[p.value] ?? 0;
    else if (p.type === "hour") hour = Number(p.value) % 24; // "24" → 0
    else if (p.type === "minute") minute = Number(p.value);
  }
  return { day, minutes: hour * 60 + minute };
}

export function getClinicStatus(now: Date = new Date()): ClinicStatus {
  const { day, minutes } = dhakaNow(now);
  const isTodayOpen = OPEN_DAYS.has(day);
  const open = isTodayOpen && minutes >= CLINIC_OPEN_MINUTES && minutes < CLINIC_CLOSE_MINUTES;

  if (open) {
    return {
      open: true,
      nowMinutes: minutes,
      nowDay: day,
      closesMinutes: CLINIC_CLOSE_MINUTES,
      opensMinutes: CLINIC_OPEN_MINUTES,
      opensDay: day,
      opensIsToday: true,
    };
  }

  /* Find the next opening: today (if before 10 AM on an open day) or the coming days. */
  if (isTodayOpen && minutes < CLINIC_OPEN_MINUTES) {
    return {
      open: false,
      nowMinutes: minutes,
      nowDay: day,
      closesMinutes: null,
      opensMinutes: CLINIC_OPEN_MINUTES,
      opensDay: day,
      opensIsToday: true,
    };
  }
  for (let i = 1; i <= 7; i++) {
    const next = (day + i) % 7;
    if (OPEN_DAYS.has(next)) {
      return {
        open: false,
        nowMinutes: minutes,
        nowDay: day,
        closesMinutes: null,
        opensMinutes: CLINIC_OPEN_MINUTES,
        opensDay: next,
        opensIsToday: false,
      };
    }
  }
  /* Unreachable — OPEN_DAYS has 6 entries. */
  return {
    open: false,
    nowMinutes: minutes,
    nowDay: day,
    closesMinutes: null,
    opensMinutes: CLINIC_OPEN_MINUTES,
    opensDay: (day + 1) % 7,
    opensIsToday: false,
  };
}

/** "10:00 AM" / "9:00 PM" style from minutes-of-day (24h). */
export function formatTimeEn(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const suffix = h24 < 12 ? "AM" : "PM";
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "সকাল ১০টা" / "রাত ৯টা" style from minutes-of-day (24h). */
export function formatTimeBn(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const period =
    h24 < 4 ? "রাত" : h24 < 12 ? "সকাল" : h24 < 16 ? "দুপুর" : h24 < 18 ? "বিকাল" : "রাত";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const toBn = (n: number) => String(n).split("").map((c) => bnDigits[Number(c)] ?? c).join("");
  return `${period} ${toBn(h12)}টা`;
}

/** Is the given JS weekday currently "today" in Dhaka? */
export function isTodayInDhaka(weekday: number, now: Date = new Date()): boolean {
  return dhakaNow(now).day === weekday;
}
