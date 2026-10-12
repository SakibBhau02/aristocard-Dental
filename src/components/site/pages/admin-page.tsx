"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Ban,
  BarChart3,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Inbox,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Mails,
  MessageSquareQuote,
  Phone,
  PieChart,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { usePageMeta } from "@/lib/router";
import { services } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  ADMIN — session-cookie-protected staff dashboard (#/admin)          */
/*  Six modules: Overview · Appointments · Reviews · Messages ·         */
/*  Subscribers · Patients. Staff use only, not indexed.                */
/*  Auth: POST /api/admin/login sets an httpOnly session cookie (8h);    */
/*  the passcode itself never persists client-side.                     */
/* ------------------------------------------------------------------ */

type AppointmentRow = {
  id: number;
  refCode: string;
  name: string;
  phone: string;
  email: string | null;
  date: string;
  time: string;
  doctorSlug: string | null;
  serviceSlug: string | null;
  notes: string | null;
  status: string;
  source: string | null;
  createdAt: string;
};

type Stats = {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  today: number;
  upcoming: number;
};

type ReviewRow = {
  id: string;
  name: string;
  phone: string | null;
  rating: number;
  serviceSlug: string | null;
  title: string | null;
  message: string;
  approved: boolean;
  createdAt: string;
};

type ReviewStats = {
  total: number;
  pending: number;
  approved: number;
  average: number;
};

type OverviewData = {
  appointmentStats: Stats;
  reviewStats: {
    total: number;
    pendingApproval: number;
    approved: number;
    avgRating: number;
  };
  messageStats: { total: number; unhandled: number };
  subscriberStats: { total: number };
  patientStats: { total: number };
  trend: { date: string; count: number }[];
  topServices: { slug: string; name: string; count: number }[];
  generatedAt: string;
};

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
};

type MessageStats = {
  total: number;
  unhandled: number;
  handled: number;
  today: number;
};

type SubscriberRow = {
  id: string;
  email: string;
  createdAt: string;
};

type SubscriberStats = {
  total: number;
  last7Days: number;
  last30Days: number;
};

type PatientRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  appointmentCount: number;
};

type PatientStats = {
  total: number;
  newThisWeek: number;
  withAppointments: number;
};

type PatientDetail = {
  patient: PatientRow;
  appointments: AppointmentRow[];
};

type AdminView =
  | "overview"
  | "appointments"
  | "reviews"
  | "messages"
  | "subscribers"
  | "patients";
type ReviewFilter = "ALL" | "PENDING" | "APPROVED";
type MessageFilter = "ALL" | "NEW" | "HANDLED";

const LEGACY_SESSION_KEY = "adc-admin-code"; /* pre-session era; cleared on boot */
type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

/* --- date-range presets (computed client-side, staff's local timezone) --- */
type DatePreset = "all" | "today" | "next7" | "next30" | "past30" | "custom";

function toIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function localToday(): string {
  return toIsoDate(new Date());
}
function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
}

const DATE_PRESETS: {
  id: Exclude<DatePreset, "custom">;
  label: string;
  range: () => [string, string];
}[] = [
  { id: "all", label: "All time", range: () => ["", ""] },
  { id: "today", label: "Today", range: () => [localToday(), localToday()] },
  { id: "next7", label: "Next 7 days", range: () => [localToday(), addDaysIso(localToday(), 6)] },
  { id: "next30", label: "Next 30 days", range: () => [localToday(), addDaysIso(localToday(), 29)] },
  { id: "past30", label: "Past 30 days", range: () => [addDaysIso(localToday(), -29), localToday()] },
];

/* --- auth state: "checking" (restoring session) | "locked" | "open" --- */

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-blue-50 text-brand-blue ring-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-600 ring-rose-200",
};

/* --- small shared helpers for the newer modules ------------------- */

/** "Oct 12, 2026" from an ISO date or full timestamp. */
function prettyDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Oct 12, 2026 · 4:26 PM" from an ISO timestamp. */
function prettyStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${prettyDay(iso)} · ${d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

/** "3 days ago" style relative label (best-effort, local clock). */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} wk ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.round(months / 12)} yr ago`;
}

/** "Mon 29" chart label from a YYYY-MM-DD date. */
function chartDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  const weekday = dt.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
  });
  return `${weekday} ${d}`;
}

/** Avatar initials, e.g. "Demo Patient" → "DP". */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

/** SVG rect path with rounded TOP corners only (for the trend bars). */
function topRoundedBarPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): string {
  const rr = Math.min(r, h / 2, w / 2);
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    `L ${x + w - rr} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `L ${x + w} ${y + h}`,
    "Z",
  ].join(" ");
}

/** Shared CSV download for the newer panels — mirrors the appointments
    export flow; the filename comes from Content-Disposition. */
async function downloadCsvFile(
  path: string,
  fallbackName: string
): Promise<"ok" | "unauthorized" | "error"> {
  try {
    const res = await fetch(path);
    if (res.status === 401) return "unauthorized";
    if (!res.ok) return "error";
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const filename =
      /filename="([^"]+)"/.exec(disposition)?.[1] ?? fallbackName;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return "ok";
  } catch {
    return "error";
  }
}

export function AdminPage() {
  usePageMeta({
    title: "Admin — Staff Dashboard",
    description: "Staff-only clinic management dashboard.",
  });

  /* noindex for this back-office page */
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    meta.dataset.adminNoindex = "true";
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);

  const [authState, setAuthState] = useState<"checking" | "locked" | "open">(
    "checking"
  );

  /* Restore an existing cookie session (and clear any legacy
     pre-session-era key) — the passcode is never re-sent or stored. */
  useEffect(() => {
    try {
      sessionStorage.removeItem(LEGACY_SESSION_KEY);
    } catch {
      /* ignore */
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/session");
        if (!cancelled) setAuthState(res.ok ? "open" : "locked");
      } catch {
        if (!cancelled) setAuthState("locked");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* clearing the local state matters more than the network call */
    }
    setAuthState("locked");
  }, []);

  if (authState === "checking") return <AdminBoot />;

  return authState === "open" ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <AdminGate onUnlock={() => setAuthState("open")} />
  );
}

/* ------------------------------------------------------------------ */
/*  Boot state while restoring the cookie session                        */
/* ------------------------------------------------------------------ */

function AdminBoot() {
  return (
    <div className="hero-mesh flex flex-1 items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-lg shadow-navy-900/30">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-slate-500">Checking your session…</p>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Passcode gate                                                       */
/* ------------------------------------------------------------------ */

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (checking) return;
    setError(null);
    setChecking(true);
    try {
      /* The passcode travels once, in this request body — the server
         responds with an httpOnly session cookie that does the rest. */
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value.trim() }),
      });
      if (res.status === 401) {
        setError("Incorrect passcode. Please try again.");
        return;
      }
      if (res.status === 429) {
        setError("Too many attempts. Please wait a few minutes and try again.");
        return;
      }
      if (!res.ok) throw new Error("Server error");
      onUnlock();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="hero-mesh flex flex-1 items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <form
          onSubmit={handleSubmit}
          className="card-shine rounded-[2rem] border border-blue-100 bg-white p-8 shadow-[0_24px_60px_-24px_rgba(0,32,96,0.35)] sm:p-10"
        >
          <div className="flex items-center justify-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-navy text-white shadow-lg shadow-navy-900/30">
              <Lock className="h-7 w-7" aria-hidden="true" />
            </span>
          </div>
          <h1 className="font-heading mt-6 text-center text-2xl font-bold text-brand-navy">
            Staff Access Only
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
            Enter the clinic admin passcode to manage appointments. This area is
            for Aristocrat Dental Care staff.
          </p>

          <label htmlFor="admin-code" className="sr-only">
            Admin passcode
          </label>
          <input
            id="admin-code"
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Admin passcode"
            className="mt-7 h-13 w-full rounded-2xl border border-blue-100 bg-ice px-5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
          />

          {error && (
            <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600 ring-1 ring-rose-100">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={checking || value.trim().length === 0}
            className="mt-5 h-12 w-full rounded-2xl bg-brand-navy text-sm font-bold text-white shadow-lg shadow-navy-900/25 hover:bg-brand-blue disabled:opacity-60"
          >
            {checking ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
            )}
            Unlock Dashboard
          </Button>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-400">
            You'll stay signed in for 8 hours on this device. Demo passcode:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
              aristocrat-2026
            </code>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard — shell with section tabs                                 */
/*  Overview · Appointments · Reviews · Messages · Subscribers ·         */
/*  Patients. Tab buttons carry live badge counts (pending / awaiting /  */
/*  unhandled) fetched once per refresh from /api/admin/overview.        */
/* ------------------------------------------------------------------ */

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<AdminView>("overview");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [appointmentsPending, setAppointmentsPending] = useState<
    number | null
  >(null);
  const [reviewsPending, setReviewsPending] = useState<number | null>(null);
  const [messagesUnhandled, setMessagesUnhandled] = useState<number | null>(
    null
  );
  const handleExpired = useCallback(() => setSessionExpired(true), []);

  /* One light call carries every tab-badge count before the staff member
     opens each view. (Cookie auth — no header.) */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/overview");
        if (res.status === 401) {
          setSessionExpired(true);
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data) return;
        setAppointmentsPending(data.appointmentStats?.pending ?? 0);
        setReviewsPending(data.reviewStats?.pendingApproval ?? 0);
        setMessagesUnhandled(data.messageStats?.unhandled ?? 0);
      } catch {
        /* badges are best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* keeps all three badges in sync whenever the Overview tab refreshes */
  const syncBadges = useCallback(
    (appointments: number, reviews: number, messages: number) => {
      setAppointmentsPending(appointments);
      setReviewsPending(reviews);
      setMessagesUnhandled(messages);
    },
    []
  );

  if (sessionExpired) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="max-w-md rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-amber-600" aria-hidden="true" />
          <h2 className="font-heading mt-4 text-lg font-bold text-amber-900">
            Session expired
          </h2>
          <p className="mt-2 text-sm text-amber-800">
            Your session ended (it expires after 8 hours for security).
            Please sign in again to continue.
          </p>
          <Button onClick={onLogout} className="mt-5 rounded-full bg-amber-600 hover:bg-amber-700">
            Back to sign-in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-wash min-h-screen flex-1 pb-20">
      {/* Section tabs */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Dashboard sections">
          <DashboardTab
            active={view === "overview"}
            onClick={() => setView("overview")}
            Icon={LayoutDashboard}
          >
            Overview
          </DashboardTab>
          <DashboardTab
            active={view === "appointments"}
            onClick={() => setView("appointments")}
            Icon={CalendarDays}
            badge={appointmentsPending}
          >
            Appointments
          </DashboardTab>
          <DashboardTab
            active={view === "reviews"}
            onClick={() => setView("reviews")}
            Icon={Star}
            badge={reviewsPending}
          >
            Reviews
          </DashboardTab>
          <DashboardTab
            active={view === "messages"}
            onClick={() => setView("messages")}
            Icon={Inbox}
            badge={messagesUnhandled}
          >
            Messages
          </DashboardTab>
          <DashboardTab
            active={view === "subscribers"}
            onClick={() => setView("subscribers")}
            Icon={Mails}
          >
            Subscribers
          </DashboardTab>
          <DashboardTab
            active={view === "patients"}
            onClick={() => setView("patients")}
            Icon={Users}
          >
            Patients
          </DashboardTab>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {view === "overview" ? (
            <OverviewPanel
              onLogout={onLogout}
              onSessionExpired={handleExpired}
              onNavigate={setView}
              onBadgeCounts={syncBadges}
            />
          ) : view === "appointments" ? (
            <AppointmentsPanel
              onLogout={onLogout}
              onSessionExpired={handleExpired}
              onPendingChange={setAppointmentsPending}
            />
          ) : view === "reviews" ? (
            <ReviewsPanel
              onLogout={onLogout}
              onSessionExpired={handleExpired}
              onPendingChange={setReviewsPending}
            />
          ) : view === "messages" ? (
            <MessagesPanel
              onLogout={onLogout}
              onSessionExpired={handleExpired}
              onUnhandledChange={setMessagesUnhandled}
            />
          ) : view === "subscribers" ? (
            <SubscribersPanel
              onLogout={onLogout}
              onSessionExpired={handleExpired}
            />
          ) : (
            <PatientsPanel
              onLogout={onLogout}
              onSessionExpired={handleExpired}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DashboardTab({
  active,
  onClick,
  Icon,
  badge,
  children,
}: {
  active: boolean;
  onClick: () => void;
  Icon: typeof CalendarDays;
  badge?: number | null;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-300",
        active
          ? "bg-brand-navy text-white shadow-lg shadow-navy-900/25"
          : "bg-white/90 text-slate-600 ring-1 ring-blue-100 hover:text-brand-navy hover:ring-blue-200"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {children}
      {typeof badge === "number" && badge > 0 && (
        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-amber-700">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Overview view — cross-module KPIs, 14-day trend, status mix         */
/*  (the default landing tab after unlocking)                           */
/* ------------------------------------------------------------------ */

function OverviewPanel({
  onLogout,
  onSessionExpired,
  onNavigate,
  onBadgeCounts,
}: {
  onLogout: () => void;
  onSessionExpired: () => void;
  onNavigate: (view: AdminView) => void;
  onBadgeCounts: (appointments: number, reviews: number, messages: number) => void;
}) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const loadIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++loadIdRef.current;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/overview");
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      if (requestId !== loadIdRef.current) return; /* a newer request is in flight */
      setData(json);
      setLastUpdated(new Date());
      onBadgeCounts(
        json.appointmentStats?.pending ?? 0,
        json.reviewStats?.pendingApproval ?? 0,
        json.messageStats?.unhandled ?? 0
      );
    } catch (err) {
      if (requestId !== loadIdRef.current) return;
      setLoadError(err instanceof Error ? err.message : "Failed to load the overview.");
    } finally {
      if (requestId === loadIdRef.current) setLoading(false);
    }
  }, [onSessionExpired, onBadgeCounts]);

  useEffect(() => {
    load();
  }, [load]);

  /* auto-refresh every 60s (pause when tab hidden) */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  const kpis = data
    ? [
        { label: "Today's appointments", value: data.appointmentStats.today, Icon: CalendarClock, tone: "text-brand-navy bg-ice ring-blue-100" },
        { label: "Upcoming", value: data.appointmentStats.upcoming, Icon: CalendarRange, tone: "text-brand-blue bg-blue-50 ring-blue-100" },
        { label: "Pending confirmations", value: data.appointmentStats.pending, Icon: Clock, tone: "text-amber-700 bg-amber-50 ring-amber-100" },
        { label: "Unhandled messages", value: data.messageStats.unhandled, Icon: Inbox, tone: "text-rose-600 bg-rose-50 ring-rose-100" },
        { label: "Reviews to approve", value: data.reviewStats.pendingApproval, Icon: Star, tone: "text-amber-700 bg-amber-50 ring-amber-100" },
        { label: "Registered patients", value: data.patientStats.total, Icon: Users, tone: "text-emerald-700 bg-emerald-50 ring-emerald-100" },
        { label: "Newsletter subscribers", value: data.subscriberStats.total, Icon: Mails, tone: "text-brand-navy bg-blue-50 ring-blue-100" },
      ]
    : [];

  const trendTotal = data?.trend.reduce((sum, d) => sum + d.count, 0) ?? 0;
  const maxServiceCount = data?.topServices[0]?.count ?? 0;

  const jumps: {
    view: AdminView;
    title: string;
    desc: string;
    count: number;
    countLabel: string;
    pillTone: string;
    Icon: typeof CalendarDays;
    tone: string;
    showZero?: boolean;
  }[] = data
    ? [
        {
          view: "appointments",
          title: "Appointments",
          desc: "Bookings & schedules",
          count: data.appointmentStats.pending,
          countLabel: "pending",
          pillTone: "bg-amber-100 text-amber-700",
          Icon: CalendarDays,
          tone: "text-brand-navy bg-ice ring-blue-100",
        },
        {
          view: "reviews",
          title: "Reviews",
          desc:
            data.reviewStats.avgRating > 0
              ? `Avg rating ${data.reviewStats.avgRating.toFixed(1)}/5`
              : "Moderate reviews",
          count: data.reviewStats.pendingApproval,
          countLabel: "awaiting",
          pillTone: "bg-amber-100 text-amber-700",
          Icon: Star,
          tone: "text-amber-700 bg-amber-50 ring-amber-100",
        },
        {
          view: "messages",
          title: "Messages",
          desc: "Contact-form inbox",
          count: data.messageStats.unhandled,
          countLabel: "unhandled",
          pillTone: "bg-rose-100 text-rose-600",
          Icon: Inbox,
          tone: "text-rose-600 bg-rose-50 ring-rose-100",
        },
        {
          view: "subscribers",
          title: "Subscribers",
          desc: "Newsletter list",
          count: data.subscriberStats.total,
          countLabel: "total",
          pillTone: "bg-blue-100 text-brand-blue",
          Icon: Mails,
          tone: "text-brand-blue bg-blue-50 ring-blue-100",
          showZero: true,
        },
        {
          view: "patients",
          title: "Patients",
          desc: "Portal accounts",
          count: data.patientStats.total,
          countLabel: "accounts",
          pillTone: "bg-emerald-100 text-emerald-700",
          Icon: Users,
          tone: "text-emerald-700 bg-emerald-50 ring-emerald-100",
          showZero: true,
        },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div className="hero-mesh-dark noise relative mt-6 overflow-hidden">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Staff Console
            </span>
            <h1 className="font-heading mt-3 text-2xl font-bold text-white sm:text-3xl">
              Clinic Overview
            </h1>
            <p className="mt-1 text-sm text-blue-100/80">
              {lastUpdated
                ? `Last updated ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} • auto-refreshes every 60s`
                : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={load}
              disabled={loading}
              variant="outline"
              className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" />
              Refresh
            </Button>
            <Button
              onClick={onLogout}
              className="rounded-full bg-white text-brand-navy hover:bg-blue-100"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* KPI stats */}
        <div className="-mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {kpis.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-[0_14px_36px_-20px_rgba(0,32,96,0.25)]"
            >
              <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1", s.tone)}>
                <s.Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <p className="font-heading mt-2.5 text-2xl font-bold tabular-nums text-brand-navy">
                {s.value}
              </p>
              <p className="text-[11px] font-semibold uppercase leading-snug tracking-wider text-slate-400">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {loadError && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
            {loadError}
          </p>
        )}

        {loading && !data ? (
          <div className="mt-8 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" aria-hidden="true" />
          </div>
        ) : !data ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 rounded-3xl border border-dashed border-blue-200 bg-white/60 py-20 text-center"
          >
            <LayoutDashboard className="mx-auto h-10 w-10 text-blue-300" aria-hidden="true" />
            <p className="font-heading mt-4 text-lg font-bold text-brand-navy">
              Could not load the overview
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {loadError ?? "Something went wrong."} Please try again in a moment.
            </p>
            <Button
              onClick={load}
              variant="outline"
              className="mt-5 rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Trend chart + status breakdown */}
            <div className="mt-8 grid gap-4 lg:grid-cols-5">
              <section
                className="min-w-0 rounded-2xl border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 lg:col-span-3"
                aria-label="Bookings created over the last 14 days"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <div>
                    <h2 className="font-heading flex items-center gap-2 text-base font-bold text-brand-navy">
                      <BarChart3 className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                      Bookings created — last {data.trend.length || 14} days
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {trendTotal} new booking{trendTotal === 1 ? "" : "s"} since{" "}
                      {prettyDay(data.trend[0]?.date ?? localToday())}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-[4px] bg-brand-navy" aria-hidden="true" />
                      Bookings
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-[4px] bg-brand-blue" aria-hidden="true" />
                      Today
                    </span>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto scroll-area">
                  {data.trend.length > 0 ? (
                    <TrendChart trend={data.trend} />
                  ) : (
                    <p className="py-10 text-center text-sm text-slate-400">
                      No booking activity in this period yet.
                    </p>
                  )}
                </div>
              </section>

              <section
                className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2"
                aria-label="Appointment status breakdown"
              >
                <h2 className="font-heading flex items-center gap-2 text-base font-bold text-brand-navy">
                  <PieChart className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                  Appointment status
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {data.appointmentStats.total} booking{data.appointmentStats.total === 1 ? "" : "s"} across all time
                </p>
                <StatusBreakdown stats={data.appointmentStats} />
              </section>
            </div>

            {/* Top services */}
            <section
              className="mt-4 rounded-2xl border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6"
              aria-label="Top services"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <h2 className="font-heading flex items-center gap-2 text-base font-bold text-brand-navy">
                  <Sparkles className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                  Top services
                </h2>
                <p className="text-xs text-slate-500">Most-requested treatments across all bookings</p>
              </div>
              {data.topServices.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">
                  No bookings yet — the most-requested services will appear here.
                </p>
              ) : (
                <ul className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.topServices.map((s, i) => (
                    <li key={`${s.slug}-${i}`} className="flex flex-col">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-brand-navy">
                          <span
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold tabular-nums text-brand-blue ring-1 ring-blue-100"
                            aria-hidden="true"
                          >
                            {i + 1}
                          </span>
                          <span className="truncate">{s.name}</span>
                        </p>
                        <span className="shrink-0 text-xs font-bold tabular-nums text-slate-500">
                          {s.count} booking{s.count === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div
                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-50"
                        role="progressbar"
                        aria-label={`${s.name}: ${s.count} of ${maxServiceCount} bookings`}
                        aria-valuemin={0}
                        aria-valuemax={maxServiceCount}
                        aria-valuenow={s.count}
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand-blue"
                          style={{
                            width: `${maxServiceCount > 0 ? (s.count / maxServiceCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Quick jump */}
            <section className="mt-8" aria-label="Quick jump">
              <div>
                <h2 className="font-heading text-base font-bold text-brand-navy">Quick jump</h2>
                <p className="mt-0.5 text-xs text-slate-500">Switch straight to a management module</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {jumps.map((j) => (
                  <button
                    key={j.view}
                    type="button"
                    onClick={() => onNavigate(j.view)}
                    className="group flex items-center gap-3 rounded-2xl border border-blue-100/70 bg-white p-4 text-left shadow-[0_14px_36px_-20px_rgba(0,32,96,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_44px_-20px_rgba(0,32,96,0.35)]"
                  >
                    <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1", j.tone)}>
                      <j.Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-heading text-sm font-bold text-brand-navy">{j.title}</span>
                        {(j.showZero || j.count > 0) && (
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums", j.pillTone)}>
                            {j.count} {j.countLabel}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">{j.desc}</span>
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-blue"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/* --- hand-rolled inline SVG bar chart (no chart libraries) --- */

function TrendChart({ trend }: { trend: { date: string; count: number }[] }) {
  const todayIso = localToday();
  const max = Math.max(1, ...trend.map((d) => d.count));
  const STEP = 40;
  const BAR_W = 26;
  const BASE = 118;
  const CHART_H = 88;
  const HEIGHT = 152;
  const width = STEP * trend.length;
  const total = trend.reduce((sum, d) => sum + d.count, 0);

  return (
    <svg
      viewBox={`0 0 ${width} ${HEIGHT}`}
      className="h-auto w-full min-w-[28rem]"
      role="img"
      aria-label={`Bookings created per day over the last ${trend.length} days — ${total} in total.`}
    >
      <title>{`Bookings created per day — ${total} bookings in the last ${trend.length} days`}</title>
      {/* half-height guide + baseline */}
      <line x1="0" y1={BASE - CHART_H / 2} x2={width} y2={BASE - CHART_H / 2} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 6" />
      <line x1="0" y1={BASE} x2={width} y2={BASE} stroke="#cbd5e1" strokeWidth="1.5" />
      {trend.map((d, i) => {
        const x = i * STEP + (STEP - BAR_W) / 2;
        const isToday = d.date === todayIso;
        const barH = d.count > 0 ? Math.max(10, Math.round((d.count / max) * CHART_H)) : 3;
        const y = BASE - barH;
        return (
          <g key={d.date} className="cursor-default transition-opacity duration-200 hover:opacity-75">
            <title>{`${prettyDay(d.date)} — ${d.count} booking${d.count === 1 ? "" : "s"}${isToday ? " · today" : ""}`}</title>
            {d.count > 0 && (
              <text x={x + BAR_W / 2} y={y - 7} textAnchor="middle" fontSize="10" fontWeight="700" className="fill-brand-navy">
                {d.count}
              </text>
            )}
            <path
              d={topRoundedBarPath(x, y, BAR_W, barH, 5)}
              className={cn(
                d.count === 0 ? "fill-blue-200" : isToday ? "fill-brand-blue" : "fill-brand-navy"
              )}
            />
            <text
              x={x + BAR_W / 2}
              y={BASE + 18}
              textAnchor="middle"
              fontSize="10"
              fontWeight={isToday ? 700 : 500}
              className={isToday ? "fill-brand-blue" : "fill-slate-500"}
            >
              {chartDayLabel(d.date)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* --- horizontal segmented status bar with legend counts --- */

function StatusBreakdown({ stats }: { stats: Stats }) {
  const segs = [
    { key: "PENDING", label: "Pending", value: stats.pending, bar: "bg-amber-400", dot: "bg-amber-400", text: "text-amber-700" },
    { key: "CONFIRMED", label: "Confirmed", value: stats.confirmed, bar: "bg-brand-blue", dot: "bg-brand-blue", text: "text-brand-blue" },
    { key: "COMPLETED", label: "Completed", value: stats.completed, bar: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-700" },
    { key: "CANCELLED", label: "Cancelled", value: stats.cancelled, bar: "bg-rose-400", dot: "bg-rose-400", text: "text-rose-600" },
  ];
  const total = stats.total;
  return (
    <div className="mt-5">
      <div
        className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70"
        role="img"
        aria-label={`Appointment status breakdown of ${total} bookings: ${segs
          .map((s) => `${s.value} ${s.label.toLowerCase()}`)
          .join(", ")}.`}
      >
        {total > 0 &&
          segs
            .filter((s) => s.value > 0)
            .map((s) => {
              const pct = (s.value / total) * 100;
              return (
                <div
                  key={s.key}
                  className={cn("h-full transition-all duration-500", s.bar)}
                  style={{ width: `${pct}%` }}
                  title={`${s.label}: ${s.value} (${pct.toFixed(0)}%)`}
                />
              );
            })}
      </div>
      {total === 0 && (
        <p className="mt-3 text-xs text-slate-400">
          No bookings yet — the breakdown fills in as bookings arrive.
        </p>
      )}
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {segs.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", s.dot)} aria-hidden="true" />
            <span className="text-xs font-medium text-slate-500">{s.label}</span>
            <span className={cn("ml-auto font-heading text-sm font-bold tabular-nums", s.text)}>{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Appointments view                                                   */
/* ------------------------------------------------------------------ */

function AppointmentsPanel({
  onLogout,
  onSessionExpired,
  onPendingChange,
}: {
  onLogout: () => void;
  onSessionExpired: () => void;
  onPendingChange?: (pending: number) => void;
}) {
  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [preset, setPreset] = useState<DatePreset>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [range, setRange] = useState<{
    from: string | null;
    to: string | null;
    label: string;
    total: number;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const loadIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++loadIdRef.current;
    setLoading(true);
    setLoadError(null);
    try {
      const qs = new URLSearchParams();
      if (fromDate) qs.set("from", fromDate);
      if (toDate) qs.set("to", toDate);
      const query = qs.toString();
      const res = await fetch(
        `/api/admin/appointments${query ? `?${query}` : ""}`
      );
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      if (requestId !== loadIdRef.current) return; /* a newer request is in flight */
      setRows(data.appointments ?? []);
      setStats(data.stats ?? null);
      setRange(data.range ?? null);
      setLastUpdated(new Date());
      /* keep the tab badge live — but only while the list is unfiltered, since
         the server scopes stats to the active date range */
      if (!fromDate && !toDate) onPendingChange?.(data.stats?.pending ?? 0);
    } catch (err) {
      if (requestId !== loadIdRef.current) return;
      setLoadError(err instanceof Error ? err.message : "Failed to load appointments.");
    } finally {
      if (requestId === loadIdRef.current) setLoading(false);
    }
  }, [fromDate, toDate, onSessionExpired, onPendingChange]);

  useEffect(() => {
    load();
  }, [load]);

  /* auto-refresh every 60s (pause when tab hidden) */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  async function updateStatus(refCode: string, status: string) {
    setBusyRef(refCode);
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refCode, status }),
      });
      const data = await res.json();
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      if (!res.ok) throw new Error(data.error || "Update failed");
      setRows((prev) =>
        prev.map((r) => (r.refCode === refCode ? { ...r, status } : r))
      );
      /* keep the tab badge in sync with the new pending count (unfiltered
         view only — rows/stats follow the active date range otherwise) */
      if (!fromDate && !toDate)
        onPendingChange?.(
          rows.filter(
            (r) => (r.refCode === refCode ? status : r.status) === "PENDING"
          ).length
        );
      setStats((prev) => {
        if (!prev) return prev;
        const statusOf = (r: AppointmentRow) =>
          r.refCode === refCode ? status : r.status;
        const today = localToday();
        return {
          ...prev,
          pending: rows.filter((r) => statusOf(r) === "PENDING").length,
          confirmed: rows.filter((r) => statusOf(r) === "CONFIRMED").length,
          completed: rows.filter((r) => statusOf(r) === "COMPLETED").length,
          cancelled: rows.filter((r) => statusOf(r) === "CANCELLED").length,
          today: rows.filter((r) => r.date === today && statusOf(r) !== "CANCELLED").length,
          upcoming: rows.filter(
            (r) => r.date >= today && (statusOf(r) === "PENDING" || statusOf(r) === "CONFIRMED")
          ).length,
        };
      });
    } catch {
      setLoadError("Could not update status. Please retry.");
    } finally {
      setBusyRef(null);
    }
  }

  /* --- date-range filtering --- */
  function applyPreset(id: Exclude<DatePreset, "custom">) {
    const p = DATE_PRESETS.find((d) => d.id === id) ?? DATE_PRESETS[0];
    const [f, t] = p.range();
    setPreset(id);
    setFromDate(f);
    setToDate(t);
  }

  function onFromDateChange(value: string) {
    setFromDate(value);
    setPreset(value || toDate ? "custom" : "all");
  }

  function onToDateChange(value: string) {
    setToDate(value);
    setPreset(fromDate || value ? "custom" : "all");
  }

  const invalidRange = Boolean(fromDate && toDate && fromDate > toDate);

  /* --- CSV export of the currently filtered set --- */
  async function exportCsv() {
    if (exporting) return;
    setExporting(true);
    try {
      const qs = new URLSearchParams({ format: "csv" });
      if (fromDate) qs.set("from", fromDate);
      if (toDate) qs.set("to", toDate);
      if (filter !== "ALL") qs.set("status", filter);
      const res = await fetch(`/api/admin/appointments?${qs.toString()}`);
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filename =
        /filename="([^"]+)"/.exec(disposition)?.[1] ?? "appointments.csv";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setLoadError("Could not export the CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  const serviceMap = useMemo(() => {
    const m: Record<string, string> = {};
    services.forEach((s) => (m[s.slug] = s.shortName));
    return m;
  }, []);
  const doctorMap = useMemo(() => {
    const m: Record<string, string> = {};
    doctors.forEach((doc) => (m[doc.slug] = doc.name));
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "ALL" && r.status !== filter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.refCode.toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const statCards = stats
    ? [
        { label: "Total", value: stats.total, Icon: Inbox, tone: "text-brand-navy bg-blue-50 ring-blue-100" },
        { label: "Pending", value: stats.pending, Icon: Clock, tone: "text-amber-700 bg-amber-50 ring-amber-100" },
        { label: "Confirmed", value: stats.confirmed, Icon: BadgeCheck, tone: "text-brand-blue bg-blue-50 ring-blue-100" },
        { label: "Completed", value: stats.completed, Icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50 ring-emerald-100" },
        { label: "Cancelled", value: stats.cancelled, Icon: Ban, tone: "text-rose-600 bg-rose-50 ring-rose-100" },
        { label: "Today", value: stats.today, Icon: CalendarClock, tone: "text-brand-navy bg-ice ring-blue-100" },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div className="hero-mesh-dark noise relative mt-6 overflow-hidden">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Staff Console
            </span>
            <h1 className="font-heading mt-3 text-2xl font-bold text-white sm:text-3xl">
              Appointment Dashboard
            </h1>
            <p className="mt-1 text-sm text-blue-100/80">
              {lastUpdated
                ? `Last updated ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} • auto-refreshes every 60s`
                : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={load}
              disabled={loading}
              variant="outline"
              className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" />
              Refresh
            </Button>
            <Button
              onClick={onLogout}
              className="rounded-full bg-white text-brand-navy hover:bg-blue-100"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Stats */}
        <div className="-mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-[0_14px_36px_-20px_rgba(0,32,96,0.25)]"
            >
              <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1", s.tone)}>
                <s.Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <p className="font-heading mt-2.5 text-2xl font-bold tabular-nums text-brand-navy">
                {s.value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stat cards reflect the active date range */}
        <AnimatePresence mode="wait">
          <motion.p
            key={range ? range.label : "all-time"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400"
          >
            {range ? `Stat cards · ${range.label}` : "Stat cards · all time"}
          </motion.p>
        </AnimatePresence>

        {/* Toolbar */}
        <div className="mt-8 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by status">
            {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as StatusFilter[]).map((f) => {
              const active = filter === f;
              const count =
                f === "ALL" ? rows.length : rows.filter((r) => r.status === f).length;
              return (
                <button
                  key={f}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-xs font-bold transition-all duration-300",
                    active
                      ? "bg-brand-navy text-white shadow-md shadow-navy-900/25"
                      : "bg-blue-50/70 text-slate-600 hover:bg-blue-100/80 hover:text-brand-navy"
                  )}
                >
                  {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                      active ? "bg-white/20 text-white" : "bg-white text-slate-500"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone or ref…"
              aria-label="Search appointments"
              className="h-11 w-full rounded-full border border-blue-100 bg-ice pl-10 pr-4 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
            />
          </div>
          </div>

          {/* Date-range filter row */}
          <div className="my-4 border-t border-blue-100/70" aria-hidden="true" />
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
                Dates
              </span>
              {DATE_PRESETS.map((p) => {
                const active = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => applyPreset(p.id)}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-bold transition-all duration-300",
                      active
                        ? "bg-brand-blue text-white shadow-md shadow-blue-500/30 ring-2 ring-brand-blue/40"
                        : "bg-blue-50/70 text-slate-600 hover:bg-blue-100/80 hover:text-brand-navy"
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <label htmlFor="admin-from-date" className="sr-only">
                  From date
                </label>
                <input
                  id="admin-from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => onFromDateChange(e.target.value)}
                  aria-label="Show appointments from this date"
                  className="h-11 w-[8.75rem] rounded-xl border border-blue-100 bg-ice px-3 text-[13px] font-medium tabular-nums text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
                />
                <span className="text-xs font-bold text-slate-300" aria-hidden="true">
                  →
                </span>
                <label htmlFor="admin-to-date" className="sr-only">
                  To date
                </label>
                <input
                  id="admin-to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => onToDateChange(e.target.value)}
                  aria-label="Show appointments up to this date"
                  className="h-11 w-[8.75rem] rounded-xl border border-blue-100 bg-ice px-3 text-[13px] font-medium tabular-nums text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
                />
              </div>
              <Button
                type="button"
                onClick={exportCsv}
                disabled={exporting}
                title="Download the currently filtered appointments as a CSV file"
                className="h-11 rounded-full bg-brand-gold px-5 text-sm font-bold text-brand-navy shadow-md shadow-amber-500/30 hover:bg-amber-400 disabled:opacity-60"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                Export CSV
              </Button>
            </div>
          </div>

          {invalidRange && (
            <p className="mt-3 text-xs font-medium text-rose-600">
              The “From” date is after the “To” date — no appointments can match this range.
            </p>
          )}
        </div>

        {/* Active range indicator */}
        <AnimatePresence>
          {range && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              role="status"
              className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-2xl border border-amber-200/80 bg-brand-gold-soft/50 px-4 py-3 shadow-sm"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                <CalendarRange className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <p className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-heading text-base font-bold tabular-nums text-brand-navy">
                  {range.total}
                </span>{" "}
                appointment{range.total === 1 ? "" : "s"} in range{" "}
                <span className="font-semibold text-brand-navy">{range.label}</span>
              </p>
              <button
                type="button"
                onClick={() => applyPreset("all")}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-600 ring-1 ring-amber-200 transition-all duration-300 hover:text-rose-600 hover:ring-rose-200"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear filter
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {loadError && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
            {loadError}
          </p>
        )}

        {/* List */}
        {loading && rows.length === 0 ? (
          <div className="mt-8 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" aria-hidden="true" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 rounded-3xl border border-dashed border-blue-200 bg-white/60 py-20 text-center"
          >
            <CalendarDays className="mx-auto h-10 w-10 text-blue-300" aria-hidden="true" />
            <p className="font-heading mt-4 text-lg font-bold text-brand-navy">
              {rows.length === 0 && range
                ? "No appointments in this date range"
                : "No appointments found"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {rows.length === 0 && range
                ? "No bookings fall inside the selected date range. Try widening it or clear the filter."
                : rows.length === 0
                  ? "New online bookings will appear here in real time."
                  : "Try a different filter or search term."}
            </p>
            {rows.length === 0 && range && (
              <Button
                onClick={() => applyPreset("all")}
                variant="outline"
                className="mt-5 rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Clear date filter
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_14px_40px_-24px_rgba(0,32,96,0.25)] lg:block">
              <div className="max-h-[38rem] overflow-y-auto scroll-area">
                <table className="w-full text-left text-sm table-zebra">
                  <thead className="sticky top-0 z-10 bg-ice/95 backdrop-blur">
                    <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                      <th scope="col" className="px-5 py-3.5 font-semibold">Patient</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Service / Doctor</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Schedule</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Status</th>
                      <th scope="col" className="px-5 py-3.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {filtered.map((r) => (
                      <tr key={r.id} className="transition-colors hover:bg-blue-50/40">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-brand-navy">{r.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{r.phone}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-slate-400">{r.refCode}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-slate-700">
                            {r.serviceSlug ? serviceMap[r.serviceSlug] ?? r.serviceSlug : "—"}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {r.doctorSlug ? doctorMap[r.doctorSlug] ?? r.doctorSlug : "Any available doctor"}
                          </p>
                          {r.notes && (
                            <p className="mt-1 line-clamp-1 max-w-56 text-[11px] italic text-slate-400" title={r.notes}>
                              “{r.notes}”
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold tabular-nums text-slate-700">{r.date}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{r.time}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ring-1",
                            statusStyles[r.status] ?? "bg-slate-50 text-slate-600 ring-slate-200"
                          )}>
                            {r.status === "PENDING" && (
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
                            )}
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {busyRef === r.refCode ? (
                              <Loader2 className="h-4 w-4 animate-spin text-brand-blue" aria-hidden="true" />
                            ) : (
                              <>
                                {r.status === "PENDING" && (
                                  <>
                                    <SmallAction
                                      label="Confirm"
                                      tone="confirm"
                                      onClick={() => updateStatus(r.refCode, "CONFIRMED")}
                                    />
                                    <SmallAction
                                      label="Cancel"
                                      tone="cancel"
                                      onClick={() => updateStatus(r.refCode, "CANCELLED")}
                                    />
                                  </>
                                )}
                                {r.status === "CONFIRMED" && (
                                  <>
                                    <SmallAction
                                      label="Complete"
                                      tone="complete"
                                      onClick={() => updateStatus(r.refCode, "COMPLETED")}
                                    />
                                    <SmallAction
                                      label="Cancel"
                                      tone="cancel"
                                      onClick={() => updateStatus(r.refCode, "CANCELLED")}
                                    />
                                  </>
                                )}
                                {(r.status === "COMPLETED" || r.status === "CANCELLED") && (
                                  <SmallAction
                                    label="Reopen"
                                    tone="neutral"
                                    onClick={() => updateStatus(r.refCode, "PENDING")}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="mt-6 space-y-3 lg:hidden">
              {filtered.map((r) => (
                <motion.article
                  key={r.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-navy">{r.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{r.phone}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-400">{r.refCode}</p>
                    </div>
                    <span className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ring-1",
                      statusStyles[r.status] ?? "bg-slate-50 text-slate-600 ring-slate-200"
                    )}>
                      {r.status === "PENDING" && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
                      )}
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-ice px-3.5 py-3 text-xs text-slate-600">
                    <p className="col-span-2">
                      <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                      {r.serviceSlug ? serviceMap[r.serviceSlug] ?? r.serviceSlug : "Service: —"}
                      {r.doctorSlug ? ` • ${doctorMap[r.doctorSlug] ?? r.doctorSlug}` : ""}
                    </p>
                    <p className="col-span-2 font-semibold tabular-nums">
                      <CalendarDays className="mr-1.5 inline h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                      {r.date} • {r.time}
                    </p>
                    {r.notes && (
                      <p className="col-span-2 line-clamp-2 italic text-slate-400">“{r.notes}”</p>
                    )}
                  </div>
                  {busyRef === r.refCode ? (
                    <div className="mt-3 flex justify-center py-1.5">
                      <Loader2 className="h-4 w-4 animate-spin text-brand-blue" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.status === "PENDING" && (
                        <>
                          <SmallAction label="Confirm" tone="confirm" onClick={() => updateStatus(r.refCode, "CONFIRMED")} />
                          <SmallAction label="Cancel" tone="cancel" onClick={() => updateStatus(r.refCode, "CANCELLED")} />
                        </>
                      )}
                      {r.status === "CONFIRMED" && (
                        <>
                          <SmallAction label="Complete" tone="complete" onClick={() => updateStatus(r.refCode, "COMPLETED")} />
                          <SmallAction label="Cancel" tone="cancel" onClick={() => updateStatus(r.refCode, "CANCELLED")} />
                        </>
                      )}
                      {(r.status === "COMPLETED" || r.status === "CANCELLED") && (
                        <SmallAction label="Reopen as Pending" tone="neutral" onClick={() => updateStatus(r.refCode, "PENDING")} />
                      )}
                    </div>
                  )}
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reviews view — patient review moderation                            */
/* ------------------------------------------------------------------ */

function StarsRow({ value }: { value: number }) {
  return (
    <span role="img" aria-label={`${value} out of 5 stars`} className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5",
            i < value ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
          )}
        />
      ))}
    </span>
  );
}

function ReviewsPanel({
  onLogout,
  onSessionExpired,
  onPendingChange,
}: {
  onLogout: () => void;
  onSessionExpired: () => void;
  onPendingChange: (n: number) => void;
}) {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReviewFilter>("ALL");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const loadIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++loadIdRef.current;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      if (requestId !== loadIdRef.current) return; /* a newer request is in flight */
      setRows(data.reviews ?? []);
      setStats(data.stats ?? null);
      setLastUpdated(new Date());
      onPendingChange(data.stats?.pending ?? 0);
    } catch (err) {
      if (requestId !== loadIdRef.current) return;
      setLoadError(err instanceof Error ? err.message : "Failed to load reviews.");
    } finally {
      if (requestId === loadIdRef.current) setLoading(false);
    }
  }, [onSessionExpired, onPendingChange]);

  useEffect(() => {
    load();
  }, [load]);

  /* auto-refresh every 60s (pause when tab hidden) */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  async function reviewAction(id: string, action: "approve" | "reject" | "delete") {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      if (!res.ok) throw new Error(data.error || "Update failed");
      /* the server is the source of truth — refresh rows, stats and the tab badge */
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not update the review.");
    } finally {
      setBusyId(null);
    }
  }

  /* --- CSV export of every review --- */
  async function exportCsv() {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/reviews?format=csv`);
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filename =
        /filename="([^"]+)"/.exec(disposition)?.[1] ?? "reviews.csv";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setLoadError("Could not export the CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  const serviceMap = useMemo(() => {
    const m: Record<string, string> = {};
    services.forEach((s) => (m[s.slug] = s.shortName));
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "ALL" && (filter === "PENDING") === r.approved) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q);
    });
  }, [rows, filter, search]);

  const statCards = stats
    ? [
        { label: "Total", value: stats.total, Icon: Inbox, tone: "text-brand-navy bg-blue-50 ring-blue-100" },
        { label: "Pending", value: stats.pending, Icon: Clock, tone: "text-amber-700 bg-amber-50 ring-amber-100" },
        { label: "Approved", value: stats.approved, Icon: BadgeCheck, tone: "text-emerald-700 bg-emerald-50 ring-emerald-100" },
        {
          label: "Avg rating",
          value: stats.average > 0 ? stats.average.toFixed(1) : "—",
          Icon: Star,
          tone: "text-amber-700 bg-amber-50 ring-amber-100",
        },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div className="hero-mesh-dark noise relative mt-6 overflow-hidden">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Staff Console
            </span>
            <h1 className="font-heading mt-3 text-2xl font-bold text-white sm:text-3xl">
              Review Moderation
            </h1>
            <p className="mt-1 text-sm text-blue-100/80">
              {lastUpdated
                ? `Last updated ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} • auto-refreshes every 60s`
                : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={load}
              disabled={loading}
              variant="outline"
              className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" />
              Refresh
            </Button>
            <Button
              onClick={onLogout}
              className="rounded-full bg-white text-brand-navy hover:bg-blue-100"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Stats */}
        <div className="-mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-[0_14px_36px_-20px_rgba(0,32,96,0.25)]"
            >
              <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1", s.tone)}>
                <s.Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <p className="font-heading mt-2.5 text-2xl font-bold tabular-nums text-brand-navy">
                {s.value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-8 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter reviews by status">
              {(["ALL", "PENDING", "APPROVED"] as ReviewFilter[]).map((f) => {
                const active = filter === f;
                const count =
                  f === "ALL"
                    ? rows.length
                    : rows.filter((r) => (f === "PENDING") !== r.approved).length;
                return (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-xs font-bold transition-all duration-300",
                      active
                        ? "bg-brand-navy text-white shadow-md shadow-navy-900/25"
                        : "bg-blue-50/70 text-slate-600 hover:bg-blue-100/80 hover:text-brand-navy"
                    )}
                  >
                    {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                    <span
                      className={cn(
                        "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                        active ? "bg-white/20 text-white" : "bg-white text-slate-500"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-72 sm:flex-none">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name…"
                  aria-label="Search reviews"
                  className="h-11 w-full rounded-full border border-blue-100 bg-ice pl-10 pr-4 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
                />
              </div>
              <Button
                type="button"
                onClick={exportCsv}
                disabled={exporting}
                title="Download every review as a CSV file"
                className="h-11 rounded-full bg-brand-gold px-5 text-sm font-bold text-brand-navy shadow-md shadow-amber-500/30 hover:bg-amber-400 disabled:opacity-60"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {loadError && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
            {loadError}
          </p>
        )}

        {/* List */}
        {loading && rows.length === 0 ? (
          <div className="mt-8 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" aria-hidden="true" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 rounded-3xl border border-dashed border-blue-200 bg-white/60 py-20 text-center"
          >
            <MessageSquareQuote className="mx-auto h-10 w-10 text-blue-300" aria-hidden="true" />
            <p className="font-heading mt-4 text-lg font-bold text-brand-navy">
              {rows.length === 0 ? "No reviews yet" : "No reviews found"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {rows.length === 0
                ? "Patient reviews submitted on the website will appear here for approval."
                : "Try a different filter or search term."}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_14px_40px_-24px_rgba(0,32,96,0.25)] lg:block">
              <div className="max-h-[38rem] overflow-y-auto scroll-area">
                <table className="w-full text-left text-sm table-zebra">
                  <thead className="sticky top-0 z-10 bg-ice/95 backdrop-blur">
                    <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                      <th scope="col" className="px-5 py-3.5 font-semibold">Patient</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Review</th>
                      <th scope="col" className="px-5 py-3.5 font-semibold">Status</th>
                      <th scope="col" className="px-5 py-3.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        className={cn(
                          "transition-colors hover:bg-blue-50/40",
                          !r.approved && "bg-amber-50/50"
                        )}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-brand-navy">{r.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{r.phone ?? "—"}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <StarsRow value={r.rating} />
                          {r.title && (
                            <p className="mt-1 text-xs font-semibold text-brand-navy">
                              {r.title}
                            </p>
                          )}
                          <p className="mt-1 line-clamp-2 max-w-md text-xs leading-relaxed text-slate-500" title={r.message}>
                            {r.message}
                          </p>
                          {r.serviceSlug && (
                            <span className="mt-1.5 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-brand-blue ring-1 ring-blue-100">
                              <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
                              {serviceMap[r.serviceSlug] ?? r.serviceSlug}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ring-1",
                              r.approved
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : "bg-amber-50 text-amber-700 ring-amber-200"
                            )}
                          >
                            {!r.approved && (
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
                            )}
                            {r.approved ? "APPROVED" : "PENDING"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {busyId === r.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-brand-blue" aria-hidden="true" />
                            ) : (
                              <>
                                {!r.approved && (
                                  <SmallAction
                                    label="Approve"
                                    tone="confirm"
                                    onClick={() => reviewAction(r.id, "approve")}
                                  />
                                )}
                                {r.approved && (
                                  <SmallAction
                                    label="Reject"
                                    tone="warn"
                                    onClick={() => reviewAction(r.id, "reject")}
                                  />
                                )}
                                <SmallAction
                                  label="Delete"
                                  tone="cancel"
                                  onClick={() => reviewAction(r.id, "delete")}
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="mt-6 space-y-3 lg:hidden">
              {filtered.map((r) => (
                <motion.article
                  key={r.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-2xl border border-blue-100 bg-white p-4 shadow-sm",
                    !r.approved && "ring-2 ring-amber-200"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-navy">{r.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{r.phone ?? "—"}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ring-1",
                        r.approved
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200"
                      )}
                    >
                      {!r.approved && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
                      )}
                      {r.approved ? "APPROVED" : "PENDING"}
                    </span>
                  </div>
                  <div className="mt-3 rounded-xl bg-ice px-3.5 py-3">
                    <StarsRow value={r.rating} />
                    {r.title && (
                      <p className="mt-1 text-xs font-semibold text-brand-navy">{r.title}</p>
                    )}
                    <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-slate-500">
                      {r.message}
                    </p>
                    {r.serviceSlug && (
                      <span className="mt-2 inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-blue ring-1 ring-blue-100">
                        <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
                        {serviceMap[r.serviceSlug] ?? r.serviceSlug}
                      </span>
                    )}
                  </div>
                  {busyId === r.id ? (
                    <div className="mt-3 flex justify-center py-1.5">
                      <Loader2 className="h-4 w-4 animate-spin text-brand-blue" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!r.approved && (
                        <SmallAction label="Approve" tone="confirm" onClick={() => reviewAction(r.id, "approve")} />
                      )}
                      {r.approved && (
                        <SmallAction label="Reject" tone="warn" onClick={() => reviewAction(r.id, "reject")} />
                      )}
                      <SmallAction label="Delete" tone="cancel" onClick={() => reviewAction(r.id, "delete")} />
                    </div>
                  )}
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Messages view — contact-form inbox                                  */
/* ------------------------------------------------------------------ */

function MessagesPanel({
  onLogout,
  onSessionExpired,
  onUnhandledChange,
}: {
  onLogout: () => void;
  onSessionExpired: () => void;
  onUnhandledChange: (n: number) => void;
}) {
  const [rows, setRows] = useState<ContactMessageRow[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MessageFilter>("ALL");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const loadIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++loadIdRef.current;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/messages");
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      if (requestId !== loadIdRef.current) return; /* a newer request is in flight */
      setRows(data.messages ?? []);
      setStats(data.stats ?? null);
      setLastUpdated(new Date());
      onUnhandledChange(data.stats?.unhandled ?? 0);
    } catch (err) {
      if (requestId !== loadIdRef.current) return;
      setLoadError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      if (requestId === loadIdRef.current) setLoading(false);
    }
  }, [onSessionExpired, onUnhandledChange]);

  useEffect(() => {
    load();
  }, [load]);

  /* auto-refresh every 60s (pause when tab hidden) */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  async function toggleHandled(id: string, handled: boolean) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, handled }),
      });
      const data = await res.json();
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      if (!res.ok) throw new Error(data.error || "Update failed");
      /* the server is the source of truth — refresh rows, stats and the tab badge */
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not update the message.");
    } finally {
      setBusyId(null);
    }
  }

  /* --- CSV export of every message --- */
  async function exportCsv() {
    if (exporting) return;
    setExporting(true);
    const result = await downloadCsvFile(
      "/api/admin/messages?format=csv",
      "contact-messages.csv"
    );
    if (result === "unauthorized") onSessionExpired();
    else if (result === "error")
      setLoadError("Could not export the CSV. Please try again.");
    setExporting(false);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((m) => {
      if (filter === "NEW" && m.handled) return false;
      if (filter === "HANDLED" && !m.handled) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.subject ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const statCards = stats
    ? [
        { label: "Total", value: stats.total, Icon: Inbox, tone: "text-brand-navy bg-blue-50 ring-blue-100" },
        { label: "New", value: stats.unhandled, Icon: Clock, tone: "text-amber-700 bg-amber-50 ring-amber-100" },
        { label: "Handled", value: stats.handled, Icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50 ring-emerald-100" },
        { label: "Today", value: stats.today, Icon: CalendarClock, tone: "text-brand-navy bg-ice ring-blue-100" },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div className="hero-mesh-dark noise relative mt-6 overflow-hidden">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Staff Console
            </span>
            <h1 className="font-heading mt-3 text-2xl font-bold text-white sm:text-3xl">
              Message Inbox
            </h1>
            <p className="mt-1 text-sm text-blue-100/80">
              {lastUpdated
                ? `Last updated ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} • auto-refreshes every 60s`
                : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={load}
              disabled={loading}
              variant="outline"
              className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" />
              Refresh
            </Button>
            <Button
              onClick={onLogout}
              className="rounded-full bg-white text-brand-navy hover:bg-blue-100"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Stats */}
        <div className="-mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-[0_14px_36px_-20px_rgba(0,32,96,0.25)]"
            >
              <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1", s.tone)}>
                <s.Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <p className="font-heading mt-2.5 text-2xl font-bold tabular-nums text-brand-navy">
                {s.value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-8 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter messages by status">
              {(["ALL", "NEW", "HANDLED"] as MessageFilter[]).map((f) => {
                const active = filter === f;
                const count =
                  f === "ALL"
                    ? rows.length
                    : f === "NEW"
                      ? rows.filter((m) => !m.handled).length
                      : rows.filter((m) => m.handled).length;
                return (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-xs font-bold transition-all duration-300",
                      active
                        ? "bg-brand-navy text-white shadow-md shadow-navy-900/25"
                        : "bg-blue-50/70 text-slate-600 hover:bg-blue-100/80 hover:text-brand-navy"
                    )}
                  >
                    {f === "ALL" ? "All" : f === "NEW" ? "New" : "Handled"}
                    <span
                      className={cn(
                        "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                        active ? "bg-white/20 text-white" : "bg-white text-slate-500"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-72 sm:flex-none">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email or subject…"
                  aria-label="Search messages"
                  className="h-11 w-full rounded-full border border-blue-100 bg-ice pl-10 pr-4 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
                />
              </div>
              <Button
                type="button"
                onClick={exportCsv}
                disabled={exporting}
                title="Download every message as a CSV file"
                className="h-11 rounded-full bg-brand-gold px-5 text-sm font-bold text-brand-navy shadow-md shadow-amber-500/30 hover:bg-amber-400 disabled:opacity-60"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {loadError && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
            {loadError}
          </p>
        )}

        {/* List */}
        {loading && rows.length === 0 ? (
          <div className="mt-8 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" aria-hidden="true" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 rounded-3xl border border-dashed border-blue-200 bg-white/60 py-20 text-center"
          >
            <Inbox className="mx-auto h-10 w-10 text-blue-300" aria-hidden="true" />
            <p className="font-heading mt-4 text-lg font-bold text-brand-navy">
              {rows.length === 0 ? "No messages yet" : "No messages found"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {rows.length === 0
                ? "Messages sent through the website contact form will appear here."
                : "Try a different filter or search term."}
            </p>
          </motion.div>
        ) : (
          <div className="mt-6 max-h-[38rem] space-y-3 overflow-y-auto scroll-area pr-0.5">
            {filtered.map((m) => {
              const expanded = expandedId === m.id;
              return (
                <motion.article
                  key={m.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-2xl border bg-white p-4 shadow-sm transition-colors duration-300",
                    m.handled ? "border-blue-100" : "border-amber-200 ring-1 ring-amber-100"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId((prev) => (prev === m.id ? null : m.id))}
                    aria-expanded={expanded}
                    aria-controls={`msg-body-${m.id}`}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="font-semibold text-brand-navy">{m.name}</span>
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1",
                            m.handled
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                              : "bg-amber-50 text-amber-700 ring-amber-200"
                          )}
                        >
                          {!m.handled && (
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
                          )}
                          {m.handled ? "HANDLED" : "NEW"}
                        </span>
                      </span>
                      {m.subject && (
                        <span className="mt-1 block truncate text-xs font-semibold text-slate-600">
                          {m.subject}
                        </span>
                      )}
                      {!expanded && (
                        <span className="mt-1 block line-clamp-1 text-xs text-slate-400">
                          {m.message}
                        </span>
                      )}
                      <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        {prettyStamp(m.createdAt)}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300",
                        expanded && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        key="body"
                        id={`msg-body-${m.id}`}
                        role="region"
                        aria-label={`Full message from ${m.name}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3.5 border-t border-blue-100/70 pt-3.5">
                          <div className="grid gap-2 rounded-xl bg-ice px-3.5 py-3 text-xs text-slate-600 sm:grid-cols-2">
                            <p className="flex min-w-0 items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                              <a href={`mailto:${m.email}`} className="truncate font-semibold text-brand-blue hover:underline">
                                {m.email}
                              </a>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                              {m.phone ? (
                                <a href={`tel:${m.phone}`} className="font-semibold text-brand-blue hover:underline">
                                  {m.phone}
                                </a>
                              ) : (
                                <span className="text-slate-400">No phone provided</span>
                              )}
                            </p>
                            <p className="flex items-center gap-1.5 sm:col-span-2">
                              <Clock className="h-3.5 w-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
                              Received {prettyStamp(m.createdAt)}
                            </p>
                          </div>
                          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                            {m.message}
                          </p>
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
                            <a
                              href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "Your message"}`)}`}
                              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-[11px] font-bold text-brand-blue ring-1 ring-blue-200 transition-all duration-300 hover:bg-brand-blue hover:text-white"
                            >
                              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                              Reply by email
                            </a>
                            {busyId === m.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-brand-blue" aria-label="Updating message" />
                            ) : (
                              <SmallAction
                                label={m.handled ? "Mark new" : "Mark handled"}
                                tone={m.handled ? "neutral" : "confirm"}
                                onClick={() => toggleHandled(m.id, !m.handled)}
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subscribers view — newsletter mailing list                          */
/* ------------------------------------------------------------------ */

function SubscribersPanel({
  onLogout,
  onSessionExpired,
}: {
  onLogout: () => void;
  onSessionExpired: () => void;
}) {
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [stats, setStats] = useState<SubscriberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const loadIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++loadIdRef.current;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      if (requestId !== loadIdRef.current) return; /* a newer request is in flight */
      setRows(data.subscribers ?? []);
      setStats(data.stats ?? null);
      setLastUpdated(new Date());
    } catch (err) {
      if (requestId !== loadIdRef.current) return;
      setLoadError(err instanceof Error ? err.message : "Failed to load subscribers.");
    } finally {
      if (requestId === loadIdRef.current) setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    load();
  }, [load]);

  /* auto-refresh every 60s (pause when tab hidden) */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  /* --- CSV export of every subscriber --- */
  async function exportCsv() {
    if (exporting) return;
    setExporting(true);
    const result = await downloadCsvFile(
      "/api/admin/subscribers?format=csv",
      "newsletter-subscribers.csv"
    );
    if (result === "unauthorized") onSessionExpired();
    else if (result === "error")
      setLoadError("Could not export the CSV. Please try again.");
    setExporting(false);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.email.toLowerCase().includes(q));
  }, [rows, search]);

  const statCards = stats
    ? [
        { label: "Total", value: stats.total, Icon: Mails, tone: "text-brand-navy bg-blue-50 ring-blue-100" },
        { label: "Last 7 days", value: stats.last7Days, Icon: CalendarClock, tone: "text-brand-blue bg-ice ring-blue-100" },
        { label: "Last 30 days", value: stats.last30Days, Icon: CalendarRange, tone: "text-amber-700 bg-amber-50 ring-amber-100" },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div className="hero-mesh-dark noise relative mt-6 overflow-hidden">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Staff Console
            </span>
            <h1 className="font-heading mt-3 text-2xl font-bold text-white sm:text-3xl">
              Newsletter Subscribers
            </h1>
            <p className="mt-1 text-sm text-blue-100/80">
              {lastUpdated
                ? `Last updated ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} • auto-refreshes every 60s`
                : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={load}
              disabled={loading}
              variant="outline"
              className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" />
              Refresh
            </Button>
            <Button
              onClick={onLogout}
              className="rounded-full bg-white text-brand-navy hover:bg-blue-100"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Stats */}
        <div className="-mt-6 grid grid-cols-3 gap-3">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-[0_14px_36px_-20px_rgba(0,32,96,0.25)]"
            >
              <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1", s.tone)}>
                <s.Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <p className="font-heading mt-2.5 text-2xl font-bold tabular-nums text-brand-navy">
                {s.value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-8 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email…"
                aria-label="Search subscribers"
                className="h-11 w-full rounded-full border border-blue-100 bg-ice pl-10 pr-4 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
              />
            </div>
            <Button
              type="button"
              onClick={exportCsv}
              disabled={exporting}
              title="Download every subscriber as a CSV file"
              className="h-11 rounded-full bg-brand-gold px-5 text-sm font-bold text-brand-navy shadow-md shadow-amber-500/30 hover:bg-amber-400 disabled:opacity-60"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              Export CSV
            </Button>
          </div>
        </div>

        {loadError && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
            {loadError}
          </p>
        )}

        {/* List */}
        {loading && rows.length === 0 ? (
          <div className="mt-8 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" aria-hidden="true" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 rounded-3xl border border-dashed border-blue-200 bg-white/60 py-20 text-center"
          >
            <Mails className="mx-auto h-10 w-10 text-blue-300" aria-hidden="true" />
            <p className="font-heading mt-4 text-lg font-bold text-brand-navy">
              {rows.length === 0 ? "No subscribers yet" : "No subscribers found"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {rows.length === 0
                ? "Email addresses signed up for the newsletter will appear here."
                : "Try a different search term."}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_14px_40px_-24px_rgba(0,32,96,0.25)] lg:block">
              <div className="max-h-96 overflow-y-auto scroll-area">
                <table className="w-full text-left text-sm table-zebra">
                  <thead className="sticky top-0 z-10 bg-ice/95 backdrop-blur">
                    <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                      <th scope="col" className="px-5 py-3.5 font-semibold">Email</th>
                      <th scope="col" className="px-5 py-3.5 text-right font-semibold">Subscribed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {filtered.map((r) => (
                      <tr key={r.id} className="transition-colors hover:bg-blue-50/40">
                        <td className="px-5 py-3.5">
                          <p className="flex items-center gap-2 font-semibold text-brand-navy">
                            <Mail className="h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
                            {r.email}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <p className="text-xs font-semibold tabular-nums text-slate-600">
                            {prettyDay(r.createdAt)}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">{relativeTime(r.createdAt)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="mt-6 max-h-96 space-y-2.5 overflow-y-auto scroll-area pr-0.5 lg:hidden">
              {filtered.map((r) => (
                <motion.article
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
                >
                  <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-brand-navy">
                    <Mail className="h-4 w-4 shrink-0 text-brand-blue" aria-hidden="true" />
                    <span className="truncate">{r.email}</span>
                  </p>
                  <p className="shrink-0 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    {prettyDay(r.createdAt)}
                  </p>
                </motion.article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Patients view — portal accounts + booking drilldown                 */
/*  (password data is never requested or displayed)                     */
/* ------------------------------------------------------------------ */

function PatientsPanel({
  onLogout,
  onSessionExpired,
}: {
  onLogout: () => void;
  onSessionExpired: () => void;
}) {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, PatientDetail>>({});
  const [drillErrors, setDrillErrors] = useState<Record<string, string>>({});
  const [loadingPhone, setLoadingPhone] = useState<string | null>(null);
  const loadIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++loadIdRef.current;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/patients");
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      if (requestId !== loadIdRef.current) return; /* a newer request is in flight */
      setPatients(data.patients ?? []);
      setStats(data.stats ?? null);
      setLastUpdated(new Date());
    } catch (err) {
      if (requestId !== loadIdRef.current) return;
      setLoadError(err instanceof Error ? err.message : "Failed to load patients.");
    } finally {
      if (requestId === loadIdRef.current) setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    load();
  }, [load]);

  /* auto-refresh every 60s (pause when tab hidden) */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  /* Expand a row → lazily fetch that patient's bookings (cached per phone). */
  async function toggleExpand(phone: string) {
    if (expandedPhone === phone) {
      setExpandedPhone(null);
      return;
    }
    setExpandedPhone(phone);
    if (details[phone]) return;
    setLoadingPhone(phone);
    setDrillErrors((prev) => ({ ...prev, [phone]: "" }));
    try {
      const res = await fetch(
        `/api/admin/patients?phone=${encodeURIComponent(phone)}`
      );
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setDetails((prev) => ({ ...prev, [phone]: data }));
    } catch (err) {
      setDrillErrors((prev) => ({
        ...prev,
        [phone]:
          err instanceof Error ? err.message : "Could not load this patient's bookings.",
      }));
    } finally {
      setLoadingPhone(null);
    }
  }

  /* --- CSV export of every patient account --- */
  async function exportCsv() {
    if (exporting) return;
    setExporting(true);
    const result = await downloadCsvFile(
      "/api/admin/patients?format=csv",
      "patient-accounts.csv"
    );
    if (result === "unauthorized") onSessionExpired();
    else if (result === "error")
      setLoadError("Could not export the CSV. Please try again.");
    setExporting(false);
  }

  const serviceMap = useMemo(() => {
    const m: Record<string, string> = {};
    services.forEach((s) => (m[s.slug] = s.shortName));
    return m;
  }, []);
  const doctorMap = useMemo(() => {
    const m: Record<string, string> = {};
    doctors.forEach((doc) => (m[doc.slug] = doc.name));
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q)
    );
  }, [patients, search]);

  const statCards = stats
    ? [
        { label: "Total accounts", value: stats.total, Icon: Users, tone: "text-brand-navy bg-blue-50 ring-blue-100" },
        { label: "New this week", value: stats.newThisWeek, Icon: CalendarClock, tone: "text-amber-700 bg-amber-50 ring-amber-100" },
        { label: "With appointments", value: stats.withAppointments, Icon: BadgeCheck, tone: "text-emerald-700 bg-emerald-50 ring-emerald-100" },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div className="hero-mesh-dark noise relative mt-6 overflow-hidden">
        <div className="dot-grid-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300 ring-1 ring-white/15">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Staff Console
            </span>
            <h1 className="font-heading mt-3 text-2xl font-bold text-white sm:text-3xl">
              Patient Accounts
            </h1>
            <p className="mt-1 text-sm text-blue-100/80">
              {lastUpdated
                ? `Last updated ${lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} • auto-refreshes every 60s`
                : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              onClick={load}
              disabled={loading}
              variant="outline"
              className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" />
              Refresh
            </Button>
            <Button
              onClick={onLogout}
              className="rounded-full bg-white text-brand-navy hover:bg-blue-100"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Stats */}
        <div className="-mt-6 grid grid-cols-3 gap-3">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-[0_14px_36px_-20px_rgba(0,32,96,0.25)]"
            >
              <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1", s.tone)}>
                <s.Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <p className="font-heading mt-2.5 text-2xl font-bold tabular-nums text-brand-navy">
                {s.value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mt-8 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or phone…"
                aria-label="Search patients"
                className="h-11 w-full rounded-full border border-blue-100 bg-ice pl-10 pr-4 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
              />
            </div>
            <Button
              type="button"
              onClick={exportCsv}
              disabled={exporting}
              title="Download every patient account as a CSV file"
              className="h-11 rounded-full bg-brand-gold px-5 text-sm font-bold text-brand-navy shadow-md shadow-amber-500/30 hover:bg-amber-400 disabled:opacity-60"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              Export CSV
            </Button>
          </div>
        </div>

        {loadError && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
            {loadError}
          </p>
        )}

        {/* List */}
        {loading && patients.length === 0 ? (
          <div className="mt-8 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" aria-hidden="true" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 rounded-3xl border border-dashed border-blue-200 bg-white/60 py-20 text-center"
          >
            <Users className="mx-auto h-10 w-10 text-blue-300" aria-hidden="true" />
            <p className="font-heading mt-4 text-lg font-bold text-brand-navy">
              {patients.length === 0 ? "No patient accounts yet" : "No patients found"}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {patients.length === 0
                ? "Accounts created through the Patient Portal will appear here."
                : "Try a different search term."}
            </p>
          </motion.div>
        ) : (
          <div className="mt-6 max-h-[38rem] space-y-3 overflow-y-auto scroll-area pr-0.5">
            {filtered.map((p) => {
              const expanded = expandedPhone === p.phone;
              const detail = details[p.phone];
              return (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(p.phone)}
                    aria-expanded={expanded}
                    aria-controls={`patient-body-${p.phone}`}
                    className="flex w-full items-center gap-3.5 p-4 text-left transition-colors hover:bg-blue-50/40"
                  >
                    <span
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-navy to-brand-blue text-sm font-bold uppercase text-white shadow-md shadow-navy-900/20"
                      aria-hidden="true"
                    >
                      {initialsOf(p.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="font-semibold text-brand-navy">{p.name}</span>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-brand-blue ring-1 ring-blue-100">
                          <CalendarDays className="h-3 w-3" aria-hidden="true" />
                          {p.appointmentCount} booking{p.appointmentCount === 1 ? "" : "s"}
                        </span>
                      </span>
                      <span className="mt-1 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        Registered {prettyDay(p.createdAt)}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300",
                        expanded && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {/* contact links live OUTSIDE the toggle button (valid HTML) */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-3 text-xs">
                    <a
                      href={`tel:${p.phone}`}
                      className="font-semibold text-brand-blue hover:underline"
                    >
                      {p.phone}
                    </a>
                    {p.email ? (
                      <a
                        href={`mailto:${p.email}`}
                        className="min-w-0 max-w-full truncate text-slate-500 hover:text-brand-blue hover:underline"
                        title={p.email}
                      >
                        {p.email}
                      </a>
                    ) : (
                      <span className="text-slate-400">No email on file</span>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        key="body"
                        id={`patient-body-${p.phone}`}
                        role="region"
                        aria-label={`Bookings for ${p.name}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-blue-100/70 px-4 pb-4 pt-3.5">
                          {loadingPhone === p.phone ? (
                            <div className="flex justify-center py-6">
                              <Loader2
                                className="h-5 w-5 animate-spin text-brand-blue"
                                aria-label="Loading bookings"
                              />
                            </div>
                          ) : drillErrors[p.phone] ? (
                            <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600 ring-1 ring-rose-100">
                              {drillErrors[p.phone]}
                            </p>
                          ) : detail ? (
                            <>
                              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                {detail.appointments.length} booking{detail.appointments.length === 1 ? "" : "s"} · newest first
                              </p>
                              <ul className="mt-2.5 space-y-2.5">
                                {detail.appointments.map((a) => (
                                  <li
                                    key={a.id}
                                    className="rounded-xl bg-ice px-3.5 py-3 ring-1 ring-blue-100/70"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <p className="font-mono text-[10px] font-semibold text-slate-400">
                                        {a.refCode}
                                      </p>
                                      <span
                                        className={cn(
                                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1",
                                          statusStyles[a.status] ?? "bg-slate-50 text-slate-600 ring-slate-200"
                                        )}
                                      >
                                        {a.status === "PENDING" && (
                                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
                                        )}
                                        {a.status}
                                      </span>
                                    </div>
                                    <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
                                      <p className="font-semibold tabular-nums text-brand-navy">{a.date}</p>
                                      <p className="tabular-nums text-slate-500">{a.time}</p>
                                      <p className="font-semibold text-slate-600">
                                        <Sparkles className="mr-1 inline h-3 w-3 text-brand-blue" aria-hidden="true" />
                                        {a.serviceSlug ? serviceMap[a.serviceSlug] ?? a.serviceSlug : "Service: —"}
                                      </p>
                                      {a.doctorSlug && (
                                        <p className="text-slate-400">
                                          {doctorMap[a.doctorSlug] ?? a.doctorSlug}
                                        </p>
                                      )}
                                    </div>
                                    {a.notes && (
                                      <p className="mt-1.5 line-clamp-2 text-[11px] italic text-slate-400" title={a.notes}>
                                        “{a.notes}”
                                      </p>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SmallAction({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "confirm" | "complete" | "cancel" | "neutral" | "warn";
  onClick: () => void;
}) {
  const tones = {
    confirm: "bg-blue-50 text-brand-blue ring-blue-200 hover:bg-brand-blue hover:text-white",
    complete: "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-600 hover:text-white",
    cancel: "bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-500 hover:text-white",
    neutral: "bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-600 hover:text-white",
    warn: "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-brand-gold hover:text-brand-navy",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-[11px] font-bold ring-1 transition-all duration-300",
        tones[tone]
      )}
    >
      {label}
    </button>
  );
}
