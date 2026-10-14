"use client";

/* ------------------------------------------------------------------ */
/*  Analytics panel (Dashboard group — read-only, every role).          */
/*                                                                     */
/*  GET /api/admin/analytics?days=7|30&tz=<offset>                      */
/*                                                                     */
/*  First-party, server-side traffic measurement: KPI cards, a daily    */
/*  page-view/events area chart, top pages & searches, devices donut,   */
/*  referrers and a recent-activity feed. tz = the viewer's local       */
/*  UTC offset so day buckets match their calendar (fallback 6=Dhaka).  */
/*                                                                     */
/*  Manual Refresh + Live auto-refresh (60s, paused while the tab is    */
/*  hidden). No mutations happen here — the purge endpoint is not       */
/*  exposed in the UI.                                                  */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CalendarCheck,
  Eye,
  Inbox,
  Languages,
  Loader2,
  Mails,
  MessageCircle,
  MousePointerClick,
  Phone,
  RefreshCw,
  Search,
  Star,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  chartDayLabel,
  EmptyState,
  PanelHeader,
  PanelSkeleton,
  prettyStamp,
  relativeTime,
  StatCard,
  useAdminFetch,
  type PanelProps,
} from "../admin-shared";

/* ------------------------------------------------------------------ */
/*  Response types (mirror GET /api/admin/analytics)                    */
/* ------------------------------------------------------------------ */

type TallyRow = { label: string; count: number };

type AnalyticsData = {
  days: number;
  totalEventsStored: number;
  trackingEnabled: boolean;
  integrations: { ga4: boolean; gtm: boolean; facebook: boolean; tiktok: boolean; telegram: boolean };
  summary: {
    pageViews: number;
    sessions: number;
    searches: number;
    bookingClicks: number;
    callClicks: number;
    appointments: number;
    messages: number;
    reviews: number;
    newsletter: number;
    languageToggles: number;
  };
  daily: { date: string; pageViews: number; events: number; appointments: number }[];
  topPages: TallyRow[];
  topSearches: TallyRow[];
  referrers: TallyRow[];
  devices: TallyRow[];
  recent: {
    type: string;
    path: string | null;
    label: string | null;
    device: string | null;
    createdAt: string;
  }[];
};

/* ------------------------------------------------------------------ */
/*  Brand palette (hex — recharts needs literal colors)                 */
/* ------------------------------------------------------------------ */

const NAVY = "#012c5f";
const BLUE = "#1e7dff";
const ICE = "#cadfff";
const GRID = "#e2e8f0";

const DEVICE_COLORS: Record<string, string> = {
  desktop: NAVY,
  mobile: BLUE,
  tablet: "#7db2ff",
  bot: ICE,
  unknown: "#94a3b8",
};
const FALLBACK_COLORS = [NAVY, BLUE, "#7db2ff", ICE, "#94a3b8"];

/* ------------------------------------------------------------------ */
/*  Recent-activity feed metadata                                       */
/* ------------------------------------------------------------------ */

const EVENT_META: Record<string, { icon: LucideIcon; tone: string; label: string }> = {
  page_view: { icon: Eye, tone: "bg-blue-50 text-brand-blue ring-blue-100", label: "Page view" },
  search: { icon: Search, tone: "bg-indigo-50 text-indigo-600 ring-indigo-100", label: "Search" },
  booking_click: {
    icon: MousePointerClick,
    tone: "bg-amber-50 text-amber-700 ring-amber-200",
    label: "Booking CTA click",
  },
  cta_call: {
    icon: Phone,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    label: "Call link click",
  },
  cta_whatsapp: {
    icon: MessageCircle,
    tone: "bg-green-50 text-green-700 ring-green-200",
    label: "WhatsApp click",
  },
  appointment_booked: {
    icon: CalendarCheck,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    label: "Appointment booked",
  },
  message_sent: {
    icon: Inbox,
    tone: "bg-violet-50 text-violet-700 ring-violet-200",
    label: "Message sent",
  },
  review_submitted: {
    icon: Star,
    tone: "bg-amber-50 text-amber-700 ring-amber-200",
    label: "Review submitted",
  },
  newsletter_signup: {
    icon: Mails,
    tone: "bg-blue-50 text-brand-blue ring-blue-100",
    label: "Newsletter signup",
  },
  language: {
    icon: Languages,
    tone: "bg-slate-100 text-slate-500 ring-slate-200",
    label: "Language switch",
  },
};

/** Secondary line for a feed row — the path, query or source detail. */
function recentDetail(
  row: NonNullable<AnalyticsData["recent"][number]>
): string | null {
  switch (row.type) {
    case "page_view":
      return row.path ?? null;
    case "search":
      return row.label ? `“${row.label}”` : null;
    case "booking_click":
      return row.label ? `Book Appointment · ${row.label}` : "Book Appointment";
    case "cta_call":
      return row.label ? `Phone · ${row.label}` : "Phone tap";
    case "cta_whatsapp":
      return "WhatsApp chat";
    case "appointment_booked":
      return row.label ? `Ref ${row.label}` : null;
    default:
      return row.label ?? row.path ?? null;
  }
}

/* ------------------------------------------------------------------ */
/*  Small local atoms                                                   */
/* ------------------------------------------------------------------ */

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

function RangeChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-9 rounded-full px-4 text-xs font-bold transition-all duration-300",
        active
          ? "bg-brand-navy text-white shadow-md shadow-navy-900/25"
          : "bg-blue-50/70 text-slate-600 hover:bg-blue-100/80 hover:text-brand-navy"
      )}
    >
      {label}
    </button>
  );
}

/** Recharts tooltip styled like the admin cards. */
function ChartTip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-blue-100 bg-white/95 px-3 py-2 shadow-md backdrop-blur">
      <p className="font-heading text-xs font-bold text-brand-navy">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {payload.map((item) => (
          <li
            key={String(item.dataKey)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: item.color ?? item.stroke ?? BLUE }}
              aria-hidden="true"
            />
            {item.name}:
            <span className="tabular-nums text-brand-navy">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One labelled row with a proportional bar (top pages / referrers). */
function TallyRowItem({
  label,
  count,
  max,
  mono,
}: {
  label: string;
  count: number;
  max: number;
  mono?: boolean;
}) {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0;
  return (
    <li className="py-1.5">
      <div className="flex items-center justify-between gap-3">
        <p
          className={cn(
            "min-w-0 truncate text-sm font-medium text-brand-navy",
            mono && "font-mono text-[13px]"
          )}
          title={label}
        >
          {label}
        </p>
        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold tabular-nums text-brand-navy ring-1 ring-blue-100">
          {count}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-blue-100/70" aria-hidden="true">
        <div
          className="h-full rounded-full bg-brand-blue transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

function ListCard({
  title,
  description,
  emptyText,
  rows,
  mono,
}: {
  title: string;
  description?: string;
  emptyText: string;
  rows: TallyRow[];
  mono?: boolean;
}) {
  const max = rows[0]?.count ?? 0;
  return (
    <div className="min-w-0 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
      <p className="font-heading text-sm font-bold text-brand-navy">{title}</p>
      {description ? (
        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{description}</p>
      ) : null}
      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl bg-ice/50 px-3.5 py-3 text-xs leading-relaxed text-slate-400">
          {emptyText}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-blue-50">
          {rows.map((row) => (
            <TallyRowItem
              key={row.label}
              label={row.label === "/" ? "/ — homepage" : row.label}
              count={row.count}
              max={max}
              mono={mono}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function DeviceChip({ device }: { device: string | null }) {
  const label = device ? device.charAt(0).toUpperCase() + device.slice(1) : "Unknown";
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
      {label}
    </span>
  );
}

function RecentRow({ row }: { row: AnalyticsData["recent"][number] }) {
  const meta = EVENT_META[row.type];
  const Icon = meta?.icon ?? Activity;
  const detail = recentDetail(row);
  return (
    <li className="flex items-start gap-3 px-4 py-3 transition-colors duration-200 hover:bg-blue-50/40">
      <span
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
          meta ? meta.tone : "bg-slate-100 text-slate-500 ring-slate-200"
        )}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-navy">{meta?.label ?? row.type}</p>
        {detail ? (
          <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400" title={detail}>
            {detail}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
        <DeviceChip device={row.device} />
        <p
          className="text-[11px] font-medium text-slate-400"
          title={prettyStamp(row.createdAt)}
        >
          {relativeTime(row.createdAt)}
        </p>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                               */
/* ------------------------------------------------------------------ */

type RangeDays = 7 | 30;

export function AnalyticsPanel({ onSessionExpired }: PanelProps) {
  const { get, error, clearError } = useAdminFetch(onSessionExpired);

  const [range, setRange] = useState<RangeDays>(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const loadIdRef = useRef(0);

  /* Day buckets should match the VIEWER's local calendar; the clinic
     default (UTC+6, Dhaka) is the fallback. */
  const [tz] = useState(() => {
    try {
      return -(new Date().getTimezoneOffset() / 60);
    } catch {
      return 6;
    }
  });

  const load = useCallback(async () => {
    const requestId = ++loadIdRef.current;
    setBusy(true);
    try {
      const d = await get<AnalyticsData>(`/api/admin/analytics?days=${range}&tz=${tz}`);
      if (requestId !== loadIdRef.current) return; /* a newer request is in flight */
      if (!d) {
        setLoadFailed(true);
        return;
      }
      setLoadFailed(false);
      setData(d);
      setLoaded(true);
      setLastUpdated(new Date());
    } finally {
      if (requestId === loadIdRef.current) setBusy(false);
    }
  }, [get, range, tz]);

  useEffect(() => {
    void load();
  }, [load]);

  /* Live: re-fetch every 60s, paused while the tab is hidden. */
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [live, load]);

  const chartData = useMemo(
    () => data?.daily.map((d) => ({ ...d, label: chartDayLabel(d.date) })) ?? [],
    [data]
  );
  const deviceTotal = useMemo(
    () => data?.devices.reduce((sum, d) => sum + d.count, 0) ?? 0,
    [data]
  );

  const fmt = (n: number) => n.toLocaleString("en-US");

  /* ---- Boot states ---- */
  if (!loaded || !data) {
    if (loadFailed) {
      return (
        <div className="space-y-4">
          <PanelHeader title="Website Analytics" />
          <ErrorNote message={error ?? "Could not load the analytics data."} />
          <div>
            <Button
              onClick={() => {
                setLoadFailed(false);
                clearError();
                void load();
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
    return <PanelSkeleton rows={6} />;
  }

  const s = data.summary;

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Traffic dashboard"
        description="First-party, privacy-safe traffic — page views, searches, clicks and conversions. No raw IP addresses are stored."
        actions={
          <>
            <button
              type="button"
              role="switch"
              aria-checked={live}
              aria-label="Live auto-refresh"
              title={
                live
                  ? "Auto-refreshes every 60 seconds while this tab is visible"
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
              {live ? "Live · 60s" : "Paused"}
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void load()}
              className="h-11 rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <RefreshCw
                className={cn("h-4 w-4", busy && "animate-spin")}
                aria-hidden="true"
              />
              Refresh
            </Button>
          </>
        }
      />

      {/* Range toggle + freshness */}
      <div className="rounded-2xl border border-blue-100/70 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Range
            </span>
            <RangeChip
              active={range === 7}
              label="7 days"
              onClick={() => setRange(7)}
            />
            <RangeChip
              active={range === 30}
              label="30 days"
              onClick={() => setRange(30)}
            />
          </div>
          <p className="text-xs font-medium text-slate-400">
            {lastUpdated
              ? `Last updated ${lastUpdated.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })} · ${fmt(data.totalEventsStored)} events stored${
                  live ? " · auto-refreshes every 60s" : ""
                }`
              : "Loading…"}
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
          {error}
        </p>
      ) : null}

      {/* Tracking master switch is off → nothing new is recorded */}
      {!data.trackingEnabled ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5"
        >
          <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-500" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-amber-800">
            <span className="font-bold">Tracking is switched off.</span> First-party tracking is
            switched off in Integrations — new events are not being recorded.
          </p>
        </div>
      ) : null}

      {/* ============ KPI CARDS ============ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Eye} label="Page views" value={fmt(s.pageViews)} />
        <StatCard
          icon={Users}
          label="Visitors"
          value={fmt(s.sessions)}
          tone="bg-blue-50 text-brand-blue ring-blue-100"
        />
        <StatCard
          icon={Search}
          label="Searches"
          value={fmt(s.searches)}
          tone="bg-indigo-50 text-indigo-600 ring-indigo-100"
        />
        <StatCard
          icon={CalendarCheck}
          label="Appointments booked"
          value={fmt(s.appointments)}
          tone="bg-emerald-50 text-emerald-700 ring-emerald-200"
        />
        <StatCard
          icon={Phone}
          label="Call / WhatsApp clicks"
          value={fmt(s.callClicks)}
          tone="bg-amber-50 text-amber-700 ring-amber-200"
        />
        <StatCard
          icon={MousePointerClick}
          label="Booking CTA clicks"
          value={fmt(s.bookingClicks)}
          tone="bg-blue-50 text-brand-blue ring-blue-100"
        />
      </div>

      {/* ============ DAILY CHART ============ */}
      <div className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-heading text-sm font-bold text-brand-navy">
              Traffic over the last {range} days
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Daily page views and all recorded events.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: BLUE }} aria-hidden="true" />
              Page views
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: NAVY }} aria-hidden="true" />
              All events
            </span>
          </div>
        </div>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="adcViewsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={ICE} stopOpacity={0.08} />
                </linearGradient>
                <linearGradient id="adcEventsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NAVY} stopOpacity={0.16} />
                  <stop offset="100%" stopColor={NAVY} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: GRID }}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                width={40}
              />
              <Tooltip content={<ChartTip />} cursor={{ stroke: GRID, strokeDasharray: "4 4" }} />
              <Area
                type="monotone"
                dataKey="events"
                name="All events"
                stroke={NAVY}
                strokeWidth={2}
                fill="url(#adcEventsFill)"
              />
              <Area
                type="monotone"
                dataKey="pageViews"
                name="Page views"
                stroke={BLUE}
                strokeWidth={2.4}
                fill="url(#adcViewsFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============ TOP PAGES + SEARCHES ============ */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ListCard
          title="Top pages"
          description="Most viewed pages in this range."
          emptyText="No page views yet — they appear here as visitors browse the website."
          rows={data.topPages}
          mono
        />
        <ListCard
          title="What patients are looking for"
          description="Top site-search queries in this range."
          emptyText="No searches recorded yet — they appear here as visitors use the site search."
          rows={data.topSearches}
        />
      </div>

      {/* ============ DEVICES + REFERRERS ============ */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
          <p className="font-heading text-sm font-bold text-brand-navy">Devices</p>
          <p className="mt-0.5 text-xs text-slate-400">How visitors browse the site.</p>
          {data.devices.length === 0 || deviceTotal === 0 ? (
            <p className="mt-4 rounded-xl bg-ice/50 px-3.5 py-3 text-xs leading-relaxed text-slate-400">
              No device data yet — it appears here as soon as the first visits are recorded.
            </p>
          ) : (
            <div className="mt-3 flex flex-col items-center gap-5 sm:flex-row">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.devices}
                      dataKey="count"
                      nameKey="label"
                      innerRadius="60%"
                      outerRadius="92%"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {data.devices.map((d, i) => (
                        <Cell
                          key={d.label}
                          fill={
                            DEVICE_COLORS[d.label] ??
                            FALLBACK_COLORS[i % FALLBACK_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="w-full flex-1 space-y-2">
                {data.devices.map((d, i) => (
                  <li key={d.label} className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        background:
                          DEVICE_COLORS[d.label] ??
                          FALLBACK_COLORS[i % FALLBACK_COLORS.length],
                      }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium capitalize text-brand-navy">
                      {d.label}
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">
                      {fmt(d.count)}
                    </span>
                    <span className="w-11 shrink-0 text-right text-[11px] font-semibold tabular-nums text-slate-400">
                      {Math.round((d.count / deviceTotal) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <ListCard
          title="Referrers"
          description="Websites that sent visitors here."
          emptyText="No referring sites yet — they appear when visitors arrive from links on other websites. Direct visits leave no referrer."
          rows={data.referrers}
        />
      </div>

      {/* ============ RECENT ACTIVITY ============ */}
      <div className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 sm:px-5">
          <div>
            <p className="font-heading text-sm font-bold text-brand-navy">Recent activity</p>
            <p className="mt-0.5 text-xs text-slate-400">
              The latest {data.recent.length} recorded events.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-brand-navy ring-1 ring-blue-100">
            <ArrowUpRight className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
            Live from the website
          </span>
        </div>
        {data.recent.length === 0 ? (
          <div className="px-4 pb-5 sm:px-5">
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="Events appear here as visitors browse the website — page views, searches, clicks and form submissions."
            />
          </div>
        ) : (
          <div className="max-h-[38rem] overflow-y-auto scroll-area border-t border-blue-100/70">
            <ul className="divide-y divide-blue-50">
              {data.recent.map((row, i) => (
                <RecentRow key={`${row.createdAt}-${row.type}-${i}`} row={row} />
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        Read-only for every staff role — measured server-side, invisible to ad blockers, no
        third-party cookies.
      </p>
    </div>
  );
}
