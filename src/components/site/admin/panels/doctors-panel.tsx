"use client";

/* ------------------------------------------------------------------ */
/*  Doctors panel — full CRUD editor for the dental team.              */
/*                                                                     */
/*  • List mode: KPI stats + search + roster cards (photo / initials   */
/*    avatar with accent ring, role, department, experience numbers,   */
/*    consultation-day pills, active state) with Edit / Delete.        */
/*  • Edit mode: full-screen form inside the content area — bilingual  */
/*    role + department, credentials / specializations / languages     */
/*    chip editors, weekday toggle pills, accent colour, photo upload  */
/*    and an active switch. Dirty tracking + sticky SaveBar.           */
/*    Saves call ContentProvider.refresh() so the public /doctors      */
/*    page re-renders live.                                            */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  EyeOff,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Stethoscope,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { DoctorRow } from "@/lib/content/shared";
import { useContent } from "@/components/site/content-provider";
import { DynamicIcon } from "@/components/site/icon-map";
import {
  BilingualField,
  ConfirmDeleteDialog,
  EmptyState,
  ImageUploadField,
  PanelHeader,
  PanelSkeleton,
  SaveBar,
  StatCard,
  initialsOf,
  useAdminFetch,
  useAdminToast,
  type PanelProps,
} from "../admin-shared";

/* ------------------------------------------------------------------ */
/*  Local helpers                                                      */
/* ------------------------------------------------------------------ */

const WEEKDAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
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

/* ------------------------------------------------------------------ */
/*  Round 17-a — dossier editors                                       */
/* ------------------------------------------------------------------ */

type EducationDraft = { degree: string; institution: string; year: string };
type AwardDraft = { title: string; year: string };

const rowInputCls =
  "h-9 rounded-xl border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25";

/* Education & training rows — degree / institution / year + remove. */
function EducationEditor({
  value,
  onChange,
}: {
  value: EducationDraft[];
  onChange: (next: EducationDraft[]) => void;
}) {
  function update(i: number, patch: Partial<EducationDraft>) {
    onChange(value.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Education &amp; training
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
        Rendered as a timeline on the profile — degree is required; institution and year are optional.
      </p>
      {value.length ? (
        <div className="mt-2 space-y-2">
          {value.map((row, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-xl border border-blue-100 bg-ice/60 p-3 sm:grid-cols-[1.1fr_1.4fr_0.55fr_auto] sm:items-center"
            >
              <label className="min-w-0 block">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Degree
                </span>
                <Input
                  value={row.degree}
                  onChange={(e) => update(i, { degree: e.target.value })}
                  placeholder="BDS"
                  maxLength={120}
                  aria-label={`Education row ${i + 1} degree`}
                  className={cn(rowInputCls, "mt-1")}
                />
              </label>
              <label className="min-w-0 block">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Institution
                </span>
                <Input
                  value={row.institution}
                  onChange={(e) => update(i, { institution: e.target.value })}
                  placeholder="University of Dhaka"
                  maxLength={160}
                  aria-label={`Education row ${i + 1} institution`}
                  className={cn(rowInputCls, "mt-1")}
                />
              </label>
              <label className="min-w-0 block">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Year
                </span>
                <Input
                  value={row.year}
                  onChange={(e) => update(i, { year: e.target.value })}
                  placeholder="2016"
                  maxLength={16}
                  aria-label={`Education row ${i + 1} year`}
                  className={cn(rowInputCls, "mt-1")}
                />
              </label>
              <div className="flex justify-end sm:pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label={`Remove education row ${i + 1}`}
                  className="h-9 w-9 rounded-full border-rose-200 p-0 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, { degree: "", institution: "", year: "" }])}
        className="mt-2 rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add education
      </Button>
    </div>
  );
}

/* Awards & recognition rows — title / year + remove. */
function AwardsEditor({
  value,
  onChange,
}: {
  value: AwardDraft[];
  onChange: (next: AwardDraft[]) => void;
}) {
  function update(i: number, patch: Partial<AwardDraft>) {
    onChange(value.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Awards &amp; recognition
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
        Only add real awards — the section stays hidden while empty.
      </p>
      {value.length ? (
        <div className="mt-2 space-y-2">
          {value.map((row, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-xl border border-blue-100 bg-ice/60 p-3 sm:grid-cols-[1fr_0.55fr_auto] sm:items-center"
            >
              <label className="min-w-0 block">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Title
                </span>
                <Input
                  value={row.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  placeholder="Best Dental Surgeon Award"
                  maxLength={160}
                  aria-label={`Award row ${i + 1} title`}
                  className={cn(rowInputCls, "mt-1")}
                />
              </label>
              <label className="min-w-0 block">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Year
                </span>
                <Input
                  value={row.year}
                  onChange={(e) => update(i, { year: e.target.value })}
                  placeholder="2024"
                  maxLength={16}
                  aria-label={`Award row ${i + 1} year`}
                  className={cn(rowInputCls, "mt-1")}
                />
              </label>
              <div className="flex justify-end sm:pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label={`Remove award row ${i + 1}`}
                  className="h-9 w-9 rounded-full border-rose-200 p-0 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...value, { title: "", year: "" }])}
        className="mt-2 rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add award
      </Button>
    </div>
  );
}

/* Focus treatments — toggle chips of the 11 real services. */
function FocusServicesPicker({
  value,
  onChange,
  services,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  services: { slug: string; name: string; icon: string }[];
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Focus treatments
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
        Selected treatments appear on the profile as links to their service pages.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {services.map((svc) => {
          const on = value.includes(svc.slug);
          return (
            <button
              key={svc.slug}
              type="button"
              aria-pressed={on}
              title={svc.name}
              onClick={() =>
                onChange(
                  on ? value.filter((x) => x !== svc.slug) : [...value, svc.slug]
                )
              }
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-xs font-bold ring-1 transition-all duration-200",
                on
                  ? "bg-brand-navy text-white ring-brand-navy shadow-md shadow-navy-900/20"
                  : "bg-white text-slate-500 ring-blue-100 hover:bg-blue-50 hover:text-brand-navy"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full",
                  on ? "bg-white/15 text-white" : "bg-blue-50 text-brand-blue"
                )}
              >
                <DynamicIcon name={svc.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0 text-left">{svc.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Draft shape                                                        */
/* ------------------------------------------------------------------ */

type DoctorDraft = {
  name: string;
  slug: string;
  role: string;
  roleBn: string;
  department: string;
  departmentBn: string;
  credentials: string[];
  bio: string;
  experienceYears: string;
  patientsTreated: string;
  rating: string;
  specializations: string[];
  languages: string[];
  consultationDays: string[];
  accent: string;
  photo: string;
  active: boolean;
  /* Round 17-a dossier */
  education: EducationDraft[];
  memberships: string[];
  awards: AwardDraft[];
  quote: string;
  quoteBn: string;
  focusServices: string[];
};

function rowToDraft(row: DoctorRow | null): DoctorDraft {
  return row
    ? {
        name: row.name,
        slug: row.slug,
        role: row.role,
        roleBn: row.roleBn ?? "",
        department: row.department,
        departmentBn: row.departmentBn ?? "",
        credentials: [...row.credentials],
        bio: row.bio,
        experienceYears: String(row.experienceYears),
        patientsTreated: String(row.patientsTreated),
        rating: String(row.rating),
        specializations: [...row.specializations],
        languages: row.languages.length ? [...row.languages] : ["Bangla", "English"],
        consultationDays: [...row.consultationDays],
        accent: row.accent,
        photo: row.photo ?? "",
        active: row.active,
        education: (row.education ?? []).map((e) => ({
          degree: e.degree,
          institution: e.institution ?? "",
          year: e.year ?? "",
        })),
        memberships: [...(row.memberships ?? [])],
        awards: (row.awards ?? []).map((a) => ({
          title: a.title,
          year: a.year ?? "",
        })),
        quote: row.quote ?? "",
        quoteBn: row.quoteBn ?? "",
        focusServices: [...(row.focusServices ?? [])],
      }
    : {
        name: "",
        slug: "",
        role: "",
        roleBn: "",
        department: "",
        departmentBn: "",
        credentials: [],
        bio: "",
        experienceYears: "5",
        patientsTreated: "0",
        rating: "4.8",
        specializations: [],
        languages: ["Bangla", "English"],
        consultationDays: [],
        accent: "#012c5f",
        photo: "",
        active: true,
        education: [],
        memberships: [],
        awards: [],
        quote: "",
        quoteBn: "",
        focusServices: [],
      };
}

/* ------------------------------------------------------------------ */
/*  Editor                                                             */
/* ------------------------------------------------------------------ */

function DoctorsEditor({
  row,
  nextSort,
  onSessionExpired,
  onSaved,
  onClose,
}: {
  row: DoctorRow | null;
  nextSort: number;
  onSessionExpired: () => void;
  onSaved: (row: DoctorRow) => void;
  onClose: () => void;
}) {
  const { post } = useAdminFetch(onSessionExpired);
  const { ok: toastOk, fail: toastFail } = useAdminToast();
  const { refresh, bundle } = useContent();
  const [draft, setDraft] = useState<DoctorDraft>(() => rowToDraft(row));
  const [slugEdited, setSlugEdited] = useState(row !== null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [snapshot] = useState(() => JSON.stringify(rowToDraft(row)));

  const dirty = JSON.stringify(draft) !== snapshot;

  function update(patch: Partial<DoctorDraft>) {
    setFormError(null);
    setDraft((d) => ({ ...d, ...patch }));
  }

  function setName(value: string) {
    setFormError(null);
    setDraft((d) => ({
      ...d,
      name: value,
      slug: slugEdited ? d.slug : slugify(value),
    }));
  }

  function toggleDay(day: string) {
    setFormError(null);
    setDraft((d) => ({
      ...d,
      consultationDays: d.consultationDays.includes(day)
        ? d.consultationDays.filter((x) => x !== day)
        : [...d.consultationDays, day],
    }));
  }

  function back() {
    if (dirty && !window.confirm("Discard unsaved changes to this doctor?")) return;
    onClose();
  }

  function reset() {
    setDraft(JSON.parse(snapshot) as DoctorDraft);
    setSlugEdited(row !== null);
    setFormError(null);
  }

  async function save() {
    if (saving) return;
    const d = draft;
    const problems: string[] = [];

    const name = d.name.trim();
    if (name.length < 3) problems.push("Doctor name must be at least 3 characters.");
    const slug = d.slug.trim().toLowerCase();
    if (!SLUG_RE.test(slug) || slug.length < 2 || slug.length > 80)
      problems.push("Slug must be lowercase letters, numbers and hyphens (2–80 characters).");
    if (d.role.trim().length < 2) problems.push("Role is required.");
    if (d.department.trim().length < 2) problems.push("Department is required.");
    if (d.bio.trim().length < 10) problems.push("Bio must be at least 10 characters.");
    const years = Number(d.experienceYears);
    const patients = Number(d.patientsTreated);
    const rating = Number(d.rating);
    if (!Number.isFinite(years) || years < 0 || years > 80)
      problems.push("Experience years must be a number between 0 and 80.");
    if (!Number.isFinite(patients) || patients < 0)
      problems.push("Patients treated must be a positive number.");
    if (!Number.isFinite(rating) || rating < 0 || rating > 5)
      problems.push("Rating must be a number between 0 and 5.");

    if (problems.length) {
      setFormError(problems[0]);
      toastFail("Check the form", problems[0]);
      return;
    }

    setSaving(true);
    const res = await post<{ doctor?: DoctorRow; message?: string; error?: string }>(
      "/api/admin/doctors",
      {
        ...(row ? { id: row.id, sort: row.sort } : { sort: nextSort }),
        name,
        slug,
        role: d.role.trim(),
        roleBn: d.roleBn.trim() || undefined,
        department: d.department.trim(),
        departmentBn: d.departmentBn.trim() || undefined,
        credentials: d.credentials,
        bio: d.bio.trim(),
        experienceYears: years,
        patientsTreated: patients,
        rating,
        specializations: d.specializations,
        languages: d.languages,
        consultationDays: d.consultationDays,
        accent: d.accent,
        photo: d.photo.trim() || undefined,
        /* Round 17-a dossier (empty rows are dropped server-side) */
        education: d.education
          .filter((e) => e.degree.trim())
          .map((e) => ({
            degree: e.degree.trim(),
            institution: e.institution.trim() || undefined,
            year: e.year.trim() || undefined,
          })),
        memberships: d.memberships,
        awards: d.awards
          .filter((a) => a.title.trim())
          .map((a) => ({
            title: a.title.trim(),
            year: a.year.trim() || undefined,
          })),
        quote: d.quote.trim() || undefined,
        quoteBn: d.quoteBn.trim() || undefined,
        focusServices: d.focusServices,
        active: d.active,
      }
    );
    setSaving(false);

    if (res.ok && res.data?.doctor) {
      toastOk(row ? "Doctor updated" : "Doctor created", res.data.message);
      void refresh();
      onSaved(res.data.doctor);
      return;
    }
    const message =
      (res.data as { error?: string } | null)?.error ??
      "Could not save this doctor. Please try again.";
    setFormError(message);
    toastFail("Save failed", message);
  }

  const accentSafe = /^#[0-9a-fA-F]{6}$/.test(draft.accent) ? draft.accent : "#012c5f";

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
            {row ? "Edit doctor" : "Add a new doctor"}
          </h2>
          <p className="truncate text-xs text-slate-500">
            {row
              ? `${row.name} · public profile /doctors/${row.slug}`
              : "New doctors appear on the public roster as soon as you save."}
          </p>
        </div>
        {row ? (
          <span className="ml-auto">
            {row.active ? (
              <StatusPill tone="green">
                <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                Active
              </StatusPill>
            ) : (
              <StatusPill tone="slate">
                <EyeOff className="h-3 w-3" aria-hidden="true" />
                Hidden
              </StatusPill>
            )}
          </span>
        ) : null}
      </div>

      {/* Identity */}
      <EditorCard title="Identity" description="Name, public slug, accent colour and profile photo.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input
              value={draft.name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Full Name"
              className={inputCls}
            />
          </Field>
          <Field
            label="Slug"
            hint={
              row
                ? "⚠ Editing the slug changes the doctor's public profile link."
                : "Auto-generated from the name — you can override it."
            }
          >
            <Input
              value={draft.slug}
              onChange={(e) => {
                setSlugEdited(true);
                update({ slug: e.target.value });
              }}
              placeholder="dr-full-name"
              className={cn(inputCls, "font-mono")}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
          <Field label="Accent colour" hint="Used for card rings and detail accents.">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentSafe}
                onChange={(e) => update({ accent: e.target.value })}
                aria-label="Pick accent colour"
                title="Pick accent colour"
                className="h-10 w-14 cursor-pointer rounded-xl border border-blue-100 bg-white p-1"
              />
              <Input
                value={draft.accent}
                onChange={(e) => update({ accent: e.target.value })}
                aria-label="Accent colour hex value"
                className={cn(inputCls, "w-32 font-mono")}
              />
            </div>
          </Field>
          <ImageUploadField
            label="Photo"
            hint="Square portraits work best (min 400×400)."
            value={draft.photo || undefined}
            onChange={(url) => update({ photo: url ?? "" })}
            onUnauthorized={onSessionExpired}
          />
        </div>
        <SwitchRow
          label="Visible on the website"
          description="Hidden doctors stay in the database but disappear from the public roster."
          checked={draft.active}
          onCheckedChange={(checked) => update({ active: checked })}
        />
      </EditorCard>

      {/* Role & bio */}
      <EditorCard title="Role & bio" description="Shown on the doctors page and profile cards.">
        <BilingualField
          label="Role / title"
          enValue={draft.role}
          bnValue={draft.roleBn}
          onEnChange={(v) => update({ role: v })}
          onBnChange={(v) => update({ roleBn: v })}
          placeholder="Chief Dental Surgeon & Founder"
        />
        <BilingualField
          label="Department"
          enValue={draft.department}
          bnValue={draft.departmentBn}
          onEnChange={(v) => update({ department: v })}
          onBnChange={(v) => update({ departmentBn: v })}
          placeholder="Advanced Dentistry & Orthodontics"
        />
        <Field label="Bio (English)" hint="2–3 sentences for the profile page.">
          <Textarea
            value={draft.bio}
            onChange={(e) => update({ bio: e.target.value })}
            rows={6}
            placeholder="A short professional biography…"
            className="border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
          />
        </Field>
      </EditorCard>

      {/* Numbers */}
      <EditorCard title="Experience numbers" description="Displayed as highlights on the doctor card.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Years of experience">
            <Input
              type="number"
              min={0}
              max={80}
              value={draft.experienceYears}
              onChange={(e) => update({ experienceYears: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Patients treated">
            <Input
              type="number"
              min={0}
              value={draft.patientsTreated}
              onChange={(e) => update({ patientsTreated: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Rating (0–5)">
            <Input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={draft.rating}
              onChange={(e) => update({ rating: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
      </EditorCard>

      {/* Expertise */}
      <EditorCard title="Expertise" description="Degrees, specializations and spoken languages.">
        <ChipsEditor
          label="Credentials"
          hint="Degrees like BDS, MDS — press Enter to add."
          value={draft.credentials}
          onChange={(credentials) => update({ credentials })}
          placeholder="BDS"
          addLabel="Add degree"
        />
        <ChipsEditor
          label="Specializations"
          hint="Focus areas shown on the profile."
          value={draft.specializations}
          onChange={(specializations) => update({ specializations })}
          placeholder="Orthodontics & Braces"
        />
        <ChipsEditor
          label="Languages"
          hint="Consultation languages."
          value={draft.languages}
          onChange={(languages) => update({ languages })}
          placeholder="Bangla"
        />
      </EditorCard>

      {/* Profile dossier (round 17-a) */}
      <EditorCard
        title="Profile dossier"
        description="Enriches the expanded profile on the public Doctors page — everything below is optional."
      >
        <EducationEditor
          value={draft.education}
          onChange={(education) => update({ education })}
        />
        <ChipsEditor
          label="Memberships"
          hint="Professional bodies — press Enter to add (e.g. Bangladesh Dental Association)."
          value={draft.memberships}
          onChange={(memberships) => update({ memberships })}
          placeholder="Bangladesh Dental Association"
        />
        <AwardsEditor
          value={draft.awards}
          onChange={(awards) => update({ awards })}
        />
        <BilingualField
          label="Philosophy quote"
          enValue={draft.quote}
          bnValue={draft.quoteBn}
          onEnChange={(v) => update({ quote: v })}
          onBnChange={(v) => update({ quoteBn: v })}
          textarea
          rows={3}
          placeholder="A one-line care philosophy shown as a pull-quote…"
        />
        <FocusServicesPicker
          value={draft.focusServices}
          onChange={(focusServices) => update({ focusServices })}
          services={bundle.services}
        />
      </EditorCard>

      {/* Consultation days */}
      <EditorCard title="Consultation days" description="Days this doctor is available at the clinic.">
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => {
            const on = draft.consultationDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                title={day}
                aria-pressed={on}
                onClick={() => toggleDay(day)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold ring-1 transition-all duration-200",
                  on
                    ? "bg-brand-navy text-white ring-brand-navy shadow-md shadow-navy-900/20"
                    : "bg-white text-slate-500 ring-blue-100 hover:bg-blue-50 hover:text-brand-navy"
                )}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
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
        saveLabel={row ? "Save changes" : "Create doctor"}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel (list mode)                                                  */
/* ------------------------------------------------------------------ */

export function DoctorsPanel({ onSessionExpired }: PanelProps) {
  const { del } = useAdminFetch(onSessionExpired);
  const { ok: toastOk, fail: toastFail } = useAdminToast();
  const { refresh } = useContent();

  const [rows, setRows] = useState<DoctorRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadBusy, setLoadBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ row: DoctorRow | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DoctorRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoadBusy(true);
    try {
      const res = await fetch("/api/admin/doctors", { cache: "no-store" });
      if (res.status === 401) {
        onSessionExpired();
        return;
      }
      const data = (await res.json().catch(() => null)) as
        | { doctors?: DoctorRow[]; error?: string }
        | null;
      if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status}).`);
      setRows(data?.doctors ?? []);
      setLoaded(true);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load doctors.");
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
      [r.name, r.role, r.department, r.slug, ...r.specializations]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const active = rows.filter((r) => r.active).length;
    const avg = rows.length ? rows.reduce((acc, r) => acc + r.rating, 0) / rows.length : 0;
    return { total: rows.length, active, hidden: rows.length - active, avg };
  }, [rows]);

  const nextSort = useMemo(
    () => (rows.length ? Math.max(...rows.map((r) => r.sort)) + 1 : 0),
    [rows]
  );

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const res = await del<{ message?: string; error?: string }>(
      `/api/admin/doctors?id=${deleteTarget.id}`
    );
    setDeleting(false);
    if (res.ok) {
      toastOk("Doctor deleted", res.data?.message);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      void refresh();
    } else {
      const message =
        (res.data as { error?: string } | null)?.error ?? "Please try again in a moment.";
      toastFail("Delete failed", message);
      setDeleteTarget(null);
    }
  }

  if (!loaded) {
    if (loadError) {
      return (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center">
          <p className="font-heading text-lg font-bold text-rose-700">Could not load doctors</p>
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
            <DoctorsEditor
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
              title="Team directory"
              description="Every save syncs the public Doctors page instantly — no deploy needed."
              actions={
                <Button
                  type="button"
                  onClick={() => setEditing({ row: null })}
                  className="rounded-full bg-brand-navy font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add doctor
                </Button>
              }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={Stethoscope} label="Doctors" value={stats.total} />
              <StatCard
                icon={BadgeCheck}
                label="Active"
                value={stats.active}
                tone="text-emerald-700 bg-emerald-50 ring-emerald-100"
              />
              <StatCard
                icon={EyeOff}
                label="Hidden"
                value={stats.hidden}
                tone="text-slate-500 bg-slate-100 ring-slate-200"
              />
              <StatCard
                icon={Star}
                label="Avg. rating"
                value={stats.avg.toFixed(1)}
                tone="text-amber-700 bg-amber-50 ring-amber-100"
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
                    placeholder="Search name, role, department…"
                    aria-label="Search doctors"
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

            {/* Roster */}
            {filtered.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title={rows.length === 0 ? "No doctors yet" : "No doctors match your search"}
                description={
                  rows.length === 0
                    ? "Add the first dentist to start building the public roster."
                    : "Try a different name, role or department."
                }
                action={
                  rows.length === 0 ? (
                    <Button
                      type="button"
                      onClick={() => setEditing({ row: null })}
                      className="rounded-full bg-brand-navy font-bold text-white hover:bg-brand-blue"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Add doctor
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
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        {/* Thumb / initials */}
                        <div className="relative h-14 w-14 shrink-0">
                          {r.photo ? (
                            <span
                              className="block h-14 w-14 overflow-hidden rounded-2xl"
                              style={{ boxShadow: `0 0 0 2px ${r.accent}` }}
                            >
                              <Image
                                src={r.photo}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </span>
                          ) : (
                            <span
                              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ice font-heading text-base font-bold text-brand-navy"
                              style={{ boxShadow: `0 0 0 2px ${r.accent}` }}
                            >
                              {initialsOf(r.name)}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <p className="font-heading text-base font-bold leading-snug text-brand-navy">
                            {r.name}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-slate-600">
                            {r.role}
                            {r.roleBn ? (
                              <span lang="bn" className="text-slate-400">
                                {" "}
                                · {r.roleBn}
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-slate-400">
                            {r.department} · <span className="font-mono">{r.slug}</span>
                          </p>
                          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Award className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                              {r.experienceYears}+ yrs
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-brand-blue" aria-hidden="true" />
                              {r.patientsTreated.toLocaleString()} patients
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Star
                                className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                                aria-hidden="true"
                              />
                              {r.rating.toFixed(1)}
                            </span>
                          </p>
                          {r.consultationDays.length ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {r.consultationDays.map((day) => (
                                <span
                                  key={day}
                                  title={day}
                                  className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-brand-blue ring-1 ring-blue-100"
                                >
                                  {day.slice(0, 3)}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                        {r.active ? (
                          <StatusPill tone="green">
                            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                            Active
                          </StatusPill>
                        ) : (
                          <StatusPill tone="slate">
                            <EyeOff className="h-3 w-3" aria-hidden="true" />
                            Hidden
                          </StatusPill>
                        )}
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
        title="Delete this doctor?"
        description={
          <>
            <strong className="text-brand-navy">{deleteTarget?.name}</strong> will be removed from
            the database and the public Doctors page. This cannot be undone.
          </>
        }
      />
    </div>
  );
}
