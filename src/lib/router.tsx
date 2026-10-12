"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

/* ------------------------------------------------------------------ */
/*  Lightweight hash router — multi-page experience on a single route  */
/* ------------------------------------------------------------------ */

type RouterState = {
  path: string; // e.g. "/services/dental-implants"
  segments: string[]; // ["services", "dental-implants"]
  query: URLSearchParams;
  navigate: (to: string, opts?: { replace?: boolean }) => void;
};

const RouterContext = createContext<RouterState | null>(null);

function parseHash(hash: string): { path: string; query: URLSearchParams } {
  const raw = hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart] = raw.split("?");
  const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  const query = new URLSearchParams(queryPart ?? "");
  return { path: path.replace(/\/+$/, "") || "/", query };
}

/* --- module-level external route store --------------------------------
   SSR renders the home route; on the client the store initializes from
   location.hash BEFORE hydration. useSyncExternalStore then hydrates
   against the SERVER snapshot (home — byte-identical to the server HTML,
   so deep-link full loads no longer throw hydration mismatches) and
   re-renders with the real route immediately after hydration — the same
   pattern the LanguageProvider uses for the saved language.            */
type RouteSnapshot = { path: string; query: URLSearchParams };

const HOME_SNAPSHOT: RouteSnapshot = {
  path: "/",
  query: new URLSearchParams(),
};

let currentRoute: RouteSnapshot =
  typeof window === "undefined" ? HOME_SNAPSHOT : parseHash(window.location.hash);

const routeListeners = new Set<() => void>();

function subscribeRoute(listener: () => void) {
  routeListeners.add(listener);
  return () => {
    routeListeners.delete(listener);
  };
}

function getRouteSnapshot(): RouteSnapshot {
  return currentRoute;
}

function getRouteServerSnapshot(): RouteSnapshot {
  return HOME_SNAPSHOT;
}

function setRoute(next: RouteSnapshot) {
  if (
    next.path === currentRoute.path &&
    next.query.toString() === currentRoute.query.toString()
  ) {
    return;
  }
  currentRoute = next;
  routeListeners.forEach((fn) => fn());
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(
    subscribeRoute,
    getRouteSnapshot,
    getRouteServerSnapshot
  );

  useEffect(() => {
    const sync = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", sync);
    /* Catch a hash that arrived during the hydration window (between
       HTML load and this listener attaching) — deep-link fragments
       applied pre-hydration or slow connections where the user changes
       the hash first. No-op when already in sync. */
    sync();
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    const target = to.startsWith("#") ? to : `#${to}`;
    if (window.location.hash === target) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (opts?.replace) {
      window.history.replaceState(null, "", target);
      setRoute(parseHash(target));
    } else {
      window.location.hash = target;
    }
  }, []);

  const value = useMemo<RouterState>(() => {
    const segments = state.path.split("/").filter(Boolean);
    return {
      path: state.path,
      segments,
      query: state.query,
      navigate,
    };
  }, [state, navigate]);

  /* Scroll to top on path change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [state.path]);

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

export function useRouter(): RouterState {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Dynamic page meta — SEO title / description per "page"            */
/* ------------------------------------------------------------------ */

const SITE_URL = "https://aristocratdentalcarebd.com";

/* Create-or-update a <meta> tag (name= or property=) in <head>. */
function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string
) {
  let meta = document.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

export function usePageMeta(opts: {
  title: string;
  description?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}) {
  const { title, description, jsonLd } = opts;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const fullTitle = title.includes("Aristocrat")
      ? title
      : `${title} | Aristocrat Dental Care & Orthodontic Center`;
    document.title = fullTitle;

    /* Social meta (og:* / twitter:*) stays in sync with the active hash
       route so shared links unfurl the right page (AEO/GEO). The canonical
       URL mirrors the sitemap convention: "/#<path>" (no hash on home),
       query strings stripped. */
    const path = (window.location.hash.replace(/^#/, "") || "/").split("?")[0];
    const canonicalUrl =
      path === "/" ? `${SITE_URL}/` : `${SITE_URL}/#${path}`;
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("name", "twitter:title", fullTitle);
    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
      upsertMeta("name", "twitter:description", description);
    }
  }, [title, description]);

  /* Inject page-specific JSON-LD (removed on unmount) */
  useEffect(() => {
    if (!jsonLd || typeof document === "undefined") return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.pageSchema = "true";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [jsonLd]);
}
