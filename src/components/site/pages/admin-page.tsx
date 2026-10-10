"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Ban,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
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

const SESSION_KEY = "adc-admin-code";
type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

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
/*  Dashboard                                                           */
/* ------------------------------------------------------------------ */

function AdminDashboard({ code, onLogout }: { code: string; onLogout: () => void }) {
  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/appointments", {
        headers: { "x-admin-code": code },
      });
      if (res.status === 401) {
        setSessionExpired(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRows(data.appointments ?? []);
      setStats(data.stats ?? null);
      setLastUpdated(new Date());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }, [code]);

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
        setSessionExpired(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Update failed");
      setRows((prev) =>
        prev.map((r) => (r.refCode === refCode ? { ...r, status } : r))
      );
      setStats((prev) =>
        prev
          ? {
              ...prev,
              pending: rows.filter((r) => (r.refCode === refCode ? status === "PENDING" : r.status === "PENDING")).length,
              confirmed: rows.filter((r) => (r.refCode === refCode ? status === "CONFIRMED" : r.status === "CONFIRMED")).length,
              completed: rows.filter((r) => (r.refCode === refCode ? status === "COMPLETED" : r.status === "COMPLETED")).length,
              cancelled: rows.filter((r) => (r.refCode === refCode ? status === "CANCELLED" : r.status === "CANCELLED")).length,
            }
          : prev
      );
    } catch {
      setLoadError("Could not update status. Please retry.");
    } finally {
      setBusyRef(null);
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
    <div className="section-wash min-h-screen flex-1 pb-20">
      {/* Header */}
      <div className="hero-mesh-dark noise relative overflow-hidden">
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

        {/* Toolbar */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
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
          <div className="mt-8 rounded-3xl border border-dashed border-blue-200 bg-white/60 py-20 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-blue-300" aria-hidden="true" />
            <p className="font-heading mt-4 text-lg font-bold text-brand-navy">
              No appointments found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {rows.length === 0
                ? "New online bookings will appear here in real time."
                : "Try a different filter or search term."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_14px_40px_-24px_rgba(0,32,96,0.25)] lg:block">
              <div className="max-h-[38rem] overflow-y-auto scroll-area">
                <table className="w-full text-left text-sm">
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

function SmallAction({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "confirm" | "complete" | "cancel" | "neutral";
  onClick: () => void;
}) {
  const tones = {
    confirm: "bg-blue-50 text-brand-blue ring-blue-200 hover:bg-brand-blue hover:text-white",
    complete: "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-600 hover:text-white",
    cancel: "bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-500 hover:text-white",
    neutral: "bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-600 hover:text-white",
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
