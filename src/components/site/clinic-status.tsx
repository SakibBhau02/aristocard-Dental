"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  getClinicStatus,
  formatTimeEn,
  formatTimeBn,
  WEEKDAYS_EN,
  WEEKDAYS_BN,
  type ClinicStatus,
} from "@/lib/clinic-hours";

/* ------------------------------------------------------------------ */
/*  ClinicStatusBadge — live "Open now / Closed" pill (Asia/Dhaka)     */
/*  Re-checks every 30s + on tab focus. SSR-safe (renders neutral      */
/*  placeholder until mounted — no hydration mismatch).                */
/* ------------------------------------------------------------------ */

export function useClinicStatus(): ClinicStatus | null {
  const [status, setStatus] = useState<ClinicStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getClinicStatus());
    update();
    const id = setInterval(update, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") update();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return status;
}

type BadgeProps = {
  /** on-dark: navy surfaces (topbar, footer, navy cards) • on-light: white cards */
  variant?: "on-dark" | "on-light";
  /** Show the closing/opening time after the status word (default true) */
  showTime?: boolean;
  className?: string;
};

export function ClinicStatusBadge({
  variant = "on-dark",
  showTime = true,
  className,
}: BadgeProps) {
  const { d, lang } = useLang();
  const status = useClinicStatus();

  if (!status) {
    /* Neutral placeholder keeps layout stable pre-mount */
    return (
      <span className={cn("inline-flex items-center gap-1.5 opacity-0", className)} aria-hidden="true">
        <span className="status-dot" />
        {d.chrome.statusOpen}
      </span>
    );
  }

  const fmt = (minutes: number) => (lang === "bn" ? formatTimeBn(minutes) : formatTimeEn(minutes));
  let label: string;
  if (status.open) {
    label = d.chrome.statusOpen;
    if (showTime && status.closesMinutes !== null) {
      label += ` · ${d.chrome.statusClosesAt.replace("{time}", fmt(status.closesMinutes))}`;
    }
  } else {
    label = d.chrome.statusClosed;
    if (showTime) {
      const time = fmt(status.opensMinutes);
      label += status.opensIsToday
        ? ` · ${d.chrome.statusOpensAt.replace("{time}", time)}`
        : ` · ${d.chrome.statusOpensDayAt
            .replace("{day}", lang === "bn" ? WEEKDAYS_BN[status.opensDay] : WEEKDAYS_EN[status.opensDay])
            .replace("{time}", time)}`;
    }
  }

  return (
    <span
      role="status"
      aria-live="polite"
      title={d.chrome.statusHint}
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold",
        variant === "on-dark"
          ? status.open
            ? "text-emerald-300"
            : "text-amber-200"
          : status.open
            ? "text-emerald-600"
            : "text-amber-600",
        className
      )}
    >
      <span className="status-dot" data-open={status.open ? "true" : "false"} aria-hidden="true" />
      {label}
    </span>
  );
}
