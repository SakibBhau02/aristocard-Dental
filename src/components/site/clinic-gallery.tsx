"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { useLang, toBnDigits } from "@/lib/i18n";
import { pickBn } from "@/lib/content/shared";
import type { ClinicRoom } from "@/lib/content/shared";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/*  Clinic tour — photo-only gallery (EN / বাংলা)                       */
/*                                                                     */
/*  The tour is a wall of photographs: no room names, categories or    */
/*  equipment lists are drawn on top or underneath. Those fields still  */
/*  live in the CMS and are used for the image alt text / screen-       */
/*  reader label, so the gallery stays accessible without clutter.      */
/*                                                                     */
/*  Only rooms that actually have a photo are shown — a half-filled    */
/*  tour never leaves empty frames on the page.                        */
/* ------------------------------------------------------------------ */

/** Rooms that have a usable photograph (the only thing the tour shows). */
export function clinicRoomPhotos(rooms: ClinicRoom[]): ClinicRoom[] {
  return rooms.filter((room) => Boolean(room.image?.trim()));
}

/** True when the tour has at least one photo to show. */
export function hasClinicPhotos(rooms: ClinicRoom[] | undefined | null): boolean {
  return Boolean(rooms && rooms.some((room) => Boolean(room.image?.trim())));
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /* The preview strip shows featured photos first (falling back to the
     full list) so the homepage always leads with the best shots. */
  const visible = useMemo(() => {
    const photos = clinicRoomPhotos(rooms);
    if (variant === "preview") {
      const featured = photos.filter((r) => r.featured);
      return (featured.length > 0 ? featured : photos).slice(0, 6);
    }
    return photos;
  }, [rooms, variant]);

  if (visible.length === 0) return null;

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
      {/* ---- photo wall ---- */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((room, i) => {
            /* The room title is never drawn — it only labels the photo
               for assistive tech and search engines. */
            const label = pickBn(room.title, room.titleBn, bn);
            return (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(i, 6) * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  aria-label={bn ? `ছবি বড় করে দেখুন — ${label}` : `View photo — ${label}`}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] border border-blue-100/80 bg-brand-navy shadow-[0_10px_35px_-22px_rgba(0,32,96,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-[0_24px_50px_-22px_rgba(30,125,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                >
                  <Image
                    src={room.image as string}
                    alt={room.imageAlt || label}
                    fill
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 400px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />

                  {/* quiet hover affordance — no captions on the photo */}
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute right-3 top-3 inline-flex h-8 w-8 scale-90 items-center justify-center rounded-full bg-white/25 text-white opacity-0 ring-1 ring-white/40 backdrop-blur transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ---- lightbox (image only) ---- */}
      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-h-[92vh] w-full max-w-5xl gap-0 overflow-hidden rounded-3xl border-0 bg-brand-navy p-0 sm:max-w-5xl"
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
                <Image
                  src={current.image as string}
                  alt={current.imageAlt || pickBn(current.title, current.titleBn, bn)}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-contain"
                  priority
                />

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
                      aria-label={bn ? "আগের ছবি" : "Previous photo"}
                      className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-lg transition hover:bg-white"
                    >
                      <ArrowLeft className="h-4.5 w-4.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label={bn ? "পরের ছবি" : "Next photo"}
                      className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-lg transition hover:bg-white"
                    >
                      <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
                    </button>
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                      {bn
                        ? `${toBnDigits((openIndex ?? 0) + 1)} / ${toBnDigits(visible.length)}`
                        : `${(openIndex ?? 0) + 1} / ${visible.length}`}
                    </span>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
