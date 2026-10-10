"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Ban,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock,
  Download,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  MessageSquareQuote,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { usePageMeta } from "@/lib/router";
import { services } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  ADMIN — passcode-protected appointment dashboard (#/admin)          */
/*  Staff use only. Not indexed, not in navbar/sitemap.                 */
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

type AdminView = "appointments" | "reviews";
type ReviewFilter = "ALL" | "PENDING" | "APPROVED";

const SESSION_KEY = "adc-admin-code";
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

/* --- external store for the admin session (SSR-safe, lint-safe) --- */
let storedCode: string | null = null;
const codeListeners = new Set<() => void>();
if (typeof window !== "undefined") {
  try {
    storedCode = sessionStorage.getItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
function subscribeCode(fn: () => void) {
  codeListeners.add(fn);
  return () => {
    codeListeners.delete(fn);
  };
}
function getCodeSnapshot(): string | null {
  return storedCode;
}
function getServerCode(): string | null {
  return null;
}
function setStoredCode(c: string | null) {
  storedCode = c;
  try {
    if (c) sessionStorage.setItem(SESSION_KEY, c);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  codeListeners.forEach((fn) => fn());
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-blue-50 text-brand-blue ring-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-600 ring-rose-200",
};

export function AdminPage() {
  usePageMeta({
    title: "Admin — Appointment Dashboard",
    description: "Staff-only appointment management dashboard.",
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

  const code = useSyncExternalStore(subscribeCode, getCodeSnapshot, getServerCode);

  return code ? (
    <AdminDashboard
      code={code}
      onLogout={() => setStoredCode(null)}
    />
  ) : (
    <AdminGate
      onUnlock={(c) => setStoredCode(c)}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Passcode gate                                                       */
/* ------------------------------------------------------------------ */

function AdminGate({ onUnlock }: { onUnlock: (code: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (checking) return;
    setError(null);
    setChecking(true);
    try {
      const res = await fetch("/api/admin/appointments", {
        headers: { "x-admin-code": value.trim() },
      });
      if (res.status === 401) {
        setError("Incorrect passcode. Please try again.");
        return;
      }
      if (!res.ok) throw new Error("Server error");
      onUnlock(value.trim());
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
            Sessions expire when you close the tab. Demo passcode:{" "}
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
/*  Dashboard — shell with section tabs (Appointments | Reviews)        */
/* ------------------------------------------------------------------ */

function AdminDashboard({ code, onLogout }: { code: string; onLogout: () => void }) {
  const [view, setView] = useState<AdminView>("appointments");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [reviewsPending, setReviewsPending] = useState<number | null>(null);
  const handleExpired = useCallback(() => setSessionExpired(true), []);

  /* Light initial fetch so the Reviews tab can show its pending badge
     before the staff member opens that view. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/reviews", {
          headers: { "x-admin-code": code },
        });
        if (res.status === 401) {
          setSessionExpired(true);
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.stats) setReviewsPending(data.stats.pending ?? 0);
      } catch {
        /* badge is best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (sessionExpired) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="max-w-md rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-amber-600" aria-hidden="true" />
          <h2 className="font-heading mt-4 text-lg font-bold text-amber-900">
            Session expired
          </h2>
          <p className="mt-2 text-sm text-amber-800">
            Your passcode was rejected. Please sign in again.
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
            active={view === "appointments"}
            onClick={() => setView("appointments")}
            Icon={CalendarDays}
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
          {view === "appointments" ? (
            <AppointmentsPanel
              code={code}
              onLogout={onLogout}
              onSessionExpired={handleExpired}
            />
          ) : (
            <ReviewsPanel
              code={code}
              onLogout={onLogout}
              onSessionExpired={handleExpired}
              onPendingChange={setReviewsPending}
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
/*  Appointments view                                                   */
/* ------------------------------------------------------------------ */

function AppointmentsPanel({
  code,
  onLogout,
  onSessionExpired,
}: {
  code: string;
  onLogout: () => void;
  onSessionExpired: () => void;
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
        `/api/admin/appointments${query ? `?${query}` : ""}`,
        { headers: { "x-admin-code": code } }
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
    } catch (err) {
      if (requestId !== loadIdRef.current) return;
      setLoadError(err instanceof Error ? err.message : "Failed to load appointments.");
    } finally {
      if (requestId === loadIdRef.current) setLoading(false);
    }
  }, [code, fromDate, toDate, onSessionExpired]);

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
          "x-admin-code": code,
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
      const res = await fetch(`/api/admin/appointments?${qs.toString()}`, {
        headers: { "x-admin-code": code },
      });
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
  code,
  onLogout,
  onSessionExpired,
  onPendingChange,
}: {
  code: string;
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
      const res = await fetch("/api/admin/reviews", {
        headers: { "x-admin-code": code },
      });
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
  }, [code, onSessionExpired, onPendingChange]);

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
          "x-admin-code": code,
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
      const res = await fetch(`/api/admin/reviews?format=csv`, {
        headers: { "x-admin-code": code },
      });
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
