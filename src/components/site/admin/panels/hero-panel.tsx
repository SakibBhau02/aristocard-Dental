"use client";

/* ------------------------------------------------------------------ */
/*  Hero slides & videos editor (Configuration → Hero)                   */
/*  GET  /api/admin/hero     → { slides } (ordered, home scope)         */
/*  POST /api/admin/hero     → slide create/update;                     */
/*                             { action:"reorder", ids } reorders       */
/*  DELETE /api/admin/hero?id=  → remove a slide                        */
/*  GET/POST /api/admin/settings → heroVideoUrls (background videos     */
/*  interleaved between the image slides on the home hero).             */
/* ------------------------------------------------------------------ */

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  MonitorPlay,
  Plus,
  RefreshCw,
  Trash2,
  Youtube,
} from "lucide-react";
import Image from "next/image";
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
import { Switch } from "@/components/ui/switch";
import { useContent } from "@/components/site/content-provider";
import { parseYouTubeId } from "@/lib/data/hero-media";
import type { HeroSlideRow, SiteSettings } from "@/lib/content/shared";
import {
  ConfirmDeleteDialog,
  ImageUploadField,
  PanelHeader,
  PanelSkeleton,
  SaveBar,
  useAdminFetch,
  useAdminToast,
  type PanelProps,
} from "../admin-shared";

const MAX_VIDEOS = 6;

/* Where hero slides can attach. "home" = the big homepage slideshow;
   the rest drive that page's header backdrop (falls back to curated
   defaults when a scope has no active slides). */
const SCOPES: { id: string; label: string }[] = [
  { id: "home", label: "Home hero" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "doctors", label: "Doctors" },
  { id: "blog", label: "Blog" },
  { id: "gallery", label: "Gallery" },
  { id: "faqs", label: "FAQs" },
  { id: "contact", label: "Contact" },
  { id: "appointment", label: "Appointment" },
];

const inputClass =
  "h-9 rounded-xl border-blue-100 bg-ice text-sm text-brand-navy placeholder:text-slate-400 focus-visible:border-brand-blue focus-visible:ring-brand-blue/25";

/* ------------------------------------------------------------------ */
/*  Local helpers                                                       */
/* ------------------------------------------------------------------ */

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
  return <p className="text-xs leading-relaxed text-slate-400">{children}</p>;
}

/** One ordered slide row: thumb/tile, alt, active switch, reorder, delete. */
function SlideCard({
  row,
  index,
  total,
  busy,
  onAltSave,
  onActiveChange,
  onMove,
  onDelete,
}: {
  row: HeroSlideRow;
  index: number;
  total: number;
  busy: boolean;
  onAltSave: (alt: string) => void;
  onActiveChange: (active: boolean) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const [alt, setAlt] = useState(row.alt ?? "");
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm transition-opacity",
        row.active ? "border-blue-100/70" : "border-slate-200 opacity-70",
        busy && "opacity-60"
      )}
    >
      {row.kind === "image" ? (
        <span className="relative block h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-ice ring-1 ring-blue-100">
          <Image src={row.src} alt={alt || "Hero slide"} fill sizes="160px" className="object-cover" />
        </span>
      ) : (
        <span className="flex h-24 w-40 shrink-0 items-center justify-center rounded-xl bg-rose-50 ring-1 ring-rose-100">
          <Youtube className="h-9 w-9 text-rose-500" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1 space-y-1.5">
        {row.kind === "youtube" ? (
          <p className="truncate font-mono text-xs text-slate-500" title={row.src}>
            {row.src}
          </p>
        ) : (
          <p className="truncate font-mono text-xs text-slate-400" title={row.src}>
            {row.src}
          </p>
        )}
        {row.kind === "image" ? (
          <Input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onBlur={() => {
              if ((row.alt ?? "") !== alt) onAltSave(alt);
            }}
            placeholder="Alt text (accessibility)"
            aria-label={`Slide ${index + 1} alt text`}
            className={inputClass}
          />
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Switch
            checked={row.active}
            onCheckedChange={(v) => onActiveChange(v)}
            aria-label={`Slide ${index + 1} active`}
          />
          Active
        </label>
        <span className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={busy || index === 0}
            onClick={() => onMove(-1)}
            aria-label={`Move slide ${index + 1} up`}
            title="Move up"
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-brand-navy"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={busy || index === total - 1}
            onClick={() => onMove(1)}
            aria-label={`Move slide ${index + 1} down`}
            title="Move down"
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-brand-navy"
          >
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={busy}
            onClick={onDelete}
            aria-label={`Delete slide ${index + 1}`}
            title="Delete slide"
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                               */
/* ------------------------------------------------------------------ */

export function HeroPanel({ onSessionExpired }: PanelProps) {
  const { get, post, del, error, clearError } = useAdminFetch(onSessionExpired);
  const { ok, fail } = useAdminToast();
  const { refresh } = useContent();

  const [allSlides, setAllSlides] = useState<HeroSlideRow[] | null>(null);
  const [scope, setScope] = useState("home");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadTick, setLoadTick] = useState(0);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [deleting, setDeleting] = useState<HeroSlideRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  /* background videos form */
  const [videoSnapshot, setVideoSnapshot] = useState<string[] | null>(null);
  const [videoUrls, setVideoUrls] = useState<string[] | null>(null);
  const [savingVideos, setSavingVideos] = useState(false);

  /* add-slide form */
  const [addOpen, setAddOpen] = useState(false);
  const [addKind, setAddKind] = useState<"image" | "youtube">("image");
  const [addSrc, setAddSrc] = useState("");
  const [addAlt, setAddAlt] = useState("");
  const [adding, setAdding] = useState(false);

  /* Initial fetch (+ manual retry). The async IIFE keeps every setState
     behind an await so the effect stays purely a subscription. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [heroRes, settingsRes] = await Promise.all([
        get<{ slides: HeroSlideRow[] }>("/api/admin/hero"),
        get<{ settings: SiteSettings }>("/api/admin/settings"),
      ]);
      if (cancelled) return;
      if (!heroRes || !settingsRes) {
        setLoadFailed(true);
        return;
      }
      setLoadFailed(false);
      setAllSlides(heroRes.slides ?? []);
      setSettings(settingsRes.settings);
      const urls = (settingsRes.settings.heroVideoUrls ?? []).slice(0, MAX_VIDEOS);
      setVideoSnapshot([...urls]);
      setVideoUrls([...urls]);
    })();
    return () => {
      cancelled = true;
    };
  }, [get, loadTick]);

  const slides = useMemo(
    () => (allSlides ? allSlides.filter((s) => s.scope === scope) : null),
    [allSlides, scope]
  );

  const scopeCount = (id: string) =>
    allSlides ? allSlides.filter((s) => s.scope === id).length : 0;

  const videosDirty = useMemo(
    () =>
      videoSnapshot && videoUrls
        ? JSON.stringify(videoUrls) !== JSON.stringify(videoSnapshot)
        : false,
    [videoSnapshot, videoUrls]
  );

  /* ---- slide helpers ---- */

  async function reloadSlides() {
    const data = await get<{ slides: HeroSlideRow[] }>("/api/admin/hero");
    if (data) setAllSlides(data.slides ?? []);
    await refresh();
  }

  async function updateSlide(
    row: HeroSlideRow,
    patch: Partial<Pick<HeroSlideRow, "alt" | "active">>
  ) {
    setBusyId(row.id);
    const res = await post<{ error?: string }>("/api/admin/hero", {
      id: row.id,
      scope: row.scope,
      kind: row.kind,
      src: row.src,
      sort: row.sort,
      alt: patch.alt !== undefined ? patch.alt : row.alt,
      active: patch.active !== undefined ? patch.active : row.active,
    });
    setBusyId(null);
    if (res.ok) {
      setAllSlides((prev) =>
        prev ? prev.map((s) => (s.id === row.id ? { ...s, ...patch } : s)) : prev
      );
      await refresh();
    } else {
      fail("Could not update the slide", res.data?.error ?? "Please try again.");
    }
  }

  async function moveSlide(index: number, dir: -1 | 1) {
    if (!slides || reordering) return;
    const j = index + dir;
    if (j < 0 || j >= slides.length) return;
    /* reorder within the current scope, then merge back into the full list */
    const scoped = [...slides];
    [scoped[index], scoped[j]] = [scoped[j], scoped[index]];
    const orderById = new Map(scoped.map((s, i) => [s.id, i]));
    const next = (allSlides ?? []).map((s) =>
      orderById.has(s.id) ? { ...s, sort: orderById.get(s.id)! } : s
    );
    setAllSlides(next);
    setReordering(true);
    const res = await post<{ error?: string }>("/api/admin/hero", {
      action: "reorder",
      ids: scoped.map((s) => s.id),
    });
    setReordering(false);
    if (res.ok) {
      ok("Slide order saved");
      await refresh();
    } else {
      fail("Could not reorder the slides", res.data?.error ?? "Restoring the previous order.");
      void reloadSlides();
    }
  }

  async function removeSlide(row: HeroSlideRow) {
    setDeleteBusy(true);
    const res = await del<{ error?: string }>(`/api/admin/hero?id=${encodeURIComponent(row.id)}`);
    setDeleteBusy(false);
    if (res.ok) {
      setDeleting(null);
      ok("Slide removed", "The hero rotation no longer includes it.");
      await reloadSlides();
    } else {
      fail("Could not remove the slide", res.data?.error ?? "Please try again.");
    }
  }

  async function addSlide() {
    if (adding) return;
    const src = addSrc.trim();
    if (addKind === "image" && !src.startsWith("/")) {
      fail("Upload an image first", "Image slides need an /uploads or /images path.");
      return;
    }
    if (addKind === "youtube" && !parseYouTubeId(src)) {
      fail("That is not a YouTube link", "Paste a youtube.com, youtu.be or /shorts/ link.");
      return;
    }
    setAdding(true);
    const res = await post<{ error?: string }>("/api/admin/hero", {
      scope,
      kind: addKind,
      src,
      alt: addAlt.trim() || undefined,
      active: true,
    });
    setAdding(false);
    if (res.ok) {
      ok(
        "Slide added",
        scope === "home"
          ? "It is now part of the home hero rotation."
          : `The ${SCOPES.find((x) => x.id === scope)?.label ?? scope} page backdrop now uses it.`
      );
      setAddSrc("");
      setAddAlt("");
      setAddOpen(false);
      await reloadSlides();
    } else {
      fail("Could not add the slide", res.data?.error ?? "Please try again.");
    }
  }

  /* ---- background videos ---- */

  const setVideoUrl = (index: number, value: string) =>
    setVideoUrls((urls) =>
      urls ? urls.map((u, i) => (i === index ? value : u)) : urls
    );

  const addVideoUrl = () =>
    setVideoUrls((urls) => (urls && urls.length < MAX_VIDEOS ? [...urls, ""] : urls));

  const removeVideoUrl = (index: number) =>
    setVideoUrls((urls) => (urls ? urls.filter((_, i) => i !== index) : urls));

  async function saveVideos() {
    if (!settings || !videoUrls || savingVideos) return;
    setSavingVideos(true);
    const urls = videoUrls
      .map((u) => u.trim())
      .filter((u) => u.length > 5)
      .slice(0, MAX_VIDEOS);
    const res = await post<{ settings?: SiteSettings; error?: string }>("/api/admin/settings", {
      ...settings,
      heroVideoUrls: urls,
    });
    setSavingVideos(false);
    if (res.ok && res.data?.settings) {
      const saved = res.data.settings;
      setSettings(saved);
      setVideoSnapshot([...(saved.heroVideoUrls ?? [])]);
      setVideoUrls([...(saved.heroVideoUrls ?? [])]);
      ok("Background videos saved", "The home hero now uses these links.");
      await refresh();
    } else {
      fail("Could not save the video links", res.data?.error ?? "Please try again.");
    }
  }

  /* ---- render ---- */

  if (slides === null || !videoUrls) {
    if (loadFailed) {
      return (
        <div className="space-y-4">
          <PanelHeader title="Hero Slides & Videos" />
          <ErrorNote message={error ?? "Could not load the hero configuration."} />
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
        title="Hero Slides & Videos"
        description="Manage the home hero slideshow and every page's header backdrop — upload photos or paste muted YouTube videos."
      />
      {error ? <ErrorNote message={error} /> : null}

      {/* ============ SCOPE PICKER ============ */}
      <div className="rounded-2xl border border-blue-100/70 bg-white p-3 shadow-sm">
        <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Where should these slides appear?
        </p>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Hero slide scope">
          {SCOPES.map((sc) => {
            const active = scope === sc.id;
            const count = scopeCount(sc.id);
            return (
              <button
                key={sc.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setScope(sc.id);
                  setAddOpen(false);
                }}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-all duration-300",
                  active
                    ? "bg-brand-navy text-white shadow-md shadow-navy-900/20"
                    : "bg-ice text-brand-navy ring-1 ring-blue-100 hover:bg-blue-100/70"
                )}
              >
                {sc.label}
                {count > 0 ? (
                  <span
                    className={cn(
                      "inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                      active ? "bg-white/20 text-white" : "bg-brand-blue/15 text-brand-blue"
                    )}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {scope !== "home" ? (
          <p className="px-1 pt-2 text-xs leading-relaxed text-slate-400">
            Slides here become the <span className="font-semibold text-slate-500">{SCOPES.find((x) => x.id === scope)?.label}</span>{" "}
            page's header backdrop. With no active slides the page keeps its curated default photos.
          </p>
        ) : null}
      </div>

      {/* ============ SLIDES ============ */}
      <Collapsible defaultOpen className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-sm">
        <CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-blue-50/40 sm:px-5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ice text-brand-navy ring-1 ring-blue-100">
            <ImageIcon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-heading block text-sm font-bold text-brand-navy">
              {scope === "home" ? "Hero slides" : `${SCOPES.find((x) => x.id === scope)?.label ?? "Page"} backdrop slides`}
            </span>
            <span className="mt-0.5 block text-xs text-slate-400">
              {slides.length} slide{slides.length === 1 ? "" : "s"} in rotation ·{" "}
              {slides.filter((s) => !s.active).length} hidden
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-data-[state=open]:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-blue-100/70">
          <div className="space-y-3 px-4 py-5 sm:px-5">
            {slides.length === 0 ? (
              <Hint>
                {scope === "home"
                  ? "No database slides yet — the hero is falling back to the static image set. Add a slide below to take control of the rotation."
                  : `No custom slides for this page yet — it currently shows its curated default photos. Add a slide below to override them.`}
              </Hint>
            ) : null}
            {slides.map((row, i) => (
              <SlideCard
                key={row.id}
                row={row}
                index={i}
                total={slides.length}
                busy={busyId === row.id || reordering}
                onAltSave={(alt) => void updateSlide(row, { alt })}
                onActiveChange={(active) => void updateSlide(row, { active })}
                onMove={(dir) => void moveSlide(i, dir)}
                onDelete={() => setDeleting(row)}
              />
            ))}

            {/* ---- add slide ---- */}
            <div className="rounded-xl border border-dashed border-blue-200 bg-ice/40 p-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddOpen((v) => !v)}
                aria-expanded={addOpen}
                className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {addOpen ? "Close" : "Add slide"}
              </Button>
              {addOpen ? (
                <div className="mt-3 space-y-4">
                  <label className="block max-w-xs">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Kind
                    </span>
                    <Select
                      value={addKind}
                      onValueChange={(v) => setAddKind(v === "youtube" ? "youtube" : "image")}
                    >
                      <SelectTrigger
                        aria-label="Slide kind"
                        className="mt-1 h-9 w-full rounded-xl border-blue-100 bg-white text-sm text-brand-navy focus-visible:border-brand-blue focus-visible:ring-brand-blue/25"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-blue-100">
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="youtube">YouTube video</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  {addKind === "image" ? (
                    <ImageUploadField
                      label="Slide image"
                      hint="Landscape images work best (the hero crops to fill)."
                      value={addSrc || undefined}
                      onChange={(url) => setAddSrc(url ?? "")}
                      onUnauthorized={onSessionExpired}
                    />
                  ) : (
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        YouTube URL
                      </span>
                      <Input
                        value={addSrc}
                        onChange={(e) => setAddSrc(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=…"
                        aria-label="YouTube URL"
                        className={cn(inputClass, "mt-1.5")}
                      />
                      <span className="mt-1 block">
                        <Hint>
                          Any youtube.com / youtu.be / shorts link works — it plays muted and
                          looping behind the hero text.
                        </Hint>
                      </span>
                    </label>
                  )}
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Alt text (optional)
                    </span>
                    <Input
                      value={addAlt}
                      onChange={(e) => setAddAlt(e.target.value)}
                      placeholder="Describe the image for screen readers"
                      aria-label="New slide alt text"
                      className={cn(inputClass, "mt-1.5")}
                    />
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    disabled={adding || (addKind === "image" && !addSrc)}
                    onClick={() => void addSlide()}
                    className="rounded-full bg-brand-navy font-bold text-white shadow-md shadow-navy-900/25 hover:bg-brand-blue"
                  >
                    {adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    )}
                    {adding ? "Adding…" : "Add to rotation"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ============ BACKGROUND VIDEOS ============ */}
      <Collapsible defaultOpen className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-sm">
        <CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-blue-50/40 sm:px-5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <Youtube className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-heading block text-sm font-bold text-brand-navy">
              YouTube background videos
            </span>
            <span className="mt-0.5 block text-xs text-slate-400">
              {videoUrls.filter((u) => u.trim().length > 5).length} of {MAX_VIDEOS} links used
            </span>
          </span>
          {videosDirty ? (
            <span
              title="This section has unsaved edits"
              className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.25)]"
            />
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-data-[state=open]:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-blue-100/70">
          <div className="space-y-3 px-4 py-5 sm:px-5">
            <Hint>
              এই লিংকগুলো হোম হিরোর ছবির স্লাইডের মাঝে মাঝে ভিডিও হিসেবে চলবে। Pastes any
              youtube.com/youtu.be/shorts link.
            </Hint>
            {videoUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-right text-[10px] font-bold text-slate-300">
                  {i + 1}
                </span>
                <Input
                  value={url}
                  onChange={(e) => setVideoUrl(i, e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  aria-label={`Background video URL ${i + 1}`}
                  className={cn(inputClass, "min-w-0 flex-1")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVideoUrl(i)}
                  aria-label={`Remove background video ${i + 1}`}
                  title="Remove"
                  className="h-9 w-9 shrink-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={videoUrls.length >= MAX_VIDEOS}
              onClick={addVideoUrl}
              className="rounded-full border-blue-200 text-brand-navy hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add video link
            </Button>
            <SaveBar
              dirty={videosDirty}
              saving={savingVideos}
              onSave={() => void saveVideos()}
              onReset={() => videoSnapshot && setVideoUrls([...videoSnapshot])}
              saveLabel="Save video links"
              dirtyHint="Unsaved video links"
              savedHint="Video links saved"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <ConfirmDeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        onConfirm={() => deleting && void removeSlide(deleting)}
        loading={deleteBusy}
        title="Remove this slide?"
        description={
          deleting ? (
            <>
              The hero rotation will no longer include{" "}
              <span className="font-semibold">
                {deleting.kind === "youtube" ? "this YouTube video" : "this image"}
              </span>
              . You can re-add it afterwards.
            </>
          ) : null
        }
        confirmLabel="Remove slide"
      />

      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <MonitorPlay className="h-3.5 w-3.5" aria-hidden="true" />
        Changes go live immediately — no separate save needed for slide edits.
      </p>
    </div>
  );
}
