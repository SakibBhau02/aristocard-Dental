"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroSlide } from "@/lib/data/hero-media";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  HeroBackdrop — full-bleed background media layer                   */
/*                                                                     */
/*  • Sliding images with slow Ken-Burns zoom + smooth crossfade       */
/*  • YouTube video slides (muted / autoplay / loop) — see             */
/*    src/lib/data/hero-media.ts to paste video links                  */
/*  • Always-on navy gradient overlay for text readability             */
/*  • Optional clickable indicator bars                                */
/* ------------------------------------------------------------------ */

const IMAGE_DURATION = 6500; // ms per image slide
const VIDEO_DURATION = 26000; // ms per video slide

export function HeroBackdrop({
  slides,
  interval = IMAGE_DURATION,
  videoDuration = VIDEO_DURATION,
  overlay = "deep",
  indicators = false,
  priority = false,
  className,
  sizes = "100vw",
}: {
  slides: HeroSlide[];
  interval?: number;
  videoDuration?: number;
  overlay?: "deep" | "medium";
  indicators?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const count = slides.length;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const current = slides[active];
    const duration =
      current?.type === "youtube" ? videoDuration : interval;
    const timer = setTimeout(() => {
      // skip advancing while the tab is hidden (saves battery)
      if (document.visibilityState === "visible") {
        setActive((i) => (i + 1) % count);
      } else {
        setActive((i) => i); // re-run effect when visible again
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [active, count, interval, videoDuration, slides]);

  if (count === 0) return null;
  const current = slides[active];

  return (
    <>
      {/* media + overlay layer (purely decorative) */}
      <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
        {/* navy base (behind everything) */}
        <span className="absolute inset-0 bg-brand-navy" />

        {/* image layers — stacked, crossfading */}
        {slides.map((slide, i) => {
          if (slide.type !== "image") return null;
          const isActive = i === active;
          return (
            <div
              key={slide.src}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1600ms] ease-out",
                isActive ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                priority={priority && i === 0}
                sizes={sizes}
                className={cn(
                  "object-cover",
                  isActive && "hero-kenburns"
                )}
              />
            </div>
          );
        })}

        {/* active YouTube video layer (cover-fit) */}
        {current?.type === "youtube" && (
          <div
            className="hero-media-box absolute inset-0"
            style={{ containerType: "size" } as React.CSSProperties}
          >
            <iframe
              key={current.id}
              className="hero-video-frame"
              src={`https://www.youtube.com/embed/${current.id}?autoplay=1&mute=1&loop=1&playlist=${current.id}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&cc_load_policy=0`}
              title="Clinic video"
              allow="autoplay; encrypted-media; picture-in-picture"
              tabIndex={-1}
            />
          </div>
        )}

        {/* overlay — navy gradients for readability */}
        <span
          className={cn(
            "absolute inset-0",
            overlay === "deep"
              ? "bg-brand-navy/72"
              : "bg-brand-navy/55"
          )}
        />
        <span
          className={cn(
            "absolute inset-0 bg-gradient-to-b",
            overlay === "deep"
              ? "from-brand-navy/90 via-brand-navy/25 to-brand-navy/95"
              : "from-brand-navy/80 via-brand-navy/10 to-brand-navy/85"
          )}
        />
        {/* subtle side vignette */}
        <span className="absolute inset-0 bg-gradient-to-r from-brand-navy/45 via-transparent to-brand-navy/45" />
      </div>

      {/* indicator bars (interactive → outside the aria-hidden layer) */}
      {indicators && count > 1 && (
        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show hero slide ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === active
                  ? "w-9 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  : "w-4 bg-white/35 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}
    </>
  );
}
