"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { dictionary, type Dictionary, type Lang } from "@/lib/data/dictionary";

/* ------------------------------------------------------------------ */
/*  Lightweight i18n — English / বাংলা toggle (client-side)            */
/*  External-store pattern: SSR-safe, no setState-in-effect            */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "adc-lang";

/* --- module-level external store --------------------------------- */

let currentLang: Lang = "en";
const listeners = new Set<() => void>();

function readStored(): Lang {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "bn" ? "bn" : "en";
  } catch {
    return "en";
  }
}

/* Initialize from localStorage before first client render (after hydration
   React re-renders with the real snapshot — no hydration mismatch). */
if (typeof window !== "undefined") {
  currentLang = readStored();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Lang {
  return currentLang;
}

function getServerSnapshot(): Lang {
  return "en";
}

function setLangInternal(l: Lang) {
  if (l === currentLang) return;
  currentLang = l;
  try {
    window.localStorage.setItem(STORAGE_KEY, l);
  } catch {
    /* private mode — ignore */
  }
  listeners.forEach((fn) => fn());
}

/* ------------------------------------------------------------------ */
/*  Provider + hook                                                    */
/* ------------------------------------------------------------------ */

type I18nState = {
  lang: Lang;
  /** Full dictionary slice for the active language */
  d: Dictionary;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

const I18nContext = createContext<I18nState | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /* Keep <html lang> in sync (external system update — allowed in effect) */
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangInternal(l), []);
  const toggle = useCallback(
    () => setLangInternal(currentLang === "en" ? "bn" : "en"),
    []
  );

  const value = useMemo<I18nState>(
    () => ({ lang, d: dictionary[lang], setLang, toggle }),
    [lang, setLang, toggle]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLang(): I18nState {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Bangla digit conversion — 0-9 → ০-৯                                */
/* ------------------------------------------------------------------ */

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBnDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (dg) => BN_DIGITS[Number(dg)]);
}

/** Localized number with thousands separators (Bangla digits when bn) */
export function localizedNumber(
  value: number,
  lang: Lang,
  opts?: { decimals?: number }
): string {
  const str = value.toLocaleString("en-US", {
    minimumFractionDigits: opts?.decimals ?? 0,
    maximumFractionDigits: opts?.decimals ?? 0,
  });
  return lang === "bn" ? toBnDigits(str) : str;
}
