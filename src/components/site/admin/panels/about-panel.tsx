"use client";

/* ------------------------------------------------------------------ */
/*  About page editor (Content → About)                                 */
/*  GET  /api/admin/pages → { home, about } (defaults merged)           */
/*  POST /api/admin/pages { key: "about", data: <complete object> }     */
/*  Groups: Page Head · Story · Story stats · Mission & Vision ·        */
/*  Journey (timeline years/icons/reorder) · Founder (name) · Values ·  */
/*  Specialists + CTA. Empty Bangla twins are pruned on save so the     */
/*  site falls back to English.                                         */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Award,
  BadgeCheck,
  BookOpenText,
  ChevronDown,
  Compass,
  GraduationCap,
  HeartHandshake,
  Images,
  Landmark,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContent } from "@/components/site/content-provider";
import { normalizeAboutContent, type AboutContent } from "@/lib/content/shared";
import {
  BilingualField,
  ImageUploadField,
  PanelHeader,
  PanelSkeleton,
  SaveBar,
  useAdminFetch,
  useAdminToast,
  type PanelProps,
} from "../admin-shared";

/* Icon keys that actually resolve in the site's icon-map. */
const VALUE_ICONS = [
  "BadgeCheck",
  "ShieldCheck",
  "HeartHandshake",
  "Sparkles",
  "Microscope",
  "Heart",
  "Users",
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

const MIN_TIMELINE = 1;
const MAX_TIMELINE = 8;
const MAX_STORY_STATS = 4;
const MAX_FOUNDER_ITEMS = 3;
const MAX_VALUES = 4;
/* Founder dossier + clinic tour caps — generous but bounded, so a runaway
   repeater can never blow past the API's 200 KB page-block limit. */
const MAX_FOUNDER_BIO = 6;
const MAX_FOUNDER_EDUCATION = 12;
const MAX_FOUNDER_CREDENTIALS = 16;
const MAX_FOUNDER_MILESTONES = 12;
const MAX_CLINIC_ROOMS = 30;

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

/** Swap an array item with its neighbour (bounded). */
function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** One-item-per-line editor for string arrays (equipment chips). */
function LinesField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="min-w-0 block">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <Textarea
        value={value.join("\n")}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        className="mt-1 border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
      />
      <span className="mt-1 block text-[10px] text-slate-400">
        {hint ?? "One item per line."}
      </span>
    </label>
  );
}

function RowRemoveButton({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className="h-9 w-9 shrink-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}

/** Small ↑ / ↓ button (same affordance as the FAQs panel reorder). */
function RowMoveButton({
  onClick,
  disabled,
  label,
  icon: Icon,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 ring-1 ring-blue-100 transition hover:bg-blue-50 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
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
        {VALUE_ICONS.map((key) => (
          <SelectItem key={key} value={key}>
            {key}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                               */
/* ------------------------------------------------------------------ */

export function AboutPanel({ onSessionExpired }: PanelProps) {
  const { get, post, error, clearError } = useAdminFetch(onSessionExpired);
  const { ok, fail } = useAdminToast();
  const { refresh } = useContent();

  const [snapshot, setSnapshot] = useState<AboutContent | null>(null);
  const [form, setForm] = useState<AboutContent | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadTick, setLoadTick] = useState(0);
  const [saving, setSaving] = useState(false);

  /* Initial fetch (+ manual retry). The async IIFE keeps every setState
     behind an await so the effect stays purely a subscription.
     normalizeAboutContent heals blobs saved before timeline.year/icon,
     storyStats or founderName existed (arrays deep-merge wholesale). */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await get<{ about: AboutContent }>("/api/admin/pages");
      if (cancelled) return;
      if (!data) {
        setLoadFailed(true);
        return;
      }
      setLoadFailed(false);
      const about = normalizeAboutContent(data.about);
      setSnapshot(clone(about));
      setForm(clone(about));
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
    (pick: (a: AboutContent) => unknown) =>
      snapshot && form ? JSON.stringify(pick(form)) !== JSON.stringify(pick(snapshot)) : false,
    [snapshot, form]
  );

  async function save() {
    if (!form || saving) return;
    setSaving(true);
    const payload = pruneBangla(form);
    const res = await post<{ error?: string }>("/api/admin/pages", {
      key: "about",
      data: payload,
    });
    setSaving(false);
    if (res.ok) {
      setSnapshot(payload);
      setForm(clone(payload));
      ok("About page saved", "The live site now shows your changes.");
      await refresh();
    } else {
      fail("Could not save the about page", res.data?.error ?? "Please try again.");
    }
  }

  function reset() {
    if (snapshot) setForm(clone(snapshot));
    clearError();
  }

  /* ---- generic field setter ---- */
  const set = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  /* ---- timeline ---- */
  const setTimelineItem = (
    index: number,
    patch: Partial<AboutContent["timeline"][number]>
  ) =>
    setForm((f) =>
      f
        ? {
            ...f,
            timeline: f.timeline.map((t, i) => (i === index ? { ...t, ...patch } : t)),
          }
        : f
    );

  const addTimelineItem = () =>
    setForm((f) =>
      f && f.timeline.length < MAX_TIMELINE
        ? {
            ...f,
            timeline: [
              ...f.timeline,
              {
                year: String(new Date().getFullYear()),
                icon: "Sparkles",
                title: "",
                description: "",
              },
            ],
          }
        : f
    );

  const removeTimelineItem = (index: number) =>
    setForm((f) =>
      f && f.timeline.length > MIN_TIMELINE
        ? { ...f, timeline: f.timeline.filter((_, i) => i !== index) }
        : f
    );

  const moveTimelineItem = (index: number, dir: -1 | 1) =>
    setForm((f) => {
      if (!f) return f;
      const target = index + dir;
      if (target < 0 || target >= f.timeline.length) return f;
      const next = [...f.timeline];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...f, timeline: next };
    });

  /* ---- story stats ---- */
  const setStoryStat = (
    index: number,
    patch: Partial<AboutContent["storyStats"][number]>
  ) =>
    setForm((f) =>
      f
        ? {
            ...f,
            storyStats: f.storyStats.map((s, i) =>
              i === index ? { ...s, ...patch } : s
            ),
          }
        : f
    );

  const addStoryStat = () =>
    setForm((f) =>
      f && f.storyStats.length < MAX_STORY_STATS
        ? { ...f, storyStats: [...f.storyStats, { value: "", label: "" }] }
        : f
    );

  const removeStoryStat = (index: number) =>
    setForm((f) =>
      f ? { ...f, storyStats: f.storyStats.filter((_, i) => i !== index) } : f
    );

  /* ---- founder items ---- */
  const setFounderItem = (
    index: number,
    patch: Partial<AboutContent["founderItems"][number]>
  ) =>
    setForm((f) =>
      f
        ? {
            ...f,
            founderItems: f.founderItems.map((item, i) =>
              i === index ? { ...item, ...patch } : item
            ),
          }
        : f
    );

  const addFounderItem = () =>
    setForm((f) =>
      f && f.founderItems.length < MAX_FOUNDER_ITEMS
        ? { ...f, founderItems: [...f.founderItems, { title: "", text: "" }] }
        : f
    );

  const removeFounderItem = (index: number) =>
    setForm((f) => (f ? { ...f, founderItems: f.founderItems.filter((_, i) => i !== index) } : f));

  /* ---- founder dossier: bio paragraphs ---- */
  const setFounderBio = (index: number, patch: { en?: string; bn?: string }) =>
    setForm((f) => {
      if (!f) return f;
      const bio = [...(f.founderBio ?? [])];
      const bioBn = [...(f.founderBioBn ?? [])];
      while (bioBn.length < bio.length) bioBn.push("");
      if (patch.en !== undefined) bio[index] = patch.en;
      if (patch.bn !== undefined) bioBn[index] = patch.bn;
      return { ...f, founderBio: bio, founderBioBn: bioBn };
    });

  const addFounderBio = () =>
    setForm((f) =>
      f && (f.founderBio ?? []).length < MAX_FOUNDER_BIO
        ? {
            ...f,
            founderBio: [...(f.founderBio ?? []), ""],
            founderBioBn: [...(f.founderBioBn ?? []), ""],
          }
        : f
    );

  const removeFounderBio = (index: number) =>
    setForm((f) =>
      f
        ? {
            ...f,
            founderBio: (f.founderBio ?? []).filter((_, i) => i !== index),
            founderBioBn: (f.founderBioBn ?? []).filter((_, i) => i !== index),
          }
        : f
    );

  /* ---- founder dossier: education / credentials / milestones ---- */
  const setEducation = (
    index: number,
    patch: Partial<NonNullable<AboutContent["founderEducation"]>[number]>
  ) =>
    setForm((f) =>
      f
        ? {
            ...f,
            founderEducation: (f.founderEducation ?? []).map((item, i) =>
              i === index ? { ...item, ...patch } : item
            ),
          }
        : f
    );

  const addEducation = () =>
    setForm((f) =>
      f && (f.founderEducation ?? []).length < MAX_FOUNDER_EDUCATION
        ? {
            ...f,
            founderEducation: [
              ...(f.founderEducation ?? []),
              { degree: "", institution: "", year: "", detail: "" },
            ],
          }
        : f
    );

  const removeEducation = (index: number) =>
    setForm((f) =>
      f
        ? { ...f, founderEducation: (f.founderEducation ?? []).filter((_, i) => i !== index) }
        : f
    );

  const moveEducation = (index: number, dir: -1 | 1) =>
    setForm((f) =>
      f ? { ...f, founderEducation: moveItem(f.founderEducation ?? [], index, dir) } : f
    );

  const setCredential = (
    index: number,
    patch: Partial<NonNullable<AboutContent["founderCredentials"]>[number]>
  ) =>
    setForm((f) =>
      f
        ? {
            ...f,
            founderCredentials: (f.founderCredentials ?? []).map((item, i) =>
              i === index ? { ...item, ...patch } : item
            ),
          }
        : f
    );

  const addCredential = () =>
    setForm((f) =>
      f && (f.founderCredentials ?? []).length < MAX_FOUNDER_CREDENTIALS
        ? {
            ...f,
            founderCredentials: [...(f.founderCredentials ?? []), { title: "", issuer: "", year: "" }],
          }
        : f
    );

  const removeCredential = (index: number) =>
    setForm((f) =>
      f
        ? { ...f, founderCredentials: (f.founderCredentials ?? []).filter((_, i) => i !== index) }
        : f
    );

  const moveCredential = (index: number, dir: -1 | 1) =>
    setForm((f) =>
      f ? { ...f, founderCredentials: moveItem(f.founderCredentials ?? [], index, dir) } : f
    );

  const setMilestone = (
    index: number,
    patch: Partial<NonNullable<AboutContent["founderMilestones"]>[number]>
  ) =>
    setForm((f) =>
      f
        ? {
            ...f,
            founderMilestones: (f.founderMilestones ?? []).map((item, i) =>
              i === index ? { ...item, ...patch } : item
            ),
          }
        : f
    );

  const addMilestone = () =>
    setForm((f) =>
      f && (f.founderMilestones ?? []).length < MAX_FOUNDER_MILESTONES
        ? {
            ...f,
            founderMilestones: [
              ...(f.founderMilestones ?? []),
              { year: "", title: "", description: "" },
            ],
          }
        : f
    );

  const removeMilestone = (index: number) =>
    setForm((f) =>
      f
        ? { ...f, founderMilestones: (f.founderMilestones ?? []).filter((_, i) => i !== index) }
        : f
    );

  const moveMilestone = (index: number, dir: -1 | 1) =>
    setForm((f) =>
      f ? { ...f, founderMilestones: moveItem(f.founderMilestones ?? [], index, dir) } : f
    );

  /* ---- clinic tour rooms ---- */
  const setRoom = (
    index: number,
    patch: Partial<NonNullable<AboutContent["clinicRooms"]>[number]>
  ) =>
    setForm((f) =>
      f
        ? {
            ...f,
            clinicRooms: (f.clinicRooms ?? []).map((room, i) =>
              i === index ? { ...room, ...patch } : room
            ),
          }
        : f
    );

  const addRoom = () =>
    setForm((f) => {
      if (!f || (f.clinicRooms ?? []).length >= MAX_CLINIC_ROOMS) return f;
      const id = `room-${Date.now().toString(36)}`;
      return {
        ...f,
        clinicRooms: [
          ...(f.clinicRooms ?? []),
          {
            id,
            category: "Treatment Rooms",
            title: "",
            description: "",
            equipment: [],
            equipmentBn: [],
            featured: false,
          },
        ],
      };
    });

  const removeRoom = (index: number) =>
    setForm((f) =>
      f ? { ...f, clinicRooms: (f.clinicRooms ?? []).filter((_, i) => i !== index) } : f
    );

  const moveRoom = (index: number, dir: -1 | 1) =>
    setForm((f) => (f ? { ...f, clinicRooms: moveItem(f.clinicRooms ?? [], index, dir) } : f));

  /* ---- values ---- */
  const setValue = (index: number, patch: Partial<AboutContent["values"][number]>) =>
    setForm((f) =>
      f
        ? { ...f, values: f.values.map((v, i) => (i === index ? { ...v, ...patch } : v)) }
        : f
    );

  const addValue = () =>
    setForm((f) =>
      f && f.values.length < MAX_VALUES
        ? { ...f, values: [...f.values, { icon: "BadgeCheck", title: "", description: "" }] }
        : f
    );

  const removeValue = (index: number) =>
    setForm((f) => (f ? { ...f, values: f.values.filter((_, i) => i !== index) } : f));

  /* ---- render ---- */

  if (!snapshot || !form) {
    if (loadFailed) {
      return (
        <div className="space-y-4">
          <PanelHeader title="About Page Content" />
          <ErrorNote message={error ?? "Could not load the about page content."} />
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

  return (
    <div className="space-y-4">
      <PanelHeader
        title="About Page Content"
        description="Story, mission & vision, journey timeline, founder dossier (education, certificates, milestones) and the clinic tour gallery — saves go live instantly."
      />
      {error ? <ErrorNote message={error} /> : null}

      {/* ============ PAGE HEAD ============ */}
      <FormSection
        icon={Landmark}
        title="Page Head"
        description="Eyebrow, main title and intro paragraph"
        edited={groupDirty((a) => [a.eyebrow, a.title, a.description])}
        defaultOpen
      >
        <BilingualField
          label="Eyebrow"
          enValue={form.eyebrow}
          bnValue={form.eyebrowBn}
          onEnChange={(v) => set("eyebrow", v)}
          onBnChange={(v) => set("eyebrowBn", v)}
        />
        <BilingualField
          label="Title"
          enValue={form.title}
          bnValue={form.titleBn}
          onEnChange={(v) => set("title", v)}
          onBnChange={(v) => set("titleBn", v)}
        />
        <BilingualField
          label="Description"
          textarea
          rows={4}
          enValue={form.description}
          bnValue={form.descriptionBn}
          onEnChange={(v) => set("description", v)}
          onBnChange={(v) => set("descriptionBn", v)}
        />
      </FormSection>

      {/* ============ STORY ============ */}
      <FormSection
        icon={BookOpenText}
        title="Story"
        description="Founding-year badge, pull-quote and second paragraph"
        edited={groupDirty((a) => [a.storyBadge, a.storyQuote, a.storyP2])}
      >
        <BilingualField
          label="Story badge"
          enValue={form.storyBadge}
          bnValue={form.storyBadgeBn}
          onEnChange={(v) => set("storyBadge", v)}
          onBnChange={(v) => set("storyBadgeBn", v)}
        />
        <BilingualField
          label="Pull quote"
          textarea
          rows={3}
          enValue={form.storyQuote}
          bnValue={form.storyQuoteBn}
          onEnChange={(v) => set("storyQuote", v)}
          onBnChange={(v) => set("storyQuoteBn", v)}
        />
        <BilingualField
          label="Second paragraph"
          textarea
          rows={4}
          enValue={form.storyP2}
          bnValue={form.storyP2Bn}
          onEnChange={(v) => set("storyP2", v)}
          onBnChange={(v) => set("storyP2Bn", v)}
        />
      </FormSection>

      {/* ============ STORY STATS ============ */}
      <FormSection
        icon={TrendingUp}
        title="Story stats"
        description="The number chips inside the story card (6+ / 11 / 4.9★)"
        edited={groupDirty((a) => a.storyStats)}
      >
        <Hint>
          Values containing digits automatically render in Bangla numerals on
          the বাংলা site — enter them in English digits here.
        </Hint>
        <div className="space-y-3">
          {form.storyStats.map((stat, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-brand-blue">
                  Stat {i + 1}
                </p>
                <RowRemoveButton
                  onClick={() => removeStoryStat(i)}
                  label={`Remove stat ${i + 1}`}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
                <MiniField label="Value">
                  <Input
                    value={stat.value}
                    maxLength={12}
                    placeholder="6+"
                    onChange={(e) => setStoryStat(i, { value: e.target.value })}
                    className="mt-1 border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                  />
                </MiniField>
                <BilingualField
                  label="Label"
                  enValue={stat.label}
                  bnValue={stat.labelBn}
                  onEnChange={(v) => setStoryStat(i, { label: v })}
                  onBnChange={(v) => setStoryStat(i, { labelBn: v })}
                />
              </div>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={form.storyStats.length >= MAX_STORY_STATS}
              onClick={addStoryStat}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add stat
            </Button>
            {form.storyStats.length >= MAX_STORY_STATS ? (
              <Hint>The story card shows up to {MAX_STORY_STATS} stats side by side.</Hint>
            ) : null}
          </div>
        </div>
      </FormSection>

      {/* ============ MISSION & VISION ============ */}
      <FormSection
        icon={Compass}
        title="Mission & Vision"
        description="Eyebrow, section title and both cards"
        edited={groupDirty((a) => [
          a.missionEyebrow,
          a.missionTitle,
          a.missionHeading,
          a.missionText,
          a.visionHeading,
          a.visionText,
        ])}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <BilingualField
            label="Eyebrow"
            enValue={form.missionEyebrow}
            bnValue={form.missionEyebrowBn}
            onEnChange={(v) => set("missionEyebrow", v)}
            onBnChange={(v) => set("missionEyebrowBn", v)}
          />
          <BilingualField
            label="Section title"
            enValue={form.missionTitle}
            bnValue={form.missionTitleBn}
            onEnChange={(v) => set("missionTitle", v)}
            onBnChange={(v) => set("missionTitleBn", v)}
          />
        </div>
        <BilingualField
          label="Mission card heading"
          enValue={form.missionHeading}
          bnValue={form.missionHeadingBn}
          onEnChange={(v) => set("missionHeading", v)}
          onBnChange={(v) => set("missionHeadingBn", v)}
        />
        <BilingualField
          label="Mission text"
          textarea
          rows={5}
          enValue={form.missionText}
          bnValue={form.missionTextBn}
          onEnChange={(v) => set("missionText", v)}
          onBnChange={(v) => set("missionTextBn", v)}
        />
        <BilingualField
          label="Vision card heading"
          enValue={form.visionHeading}
          bnValue={form.visionHeadingBn}
          onEnChange={(v) => set("visionHeading", v)}
          onBnChange={(v) => set("visionHeadingBn", v)}
        />
        <BilingualField
          label="Vision text"
          textarea
          rows={5}
          enValue={form.visionText}
          bnValue={form.visionTextBn}
          onEnChange={(v) => set("visionText", v)}
          onBnChange={(v) => set("visionTextBn", v)}
        />
      </FormSection>

      {/* ============ JOURNEY ============ */}
      <FormSection
        icon={Sparkles}
        title="Journey (Timeline)"
        description="Section head and the milestone cards — year, icon, order and count are all editable"
        edited={groupDirty((a) => [a.journeyEyebrow, a.journeyTitle, a.timeline])}
      >
        <BilingualField
          label="Eyebrow"
          enValue={form.journeyEyebrow}
          bnValue={form.journeyEyebrowBn}
          onEnChange={(v) => set("journeyEyebrow", v)}
          onBnChange={(v) => set("journeyEyebrowBn", v)}
        />
        <BilingualField
          label="Section title"
          enValue={form.journeyTitle}
          bnValue={form.journeyTitleBn}
          onEnChange={(v) => set("journeyTitle", v)}
          onBnChange={(v) => set("journeyTitleBn", v)}
        />
        <div className="space-y-3">
          {form.timeline.map((item, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-brand-blue">
                  {item.year.trim() ? `Milestone · ${item.year}` : `Milestone ${i + 1}`}
                </p>
                <span className="flex items-center gap-1">
                  <RowMoveButton
                    onClick={() => moveTimelineItem(i, -1)}
                    disabled={i === 0}
                    label={`Move milestone ${i + 1} up`}
                    icon={ArrowUp}
                  />
                  <RowMoveButton
                    onClick={() => moveTimelineItem(i, 1)}
                    disabled={i === form.timeline.length - 1}
                    label={`Move milestone ${i + 1} down`}
                    icon={ArrowDown}
                  />
                  <RowRemoveButton
                    onClick={() => removeTimelineItem(i)}
                    disabled={form.timeline.length <= MIN_TIMELINE}
                    label={`Remove milestone ${i + 1}`}
                  />
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-[8rem_11rem]">
                <MiniField label="Year">
                  <Input
                    value={item.year}
                    maxLength={8}
                    placeholder="2019"
                    onChange={(e) => setTimelineItem(i, { year: e.target.value })}
                    className="mt-1 border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                  />
                </MiniField>
                <MiniField label="Icon">
                  <IconSelect
                    value={item.icon}
                    onChange={(v) => setTimelineItem(i, { icon: v })}
                    ariaLabel={`Milestone ${i + 1} icon`}
                  />
                </MiniField>
              </div>
              <BilingualField
                label="Title"
                enValue={item.title}
                bnValue={item.titleBn}
                onEnChange={(v) => setTimelineItem(i, { title: v })}
                onBnChange={(v) => setTimelineItem(i, { titleBn: v })}
              />
              <BilingualField
                label="Description"
                textarea
                rows={3}
                enValue={item.description}
                bnValue={item.descriptionBn}
                onEnChange={(v) => setTimelineItem(i, { description: v })}
                onBnChange={(v) => setTimelineItem(i, { descriptionBn: v })}
              />
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={form.timeline.length >= MAX_TIMELINE}
              onClick={addTimelineItem}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add milestone
            </Button>
            {form.timeline.length >= MAX_TIMELINE ? (
              <Hint>Capped at {MAX_TIMELINE} milestones.</Hint>
            ) : null}
            <Hint>
              At least {MIN_TIMELINE} milestone is required. New milestones
              start at the current year with the Sparkles icon.
            </Hint>
          </div>
        </div>
      </FormSection>

      {/* ============ FOUNDER ============ */}
      <FormSection
        icon={UserRound}
        title="Founder"
        description="Photo, name, role, experience badge, biography, chip and the three highlights"
        edited={groupDirty((a) => [
          a.founderName,
          a.founderRole,
          a.founderImage,
          a.founderImageAlt,
          a.founderChipTitle,
          a.founderChipNote,
          a.founderItems,
          a.founderYears,
          a.founderYearsLabel,
          a.founderTagline,
          a.founderBio,
        ])}
      >
        <ImageUploadField
          label="Founder photo"
          hint="Portrait shot works best (the founder card is roughly 4:4.6). Leave empty to show the initials medallion instead."
          value={form.founderImage || undefined}
          onChange={(url) => set("founderImage", url ?? "")}
          onUnauthorized={onSessionExpired}
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Photo alt text
          </p>
          <Input
            value={form.founderImageAlt ?? ""}
            onChange={(e) => set("founderImageAlt", e.target.value)}
            placeholder="Dr. Shazia Khanam — Founder and Chief Dental Surgeon"
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-slate-400">
            Accessibility description — also used by screen readers and search
            engines.
          </p>
        </div>
        <BilingualField
          label="Founder name"
          enValue={form.founderName}
          bnValue={form.founderNameBn}
          onEnChange={(v) => set("founderName", v)}
          onBnChange={(v) => set("founderNameBn", v)}
        />
        <Hint>
          With a photo set, the name, role and rating overlay the portrait;
          without one, the monogram fallback is derived from the English
          name (honorifics like “Dr.” are skipped — “Dr. Shazia Khanam” → SK).
        </Hint>
        <BilingualField
          label="Role"
          enValue={form.founderRole}
          bnValue={form.founderRoleBn}
          onEnChange={(v) => set("founderRole", v)}
          onBnChange={(v) => set("founderRoleBn", v)}
        />
        <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
          <MiniField label="Experience badge">
            <Input
              value={form.founderYears ?? ""}
              maxLength={8}
              placeholder="18+"
              onChange={(e) => set("founderYears", e.target.value)}
              className="mt-1 border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
            />
          </MiniField>
          <BilingualField
            label="Experience label"
            enValue={form.founderYearsLabel ?? ""}
            bnValue={form.founderYearsLabelBn}
            onEnChange={(v) => set("founderYearsLabel", v)}
            onBnChange={(v) => set("founderYearsLabelBn", v)}
          />
        </div>
        <Hint>
          The badge sits on the founder portrait. Enter digits in English — the
          বাংলা site converts them automatically. Leave the badge empty to hide it.
        </Hint>
        <BilingualField
          label="Tagline (shown under the section title)"
          textarea
          rows={2}
          enValue={form.founderTagline ?? ""}
          bnValue={form.founderTaglineBn}
          onEnChange={(v) => set("founderTagline", v)}
          onBnChange={(v) => set("founderTaglineBn", v)}
        />

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Founder biography
          </p>
          <Hint>
            One paragraph per block. This replaces the old single hard-coded
            paragraph — write the story once and it appears on the About page
            (and feeds the Person schema for search engines).
          </Hint>
          {(form.founderBio ?? []).map((paragraph, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-brand-blue">
                  Paragraph {i + 1}
                </p>
                <RowRemoveButton
                  onClick={() => removeFounderBio(i)}
                  label={`Remove biography paragraph ${i + 1}`}
                />
              </div>
              <BilingualField
                label="Text"
                textarea
                rows={4}
                enValue={paragraph}
                bnValue={form.founderBioBn?.[i] ?? ""}
                onEnChange={(v) => setFounderBio(i, { en: v })}
                onBnChange={(v) => setFounderBio(i, { bn: v })}
              />
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(form.founderBio ?? []).length >= MAX_FOUNDER_BIO}
              onClick={addFounderBio}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add paragraph
            </Button>
            {(form.founderBio ?? []).length >= MAX_FOUNDER_BIO ? (
              <Hint>Capped at {MAX_FOUNDER_BIO} paragraphs.</Hint>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <BilingualField
            label="Chip title"
            enValue={form.founderChipTitle}
            bnValue={form.founderChipTitleBn}
            onEnChange={(v) => set("founderChipTitle", v)}
            onBnChange={(v) => set("founderChipTitleBn", v)}
          />
          <BilingualField
            label="Chip note"
            enValue={form.founderChipNote}
            bnValue={form.founderChipNoteBn}
            onEnChange={(v) => set("founderChipNote", v)}
            onBnChange={(v) => set("founderChipNoteBn", v)}
          />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Founder highlights
          </p>
          {form.founderItems.map((item, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <p className="font-heading text-xs font-bold uppercase tracking-wider text-brand-blue">
                Highlight {i + 1}
              </p>
              <BilingualField
                label="Title"
                enValue={item.title}
                bnValue={item.titleBn}
                onEnChange={(v) => setFounderItem(i, { title: v })}
                onBnChange={(v) => setFounderItem(i, { titleBn: v })}
              />
              <BilingualField
                label="Text"
                textarea
                rows={2}
                enValue={item.text}
                bnValue={item.textBn}
                onEnChange={(v) => setFounderItem(i, { text: v })}
                onBnChange={(v) => setFounderItem(i, { textBn: v })}
              />
              <div className="flex justify-end">
                <RowRemoveButton
                  onClick={() => removeFounderItem(i)}
                  label={`Remove founder highlight ${i + 1}`}
                />
              </div>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={form.founderItems.length >= MAX_FOUNDER_ITEMS}
              onClick={addFounderItem}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add highlight
            </Button>
            {form.founderItems.length >= MAX_FOUNDER_ITEMS ? (
              <Hint>Capped at {MAX_FOUNDER_ITEMS} highlights.</Hint>
            ) : null}
          </div>
        </div>
      </FormSection>

      {/* ============ FOUNDER EDUCATION ============ */}
      <FormSection
        icon={GraduationCap}
        title="Founder education & training"
        description="Degree / fellowship timeline shown under the founder spotlight"
        edited={groupDirty((a) => a.founderEducation)}
      >
        <Hint>
          These entries also generate the founder's Person schema
          (alumniOf / hasCredential) for search engines. Leave a year blank if
          you would rather not publish it — the timeline simply omits it.
        </Hint>
        <div className="space-y-3">
          {(form.founderEducation ?? []).map((item, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-brand-blue">
                  {item.degree.trim() ? item.degree : `Education ${i + 1}`}
                </p>
                <span className="flex items-center gap-1">
                  <RowMoveButton
                    onClick={() => moveEducation(i, -1)}
                    disabled={i === 0}
                    label={`Move education ${i + 1} up`}
                    icon={ArrowUp}
                  />
                  <RowMoveButton
                    onClick={() => moveEducation(i, 1)}
                    disabled={i === (form.founderEducation ?? []).length - 1}
                    label={`Move education ${i + 1} down`}
                    icon={ArrowDown}
                  />
                  <RowRemoveButton
                    onClick={() => removeEducation(i)}
                    label={`Remove education ${i + 1}`}
                  />
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                <MiniField label="Year">
                  <Input
                    value={item.year ?? ""}
                    maxLength={12}
                    placeholder="2002–2007"
                    onChange={(e) => setEducation(i, { year: e.target.value })}
                    className="mt-1 border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                  />
                </MiniField>
                <BilingualField
                  label="Degree / qualification"
                  enValue={item.degree}
                  bnValue={item.degreeBn}
                  onEnChange={(v) => setEducation(i, { degree: v })}
                  onBnChange={(v) => setEducation(i, { degreeBn: v })}
                />
              </div>
              <BilingualField
                label="Institution"
                enValue={item.institution ?? ""}
                bnValue={item.institutionBn}
                onEnChange={(v) => setEducation(i, { institution: v })}
                onBnChange={(v) => setEducation(i, { institutionBn: v })}
              />
              <BilingualField
                label="Detail (optional)"
                textarea
                rows={2}
                enValue={item.detail ?? ""}
                bnValue={item.detailBn}
                onEnChange={(v) => setEducation(i, { detail: v })}
                onBnChange={(v) => setEducation(i, { detailBn: v })}
              />
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(form.founderEducation ?? []).length >= MAX_FOUNDER_EDUCATION}
              onClick={addEducation}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add education
            </Button>
            {(form.founderEducation ?? []).length >= MAX_FOUNDER_EDUCATION ? (
              <Hint>Capped at {MAX_FOUNDER_EDUCATION} entries.</Hint>
            ) : null}
          </div>
        </div>
      </FormSection>

      {/* ============ CERTIFICATES ============ */}
      <FormSection
        icon={BadgeCheck}
        title="Certificates & memberships"
        description="Credential cards (FCPS, fellowships, appointments) shown beside the timeline"
        edited={groupDirty((a) => a.founderCredentials)}
      >
        <div className="space-y-3">
          {(form.founderCredentials ?? []).map((item, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-brand-blue">
                  {item.title.trim() ? item.title : `Certificate ${i + 1}`}
                </p>
                <span className="flex items-center gap-1">
                  <RowMoveButton
                    onClick={() => moveCredential(i, -1)}
                    disabled={i === 0}
                    label={`Move certificate ${i + 1} up`}
                    icon={ArrowUp}
                  />
                  <RowMoveButton
                    onClick={() => moveCredential(i, 1)}
                    disabled={i === (form.founderCredentials ?? []).length - 1}
                    label={`Move certificate ${i + 1} down`}
                    icon={ArrowDown}
                  />
                  <RowRemoveButton
                    onClick={() => removeCredential(i)}
                    label={`Remove certificate ${i + 1}`}
                  />
                </span>
              </div>
              <BilingualField
                label="Title"
                enValue={item.title}
                bnValue={item.titleBn}
                onEnChange={(v) => setCredential(i, { title: v })}
                onBnChange={(v) => setCredential(i, { titleBn: v })}
              />
              <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                <MiniField label="Year (optional)">
                  <Input
                    value={item.year ?? ""}
                    maxLength={8}
                    placeholder="2025"
                    onChange={(e) => setCredential(i, { year: e.target.value })}
                    className="mt-1 border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                  />
                </MiniField>
                <BilingualField
                  label="Issuer"
                  enValue={item.issuer ?? ""}
                  bnValue={item.issuerBn}
                  onEnChange={(v) => setCredential(i, { issuer: v })}
                  onBnChange={(v) => setCredential(i, { issuerBn: v })}
                />
              </div>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(form.founderCredentials ?? []).length >= MAX_FOUNDER_CREDENTIALS}
              onClick={addCredential}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add certificate
            </Button>
            {(form.founderCredentials ?? []).length >= MAX_FOUNDER_CREDENTIALS ? (
              <Hint>Capped at {MAX_FOUNDER_CREDENTIALS} certificates.</Hint>
            ) : null}
          </div>
        </div>
      </FormSection>

      {/* ============ CAREER MILESTONES ============ */}
      <FormSection
        icon={Award}
        title="Founder career milestones"
        description="Short dated achievements listed under the certificates"
        edited={groupDirty((a) => a.founderMilestones)}
      >
        <div className="space-y-3">
          {(form.founderMilestones ?? []).map((item, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading text-xs font-bold uppercase tracking-wider text-brand-blue">
                  {item.title.trim() ? item.title : `Milestone ${i + 1}`}
                </p>
                <span className="flex items-center gap-1">
                  <RowMoveButton
                    onClick={() => moveMilestone(i, -1)}
                    disabled={i === 0}
                    label={`Move milestone ${i + 1} up`}
                    icon={ArrowUp}
                  />
                  <RowMoveButton
                    onClick={() => moveMilestone(i, 1)}
                    disabled={i === (form.founderMilestones ?? []).length - 1}
                    label={`Move milestone ${i + 1} down`}
                    icon={ArrowDown}
                  />
                  <RowRemoveButton
                    onClick={() => removeMilestone(i)}
                    label={`Remove milestone ${i + 1}`}
                  />
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                <MiniField label="Year (optional)">
                  <Input
                    value={item.year ?? ""}
                    maxLength={8}
                    placeholder="2007"
                    onChange={(e) => setMilestone(i, { year: e.target.value })}
                    className="mt-1 border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                  />
                </MiniField>
                <BilingualField
                  label="Title"
                  enValue={item.title}
                  bnValue={item.titleBn}
                  onEnChange={(v) => setMilestone(i, { title: v })}
                  onBnChange={(v) => setMilestone(i, { titleBn: v })}
                />
              </div>
              <BilingualField
                label="Description"
                textarea
                rows={2}
                enValue={item.description ?? ""}
                bnValue={item.descriptionBn}
                onEnChange={(v) => setMilestone(i, { description: v })}
                onBnChange={(v) => setMilestone(i, { descriptionBn: v })}
              />
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(form.founderMilestones ?? []).length >= MAX_FOUNDER_MILESTONES}
              onClick={addMilestone}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add milestone
            </Button>
            {(form.founderMilestones ?? []).length >= MAX_FOUNDER_MILESTONES ? (
              <Hint>Capped at {MAX_FOUNDER_MILESTONES} milestones.</Hint>
            ) : null}
          </div>
        </div>
      </FormSection>

      {/* ============ CLINIC TOUR ============ */}
      <FormSection
        icon={Images}
        title="Clinic tour (rooms & equipment)"
        description="Photographs, room names and the equipment list shown in the About gallery and the home preview"
        edited={groupDirty((a) => [
          a.clinicGalleryEyebrow,
          a.clinicGalleryTitle,
          a.clinicGalleryDescription,
          a.clinicRooms,
        ])}
      >
        <BilingualField
          label="Section eyebrow"
          enValue={form.clinicGalleryEyebrow ?? ""}
          bnValue={form.clinicGalleryEyebrowBn}
          onEnChange={(v) => set("clinicGalleryEyebrow", v)}
          onBnChange={(v) => set("clinicGalleryEyebrowBn", v)}
        />
        <BilingualField
          label="Section title"
          enValue={form.clinicGalleryTitle ?? ""}
          bnValue={form.clinicGalleryTitleBn}
          onEnChange={(v) => set("clinicGalleryTitle", v)}
          onBnChange={(v) => set("clinicGalleryTitleBn", v)}
        />
        <BilingualField
          label="Section description"
          textarea
          rows={3}
          enValue={form.clinicGalleryDescription ?? ""}
          bnValue={form.clinicGalleryDescriptionBn}
          onEnChange={(v) => set("clinicGalleryDescription", v)}
          onBnChange={(v) => set("clinicGalleryDescriptionBn", v)}
        />
        <Hint>
          Upload a photo for each room (JPG/PNG/WebP). Rooms without a photo
          show a designed placeholder, so you can publish the equipment lists
          first and add photographs later. Rooms marked “featured” also appear
          in the home-page preview.
        </Hint>

        <div className="space-y-4">
          {(form.clinicRooms ?? []).map((room, i) => (
            <div
              key={room.id}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading min-w-0 truncate text-xs font-bold uppercase tracking-wider text-brand-blue">
                  {room.title.trim() || `Room ${i + 1}`}
                </p>
                <span className="flex items-center gap-1">
                  <RowMoveButton
                    onClick={() => moveRoom(i, -1)}
                    disabled={i === 0}
                    label={`Move room ${i + 1} up`}
                    icon={ArrowUp}
                  />
                  <RowMoveButton
                    onClick={() => moveRoom(i, 1)}
                    disabled={i === (form.clinicRooms ?? []).length - 1}
                    label={`Move room ${i + 1} down`}
                    icon={ArrowDown}
                  />
                  <RowRemoveButton onClick={() => removeRoom(i)} label={`Remove room ${i + 1}`} />
                </span>
              </div>

              <ImageUploadField
                label="Room photo"
                hint="Landscape 16:11 works best. Leave empty to use the placeholder."
                value={room.image || undefined}
                onChange={(url) => setRoom(i, { image: url ?? "" })}
                onUnauthorized={onSessionExpired}
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Photo alt text
                </p>
                <Input
                  value={room.imageAlt ?? ""}
                  onChange={(e) => setRoom(i, { imageAlt: e.target.value })}
                  placeholder="Digital diagnosis room with X-ray unit and intraoral scanner"
                  className="mt-1.5"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <BilingualField
                  label="Filter category"
                  enValue={room.category}
                  bnValue={room.categoryBn}
                  onEnChange={(v) => setRoom(i, { category: v })}
                  onBnChange={(v) => setRoom(i, { categoryBn: v })}
                />
                <div className="flex items-end">
                  <label className="flex w-full items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white px-3.5 py-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Show on home page
                    </span>
                    <Switch
                      checked={room.featured === true}
                      onCheckedChange={(checked) => setRoom(i, { featured: checked })}
                      aria-label={`Feature room ${i + 1} on the home page`}
                    />
                  </label>
                </div>
              </div>

              <BilingualField
                label="Room name"
                enValue={room.title}
                bnValue={room.titleBn}
                onEnChange={(v) => setRoom(i, { title: v })}
                onBnChange={(v) => setRoom(i, { titleBn: v })}
              />
              <BilingualField
                label="Description"
                textarea
                rows={3}
                enValue={room.description}
                bnValue={room.descriptionBn}
                onEnChange={(v) => setRoom(i, { description: v })}
                onBnChange={(v) => setRoom(i, { descriptionBn: v })}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <LinesField
                  label="Equipment — English"
                  value={room.equipment}
                  onChange={(next) => setRoom(i, { equipment: next })}
                  placeholder={"Digital X-ray\nIntraoral 3D scanner"}
                />
                <LinesField
                  label="Equipment — বাংলা"
                  value={room.equipmentBn ?? []}
                  onChange={(next) => setRoom(i, { equipmentBn: next })}
                  placeholder={"ডিজিটাল এক্স-রে\nইন্ট্রাওরাল থ্রিডি স্ক্যানার"}
                  hint="One item per line, matching the English order. Leave blank to use English."
                />
              </div>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={(form.clinicRooms ?? []).length >= MAX_CLINIC_ROOMS}
              onClick={addRoom}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add room
            </Button>
            {(form.clinicRooms ?? []).length >= MAX_CLINIC_ROOMS ? (
              <Hint>Capped at {MAX_CLINIC_ROOMS} rooms.</Hint>
            ) : null}
          </div>
        </div>
      </FormSection>

      {/* ============ VALUES ============ */}
      <FormSection
        icon={HeartHandshake}
        title="Values"
        description="Section head and the four value cards"
        edited={groupDirty((a) => [a.valuesEyebrow, a.valuesTitle, a.values])}
      >
        <BilingualField
          label="Eyebrow"
          enValue={form.valuesEyebrow}
          bnValue={form.valuesEyebrowBn}
          onEnChange={(v) => set("valuesEyebrow", v)}
          onBnChange={(v) => set("valuesEyebrowBn", v)}
        />
        <BilingualField
          label="Section title"
          enValue={form.valuesTitle}
          bnValue={form.valuesTitleBn}
          onEnChange={(v) => set("valuesTitle", v)}
          onBnChange={(v) => set("valuesTitleBn", v)}
        />
        <div className="space-y-3">
          {form.values.map((value, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                <MiniField label="Icon">
                  <IconSelect
                    value={value.icon}
                    onChange={(v) => setValue(i, { icon: v })}
                    ariaLabel={`Value ${i + 1} icon`}
                  />
                </MiniField>
                <BilingualField
                  label="Title"
                  enValue={value.title}
                  bnValue={value.titleBn}
                  onEnChange={(v) => setValue(i, { title: v })}
                  onBnChange={(v) => setValue(i, { titleBn: v })}
                />
              </div>
              <BilingualField
                label="Description"
                textarea
                rows={3}
                enValue={value.description}
                bnValue={value.descriptionBn}
                onEnChange={(v) => setValue(i, { description: v })}
                onBnChange={(v) => setValue(i, { descriptionBn: v })}
              />
              <div className="flex justify-end">
                <RowRemoveButton onClick={() => removeValue(i)} label={`Remove value ${i + 1}`} />
              </div>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={form.values.length >= MAX_VALUES}
              onClick={addValue}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add value
            </Button>
            {form.values.length >= MAX_VALUES ? (
              <Hint>Capped at {MAX_VALUES} — the grid is laid out as a 4-column row.</Hint>
            ) : null}
          </div>
        </div>
      </FormSection>

      {/* ============ SPECIALISTS + CTA ============ */}
      <FormSection
        icon={Sparkles}
        title="Specialists + CTA"
        description="Specialist team heading and the closing call-to-action banner"
        edited={groupDirty((a) => [
          a.specialistsTitle,
          a.specialistsDescription,
          a.ctaTitle,
          a.ctaDescription,
        ])}
      >
        <BilingualField
          label="Specialists title"
          enValue={form.specialistsTitle}
          bnValue={form.specialistsTitleBn}
          onEnChange={(v) => set("specialistsTitle", v)}
          onBnChange={(v) => set("specialistsTitleBn", v)}
        />
        <BilingualField
          label="Specialists description"
          textarea
          rows={3}
          enValue={form.specialistsDescription}
          bnValue={form.specialistsDescriptionBn}
          onEnChange={(v) => set("specialistsDescription", v)}
          onBnChange={(v) => set("specialistsDescriptionBn", v)}
        />
        <BilingualField
          label="CTA title"
          enValue={form.ctaTitle}
          bnValue={form.ctaTitleBn}
          onEnChange={(v) => set("ctaTitle", v)}
          onBnChange={(v) => set("ctaTitleBn", v)}
        />
        <BilingualField
          label="CTA description"
          textarea
          rows={3}
          enValue={form.ctaDescription}
          bnValue={form.ctaDescriptionBn}
          onEnChange={(v) => set("ctaDescription", v)}
          onBnChange={(v) => set("ctaDescriptionBn", v)}
        />
      </FormSection>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={reset}
        saveLabel="Save about page"
      />
    </div>
  );
}
