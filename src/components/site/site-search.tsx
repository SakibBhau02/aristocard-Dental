"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Calculator,
  CalendarCheck,
  CalendarClock,
  CircleHelp,
  ClipboardList,
  Home,
  Images,
  Info,
  LayoutGrid,
  Newspaper,
  Phone,
  Sparkles,
  Stethoscope,
  Users,
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
  filterEntries,
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

export function SiteSearch() {
  const { navigate } = useRouter();
  const { lang, d } = useLang();
  const bn = lang === "bn";
  const t = d.search;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

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

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (next) setQuery("");
  }, []);

  /* --- selection ---------------------------------------------------- */

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      navigate(href);
    },
    [navigate]
  );

  const callClinic = useCallback(() => {
    setOpen(false);
    window.location.href = `tel:${site.phoneRaw}`;
  }, []);

  /* --- index + filtering (multi-word, both languages) --------------- */

  const index = useMemo(() => buildSearchIndex(lang), [lang]);

  const hasQuery = query.trim().length > 0;

  const grouped = useMemo(() => {
    if (!hasQuery) return [];
    const matches = filterEntries(index, query);
    /* group-diverse cap: ≤8 per group, ≤24 overall */
    let budget = MAX_TOTAL;
    const out: { group: SearchGroup; items: SearchEntry[] }[] = [];
    for (const group of SEARCH_GROUP_ORDER) {
      if (budget <= 0) break;
      const items = matches
        .filter((entry) => entry.group === group)
        .slice(0, Math.min(MAX_PER_GROUP, budget));
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
                          onSelect={() => go(entry.href)}
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
