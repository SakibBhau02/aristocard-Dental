"use client";

/* ------------------------------------------------------------------ */
/*  Integrations & Tracking panel (Configuration group, OWNER).         */
/*                                                                     */
/*  GET  /api/admin/integrations      → { integrations, role }. The     */
/*    bot token comes back MASKED ("••••") for non-OWNER reads — the    */
/*    form treats a masked value as “unchanged” and posts it back       */
/*    verbatim (the server keeps the stored secret).                    */
/*  POST /api/admin/integrations      → full config; replies            */
/*    400 { error, issues } on validation failure (surfaced inline).    */
/*  POST /api/admin/integrations/test → Telegram test message built     */
/*    from the CURRENT UNSAVED token/chat values (masked = saved one).  */
/*                                                                     */
/*  Pixels are injected into the public site only after SAVING — an     */
/*  empty field keeps that integration completely off.                  */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Eye,
  EyeOff,
  Inbox,
  LineChart,
  Loader2,
  Music4,
  RefreshCw,
  Send,
  ShieldCheck,
  Star,
  Tags,
  Target,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { IntegrationsConfig } from "@/lib/integrations";
import {
  PanelHeader,
  PanelSkeleton,
  SaveBar,
  useAdminFetch,
  useAdminToast,
  type PanelProps,
} from "../admin-shared";

/* ------------------------------------------------------------------ */
/*  Validation (mirrors src/lib/integrations.ts — client-side live)     */
/* ------------------------------------------------------------------ */

const GA4_RE = /^G-[A-Z0-9]{6,12}$/;
const GTM_RE = /^GTM-[A-Z0-9]{5,10}$/;
const FB_PIXEL_RE = /^\d{14,17}$/;
const TIKTOK_RE = /^[A-Z0-9]{15,25}$/;
const TELEGRAM_TOKEN_RE = /^\d{6,12}:[A-Za-z0-9_-]{30,60}$/;
const TELEGRAM_CHAT_RE = /^(-?\d{4,15}|@[A-Za-z0-9_]{4,32})$/;

/** Client-side issues mirroring the server's merged-config checks. */
function clientIssues(form: IntegrationsConfig, storedToken: string): string[] {
  const issues: string[] = [];
  if (form.ga4Id && !GA4_RE.test(form.ga4Id))
    issues.push("Google Analytics ID should look like G-ABC123DEF4.");
  if (form.gtmId && !GTM_RE.test(form.gtmId))
    issues.push("Tag Manager container ID should look like GTM-ABC1234.");
  if (form.fbPixelId && !FB_PIXEL_RE.test(form.fbPixelId))
    issues.push("Facebook Pixel ID must be 14–17 digits.");
  if (form.tiktokPixelId && !TIKTOK_RE.test(form.tiktokPixelId))
    issues.push("TikTok Pixel ID must be 15–25 letters/digits.");
  /* A masked token means "unchanged" — validate the stored secret. */
  const token = form.telegramBotToken.includes("•") ? storedToken : form.telegramBotToken;
  if (token && !TELEGRAM_TOKEN_RE.test(token))
    issues.push("Telegram bot token should look like 123456789:AAE… (copy it from @BotFather).");
  if (form.telegramChatId && !TELEGRAM_CHAT_RE.test(form.telegramChatId))
    issues.push("Telegram chat ID should be numeric (or @channelname).");
  if (form.telegramChatId && !token) issues.push("Add the bot token to use the chat ID.");
  if (token && !form.telegramChatId)
    issues.push("Add the chat ID to receive Telegram alerts.");
  return issues;
}

/* ------------------------------------------------------------------ */
/*  Local presentational atoms                                          */
/* ------------------------------------------------------------------ */

function clone(value: IntegrationsConfig): IntegrationsConfig {
  return JSON.parse(JSON.stringify(value)) as IntegrationsConfig;
}

function ErrorNote({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5"
    >
      <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-500" aria-hidden="true" />
      <div>
        <p className="text-sm font-bold text-rose-700">Something went wrong</p>
        <p className="mt-0.5 text-sm leading-relaxed text-rose-600">{message}</p>
      </div>
    </div>
  );
}

/** Server-side 400 {error, issues} surfaced inline after a failed save. */
function IssuesNote({ issues }: { issues: string[] }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-rose-700">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
        The server rejected these settings
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-9 text-sm leading-relaxed text-rose-600">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </div>
  );
}

/** Field-level status chip: green Connected / gray Not connected / rose Invalid. */
function StatusChip({ state }: { state: "connected" | "off" | "invalid" }) {
  const styles = {
    connected: { label: "Connected", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
    off: { label: "Not connected", chip: "bg-slate-50 text-slate-400 ring-slate-200", dot: "bg-slate-300" },
    invalid: { label: "Check format", chip: "bg-rose-50 text-rose-600 ring-rose-200", dot: "bg-rose-400" },
  } as const;
  const s = styles[state];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1",
        s.chip
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
}

/** Live (saved) status badge for the strip at the top of the panel. */
function LiveBadge({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      title={on ? `${label} is connected` : `${label} is not connected`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
        on
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-slate-50 text-slate-400 ring-slate-200"
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-emerald-500" : "bg-slate-300")}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

/** Collapsible 1–2 line "how to find this ID" hint. */
function HowToHint({ children }: { children: React.ReactNode }) {
  return (
    <Collapsible className="mt-2">
      <CollapsibleTrigger
        className={cn(
          "inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[11px] font-bold",
          "text-slate-400 transition-colors duration-200 hover:bg-blue-50/60 hover:text-brand-navy",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
        )}
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
        How to get this ID
        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300" aria-hidden="true" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="mt-1 border-l-2 border-blue-100 pl-3 text-xs leading-relaxed text-slate-400">
          {children}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ------------------------------------------------------------------ */
/*  Marketing pixel field model                                         */
/* ------------------------------------------------------------------ */

type PixelKey = "ga4Id" | "gtmId" | "fbPixelId" | "tiktokPixelId";

const PIXEL_FIELDS: {
  key: PixelKey;
  name: string;
  icon: LucideIcon;
  placeholder: string;
  re: RegExp;
  issue: string;
  maxLength: number;
  help: string;
}[] = [
  {
    key: "ga4Id",
    name: "Google Analytics 4",
    icon: LineChart,
    placeholder: "G-XXXXXXXXXX",
    re: GA4_RE,
    issue: "Google Analytics ID should look like G-ABC123DEF4.",
    maxLength: 14,
    help: "Google Analytics → Admin → Data streams → select your web stream → copy the Measurement ID.",
  },
  {
    key: "gtmId",
    name: "Google Tag Manager",
    icon: Tags,
    placeholder: "GTM-XXXXXXX",
    re: GTM_RE,
    issue: "Tag Manager container ID should look like GTM-ABC1234.",
    maxLength: 14,
    help: "Google Tag Manager → Admin → Container settings → copy the Container ID.",
  },
  {
    key: "fbPixelId",
    name: "Facebook (Meta) Pixel",
    icon: Target,
    placeholder: "123456789012345",
    re: FB_PIXEL_RE,
    issue: "Facebook Pixel ID must be 14–17 digits.",
    maxLength: 17,
    help: "Meta Events Manager → Data sources → your pixel → copy the 15–16 digit Pixel ID.",
  },
  {
    key: "tiktokPixelId",
    name: "TikTok Pixel",
    icon: Music4,
    placeholder: "CXXXXXXXXXXXXXXXXXXX",
    re: TIKTOK_RE,
    issue: "TikTok Pixel ID must be 15–25 letters/digits.",
    maxLength: 25,
    help: "TikTok Ads Manager → Events → Web events → Manage → copy the Pixel ID.",
  },
];

function PixelCard({
  field,
  value,
  disabled,
  onChange,
}: {
  field: (typeof PIXEL_FIELDS)[number];
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const trimmed = value.trim();
  const invalid = trimmed.length > 0 && !field.re.test(trimmed);
  const state: "connected" | "off" | "invalid" = invalid
    ? "invalid"
    : trimmed
      ? "connected"
      : "off";
  const Icon = field.icon;
  return (
    <div className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ice text-brand-navy ring-1 ring-blue-100">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <p className="font-heading min-w-0 flex-1 truncate text-sm font-bold text-brand-navy">
          {field.name}
        </p>
        <StatusChip state={state} />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        aria-label={field.name}
        maxLength={field.maxLength}
        disabled={disabled}
        spellCheck={false}
        autoComplete="off"
        className={cn(
          "mt-3.5 h-9 font-mono text-sm tracking-wide uppercase placeholder:font-sans placeholder:normal-case placeholder:tracking-normal",
          invalid
            ? "border-rose-300 bg-rose-50/40 focus-visible:border-rose-400 focus-visible:ring-rose-200/40"
            : "border-blue-100 bg-ice text-brand-navy focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
        )}
      />
      {invalid ? (
        <p
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {field.issue}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-slate-400">
          Leave empty to keep this pixel switched off.
        </p>
      )}
      <HowToHint>{field.help}</HowToHint>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Telegram event toggle row                                           */
/* ------------------------------------------------------------------ */

function EventToggle({
  icon: Icon,
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-blue-100 bg-ice/60 px-3.5 py-2.5">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-navy ring-1 ring-blue-100">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-brand-navy">{label}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
          {description}
        </span>
      </span>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={label}
        className="data-[state=checked]:bg-brand-navy"
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                               */
/* ------------------------------------------------------------------ */

export function IntegrationsPanel({ onSessionExpired }: PanelProps) {
  const { get, post, error, clearError } = useAdminFetch(onSessionExpired);
  const { ok, fail } = useAdminToast();

  const [snapshot, setSnapshot] = useState<IntegrationsConfig | null>(null);
  const [form, setForm] = useState<IntegrationsConfig | null>(null);
  const [role, setRole] = useState<"OWNER" | "EDITOR" | "VIEWER">("OWNER");
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadTick, setLoadTick] = useState(0);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [testNote, setTestNote] = useState("");
  const [serverIssues, setServerIssues] = useState<string[]>([]);

  /* Initial fetch (+ manual retry) — same shape as the settings panel. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await get<{ integrations: IntegrationsConfig; role?: string }>(
        "/api/admin/integrations"
      );
      if (cancelled) return;
      if (!data) {
        setLoadFailed(true);
        return;
      }
      setLoadFailed(false);
      setSnapshot(clone(data.integrations));
      setForm(clone(data.integrations));
      setServerIssues([]);
      setRole(
        data.role === "EDITOR" || data.role === "VIEWER" ? data.role : "OWNER"
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [get, loadTick]);

  const dirty = useMemo(
    () => (snapshot && form ? JSON.stringify(form) !== JSON.stringify(snapshot) : false),
    [snapshot, form]
  );

  /* Non-OWNER reads are read-only (the nav hides this module for them;
     this guards a mid-session role change). Server 403s mutations anyway. */
  const readOnly = role !== "OWNER";
  const telegramConnected = Boolean(snapshot?.telegramBotToken && snapshot?.telegramChatId);

  const set = useCallback(<K extends keyof IntegrationsConfig>(
    key: K,
    value: IntegrationsConfig[K]
  ) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }, []);

  async function save() {
    if (!form || !snapshot || saving) return;
    /* Live client-side gate (mirrors the server regexes). */
    const issues = clientIssues(form, snapshot.telegramBotToken);
    if (issues.length > 0) {
      setServerIssues([]);
      fail("Check the highlighted fields", issues[0]);
      return;
    }
    setSaving(true);
    const payload: IntegrationsConfig & { clearTelegramToken?: boolean } = { ...form };
    /* Clearing/emptying the token removes the bot on purpose. */
    if (!form.telegramBotToken && snapshot.telegramBotToken) {
      payload.clearTelegramToken = true;
    }
    const res = await post<{
      integrations?: IntegrationsConfig;
      message?: string;
      error?: string;
      issues?: string[];
    }>("/api/admin/integrations", payload);
    setSaving(false);
    if (res.ok && res.data?.integrations) {
      const saved = res.data.integrations;
      setSnapshot(clone(saved));
      setForm(clone(saved));
      setServerIssues([]);
      ok("Integrations saved", res.data.message ?? "Pixels and alerts are live on the public site.");
    } else {
      setServerIssues(
        res.data?.issues ??
          (res.data?.error ? [res.data.error] : ["Please check the fields and try again."])
      );
      fail("Could not save integrations", res.data?.error ?? "Please try again.");
    }
  }

  function reset() {
    if (snapshot) setForm(clone(snapshot));
    setServerIssues([]);
    setTestNote("");
    clearError();
  }

  /* Test button: sends with the CURRENT UNSAVED form values. A masked
     token is skipped so the server tests the stored secret instead. */
  async function sendTest() {
    if (!form || testing) return;
    setTesting(true);
    const payload: { message?: string; telegramBotToken?: string; telegramChatId?: string } = {};
    const note = testNote.trim();
    if (note) payload.message = note.slice(0, 300);
    const token = form.telegramBotToken.trim();
    if (!token.includes("•")) {
      if (token) payload.telegramBotToken = token;
      const chat = form.telegramChatId.trim();
      if (chat) payload.telegramChatId = chat;
    }
    const res = await post<{ success?: boolean; message?: string; error?: string }>(
      "/api/admin/integrations/test",
      payload
    );
    setTesting(false);
    if (res.ok) {
      ok("Test message sent", res.data?.message ?? "Check Telegram on your phone.");
    } else {
      fail("Test failed", res.data?.error ?? "The test message could not be sent.");
    }
  }

  const tokenInvalid =
    form &&
    form.telegramBotToken.trim().length > 0 &&
    !form.telegramBotToken.includes("•") &&
    !TELEGRAM_TOKEN_RE.test(form.telegramBotToken.trim());
  const chatInvalid =
    form && form.telegramChatId.trim().length > 0 && !TELEGRAM_CHAT_RE.test(form.telegramChatId.trim());

  /* ---- render ---- */

  if (!snapshot || !form) {
    if (loadFailed) {
      return (
        <div className="space-y-4">
          <PanelHeader title="Integrations & Tracking" />
          <ErrorNote message={error ?? "Could not load the integration settings."} />
          <div>
            <Button
              onClick={() => {
                setLoadFailed(false);
                clearError();
                setLoadTick((t) => t + 1);
              }}
              variant="outline"
              size="sm"
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        </div>
      );
    }
    return <PanelSkeleton />;
  }

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Integrations & Tracking"
        description="Connect marketing pixels, get Telegram alerts on your phone, and switch on privacy-safe first-party analytics."
      />
      {error ? <ErrorNote message={error} /> : null}
      {serverIssues.length > 0 ? <IssuesNote issues={serverIssues} /> : null}
      {readOnly ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5"
        >
          <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-500" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-amber-800">
            <span className="font-bold">Owner access required to make changes.</span> You are
            viewing the current setup read-only.
          </p>
        </div>
      ) : null}

      {/* ============ LIVE STATUS STRIP ============ */}
      <div className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Live status
          </span>
          <LiveBadge label="GA4" on={Boolean(snapshot.ga4Id)} />
          <LiveBadge label="GTM" on={Boolean(snapshot.gtmId)} />
          <LiveBadge label="Meta Pixel" on={Boolean(snapshot.fbPixelId)} />
          <LiveBadge label="TikTok" on={Boolean(snapshot.tiktokPixelId)} />
          <LiveBadge label="Telegram" on={telegramConnected} />
          <LiveBadge label="Analytics" on={snapshot.trackingEnabled} />
        </div>
        <p className="mt-3 border-t border-blue-50 pt-2.5 text-xs font-medium leading-relaxed text-slate-400">
          Pixels are injected into the public website only after you save — an empty field keeps
          that integration completely off.
        </p>
      </div>

      {/* ============ MARKETING PIXELS ============ */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PIXEL_FIELDS.map((field) => (
          <PixelCard
            key={field.key}
            field={field}
            value={form[field.key]}
            disabled={readOnly}
            onChange={(v) => set(field.key, v)}
          />
        ))}
      </div>

      {/* ============ TELEGRAM BOT ============ */}
      <div className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ice text-brand-navy ring-1 ring-blue-100">
            <Send className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-bold text-brand-navy">Telegram bot</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Instant alerts on your phone when patients book appointments, leave reviews or send
              messages.
            </p>
          </div>
          <StatusChip state={telegramConnected ? "connected" : "off"} />
        </div>

        <div className="mt-4 space-y-4">
          <div className="min-w-0">
            <label
              htmlFor="telegram-bot-token"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Bot token
            </label>
            <div className="relative mt-1.5">
              <Input
                id="telegram-bot-token"
                type={showToken ? "text" : "password"}
                value={form.telegramBotToken}
                onChange={(e) => set("telegramBotToken", e.target.value)}
                placeholder="123456789:AAE…  (from @BotFather)"
                aria-label="Telegram bot token"
                autoComplete="off"
                spellCheck={false}
                disabled={readOnly}
                className={cn(
                  "h-11 pr-24 font-mono text-sm",
                  tokenInvalid
                    ? "border-rose-300 bg-rose-50/40 focus-visible:border-rose-400 focus-visible:ring-rose-200/40"
                    : "border-blue-100 bg-ice text-brand-navy focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                )}
              />
              <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {form.telegramBotToken ? (
                  <button
                    type="button"
                    onClick={() => set("telegramBotToken", "")}
                    disabled={readOnly}
                    aria-label="Remove the saved bot token"
                    title="Remove the saved bot token (saves with the token cleared)"
                    className="inline-flex h-9 items-center gap-1 rounded-full bg-rose-50 px-2.5 text-[10px] font-bold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-100 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  aria-label={showToken ? "Hide the bot token" : "Show the bot token"}
                  title={showToken ? "Hide the bot token" : "Show the bot token"}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-blue-50 hover:text-brand-navy"
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            {tokenInvalid ? (
              <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Telegram bot token should look like 123456789:AAE… (copy it from @BotFather).
              </p>
            ) : (
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                {form.telegramBotToken.includes("•")
                  ? "A token is saved on the server — saving keeps it unchanged; “Remove” disconnects the bot."
                  : "From @BotFather — stored server-side only, never sent to visitors’ browsers."}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label
              htmlFor="telegram-chat-id"
              className="block text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Chat ID
            </label>
            <Input
              id="telegram-chat-id"
              value={form.telegramChatId}
              onChange={(e) => set("telegramChatId", e.target.value)}
              placeholder="e.g. 123456789 or @channelname"
              aria-label="Telegram chat ID"
              autoComplete="off"
              spellCheck={false}
              disabled={readOnly}
              className={cn(
                "mt-1.5 h-11 font-mono text-sm",
                chatInvalid
                  ? "border-rose-300 bg-rose-50/40 focus-visible:border-rose-400 focus-visible:ring-rose-200/40"
                  : "border-blue-100 bg-ice text-brand-navy focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
              )}
            />
            {chatInvalid ? (
              <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Telegram chat ID should be numeric (or @channelname).
              </p>
            ) : (
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                Where the alerts are delivered — your own id, a group, or a @channelname.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Send Telegram alerts for
            </p>
            <EventToggle
              icon={CalendarCheck}
              label="Appointments"
              description="The moment a patient requests an appointment."
              checked={form.telegramEvents.appointments}
              disabled={readOnly}
              onCheckedChange={(checked) =>
                set("telegramEvents", { ...form.telegramEvents, appointments: checked })
              }
            />
            <EventToggle
              icon={Star}
              label="New reviews"
              description="When a patient submits a review (awaiting approval)."
              checked={form.telegramEvents.reviews}
              disabled={readOnly}
              onCheckedChange={(checked) =>
                set("telegramEvents", { ...form.telegramEvents, reviews: checked })
              }
            />
            <EventToggle
              icon={Inbox}
              label="Contact messages"
              description="When a contact-form message arrives."
              checked={form.telegramEvents.messages}
              disabled={readOnly}
              onCheckedChange={(checked) =>
                set("telegramEvents", { ...form.telegramEvents, messages: checked })
              }
            />
          </div>

          {/* ---- test message ---- */}
          <div className="rounded-xl border border-blue-100 bg-ice/50 p-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Test the connection
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Sends with the values currently in the form — no need to save first.
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Input
                value={testNote}
                onChange={(e) => setTestNote(e.target.value)}
                placeholder="Custom note (optional)"
                aria-label="Optional custom note for the test message"
                maxLength={300}
                disabled={readOnly}
                className="h-11 min-w-0 flex-1 border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25 sm:w-56"
              />
              <Button
                type="button"
                onClick={() => void sendTest()}
                disabled={testing || readOnly}
                className="h-11 rounded-full bg-brand-navy px-5 font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                {testing ? "Sending…" : "Send test message"}
              </Button>
            </div>
          </div>

          <HowToHint>
            Message @BotFather on Telegram → <strong>/newbot</strong> → copy the bot token. Then
            send any message to your new bot once, and get the chat ID from @userinfobot (or the
            getUpdates API).
          </HowToHint>
        </div>
      </div>

      {/* ============ FIRST-PARTY ANALYTICS ============ */}
      <div className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ice text-brand-navy ring-1 ring-blue-100">
            <BarChart3 className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-bold text-brand-navy">
              First-party analytics
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Privacy-safe — no raw IP addresses are stored — and it powers the Analytics panel.
            </p>
          </div>
          <Switch
            checked={form.trackingEnabled}
            disabled={readOnly}
            onCheckedChange={(checked) => set("trackingEnabled", checked)}
            aria-label="First-party tracking enabled"
            className="data-[state=checked]:bg-brand-navy"
          />
        </div>
        <p className="mt-3 rounded-xl bg-ice/60 px-3.5 py-2.5 text-xs leading-relaxed text-slate-500">
          {form.trackingEnabled
            ? "Recording page views, searches, call/WhatsApp taps, booking clicks and form submissions server-side — visible to every staff member in the Analytics panel."
            : "Switched off — nothing is being recorded right now. Turn it on to power the Analytics panel."}
        </p>
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={reset}
        saveLabel="Save integrations"
      />

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
        Pixel IDs are public by design — the Telegram bot token stays server-side and never ships
        to the browser.
      </p>
    </div>
  );
}
