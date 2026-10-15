"use client";

/* ------------------------------------------------------------------ */
/*  First-party analytics beacon (client side)                          */
/*                                                                     */
/*  Fire-and-forget POST /api/track events: page views, searches, CTA   */
/*  clicks. Uses sendBeacon when available so navigations never drop    */
/*  events. Never throws, never blocks the UI. Also mirrors page        */
/*  views / searches into the third-party pixels (gtag / fbq / ttq)     */
/*  when those snippets have been configured by the admin.              */
/* ------------------------------------------------------------------ */

export type TrackType =
  | "page_view"
  | "search"
  | "cta_call"
  | "cta_whatsapp"
  | "booking_click"
  | "language";

type WindowWithPixels = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  ttq?: { page: () => void; track?: (event: string, data?: unknown) => void };
};

const SID_KEY = "adc-sid";

function getSessionId(): string {
  try {
    const existing = window.localStorage.getItem(SID_KEY);
    if (existing && /^[A-Za-z0-9_-]{6,64}$/.test(existing)) return existing;
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(SID_KEY, fresh);
    return fresh;
  } catch {
    return "anon";
  }
}

function currentPath(): string {
  /* Clean-path routing — the route lives in the pathname. A legacy
     "#/route" hash (old bookmark still mid-normalization) is honored
     as a fallback so no page_view is lost. Admin routes are dropped
     server-side. */
  const hash = window.location.hash;
  if (hash.startsWith("#/")) return hash.slice(1).slice(0, 200);
  return (window.location.pathname || "/").slice(0, 200);
}

/** Queue coalescing: identical beacons within 800ms are dropped. */
const recent = new Map<string, number>();

export function track(
  type: TrackType,
  label?: string | null,
  meta?: Record<string, unknown> | null
): void {
  if (typeof window === "undefined") return;
  try {
    const path = currentPath();
    const dedupeKey = `${type}:${path}:${label ?? ""}`;
    const now = Date.now();
    const last = recent.get(dedupeKey) ?? 0;
    if (now - last < 800) return;
    recent.set(dedupeKey, now);
    if (recent.size > 200) recent.clear();

    const payload = JSON.stringify({
      type,
      path,
      label: typeof label === "string" ? label.slice(0, 200) : null,
      session: getSessionId(),
      referrer: (document.referrer || "").slice(0, 300) || null,
      meta: meta ?? null,
    });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => undefined);
    }
  } catch {
    /* analytics must never break the site */
  }
}

/** Mirror a page view into GA4 / Meta Pixel / TikTok Pixel when present. */
export function syncAnalyticsPageView(path: string): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as WindowWithPixels;
    w.gtag?.("event", "page_view", { page_path: path });
    w.fbq?.("track", "PageView");
    w.ttq?.page();
  } catch {
    /* ignore third-party failures */
  }
}

/** Mirror a site search into GA4 (search_term) + Meta (Search). */
export function syncAnalyticsSearch(query: string): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as WindowWithPixels;
    w.gtag?.("event", "search", { search_term: query });
    w.fbq?.("track", "Search", { search_string: query });
  } catch {
    /* ignore */
  }
}
