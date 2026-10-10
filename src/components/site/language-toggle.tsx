"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { useLang, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Language toggle — EN ⇄ বাংলা                                       */
/*  pill: segmented control (desktop top bar / mobile drawer)          */
/*  compact: globe icon button (mobile navbar)                         */
/* ------------------------------------------------------------------ */

export function LanguageToggle({
  variant = "pill",
  className,
}: {
  variant?: "pill" | "compact";
  className?: string;
}) {
  const { lang, setLang, d } = useLang();

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => setLang(lang === "en" ? "bn" : "en")}
        aria-label={lang === "en" ? d.chrome.switchToBn : d.chrome.switchToEn}
        title={lang === "en" ? d.chrome.switchToBn : d.chrome.switchToEn}
        className={cn(
          "group relative inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-brand-navy ring-1 ring-blue-100 transition-all duration-300 hover:bg-blue-50 hover:ring-brand-blue/40",
          className
        )}
      >
        <Languages className="h-4.5 w-4.5 text-brand-blue" aria-hidden="true" />
        <span className="text-xs font-bold tracking-wide">
          {lang === "en" ? "বাংলা" : "EN"}
        </span>
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={d.chrome.langLabel}
      className={cn(
        "relative flex items-center gap-0.5 rounded-full bg-white/10 p-1 ring-1 ring-white/20",
        className
      )}
    >
      {(["en", "bn"] as Lang[]).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={active}
            className="relative rounded-full px-3 py-1 text-[11px] font-bold leading-5 transition-colors duration-300"
          >
            {active && (
              <motion.span
                layoutId={typeof className === "string" && className ? `lang-pill-${className}` : "lang-pill"}
                className="absolute inset-0 rounded-full bg-white shadow-md"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span
              className={cn(
                "relative z-10 transition-colors duration-300",
                active ? "text-brand-navy" : "text-blue-100/80 hover:text-white"
              )}
            >
              {l === "en" ? "EN" : "বাংলা"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
