"use client";

/* ------------------------------------------------------------------ */
/*  Appointments panel — the front desk's daily workspace               */
/*  Bookings table, Today-by-default date range, Follow-ups queue,      */
/*  Edit/Reschedule dialog, call + WhatsApp quick actions, CSV export.  */
/*  The shell owns the module header + logout (refresh lives in the     */
/*  PanelToolbar below).                                               */
/* ------------------------------------------------------------------ */

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Ban,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Inbox,
  Loader2,
  MessageCircle,
  Pencil,
  Phone,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { services } from "@/lib/data/services";
import { doctors } from "@/lib/data/doctors";
import { useRouter } from "@/lib/router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type AppointmentRow,
  type DatePreset,
  type Stats,
  type StatusFilter,
  DATE_PRESETS,
  PanelToolbar,
  SmallAction,
  localToday,
  statusStyles,
  useAdminToast,
} from "../admin-shared";

/* The clinic's 20 bookable half-hour slots — same list as the booking
   page and the same shape the server's TIME_SLOT regex accepts.      */
const TIME_SLOTS = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
  "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
];

/** Status tabs + the special "Follow-ups" daily queue view. */
type ListFilter = StatusFilter | "FOLLOWUP";

const FILTER_TABS: { id: ListFilter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "FOLLOWUP", label: "Follow-ups" },
];

/* Follow-up chip semantics (overdue / due today / upcoming). */
function followUpMeta(followUpDate: string | null, today: string) {
  if (!followUpDate) return null;
  if (followUpDate < today)
    return {
      tone: "bg-rose-50 text-rose-600 ring-rose-200",
      dot: "bg-rose-500",
      label: `Overdue · ${followUpDate}`,
    };
  if (followUpDate === today)
    return {
      tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      dot: "bg-emerald-500 animate-pulse",
      label: "Due today",
    };
  return {
    tone: "bg-blue-50 text-brand-blue ring-blue-200",
    dot: "bg-brand-blue",
    label: `Follow-up ${followUpDate}`,
  };
}

/** BD mobile → wa.me deep link (01712345678 → 8801712345678). */
function whatsappHref(phone: string, name: string, refCode: string): string {
  const text = `Hello ${name}, this is Aristocrat Dental Care regarding your appointment (${refCode}).`;
  return `https://wa.me/880${phone.slice(1)}?text=${encodeURIComponent(text)}`;
}

export function AppointmentsPanel({
  onSessionExpired,
  onPendingChange,
}: {
  onSessionExpired: () => void;
  onPendingChange?: (pending: number) => void;
}) {
  const { query } = useRouter();
  const { ok: toastOk } = useAdminToast();

  /* Deep link /admin?view=appointments&followups=1 (Overview jump) opens
     the follow-ups queue directly; anything else lands on Today.       */
  const startOnFollowUps = query.get("followups") === "1";

  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ListFilter>(startOnFollowUps ? "FOLLOWUP" : "ALL");
  const [search, setSearch] = useState("");
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [preset, setPreset] = useState<DatePreset>(startOnFollowUps ? "all" : "today");
  const [fromDate, setFromDate] = useState(() => (startOnFollowUps ? "" : localToday()));
  const [toDate, setToDate] = useState(() => (startOnFollowUps ? "" : localToday()));
  const [range, setRange] = useState<{
    from: string | null;
    to: string | null;
    label: string;
    total: number;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const loadIdRef = useRef(0);

  /* Follow-ups view ignores appointment-date ranges, so entering it
     switches to All time and leaving restores the previous preset.   */
  const savedRangeRef = useRef<{ preset: DatePreset; from: string; to: string } | null>(null);

  /* Expandable row detail (admin notes / follow-up / patient note). */
  const [expandedRef, setExpandedRef] = useState<string | null>(null);

  /* --- Edit / Reschedule dialog state --- */
  const [editTarget, setEditTarget] = useState<AppointmentRow | null>(null);
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    doctor: "",
    service: "",
    followUp: "",
    adminNotes: "",
  });
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

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

  /* --- status changes (confirm / complete / cancel / reopen) --- */
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

  /* --- Edit / Reschedule dialog ---------------------------------- */
  function openEdit(r: AppointmentRow) {
    setEditTarget(r);
    setEditForm({
      date: r.date,
      time: r.time,
      doctor: r.doctorSlug ?? "",
      service: r.serviceSlug ?? "",
      followUp: r.followUpDate ?? "",
      adminNotes: r.adminNotes ?? "",
    });
    setEditError("");
  }

  function closeEdit() {
    if (savingEdit) return; /* don't abandon a request in flight */
    setEditTarget(null);
    setEditError("");
  }

  async function saveEdit() {
    if (!editTarget || savingEdit) return;
    setEditError("");
    const today = localToday();

    if (!editForm.date) {
      setEditError("Please choose an appointment date.");
      return;
    }
    if (editForm.date < today && editForm.date !== editTarget.date) {
      setEditError("The new appointment date cannot be in the past.");
      return;
    }

    /* Sparse payload — only what actually changed (empty strings clear
       the optional doctor / treatment / follow-up / admin-notes).      */
    const payload: Record<string, string> = {};
    if (editForm.date !== editTarget.date) payload.date = editForm.date;
    if (editForm.time !== editTarget.time) payload.time = editForm.time;
    if (editForm.doctor !== (editTarget.doctorSlug ?? ""))
      payload.doctorSlug = editForm.doctor;
    if (editForm.service !== (editTarget.serviceSlug ?? ""))
      payload.serviceSlug = editForm.service;
    if (editForm.followUp !== (editTarget.followUpDate ?? ""))
      payload.followUpDate = editForm.followUp;
    if (editForm.adminNotes !== (editTarget.adminNotes ?? ""))
      payload.adminNotes = editForm.adminNotes;

    if (Object.keys(payload).length === 0) {
      setEditError("No changes to save yet — adjust a field first.");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refCode: editTarget.refCode, ...payload }),
      });
      const data = await res.json();
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      if (!res.ok) throw new Error(data.error || "Update failed");
      /* merge the server's authoritative row back into the table */
      if (data.appointment) {
        const updated = data.appointment as AppointmentRow;
        setRows((prev) =>
          prev.map((r) => (r.refCode === editTarget.refCode ? { ...r, ...updated } : r))
        );
      }
      toastOk("Appointment updated", data.message ?? `Changes to ${editTarget.refCode} saved.`);
      setEditTarget(null);
      /* stats (today / upcoming) may have shifted — refresh quietly */
      void load();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Could not save the changes.");
    } finally {
      setSavingEdit(false);
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

  /* Filter tabs — entering Follow-ups saves the current date range and
     widens to All time; leaving restores it.                           */
  function switchFilter(next: ListFilter) {
    if (next === filter) return;
    if (next === "FOLLOWUP") {
      savedRangeRef.current = { preset, from: fromDate, to: toDate };
      applyPreset("all");
    } else if (filter === "FOLLOWUP" && savedRangeRef.current) {
      const saved = savedRangeRef.current;
      savedRangeRef.current = null;
      setPreset(saved.preset);
      setFromDate(saved.from);
      setToDate(saved.to);
    }
    setFilter(next);
  }

  /* --- CSV export of the currently filtered set --- */
  async function exportCsv() {
    if (exporting) return;
    setExporting(true);
    try {
      const qs = new URLSearchParams({ format: "csv" });
      if (fromDate) qs.set("from", fromDate);
      if (toDate) qs.set("to", toDate);
      if (filter !== "ALL" && filter !== "FOLLOWUP") qs.set("status", filter);
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

  const today = localToday();

  const followUpCounts = useMemo(() => {
    const withFu = rows.filter((r) => r.followUpDate);
    return {
      total: withFu.length,
      overdue: withFu.filter((r) => (r.followUpDate ?? "") < today).length,
      dueToday: withFu.filter((r) => r.followUpDate === today).length,
      upcoming: withFu.filter((r) => (r.followUpDate ?? "") > today).length,
    };
  }, [rows, today]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = rows.filter((r) => {
      if (filter === "FOLLOWUP") {
        if (!r.followUpDate) return false;
      } else if (filter !== "ALL" && r.status !== filter) {
        return false;
      }
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.refCode.toLowerCase().includes(q)
      );
    });
    if (filter === "FOLLOWUP") {
      /* the daily call-back queue: most urgent (oldest follow-up) first */
      return [...base].sort((a, b) =>
        (a.followUpDate ?? "").localeCompare(b.followUpDate ?? "")
      );
    }
    return base;
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

  const timeOptions = useMemo(() => {
    if (editTarget && !TIME_SLOTS.includes(editTarget.time)) {
      return [editTarget.time, ...TIME_SLOTS];
    }
    return TIME_SLOTS;
  }, [editTarget]);

  return (
    <div>
      <PanelToolbar lastUpdated={lastUpdated} loading={loading} onRefresh={load} />

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
      <div className="mt-6 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by status">
            {FILTER_TABS.map((f) => {
              const active = filter === f.id;
              const count =
                f.id === "ALL"
                  ? rows.length
                  : f.id === "FOLLOWUP"
                    ? followUpCounts.total
                    : rows.filter((r) => r.status === f.id).length;
              return (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchFilter(f.id)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-xs font-bold transition-all duration-300",
                    active
                      ? "bg-brand-navy text-white shadow-md shadow-navy-900/25"
                      : "bg-blue-50/70 text-slate-600 hover:bg-blue-100/80 hover:text-brand-navy",
                    f.id === "FOLLOWUP" && !active && followUpCounts.overdue > 0 &&
                      "ring-1 ring-rose-200"
                  )}
                >
                  {f.id === "FOLLOWUP" ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {f.label}
                    </span>
                  ) : (
                    f.label
                  )}
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

        {filter === "FOLLOWUP" && (
          <p className="mt-3 text-xs font-medium text-slate-500">
            The follow-ups queue spans all dates — switch to a status tab to bring the
            date range back.
          </p>
        )}

        {invalidRange && (
          <p className="mt-3 text-xs font-medium text-rose-600">
            The “From” date is after the “To” date — no appointments can match this range.
          </p>
        )}
      </div>

      {/* Follow-ups daily summary */}
      {filter === "FOLLOWUP" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { label: "Call-backs set", value: followUpCounts.total, tone: "text-brand-navy bg-ice ring-blue-100" },
            { label: "Overdue", value: followUpCounts.overdue, tone: "text-rose-600 bg-rose-50 ring-rose-100" },
            { label: "Due today", value: followUpCounts.dueToday, tone: "text-emerald-700 bg-emerald-50 ring-emerald-100" },
            { label: "Upcoming", value: followUpCounts.upcoming, tone: "text-brand-blue bg-blue-50 ring-blue-100" },
          ].map((c) => (
            <div
              key={c.label}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-blue-100/70 bg-white px-4 py-3 shadow-sm"
              )}
            >
              <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums ring-1", c.tone)}>
                {c.value}
              </span>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {c.label}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Active range indicator */}
      <AnimatePresence>
        {range && filter !== "FOLLOWUP" && (
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
            {filter === "FOLLOWUP"
              ? "No follow-ups scheduled"
              : rows.length === 0 && range
                ? "No appointments in this date range"
                : "No appointments found"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            {filter === "FOLLOWUP"
              ? "Set a follow-up date from any appointment's Edit dialog — the daily call-back queue lives here."
              : rows.length === 0 && range
                ? "No bookings fall inside the selected date range. Try widening it or clear the filter."
                : rows.length === 0
                  ? "New online bookings will appear here in real time."
                  : "Try a different filter or search term."}
          </p>
          {rows.length === 0 && range && filter !== "FOLLOWUP" && (
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
                  {filtered.map((r) => {
                    const fu = followUpMeta(r.followUpDate, today);
                    const expanded = expandedRef === r.refCode;
                    const hasDetails = Boolean(r.adminNotes || r.notes || r.followUpDate);
                    return (
                      <Fragment key={r.id}>
                        <tr className="transition-colors hover:bg-blue-50/40">
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
                            {fu && (
                              <span
                                className={cn(
                                  "mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1",
                                  fu.tone
                                )}
                              >
                                <span className={cn("h-1.5 w-1.5 rounded-full", fu.dot)} aria-hidden="true" />
                                {fu.label}
                              </span>
                            )}
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
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              {/* quick contact */}
                              <a
                                href={`tel:${r.phone}`}
                                title={`Call ${r.name}`}
                                aria-label={`Call ${r.name}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-brand-blue ring-1 ring-blue-200 transition-all duration-300 hover:bg-brand-blue hover:text-white"
                              >
                                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                              </a>
                              <a
                                href={whatsappHref(r.phone, r.name, r.refCode)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`WhatsApp ${r.name}`}
                                aria-label={`WhatsApp ${r.name}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 transition-all duration-300 hover:bg-emerald-500 hover:text-white"
                              >
                                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              </a>
                              {busyRef === r.refCode ? (
                                <Loader2 className="h-4 w-4 animate-spin text-brand-blue" aria-hidden="true" />
                              ) : (
                                <>
                                  <SmallAction
                                    label="Edit"
                                    tone="neutral"
                                    onClick={() => openEdit(r)}
                                  />
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
                                  {hasDetails && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedRef(expanded ? null : r.refCode)}
                                      aria-expanded={expanded}
                                      title={expanded ? "Hide details" : "Show notes & follow-up"}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 ring-1 ring-slate-200 transition-all duration-300 hover:bg-slate-600 hover:text-white"
                                    >
                                      <ChevronDown
                                        className={cn(
                                          "h-3.5 w-3.5 transition-transform duration-300",
                                          expanded && "rotate-180"
                                        )}
                                        aria-hidden="true"
                                      />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="bg-ice/40">
                            <td colSpan={5} className="px-5 py-4">
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-blue-100/70">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Follow-up
                                  </p>
                                  {r.followUpDate ? (
                                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-navy">
                                      {fu?.label}
                                      <button
                                        type="button"
                                        onClick={() => openEdit(r)}
                                        className="text-[11px] font-bold text-brand-blue underline-offset-4 hover:underline"
                                      >
                                        Change
                                      </button>
                                    </p>
                                  ) : (
                                    <p className="mt-1 text-sm text-slate-400">
                                      None — set one from Edit
                                    </p>
                                  )}
                                </div>
                                <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-blue-100/70">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Admin notes
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-brand-navy">
                                    {r.adminNotes || <span className="text-slate-400">No internal notes yet.</span>}
                                  </p>
                                </div>
                                {r.notes && (
                                  <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-blue-100/70 sm:col-span-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                      Patient's note
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm italic leading-relaxed text-slate-600">
                                      “{r.notes}”
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 space-y-3 lg:hidden">
            {filtered.map((r) => {
              const fu = followUpMeta(r.followUpDate, today);
              return (
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
                    {fu && (
                      <p className="col-span-2">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1",
                          fu.tone
                        )}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", fu.dot)} aria-hidden="true" />
                          {fu.label}
                        </span>
                      </p>
                    )}
                    {r.notes && (
                      <p className="col-span-2 line-clamp-2 italic text-slate-400">“{r.notes}”</p>
                    )}
                    {r.adminNotes && (
                      <p className="col-span-2 line-clamp-3 rounded-lg bg-amber-50/70 px-2.5 py-1.5 text-[11px] text-amber-800 ring-1 ring-amber-100">
                        <span className="font-bold">Note:</span> {r.adminNotes}
                      </p>
                    )}
                  </div>
                  {busyRef === r.refCode ? (
                    <div className="mt-3 flex justify-center py-1.5">
                      <Loader2 className="h-4 w-4 animate-spin text-brand-blue" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${r.phone}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-brand-blue ring-1 ring-blue-200 transition-all duration-300 hover:bg-brand-blue hover:text-white"
                        aria-label={`Call ${r.name}`}
                      >
                        <Phone className="h-4 w-4" aria-hidden="true" />
                      </a>
                      <a
                        href={whatsappHref(r.phone, r.name, r.refCode)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 transition-all duration-300 hover:bg-emerald-500 hover:text-white"
                        aria-label={`WhatsApp ${r.name}`}
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      </a>
                      <SmallAction label="Edit / Reschedule" tone="neutral" onClick={() => openEdit(r)} />
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
              );
            })}
          </div>
        </>
      )}

      {/* ---------- Edit / Reschedule dialog ---------- */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="rounded-2xl border-blue-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2 text-lg text-brand-navy">
              <Pencil className="h-4.5 w-4.5 text-brand-blue" aria-hidden="true" />
              Edit appointment
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-slate-500">
              {editTarget
                ? `${editTarget.refCode} · ${editTarget.name} (${editTarget.phone})`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-date" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Date
              </label>
              <input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                className="mt-1.5 h-11 w-full rounded-xl border border-blue-100 bg-ice px-3 text-sm font-medium tabular-nums text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Time slot</p>
              <Select
                value={editForm.time}
                onValueChange={(v) => setEditForm((f) => ({ ...f, time: v }))}
              >
                <SelectTrigger
                  aria-label="Time slot"
                  className="mt-1.5 h-11 rounded-xl border-blue-100 bg-ice text-sm font-medium text-brand-navy focus-visible:ring-brand-blue/25"
                >
                  <SelectValue placeholder="Pick a slot" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-blue-100">
                  {timeOptions.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Doctor</p>
              <Select
                value={editForm.doctor || "any"}
                onValueChange={(v) => setEditForm((f) => ({ ...f, doctor: v === "any" ? "" : v }))}
              >
                <SelectTrigger
                  aria-label="Assigned doctor"
                  className="mt-1.5 h-11 rounded-xl border-blue-100 bg-ice text-sm font-medium text-brand-navy focus-visible:ring-brand-blue/25"
                >
                  <SelectValue placeholder="Any available doctor" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-blue-100">
                  <SelectItem value="any">Any available doctor</SelectItem>
                  {doctors.map((doc) => (
                    <SelectItem key={doc.slug} value={doc.slug}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Treatment</p>
              <Select
                value={editForm.service || "none"}
                onValueChange={(v) => setEditForm((f) => ({ ...f, service: v === "none" ? "" : v }))}
              >
                <SelectTrigger
                  aria-label="Treatment"
                  className="mt-1.5 h-11 rounded-xl border-blue-100 bg-ice text-sm font-medium text-brand-navy focus-visible:ring-brand-blue/25"
                >
                  <SelectValue placeholder="— none —" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-blue-100">
                  <SelectItem value="none">— none —</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>
                      {s.shortName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="edit-followup" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Follow-up date
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="edit-followup"
                  type="date"
                  value={editForm.followUp}
                  onChange={(e) => setEditForm((f) => ({ ...f, followUp: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-blue-100 bg-ice px-3 text-sm font-medium tabular-nums text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
                />
                {editForm.followUp && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditForm((f) => ({ ...f, followUp: "" }))}
                    className="h-11 shrink-0 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Clear
                  </Button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                The next day the front desk should call this patient — overdue follow-ups
                surface in the Follow-ups queue.
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="edit-admin-notes" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Admin notes <span className="font-normal normal-case text-slate-400">(internal, max 2000 chars)</span>
              </label>
              <Textarea
                id="edit-admin-notes"
                rows={4}
                maxLength={2000}
                value={editForm.adminNotes}
                onChange={(e) => setEditForm((f) => ({ ...f, adminNotes: e.target.value }))}
                placeholder="Call outcomes, preferences, next steps…"
                className="mt-1.5 resize-none border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
              />
            </div>
          </div>

          {editError && (
            <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600 ring-1 ring-rose-100" role="alert">
              {editError}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeEdit}
              disabled={savingEdit}
              className="rounded-full border-blue-200 text-slate-600 hover:bg-blue-50 hover:text-brand-navy"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void saveEdit()}
              disabled={savingEdit}
              className="rounded-full bg-brand-navy font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
            >
              {savingEdit ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Pencil className="h-4 w-4" aria-hidden="true" />
              )}
              {savingEdit ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
