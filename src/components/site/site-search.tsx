"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Calculator,
  CalendarCheck,
  CalendarClock,
  CircleHelp,
  ClipboardList,
  History,
  Home,
  Images,
  Info,
  LayoutGrid,
  Newspaper,
  Phone,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "@/lib/router";
import { toBnDigits, useLang } from "@/lib/i18n";
import { site } from "@/lib/site";
import {
  buildSearchIndex,
  filterEntriesScored,
  SEARCH_GROUP_ORDER,
  type SearchEntry,
  type SearchGroup,
} from "@/lib/data/search-index";
import { DynamicIcon } from "@/components/site/icon-map";

/* ------------------------------------------------------------------ */
/*  Global search palette — ⌘K / Ctrl+K, bilingual (EN / বাংলা)        */
/*  Opens via keyboard shortcut or the "adc:open-search" window event   */
/*  (dispatched by the navbar triggers). Navigation always goes through */
/*  the hash router's navigate() — never href="#" anchors.             */
/* ------------------------------------------------------------------ */

/* Palette-local icon resolver: page / doctor / blog / FAQ / quick-action
   icons resolve here; service icons fall through to the shared icon map. */
const ICONS: Record<string, LucideIcon> = {
  Home,
  Info,
  LayoutGrid,
  Images,
  Users,
  Newspaper,
  Calculator,
  CircleHelp,
  ClipboardList,
  CalendarClock,
  Phone,
  Stethoscope,
  BookOpen,
  CalendarCheck,
  Sparkles,
};

const MAX_PER_GROUP = 8;
const MAX_TOTAL = 24;

/* localStorage key + cap for remembered queries (most-recent first). */
const RECENT_KEY = "adc:recent-searches";
const RECENT_MAX = 6;

/* Curated per-language query seeds — every one matches real index entries
   (services / doctors / articles), so a chip tap always yields results. */
const POPULAR_QUERIES: Record<"en" | "bn", string[]> = {
  en: ["Dental implants", "Braces cost", "Root canal", "Invisalign", "Kids dentist", "Teeth whitening"],
  bn: ["ডেন্টাল ইমপ্ল্যান্ট", "ব্রেসের খরচ", "রুট ক্যানেল", "ইনভিজিলাইন", "শিশুদের ডেন্টিস্ট", "দাঁত সাদা করা"],
};

function loadRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((q) => typeof q === "string" && q.trim()).slice(0, RECENT_MAX)
      : [];
  } catch {
    return [];
  }
}

function saveRecent(queries: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(queries));
  } catch {
    /* private mode / storage disabled — silently skip */
  }
}

export function SiteSearch() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.search;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  /* --- global triggers: ⌘K / Ctrl+K + custom event ---------------- */

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (e.repeat) return;
        setOpen((prev) => !prev);
        setQuery("");
      }
    };
    const onOpenSearch = () => {
      setQuery("");
      setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("adc:open-search", onOpenSearch);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("adc:open-search", onOpenSearch);
    };
  }, []);

  /* Refresh remembered queries every time the palette opens (client-only
     read — keeps SSR/hydration deterministic). queueMicrotask defers the
     setState so no cascading render fires synchronously inside the effect
     (same pattern as the RouterProvider hash re-sync). */
  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => setRecent(loadRecent()));
  }, [open]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (next) setQuery("");
  }, []);

  /* --- selection ---------------------------------------------------- */

  const rememberQuery = useCallback((raw: string) => {
    const q = raw.trim().slice(0, 60);
    if (q.length < 2) return;
    setRecent((prev) => {
      const next = [q, ...prev.filter((p) => p !== q)].slice(0, RECENT_MAX);
      saveRecent(next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    saveRecent([]);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      navigate(href);
    },
    [navigate]
  );

  const goFromResult = useCallback(
    (href: string) => {
      rememberQuery(query);
      go(href);
    },
    [go, rememberQuery, query]
  );

  const callClinic = useCallback(() => {
    setOpen(false);
    window.location.href = `tel:${site.phoneRaw}`;
  }, []);

  /* --- index + filtering (multi-word, both languages) --------------- */

  const index = useMemo(() => buildSearchIndex(lang), [lang]);

  const hasQuery = query.trim().length > 0;

  /* Relevance-preserving grouping: groups are ordered by their TOP hit's
     score (ties → SEARCH_GROUP_ORDER), items within a group keep score
     order, caps stay ≤8/group and ≤24 overall. Fixes the round-9 display
     bug where fixed group order threw the ranking away. */
  const grouped = useMemo(() => {
    if (!hasQuery) return [];
    const scored = filterEntriesScored(index, query);
    const byGroup = new Map<SearchGroup, typeof scored>();
    for (const s of scored) {
      const list = byGroup.get(s.entry.group);
      if (list) list.push(s);
      else byGroup.set(s.entry.group, [s]);
    }
    const order = [...byGroup.keys()].sort(
      (a, b) =>
        (byGroup.get(b)?.[0]?.score ?? 0) -
          (byGroup.get(a)?.[0]?.score ?? 0) ||
        SEARCH_GROUP_ORDER.indexOf(a) - SEARCH_GROUP_ORDER.indexOf(b)
    );
    let budget = MAX_TOTAL;
    const out: { group: SearchGroup; items: SearchEntry[] }[] = [];
    for (const group of order) {
      if (budget <= 0) break;
      const items = (byGroup.get(group) ?? [])
        .slice(0, Math.min(MAX_PER_GROUP, budget))
        .map((s) => s.entry);
      if (items.length > 0) {
        out.push({ group, items });
        budget -= items.length;
      }
    }
    return out;
  }, [index, query, hasQuery]);

  const renderedCount = useMemo(
    () => grouped.reduce((sum, g) => sum + g.items.length, 0),
    [grouped]
  );

  const groupLabels: Record<SearchGroup, string> = {
    pages: t.groupPages,
    services: t.groupServices,
    doctors: t.groupDoctors,
    blog: t.groupBlog,
    faqs: t.groupFaqs,
  };

  /* --- quick actions (empty state) ----------------------------------- */

  const quickActions = useMemo(
    () => [
      {
        id: "qa-book",
        icon: CalendarCheck,
        tileClass: "bg-blue-50 text-brand-blue ring-blue-100",
        label: t.actionBook,
        run: () => go("/appointment"),
      },
      {
        id: "qa-estimate",
        icon: Calculator,
        tileClass: "bg-teal-50 text-teal-600 ring-teal-100",
        label: t.actionEstimate,
        run: () => go("/estimator"),
      },
      {
        id: "qa-quiz",
        icon: Sparkles,
        tileClass: "bg-amber-50 text-amber-600 ring-amber-100",
        label: t.actionQuiz,
        run: () => go("/assessment"),
      },
      {
        id: "qa-call",
        icon: Phone,
        tileClass: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        label: t.actionCall,
        run: callClinic,
      },
    ],
    [t, go, callClinic]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-2xl border-blue-100 bg-white p-0 shadow-[0_24px_80px_-24px_rgba(0,32,96,0.35)] max-w-[calc(100%-2rem)] sm:max-w-xl sm:rounded-3xl"
      >
        <DialogTitle className="sr-only">{t.openSearch}</DialogTitle>
        <DialogDescription className="sr-only">
          {t.placeholder}
        </DialogDescription>

        <Command
          shouldFilter={false}
          vimBindings={false}
          className="rounded-none bg-white **:data-[slot=command-input-wrapper]:h-14 **:data-[slot=command-input-wrapper]:border-blue-100 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-input]]:h-14 [&_[cmdk-input]]:text-base [&_[cmdk-input]]:font-medium"
        >
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={t.placeholder}
            aria-label={t.openSearch}
          />

          <CommandList className="max-h-[min(60vh,400px)] px-2 pb-2">
            {hasQuery ? (
              grouped.length > 0 ? (
                grouped.map(({ group, items }, gi) => (
                  <Fragment key={group}>
                    {gi > 0 && <CommandSeparator className="bg-blue-50" />}
                    <CommandGroup heading={groupLabels[group]}>
                      {items.map((entry) => (
                        <CommandItem
                          key={entry.id}
                          value={entry.id}
                          onSelect={() => goFromResult(entry.href)}
                          className="group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 data-[selected=true]:bg-blue-50/80 data-[selected=true]:text-brand-navy"
                        >
                          <span
                            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-gold opacity-0 transition-opacity duration-150 group-data-[selected=true]:opacity-100"
                            aria-hidden="true"
                          />
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-blue ring-1 ring-blue-100 transition-colors group-data-[selected=true]:bg-white">
                            <EntryIcon entry={entry} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-brand-navy">
                              {entry.title}
                            </span>
                            {entry.description && (
                              <span className="block truncate text-xs text-slate-500">
                                {entry.description}
                              </span>
                            )}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Fragment>
                ))
              ) : (
                <CommandEmpty className="py-10">
                  <span className="block text-sm font-semibold text-brand-navy">
                    {t.noResults}
                  </span>
                  <span className="mt-1.5 block text-xs text-slate-500">
                    {t.noResultsHint.replace(
                      "{phone}",
                      bn ? toBnDigits(site.phone) : site.phone
                    )}
                  </span>
                </CommandEmpty>
              )
            ) : (
              <Fragment>
                <CommandGroup heading={t.quickActions}>
                  {quickActions.map((action) => (
                    <CommandItem
                      key={action.id}
                      value={action.id}
                      onSelect={action.run}
                      className="group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 data-[selected=true]:bg-blue-50/80 data-[selected=true]:text-brand-navy"
                    >
                      <span
                        className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-gold opacity-0 transition-opacity duration-150 group-data-[selected=true]:opacity-100"
                        aria-hidden="true"
                      />
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors group-data-[selected=true]:bg-white ${action.tileClass}`}
                      >
                        {/* text-current → inherits the tile color (the item's
                            default svg rule only recolors icons without a text- class) */}
                        <action.icon className="h-4 w-4 text-current" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-brand-navy">
                        {action.label}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>

                {/* remembered queries — tap to re-run, heading button clears */}
                {recent.length > 0 && (
                  <Fragment>
                    <CommandSeparator className="bg-blue-50" />
                    <CommandGroup
                      heading={
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5">
                            <History className="h-3 w-3 text-slate-400" aria-hidden="true" />
                            {t.recentSearches}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearRecent();
                            }}
                            aria-label={t.clearRecent}
                            title={t.clearRecent}
                            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-slate-400 transition-colors hover:bg-blue-50 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                            {bn ? "মুছুন" : "clear"}
                          </button>
                        </span>
                      }
                    >
                      {recent.map((q) => (
                        <CommandItem
                          key={`recent:${q}`}
                          value={`recent:${q}`}
                          onSelect={() => setQuery(q)}
                          className="group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 data-[selected=true]:bg-blue-50/80 data-[selected=true]:text-brand-navy"
                        >
                          <span
                            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-gold opacity-0 transition-opacity duration-150 group-data-[selected=true]:opacity-100"
                            aria-hidden="true"
                          />
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-slate-200 transition-colors group-data-[selected=true]:bg-white group-data-[selected=true]:text-brand-blue">
                            <History className="h-4 w-4 text-current" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-600 group-data-[selected=true]:text-brand-navy">
                            {q}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Fragment>
                )}

                {/* curated query seeds — one-tap discovery for first-time visitors */}
                <div className="px-3 pb-1 pt-3">
                  <p className="flex items-center gap-1.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <TrendingUp className="h-3 w-3" aria-hidden="true" />
                    {t.popularSearches}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_QUERIES[bn ? "bn" : "en"].map((q) => (
                      <button
                        key={`pop:${q}`}
                        type="button"
                        onClick={() => setQuery(q)}
                        className="rounded-full border border-blue-100 bg-blue-50/60 px-3 py-1.5 text-xs font-medium text-brand-navy transition-all hover:border-blue-200 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 active:scale-[0.97]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </Fragment>
            )}
          </CommandList>

          {/* footer: result count + keyboard hints */}
          <div className="flex items-center justify-between gap-3 border-t border-blue-100/80 px-4 py-2.5 text-[11px] text-slate-400">
            <span className="truncate font-medium">
              {hasQuery
                ? t.resultsCount.replace(
                    "{count}",
                    bn ? toBnDigits(renderedCount) : String(renderedCount)
                  )
                : `⌘K ${t.shortcutHint}`}
            </span>
            <span className="hidden shrink-0 items-center gap-3 sm:flex">
              <span className="flex items-center gap-1">
                <kbd className="kbd-key">
                  ↵
                </kbd>
                {t.hintNavigate}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="kbd-key">
                  esc
                </kbd>
                {t.hintClose}
              </span>
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/* Entry icon: palette-local map first (pages / doctors / blog / FAQs),
   then the shared site icon map (services), then Sparkles fallback. */
function EntryIcon({ entry }: { entry: SearchEntry }) {
  const LocalIcon = entry.icon ? ICONS[entry.icon] : undefined;
  /* text-current → icons inherit the tile's color (the CommandItem default
     only recolors svgs without a text- class) */
  if (LocalIcon)
    return <LocalIcon className="h-4 w-4 text-current" aria-hidden="true" />;
  return (
    <DynamicIcon name={entry.icon ?? "Sparkles"} className="h-4 w-4 text-current" />
  );
}
