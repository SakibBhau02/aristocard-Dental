"use client";

/* ------------------------------------------------------------------ */
/*  Reviews panel — the single place patient reviews are written       */
/*                                                                     */
/*  Reviews ARE the patient stories: one approved row per patient,     */
/*  carrying the treatment they received. Visitors cannot submit       */
/*  anything; the owner adds / edits here and it goes live at once.    */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Download,
  Inbox,
  Loader2,
  MessageSquareQuote,
  Plus,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { services } from "@/lib/data/services";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type ReviewFilter,
  type ReviewRow,
  type ReviewStats,
  PanelToolbar,
  SmallAction,
  StarsRow,
  useAdminToast,
} from "../admin-shared";

/* Treatment suggestions for the editor — the clinic's own service names.
   The field stays free text so older / one-off labels still work. */
const TREATMENTS = services.map((s) => s.shortName);

type Draft = {
  id: string | null;
  name: string;
  rating: number;
  treatment: string;
  title: string;
  message: string;
  approved: boolean;
};

const EMPTY_DRAFT: Draft = {
  id: null,
  name: "",
  rating: 5,
  treatment: "",
  title: "",
  message: "",
  approved: true,
};

export function ReviewsPanel({
  onSessionExpired,
  onPendingChange,
}: {
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
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const loadIdRef = useRef(0);
  const { ok, fail } = useAdminToast();

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

  /* --- create / edit --- */
  function openNew() {
    setFormError(null);
    setDraft({ ...EMPTY_DRAFT });
  }

  function openEdit(r: ReviewRow) {
    setFormError(null);
    setDraft({
      id: r.id,
      name: r.name,
      rating: r.rating,
      treatment: r.treatment ?? "",
      title: r.title ?? "",
      message: r.message,
      approved: r.approved,
    });
  }

  async function saveDraft() {
    if (!draft || saving) return;
    const problems: string[] = [];
    const name = draft.name.trim();
    const message = draft.message.trim();
    if (name.length < 2 || name.length > 60)
      problems.push("Patient name must be 2–60 characters.");
    if (draft.rating < 1 || draft.rating > 5) problems.push("Choose a rating from 1 to 5.");
    if (message.length < 10 || message.length > 600)
      problems.push("Review text must be 10–600 characters.");
    if (problems.length) {
      setFormError(problems[0]);
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: draft.id ? "update" : "create",
          id: draft.id ?? undefined,
          name,
          rating: draft.rating,
          treatment: draft.treatment.trim(),
          title: draft.title.trim(),
          message,
          approved: draft.approved,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      if (!res.ok) throw new Error(data.error || "Could not save the review.");
      ok(draft.id ? "Review updated" : "Review added", "It is live on the site right away.");
      setDraft(null);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the review.");
    } finally {
      setSaving(false);
    }
  }

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
              onClick={openNew}
              className="h-11 rounded-full bg-brand-navy px-5 text-sm font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add review
            </Button>
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
              ? "Add your first patient review — it appears on the website immediately."
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
                        {r.treatment && (
                          <span className="mt-1.5 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-brand-blue ring-1 ring-blue-100">
                            <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
                            {r.treatment}
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
                              <SmallAction
                                label="Edit"
                                tone="neutral"
                                onClick={() => openEdit(r)}
                              />
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
                  {r.treatment && (
                    <span className="mt-2 inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand-blue ring-1 ring-blue-100">
                      <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
                      {r.treatment}
                    </span>
                  )}
                </div>
                {busyId === r.id ? (
                  <div className="mt-3 flex justify-center py-1.5">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-blue" aria-hidden="true" />
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <SmallAction label="Edit" tone="neutral" onClick={() => openEdit(r)} />
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

      {/* ============ ADD / EDIT REVIEW DIALOG ============ */}
      <Dialog
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open) setDraft(null);
        }}
      >
        <DialogContent className="max-h-[88vh] overflow-y-auto rounded-3xl border-blue-100 bg-white p-6 sm:max-w-lg sm:p-8">
          <DialogHeader>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue ring-1 ring-blue-100">
              <MessageSquareQuote className="h-5 w-5" aria-hidden="true" />
            </span>
            <DialogTitle className="font-heading text-xl font-bold text-brand-navy">
              {draft?.id ? "Edit review" : "Add a review"}
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              One review per patient — it carries the treatment they received and appears on the
              website as both a review and a patient story.
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="mt-2 space-y-5">
              <div className="space-y-2">
                <span className="block text-sm font-semibold text-brand-navy">
                  Rating <span className="text-rose-500">*</span>
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const value = i + 1;
                    const active = value <= draft.rating;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                        aria-pressed={draft.rating === value}
                        onClick={(e) => {
                          e.preventDefault();
                          setDraft({ ...draft, rating: value });
                        }}
                        className="rounded-xl p-1 transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
                      >
                        <Star
                          aria-hidden="true"
                          className={cn(
                            "h-7 w-7 transition-colors duration-200",
                            active
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-100 text-slate-300"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rev-name" className="text-sm font-semibold text-brand-navy">
                    Patient name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="rev-name"
                    value={draft.name}
                    maxLength={60}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="R. Ahmed"
                    className="rounded-xl border-blue-100 bg-ice/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rev-treatment" className="text-sm font-semibold text-brand-navy">
                    Treatment received
                  </Label>
                  <Input
                    id="rev-treatment"
                    value={draft.treatment}
                    maxLength={60}
                    list="review-treatment-options"
                    onChange={(e) => setDraft({ ...draft, treatment: e.target.value })}
                    placeholder="e.g. Root Canal Treatment"
                    className="rounded-xl border-blue-100 bg-ice/50"
                  />
                  <datalist id="review-treatment-options">
                    {TREATMENTS.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rev-title" className="text-sm font-semibold text-brand-navy">
                  Headline (optional)
                </Label>
                <Input
                  id="rev-title"
                  value={draft.title}
                  maxLength={80}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Painless root canal, very caring team"
                  className="rounded-xl border-blue-100 bg-ice/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rev-message" className="text-sm font-semibold text-brand-navy">
                  Review <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="rev-message"
                  rows={5}
                  maxLength={600}
                  value={draft.message}
                  onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                  placeholder="What the patient said about their visit…"
                  className="resize-none rounded-xl border-blue-100 bg-ice/50 text-sm leading-relaxed"
                />
                <p className="text-right text-[11px] tabular-nums text-slate-400">
                  {draft.message.length} / 600
                </p>
              </div>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-ice/40 px-4 py-3">
                <span className="text-sm font-semibold text-brand-navy">
                  Show on the website
                </span>
                <Switch
                  checked={draft.approved}
                  onCheckedChange={(v) => setDraft({ ...draft, approved: v })}
                  aria-label="Show this review on the website"
                />
              </label>

              {formError ? (
                <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
                  {formError}
                </p>
              ) : null}

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDraft(null)}
                  className="rounded-full border-blue-200 px-6 font-semibold text-slate-600 hover:bg-blue-50 hover:text-brand-navy"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void saveDraft()}
                  disabled={saving}
                  className="rounded-full bg-brand-blue px-7 font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-brand-navy disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      {draft.id ? "Save changes" : "Add review"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
