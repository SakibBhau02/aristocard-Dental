"use client";

/* ------------------------------------------------------------------ */
/*  About page editor (Content → About)                                 */
/*  GET  /api/admin/pages → { home, about } (defaults merged)           */
/*  POST /api/admin/pages { key: "about", data: <complete object> }     */
/*  Groups: Page Head · Story · Mission & Vision · Journey (timeline)   */
/*  · Founder · Values · Specialists + CTA. Empty Bangla twins are      */
/*  pruned on save so the site falls back to English.                   */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BookOpenText,
  ChevronDown,
  Compass,
  HeartHandshake,
  Landmark,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import type { AboutContent } from "@/lib/content/shared";
import {
  BilingualField,
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

/* Timeline years are presentation literals paired by position on the
   public page — surfaced here as read-only labels. */
const TIMELINE_YEARS = ["2019", "2021", "2023", "2025"] as const;

const MAX_TIMELINE = 4;
const MAX_FOUNDER_ITEMS = 3;
const MAX_VALUES = 4;

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
     behind an await so the effect stays purely a subscription. */
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
      setSnapshot(clone(data.about));
      setForm(clone(data.about));
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
        ? { ...f, timeline: [...f.timeline, { title: "", description: "" }] }
        : f
    );

  const removeTimelineItem = (index: number) =>
    setForm((f) => (f ? { ...f, timeline: f.timeline.filter((_, i) => i !== index) } : f));

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
        description="Story, mission & vision, journey timeline, founder, values and the closing CTA — saves go live instantly."
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
        description="Section head and the four milestone cards"
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
        <Hint>
          Milestone years 2019 / 2021 / 2023 / 2025 auto-pair with the cards by position —
          they are presentation labels, not editable text.
        </Hint>
        <div className="space-y-3">
          {form.timeline.map((item, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <p className="font-heading text-xs font-bold uppercase tracking-wider text-brand-blue">
                {TIMELINE_YEARS[i] ?? `Milestone ${i + 1}`}
              </p>
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
              <div className="flex justify-end">
                <RowRemoveButton
                  onClick={() => removeTimelineItem(i)}
                  label={`Remove milestone ${i + 1}`}
                />
              </div>
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
              <Hint>Capped at {MAX_TIMELINE} milestones (one per year).</Hint>
            ) : null}
          </div>
        </div>
      </FormSection>

      {/* ============ FOUNDER ============ */}
      <FormSection
        icon={UserRound}
        title="Founder"
        description="Role line, chip and the three credential items"
        edited={groupDirty((a) => [
          a.founderRole,
          a.founderChipTitle,
          a.founderChipNote,
          a.founderItems,
        ])}
      >
        <BilingualField
          label="Role"
          enValue={form.founderRole}
          bnValue={form.founderRoleBn}
          onEnChange={(v) => set("founderRole", v)}
          onBnChange={(v) => set("founderRoleBn", v)}
        />
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
