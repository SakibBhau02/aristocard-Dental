"use client";

/* ------------------------------------------------------------------ */
/*  Cases panel — full CRUD for Smile Gallery case studies.             */
/*                                                                     */
/*  • List mode: before/after thumbnail pairs with an arrow between,   */
/*    treatment + category pill + featured star + linked service pill. */
/*  • Edit mode: basics (title / slug / treatment / category), the     */
/*    linked service, patient story fields, a repeatable procedures    */
/*    list, before/after photo uploads with alt text and a featured    */
/*    switch — with dirty tracking + sticky SaveBar.                   */
/*    Saves call ContentProvider.refresh() so /gallery updates live.   */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ImageOff,
  Link2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Smile,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { services } from "@/lib/data/services";
import type { CaseRow } from "@/lib/content/shared";
import { useContent } from "@/components/site/content-provider";
import {
  ConfirmDeleteDialog,
  EmptyState,
  ImageUploadField,
  PanelHeader,
  PanelSkeleton,
  SaveBar,
  StatCard,
  useAdminFetch,
  useAdminToast,
  type PanelProps,
} from "../admin-shared";

/* ------------------------------------------------------------------ */
/*  Local helpers                                                      */
/* ------------------------------------------------------------------ */

const CASE_CATEGORIES = ["Cosmetic", "Orthodontics", "Restorative", "Preventive"] as const;

const CATEGORY_TONES: Record<string, string> = {
  Cosmetic: "bg-violet-50 text-violet-700 ring-violet-200",
  Orthodontics: "bg-blue-50 text-brand-blue ring-blue-200",
  Restorative: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Preventive: "bg-amber-50 text-amber-700 ring-amber-200",
};

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
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="font-heading text-sm font-bold text-brand-navy">{title}</h3>
      {description ? (
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
      ) : null}
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

/** Repeatable plain string inputs (one per row) — used for procedures. */
function StringListEditor({
  label,
  hint,
  value,
  onChange,
  placeholder,
  addLabel,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      {hint ? <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{hint}</p> : null}
      <div className="mt-2 space-y-2">
        {value.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[11px] font-bold tabular-nums text-brand-blue ring-1 ring-blue-100">
              {i + 1}
            </span>
            <Input
              value={item}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder={placeholder}
              aria-label={`${label} ${i + 1}`}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label={`Remove ${label} ${i + 1}`}
              title="Remove"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 ring-1 ring-blue-100 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...value, ""])}
          className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

function CaseThumb({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <span className="flex flex-col items-center gap-1">
      <span className="relative block h-20 w-20 overflow-hidden rounded-xl ring-1 ring-blue-100">
        {src ? (
          <Image src={src} alt={alt} fill sizes="80px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-ice text-slate-300">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Draft                                                              */
/* ------------------------------------------------------------------ */

type CaseDraft = {
  title: string;
  slug: string;
  treatment: string;
  category: CaseRow["category"];
  serviceSlug: string;
  patient: string;
  age: string;
  duration: string;
  result: string;
  procedures: string[];
  featured: boolean;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
};

function rowToDraft(row: CaseRow | null): CaseDraft {
  return row
    ? {
        title: row.title,
        slug: row.slug,
        treatment: row.treatment,
        category: row.category,
        serviceSlug: row.serviceSlug ?? "",
        patient: row.patient,
        age: String(row.age),
        duration: row.duration,
        result: row.result,
        procedures: [...row.procedures],
        featured: row.featured,
        beforeSrc: row.beforeSrc,
        afterSrc: row.afterSrc,
        beforeAlt: row.beforeAlt ?? "",
        afterAlt: row.afterAlt ?? "",
      }
    : {
        title: "",
        slug: "",
        treatment: "",
        category: "Cosmetic",
        serviceSlug: "",
        patient: "",
        age: "30",
        duration: "",
        result: "",
        procedures: [],
        featured: false,
        beforeSrc: "",
        afterSrc: "",
        beforeAlt: "",
        afterAlt: "",
      };
}

/* ------------------------------------------------------------------ */
/*  Editor                                                             */
/* ------------------------------------------------------------------ */

function CasesEditor({
  row,
  nextSort,
  onSessionExpired,
  onSaved,
  onClose,
}: {
  row: CaseRow | null;
  nextSort: number;
  onSessionExpired: () => void;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { post } = useAdminFetch(onSessionExpired);
  const { ok: toastOk, fail: toastFail } = useAdminToast();
  const { refresh } = useContent();
  const [draft, setDraft] = useState<CaseDraft>(() => rowToDraft(row));
  const [slugEdited, setSlugEdited] = useState(row !== null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [snapshot] = useState(() => JSON.stringify(rowToDraft(row)));

  const dirty = JSON.stringify(draft) !== snapshot;

  function update(patch: Partial<CaseDraft>) {
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

  function back() {
    if (dirty && !window.confirm("Discard unsaved changes to this case?")) return;
    onClose();
  }

  function reset() {
    setDraft(JSON.parse(snapshot) as CaseDraft);
    setSlugEdited(row !== null);
    setFormError(null);
  }

  async function save() {
    if (saving) return;
    const d = draft;
    const problems: string[] = [];

    const title = d.title.trim();
    if (title.length < 4) problems.push("Case title must be at least 4 characters.");
    const slug = d.slug.trim().toLowerCase();
    if (!SLUG_RE.test(slug) || slug.length < 2 || slug.length > 80)
      problems.push("Slug must be lowercase letters, numbers and hyphens (2–80 characters).");
    if (d.treatment.trim().length < 2) problems.push("Treatment name is required.");
    if (!d.beforeSrc.trim().startsWith("/"))
      problems.push("Before photo path must start with / (e.g. /images/… or /uploads/…).");
    if (!d.afterSrc.trim().startsWith("/"))
      problems.push("After photo path must start with / (e.g. /images/… or /uploads/…).");
    if (d.patient.trim().length < 1) problems.push("Patient label is required (e.g. \"R. Ahmed\").");
    if (d.result.trim().length < 10)
      problems.push("Result description must be at least 10 characters.");
    if (d.duration.trim().length < 1) problems.push("Treatment duration is required.");
    const age = Number(d.age);
    if (!Number.isFinite(age) || age < 0 || age > 120)
      problems.push("Age must be a number between 0 and 120.");

    if (problems.length) {
      setFormError(problems[0]);
      toastFail("Check the form", problems[0]);
      return;
    }

    setSaving(true);
    const res = await post<{ message?: string; error?: string }>("/api/admin/cases", {
      ...(row ? { id: row.id, sort: row.sort } : { sort: nextSort }),
      title,
      slug,
      treatment: d.treatment.trim(),
      category: d.category,
      serviceSlug: d.serviceSlug || undefined,
      beforeSrc: d.beforeSrc.trim(),
      afterSrc: d.afterSrc.trim(),
      beforeAlt: d.beforeAlt.trim() || undefined,
      afterAlt: d.afterAlt.trim() || undefined,
      patient: d.patient.trim(),
      age,
      duration: d.duration.trim(),
      procedures: d.procedures.map((p) => p.trim()).filter(Boolean),
      result: d.result.trim(),
      featured: d.featured,
    });
    setSaving(false);

    if (res.ok) {
      toastOk(row ? "Case updated" : "Case created", res.data?.message);
      void refresh();
      onSaved();
      return;
    }
    const message =
      (res.data as { error?: string } | null)?.error ?? "Could not save this case. Please try again.";
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
            {row ? "Edit smile case" : "Add a new smile case"}
          </h2>
          <p className="truncate text-xs text-slate-500">
            {row ? row.title : "New cases appear in the Smile Gallery after saving."}
          </p>
        </div>
      </div>

      {/* Basics */}
      <EditorCard
        title="Case basics"
        description="Headline, treatment and classification shown on the gallery card."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Input
              value={draft.title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brighter smile in two visits"
              className={inputCls}
            />
          </Field>
          <Field
            label="Slug"
            hint={
              row
                ? "⚠ Editing the slug changes the case's public anchor link."
                : "Auto-generated from the title — you can override it."
            }
          >
            <Input
              value={draft.slug}
              onChange={(e) => {
                setSlugEdited(true);
                update({ slug: e.target.value });
              }}
              placeholder="case-whitening"
              className={cn(inputCls, "font-mono")}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Treatment">
            <Input
              value={draft.treatment}
              onChange={(e) => update({ treatment: e.target.value })}
              placeholder="Teeth Whitening"
              className={inputCls}
            />
          </Field>
          <Field label="Category">
            <Select
              value={draft.category}
              onValueChange={(v) => update({ category: v as CaseRow["category"] })}
            >
              <SelectTrigger aria-label="Case category" className={selectTriggerCls}>
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-blue-100">
                {CASE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field
          label="Linked service"
          hint="Links the case to its treatment page — shown as a pill on the gallery."
        >
          <Select
            value={draft.serviceSlug || "none"}
            onValueChange={(v) => update({ serviceSlug: v === "none" ? "" : v })}
          >
            <SelectTrigger aria-label="Linked service" className={selectTriggerCls}>
              <SelectValue placeholder="— none —" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-blue-100">
              <SelectItem value="none">— none —</SelectItem>
              {services.map((s) => (
                <SelectItem key={s.slug} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </EditorCard>

      {/* Patient story */}
      <EditorCard title="Patient story" description="Anonymous labels like “R. Ahmed” work best.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Patient label">
            <Input
              value={draft.patient}
              onChange={(e) => update({ patient: e.target.value })}
              placeholder="R. Ahmed"
              className={inputCls}
            />
          </Field>
          <Field label="Age">
            <Input
              type="number"
              min={0}
              max={120}
              value={draft.age}
              onChange={(e) => update({ age: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Duration" hint="e.g. 2 visits · 6 months">
            <Input
              value={draft.duration}
              onChange={(e) => update({ duration: e.target.value })}
              placeholder="2 visits"
              className={inputCls}
            />
          </Field>
        </div>
        <StringListEditor
          label="Procedures"
          hint="Step-by-step treatments that made up this case."
          value={draft.procedures}
          onChange={(procedures) => update({ procedures })}
          placeholder="Laser teeth whitening"
          addLabel="Add procedure"
        />
        <Field label="Result" hint="The after-story shown under the photos.">
          <Textarea
            value={draft.result}
            onChange={(e) => update({ result: e.target.value })}
            rows={4}
            placeholder="What changed for this patient…"
            className="border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
          />
        </Field>
      </EditorCard>

      {/* Photos */}
      <EditorCard
        title="Before & after photos"
        description="Both photos must exist — they are the heart of the gallery."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <ImageUploadField
            label="Before photo"
            value={draft.beforeSrc || undefined}
            onChange={(url) => update({ beforeSrc: url ?? "" })}
            onUnauthorized={onSessionExpired}
          />
          <ImageUploadField
            label="After photo"
            value={draft.afterSrc || undefined}
            onChange={(url) => update({ afterSrc: url ?? "" })}
            onUnauthorized={onSessionExpired}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Before alt text" hint="Optional — accessibility fallback defaults to the title.">
            <Input
              value={draft.beforeAlt}
              onChange={(e) => update({ beforeAlt: e.target.value })}
              placeholder="R. Ahmed before whitening"
              className={inputCls}
            />
          </Field>
          <Field label="After alt text" hint="Optional — accessibility fallback defaults to the title.">
            <Input
              value={draft.afterAlt}
              onChange={(e) => update({ afterAlt: e.target.value })}
              placeholder="R. Ahmed after whitening"
              className={inputCls}
            />
          </Field>
        </div>
        <SwitchRow
          label="Feature on the gallery hero"
          description="Featured cases get priority placement and larger cards."
          checked={draft.featured}
          onCheckedChange={(featured) => update({ featured })}
        />
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
        saveLabel={row ? "Save changes" : "Create case"}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel (list mode)                                                  */
/* ------------------------------------------------------------------ */

export function CasesPanel({ onSessionExpired }: PanelProps) {
  const { del } = useAdminFetch(onSessionExpired);
  const { ok: toastOk, fail: toastFail } = useAdminToast();
  const { refresh } = useContent();

  const [rows, setRows] = useState<CaseRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadBusy, setLoadBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ row: CaseRow | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CaseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoadBusy(true);
    try {
      const res = await fetch("/api/admin/cases");
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { cases?: CaseRow[]; error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status}).`);
      setRows(data?.cases ?? []);
      setLoaded(true);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load smile cases.");
    } finally {
      setLoadBusy(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.title, r.treatment, r.patient, r.slug, r.category, ...(r.serviceSlug ? [r.serviceSlug] : [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      featured: rows.filter((r) => r.featured).length,
      linked: rows.filter((r) => Boolean(r.serviceSlug)).length,
    }),
    [rows]
  );

  const nextSort = useMemo(
    () => (rows.length ? Math.max(...rows.map((r) => r.sort)) + 1 : 0),
    [rows]
  );

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await del<{ message?: string; error?: string }>(
      `/api/admin/cases?id=${deleteTarget.id}`
    );
    setDeleting(false);
    if (res.ok) {
      toastOk("Case deleted", res.data?.message);
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
            Could not load smile cases
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
            <CasesEditor
              row={editing.row}
              nextSort={nextSort}
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
              title="Smile transformations"
              description="Before/after case studies — every save syncs the public gallery instantly."
              actions={
                <Button
                  type="button"
                  onClick={() => setEditing({ row: null })}
                  className="rounded-full bg-brand-navy font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add case
                </Button>
              }
            />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={Smile} label="Cases" value={stats.total} />
              <StatCard
                icon={Star}
                label="Featured"
                value={stats.featured}
                tone="text-amber-700 bg-amber-50 ring-amber-100"
              />
              <StatCard
                icon={Link2}
                label="Service-linked"
                value={stats.linked}
                tone="text-brand-blue bg-ice ring-blue-100"
              />
            </div>

            {/* Toolbar */}
            <div className="rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-80">
                  <Search
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search title, treatment, patient…"
                    aria-label="Search smile cases"
                    className="h-11 w-full rounded-full border border-blue-100 bg-ice pl-10 pr-4 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-slate-400">
                    {filtered.length} of {rows.length} shown
                  </p>
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
            </div>

            {loadError ? (
              <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
                {loadError}
              </p>
            ) : null}

            {/* Rows */}
            {filtered.length === 0 ? (
              <EmptyState
                icon={Smile}
                title={rows.length === 0 ? "No cases yet" : "No cases match your search"}
                description={
                  rows.length === 0
                    ? "Add the first before/after transformation to start the gallery."
                    : "Try a different title, treatment or patient."
                }
                action={
                  rows.length === 0 ? (
                    <Button
                      type="button"
                      onClick={() => setEditing({ row: null })}
                      className="rounded-full bg-brand-navy font-bold text-white hover:bg-brand-blue"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Add case
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
                      {/* Before / after pair */}
                      <div className="flex shrink-0 items-center gap-2">
                        <CaseThumb src={r.beforeSrc} alt={r.beforeAlt ?? r.title} label="Before" />
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-brand-gold"
                          aria-hidden="true"
                        />
                        <CaseThumb src={r.afterSrc} alt={r.afterAlt ?? r.title} label="After" />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2">
                          <span className="font-heading text-base font-bold leading-snug text-brand-navy">
                            {r.title}
                          </span>
                          {r.featured ? (
                            <span
                              title="Featured"
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
                        <p className="mt-0.5 text-sm text-slate-600">
                          {r.treatment} · {r.patient}, {r.age}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                              CATEGORY_TONES[r.category] ?? CATEGORY_TONES.Cosmetic
                            )}
                          >
                            {r.category}
                          </span>
                          {r.serviceSlug ? (
                            <span
                              title={`Linked service: ${r.serviceSlug}`}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-brand-blue ring-1 ring-blue-100"
                            >
                              <Link2 className="h-3 w-3" aria-hidden="true" />
                              {services.find((s) => s.slug === r.serviceSlug)?.shortName ??
                                r.serviceSlug}
                            </span>
                          ) : null}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                        <div className="flex items-center gap-2">
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
        title="Delete this case?"
        description={
          <>
            <strong className="text-brand-navy">{deleteTarget?.title}</strong> and its before/after
            photos will be removed from the Smile Gallery. This cannot be undone.
          </>
        }
      />
    </div>
  );
}
