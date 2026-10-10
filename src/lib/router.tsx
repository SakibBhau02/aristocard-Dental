"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") {
      return { path: "/", query: new URLSearchParams() };
    }
    return parseHash(window.location.hash);
  });

  useEffect(() => {
    const onHashChange = () => {
      setState(parseHash(window.location.hash));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    const target = to.startsWith("#") ? to : `#${to}`;
    if (window.location.hash === target) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (opts?.replace) {
      window.history.replaceState(null, "", target);
      setState(parseHash(target));
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
  }, [state.path, state.query, navigate]);

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

    if (description) {
      let meta = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]'
      );
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
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
