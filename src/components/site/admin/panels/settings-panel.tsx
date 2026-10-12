"use client";

/* ------------------------------------------------------------------ */
/*  Site settings editor (Configuration → Settings)                     */
/*  GET  /api/admin/settings → merged settings over defaults            */
/*  POST /api/admin/settings → full settings object (sanitized +        */
/*  saved). Groups: Identity · Contact · Location · Hours · Stats ·     */
/*  Social. Empty Bangla twins are dropped server-side (EN fallback).    */
/* ------------------------------------------------------------------ */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Globe,
  IdCard,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
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
import { useContent } from "@/components/site/content-provider";
import type { SiteSettings } from "@/lib/content/shared";
import {
  BilingualField,
  PanelHeader,
  PanelSkeleton,
  SaveBar,
  useAdminFetch,
  useAdminToast,
  type PanelProps,
} from "../admin-shared";

/* ------------------------------------------------------------------ */
/*  Local helpers                                                       */
/* ------------------------------------------------------------------ */

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState<string | null>(null);
  const shown = raw ?? String(value);
  return (
    <Input
      inputMode="numeric"
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

/* ------------------------------------------------------------------ */
/*  Panel                                                               */
/* ------------------------------------------------------------------ */

export function SettingsPanel({ onSessionExpired }: PanelProps) {
  const { get, post, error, clearError } = useAdminFetch(onSessionExpired);
  const { ok, fail } = useAdminToast();
  const { refresh } = useContent();

  const [snapshot, setSnapshot] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadTick, setLoadTick] = useState(0);
  const [saving, setSaving] = useState(false);

  /* Initial fetch (+ manual retry). The async IIFE keeps every setState
     behind an await so the effect stays purely a subscription. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await get<{ settings: SiteSettings }>("/api/admin/settings");
      if (cancelled) return;
      if (!data) {
        setLoadFailed(true);
        return;
      }
      setLoadFailed(false);
      setSnapshot(clone(data.settings));
      setForm(clone(data.settings));
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
    (pick: (s: SiteSettings) => unknown) =>
      snapshot && form ? JSON.stringify(pick(form)) !== JSON.stringify(pick(snapshot)) : false,
    [snapshot, form]
  );

  async function save() {
    if (!form || saving) return;
    setSaving(true);
    const res = await post<{ settings?: SiteSettings; error?: string }>(
      "/api/admin/settings",
      form
    );
    setSaving(false);
    if (res.ok && res.data?.settings) {
      const saved = res.data.settings;
      setSnapshot(clone(saved));
      setForm(clone(saved));
      ok("Settings saved", "Contact details, hours and stats are live.");
      await refresh();
    } else {
      fail("Could not save settings", res.data?.error ?? "Please try again.");
    }
  }

  function reset() {
    if (snapshot) setForm(clone(snapshot));
    clearError();
  }

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  /* ---- render ---- */

  if (!snapshot || !form) {
    if (loadFailed) {
      return (
        <div className="space-y-4">
          <PanelHeader title="Site Settings" />
          <ErrorNote message={error ?? "Could not load the site settings."} />
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
        title="Site Settings"
        description="Clinic identity, contact details, opening hours and social links — used by the navbar, footer, contact page and SEO."
      />
      {error ? <ErrorNote message={error} /> : null}

      {/* ============ IDENTITY ============ */}
      <FormSection
        icon={IdCard}
        title="Identity"
        description="Clinic name, short name and tagline"
        edited={groupDirty((s) => [s.name, s.shortName, s.tagline, s.taglineBn])}
        defaultOpen
      >
        <BilingualField
          label="Full name"
          enValue={form.name}
          onEnChange={(v) => set("name", v)}
        />
        <BilingualField
          label="Short name"
          enValue={form.shortName}
          onEnChange={(v) => set("shortName", v)}
        />
        <BilingualField
          label="Tagline"
          enValue={form.tagline}
          bnValue={form.taglineBn}
          onEnChange={(v) => set("tagline", v)}
          onBnChange={(v) => set("taglineBn", v)}
        />
      </FormSection>

      {/* ============ CONTACT ============ */}
      <FormSection
        icon={Phone}
        title="Contact"
        description="Hotline, emergency line and email"
        edited={groupDirty((s) => [
          s.phone,
          s.phoneRaw,
          s.emergencyPhone,
          s.email,
        ])}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <BilingualField
            label="Hotline (display)"
            enValue={form.phone}
            onEnChange={(v) => set("phone", v)}
          />
          <div>
            <BilingualField
              label="Hotline (raw)"
              enValue={form.phoneRaw}
              onEnChange={(v) => set("phoneRaw", v)}
            />
            <Hint>Used for tel: links — keep the +880… format.</Hint>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <BilingualField
            label="Emergency phone"
            enValue={form.emergencyPhone}
            onEnChange={(v) => set("emergencyPhone", v)}
          />
          <BilingualField
            label="Email"
            enValue={form.email}
            onEnChange={(v) => set("email", v)}
          />
        </div>
      </FormSection>

      {/* ============ LOCATION ============ */}
      <FormSection
        icon={MapPin}
        title="Location"
        description="Full and short address"
        edited={groupDirty((s) => [s.address, s.addressShort])}
      >
        <BilingualField
          label="Address (full)"
          textarea
          rows={2}
          enValue={form.address}
          onEnChange={(v) => set("address", v)}
        />
        <BilingualField
          label="Address (short)"
          enValue={form.addressShort}
          onEnChange={(v) => set("addressShort", v)}
        />
        <Hint>
          The short form appears in the footer and map cards.
        </Hint>
      </FormSection>

      {/* ============ HOURS ============ */}
      <FormSection
        icon={Clock}
        title="Hours"
        description="Weekly schedule and the Friday note"
        edited={groupDirty((s) => [
          s.hours,
          s.hoursBn,
          s.hoursFriday,
          s.hoursFridayBn,
        ])}
      >
        <BilingualField
          label="Weekly hours"
          enValue={form.hours}
          bnValue={form.hoursBn}
          onEnChange={(v) => set("hours", v)}
          onBnChange={(v) => set("hoursBn", v)}
        />
        <BilingualField
          label="Friday hours"
          enValue={form.hoursFriday}
          bnValue={form.hoursFridayBn}
          onEnChange={(v) => set("hoursFriday", v)}
          onBnChange={(v) => set("hoursFridayBn", v)}
        />
      </FormSection>

      {/* ============ STATS ============ */}
      <FormSection
        icon={TrendingUp}
        title="Stats"
        description="Established year and patients served"
        edited={groupDirty((s) => [s.established, s.patientsServed])}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <MiniField label="Established (year)">
            <NumberInput
              value={form.established}
              onChange={(v) => set("established", v)}
              ariaLabel="Established year"
              placeholder="2019"
            />
          </MiniField>
          <MiniField label="Patients served">
            <NumberInput
              value={form.patientsServed}
              onChange={(v) => set("patientsServed", v)}
              ariaLabel="Patients served"
              placeholder="50000"
            />
          </MiniField>
        </div>
        <Hint>Rendered with Bangla digit conversion on the বাংলা site.</Hint>
      </FormSection>

      {/* ============ SOCIAL ============ */}
      <FormSection
        icon={Globe}
        title="Social"
        description="Facebook, Instagram and LinkedIn profile URLs"
        edited={groupDirty((s) => [s.facebook, s.instagram, s.linkedin])}
      >
        <BilingualField
          label="Facebook URL"
          enValue={form.facebook}
          onEnChange={(v) => set("facebook", v)}
        />
        <BilingualField
          label="Instagram URL"
          enValue={form.instagram}
          onEnChange={(v) => set("instagram", v)}
        />
        <BilingualField
          label="LinkedIn URL"
          enValue={form.linkedin}
          onEnChange={(v) => set("linkedin", v)}
        />
        <Hint>
          Must start with https:// — empty or invalid values fall back to the current social
          links.
        </Hint>
      </FormSection>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={reset}
        saveLabel="Save settings"
      />

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
        Hero background video links live in the Hero module.
      </p>
    </div>
  );
}
