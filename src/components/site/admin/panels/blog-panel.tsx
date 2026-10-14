"use client";

/* ------------------------------------------------------------------ */
/*  Blog panel — the flagship CMS editor.                               */
/*                                                                     */
/*  • List mode: KPI stats, search, status + category filters and      */
/*    post cards (cover thumb, category pill, status pill, featured    */
/*    star, date / read time / author, Edit + Delete).                */
/*  • Edit mode: five visually separated cards —                       */
/*      1. Basics     (bilingual title, slug, category, date, author,  */
/*                      featured switch, status)                       */
/*      2. Cover      (image upload + alt text)                        */
/*      3. Summary    (bilingual excerpt + AEO quick answer)           */
/*      4. Sections   (repeatable EN section builder with a mirrored   */
/*                      বাংলা builder — structure auto-syncs on every   */
/*                      add / remove / move, plus a one-click          */
/*                      "Sync structure" repair button)               */
/*      5. Connections (tags chips + linked-service checkboxes)        */
/*    Drafts stay hidden from the public blog; publishing makes them   */
/*    live instantly via ContentProvider.refresh().                    */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  ChevronDown,
  ExternalLink,
  Layers,
  Newspaper,
  Pencil,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { services } from "@/lib/data/services";
import type { BlogRow } from "@/lib/content/shared";
import { useContent } from "@/components/site/content-provider";
import {
  BilingualField,
  ConfirmDeleteDialog,
  EmptyState,
  ImageUploadField,
  PanelHeader,
  PanelSkeleton,
  SaveBar,
  StatCard,
  localToday,
  prettyDay,
  useAdminFetch,
  useAdminToast,
  type PanelProps,
} from "../admin-shared";

/* ------------------------------------------------------------------ */
/*  Local helpers                                                      */
/* ------------------------------------------------------------------ */

const BLOG_CATEGORIES = [
  "Preventive Care",
  "Endodontics",
  "Orthodontics",
  "Implantology",
  "Pediatric",
  "Cosmetic",
  "General",
] as const;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const inputCls =
  "h-10 rounded-xl border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25";

const selectTriggerCls =
  "h-10 w-full rounded-xl border-blue-100 bg-ice text-sm text-brand-navy shadow-none focus-visible:ring-brand-blue/25";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      {hint ? <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{hint}</p> : null}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function EditorCard({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="font-heading text-sm font-bold text-brand-navy">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-ice/60 px-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-brand-navy">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{description}</span>
        ) : null}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
        className="data-[state=checked]:bg-brand-navy"
      />
    </label>
  );
}

function ChipsEditor({
  label,
  hint,
  value,
  onChange,
  placeholder,
  addLabel = "Add",
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const [pending, setPending] = useState("");

  function add() {
    const v = pending.trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setPending("");
  }

  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      {hint ? <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{hint}</p> : null}
      {value.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.map((chip, i) => (
            <span
              key={`${chip}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-3 pr-1.5 text-xs font-semibold text-brand-navy ring-1 ring-blue-100"
            >
              {chip}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label={`Remove ${chip}`}
                title={`Remove ${chip}`}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-2 flex gap-2">
        <Input
          value={pending}
          onChange={(e) => setPending(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? "Type and press Enter"}
          aria-label={`${label} — add item`}
          className="h-9 rounded-xl border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="shrink-0 rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "slate" | "amber" | "blue";
  children: React.ReactNode;
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    slate: "bg-slate-100 text-slate-500 ring-slate-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    blue: "bg-blue-50 text-brand-blue ring-blue-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

function TinyButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 ring-1 ring-blue-100 transition disabled:cursor-not-allowed disabled:opacity-30",
        danger ? "hover:bg-rose-50 hover:text-rose-600" : "hover:bg-blue-50 hover:text-brand-navy"
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Sections draft (EN + mirrored BN)                                  */
/* ------------------------------------------------------------------ */

type SectionSide = { heading: string; body: string[]; list: string[] };
type SectionPair = { en: SectionSide; bn: SectionSide };

function mirrorSide(en: SectionSide, bn?: Partial<SectionSide>): SectionSide {
  return {
    heading: bn?.heading ?? "",
    body: Array.from({ length: en.body.length }, (_, j) => bn?.body?.[j] ?? ""),
    list: Array.from({ length: en.list.length }, (_, j) => bn?.list?.[j] ?? ""),
  };
}

function emptyPair(): SectionPair {
  const en: SectionSide = { heading: "", body: [""], list: [] };
  return { en, bn: mirrorSide(en) };
}

/* ------------------------------------------------------------------ */
/*  Blog draft                                                         */
/* ------------------------------------------------------------------ */

type BlogDraft = {
  title: string;
  titleBn: string;
  slug: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  authorCredentials: string;
  featured: boolean;
  status: "PUBLISHED" | "DRAFT";
  image: string;
  imageAlt: string;
  excerpt: string;
  excerptBn: string;
  quickAnswer: string;
  quickAnswerBn: string;
  tags: string[];
  serviceRefs: string[];
  sections: SectionPair[];
};

function rowToDraft(row: BlogRow | null): BlogDraft {
  if (!row) {
    return {
      title: "",
      titleBn: "",
      slug: "",
      category: "General",
      readTime: "5 min read",
      date: localToday(),
      author: "Dr. Shazia Khanam",
      authorCredentials: "BDS, MDS",
      featured: false,
      status: "DRAFT",
      image: "",
      imageAlt: "",
      excerpt: "",
      excerptBn: "",
      quickAnswer: "",
      quickAnswerBn: "",
      tags: [],
      serviceRefs: [],
      sections: [emptyPair()],
    };
  }
  const bn = row.sectionsBn ?? [];
  return {
    title: row.title,
    titleBn: row.titleBn ?? "",
    slug: row.slug,
    category: row.category,
    readTime: row.readTime,
    date: row.date,
    author: row.author,
    authorCredentials: row.authorCredentials,
    featured: row.featured,
    status: row.status,
    image: row.image ?? "",
    imageAlt: row.imageAlt ?? "",
    excerpt: row.excerpt,
    excerptBn: row.excerptBn ?? "",
    quickAnswer: row.quickAnswer,
    quickAnswerBn: row.quickAnswerBn ?? "",
    tags: [...row.tags],
    serviceRefs: [...(row.serviceRefs ?? [])],
    sections: row.sections.map((s, i) => {
      const en: SectionSide = {
        heading: s.heading,
        body: [...s.body],
        list: [...(s.list ?? [])],
      };
      return { en, bn: mirrorSide(en, bn[i]) };
    }),
  };
}

/** EN + BN section payloads, built with identical filtering so indices mirror 1:1. */
function buildSectionPayloads(sections: SectionPair[]): {
  sections: { heading: string; body: string[]; list?: string[] }[];
  sectionsBn: { heading: string; body: string[]; list?: string[] }[];
  bnComplete: boolean;
} {
  let bnComplete = sections.length > 0;
  const out = sections.map((p) => {
    const keptBody = p.en.body
      .map((para, j) => ({ en: para.trim(), bn: (p.bn.body[j] ?? "").trim() }))
      .filter((x) => x.en !== "");
    const keptList = p.en.list
      .map((item, j) => ({ en: item.trim(), bn: (p.bn.list[j] ?? "").trim() }))
      .filter((x) => x.en !== "");

    const heading = p.en.heading.trim();
    const bnHeading = p.bn.heading.trim();
    if (!bnHeading || keptBody.some((x) => x.bn === "")) bnComplete = false;
    const bnListComplete = keptList.length > 0 && keptList.every((x) => x.bn !== "");

    return {
      en: {
        heading,
        body: keptBody.map((x) => x.en),
        ...(keptList.length ? { list: keptList.map((x) => x.en) } : {}),
      },
      bn: {
        heading: bnHeading,
        body: keptBody.map((x) => x.bn),
        ...(bnListComplete ? { list: keptList.map((x) => x.bn) } : {}),
      },
    };
  });
  return { sections: out.map((x) => x.en), sectionsBn: out.map((x) => x.bn), bnComplete };
}

/* ------------------------------------------------------------------ */
/*  Editor                                                             */
/* ------------------------------------------------------------------ */

function BlogEditor({
  row,
  onSessionExpired,
  onSaved,
  onClose,
}: {
  row: BlogRow | null;
  onSessionExpired: () => void;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { post } = useAdminFetch(onSessionExpired);
  const { ok: toastOk, fail: toastFail } = useAdminToast();
  const { refresh } = useContent();
  const [draft, setDraft] = useState<BlogDraft>(() => rowToDraft(row));
  const [slugEdited, setSlugEdited] = useState(row !== null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Set<number>>(() => new Set([0]));
  const [snapshot] = useState(() => JSON.stringify(rowToDraft(row)));

  const dirty = JSON.stringify(draft) !== snapshot;

  const payloadPreview = useMemo(() => buildSectionPayloads(draft.sections), [draft.sections]);
  const bnComplete = payloadPreview.bnComplete;

  function update(patch: Partial<BlogDraft>) {
    setFormError(null);
    setDraft((d) => ({ ...d, ...patch }));
  }

  function setTitle(value: string) {
    setFormError(null);
    setDraft((d) => ({
      ...d,
      title: value,
      slug: slugEdited ? d.slug : slugify(value),
    }));
  }

  function toggleOpen(i: number) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function mapSection(i: number, fn: (pair: SectionPair) => SectionPair) {
    setFormError(null);
    setDraft((d) => ({ ...d, sections: d.sections.map((p, j) => (j === i ? fn(p) : p)) }));
  }

  function addSection() {
    setFormError(null);
    setDraft((d) => ({ ...d, sections: [...d.sections, emptyPair()] }));
    setOpenSections((prev) => new Set(prev).add(draft.sections.length));
  }

  function removeSection(i: number) {
    setFormError(null);
    setDraft((d) => ({ ...d, sections: d.sections.filter((_, j) => j !== i) }));
    setOpenSections((prev) => {
      const next = new Set<number>();
      prev.forEach((idx) => {
        if (idx < i) next.add(idx);
        else if (idx > i) next.add(idx - 1);
      });
      return next;
    });
  }

  function moveSection(i: number, dir: -1 | 1) {
    const target = i + dir;
    if (target < 0 || target >= draft.sections.length) return;
    setFormError(null);
    setDraft((d) => {
      const next = [...d.sections];
      [next[i], next[target]] = [next[target], next[i]];
      return { ...d, sections: next };
    });
    setOpenSections((prev) => {
      const next = new Set<number>();
      prev.forEach((idx) => next.add(idx === i ? target : idx === target ? i : idx));
      return next;
    });
  }

  function addParagraph(i: number) {
    mapSection(i, (p) => ({
      en: { ...p.en, body: [...p.en.body, ""] },
      bn: { ...p.bn, body: [...p.bn.body, ""] },
    }));
  }

  function removeParagraph(i: number, j: number) {
    mapSection(i, (p) => ({
      en: { ...p.en, body: p.en.body.filter((_, k) => k !== j) },
      bn: { ...p.bn, body: p.bn.body.filter((_, k) => k !== j) },
    }));
  }

  function moveParagraph(i: number, j: number, dir: -1 | 1) {
    mapSection(i, (p) => {
      const target = j + dir;
      if (target < 0 || target >= p.en.body.length) return p;
      const swap = <T,>(arr: T[]): T[] => {
        const next = [...arr];
        [next[j], next[target]] = [next[target], next[j]];
        return next;
      };
      return { en: { ...p.en, body: swap(p.en.body) }, bn: { ...p.bn, body: swap(p.bn.body) } };
    });
  }

  function addListItem(i: number) {
    mapSection(i, (p) => ({
      en: { ...p.en, list: [...p.en.list, ""] },
      bn: { ...p.bn, list: [...p.bn.list, ""] },
    }));
  }

  function removeListItem(i: number, j: number) {
    mapSection(i, (p) => ({
      en: { ...p.en, list: p.en.list.filter((_, k) => k !== j) },
      bn: { ...p.bn, list: p.bn.list.filter((_, k) => k !== j) },
    }));
  }

  function removeList(i: number) {
    mapSection(i, (p) => ({ en: { ...p.en, list: [] }, bn: { ...p.bn, list: [] } }));
  }

  function syncStructure() {
    setFormError(null);
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((p) => ({ en: p.en, bn: mirrorSide(p.en, p.bn) })),
    }));
  }

  function toggleServiceRef(slug: string) {
    setFormError(null);
    setDraft((d) => ({
      ...d,
      serviceRefs: d.serviceRefs.includes(slug)
        ? d.serviceRefs.filter((x) => x !== slug)
        : [...d.serviceRefs, slug],
    }));
  }

  function back() {
    if (dirty && !window.confirm("Discard unsaved changes to this post?")) return;
    onClose();
  }

  function reset() {
    setDraft(JSON.parse(snapshot) as BlogDraft);
    setSlugEdited(row !== null);
    setFormError(null);
    setOpenSections(new Set([0]));
  }

  async function save() {
    if (saving) return;
    const d = draft;
    const problems: string[] = [];

    const title = d.title.trim();
    if (title.length < 5) problems.push("Post title must be at least 5 characters.");
    const slug = d.slug.trim().toLowerCase();
    if (!SLUG_RE.test(slug) || slug.length < 2 || slug.length > 80)
      problems.push("Slug must be lowercase letters, numbers and hyphens (2–80 characters).");
    if (d.excerpt.trim().length < 10)
      problems.push("Excerpt must be at least 10 characters.");
    if (d.quickAnswer.trim().length < 10)
      problems.push("Quick answer must be at least 10 characters.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) problems.push("Publish date must be a valid date.");
    if (d.sections.length === 0) problems.push("At least one content section is required.");
    d.sections.forEach((p, i) => {
      const hasBody = p.en.body.some((x) => x.trim() !== "");
      const hasList = p.en.list.some((x) => x.trim() !== "");
      if (!p.en.heading.trim())
        problems.push(`Section ${i + 1} needs a heading.`);
      else if (!hasBody && !hasList)
        problems.push(`Section ${i + 1} (“${p.en.heading.trim()}”) needs a paragraph or list items.`);
    });

    if (problems.length) {
      setFormError(problems[0]);
      toastFail("Check the form", problems[0]);
      return;
    }

    const built = buildSectionPayloads(d.sections);

    setSaving(true);
    const res = await post<{ message?: string; error?: string }>("/api/admin/blog", {
      ...(row ? { id: row.id, updated: localToday() } : {}),
      title,
      slug,
      titleBn: d.titleBn.trim() || undefined,
      category: d.category,
      readTime: d.readTime.trim() || "5 min read",
      date: d.date,
      author: d.author.trim() || undefined,
      authorCredentials: d.authorCredentials.trim() || undefined,
      featured: d.featured,
      status: d.status,
      image: d.image.trim() || undefined,
      imageAlt: d.imageAlt.trim() || undefined,
      excerpt: d.excerpt.trim(),
      excerptBn: d.excerptBn.trim() || undefined,
      quickAnswer: d.quickAnswer.trim(),
      quickAnswerBn: d.quickAnswerBn.trim() || undefined,
      tags: d.tags,
      serviceRefs: d.serviceRefs,
      sections: built.sections,
      sectionsBn: built.bnComplete ? built.sectionsBn : undefined,
    });
    setSaving(false);

    if (res.ok) {
      toastOk(
        row ? "Post updated" : d.status === "PUBLISHED" ? "Post published" : "Draft saved",
        res.data?.message
      );
      void refresh();
      onSaved();
      return;
    }
    const message =
      (res.data as { error?: string } | null)?.error ?? "Could not save this post. Please try again.";
    setFormError(message);
    toastFail("Save failed", message);
  }

  return (
    <div className="space-y-5">
      {/* Editor top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={back}
          className="rounded-full border-blue-200 text-slate-600 hover:bg-blue-50 hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to list
        </Button>
        <div className="min-w-0">
          <h2 className="font-heading text-base font-bold text-brand-navy">
            {row ? "Edit post" : "Write a new post"}
          </h2>
          <p className="truncate text-xs text-slate-500">
            {row ? row.title : "Drafts stay hidden until you flip the status to Published."}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {draft.status === "PUBLISHED" ? (
            <StatusPill tone="green">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
              Published
            </StatusPill>
          ) : (
            <StatusPill tone="amber">
              <PencilLine className="h-3 w-3" aria-hidden="true" />
              Draft
            </StatusPill>
          )}
          {row && row.status === "PUBLISHED" ? (
            <a
              href={`/blog/${row.slug}`}
              target="_blank"
              rel="noreferrer"
              title="View on the public site"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-blue-200 px-3 text-xs font-bold text-brand-navy transition hover:bg-blue-50"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              View
            </a>
          ) : null}
        </div>
      </div>

      {draft.status === "DRAFT" ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
          This post is a <strong>draft</strong> — it stays hidden from the public blog until you set
          its status to Published.
        </p>
      ) : null}

      {/* 1 — Basics */}
      <EditorCard
        title="Basics"
        description="Headline, category, author and publication settings."
      >
        <BilingualField
          label="Title"
          enValue={draft.title}
          bnValue={draft.titleBn}
          onEnChange={(v) => setTitle(v)}
          onBnChange={(v) => update({ titleBn: v })}
          placeholder="How often should you visit the dentist?"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Slug"
            hint={
              row
                ? "⚠ Editing the slug changes the post's public URL."
                : "Auto-generated from the title — you can override it."
            }
          >
            <Input
              value={draft.slug}
              onChange={(e) => {
                setSlugEdited(true);
                update({ slug: e.target.value });
              }}
              placeholder="how-often-visit-dentist"
              className={cn(inputCls, "font-mono")}
            />
          </Field>
          <Field label="Category">
            <Select value={draft.category} onValueChange={(v) => update({ category: v })}>
              <SelectTrigger aria-label="Post category" className={selectTriggerCls}>
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-blue-100">
                {BLOG_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
                {!BLOG_CATEGORIES.includes(draft.category as (typeof BLOG_CATEGORIES)[number]) &&
                draft.category ? (
                  <SelectItem value={draft.category}>{draft.category}</SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Publish date">
            <Input
              type="date"
              value={draft.date}
              onChange={(e) => update({ date: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Read time" hint='e.g. "6 min read"'>
            <Input
              value={draft.readTime}
              onChange={(e) => update({ readTime: e.target.value })}
              placeholder="5 min read"
              className={inputCls}
            />
          </Field>
          <Field label="Author">
            <Input
              value={draft.author}
              onChange={(e) => update({ author: e.target.value })}
              placeholder="Dr. Shazia Khanam"
              className={inputCls}
            />
          </Field>
          <Field label="Author credentials">
            <Input
              value={draft.authorCredentials}
              onChange={(e) => update({ authorCredentials: e.target.value })}
              placeholder="BDS, MDS"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SwitchRow
            label="Featured post"
            description="Featured posts get priority placement on the blog landing page."
            checked={draft.featured}
            onCheckedChange={(featured) => update({ featured })}
          />
          <Field label="Status" hint="Drafts are hidden from the public blog.">
            <Select
              value={draft.status}
              onValueChange={(v) => update({ status: v === "DRAFT" ? "DRAFT" : "PUBLISHED" })}
            >
              <SelectTrigger aria-label="Post status" className={selectTriggerCls}>
                <SelectValue placeholder="Pick a status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-blue-100">
                <SelectItem value="PUBLISHED">Published — live on the site</SelectItem>
                <SelectItem value="DRAFT">Draft — hidden from visitors</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </EditorCard>

      {/* 2 — Cover */}
      <EditorCard title="Cover image" description="Shown on the blog card and article hero.">
        <ImageUploadField
          label="Cover image"
          hint="Landscape images work best (min 1200×675)."
          value={draft.image || undefined}
          onChange={(url) => update({ image: url ?? "" })}
          onUnauthorized={onSessionExpired}
        />
        <Field label="Cover alt text" hint="Accessibility description of the image.">
          <Input
            value={draft.imageAlt}
            onChange={(e) => update({ imageAlt: e.target.value })}
            placeholder="Dentist examining a smiling patient"
            className={inputCls}
          />
        </Field>
      </EditorCard>

      {/* 3 — Summary */}
      <EditorCard
        title="Summary"
        description="The excerpt feeds blog cards and search results; the quick answer feeds the AEO box."
      >
        <BilingualField
          label="Excerpt"
          textarea
          rows={3}
          enValue={draft.excerpt}
          bnValue={draft.excerptBn}
          onEnChange={(v) => update({ excerpt: v })}
          onBnChange={(v) => update({ excerptBn: v })}
          placeholder="A one-paragraph summary of the article…"
        />
        <BilingualField
          label="Quick answer (AEO)"
          textarea
          rows={3}
          enValue={draft.quickAnswer}
          bnValue={draft.quickAnswerBn}
          onEnChange={(v) => update({ quickAnswer: v })}
          onBnChange={(v) => update({ quickAnswerBn: v })}
          placeholder="AEO: answer-first box at the top of the article — 2–3 sentences answering the title question directly."
        />
      </EditorCard>

      {/* 4 — Sections builder */}
      <EditorCard
        title="Article sections"
        description="English is the source of truth — every paragraph and list item you add creates a matching Bangla slot. Empty Bangla fields fall back to English on the site."
        actions={
          <>
            {bnComplete ? (
              <StatusPill tone="green">
                <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                বাংলা complete
              </StatusPill>
            ) : (
              <StatusPill tone="amber">English fallback</StatusPill>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={syncStructure}
              title="Align the Bangla builder to the English structure (same sections, paragraphs and list items)"
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Sync structure
            </Button>
          </>
        }
      >
        {!bnComplete && draft.sections.some((p) => p.bn.heading.trim() || p.bn.body.some((x) => x.trim())) ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800 ring-1 ring-amber-200">
            Bangla translation is <strong>incomplete</strong> — Bangla sections stay unpublished
            (visitors see the English article) until every section heading and paragraph has Bangla
            text.
          </p>
        ) : null}

        <div className="space-y-3">
          {draft.sections.map((pair, i) => {
            const open = openSections.has(i);
            const paragraphCount = pair.en.body.filter((x) => x.trim() !== "").length;
            const listCount = pair.en.list.filter((x) => x.trim() !== "").length;
            return (
              <div key={i} className="rounded-2xl border border-blue-100 bg-ice/40 p-4">
                {/* Section header */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleOpen(i)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
                  >
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-[11px] font-bold tabular-nums text-white">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-brand-navy">
                        {pair.en.heading.trim() || "Untitled section"}
                      </span>
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        {paragraphCount} paragraph{paragraphCount === 1 ? "" : "s"}
                        {listCount ? ` · ${listCount} list item${listCount === 1 ? "" : "s"}` : ""}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                        open && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <TinyButton
                      label="Move section up"
                      onClick={() => moveSection(i, -1)}
                      disabled={i === 0}
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </TinyButton>
                    <TinyButton
                      label="Move section down"
                      onClick={() => moveSection(i, 1)}
                      disabled={i === draft.sections.length - 1}
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </TinyButton>
                    <TinyButton
                      label="Remove section"
                      danger
                      onClick={() => removeSection(i)}
                      disabled={draft.sections.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </TinyButton>
                  </div>
                </div>

                {/* Section body */}
                {open ? (
                  <div className="mt-4 space-y-5 border-t border-blue-100 pt-4">
                    <BilingualField
                      label="Section heading"
                      enValue={pair.en.heading}
                      bnValue={pair.bn.heading}
                      onEnChange={(v) =>
                        mapSection(i, (p) => ({
                          en: { ...p.en, heading: v },
                          bn: p.bn,
                        }))
                      }
                      onBnChange={(v) =>
                        mapSection(i, (p) => ({
                          en: p.en,
                          bn: { ...p.bn, heading: v },
                        }))
                      }
                      placeholder="Why it matters"
                    />

                    {/* Paragraphs */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Paragraphs
                      </p>
                      <div className="mt-2 space-y-3">
                        {pair.en.body.map((para, j) => (
                          <div key={j} className="rounded-xl border border-blue-100 bg-white p-3.5">
                            <div className="flex items-start justify-between gap-2">
                              <BilingualField
                                label={`Paragraph ${j + 1}`}
                                textarea
                                rows={4}
                                enValue={para}
                                bnValue={pair.bn.body[j] ?? ""}
                                onEnChange={(v) =>
                                  mapSection(i, (p) => ({
                                    en: {
                                      ...p.en,
                                      body: p.en.body.map((x, k) => (k === j ? v : x)),
                                    },
                                    bn: p.bn,
                                  }))
                                }
                                onBnChange={(v) =>
                                  mapSection(i, (p) => ({
                                    en: p.en,
                                    bn: {
                                      ...p.bn,
                                      body: p.bn.body.map((x, k) => (k === j ? v : x)),
                                    },
                                  }))
                                }
                                placeholder="Write the paragraph…"
                              />
                              <div className="flex shrink-0 flex-col gap-1 pt-1">
                                <TinyButton
                                  label="Move paragraph up"
                                  onClick={() => moveParagraph(i, j, -1)}
                                  disabled={j === 0}
                                >
                                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                                </TinyButton>
                                <TinyButton
                                  label="Move paragraph down"
                                  onClick={() => moveParagraph(i, j, 1)}
                                  disabled={j === pair.en.body.length - 1}
                                >
                                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                                </TinyButton>
                                <TinyButton
                                  label="Remove paragraph"
                                  danger
                                  onClick={() => removeParagraph(i, j)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </TinyButton>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addParagraph(i)}
                        className="mt-2 rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add paragraph
                      </Button>
                    </div>

                    {/* Bullet list */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Bullet list{" "}
                          <span className="font-medium normal-case tracking-normal text-slate-400">
                            (optional)
                          </span>
                        </p>
                        {pair.en.list.length ? (
                          <button
                            type="button"
                            onClick={() => removeList(i)}
                            className="text-[11px] font-bold text-rose-600 transition hover:text-rose-700"
                          >
                            Remove list
                          </button>
                        ) : null}
                      </div>
                      {pair.en.list.length ? (
                        <div className="mt-2 space-y-2">
                          {pair.en.list.map((item, j) => (
                            <div
                              key={j}
                              className="grid gap-2 rounded-xl border border-blue-100 bg-white p-2.5 sm:grid-cols-[1fr_1fr_auto]"
                            >
                              <Input
                                value={item}
                                onChange={(e) =>
                                  mapSection(i, (p) => ({
                                    en: {
                                      ...p.en,
                                      list: p.en.list.map((x, k) => (k === j ? e.target.value : x)),
                                    },
                                    bn: p.bn,
                                  }))
                                }
                                placeholder="List item (English)"
                                aria-label={`List item ${j + 1} (English)`}
                                className={inputCls}
                              />
                              <Input
                                lang="bn"
                                value={pair.bn.list[j] ?? ""}
                                onChange={(e) =>
                                  mapSection(i, (p) => ({
                                    en: p.en,
                                    bn: {
                                      ...p.bn,
                                      list: p.bn.list.map((x, k) =>
                                        k === j ? e.target.value : x
                                      ),
                                    },
                                  }))
                                }
                                placeholder="ঐচ্ছিক বাংলা"
                                aria-label={`List item ${j + 1} (Bangla)`}
                                className={inputCls}
                              />
                              <TinyButton
                                label="Remove list item"
                                danger
                                onClick={() => removeListItem(i, j)}
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </TinyButton>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">
                          No list yet — add one for bullet-point takeaways.
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addListItem(i)}
                        className="mt-2 rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Add list item
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSection}
          className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add section
        </Button>
      </EditorCard>

      {/* 5 — Connections */}
      <EditorCard
        title="Connections"
        description="Tags power related posts; linked services cross-link the article to treatment pages."
      >
        <ChipsEditor
          label="Tags"
          hint="Topic keywords — press Enter to add."
          value={draft.tags}
          onChange={(tags) => update({ tags })}
          placeholder="checkups"
          addLabel="Add tag"
        />
        <Field label="Linked services" hint="These services will be suggested at the end of the article.">
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((s) => {
              const checked = draft.serviceRefs.includes(s.slug);
              return (
                <label
                  key={s.slug}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition",
                    checked
                      ? "border-brand-navy/30 bg-blue-50/70"
                      : "border-blue-100 bg-white hover:bg-ice"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleServiceRef(s.slug)}
                    aria-label={`Link ${s.name}`}
                    className="h-4 w-4 shrink-0 accent-[#012c5f]"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-brand-navy">
                      {s.name}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-slate-400">
                      {s.slug}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </Field>
      </EditorCard>

      {formError ? (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100"
        >
          {formError}
        </p>
      ) : null}

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={reset}
        saveLabel={row ? "Save changes" : draft.status === "PUBLISHED" ? "Publish post" : "Save draft"}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel (list mode)                                                  */
/* ------------------------------------------------------------------ */

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

export function BlogPanel({ onSessionExpired }: PanelProps) {
  const { del } = useAdminFetch(onSessionExpired);
  const { ok: toastOk, fail: toastFail } = useAdminToast();
  const { refresh } = useContent();

  const [rows, setRows] = useState<BlogRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadBusy, setLoadBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [editing, setEditing] = useState<{ row: BlogRow | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoadBusy(true);
    try {
      const res = await fetch("/api/admin/blog");
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { posts?: BlogRow[]; error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status}).`);
      setRows(data?.posts ?? []);
      setLoaded(true);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load blog posts.");
    } finally {
      setLoadBusy(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set<string>(BLOG_CATEGORIES);
    rows.forEach((r) => set.add(r.category));
    return Array.from(set);
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && r.category !== categoryFilter) return false;
      if (!q) return true;
      return [r.title, r.slug, r.author, r.category, ...r.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, search, statusFilter, categoryFilter]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      published: rows.filter((r) => r.status === "PUBLISHED").length,
      drafts: rows.filter((r) => r.status === "DRAFT").length,
      featured: rows.filter((r) => r.featured).length,
    }),
    [rows]
  );

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await del<{ message?: string; error?: string }>(
      `/api/admin/blog?id=${deleteTarget.id}`
    );
    setDeleting(false);
    if (res.ok) {
      toastOk("Post deleted", res.data?.message);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      void refresh();
    } else {
      toastFail(
        "Delete failed",
        (res.data as { error?: string } | null)?.error ?? "Please try again in a moment."
      );
      setDeleteTarget(null);
    }
  }

  if (!loaded) {
    if (loadError) {
      return (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center">
          <p className="font-heading text-lg font-bold text-rose-700">
            Could not load blog posts
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-rose-600">{loadError}</p>
          <Button
            onClick={() => void load()}
            variant="outline"
            size="sm"
            className="mt-5 rounded-full border-rose-200 text-rose-600 hover:bg-rose-100"
          >
            <RefreshCw className={cn("h-4 w-4", loadBusy && "animate-spin")} aria-hidden="true" />
            Try again
          </Button>
        </div>
      );
    }
    return <PanelSkeleton />;
  }

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 36 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <BlogEditor
              row={editing.row}
              onSessionExpired={onSessionExpired}
              onSaved={() => {
                setEditing(null);
                void load();
              }}
              onClose={() => setEditing(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="space-y-5"
          >
            <PanelHeader
              title="Editorial desk"
              description="Write, publish and update dental health articles — drafts stay hidden until you publish them."
              actions={
                <Button
                  type="button"
                  onClick={() => setEditing({ row: null })}
                  className="rounded-full bg-brand-navy font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New post
                </Button>
              }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={Newspaper} label="Posts" value={stats.total} />
              <StatCard
                icon={BadgeCheck}
                label="Published"
                value={stats.published}
                tone="text-emerald-700 bg-emerald-50 ring-emerald-100"
              />
              <StatCard
                icon={PencilLine}
                label="Drafts"
                value={stats.drafts}
                tone="text-amber-700 bg-amber-50 ring-amber-100"
              />
              <StatCard
                icon={Star}
                label="Featured"
                value={stats.featured}
                tone="text-brand-blue bg-ice ring-blue-100"
              />
            </div>

            {/* Toolbar */}
            <div className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:w-72">
                  <Search
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search title, author, tag…"
                    aria-label="Search blog posts"
                    className="h-11 w-full rounded-full border border-blue-100 bg-ice pl-10 pr-4 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status segmented filter */}
                  <div
                    role="group"
                    aria-label="Filter by status"
                    className="flex rounded-full border border-blue-100 bg-ice p-1"
                  >
                    {(["ALL", "PUBLISHED", "DRAFT"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setStatusFilter(f)}
                        aria-pressed={statusFilter === f}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200",
                          statusFilter === f
                            ? "bg-brand-navy text-white shadow-md shadow-navy-900/20"
                            : "text-slate-500 hover:text-brand-navy"
                        )}
                      >
                        {f === "ALL" ? "All" : f === "PUBLISHED" ? "Published" : "Drafts"}
                      </button>
                    ))}
                  </div>
                  {/* Category filter */}
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger
                      aria-label="Filter by category"
                      className="h-9 w-44 rounded-full border-blue-100 bg-ice text-xs font-bold text-brand-navy shadow-none focus-visible:ring-brand-blue/25"
                    >
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-blue-100">
                      <SelectItem value="ALL">All categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loadBusy}
                    onClick={() => void load()}
                    className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", loadBusy && "animate-spin")}
                      aria-hidden="true"
                    />
                    Refresh
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-400">
                {filtered.length} of {rows.length} posts shown
              </p>
            </div>

            {loadError ? (
              <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
                {loadError}
              </p>
            ) : null}

            {/* Posts */}
            {filtered.length === 0 ? (
              <EmptyState
                icon={Newspaper}
                title={
                  rows.length === 0
                    ? "No posts yet"
                    : statusFilter === "DRAFT" && stats.drafts === 0
                      ? "No drafts — everything is published"
                      : "No posts match your filters"
                }
                description={
                  rows.length === 0
                    ? "Write the first dental health article for the blog."
                    : "Try a different search, status or category."
                }
                action={
                  rows.length === 0 ? (
                    <Button
                      type="button"
                      onClick={() => setEditing({ row: null })}
                      className="rounded-full bg-brand-navy font-bold text-white hover:bg-brand-blue"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      New post
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((r) => (
                  <motion.article
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {/* Cover thumb */}
                      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-blue-100">
                        {r.image ? (
                          <Image
                            src={r.image}
                            alt={r.imageAlt ?? ""}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-ice text-slate-300">
                            <Newspaper className="h-6 w-6" aria-hidden="true" />
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2">
                          <span className="font-heading text-base font-bold leading-snug text-brand-navy">
                            {r.title}
                          </span>
                          {r.featured ? (
                            <span
                              title="Featured post"
                              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200"
                            >
                              <Star
                                className="h-3 w-3 fill-amber-400 text-amber-400"
                                aria-hidden="true"
                              />
                              Featured
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-xs text-slate-400">{r.slug}</p>
                        <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <StatusPill tone="blue">{r.category}</StatusPill>
                          {r.status === "PUBLISHED" ? (
                            <StatusPill tone="green">
                              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                              Published
                            </StatusPill>
                          ) : (
                            <StatusPill tone="amber">
                              <PencilLine className="h-3 w-3" aria-hidden="true" />
                              Draft
                            </StatusPill>
                          )}
                        </p>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-slate-500">
                          <span>{prettyDay(r.date)}</span>
                          <span aria-hidden="true">·</span>
                          <span>{r.readTime}</span>
                          <span aria-hidden="true">·</span>
                          <span>{r.author}</span>
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing({ row: r })}
                          className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(r)}
                          className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => void confirmDelete()}
        loading={deleting}
        title="Delete this post?"
        description={
          <>
            <strong className="text-brand-navy">{deleteTarget?.title}</strong> will be removed from
            the database and the public blog. This cannot be undone.
          </>
        }
      />
    </div>
  );
}
