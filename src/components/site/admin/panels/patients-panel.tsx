"use client";

/* ------------------------------------------------------------------ */
/*  Patients panel — portal accounts + booking drilldown                */
/*  (password data is never requested or displayed)                     */
/*  Extracted verbatim from the former monolithic admin page; the      */
/*  shell owns the module header + logout (refresh lives in the        */
/*  PanelToolbar below).                                               */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  Download,
  Loader2,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { services } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  type PatientDetail,
  type PatientRow,
  type PatientStats,
  PanelToolbar,
  downloadCsvFile,
  initialsOf,
  prettyDay,
  statusStyles,
} from "../admin-shared";

export function PatientsPanel({
  onSessionExpired,
}: {
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
      <PanelToolbar lastUpdated={lastUpdated} loading={loading} onRefresh={load} />

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
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
      <div className="mt-6 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
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
  );
}
