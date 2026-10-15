"use client";

/* ------------------------------------------------------------------ */
/*  Services content editor (Content → Services)                        */
/*  GET  /api/admin/services → 11 merged services (+ hasOverlay)        */
/*  POST /api/admin/services { slug, …fields } — update only; slugs     */
/*  are LOCKED (appointments/blog/cases/search reference them).         */
/*  List view → per-service editor with bilingual fields, image         */
/*  upload, icon picker and repeaters for overview / benefits /         */
/*  process / ideal-for / FAQs.                                         */
/* ------------------------------------------------------------------ */

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  CircleHelp,
  Lock,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useContent } from "@/components/site/content-provider";
import { categoryColors } from "@/components/site/icon-map";
import type { Service } from "@/lib/types";
import {
  BilingualField,
  EmptyState,
  ImageUploadField,
  PanelHeader,
  PanelSkeleton,
  SaveBar,
  useAdminFetch,
  useAdminToast,
  type PanelProps,
} from "../admin-shared";

/* Icon keys that actually resolve in the site's icon-map. */
const SERVICE_ICONS = [
  "Crown",
  "Sparkles",
  "Smile",
  "Zap",
  "Gem",
  "ShieldCheck",
  "Microscope",
  "HeartHandshake",
  "BadgeCheck",
  "Activity",
  "Baby",
  "Leaf",
  "Anchor",
  "Grid3x3",
  "Scissors",
] as const;

type ServiceRow = Service & { hasOverlay: boolean };

/** Local editable shape — featured made explicitly boolean. */
type ServiceForm = Omit<Service, "featured"> & { featured: boolean };

/* ------------------------------------------------------------------ */
/*  Local helpers                                                       */
/* ------------------------------------------------------------------ */

function toForm(service: ServiceRow): ServiceForm {
  const { hasOverlay: _hasOverlay, ...rest } = service;
  return { ...rest, featured: service.featured ?? false };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Mirror the server sanitizer: drop empty repeater rows + empty BN twins. */
function buildPayload(form: ServiceForm): Record<string, unknown> {
  const overview = form.overview.map((p) => p.trim()).filter((p) => p.length > 0);
  const ideal = form.ideal.map((p) => p.trim()).filter((p) => p.length > 0);
  const benefits = form.benefits
    .map((b) => ({ title: b.title.trim(), description: b.description.trim() }))
    .filter((b) => b.title.length > 0 && b.description.length > 0);
  const process = form.process
    .map((p, i) => ({
      step: p.step.trim() || String(i + 1),
      title: p.title.trim(),
      description: p.description.trim(),
    }))
    .filter((p) => p.title.length > 0);
  const faqs = form.faqs
    .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
    .filter((f) => f.question.length > 0 && f.answer.length > 0);
  const bn = (v: string | undefined) => (v && v.trim().length > 0 ? v.trim() : undefined);
  return {
    slug: form.slug,
    name: form.name,
    nameBn: bn(form.nameBn),
    shortName: form.shortName,
    shortNameBn: bn(form.shortNameBn),
    tagline: form.tagline,
    taglineBn: bn(form.taglineBn),
    excerpt: form.excerpt,
    excerptBn: bn(form.excerptBn),
    image: form.image && form.image.trim().length > 0 ? form.image.trim() : undefined,
    icon: form.icon,
    duration: form.duration,
    longevity: form.longevity,
    anesthesia: form.anesthesia,
    featured: form.featured,
    overview,
    benefits,
    process,
    ideal,
    faqs,
  };
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

const inputClass =
  "mt-1 h-9 rounded-xl border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25";

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
      className="h-9 w-9 shrink-0 self-end rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}

function CategoryPill({ category }: { category: string }) {
  const tone = categoryColors[category] ?? {
    bg: "bg-slate-50",
    text: "text-slate-600",
    ring: "ring-slate-200",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
        tone.bg,
        tone.text,
        tone.ring
      )}
    >
      {category}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                               */
/* ------------------------------------------------------------------ */

export function ServicesPanel({ onSessionExpired }: PanelProps) {
  const { get, post, error, clearError } = useAdminFetch(onSessionExpired);
  const { ok, fail } = useAdminToast();
  const { refresh } = useContent();

  const [services, setServices] = useState<ServiceRow[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadTick, setLoadTick] = useState(0);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [snapshot, setSnapshot] = useState<ServiceForm | null>(null);
  const [form, setForm] = useState<ServiceForm | null>(null);
  const [saving, setSaving] = useState(false);

  /* Initial fetch (+ manual reload). The async IIFE keeps every setState
     behind an await so the effect stays purely a subscription. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await get<{ services: ServiceRow[] }>("/api/admin/services");
      if (cancelled) return;
      if (!data) {
        setLoadFailed(true);
        return;
      }
      setLoadFailed(false);
      setServices(data.services ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [get, loadTick]);

  const dirty = useMemo(
    () => (snapshot && form ? JSON.stringify(form) !== JSON.stringify(snapshot) : false),
    [snapshot, form]
  );

  function openService(slug: string) {
    const row = services?.find((s) => s.slug === slug);
    if (!row) return;
    clearError();
    setSnapshot(toForm(row));
    setForm(clone(toForm(row)));
    setEditingSlug(slug);
  }

  function backToList() {
    setEditingSlug(null);
    setSnapshot(null);
    setForm(null);
    clearError();
  }

  async function save() {
    if (!form || saving) return;
    setSaving(true);
    const payload = buildPayload(form);
    const res = await post<{ error?: string; service?: ServiceRow }>("/api/admin/services", payload);
    setSaving(false);
    if (res.ok && res.data?.service) {
      const saved: ServiceRow = { ...res.data.service, hasOverlay: true };
      setServices((prev) =>
        prev ? prev.map((s) => (s.slug === saved.slug ? saved : s)) : prev
      );
      setSnapshot(clone(toForm(saved)));
      setForm(clone(toForm(saved)));
      ok("Service saved", `“${saved.name}” is live on the site.`);
      await refresh();
    } else {
      fail("Could not save the service", res.data?.error ?? "Please try again.");
    }
  }

  function reset() {
    if (snapshot) setForm(clone(snapshot));
    clearError();
  }

  /* ---- generic setter ---- */
  const set = <K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  /* ---- repeaters ---- */
  const setOverview = (index: number, value: string) =>
    setForm((f) =>
      f ? { ...f, overview: f.overview.map((p, i) => (i === index ? value : p)) } : f
    );
  const addOverview = () =>
    setForm((f) => (f ? { ...f, overview: [...f.overview, ""] } : f));
  const removeOverview = (index: number) =>
    setForm((f) => (f ? { ...f, overview: f.overview.filter((_, i) => i !== index) } : f));

  const setBenefit = (index: number, patch: Partial<ServiceForm["benefits"][number]>) =>
    setForm((f) =>
      f
        ? {
            ...f,
            benefits: f.benefits.map((b, i) => (i === index ? { ...b, ...patch } : b)),
          }
        : f
    );
  const addBenefit = () =>
    setForm((f) => (f ? { ...f, benefits: [...f.benefits, { title: "", description: "" }] } : f));
  const removeBenefit = (index: number) =>
    setForm((f) => (f ? { ...f, benefits: f.benefits.filter((_, i) => i !== index) } : f));

  const setProcessStep = (index: number, patch: Partial<ServiceForm["process"][number]>) =>
    setForm((f) =>
      f
        ? { ...f, process: f.process.map((p, i) => (i === index ? { ...p, ...patch } : p)) }
        : f
    );
  const addProcessStep = () =>
    setForm((f) =>
      f ? { ...f, process: [...f.process, { step: "", title: "", description: "" }] } : f
    );
  const removeProcessStep = (index: number) =>
    setForm((f) => (f ? { ...f, process: f.process.filter((_, i) => i !== index) } : f));

  const setIdeal = (index: number, value: string) =>
    setForm((f) =>
      f ? { ...f, ideal: f.ideal.map((p, i) => (i === index ? value : p)) } : f
    );
  const addIdeal = () => setForm((f) => (f ? { ...f, ideal: [...f.ideal, ""] } : f));
  const removeIdeal = (index: number) =>
    setForm((f) => (f ? { ...f, ideal: f.ideal.filter((_, i) => i !== index) } : f));

  const setFaq = (index: number, patch: Partial<ServiceForm["faqs"][number]>) =>
    setForm((f) =>
      f ? { ...f, faqs: f.faqs.map((q, i) => (i === index ? { ...q, ...patch } : q)) } : f
    );
  const addFaq = () =>
    setForm((f) => (f ? { ...f, faqs: [...f.faqs, { question: "", answer: "" }] } : f));
  const removeFaq = (index: number) =>
    setForm((f) => (f ? { ...f, faqs: f.faqs.filter((_, i) => i !== index) } : f));

  /* ---- render: loading / error ---- */

  if (!services) {
    if (loadFailed) {
      return (
        <div className="space-y-4">
          <PanelHeader title="Services" />
          <ErrorNote message={error ?? "Could not load the services catalogue."} />
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

  /* ---- render: editor ---- */

  if (editingSlug && form) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={backToList}
              aria-label="Back to all services"
              className="h-9 w-9 shrink-0 rounded-xl border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <div className="min-w-0">
              <h2 className="font-heading truncate text-base font-bold text-brand-navy">
                {form.name}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <CategoryPill category={form.category} />
                <span className="inline-flex items-center gap-1 rounded-full bg-ice px-2.5 py-0.5 text-[10px] font-bold text-brand-navy ring-1 ring-blue-100">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  {form.slug} — slug locked, protects links
                </span>
              </div>
            </div>
          </div>
          <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-500">
            <Switch
              checked={form.featured}
              onCheckedChange={(v) => set("featured", v)}
              aria-label="Featured on homepage"
            />
            Featured
          </label>
        </div>

        {error ? <ErrorNote message={error} /> : null}

        <div className="space-y-4 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
          <BilingualField
            label="Name"
            enValue={form.name}
            bnValue={form.nameBn}
            onEnChange={(v) => set("name", v)}
            onBnChange={(v) => set("nameBn", v)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <BilingualField
              label="Short name (cards & footer)"
              enValue={form.shortName}
              bnValue={form.shortNameBn}
              onEnChange={(v) => set("shortName", v)}
              onBnChange={(v) => set("shortNameBn", v)}
            />
            <MiniField label="Icon">
              <Select value={form.icon} onValueChange={(v) => set("icon", v)}>
                <SelectTrigger
                  aria-label="Service icon"
                  className="mt-1 h-9 w-full rounded-xl border-blue-100 bg-ice text-sm text-brand-navy focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                >
                  <SelectValue placeholder="Pick an icon" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-blue-100">
                  {SERVICE_ICONS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </MiniField>
          </div>
          <BilingualField
            label="Tagline"
            enValue={form.tagline}
            bnValue={form.taglineBn}
            onEnChange={(v) => set("tagline", v)}
            onBnChange={(v) => set("taglineBn", v)}
          />
          <BilingualField
            label="Excerpt (card preview)"
            textarea
            rows={3}
            enValue={form.excerpt}
            bnValue={form.excerptBn}
            onEnChange={(v) => set("excerpt", v)}
            onBnChange={(v) => set("excerptBn", v)}
          />
          <ImageUploadField
            label="Cover image"
            hint="Shown on service cards and as the detail-page hero backdrop."
            value={form.image}
            onChange={(url) => set("image", url)}
            onUnauthorized={onSessionExpired}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniField label="Duration">
              <Input
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                aria-label="Appointment duration"
                className={inputClass}
              />
            </MiniField>
            <MiniField label="Longevity">
              <Input
                value={form.longevity}
                onChange={(e) => set("longevity", e.target.value)}
                aria-label="Result longevity"
                className={inputClass}
              />
            </MiniField>
            <MiniField label="Anesthesia">
              <Input
                value={form.anesthesia}
                onChange={(e) => set("anesthesia", e.target.value)}
                aria-label="Anesthesia"
                className={inputClass}
              />
            </MiniField>
          </div>
        </div>

        {/* ---- overview ---- */}
        <div className="space-y-3 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Overview paragraphs
          </p>
          {form.overview.map((paragraph, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2.5 w-5 shrink-0 text-right text-[10px] font-bold text-slate-300">
                {i + 1}
              </span>
              <Textarea
                value={paragraph}
                onChange={(e) => setOverview(i, e.target.value)}
                rows={2}
                placeholder={`Overview paragraph ${i + 1}`}
                aria-label={`Overview paragraph ${i + 1}`}
                className="mt-1 min-w-0 flex-1 border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
              />
              <RowRemoveButton
                onClick={() => removeOverview(i)}
                label={`Remove overview paragraph ${i + 1}`}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOverview}
            className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add paragraph
          </Button>
        </div>

        {/* ---- benefits ---- */}
        <div className="space-y-3 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Benefits
          </p>
          {form.benefits.map((benefit, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    value={benefit.title}
                    onChange={(e) => setBenefit(i, { title: e.target.value })}
                    placeholder={`Benefit ${i + 1} title`}
                    aria-label={`Benefit ${i + 1} title`}
                    className={inputClass}
                  />
                </div>
                <RowRemoveButton onClick={() => removeBenefit(i)} label={`Remove benefit ${i + 1}`} />
              </div>
              <Textarea
                value={benefit.description}
                onChange={(e) => setBenefit(i, { description: e.target.value })}
                rows={2}
                placeholder={`Benefit ${i + 1} description`}
                aria-label={`Benefit ${i + 1} description`}
                className="border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBenefit}
            className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add benefit
          </Button>
        </div>

        {/* ---- process ---- */}
        <div className="space-y-3 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Treatment process
          </p>
          <Hint>Step numbers fall back to position (1, 2, 3…) when left empty.</Hint>
          {form.process.map((step, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="flex items-start gap-2">
                <Input
                  value={step.step}
                  onChange={(e) => setProcessStep(i, { step: e.target.value })}
                  placeholder={`${i + 1}`}
                  aria-label={`Process step ${i + 1} number`}
                  className="mt-1 h-9 w-14 shrink-0 rounded-xl border-blue-100 bg-white text-center text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                />
                <div className="min-w-0 flex-1">
                  <Input
                    value={step.title}
                    onChange={(e) => setProcessStep(i, { title: e.target.value })}
                    placeholder={`Step ${i + 1} title`}
                    aria-label={`Process step ${i + 1} title`}
                    className={inputClass}
                  />
                </div>
                <RowRemoveButton
                  onClick={() => removeProcessStep(i)}
                  label={`Remove process step ${i + 1}`}
                />
              </div>
              <Textarea
                value={step.description}
                onChange={(e) => setProcessStep(i, { description: e.target.value })}
                rows={2}
                placeholder={`Step ${i + 1} description`}
                aria-label={`Process step ${i + 1} description`}
                className="border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addProcessStep}
            className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add step
          </Button>
        </div>

        {/* ---- ideal for ---- */}
        <div className="space-y-3 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Ideal for
          </p>
          {form.ideal.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2.5 w-5 shrink-0 text-right text-[10px] font-bold text-slate-300">
                {i + 1}
              </span>
              <Input
                value={item}
                onChange={(e) => setIdeal(i, e.target.value)}
                placeholder={`Ideal-for line ${i + 1}`}
                aria-label={`Ideal for line ${i + 1}`}
                className="mt-0.5 h-9 min-w-0 flex-1 rounded-xl border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
              />
              <RowRemoveButton onClick={() => removeIdeal(i)} label={`Remove line ${i + 1}`} />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addIdeal}
            className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add line
          </Button>
        </div>

        {/* ---- faqs ---- */}
        <div className="space-y-3 rounded-2xl border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Service FAQs
          </p>
          {form.faqs.map((faq, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-blue-100/70 bg-ice/40 p-3"
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    value={faq.question}
                    onChange={(e) => setFaq(i, { question: e.target.value })}
                    placeholder={`FAQ ${i + 1} question`}
                    aria-label={`FAQ ${i + 1} question`}
                    className={inputClass}
                  />
                </div>
                <RowRemoveButton onClick={() => removeFaq(i)} label={`Remove FAQ ${i + 1}`} />
              </div>
              <Textarea
                value={faq.answer}
                onChange={(e) => setFaq(i, { answer: e.target.value })}
                rows={3}
                placeholder={`FAQ ${i + 1} answer`}
                aria-label={`FAQ ${i + 1} answer`}
                className="border-blue-100 bg-white text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFaq}
            className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add FAQ
          </Button>
        </div>

        <SaveBar
          dirty={dirty}
          saving={saving}
          onSave={save}
          onReset={reset}
          saveLabel="Save service"
        />
      </div>
    );
  }

  /* ---- render: list ---- */

  if (services.length === 0) {
    return (
      <div className="space-y-4">
        <PanelHeader title="Services" description="The 11-treatment catalogue." />
        <EmptyState
          icon={Sparkles}
          title="No services found"
          description="The catalogue comes from the static service definitions — reload the module to try again."
          action={
            <Button
              onClick={() => setLoadTick((t) => t + 1)}
              variant="outline"
              size="sm"
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reload
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Services"
        description="Content overlays for all 11 treatments — cards, detail pages, search and the footer react instantly."
      />
      {error ? <ErrorNote message={error} /> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <button
            key={service.slug}
            type="button"
            onClick={() => openService(service.slug)}
            className="group flex items-start gap-3 rounded-2xl border border-blue-100/70 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-[0_18px_40px_-16px_rgba(30,125,255,0.3)]"
          >
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ice ring-1 ring-blue-100">
              {service.image ? (
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-slate-300">
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="font-heading truncate text-sm font-bold text-brand-navy">
                  {service.name}
                </span>
                {service.featured ? (
                  <Star
                    className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                    aria-label="Featured"
                  />
                ) : null}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-1.5">
                <CategoryPill category={service.category} />
                {service.hasOverlay ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    Customized
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                    <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                    Default content
                  </span>
                )}
              </span>
              <span className="mt-1 block truncate text-xs text-slate-400">
                {service.tagline}
              </span>
            </span>
          </button>
        ))}
      </div>
      <Hint>
        <CircleHelp className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
        Slugs are locked — edits update the content overlay only, never the links.
      </Hint>
    </div>
  );
}
