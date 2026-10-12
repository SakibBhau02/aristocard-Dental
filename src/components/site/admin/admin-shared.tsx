"use client";

/* ------------------------------------------------------------------ */
/*  Admin shared layer — UI atoms, row types and small helpers used     */
/*  by every admin panel (shell + extracted views + CMS editors).      */
/*  Keep this file client-safe and free of panel imports.              */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Loader2,
  Minus,
  RefreshCw,
  RotateCcw,
  Save,
  Star,
  TrendingDown,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  View keys + common panel props                                      */
/* ------------------------------------------------------------------ */

/** Every admin sidebar module (panels switch on this union). */
export type AdminView =
  | "overview"
  | "appointments"
  | "reviews"
  | "messages"
  | "subscribers"
  | "patients"
  | "doctors"
  | "blog"
  | "faqs"
  | "cases"
  | "services"
  | "homepage"
  | "about"
  | "hero"
  | "settings";

/** Props every panel understands (the shell owns login/logout). */
export type PanelProps = {
  onSessionExpired: () => void;
};

/* ------------------------------------------------------------------ */
/*  Row types (moved verbatim from the former monolithic admin page)    */
/* ------------------------------------------------------------------ */

export type AppointmentRow = {
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

export type Stats = {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  today: number;
  upcoming: number;
};

export type ReviewRow = {
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

export type ReviewStats = {
  total: number;
  pending: number;
  approved: number;
  average: number;
};

export type OverviewData = {
  appointmentStats: Stats;
  reviewStats: {
    total: number;
    pendingApproval: number;
    approved: number;
    avgRating: number;
  };
  messageStats: { total: number; unhandled: number };
  subscriberStats: { total: number };
  patientStats: { total: number };
  trend: { date: string; count: number }[];
  topServices: { slug: string; name: string; count: number }[];
  generatedAt: string;
};

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
};

export type MessageStats = {
  total: number;
  unhandled: number;
  handled: number;
  today: number;
};

export type SubscriberRow = {
  id: string;
  email: string;
  createdAt: string;
};

export type SubscriberStats = {
  total: number;
  last7Days: number;
  last30Days: number;
};

export type PatientRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  appointmentCount: number;
};

export type PatientStats = {
  total: number;
  newThisWeek: number;
  withAppointments: number;
};

export type PatientDetail = {
  patient: PatientRow;
  appointments: AppointmentRow[];
};

export type ReviewFilter = "ALL" | "PENDING" | "APPROVED";
export type MessageFilter = "ALL" | "NEW" | "HANDLED";
export type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

/* ------------------------------------------------------------------ */
/*  Small shared constants                                             */
/* ------------------------------------------------------------------ */

export const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-blue-50 text-brand-blue ring-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-600 ring-rose-200",
};

/* ------------------------------------------------------------------ */
/*  Date helpers (client timezone) — moved verbatim                     */
/* ------------------------------------------------------------------ */

function toIsoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function localToday(): string {
  return toIsoDate(new Date());
}

function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
}

/** Date-range presets (computed client-side, staff's local timezone). */
export type DatePreset = "all" | "today" | "next7" | "next30" | "past30" | "custom";

export const DATE_PRESETS: {
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

/* ------------------------------------------------------------------ */
/*  Formatting helpers — moved verbatim                                 */
/* ------------------------------------------------------------------ */

/** "Oct 12, 2026" from an ISO date or full timestamp. */
export function prettyDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Oct 12, 2026 · 4:26 PM" from an ISO timestamp. */
export function prettyStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${prettyDay(iso)} · ${d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

/** "3 days ago" style relative label (best-effort, local clock). */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} wk ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.round(months / 12)} yr ago`;
}

/** "Mon 29" chart label from a YYYY-MM-DD date. */
export function chartDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  const weekday = dt.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
  });
  return `${weekday} ${d}`;
}

/** Avatar initials, e.g. "Demo Patient" → "DP". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

/** SVG rect path with rounded TOP corners only (for the trend bars). */
export function topRoundedBarPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): string {
  const rr = Math.min(r, h / 2, w / 2);
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    `L ${x + w - rr} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `L ${x + w} ${y + h}`,
    "Z",
  ].join(" ");
}

/** Shared CSV download — the filename comes from Content-Disposition. */
export async function downloadCsvFile(
  path: string,
  fallbackName: string
): Promise<"ok" | "unauthorized" | "error"> {
  try {
    const res = await fetch(path);
    if (res.status === 401) return "unauthorized";
    if (!res.ok) return "error";
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const filename =
      /filename="([^"]+)"/.exec(disposition)?.[1] ?? fallbackName;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return "ok";
  } catch {
    return "error";
  }
}

/* ------------------------------------------------------------------ */
/*  Tiny presentational helpers — moved verbatim                        */
/* ------------------------------------------------------------------ */

export function SmallAction({
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

export function StarsRow({ value }: { value: number }) {
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

/* ------------------------------------------------------------------ */
/*  useAdminFetch — cookie-auth wrappers for the admin CRUD APIs        */
/*  (same-origin fetch; 401 routes to onUnauthorized so the shell can   */
/*   return to the login gate)                                          */
/* ------------------------------------------------------------------ */

export function useAdminFetch(onUnauthorized: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onAuthRef = useRef(onUnauthorized);
  onAuthRef.current = onUnauthorized;

  const handle401 = useCallback((res: Response): boolean => {
    if (res.status === 401) {
      onAuthRef.current();
      return true;
    }
    return false;
  }, []);

  const get = useCallback(
    async <T,>(path: string): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(path);
        if (handle401(res)) return null;
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            (data as { error?: string } | null)?.error ?? `Request failed (${res.status}).`
          );
        }
        return data as T;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handle401]
  );

  const post = useCallback(
    async <T,>(
      path: string,
      payload: unknown
    ): Promise<{ ok: boolean; data: T | null; status: number }> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload ?? {}),
        });
        if (handle401(res)) return { ok: false, data: null, status: 401 };
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const message =
            (data as { error?: string } | null)?.error ?? `Request failed (${res.status}).`;
          setError(message);
          return { ok: false, data: data as T | null, status: res.status };
        }
        return { ok: true, data: data as T, status: res.status };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed.");
        return { ok: false, data: null, status: 0 };
      } finally {
        setLoading(false);
      }
    },
    [handle401]
  );

  const del = useCallback(
    async <T,>(path: string): Promise<{ ok: boolean; data: T | null; status: number }> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(path, { method: "DELETE" });
        if (handle401(res)) return { ok: false, data: null, status: 401 };
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const message =
            (data as { error?: string } | null)?.error ?? `Request failed (${res.status}).`;
          setError(message);
          return { ok: false, data: data as T | null, status: res.status };
        }
        return { ok: true, data: data as T, status: res.status };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed.");
        return { ok: false, data: null, status: 0 };
      } finally {
        setLoading(false);
      }
    },
    [handle401]
  );

  const clearError = useCallback(() => setError(null), []);

  return { get, post, del, loading, error, handle401, clearError };
}

/* ------------------------------------------------------------------ */
/*  adminToast — thin helpers over the site-wide shadcn toaster         */
/*  (same useToast system the public pages use)                         */
/* ------------------------------------------------------------------ */

export function useAdminToast() {
  const { toast } = useToast();
  return useMemo(
    () => ({
      toast,
      ok: (title: string, description?: string) => toast({ title, description }),
      fail: (title: string, description?: string) =>
        toast({ title, description, variant: "destructive" }),
    }),
    [toast]
  );
}

/* ------------------------------------------------------------------ */
/*  PanelHeader — module-local heading inside a panel body              */
/* ------------------------------------------------------------------ */

export function PanelHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h2 className="font-heading text-base font-bold text-brand-navy">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PanelToolbar — refresh + "last updated" row shared by live panels   */
/* ------------------------------------------------------------------ */

export function PanelToolbar({
  lastUpdated,
  loading,
  onRefresh,
}: {
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs font-medium text-slate-400">
        {lastUpdated
          ? `Last updated ${lastUpdated.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })} · auto-refreshes every 60s`
          : "Loading…"}
      </p>
      <Button
        onClick={onRefresh}
        disabled={loading}
        variant="outline"
        size="sm"
        className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
      >
        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" />
        Refresh
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StatCard — KPI card matching the Overview styling                   */
/* ------------------------------------------------------------------ */

export function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: string;
  trend?: { value: string; direction: "up" | "down" | "flat" };
}) {
  return (
    <div className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-[0_14px_36px_-20px_rgba(0,32,96,0.25)]">
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1",
            tone ?? "text-brand-navy bg-ice ring-blue-100"
          )}
        >
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
              trend.direction === "up"
                ? "bg-emerald-50 text-emerald-700"
                : trend.direction === "down"
                  ? "bg-rose-50 text-rose-600"
                  : "bg-slate-100 text-slate-500"
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
            ) : trend.direction === "down" ? (
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Minus className="h-3 w-3" aria-hidden="true" />
            )}
            {trend.value}
          </span>
        ) : null}
      </div>
      <p className="font-heading mt-2.5 text-2xl font-bold tabular-nums text-brand-navy">
        {value}
      </p>
      <p className="text-[11px] font-semibold uppercase leading-snug tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ConfirmDeleteDialog — destructive AlertDialog with loading state    */
/* ------------------------------------------------------------------ */

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete this item?",
  description,
  confirmLabel = "Delete",
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description: React.ReactNode;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl border-blue-100 sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-lg text-brand-navy">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-slate-500">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="rounded-full hover:bg-blue-50 hover:text-brand-navy"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              /* keep the dialog open while the delete request runs */
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="rounded-full bg-rose-600 text-white shadow-md shadow-rose-900/25 hover:bg-rose-700 focus-visible:ring-rose-300 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ------------------------------------------------------------------ */
/*  ImageUploadField — upload via /api/admin/upload + manual path       */
/* ------------------------------------------------------------------ */

export function ImageUploadField({
  value,
  onChange,
  label,
  hint,
  onUnauthorized,
}: {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  label?: string;
  hint?: string;
  onUnauthorized?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { fail } = useAdminToast();

  async function uploadFile(file: File) {
    if (uploading) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (res.status === 401) {
        onUnauthorized?.();
        fail("Session expired", "Please sign in again and retry the upload.");
        return;
      }
      if (!res.ok || !data?.url) {
        throw new Error(data?.error ?? "The upload was rejected by the server.");
      }
      onChange(data.url);
    } catch (err) {
      fail("Upload failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="min-w-0">
      {label ? (
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      ) : null}
      {hint ? <p className="mt-0.5 text-xs text-slate-400">{hint}</p> : null}
      <div className="mt-2 flex flex-wrap items-start gap-4">
        {/* Preview thumbnail */}
        <div className="relative h-24 w-24 shrink-0">
          <div
            className={cn(
              "h-24 w-24 overflow-hidden rounded-xl bg-ice ring-1",
              value ? "ring-blue-200" : "ring-inset ring-blue-200/70"
            )}
          >
            {value ? (
              <Image
                src={value}
                alt="Selected image preview"
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-blue-200 text-slate-300">
                <Upload className="h-6 w-6" aria-hidden="true" />
              </div>
            )}
          </div>
          {value ? (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              title="Remove image"
              aria-label="Remove image"
              className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-rose-600 shadow ring-1 ring-rose-200 transition hover:bg-rose-50"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-brand-blue" aria-label="Uploading" />
            </div>
          ) : null}
        </div>

        {/* Controls */}
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(file);
            }}
          />
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-4 w-4" aria-hidden="true" />
              )}
              {uploading ? "Uploading…" : "Upload image"}
            </Button>
          </div>
          <Input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            placeholder="/images/example.png — or an /uploads/… path"
            aria-label="Image path"
            className="h-9 rounded-xl border-blue-100 bg-ice text-xs text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:ring-brand-blue/25"
          />
          <p className="text-[11px] leading-relaxed text-slate-400">
            PNG, JPG, WEBP or GIF — uploads land in <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-500">/uploads</code>; you can also paste an existing path from <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-500">/public</code>.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BilingualField — EN + optional বাংলা inputs side by side            */
/* ------------------------------------------------------------------ */

export function BilingualField({
  label,
  enValue,
  bnValue,
  onEnChange,
  onBnChange,
  textarea,
  placeholder,
  rows = 4,
  maxLength,
}: {
  label: string;
  enValue: string;
  bnValue?: string;
  onEnChange: (value: string) => void;
  onBnChange?: (value: string) => void;
  textarea?: boolean;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  const withBn = typeof onBnChange === "function";
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <div className={cn("mt-1.5 grid gap-2", withBn && "sm:grid-cols-2")}>
        <label className="min-w-0 block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            English
          </span>
          {textarea ? (
            <Textarea
              value={enValue}
              onChange={(e) => onEnChange(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              maxLength={maxLength}
              className="mt-1 border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
            />
          ) : (
            <Input
              value={enValue}
              onChange={(e) => onEnChange(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              className="mt-1 border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
            />
          )}
        </label>
        {withBn ? (
          <label className="min-w-0 block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              বাংলা
            </span>
            {textarea ? (
              <Textarea
                value={bnValue ?? ""}
                onChange={(e) => onBnChange?.(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                maxLength={maxLength}
                lang="bn"
                className="mt-1 border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
              />
            ) : (
              <Input
                value={bnValue ?? ""}
                onChange={(e) => onBnChange?.(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                lang="bn"
                className="mt-1 border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
              />
            )}
          </label>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SaveBar — sticky bottom bar with dirty state + Reset / Save         */
/* ------------------------------------------------------------------ */

export function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
  saveLabel = "Save changes",
  resetLabel = "Reset",
  dirtyHint = "Unsaved changes",
  savedHint = "All changes saved",
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  saveLabel?: string;
  resetLabel?: string;
  dirtyHint?: string;
  savedHint?: string;
}) {
  return (
    <div className="sticky bottom-4 z-20 mt-6">
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border bg-white/95 px-4 py-3 shadow-[0_18px_44px_-20px_rgba(0,32,96,0.4)] backdrop-blur transition-colors duration-300",
          dirty ? "border-amber-200" : "border-blue-100/70"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex h-2.5 w-2.5 shrink-0 rounded-full transition-colors duration-300",
            dirty ? "bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.25)]" : "bg-slate-200"
          )}
        />
        <p className="text-xs font-semibold text-slate-500">
          {dirty ? dirtyHint : savedHint}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!dirty || saving}
            onClick={onReset}
            className="rounded-full border-blue-200 text-slate-600 hover:bg-blue-50 hover:text-brand-navy"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {resetLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!dirty || saving}
            onClick={onSave}
            className="rounded-full bg-brand-navy font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {saving ? "Saving…" : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  EmptyState — icon + title + description + optional action           */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "blue",
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "blue" | "amber";
}) {
  return (
    <div className="rounded-3xl border border-dashed border-blue-200 bg-white/60 py-14 text-center">
      <span
        className={cn(
          "mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1",
          tone === "amber"
            ? "bg-amber-50 text-amber-500 ring-amber-100"
            : "bg-blue-50 text-brand-blue ring-blue-100"
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="font-heading mt-4 text-lg font-bold text-brand-navy">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PanelSkeleton — loading placeholder for panel bodies                */
/* ------------------------------------------------------------------ */

export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading module">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-44 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="rounded-2xl border border-blue-100/70 bg-white p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-12 w-full rounded-xl", i < rows - 1 && "mb-2.5")}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WiredStub — proves a CMS module endpoint is reachable + counted     */
/*  (placeholder panels; subagents 3-b / 3-c replace these files)       */
/* ------------------------------------------------------------------ */

export function WiredStub({
  endpoint,
  icon: Icon,
  title,
  hint,
  summarize,
  onSessionExpired,
}: {
  endpoint: string;
  icon: LucideIcon;
  title: string;
  hint?: string;
  summarize: (data: Record<string, unknown>) => string;
  onSessionExpired: () => void;
}) {
  const [phase, setPhase] = useState<"loading" | "error" | "ready">("loading");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const summarizeRef = useRef(summarize);
  summarizeRef.current = summarize;
  const expiredRef = useRef(onSessionExpired);
  expiredRef.current = onSessionExpired;

  useEffect(() => {
    let cancelled = false;
    setPhase("loading");
    (async () => {
      try {
        const res = await fetch(endpoint);
        if (res.status === 401) {
          if (!cancelled) expiredRef.current();
          return;
        }
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(
            (data as { error?: string } | null)?.error ?? `Request failed (${res.status}).`
          );
        }
        if (cancelled) return;
        setSummary(summarizeRef.current((data ?? {}) as Record<string, unknown>));
        setPhase("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load this module.");
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [endpoint, tick]);

  if (phase === "loading") return <PanelSkeleton />;

  if (phase === "error") {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center">
        <p className="font-heading text-lg font-bold text-rose-700">
          Could not reach {title}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-rose-600">{error}</p>
        <Button
          onClick={() => setTick((t) => t + 1)}
          variant="outline"
          size="sm"
          className="mt-5 rounded-full border-rose-200 text-rose-600 hover:bg-rose-100"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6">
      <EmptyState
        icon={Icon}
        title="Editor landing here"
        description={
          hint ??
          "Module wired and authenticated — the full editor for this section arrives with this update."
        }
      />
      <div className="mt-4 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-brand-navy ring-1 ring-blue-100">
          <BadgeCheck className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
          {summary}
        </span>
      </div>
    </div>
  );
}
