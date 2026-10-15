import type { NextRequest } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  Integrations & Tracking — server-only core                         */
/*                                                                     */
/*  Admin-configured third-party connections (Facebook Pixel, Google    */
/*  Analytics 4, Tag Manager, TikTok Pixel, Telegram bot) stored in    */
/*  their own PageBlock row (key "integrations") so the secrets NEVER  */
/*  enter the public ContentBundle (settings are served publicly).     */
/*                                                                     */
/*  Also home of the first-party analytics recorder: server-side       */
/*  TrackingEvent rows that power the admin Analytics panel.           */
/* ------------------------------------------------------------------ */

export type TelegramEvents = {
  appointments: boolean;
  reviews: boolean;
  messages: boolean;
};

export type IntegrationsConfig = {
  /* Marketing pixels — IDs are public by nature (they ship in the HTML) */
  ga4Id: string; // G-XXXXXXXXXX
  gtmId: string; // GTM-XXXXXXX
  fbPixelId: string; // 15-16 digits
  tiktokPixelId: string; // 19-20 chars
  /* Telegram bot — bot token is a SECRET, never sent to the browser */
  telegramBotToken: string;
  telegramChatId: string; // numeric id or @channelusername
  telegramEvents: TelegramEvents;
  /* First-party analytics (TrackingEvent rows + admin Analytics panel) */
  trackingEnabled: boolean;
};

export function defaultIntegrations(): IntegrationsConfig {
  return {
    ga4Id: "",
    gtmId: "",
    fbPixelId: "",
    tiktokPixelId: "",
    telegramBotToken: "",
    telegramChatId: "",
    telegramEvents: { appointments: true, reviews: true, messages: true },
    trackingEnabled: true,
  };
}

/* ----------------------------- validation ------------------------------ */

export const GA4_RE = /^G-[A-Z0-9]{6,12}$/;
export const GTM_RE = /^GTM-[A-Z0-9]{5,10}$/;
export const FB_PIXEL_RE = /^\d{14,17}$/;
export const TIKTOK_RE = /^[A-Z0-9]{15,25}$/;
const TELEGRAM_TOKEN_RE = /^\d{6,12}:[A-Za-z0-9_-]{30,60}$/;
const TELEGRAM_CHAT_RE = /^(-?\d{4,15}|@[A-Za-z0-9_]{4,32})$/;

export function integrationIssues(cfg: IntegrationsConfig): string[] {
  const issues: string[] = [];
  if (cfg.ga4Id && !GA4_RE.test(cfg.ga4Id)) issues.push("Google Analytics ID should look like G-ABC123DEF4.");
  if (cfg.gtmId && !GTM_RE.test(cfg.gtmId)) issues.push("Tag Manager container ID should look like GTM-ABC1234.");
  if (cfg.fbPixelId && !FB_PIXEL_RE.test(cfg.fbPixelId)) issues.push("Facebook Pixel ID must be 14–17 digits.");
  if (cfg.tiktokPixelId && !TIKTOK_RE.test(cfg.tiktokPixelId)) issues.push("TikTok Pixel ID must be 15–25 letters/digits.");
  if (cfg.telegramBotToken && !TELEGRAM_TOKEN_RE.test(cfg.telegramBotToken))
    issues.push("Telegram bot token should look like 123456789:AAE… (copy it from @BotFather).");
  if (cfg.telegramChatId && !TELEGRAM_CHAT_RE.test(cfg.telegramChatId))
    issues.push("Telegram chat ID should be numeric (or @channelname).");
  if (cfg.telegramChatId && !cfg.telegramBotToken) issues.push("Add the bot token to use the chat ID.");
  if (cfg.telegramBotToken && !cfg.telegramChatId) issues.push("Add the chat ID to receive Telegram alerts.");
  return issues;
}

/** Defensive normalizer for whatever is stored/read. */
export function normalizeIntegrations(raw: Record<string, unknown> | null | undefined): IntegrationsConfig {
  const d = defaultIntegrations();
  if (!raw || typeof raw !== "object") return d;
  const ev = (raw.telegramEvents ?? {}) as Record<string, unknown>;
  const id = (v: unknown): string => (typeof v === "string" ? v.trim().slice(0, 80) : "");
  return {
    ga4Id: id(raw.ga4Id),
    gtmId: id(raw.gtmId),
    fbPixelId: id(raw.fbPixelId).replace(/\s/g, ""),
    tiktokPixelId: id(raw.tiktokPixelId).replace(/\s/g, ""),
    telegramBotToken: typeof raw.telegramBotToken === "string" ? raw.telegramBotToken.trim().slice(0, 100) : "",
    telegramChatId: id(raw.telegramChatId),
    telegramEvents: {
      appointments: typeof ev.appointments === "boolean" ? ev.appointments : true,
      reviews: typeof ev.reviews === "boolean" ? ev.reviews : true,
      messages: typeof ev.messages === "boolean" ? ev.messages : true,
    },
    trackingEnabled: typeof raw.trackingEnabled === "boolean" ? raw.trackingEnabled : true,
  };
}

/* ------------------------------ store ---------------------------------- */

const INTEGRATIONS_KEY = "integrations";

let cache: { cfg: IntegrationsConfig; at: number } | null = null;
const CACHE_TTL_MS = 5_000;

/** Live integrations config (5s in-process cache, like the content bundle). */
export async function getIntegrations(): Promise<IntegrationsConfig> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.cfg;
  let cfg = defaultIntegrations();
  try {
    const row = await db.pageBlock.findUnique({ where: { key: INTEGRATIONS_KEY } });
    if (row) {
      try {
        cfg = normalizeIntegrations(JSON.parse(row.dataJson));
      } catch {
        /* fall back to defaults */
      }
    }
  } catch (err) {
    console.error("[integrations] DB read failed:", err);
  }
  cache = { cfg, at: Date.now() };
  return cfg;
}

/** Persist config (admin save). Bypasses the read cache. */
export async function saveIntegrations(cfg: IntegrationsConfig): Promise<void> {
  await db.pageBlock.upsert({
    where: { key: INTEGRATIONS_KEY },
    create: { key: INTEGRATIONS_KEY, dataJson: JSON.stringify(cfg) },
    update: { dataJson: JSON.stringify(cfg) },
  });
  cache = { cfg, at: Date.now() };
}

/** Mask the bot token for non-OWNER reads. */
export function maskIntegrations(cfg: IntegrationsConfig): IntegrationsConfig {
  if (!cfg.telegramBotToken) return { ...cfg };
  const t = cfg.telegramBotToken;
  const head = t.slice(0, Math.min(6, t.indexOf(":") + 1));
  return { ...cfg, telegramBotToken: `${head}${"•".repeat(8)}${t.slice(-4)}` };
}

/* --------------------------- Telegram sender --------------------------- */

export type TelegramResult = { ok: boolean; error?: string };

function escapeHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Send one HTML message through the configured bot. Never throws. */
export async function sendTelegram(text: string): Promise<TelegramResult> {
  const cfg = await getIntegrations();
  return sendTelegramWith(cfg, text);
}

/** Variant with an explicit config (used by the admin test button). */
export async function sendTelegramWith(
  cfg: IntegrationsConfig,
  text: string
): Promise<TelegramResult> {
  if (!cfg.telegramBotToken || !cfg.telegramChatId) {
    return { ok: false, error: "Telegram is not configured — add the bot token and chat ID first." };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${cfg.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cfg.telegramChatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (res.ok && data?.ok) return { ok: true };
    return {
      ok: false,
      error:
        data?.description ||
        `Telegram API responded with HTTP ${res.status}. Check the bot token and chat ID.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Could not reach Telegram (${msg}).` };
  }
}

/** Fire-and-forget wrapper for request paths that must never slow down. */
export function notifyTelegram(text: string): void {
  void sendTelegram(text).then((r) => {
    if (!r.ok) console.warn("[telegram] notification failed:", r.error);
  });
}

const SITE_URL = "https://aristocratdentalcarebd.com";
const ADMIN_URL = `${SITE_URL}/admin`;

/* ---- formatted clinic notifications (the owner's phone alerts) ---- */

export function telegramAppointmentMessage(a: {
  refCode: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  serviceSlug?: string | null;
  doctorSlug?: string | null;
  notes?: string | null;
}): string {
  const line = (k: string, v: string) => (v ? `\n<b>${k}:</b> ${escapeHtml(v)}` : "");
  return (
    `🦷 <b>New Appointment Request</b>\nAristocrat Dental Care` +
    line("Patient", a.name) +
    line("Phone", a.phone) +
    line("Date", a.date) +
    line("Time", a.time) +
    line("Treatment", a.serviceSlug ?? "") +
    line("Doctor", a.doctorSlug ?? "") +
    line("Notes", a.notes ?? "") +
    line("Ref", a.refCode) +
    `\n\nConfirm it in the admin panel:\n${ADMIN_URL}`
  );
}

export function telegramRescheduleMessage(a: {
  refCode: string;
  name: string;
  phone: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  serviceSlug?: string | null;
  doctorSlug?: string | null;
  notes?: string | null;
}): string {
  const line = (k: string, v: string) => (v ? `\n<b>${k}:</b> ${escapeHtml(v)}` : "");
  return (
    `🔁 <b>Appointment RESCHEDULED</b>\nAristocrat Dental Care` +
    line("Patient", a.name) +
    line("Phone", a.phone) +
    `\n<b>Old slot:</b> ${escapeHtml(a.oldDate)} · ${escapeHtml(a.oldTime)}` +
    `\n<b>New slot:</b> ${escapeHtml(a.newDate)} · ${escapeHtml(a.newTime)}` +
    line("Treatment", a.serviceSlug ?? "") +
    line("Doctor", a.doctorSlug ?? "") +
    line("Notes", a.notes ?? "") +
    line("Ref", a.refCode) +
    `\n\nSee it in the admin panel:\n${ADMIN_URL}`
  );
}

export function telegramReviewMessage(r: {
  name: string;
  rating: number;
  title?: string | null;
  message: string;
}): string {
  const stars = "★".repeat(Math.max(1, Math.min(5, r.rating)));
  return (
    `⭐ <b>New Patient Review (awaiting approval)</b>\nAristocrat Dental Care` +
    `\n<b>From:</b> ${escapeHtml(r.name)} · ${stars}` +
    (r.title ? `\n<b>Title:</b> ${escapeHtml(r.title)}` : "") +
    `\n\n${escapeHtml(r.message.slice(0, 500))}` +
    `\n\nModerate it in the admin panel:\n${ADMIN_URL}`
  );
}

export function telegramMessageMessage(m: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}): string {
  const line = (k: string, v: string) => (v ? `\n<b>${k}:</b> ${escapeHtml(v)}` : "");
  return (
    `✉️ <b>New Contact Message</b>\nAristocrat Dental Care` +
    line("From", m.name) +
    line("Email", m.email) +
    line("Phone", m.phone ?? "") +
    line("Subject", m.subject ?? "") +
    `\n\n${escapeHtml(m.message.slice(0, 500))}` +
    `\n\nReply from the admin panel:\n${ADMIN_URL}`
  );
}

/* -------------------- first-party analytics recorder -------------------- */

export const TRACK_TYPES = new Set([
  "page_view",
  "search",
  "cta_call",
  "cta_whatsapp",
  "booking_click",
  "language",
  "appointment_booked",
  "appointment_rescheduled",
  "message_sent",
  "review_submitted",
  "newsletter_signup",
] as const);

const IP_SALT = "adc-first-party-2026";
const SESSION_RE = /^[A-Za-z0-9_-]{6,64}$/;

export function detectDevice(ua: string | null): string {
  if (!ua) return "unknown";
  if (/bot|crawler|spider|crawling|headless/i.test(ua)) return "bot";
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))|Kindle/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "mobile";
  return "desktop";
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(`${IP_SALT}:${ip}`).digest("hex").slice(0, 16);
}

export type TrackInput = {
  type: string;
  path?: string | null;
  label?: string | null;
  session?: string | null;
  referrer?: string | null;
  meta?: Record<string, unknown> | null;
};

/** Insert one TrackingEvent row (respects the trackingEnabled switch). */
export async function recordTrackingEvent(
  req: NextRequest,
  input: TrackInput
): Promise<boolean> {
  try {
    const cfg = await getIntegrations();
    if (!cfg.trackingEnabled) return false;
    if (!TRACK_TYPES.has(input.type as (typeof TRACK_TYPES extends Set<infer T> ? T : never))) return false;

    const clean = (v: unknown, max: number): string | null => {
      if (typeof v !== "string") return null;
      const t = v.trim();
      return t.length ? t.slice(0, max) : null;
    };
    const session = clean(input.session, 64);
    const meta =
      input.meta && typeof input.meta === "object"
        ? JSON.stringify(input.meta).slice(0, 500)
        : "{}";

    await db.trackingEvent.create({
      data: {
        type: input.type,
        path: clean(input.path, 200),
        label: clean(input.label, 200),
        metaJson: meta,
        session: session && SESSION_RE.test(session) ? session : null,
        device: detectDevice(req.headers.get("user-agent")),
        referrer: clean(input.referrer, 300),
        ipHash: hashIp(getClientIpSafe(req)),
      },
    });
    return true;
  } catch (err) {
    console.error("[track] failed to record event:", err);
    return false;
  }
}

function getClientIpSafe(req: NextRequest): string {
  try {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) {
      const first = fwd.split(",")[0]?.trim();
      if (first) return first;
    }
    return req.headers.get("x-real-ip")?.trim() || "local";
  } catch {
    return "local";
  }
}

/* ------------------------------------------------------------------ */
/*  Request-path helpers — one call per public form submission.        */
/*  Records the first-party event AND fires the Telegram alert when    */
/*  the admin has that event type enabled. Never throws.               */
/* ------------------------------------------------------------------ */

export async function notifyAppointmentBooked(
  req: NextRequest,
  a: {
    refCode: string;
    name: string;
    phone: string;
    date: string;
    time: string;
    serviceSlug?: string | null;
    doctorSlug?: string | null;
    notes?: string | null;
  }
): Promise<void> {
  try {
    await recordTrackingEvent(req, {
      type: "appointment_booked",
      label: a.refCode,
      meta: { service: a.serviceSlug ?? null, doctor: a.doctorSlug ?? null, date: a.date, time: a.time },
    });
  } catch {
    /* analytics must never break a booking */
  }
  try {
    const cfg = await getIntegrations();
    if (cfg.telegramEvents.appointments && cfg.telegramBotToken && cfg.telegramChatId) {
      notifyTelegram(telegramAppointmentMessage(a));
    }
  } catch {
    /* ignore */
  }
}

export async function notifyAppointmentRescheduled(
  req: NextRequest,
  a: {
    refCode: string;
    name: string;
    phone: string;
    oldDate: string;
    oldTime: string;
    newDate: string;
    newTime: string;
    serviceSlug?: string | null;
    doctorSlug?: string | null;
    notes?: string | null;
  }
): Promise<void> {
  try {
    await recordTrackingEvent(req, {
      type: "appointment_rescheduled",
      label: a.refCode,
      meta: {
        service: a.serviceSlug ?? null,
        doctor: a.doctorSlug ?? null,
        oldDate: a.oldDate,
        oldTime: a.oldTime,
        date: a.newDate,
        time: a.newTime,
      },
    });
  } catch {
    /* analytics must never break a reschedule */
  }
  try {
    const cfg = await getIntegrations();
    if (cfg.telegramEvents.appointments && cfg.telegramBotToken && cfg.telegramChatId) {
      notifyTelegram(telegramRescheduleMessage(a));
    }
  } catch {
    /* ignore */
  }
}

export async function notifyReviewSubmitted(
  req: NextRequest,
  r: { name: string; rating: number; title?: string | null; message: string }
): Promise<void> {
  try {
    await recordTrackingEvent(req, {
      type: "review_submitted",
      label: `${r.rating}★ ${r.name}`.slice(0, 200),
      meta: { rating: r.rating },
    });
  } catch {
    /* ignore */
  }
  try {
    const cfg = await getIntegrations();
    if (cfg.telegramEvents.reviews && cfg.telegramBotToken && cfg.telegramChatId) {
      notifyTelegram(telegramReviewMessage(r));
    }
  } catch {
    /* ignore */
  }
}

export async function notifyMessageSent(
  req: NextRequest,
  m: { name: string; email: string; phone?: string | null; subject?: string | null; message: string }
): Promise<void> {
  try {
    await recordTrackingEvent(req, { type: "message_sent", label: m.subject ?? m.name });
  } catch {
    /* ignore */
  }
  try {
    const cfg = await getIntegrations();
    if (cfg.telegramEvents.messages && cfg.telegramBotToken && cfg.telegramChatId) {
      notifyTelegram(telegramMessageMessage(m));
    }
  } catch {
    /* ignore */
  }
}

export async function notifyNewsletterSignup(req: NextRequest): Promise<void> {
  try {
    await recordTrackingEvent(req, { type: "newsletter_signup" });
  } catch {
    /* ignore */
  }
}
