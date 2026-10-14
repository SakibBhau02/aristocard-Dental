"use client";

/* ------------------------------------------------------------------ */
/*  Overview panel — cross-module KPIs, 14-day trend, status mix        */
/*  (the default landing module after unlocking)                        */
/*  Extracted verbatim from the former monolithic admin page; the      */
/*  shell now owns the module header + logout, so this file keeps a    */
/*  slim refresh/last-updated toolbar instead of the old hero band.    */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Clock,
  Inbox,
  LayoutDashboard,
  Loader2,
  Mails,
  PieChart,
  RefreshCw,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/router";
import {
  type AdminView,
  type OverviewData,
  type Stats,
  PanelToolbar,
  chartDayLabel,
  localToday,
  prettyDay,
  topRoundedBarPath,
} from "../admin-shared";

export function OverviewPanel({
  onSessionExpired,
  onNavigate,
  onBadgeCounts,
}: {
  onSessionExpired: () => void;
  onNavigate: (view: AdminView) => void;
  onBadgeCounts: (appointments: number, reviews: number, messages: number) => void;
}) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const loadIdRef = useRef(0);
  const { navigate } = useRouter();

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
      <PanelToolbar lastUpdated={lastUpdated} loading={loading} onRefresh={load} />

      {/* KPI stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
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

      {/* Today at a glance — the owner's daily morning strip */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-blue-100/70 bg-white px-5 py-4 shadow-sm"
        >
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
            Today at a glance
          </p>
          <span className="inline-flex items-center gap-2 text-sm text-slate-600">
            <CalendarClock className="h-4 w-4 text-brand-navy" aria-hidden="true" />
            <strong className="font-heading text-base font-bold tabular-nums text-brand-navy">
              {data.todaysAppointments ?? data.appointmentStats.today}
            </strong>
            appointments today
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4 text-amber-500" aria-hidden="true" />
            <strong className="font-heading text-base font-bold tabular-nums text-amber-600">
              {data.appointmentStats.pending}
            </strong>
            pending confirmations
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-2 text-sm",
              (data.overdueFollowUps ?? 0) > 0 ? "text-rose-600" : "text-slate-600"
            )}
          >
            <Inbox className="h-4 w-4 text-rose-500" aria-hidden="true" />
            <strong
              className={cn(
                "font-heading text-base font-bold tabular-nums",
                (data.overdueFollowUps ?? 0) > 0 ? "text-rose-600" : "text-brand-navy"
              )}
            >
              {data.overdueFollowUps ?? 0}
            </strong>
            overdue follow-up{(data.overdueFollowUps ?? 0) === 1 ? "" : "s"}
          </span>
          <Button
            type="button"
            onClick={() => navigate("/admin?view=appointments&followups=1")}
            className="ml-auto h-10 rounded-full bg-brand-navy px-4 text-xs font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
          >
            Open follow-ups queue
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </motion.div>
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
          <div className="mt-6 grid gap-4 lg:grid-cols-5">
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
