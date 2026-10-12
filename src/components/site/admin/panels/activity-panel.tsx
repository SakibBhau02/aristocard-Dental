"use client";

/* ------------------------------------------------------------------ */
/*  Activity Log panel — the admin audit trail.                         */
/*                                                                     */
/*  • GET /api/admin/activity?limit=100 — newest first, readable by     */
/*    every signed-in staff member.                                    */
/*  • Filter chips: action (created / updated / deleted / reordered /   */
/*    sign-ins / failed sign-ins / sign-outs / uploads) and entity      */
/*    (derived from the data — doctors, blog, auth, …).                 */
/*  • Rows grouped by day with sticky day headers (Today / Yesterday /  */
/*    date). Each row: "12 Oct, 16:28" stamp, actor + @handle + role    */
/*    badge, color-coded action badge, entity chip, audit label.        */
/*  • Manual refresh + Live toggle (30s re-fetch, paused while the      */
/*    browser tab is hidden).                                          */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  History,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  PanelHeader,
  PanelSkeleton,
  RoleBadge,
  type AdminActivityRow,
  type PanelProps,
} from "../admin-shared";

/* ------------------------------------------------------------------ */
/*  Local metadata: actions + entities                                 */
/* ------------------------------------------------------------------ */

const ACTION_ORDER = [
  "create",
  "update",
  "delete",
  "reorder",
  "login",
  "login-failed",
  "logout",
  "upload",
] as const;

const ACTION_META: Record<
  string,
  { chip: string; badge: string; icon: LucideIcon; tone: string }
> = {
  create: {
    chip: "Created",
    badge: "create",
    icon: Plus,
    tone: "bg-green-50 text-green-700 ring-green-200",
  },
  update: {
    chip: "Updated",
    badge: "update",
    icon: Pencil,
    tone: "bg-blue-50 text-brand-blue ring-blue-200",
  },
  delete: {
    chip: "Deleted",
    badge: "delete",
    icon: Trash2,
    tone: "bg-rose-50 text-rose-600 ring-rose-200",
  },
  reorder: {
    chip: "Reordered",
    badge: "reorder",
    icon: ArrowUpDown,
    tone: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  login: {
    chip: "Sign-ins",
    badge: "sign-in",
    icon: LogIn,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  "login-failed": {
    chip: "Failed sign-ins",
    badge: "sign-in failed",
    icon: XCircle,
    tone: "bg-white text-rose-600 ring-rose-300",
  },
  logout: {
    chip: "Sign-outs",
    badge: "sign-out",
    icon: LogOut,
    tone: "bg-slate-100 text-slate-500 ring-slate-200",
  },
  upload: {
    chip: "Uploads",
    badge: "upload",
    icon: Upload,
    tone: "bg-amber-50 text-amber-700 ring-amber-200",
  },
};

const ENTITY_LABELS: Record<string, string> = {
  doctors: "Doctors",
  blog: "Blog",
  faqs: "FAQs",
  cases: "Smile Cases",
  services: "Services",
  pages: "Pages",
  hero: "Hero",
  settings: "Settings",
  auth: "Sign-in",
  upload: "Uploads",
  users: "Staff",
};
const ENTITY_ORDER = Object.keys(ENTITY_LABELS);

function entityLabel(entity: string): string {
  return (
    ENTITY_LABELS[entity] ??
    entity.charAt(0).toUpperCase() + entity.slice(1)
  );
}

/* ------------------------------------------------------------------ */
/*  Local helpers                                                      */
/* ------------------------------------------------------------------ */

/** "12 Oct, 16:28" (client timezone — plain JS, no date lib). */
function auditStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  const month = d.toLocaleDateString("en-US", { month: "short" });
  return `${d.getDate()} ${month}, ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Sticky day header: "Today" / "Yesterday" / "Sun, Oct 12, 2026". */
function dayTitle(d: Date): string {
  if (Number.isNaN(d.getTime())) return "Unknown date";
  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(d)) / 86_400_000
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type DayGroup = { key: string; title: string; rows: AdminActivityRow[] };

/* ------------------------------------------------------------------ */
/*  Presentational atoms                                               */
/* ------------------------------------------------------------------ */

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_META[action];
  const Icon = meta?.icon ?? History;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
        meta ? meta.tone : "bg-slate-100 text-slate-500 ring-slate-200"
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {meta ? meta.badge : action}
    </span>
  );
}

function EntityChip({ entity }: { entity: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
      {entityLabel(entity)}
    </span>
  );
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-300",
        active
          ? "bg-brand-navy text-white shadow-md shadow-navy-900/25"
          : "bg-blue-50/70 text-slate-600 hover:bg-blue-100/80 hover:text-brand-navy"
      )}
    >
      {label}
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
}

function ActivityRow({ row }: { row: AdminActivityRow }) {
  return (
    <li className="flex flex-col gap-1.5 px-4 py-3 transition-colors duration-200 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:gap-4">
      <p className="shrink-0 text-xs font-semibold tabular-nums text-slate-400 sm:w-[7.5rem]">
        {auditStamp(row.createdAt)}
      </p>
      <div className="flex min-w-0 shrink items-center gap-2 sm:w-52 sm:shrink-0">
        <span className="truncate text-sm font-semibold text-brand-navy">
          {row.actorLabel ?? row.actor}
        </span>
        <span className="shrink-0 truncate text-xs text-slate-400">
          @{row.actor}
        </span>
        <RoleBadge role={row.role} />
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        <ActionBadge action={row.action} />
        <EntityChip entity={row.entity} />
      </div>
      <p
        className="min-w-0 flex-1 text-sm leading-snug text-slate-600"
        title={row.label}
      >
        {row.label}
      </p>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */

export function ActivityPanel({ onSessionExpired }: PanelProps) {
  const [rows, setRows] = useState<AdminActivityRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadBusy, setLoadBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [live, setLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const loadIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++loadIdRef.current;
    setLoadBusy(true);
    try {
      const res = await fetch("/api/admin/activity?limit=100");
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { activity?: AdminActivityRow[]; error?: string }
        | null;
      if (!res.ok) {
        throw new Error(data?.error ?? `Request failed (${res.status}).`);
      }
      if (requestId !== loadIdRef.current) return; /* a newer request is in flight */
      setRows(data?.activity ?? []);
      setLoaded(true);
      setLoadError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (requestId !== loadIdRef.current) return;
      setLoadError(
        err instanceof Error ? err.message : "Could not load the activity log."
      );
    } finally {
      if (requestId === loadIdRef.current) setLoadBusy(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  /* Live: re-fetch every 30s, paused while the tab is hidden. */
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 30_000);
    return () => window.clearInterval(id);
  }, [live, load]);

  /* Actions/entities present in the feed (canonical order first). */
  const availableActions = useMemo(() => {
    const present = new Set(rows.map((r) => r.action));
    return ACTION_ORDER.filter((a) => present.has(a));
  }, [rows]);

  const availableEntities = useMemo(() => {
    const present = new Set(rows.map((r) => r.entity));
    const known = ENTITY_ORDER.filter((e) => present.has(e));
    const extra = [...present]
      .filter((e) => !ENTITY_ORDER.includes(e))
      .sort();
    return [...known, ...extra];
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (actionFilter === "all" || r.action === actionFilter) &&
          (entityFilter === "all" || r.entity === entityFilter)
      ),
    [rows, actionFilter, entityFilter]
  );

  /* Chip counts are computed against the OTHER filter so the numbers
     stay meaningful while narrowing down. */
  const actionCounts = useMemo(() => {
    const base = rows.filter(
      (r) => entityFilter === "all" || r.entity === entityFilter
    );
    const counts = new Map<string, number>();
    for (const r of base) counts.set(r.action, (counts.get(r.action) ?? 0) + 1);
    return counts;
  }, [rows, entityFilter]);

  const entityCounts = useMemo(() => {
    const base = rows.filter(
      (r) => actionFilter === "all" || r.action === actionFilter
    );
    const counts = new Map<string, number>();
    for (const r of base) counts.set(r.entity, (counts.get(r.entity) ?? 0) + 1);
    return counts;
  }, [rows, actionFilter]);

  const rowsInEntityFilter = useMemo(
    () => rows.filter((r) => entityFilter === "all" || r.entity === entityFilter),
    [rows, entityFilter]
  );
  const rowsInActionFilter = useMemo(
    () => rows.filter((r) => actionFilter === "all" || r.action === actionFilter),
    [rows, actionFilter]
  );

  /* Newest-first rows → contiguous day buckets in the same order. */
  const dayGroups = useMemo(() => {
    const groups: DayGroup[] = [];
    for (const row of filtered) {
      const d = new Date(row.createdAt);
      const key = Number.isNaN(d.getTime())
        ? "unknown"
        : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.rows.push(row);
      else groups.push({ key, title: dayTitle(d), rows: [row] });
    }
    return groups;
  }, [filtered]);

  const filtersActive = actionFilter !== "all" || entityFilter !== "all";

  /* ---- Boot states ---- */
  if (!loaded) {
    if (loadError) {
      return (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center">
          <p className="font-heading text-lg font-bold text-rose-700">
            Could not load the activity log
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-rose-600">{loadError}</p>
          <Button
            onClick={() => void load()}
            variant="outline"
            size="sm"
            className="mt-5 rounded-full border-rose-200 text-rose-600 hover:bg-rose-100"
          >
            <RefreshCw className={cn("h-4 w-4", loadBusy && "animate-spin")} aria-hidden="true" />
            Try again
          </Button>
        </div>
      );
    }
    return <PanelSkeleton rows={6} />;
  }

  return (
    <div className="space-y-5">
      <PanelHeader
        title="Audit trail"
        description="Every staff sign-in, edit, deletion and upload — newest first, latest 100 events."
        actions={
          <>
            <button
              type="button"
              role="switch"
              aria-checked={live}
              aria-label="Live auto-refresh"
              title={
                live
                  ? "Auto-refreshes every 30 seconds while this tab is visible"
                  : "Auto-refresh is paused"
              }
              onClick={() => setLive((v) => !v)}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full px-4 text-xs font-bold ring-1 transition-all duration-300",
                live
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-slate-50 text-slate-500 ring-slate-200 hover:bg-slate-100"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-2 w-2 rounded-full",
                  live
                    ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"
                    : "bg-slate-300"
                )}
                aria-hidden="true"
              />
              {live ? "Live · 30s" : "Paused"}
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadBusy}
              onClick={() => void load()}
              className="h-11 rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <RefreshCw
                className={cn("h-4 w-4", loadBusy && "animate-spin")}
                aria-hidden="true"
              />
              Refresh
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Action
            </span>
            <FilterChip
              active={actionFilter === "all"}
              label="All"
              count={rowsInEntityFilter.length}
              onClick={() => setActionFilter("all")}
            />
            {availableActions.map((action) => (
              <FilterChip
                key={action}
                active={actionFilter === action}
                label={ACTION_META[action]?.chip ?? action}
                count={actionCounts.get(action) ?? 0}
                onClick={() => setActionFilter(action)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Area
            </span>
            <FilterChip
              active={entityFilter === "all"}
              label="All"
              count={rowsInActionFilter.length}
              onClick={() => setEntityFilter("all")}
            />
            {availableEntities.map((entity) => (
              <FilterChip
                key={entity}
                active={entityFilter === entity}
                label={entityLabel(entity)}
                count={entityCounts.get(entity) ?? 0}
                onClick={() => setEntityFilter(entity)}
              />
            ))}
          </div>
        </div>
        <p className="mt-3 border-t border-blue-50 pt-2.5 text-xs font-medium text-slate-400">
          {lastUpdated
            ? `Last updated ${lastUpdated.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })} · ${filtered.length} of ${rows.length} events${
                live ? " · auto-refreshes every 30s" : ""
              }`
            : "Loading…"}
        </p>
      </div>

      {loadError ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
          {loadError}
        </p>
      ) : null}

      {/* Grouped, scrollable audit list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title={rows.length === 0 ? "No activity yet" : "No events match these filters"}
          description={
            rows.length === 0
              ? "Staff sign-ins and every content change will be recorded here automatically."
              : "Try a different action or area filter."
          }
          action={
            filtersActive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionFilter("all");
                  setEntityFilter("all");
                }}
                className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-sm">
          <div className="max-h-[38rem] overflow-y-auto scroll-area">
            {dayGroups.map((group) => (
              <section key={group.key}>
                <h3 className="sticky top-0 z-10 flex items-center gap-2 border-b border-blue-100/70 bg-ice/95 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-brand-navy backdrop-blur">
                  {group.title}
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-500 ring-1 ring-blue-100">
                    {group.rows.length}
                  </span>
                </h3>
                <ul className="divide-y divide-blue-50">
                  {group.rows.map((row) => (
                    <ActivityRow key={row.id} row={row} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
