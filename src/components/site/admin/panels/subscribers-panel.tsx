"use client";

/* ------------------------------------------------------------------ */
/*  Subscribers panel — newsletter mailing list                         */
/*  Extracted verbatim from the former monolithic admin page; the      */
/*  shell owns the module header + logout (refresh lives in the        */
/*  PanelToolbar below).                                               */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  CalendarRange,
  Download,
  Loader2,
  Mail,
  Mails,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  type SubscriberRow,
  type SubscriberStats,
  PanelToolbar,
  downloadCsvFile,
  prettyDay,
  relativeTime,
} from "../admin-shared";

export function SubscribersPanel({
  onSessionExpired,
}: {
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
  );
}
