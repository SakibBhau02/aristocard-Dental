"use client";

/* ------------------------------------------------------------------ */
/*  Hero playlist & timing editor (Configuration → Hero)               */
/*                                                                     */
/*  GET  /api/admin/hero     → every scope's ordered media rows        */
/*  POST /api/admin/hero     → create/update a row;                    */
/*                             { action:"reorder", ids } saves order   */
/*  DELETE /api/admin/hero?id=  → remove a row                         */
/*  GET/POST /api/admin/settings → heroImageDuration / heroVideoDuration*/
/*                                                                     */
/*  One ordered playlist per scope: images and YouTube videos sit in   */
/*  the same list, so "which video follows which image" is exact.      */
/*  Defaults: images 5s (slow zoom-in) · videos 20s.                   */
/* ------------------------------------------------------------------ */

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Clock3,
  Download,
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
import { looksLikeImageSrc } from "@/lib/image-optimize";
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

/** One ordered playlist row: thumb/tile, kind, duration, alt, reorder, delete. */
function SlideCard({
  row,
  index,
  total,
  busy,
  imageSeconds,
  videoSeconds,
  onAltSave,
  onActiveChange,
  onMove,
  onDelete,
}: {
  row: HeroSlideRow;
  index: number;
  total: number;
  busy: boolean;
  imageSeconds: number;
  videoSeconds: number;
  onAltSave: (alt: string) => void;
  onActiveChange: (active: boolean) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const [alt, setAlt] = useState(row.alt ?? "");
  const videoId = row.kind === "youtube" ? parseYouTubeId(row.src) : null;
  const duration = row.kind === "youtube" ? videoSeconds : imageSeconds;

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
          <span className="absolute left-1.5 top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/90 px-1 text-[10px] font-bold text-brand-navy shadow-sm">
            {index + 1}
          </span>
          <span className="absolute bottom-1.5 right-1.5 rounded-md bg-brand-navy/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {imageSeconds}s
          </span>
        </span>
      ) : (
        <span
          className="relative flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900 ring-1 ring-rose-100"
          style={
            videoId
              ? {
                  backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/mqdefault.jpg)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <span className="absolute inset-0 bg-slate-950/35" aria-hidden="true" />
          <Youtube className="relative h-9 w-9 text-white drop-shadow" aria-hidden="true" />
          <span className="absolute left-1.5 top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/90 px-1 text-[10px] font-bold text-brand-navy shadow-sm">
            {index + 1}
          </span>
          <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {videoSeconds}s
          </span>
        </span>
      )}

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
              row.kind === "youtube"
                ? "bg-rose-50 text-rose-600 ring-rose-100"
                : "bg-blue-50 text-brand-blue ring-blue-100"
            )}
          >
            {row.kind === "youtube" ? (
              <Youtube className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ImageIcon className="h-3 w-3" aria-hidden="true" />
            )}
            {row.kind === "youtube" ? "Video" : "Image"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            {duration}s
          </span>
          {!row.active ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              Hidden
            </span>
          ) : null}
        </div>

        <p className="truncate font-mono text-xs text-slate-400" title={row.src}>
          {row.src}
        </p>

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
        ) : (
          <p className="text-xs text-slate-500">
            Video ID <span className="font-mono font-semibold text-slate-600">{videoId ?? "—"}</span>
          </p>
        )}
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
            title="Move earlier"
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
            title="Move later"
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

type Timing = { image: number; video: number };

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

  /* playback timing form */
  const [timingSnapshot, setTimingSnapshot] = useState<Timing | null>(null);
  const [timing, setTiming] = useState<Timing | null>(null);
  const [savingTiming, setSavingTiming] = useState(false);

  /* legacy settings video links (pre-playlist installs) */
  const [importingLegacy, setImportingLegacy] = useState(false);

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
      const next: Timing = {
        image: Number(settingsRes.settings.heroImageDuration) || 5,
        video: Number(settingsRes.settings.heroVideoDuration) || 20,
      };
      setTimingSnapshot({ ...next });
      setTiming({ ...next });
    })();
    return () => {
      cancelled = true;
    };
  }, [get, loadTick]);

  const slides = useMemo(
    () => (allSlides ? allSlides.filter((s) => s.scope === scope) : null),
    [allSlides, scope]
  );

  const activeSlides = useMemo(
    () => (slides ?? []).filter((s) => s.active),
    [slides]
  );

  const scopeCount = (id: string) =>
    allSlides ? allSlides.filter((s) => s.scope === id).length : 0;

  const timingDirty = Boolean(
    timing &&
      timingSnapshot &&
      (timing.image !== timingSnapshot.image || timing.video !== timingSnapshot.video)
  );

  /* Legacy links only matter while the home playlist has no video row. */
  const legacyVideoUrls = useMemo(
    () =>
      (settings?.heroVideoUrls ?? []).filter((url) => Boolean(parseYouTubeId(url))),
    [settings]
  );
  const homeHasVideoRow = (allSlides ?? []).some(
    (s) => s.scope === "home" && s.kind === "youtube"
  );
  const canImportLegacy =
    scope === "home" && legacyVideoUrls.length > 0 && !homeHasVideoRow;

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
      ok("Playlist order saved");
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
      ok("Slide removed", "The hero playlist no longer includes it.");
      await reloadSlides();
    } else {
      fail("Could not remove the slide", res.data?.error ?? "Please try again.");
    }
  }

  async function addSlide() {
    if (adding) return;
    const src = addSrc.trim();
    if (addKind === "image" && !looksLikeImageSrc(src)) {
      fail("Upload an image first", "Image slides need an uploaded photo or an image URL.");
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
          ? "It was added to the end of the home playlist — use the arrows to place it exactly where you want."
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

  /* ---- playback timing ---- */

  async function saveTiming() {
    if (!settings || !timing || savingTiming) return;
    setSavingTiming(true);
    const image = Math.min(30, Math.max(1, Math.round(timing.image || 5)));
    const video = Math.min(180, Math.max(3, Math.round(timing.video || 20)));
    const res = await post<{ settings?: SiteSettings; error?: string }>("/api/admin/settings", {
      ...settings,
      heroImageDuration: image,
      heroVideoDuration: video,
    });
    setSavingTiming(false);
    if (res.ok && res.data?.settings) {
      const saved = res.data.settings;
      const next: Timing = {
        image: Number(saved.heroImageDuration) || 5,
        video: Number(saved.heroVideoDuration) || 20,
      };
      setSettings(saved);
      setTimingSnapshot({ ...next });
      setTiming({ ...next });
      ok("Playback timing saved", `Images ${next.image}s · Videos ${next.video}s.`);
      await refresh();
    } else {
      fail("Could not save the timing", res.data?.error ?? "Please try again.");
    }
  }

  /* ---- legacy video import ---- */

  async function importLegacyVideos() {
    if (!settings || importingLegacy || legacyVideoUrls.length === 0) return;
    setImportingLegacy(true);
    let added = 0;
    for (const url of legacyVideoUrls) {
      const res = await post<{ error?: string }>("/api/admin/hero", {
        scope: "home",
        kind: "youtube",
        src: url,
        active: true,
      });
      if (res.ok) added += 1;
    }
    if (added === legacyVideoUrls.length) {
      const res = await post<{ settings?: SiteSettings }>("/api/admin/settings", {
        ...settings,
        heroVideoUrls: [],
      });
      if (res.ok && res.data?.settings) setSettings(res.data.settings);
    }
    setImportingLegacy(false);
    if (added > 0) {
      ok(
        "Legacy videos imported",
        `${added} video${added === 1 ? "" : "s"} added to the home playlist. Use the arrows to choose the exact position.`
      );
      await reloadSlides();
    } else {
      fail("Could not import the legacy videos", "Please add them as YouTube slides instead.");
    }
  }

  /* ---- render ---- */

  if (slides === null || !timing || !settings) {
    if (loadFailed) {
      return (
        <div className="space-y-4">
          <PanelHeader title="Hero Playlist & Timing" />
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
        title="Hero Playlist & Timing"
        description="Choose the exact order of images and YouTube videos behind every page hero — then set how long each one stays on screen."
      />
      {error ? <ErrorNote message={error} /> : null}

      {/* ============ SCOPE PICKER ============ */}
      <div className="rounded-2xl border border-blue-100/70 bg-white p-3 shadow-sm">
        <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Where should this playlist appear?
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
        <p className="px-1 pt-2 text-xs leading-relaxed text-slate-400">
          {scope === "home"
            ? "The homepage hero plays this playlist in the exact order below, then loops."
            : `These slides become the ${SCOPES.find((x) => x.id === scope)?.label ?? scope} page header backdrop. With no active slides the page keeps its curated default photos.`}
        </p>
      </div>

      {/* ============ PLAYLIST ============ */}
      <Collapsible defaultOpen className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-sm">
        <CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-blue-50/40 sm:px-5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ice text-brand-navy ring-1 ring-blue-100">
            <MonitorPlay className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-heading block text-sm font-bold text-brand-navy">
              {scope === "home" ? "Home hero playlist" : `${SCOPES.find((x) => x.id === scope)?.label ?? "Page"} backdrop playlist`}
            </span>
            <span className="mt-0.5 block text-xs text-slate-400">
              {slides.length} item{slides.length === 1 ? "" : "s"} ·{" "}
              {activeSlides.length} active · images {timing.image}s · videos {timing.video}s
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
                  ? "No playlist yet — the hero is falling back to the static image set. Add an image or video below to take control of the rotation."
                  : "No custom slides for this page yet — it currently shows its curated default photos. Add a slide below to override them."}
              </Hint>
            ) : null}

            {/* ---- playback order summary ---- */}
            {activeSlides.length > 0 ? (
              <div className="rounded-xl border border-blue-100/80 bg-ice/50 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Playback order
                  </p>
                  <span className="ml-auto text-[10px] font-medium text-slate-400">
                    {activeSlides.length} active · loops forever
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {activeSlides.map((s, i) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] ring-1 ring-blue-100"
                    >
                      <span className="font-bold text-slate-300">{i + 1}</span>
                      {s.kind === "youtube" ? (
                        <Youtube className="h-3 w-3 text-rose-500" aria-hidden="true" />
                      ) : (
                        <ImageIcon className="h-3 w-3 text-brand-blue" aria-hidden="true" />
                      )}
                      <span className="font-semibold text-brand-navy">
                        {s.kind === "youtube" ? "Video" : "Image"}
                      </span>
                      <span className="text-slate-400">
                        {s.kind === "youtube" ? timing.video : timing.image}s
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {slides.map((row, i) => (
              <SlideCard
                key={row.id}
                row={row}
                index={i}
                total={slides.length}
                busy={busyId === row.id || reordering}
                imageSeconds={timing.image}
                videoSeconds={timing.video}
                onAltSave={(alt) => void updateSlide(row, { alt })}
                onActiveChange={(active) => void updateSlide(row, { active })}
                onMove={(dir) => void moveSlide(i, dir)}
                onDelete={() => setDeleting(row)}
              />
            ))}

            {/* ---- legacy settings videos ---- */}
            {canImportLegacy ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                <p className="text-xs font-semibold text-amber-800">
                  {legacyVideoUrls.length} older video link
                  {legacyVideoUrls.length === 1 ? "" : "s"} found in Site Settings
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-700">
                  They still play only while this playlist has no video. Import them into the
                  playlist so you can control their exact position here.
                </p>
                <Button
                  type="button"
                  size="sm"
                  disabled={importingLegacy}
                  onClick={() => void importLegacyVideos()}
                  className="mt-2 rounded-full bg-amber-500 font-bold text-white hover:bg-amber-600"
                >
                  {importingLegacy ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="h-4 w-4" aria-hidden="true" />
                  )}
                  {importingLegacy ? "Importing…" : "Import into playlist"}
                </Button>
              </div>
            ) : null}

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
                {addOpen ? "Close" : "Add image or video"}
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
                        <SelectItem value="image">Image (5s · slow zoom)</SelectItem>
                        <SelectItem value="youtube">YouTube video (20s)</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  {addKind === "image" ? (
                    <ImageUploadField
                      label="Slide image"
                      hint="Landscape images work best (the hero crops to fill). It will zoom in slowly while on screen."
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
                          looping for {timing.video} seconds.
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
                    {adding ? "Adding…" : "Add to playlist"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ============ PLAYBACK TIMING ============ */}
      <Collapsible defaultOpen className="overflow-hidden rounded-2xl border border-blue-100/70 bg-white shadow-sm">
        <CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-blue-50/40 sm:px-5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
            <Clock3 className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-heading block text-sm font-bold text-brand-navy">
              Playback timing
            </span>
            <span className="mt-0.5 block text-xs text-slate-400">
              Images {timing.image}s · Videos {timing.video}s · applies to every page hero
            </span>
          </span>
          {timingDirty ? (
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
          <div className="space-y-4 px-4 py-5 sm:px-5">
            <Hint>
              Each image stays on screen for the full image duration and zooms in slowly
              across that time. Each video plays muted and loops inside its window, then the
              playlist advances to the next item. The defaults are 5 seconds for images and
              20 seconds for videos.
            </Hint>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Image duration (seconds)
                </span>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  step={1}
                  value={timing.image}
                  onChange={(e) =>
                    setTiming((t) => (t ? { ...t, image: Number(e.target.value) } : t))
                  }
                  aria-label="Image duration in seconds"
                  className={cn(inputClass, "mt-1.5")}
                />
                <span className="mt-1 block">
                  <Hint>Recommended 4–8s. The zoom-in is timed to this value.</Hint>
                </span>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Video duration (seconds)
                </span>
                <Input
                  type="number"
                  min={3}
                  max={180}
                  step={1}
                  value={timing.video}
                  onChange={(e) =>
                    setTiming((t) => (t ? { ...t, video: Number(e.target.value) } : t))
                  }
                  aria-label="Video duration in seconds"
                  className={cn(inputClass, "mt-1.5")}
                />
                <span className="mt-1 block">
                  <Hint>Recommended 15–30s. The video keeps looping until the timer ends.</Hint>
                </span>
              </label>
            </div>
            <SaveBar
              dirty={timingDirty}
              saving={savingTiming}
              onSave={() => void saveTiming()}
              onReset={() => timingSnapshot && setTiming({ ...timingSnapshot })}
              saveLabel="Save timing"
              dirtyHint="Unsaved timing changes"
              savedHint="Timing saved"
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
              The playlist will no longer include{" "}
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
        Playlist order and slide edits go live immediately — timing has its own save button.
      </p>
    </div>
  );
}
