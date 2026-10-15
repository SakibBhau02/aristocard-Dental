"use client";

/* ------------------------------------------------------------------ */
/*  Homepage content editor (Content → Homepage)                        */
/*  GET  /api/admin/pages → { home, about } (defaults merged)           */
/*  POST /api/admin/pages { key: "home", data: <complete object> }      */
/*  Section-grouped bilingual form — empty Bangla twins are pruned on   */
/*  save so the public site falls back to English via pickBn().         */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  CircleHelp,
  HeartHandshake,
  Home,
  Images,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Stethoscope,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContent } from "@/components/site/content-provider";
import type {
  FacilityContent,
  HomeContent,
  SectionHead,
  StatItem,
  WhyContent,
} from "@/lib/content/shared";
import {
  BilingualField,
  PanelHeader,
  PanelSkeleton,
  SaveBar,
  useAdminFetch,
  useAdminToast,
  type PanelProps,
} from "../admin-shared";

/* Icon keys that actually resolve in the site's icon-map (DynamicIcon
   silently falls back to Sparkles for unknown keys, so only these are
   offered). */
const HIGHLIGHT_ICONS = [
  "ShieldCheck",
  "Microscope",
  "HeartHandshake",
  "BadgeCheck",
  "Sparkles",
  "Smile",
  "Crown",
  "Gem",
  "Zap",
  "Leaf",
  "Activity",
  "Baby",
  "Anchor",
  "Grid3x3",
  "Scissors",
] as const;

const MAX_STATS = 4;
const MAX_HIGHLIGHTS = 4;
const MAX_FACILITY_CARDS = 3;

/* ------------------------------------------------------------------ */
/*  Local helpers                                                       */
/* ------------------------------------------------------------------ */

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Drop empty optional Bangla twins (…Bn keys) so the site falls back to EN. */
function pruneBangla<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => pruneBangla(item)) as unknown as T;
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim() === "" && key.endsWith("Bn")) continue;
      out[key] = pruneBangla(v);
    }
    return out as T;
  }
  return value;
}

/** Complete payload sent to POST /api/admin/pages (trust lists normalized). */
function buildPayload(form: HomeContent): HomeContent {
  const trust = form.hero.trust.map((t) => t.trim()).filter((t) => t.length > 0);
  const trustBnRaw = form.hero.trustBn ?? [];
  const hasAnyBn = trustBnRaw.some((t) => t.trim().length > 0);
  const hero: HomeContent["hero"] = {
    ...form.hero,
    trust,
    trustBn: hasAnyBn
      ? trust.map((t, i) =>
          trustBnRaw[i] && trustBnRaw[i].trim().length > 0 ? trustBnRaw[i].trim() : t
        )
      : undefined,
  };
  const stats = form.stats.map((s) => ({
    ...s,
    label: s.label.trim(),
    labelBn: s.labelBn?.trim() ? s.labelBn : undefined,
  }));
  return pruneBangla({ ...form, hero, stats });
}

function ErrorNote({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="rounded-2xl border-rose-200">
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

/** Collapsible form group card with an "edited" dot in the header. */
function FormSection({
  icon: Icon,
  title,
  description,
  edited,
  defaultOpen = false,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  edited?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-sm"
    >
      <CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-blue-50/40 sm:px-5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ice text-brand-navy ring-1 ring-blue-100">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-heading block text-sm font-bold text-brand-navy">
            {title}
          </span>
          {description ? (
            <span className="mt-0.5 block truncate text-xs text-slate-400">{description}</span>
          ) : null}
        </span>
        {edited ? (
          <span
            title="This section has unsaved edits"
            className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.25)]"
          />
        ) : null}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-blue-100/70">
        <div className="space-y-4 px-4 py-5 sm:px-5">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="-mt-1 text-xs leading-relaxed text-slate-400">{children}</p>;
}

function MiniField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="min-w-0 block">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

/** Numeric input that keeps a raw string mirror for smooth typing. */
function NumberInput({
  value,
  onChange,
  ariaLabel,
  placeholder,
}: {
  value: number | undefined;
  onChange: (value: number) => void;
  ariaLabel: string;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState<string | null>(null);
  const shown = raw ?? (value === undefined ? "" : String(value));
  return (
    <Input
      inputMode="decimal"
      value={shown}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => {
        setRaw(e.target.value);
        const n = Number(e.target.value);
        onChange(e.target.value.trim() === "" ? 0 : Number.isFinite(n) ? n : 0);
      }}
      onBlur={() => setRaw(null)}
      className="mt-1 h-9 border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
    />
  );
}

function RowRemoveButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-9 w-9 shrink-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}

function IconSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className="mt-1 h-9 w-full rounded-xl border-blue-100 bg-ice text-sm text-brand-navy focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
      >
        <SelectValue placeholder="Pick an icon" />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-blue-100">
        {HIGHLIGHT_ICONS.map((key) => (
          <SelectItem key={key} value={key}>
            {key}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Eyebrow / two-part title / description / optional CTA — one section head. */
function SectionHeadFields({
  head,
  onChange,
  withCta,
}: {
  head: SectionHead;
  onChange: (patch: Partial<SectionHead>) => void;
  withCta?: boolean;
}) {
  return (
    <div className="space-y-4">
      <BilingualField
        label="Eyebrow"
        enValue={head.eyebrow}
        bnValue={head.eyebrowBn}
        onEnChange={(v) => onChange({ eyebrow: v })}
        onBnChange={(v) => onChange({ eyebrowBn: v })}
      />
      <BilingualField
        label="Title — part A"
        enValue={head.titleA}
        bnValue={head.titleABn}
        onEnChange={(v) => onChange({ titleA: v })}
        onBnChange={(v) => onChange({ titleABn: v })}
      />
      <div>
        <BilingualField
          label="Title — part B"
          enValue={head.titleB}
          bnValue={head.titleBBn}
          onEnChange={(v) => onChange({ titleB: v })}
          onBnChange={(v) => onChange({ titleBBn: v })}
        />
        <Hint>Rendered as the gold accent part of the heading.</Hint>
      </div>
      <BilingualField
        label="Description"
        textarea
        rows={3}
        enValue={head.description}
        bnValue={head.descriptionBn}
        onEnChange={(v) => onChange({ description: v })}
        onBnChange={(v) => onChange({ descriptionBn: v })}
      />
      {withCta ? (
        <BilingualField
          label="Button label (optional)"
          enValue={head.cta ?? ""}
          bnValue={head.ctaBn}
          onEnChange={(v) => onChange({ cta: v })}
          onBnChange={(v) => onChange({ ctaBn: v })}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                               */
/* ------------------------------------------------------------------ */

export function HomepagePanel({ onSessionExpired }: PanelProps) {
  const { get, post, error, clearError } = useAdminFetch(onSessionExpired);
  const { ok, fail } = useAdminToast();
  const { refresh } = useContent();

  const [snapshot, setSnapshot] = useState<HomeContent | null>(null);
  const [form, setForm] = useState<HomeContent | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadTick, setLoadTick] = useState(0);
  const [saving, setSaving] = useState(false);

  /* Initial fetch (+ manual retry). The async IIFE keeps every setState
     behind an await so the effect stays purely a subscription. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await get<{ home: HomeContent }>("/api/admin/pages");
      if (cancelled) return;
      if (!data) {
        setLoadFailed(true);
        return;
      }
      setLoadFailed(false);
      setSnapshot(clone(data.home));
      setForm(clone(data.home));
    })();
    return () => {
      cancelled = true;
    };
  }, [get, loadTick]);

  const dirty = useMemo(
    () => (snapshot && form ? JSON.stringify(form) !== JSON.stringify(snapshot) : false),
    [snapshot, form]
  );

  const groupDirty = useCallback(
    (pick: (h: HomeContent) => unknown) =>
      snapshot && form ? JSON.stringify(pick(form)) !== JSON.stringify(pick(snapshot)) : false,
    [snapshot, form]
  );

  async function save() {
    if (!form || saving) return;
    setSaving(true);
    const payload = buildPayload(form);
    const res = await post<{ error?: string }>("/api/admin/pages", {
      key: "home",
      data: payload,
    });
    setSaving(false);
    if (res.ok) {
      setSnapshot(payload);
      setForm(clone(payload));
      ok("Homepage saved", "The live site now shows your changes.");
      await refresh();
    } else {
      fail("Could not save homepage", res.data?.error ?? "Please try again.");
    }
  }

  function reset() {
    if (snapshot) setForm(clone(snapshot));
    clearError();
  }

  /* ---- hero ---- */
  const setHero = <K extends keyof HomeContent["hero"]>(
    key: K,
    value: HomeContent["hero"][K]
  ) => setForm((f) => (f ? { ...f, hero: { ...f.hero, [key]: value } } : f));

  const setTrustEn = (index: number, value: string) =>
    setForm((f) => {
      if (!f) return f;
      const trust = f.hero.trust.map((t, i) => (i === index ? value : t));
      return { ...f, hero: { ...f.hero, trust } };
    });

  const setTrustBn = (index: number, value: string) =>
    setForm((f) => {
      if (!f) return f;
      const trustBn = f.hero.trust.map((_, i) =>
        i === index ? value : f.hero.trustBn?.[i] ?? ""
      );
      return { ...f, hero: { ...f.hero, trustBn } };
    });

  const addTrust = () =>
    setForm((f) => {
      if (!f) return f;
      const trustBn = f.hero.trustBn ?? f.hero.trust.map(() => "");
      return { ...f, hero: { ...f.hero, trust: [...f.hero.trust, ""], trustBn: [...trustBn, ""] } };
    });

  const removeTrust = (index: number) =>
    setForm((f) => {
      if (!f) return f;
      const cut = <T,>(arr: T[]) => arr.filter((_, i) => i !== index);
      return {
        ...f,
        hero: {
          ...f.hero,
          trust: cut(f.hero.trust),
          trustBn: f.hero.trustBn ? cut(f.hero.trustBn) : undefined,
        },
      };
    });

  /* ---- stats ---- */
  const setStat = (index: number, patch: Partial<StatItem>) =>
    setForm((f) =>
      f ? { ...f, stats: f.stats.map((s, i) => (i === index ? { ...s, ...patch } : s)) } : f
    );

  const addStat = () =>
    setForm((f) =>
      f && f.stats.length < MAX_STATS
        ? { ...f, stats: [...f.stats, { value: 0, suffix: "+", label: "" }] }
        : f
    );

  const removeStat = (index: number) =>
    setForm((f) =>
      f ? { ...f, stats: f.stats.filter((_, i) => i !== index) } : f
    );

  /* ---- why ---- */
  const setWhy = <K extends keyof WhyContent>(key: K, value: WhyContent[K]) =>
    setForm((f) => (f ? { ...f, why: { ...f.why, [key]: value } } : f));

  const setHighlight = (index: number, patch: Partial<WhyContent["highlights"][number]>) =>
    setForm((f) =>
      f
        ? {
            ...f,
            why: {
              ...f.why,
              highlights: f.why.highlights.map((h, i) => (i === index ? { ...h, ...patch } : h)),
            },
          }
        : f
    );

  const addHighlight = () =>
    setForm((f) =>
      f && f.why.highlights.length < MAX_HIGHLIGHTS
        ? {
            ...f,
            why: {
              ...f.why,
              highlights: [
                ...f.why.highlights,
                { icon: "ShieldCheck", title: "", description: "" },
              ],
            },
          }
        : f
    );

  const removeHighlight = (index: number) =>
    setForm((f) =>
      f
        ? { ...f, why: { ...f.why, highlights: f.why.highlights.filter((_, i) => i !== index) } }
        : f
    );

  /* ---- section heads ---- */
  const setSection = <K extends "services" | "facility" | "galleryPreview" | "testimonials" | "doctors" | "faq">(
    key: K,
    patch: Partial<HomeContent[K]>
  ) => setForm((f) => (f ? { ...f, [key]: { ...f[key], ...patch } } : f));

  const setFacilityCard = (index: number, patch: Partial<FacilityContent["cards"][number]>) =>
    setForm((f) =>
      f
        ? {
            ...f,
            facility: {
              ...f.facility,
              cards: f.facility.cards.map((c, i) => (i === index ? { ...c, ...patch } : c)),
            },
          }
        : f
    );

  const addFacilityCard = () =>
    setForm((f) =>
      f && f.facility.cards.length < MAX_FACILITY_CARDS
        ? {
            ...f,
            facility: { ...f.facility, cards: [...f.facility.cards, { title: "", text: "" }] },
          }
        : f
    );

  const removeFacilityCard = (index: number) =>
    setForm((f) =>
      f
        ? { ...f, facility: { ...f.facility, cards: f.facility.cards.filter((_, i) => i !== index) } }
        : f
    );

  /* ---- render ---- */

  if (!snapshot || !form) {
    if (loadFailed) {
      return (
        <div className="space-y-4">
          <PanelHeader title="Homepage Content" />
          <ErrorNote message={error ?? "Could not load the homepage content."} />
          <div>
            <Button
              onClick={() => {
                setLoadFailed(false);
                clearError();
                setLoadTick((t) => t + 1);
              }}
              variant="outline"
              size="sm"
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        </div>
      );
    }
    return <PanelSkeleton />;
  }

  const hero = form.hero;

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Homepage Content"
        description="Hero copy, stat counters, why-choose-us and every section heading on the landing page — saves go live instantly."
      />
      {error ? <ErrorNote message={error} /> : null}

      {/* ============ HERO ============ */}
      <FormSection
        icon={Home}
        title="Hero"
        description="Badge, two-part headline, description, CTAs and trust chips"
        edited={groupDirty((h) => h.hero)}
        defaultOpen
      >
        <BilingualField
          label="Badge"
          enValue={hero.badge}
          bnValue={hero.badgeBn}
          onEnChange={(v) => setHero("badge", v)}
          onBnChange={(v) => setHero("badgeBn", v)}
        />
        <BilingualField
          label="Headline — part A"
          enValue={hero.titleA}
          bnValue={hero.titleABn}
          onEnChange={(v) => setHero("titleA", v)}
          onBnChange={(v) => setHero("titleABn", v)}
        />
        <div>
          <BilingualField
            label="Headline — part B"
            enValue={hero.titleB}
            bnValue={hero.titleBBn}
            onEnChange={(v) => setHero("titleB", v)}
            onBnChange={(v) => setHero("titleBBn", v)}
          />
          <Hint>Shown in gold after part A, e.g. “Excellence in Every Smile”.</Hint>
        </div>
        <BilingualField
          label="Description"
          textarea
          rows={4}
          enValue={hero.description}
          bnValue={hero.descriptionBn}
          onEnChange={(v) => setHero("description", v)}
          onBnChange={(v) => setHero("descriptionBn", v)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <BilingualField
            label="Primary button"
            enValue={hero.ctaBook}
            bnValue={hero.ctaBookBn}
            onEnChange={(v) => setHero("ctaBook", v)}
            onBnChange={(v) => setHero("ctaBookBn", v)}
          />
          <BilingualField
            label="Secondary button"
            enValue={hero.ctaExplore}
            bnValue={hero.ctaExploreBn}
            onEnChange={(v) => setHero("ctaExplore", v)}
            onBnChange={(v) => setHero("ctaExploreBn", v)}
          />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Trust chips
          </p>
          <Hint>Short reassurance chips under the hero buttons — Bangla is optional per chip.</Hint>
          <div className="mt-2 space-y-2">
            {hero.trust.map((chip, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  value={chip}
                  onChange={(e) => setTrustEn(i, e.target.value)}
                  placeholder={`English chip ${i + 1}`}
                  aria-label={`Trust chip ${i + 1} English`}
                  className="h-9 rounded-xl border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                />
                <Input
                  value={hero.trustBn?.[i] ?? ""}
                  onChange={(e) => setTrustBn(i, e.target.value)}
                  placeholder="বাংলা (optional)"
                  lang="bn"
                  aria-label={`Trust chip ${i + 1} Bangla`}
                  className="h-9 rounded-xl border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                />
                <RowRemoveButton onClick={() => removeTrust(i)} label={`Remove trust chip ${i + 1}`} />
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTrust}
            className="mt-2 rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add chip
          </Button>
        </div>
      </FormSection>

      {/* ============ STATS ============ */}
      <FormSection
        icon={TrendingUp}
        title="Stats"
        description="Counter strip under the hero (keep 4 for a balanced layout)"
        edited={groupDirty((h) => h.stats)}
      >
        <Hint>
          Values render with Bangla digit conversion on the বাংলা site. “Decimals” controls
          how many decimal places are animated (e.g. 4.9 ★ rating).
        </Hint>
        <div className="space-y-3">
          {form.stats.map((stat, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="grid grid-cols-3 gap-2">
                <MiniField label={`Stat ${i + 1} value`}>
                  <NumberInput
                    value={stat.value}
                    onChange={(v) => setStat(i, { value: v })}
                    ariaLabel={`Stat ${i + 1} value`}
                  />
                </MiniField>
                <MiniField label="Suffix">
                  <Input
                    value={stat.suffix}
                    onChange={(e) => setStat(i, { suffix: e.target.value })}
                    placeholder="+"
                    aria-label={`Stat ${i + 1} suffix`}
                    className="mt-1 h-9 rounded-xl border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                  />
                </MiniField>
                <MiniField label="Decimals">
                  <NumberInput
                    value={stat.decimals}
                    onChange={(v) => setStat(i, { decimals: v })}
                    ariaLabel={`Stat ${i + 1} decimals`}
                    placeholder="0"
                  />
                </MiniField>
              </div>
              <BilingualField
                label="Label"
                enValue={stat.label}
                bnValue={stat.labelBn}
                onEnChange={(v) => setStat(i, { label: v })}
                onBnChange={(v) => setStat(i, { labelBn: v })}
              />
              <div className="flex justify-end">
                <RowRemoveButton onClick={() => removeStat(i)} label={`Remove stat ${i + 1}`} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={form.stats.length >= MAX_STATS}
            onClick={addStat}
            className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add stat
          </Button>
          {form.stats.length >= MAX_STATS ? (
            <Hint>Capped at {MAX_STATS} — the strip is laid out as a 4-column grid.</Hint>
          ) : null}
        </div>
      </FormSection>

      {/* ============ WHY CHOOSE US ============ */}
      <FormSection
        icon={HeartHandshake}
        title="Why Choose Us"
        description="Section head, quote card and four highlight cards"
        edited={groupDirty((h) => h.why)}
      >
        <BilingualField
          label="Eyebrow"
          enValue={form.why.eyebrow}
          bnValue={form.why.eyebrowBn}
          onEnChange={(v) => setWhy("eyebrow", v)}
          onBnChange={(v) => setWhy("eyebrowBn", v)}
        />
        <BilingualField
          label="Title — part A"
          enValue={form.why.titleA}
          bnValue={form.why.titleABn}
          onEnChange={(v) => setWhy("titleA", v)}
          onBnChange={(v) => setWhy("titleABn", v)}
        />
        <div>
          <BilingualField
            label="Title — part B"
            enValue={form.why.titleB}
            bnValue={form.why.titleBBn}
            onEnChange={(v) => setWhy("titleB", v)}
            onBnChange={(v) => setWhy("titleBBn", v)}
          />
          <Hint>Rendered as the gold accent part of the heading.</Hint>
        </div>
        <BilingualField
          label="Description"
          textarea
          rows={3}
          enValue={form.why.description}
          bnValue={form.why.descriptionBn}
          onEnChange={(v) => setWhy("description", v)}
          onBnChange={(v) => setWhy("descriptionBn", v)}
        />
        <BilingualField
          label="Quote"
          textarea
          rows={3}
          enValue={form.why.quote}
          bnValue={form.why.quoteBn}
          onEnChange={(v) => setWhy("quote", v)}
          onBnChange={(v) => setWhy("quoteBn", v)}
        />
        <BilingualField
          label="Quote attributed to"
          enValue={form.why.quoteBy}
          bnValue={form.why.quoteByBn}
          onEnChange={(v) => setWhy("quoteBy", v)}
          onBnChange={(v) => setWhy("quoteByBn", v)}
        />
        <BilingualField
          label="Rating note"
          enValue={form.why.ratingNote}
          bnValue={form.why.ratingNoteBn}
          onEnChange={(v) => setWhy("ratingNote", v)}
          onBnChange={(v) => setWhy("ratingNoteBn", v)}
        />
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Highlight cards
          </p>
          {form.why.highlights.map((h, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                <MiniField label="Icon">
                  <IconSelect
                    value={h.icon}
                    onChange={(v) => setHighlight(i, { icon: v })}
                    ariaLabel={`Highlight ${i + 1} icon`}
                  />
                </MiniField>
                <BilingualField
                  label="Title"
                  enValue={h.title}
                  bnValue={h.titleBn}
                  onEnChange={(v) => setHighlight(i, { title: v })}
                  onBnChange={(v) => setHighlight(i, { titleBn: v })}
                />
              </div>
              <BilingualField
                label="Description"
                textarea
                rows={3}
                enValue={h.description}
                bnValue={h.descriptionBn}
                onEnChange={(v) => setHighlight(i, { description: v })}
                onBnChange={(v) => setHighlight(i, { descriptionBn: v })}
              />
              <div className="flex justify-end">
                <RowRemoveButton
                  onClick={() => removeHighlight(i)}
                  label={`Remove highlight ${i + 1}`}
                />
              </div>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={form.why.highlights.length >= MAX_HIGHLIGHTS}
              onClick={addHighlight}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add highlight
            </Button>
            {form.why.highlights.length >= MAX_HIGHLIGHTS ? (
              <Hint>Capped at {MAX_HIGHLIGHTS} — the grid is laid out as a 2×2.</Hint>
            ) : null}
          </div>
        </div>
      </FormSection>

      {/* ============ SERVICES SECTION ============ */}
      <FormSection
        icon={Sparkles}
        title="Services Section"
        description="Heading above the services marquee"
        edited={groupDirty((h) => h.services)}
      >
        <SectionHeadFields
          head={form.services}
          onChange={(patch) => setSection("services", patch)}
          withCta
        />
      </FormSection>

      {/* ============ FACILITY SECTION ============ */}
      <FormSection
        icon={Building2}
        title="Facility Section"
        description="Heading plus the three clinic feature cards"
        edited={groupDirty((h) => h.facility)}
      >
        <SectionHeadFields
          head={form.facility}
          onChange={(patch) => setSection("facility", patch)}
        />
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Facility cards
          </p>
          {form.facility.cards.map((card, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <BilingualField
                label={`Card ${i + 1} title`}
                enValue={card.title}
                bnValue={card.titleBn}
                onEnChange={(v) => setFacilityCard(i, { title: v })}
                onBnChange={(v) => setFacilityCard(i, { titleBn: v })}
              />
              <BilingualField
                label={`Card ${i + 1} text`}
                textarea
                rows={3}
                enValue={card.text}
                bnValue={card.textBn}
                onEnChange={(v) => setFacilityCard(i, { text: v })}
                onBnChange={(v) => setFacilityCard(i, { textBn: v })}
              />
              <div className="flex justify-end">
                <RowRemoveButton
                  onClick={() => removeFacilityCard(i)}
                  label={`Remove facility card ${i + 1}`}
                />
              </div>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={form.facility.cards.length >= MAX_FACILITY_CARDS}
              onClick={addFacilityCard}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add card
            </Button>
            {form.facility.cards.length >= MAX_FACILITY_CARDS ? (
              <Hint>Capped at {MAX_FACILITY_CARDS} cards.</Hint>
            ) : null}
          </div>
        </div>
      </FormSection>

      {/* ============ GALLERY SECTION ============ */}
      <FormSection
        icon={Images}
        title="Gallery Section"
        description="Heading above the smile gallery preview slider"
        edited={groupDirty((h) => h.galleryPreview)}
      >
        <SectionHeadFields
          head={form.galleryPreview}
          onChange={(patch) => setSection("galleryPreview", patch)}
          withCta
        />
      </FormSection>

      {/* ============ TESTIMONIALS SECTION ============ */}
      <FormSection
        icon={Star}
        title="Testimonials Section"
        description="Heading above the review marquee"
        edited={groupDirty((h) => h.testimonials)}
      >
        <SectionHeadFields
          head={form.testimonials}
          onChange={(patch) => setSection("testimonials", patch)}
        />
      </FormSection>

      {/* ============ DOCTORS SECTION ============ */}
      <FormSection
        icon={Stethoscope}
        title="Doctors Section"
        description="Heading above the specialist team grid"
        edited={groupDirty((h) => h.doctors)}
      >
        <SectionHeadFields
          head={form.doctors}
          onChange={(patch) => setSection("doctors", patch)}
          withCta
        />
      </FormSection>

      {/* ============ FAQ SECTION ============ */}
      <FormSection
        icon={CircleHelp}
        title="FAQ Section"
        description="Heading above the FAQ accordion and the “still have questions” card"
        edited={groupDirty((h) => h.faq)}
      >
        <SectionHeadFields
          head={form.faq}
          onChange={(patch) => setSection("faq", patch)}
          withCta
        />
        <BilingualField
          label="“Still have questions?” title"
          enValue={form.faq.stillTitle ?? ""}
          bnValue={form.faq.stillTitleBn}
          onEnChange={(v) => setSection("faq", { stillTitle: v })}
          onBnChange={(v) => setSection("faq", { stillTitleBn: v })}
        />
      </FormSection>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={reset}
        saveLabel="Save homepage"
      />
    </div>
  );
}
