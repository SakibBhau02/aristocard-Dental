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
/*  History router — clean path URLs on a single Next.js route          */
/*                                                                     */
/*  The whole public site renders inside src/app/page.tsx ("/"), and    */
/*  this client-side router gives every page its own URL (/about,      */
/*  /services/dental-implants, /blog/<slug> …). next.config.ts re-     */
/*  writes unknown paths back to "/" so deep links survive a hard      */
/*  refresh. Every navigation pushes a REAL history entry, so the      */
/*  browser Back/Forward buttons step through pages one at a time      */
/*  (never "all the way back"), and scroll positions are restored      */
/*  manually on Back/Forward.                                          */
/*                                                                     */
/*  Legacy "#/route" hash links (old bookmarks, printed sitemaps,      */
/*  alerts sent before this migration) keep working — they are         */
/*  converted to clean paths on load and on hashchange.                */
/* ------------------------------------------------------------------ */

type RouterState = {
  path: string; // e.g. "/services/dental-implants"
  segments: string[]; // ["services", "dental-implants"]
  query: URLSearchParams;
  navigate: (to: string, opts?: { replace?: boolean }) => void;
};

const RouterContext = createContext<RouterState | null>(null);

/* Parse a path (+ optional search string) into the normalized route. */
function parsePath(
  pathname: string,
  search = ""
): { path: string; query: URLSearchParams } {
  let path = (pathname || "/").trim();
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/+$/, "") || "/";
  return { path, query: new URLSearchParams(search) };
}

/* Read the current route from a Location. Legacy "#/…" hash routes
   (pre-migration links) are honored so old URLs never break.        */
function routeFromLocation(loc: Location): {
  path: string;
  query: URLSearchParams;
} {
  const hash = loc.hash.startsWith("#/") ? loc.hash.slice(1) : "";
  if (hash) {
    const [p, q] = hash.split("?");
    return parsePath(p, q ?? "");
  }
  return parsePath(loc.pathname, loc.search);
}

/* --- module-level external route store --------------------------------
   SSR renders the home route; on the client the store initializes from
   the real URL BEFORE hydration. useSyncExternalStore then hydrates
   against the SERVER snapshot (home — byte-identical to the server
   HTML, so deep-link full loads never throw hydration mismatches) and
   re-renders with the real route immediately after hydration.         */
type RouteSnapshot = { path: string; query: URLSearchParams };

const HOME_SNAPSHOT: RouteSnapshot = {
  path: "/",
  query: new URLSearchParams(),
};

let currentRoute: RouteSnapshot =
  typeof window === "undefined" ? HOME_SNAPSHOT : routeFromLocation(window.location);

const routeListeners = new Set<() => void>();

/* true when the latest route change came from history Back/Forward */
let popNavigation = false;

/* scroll position per route key — restored on Back/Forward */
const scrollMemory = new Map<string, number>();

function routeKey(r: RouteSnapshot): string {
  const q = r.query.toString();
  return q ? `${r.path}?${q}` : r.path;
}

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

function locationUrl(r: RouteSnapshot): string {
  const q = r.query.toString();
  return q ? `${r.path}?${q}` : r.path;
}

/* --- history event handlers (module level) -------------------------- */

function onPopState() {
  const next = routeFromLocation(window.location);
  if (
    next.path === currentRoute.path &&
    next.query.toString() === currentRoute.query.toString()
  ) {
    return;
  }
  /* remember the scroll position of the page we are leaving so a
     later Forward returns to the same reading spot                    */
  scrollMemory.set(routeKey(currentRoute), window.scrollY);
  popNavigation = true;
  setRoute(next);
}

function onHashChange() {
  /* Legacy "#/route" navigation (old bookmarks / manual URL edits).
     Pure "#section" anchors are native in-page jumps — ignored here. */
  if (!window.location.hash.startsWith("#/")) return;
  const next = routeFromLocation(window.location);
  /* the hash assignment itself created a history entry — rewrite it
     to the clean path so the history stack stays consistent           */
  window.history.replaceState(null, "", locationUrl(next));
  if (
    next.path !== currentRoute.path ||
    next.query.toString() !== currentRoute.query.toString()
  ) {
    scrollMemory.set(routeKey(currentRoute), window.scrollY);
    popNavigation = false;
    setRoute(next);
  }
}

/* --- global link interception ----------------------------------------
   Same-origin <a href> links are turned into client-side navigations
   (pushState) so the site behaves like a real multi-page app: no full
   reloads, every click a history entry. Reserved prefixes (/api, /
   _next, /uploads), real files (sitemap.xml, og-image.png …), external
   links, new tabs and modified clicks all fall through to the browser. */
function linkDestination(raw: string): string | null {
  if (raw.startsWith("#/")) return raw.slice(1); // legacy hash link → "/about"
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    if (/^\/(api|_next|uploads)(\/|$)/.test(raw)) return null;
    if (/\/[^/?#]+\.[a-z0-9]+(\?|#|$)/i.test(raw)) return null; // files
    return raw;
  }
  return null;
}

function useLinkInterceptor(navigate: RouterState["navigate"]) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if ((anchor.getAttribute("rel") ?? "").split(/\s+/).includes("external"))
        return;
      const to = linkDestination(anchor.getAttribute("href") ?? "");
      if (!to) return;
      e.preventDefault();
      navigate(to);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(
    subscribeRoute,
    getRouteSnapshot,
    getRouteServerSnapshot
  );

  useEffect(() => {
    /* take full control of scroll restoration — we restore positions
       manually on Back/Forward so reading spots survive navigation    */
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    /* normalize a legacy "#/route" URL (old bookmark) to the clean path */
    if (window.location.hash.startsWith("#/")) {
      window.history.replaceState(
        null,
        "",
        locationUrl(routeFromLocation(window.location))
      );
    }
    /* Catch a URL change that happened during the hydration window. */
    setRoute(routeFromLocation(window.location));

    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    /* accept both "/about" and legacy "#/about" */
    const clean = to.startsWith("#") ? to.slice(1) : to;
    const [rawPath, rawQuery] = clean.split("?");
    const next = parsePath(rawPath, rawQuery ?? "");
    const current = getRouteSnapshot();
    if (
      next.path === current.path &&
      next.query.toString() === current.query.toString()
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    /* remember where we were so Back restores the reading position */
    scrollMemory.set(routeKey(current), window.scrollY);
    popNavigation = false;
    if (opts?.replace) {
      window.history.replaceState(null, "", locationUrl(next));
    } else {
      window.history.pushState(null, "", locationUrl(next));
    }
    setRoute(next);
  }, []);

  useLinkInterceptor(navigate);

  const value = useMemo<RouterState>(() => {
    const segments = state.path.split("/").filter(Boolean);
    return {
      path: state.path,
      segments,
      query: state.query,
      navigate,
    };
  }, [state, navigate]);

  /* Push navigation → top of page. Back/Forward → restore the exact
     reading position saved for that route.                            */
  useEffect(() => {
    if (popNavigation) {
      popNavigation = false;
      const y = scrollMemory.get(routeKey(state)) ?? 0;
      window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [state.path, state.query]);

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

    /* Social meta (og:* / twitter:*) stays in sync with the active route
       so shared links unfurl the right page (AEO/GEO). The canonical URL
       mirrors the sitemap convention: clean paths ("/about"), query
       strings stripped.                                                */
    const hash = window.location.hash;
    const routePath = hash.startsWith("#/")
      ? hash.slice(1).split("?")[0]
      : window.location.pathname || "/";
    const canonicalUrl =
      routePath === "/" ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;
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
