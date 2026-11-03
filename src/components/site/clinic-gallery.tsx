"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImageOff,
  Images,
  Maximize2,
  X,
} from "lucide-react";
import { useLang, toBnDigits } from "@/lib/i18n";
import { pickBn } from "@/lib/content/shared";
import type { ClinicRoom } from "@/lib/content/shared";
import { Reveal } from "@/components/site/motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Clinic tour — rooms + equipment gallery (EN / বাংলা)                */
/*                                                                     */
/*  Content comes from the CMS (About → Clinic tour). A room without a  */
/*  photo renders a designed placeholder instead of an empty frame, so  */
/*  the gallery is usable the moment a room is added and only gets      */
/*  better once the owner uploads real photographs.                     */
/* ------------------------------------------------------------------ */

/** Bilingual pick for an index-aligned string array (equipment lists). */
function pickList(en: string[], bnList: string[] | undefined, isBn: boolean): string[] {
  if (!isBn) return en;
  return en.map((value, i) => (bnList?.[i]?.trim() ? bnList[i] : value));
}

/** Category filter order — categories are whatever the CMS defines. */
function useCategories(rooms: ClinicRoom[], isBn: boolean) {
  return useMemo(() => {
    const seen = new Map<string, { en: string; bn?: string; count: number }>();
    for (const room of rooms) {
      const key = room.category.trim() || "Clinic";
      const entry = seen.get(key);
      if (entry) entry.count += 1;
      else seen.set(key, { en: key, bn: room.categoryBn, count: 1 });
    }
    return Array.from(seen.entries()).map(([key, value]) => ({
      key,
      label: isBn ? value.bn?.trim() || value.en : value.en,
      count: value.count,
    }));
  }, [rooms, isBn]);
}

function RoomPlaceholder({ room, compact }: { room: ClinicRoom; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#002060_0%,#0b3a8a_55%,#1e7dff_100%)] text-center",
        compact ? "px-4 py-8" : "px-6 py-10"
      )}
      aria-hidden="true"
    >
      <span className="dot-grid-light absolute inset-0 opacity-30" />
      <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 text-amber-300 ring-1 ring-white/20">
        <ImageOff className="h-5 w-5" />
      </span>
      <span className="relative max-w-[16rem] text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200/80">
        {room.title}
      </span>
    </div>
  );
}

export function ClinicGallery({
  rooms,
  variant = "full",
  className,
}: {
  rooms: ClinicRoom[];
  variant?: "full" | "preview";
  className?: string;
}) {
  const { lang } = useLang();
  const bn = lang === "bn";
  const [active, setActive] = useState<string>("__all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = useCategories(rooms, bn);

  const visible = useMemo(() => {
    if (variant === "preview") {
      const featured = rooms.filter((r) => r.featured);
      return (featured.length > 0 ? featured : rooms).slice(0, 6);
    }
    if (active === "__all") return rooms;
    return rooms.filter((r) => (r.category.trim() || "Clinic") === active);
  }, [rooms, active, variant]);

  if (rooms.length === 0) return null;

  const current = openIndex !== null ? visible[openIndex] : null;
  const step = (dir: -1 | 1) => {
    setOpenIndex((index) => {
      if (index === null) return index;
      const next = index + dir;
      if (next < 0) return visible.length - 1;
      if (next >= visible.length) return 0;
      return next;
    });
  };

  return (
    <div className={className}>
      {/* ---- filter chips (full gallery only) ---- */}
      {variant === "full" && categories.length > 1 ? (
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActive("__all")}
            aria-pressed={active === "__all"}
            className={cn(
              "relative rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300",
              active === "__all"
                ? "bg-brand-navy text-white shadow-lg shadow-navy-900/25"
                : "border border-blue-100 bg-white text-slate-600 hover:border-brand-blue/40 hover:text-brand-blue"
            )}
          >
            {bn ? "সব" : "All rooms"}
            <span
              className={cn(
                "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                active === "__all" ? "bg-white/20 text-white" : "bg-blue-50 text-brand-blue"
              )}
            >
              {bn ? toBnDigits(rooms.length) : rooms.length}
            </span>
          </button>
          {categories.map((cat) => {
            const isActive = active === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActive(cat.key)}
                aria-pressed={isActive}
                className={cn(
                  "relative rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-brand-navy text-white shadow-lg shadow-navy-900/25"
                    : "border border-blue-100 bg-white text-slate-600 hover:border-brand-blue/40 hover:text-brand-blue"
                )}
              >
                {cat.label}
                <span
                  className={cn(
                    "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                    isActive ? "bg-white/20 text-white" : "bg-blue-50 text-brand-blue"
                  )}
                >
                  {bn ? toBnDigits(cat.count) : cat.count}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* ---- room cards ---- */}
      <div
        className={cn(
          "grid gap-5",
          variant === "preview" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"
        )}
      >
        <AnimatePresence mode="popLayout">
          {visible.map((room, i) => {
            const title = pickBn(room.title, room.titleBn, bn);
            const description = pickBn(room.description, room.descriptionBn, bn);
            const category = pickBn(room.category, room.categoryBn, bn);
            const equipment = pickList(room.equipment, room.equipmentBn, bn);
            return (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, delay: Math.min(i, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(i)}
                    className="group block h-full w-full overflow-hidden rounded-[1.5rem] border border-blue-100/80 bg-white text-left shadow-[0_10px_35px_-22px_rgba(0,32,96,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_24px_50px_-22px_rgba(30,125,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[16/11] overflow-hidden">
                      {room.image ? (
                        <Image
                          src={room.image}
                          alt={room.imageAlt || title}
                          fill
                          sizes={
                            variant === "preview"
                              ? "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 380px"
                              : "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 400px"
                          }
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <RoomPlaceholder room={room} compact={variant === "preview"} />
                      )}
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/10 to-transparent opacity-90" />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-navy shadow-sm backdrop-blur">
                        {category}
                      </span>
                      <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition-transform duration-300 group-hover:scale-110">
                        <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="absolute inset-x-0 bottom-0 p-4">
                        <span className="font-heading block text-[15px] font-bold leading-snug text-white drop-shadow-sm">
                          {title}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-blue-100/85">
                          <Images className="h-3 w-3" aria-hidden="true" />
                          {bn
                            ? `${toBnDigits(equipment.length)}টি ইকুইপমেন্ট`
                            : `${equipment.length} equipment items`}
                        </span>
                      </span>
                    </div>
                    <div className="space-y-3 p-5">
                      <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-600">
                        {description}
                      </p>
                      <ul className="flex flex-wrap gap-1.5">
                        {equipment.slice(0, variant === "preview" ? 2 : 3).map((item) => (
                          <li
                            key={item}
                            className="inline-flex items-center gap-1 rounded-full bg-ice px-2.5 py-1 text-[10.5px] font-semibold text-brand-navy ring-1 ring-blue-100"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                            {item}
                          </li>
                        ))}
                        {equipment.length > (variant === "preview" ? 2 : 3) ? (
                          <li className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[10.5px] font-bold text-brand-blue">
                            {bn
                              ? `+${toBnDigits(equipment.length - (variant === "preview" ? 2 : 3))}`
                              : `+${equipment.length - (variant === "preview" ? 2 : 3)}`}
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {variant === "full" && visible.length === 0 ? (
        <Reveal>
          <p className="rounded-2xl border border-blue-100 bg-ice px-6 py-8 text-center text-sm text-slate-500">
            {bn
              ? "এই ক্যাটাগরিতে এখনো কোনো রুম যোগ করা হয়নি।"
              : "No rooms have been added to this category yet."}
          </p>
        </Reveal>
      ) : null}

      {/* ---- lightbox ---- */}
      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-h-[92vh] w-full max-w-4xl gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 sm:max-w-4xl"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              step(1);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              step(-1);
            }
          }}
        >
          {current ? (
            <>
              <DialogTitle className="sr-only">
                {pickBn(current.title, current.titleBn, bn)}
              </DialogTitle>
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-navy">
                {current.image ? (
                  <Image
                    src={current.image}
                    alt={current.imageAlt || pickBn(current.title, current.titleBn, bn)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 896px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <RoomPlaceholder room={current} />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent" />

                <button
                  type="button"
                  onClick={() => setOpenIndex(null)}
                  aria-label={bn ? "বন্ধ করুন" : "Close gallery"}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-lg transition hover:bg-white"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>

                {visible.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label={bn ? "আগের রুম" : "Previous room"}
                      className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-lg transition hover:bg-white"
                    >
                      <ArrowLeft className="h-4.5 w-4.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label={bn ? "পরের রুম" : "Next room"}
                      className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-lg transition hover:bg-white"
                    >
                      <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
                    </button>
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                      {(openIndex ?? 0) + 1} / {visible.length}
                    </span>
                  </>
                ) : null}
              </div>

              <div className="max-h-[46vh] overflow-y-auto p-6 sm:p-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-blue ring-1 ring-blue-100">
                  {pickBn(current.category, current.categoryBn, bn)}
                </span>
                <h3 className="font-heading mt-3 text-xl font-bold text-brand-navy sm:text-2xl">
                  {pickBn(current.title, current.titleBn, bn)}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {pickBn(current.description, current.descriptionBn, bn)}
                </p>
                {current.equipment.length > 0 ? (
                  <div className="mt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      {bn ? "এই রুমের ইকুইপমেন্ট" : "Equipment in this room"}
                    </p>
                    <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      {pickList(current.equipment, current.equipmentBn, bn).map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 rounded-xl bg-ice px-3 py-2 text-[12.5px] font-medium text-slate-700"
                        >
                          <CheckCircle2
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                            aria-hidden="true"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
