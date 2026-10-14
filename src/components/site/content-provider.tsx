"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  staticBundle,
  type ContentBundle,
} from "@/lib/content/shared";
import { slidesForRoute, type HeroSlide } from "@/lib/data/hero-media";

/* ------------------------------------------------------------------ */
/*  ContentProvider — the live CMS context for the public site.        */
/*                                                                     */
/*  • Initialized from the server-rendered bundle (page.tsx RSC reads  */
/*    the DB via Prisma) → no loading flash, SEO-safe initial HTML.    */
/*  • `refresh()` re-fetches /api/content — used by admin panels after */
/*    saves (live preview) and by a debounced window-focus listener    */
/*    (admin edits appear when returning to the site tab).             */
/*  • Falls back to the static data files when no server bundle is     */
/*    provided (e.g. direct component testing).                        */
/* ------------------------------------------------------------------ */

type ContentContextValue = {
  bundle: ContentBundle;
  ready: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
};

const ContentContext = createContext<ContentContextValue | null>(null);

const FOCUS_REFRESH_MIN_INTERVAL_MS = 10_000;

export function ContentProvider({
  initial,
  children,
}: {
  initial?: ContentBundle;
  children: ReactNode;
}) {
  const [bundle, setBundle] = useState<ContentBundle>(() => initial ?? staticBundle());
  const [refreshing, setRefreshing] = useState(false);
  const lastRefreshRef = useRef<number>(initial ? Date.now() : 0);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      if (res.ok) {
        const next = (await res.json()) as ContentBundle;
        if (next && Array.isArray(next.services)) {
          setBundle(next);
          lastRefreshRef.current = Date.now();
        }
      }
    } catch {
      /* keep serving the current bundle */
    } finally {
      setRefreshing(false);
    }
  }, []);

  /* Pick up fresh content (debounced 10s) when the visitor returns to
     the tab OR navigates within the SPA — so edits made in the admin
     panel (or another tab) appear without a full reload. */
  useEffect(() => {
    const maybeRefresh = () => {
      if (Date.now() - lastRefreshRef.current < FOCUS_REFRESH_MIN_INTERVAL_MS) return;
      void refresh();
    };
    window.addEventListener("focus", maybeRefresh);
    document.addEventListener("visibilitychange", maybeRefresh);
    window.addEventListener("hashchange", maybeRefresh);
    return () => {
      window.removeEventListener("focus", maybeRefresh);
      document.removeEventListener("visibilitychange", maybeRefresh);
      window.removeEventListener("hashchange", maybeRefresh);
    };
  }, [refresh]);

  const value = useMemo<ContentContextValue>(
    () => ({
      bundle,
      ready: Boolean(initial),
      refreshing,
      refresh,
    }),
    [bundle, initial, refreshing, refresh]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error("useContent must be used inside <ContentProvider> (see site-shell).");
  }
  return ctx;
}

/** Direct bundle accessor — convenience for pages that only read data. */
export function useBundle(): ContentBundle {
  return useContent().bundle;
}

/* ------------------------------------------------------------------ */
/*  Route hero slides — DB-managed page backdrops with curated         */
/*  static fallback. segment = first path segment ("about", "blog"…).  */
/* ------------------------------------------------------------------ */

export function useRouteHeroSlides(segment: string): HeroSlide[] {
  const { pageHeroSlides } = useBundle();
  const managed = pageHeroSlides?.[segment];
  if (managed && managed.length > 0) return managed;
  return slidesForRoute(segment);
}
