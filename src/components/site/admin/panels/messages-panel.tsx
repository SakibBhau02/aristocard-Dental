"use client";

/* ------------------------------------------------------------------ */
/*  Messages panel — contact-form inbox                                 */
/*  Extracted verbatim from the former monolithic admin page; the      */
/*  shell owns the module header + logout (refresh lives in the        */
/*  PanelToolbar below).                                               */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Inbox,
  Loader2,
  Mail,
  Phone,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  type ContactMessageRow,
  type MessageFilter,
  type MessageStats,
  PanelToolbar,
  SmallAction,
  downloadCsvFile,
  prettyStamp,
} from "../admin-shared";

export function MessagesPanel({
  onSessionExpired,
  onUnhandledChange,
}: {
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
      <PanelToolbar lastUpdated={lastUpdated} loading={loading} onRefresh={load} />

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
  );
}
