import type { NextRequest } from "next/server";

/* ------------------------------------------------------------------ */
/*  In-memory sliding-window rate limiter (per process)                */
/*  Suitable for a single-instance deployment — simple, no Redis.      */
/* ------------------------------------------------------------------ */

type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the oldest request in the window expires (for Retry-After). */
  retryAfterSec: number;
};

/* key → timestamps (ms) of accepted requests inside the current window */
const hits = new Map<string, number[]>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const IDLE_TTL_MS = 30 * 60 * 1000; // drop keys with no hits in 30 min

let lastCleanup = Date.now();

function maybeCleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, timestamps] of hits) {
    const newest = timestamps[timestamps.length - 1] ?? 0;
    if (now - newest > IDLE_TTL_MS) hits.delete(key);
  }
}

/**
 * Sliding-window check. Records a hit when allowed.
 * Keys are namespaced by callers (e.g. "review:<ip>") so different
 * routes can use different limits independently.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  maybeCleanup(now);

  const timestamps = (hits.get(key) ?? []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= limit) {
    /* blocked — the caller must wait until the oldest hit ages out */
    const oldest = timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return { allowed: true, retryAfterSec: 0 };
}

/* ------------------------------------------------------------------ */
/*  Client IP — behind the Caddy gateway                               */
/* ------------------------------------------------------------------ */

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  return "local";
}
